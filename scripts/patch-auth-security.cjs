const fs = require('fs');
const path = require('path');
const esbuild = require('esbuild');

const targetFiles = [
  path.join(__dirname, '..', 'public', 'assets', 'AuthModal-BwhsZKDj.js'),
  path.join(__dirname, '..', 'dist', 'assets', 'AuthModal-BwhsZKDj.js'),
  path.join(__dirname, '..', 'cpanel_ready', 'public_html', 'assets', 'AuthModal-BwhsZKDj.js'),
  path.join(__dirname, '..', 'cpanel_ready', 'nodejs_app', 'dist', 'assets', 'AuthModal-BwhsZKDj.js')
];

const startMarker = "const handleLoginSubmit = async (ev) => {";
const endMarker = "// ===================== FORGOT PASSWORD FLOW =====================";

const secureLoginCode = `const handleLoginSubmit = async (ev) => {
    ev.preventDefault();
    const u = cleanEmail(username) || username.trim();
    const p = password.trim();
    if (!u) {
      setErrorMsg("لطفاً آدرس ایمیل یا نام کاربری خود را وارد فرمایید.");
      return;
    }
    if (!p) {
      setErrorMsg("لطفاً رمز عبور را وارد فرمایید.");
      return;
    }
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");
    try {
      let resp = await fetch("/api/v1/auth/login", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: u, username: u, email: u, phone: u, password: p, secret: p })
      });
      if (!resp.ok && (resp.status === 404 || resp.status === 405)) {
        resp = await fetch("/api/auth/login", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ identifier: u, username: u, email: u, phone: u, password: p, secret: p })
        });
      }
      const data = await resp.json().catch(() => ({}));
      if (resp.ok && data.success && data.user) {
        const user = data.user;
        const token = data.token;
        if (token) {
          localStorage.setItem("caffeine_access_token", token);
          localStorage.setItem("caffeine_auth_token_v1", token);
        }
        const userRole = user.role || "student";
        const resolvedName = (user.name || user.fullName || "").trim() || (userRole === "admin" ? "مدیر ارشد سامانه" : userRole === "advisor" ? "دکتر علیرضا کاظمی" : userRole === "parent" ? "ولی دانش‌آموز" : (user.username || u));
        const studentId = user.studentId || (userRole === "student" ? (user.id || user.userId || ("std-" + (u.replace(/[^a-zA-Z0-9]/g, "") || "101"))) : undefined);
        const advisorId = user.advisorId || (userRole === "advisor" ? "adv-1" : undefined);
        const childStudentId = user.childStudentId || (userRole === "parent" ? "std-101" : undefined);
        const session = {
          id: user.id || user.userId || ("usr-" + (userRole === "admin" ? "adm-01" : userRole === "advisor" ? "adv-1" : userRole === "parent" ? "par-101" : studentId)),
          userId: user.userId || user.id,
          name: resolvedName,
          fullName: resolvedName,
          email: user.email || (u.includes("@") ? u : undefined),
          phone: user.phone || undefined,
          role: userRole,
          username: user.username || u,
          studentId,
          advisorId,
          childStudentId,
          token: token,
          loginAt: new Date().toISOString(),
          lastActiveAt: new Date().toISOString()
        };
        localStorage.setItem("caffeine_current_user", JSON.stringify(session));
        localStorage.setItem("caffeine_auth_user_session_v1", JSON.stringify(session));
        window.dispatchEvent(new CustomEvent("caffeine_rbac_auth_changed", { detail: session }));
        setSuccessMsg("خوش آمدید " + resolvedName + "! ورود با موفقیت انجام شد.");
        setTimeout(() => {
          w(session, userRole);
          b();
        }, 350);
      } else {
        setErrorMsg(data.message || data.error || "نام کاربری یا رمز عبور اشتباه است.");
      }
    } catch (err) {
      setErrorMsg(err?.message || "خطا در برقراری ارتباط با سرور احراز هویت. لطفاً مجدداً تلاش فرمایید.");
    } finally {
      setLoading(false);
    }
  };
  `;

targetFiles.forEach((filePath) => {
  if (!fs.existsSync(filePath)) {
    console.log(`[Skip] Not found: ${filePath}`);
    return;
  }
  let code = fs.readFileSync(filePath, 'utf8');
  const startIdx = code.indexOf(startMarker);
  const endIdx = code.indexOf(endMarker);

  if (startIdx === -1 || endIdx === -1 || endIdx <= startIdx) {
    console.error(`[Error] Markers not found in ${filePath}`);
    return;
  }

  code = code.slice(0, startIdx) + secureLoginCode + code.slice(endIdx);

  // Validate with esbuild
  try {
    esbuild.transformSync(code, { loader: 'js' });
    fs.writeFileSync(filePath, code, 'utf8');
    console.log(`[Success] Hardened authentication applied to ${filePath}`);
  } catch (err) {
    console.error(`[Syntax Error] Failed to transform ${filePath}:`, err.message);
  }
});
