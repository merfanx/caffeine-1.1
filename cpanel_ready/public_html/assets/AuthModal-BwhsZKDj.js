import { r as a, j as e, am as $, J as q, D as F, h as B, I as J, bz as U, b7 as V, ao as _ } from "./vendor-react-AAJfNG8R.js";
import { ae as G, P, af as y } from "./index-CvuvcUm9.js";
import "./vendor-katex-BEwRSR0t.js";

const toEn = (str) => {
  if (str === undefined || str === null) return "";
  return String(str)
    .replace(/[۰-۹]/g, (d) => String.fromCharCode(d.charCodeAt(0) - 1728))
    .replace(/[٠-٩]/g, (d) => String.fromCharCode(d.charCodeAt(0) - 1584));
};

const toFa = (str) => {
  if (str === undefined || str === null) return "";
  return String(str).replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[Number(d)] || d);
};

const formatTimer = (s) => {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return toFa(m) + ":" + toFa(sec < 10 ? "0" + sec : sec);
};

/**
 * کد تأیید ۶ رقمی با قابلیت جاگذاری (Paste)، کیبورد فارسی و لاتین،
 * ناوبری کلیدهای جهتی و بک‌اسپیس، و تایید خودکار پس از تکمیل هر ۶ رقم
 */
function OtpField({ length = 6, value, defaultValue = "", onChange, onComplete, disabled, size = "md", className, ...aria }) {
  const [internal, setInternal] = a.useState(defaultValue);
  const code = value !== undefined ? value : internal;
  const refs = a.useRef([]);

  function commit(next) {
    const clean = toEn(next).replace(/\D/g, "").slice(0, length);
    if (value === undefined) setInternal(clean);
    if (onChange) onChange(clean);
    if (clean.length === length && onComplete) onComplete(clean);
    const targetIdx = Math.min(clean.length, length - 1);
    if (refs.current[targetIdx]) refs.current[targetIdx].focus();
  }

  return e.jsx("div", {
    className: "inline-flex justify-center items-center w-full py-2 " + (size === "sm" ? "gap-1.5" : "gap-2") + " " + (className || ""),
    dir: "ltr",
    role: "group",
    "aria-label": aria["aria-label"] || "کد تأیید",
    children: Array.from({ length }, (_, i) =>
      e.jsx("input", {
        key: i,
        ref: (el) => { refs.current[i] = el; },
        type: "text",
        inputMode: "numeric",
        autoComplete: i === 0 ? "one-time-code" : "off",
        disabled: disabled,
        value: code[i] ? toFa(code[i]) : "",
        onChange: (ev) => {
          const typed = toEn(ev.target.value).replace(/\D/g, "");
          if (typed.length > 1) return commit(code.slice(0, i) + typed);
          commit(code.slice(0, i) + typed + code.slice(i + 1));
        },
        onKeyDown: (ev) => {
          if (ev.key === "Backspace" && !code[i] && i > 0) {
            ev.preventDefault();
            commit(code.slice(0, i - 1));
          }
          if (ev.key === "ArrowLeft" && i > 0 && refs.current[i - 1]) refs.current[i - 1].focus();
          if (ev.key === "ArrowRight" && i < length - 1 && refs.current[i + 1]) refs.current[i + 1].focus();
        },
        onFocus: (ev) => ev.target.select(),
        className: "shrink-0 rounded-xl border border-slate-300 bg-white text-center font-bold text-slate-800 caret-transparent shadow-sm transition-all " +
          (size === "sm" ? "h-11 w-9 text-base" : "h-12 w-10 sm:w-11 text-lg") +
          " focus:border-[#3C0E11] focus:ring-2 focus:ring-[#3C0E11]/20 focus:outline-none disabled:opacity-50 disabled:bg-slate-100"
      }, i)
    )
  });
}

const MailIcon = (props) => e.jsxs("svg", {
  ...props,
  fill: "none",
  viewBox: "0 0 24 24",
  stroke: "currentColor",
  strokeWidth: "2",
  children: [
    e.jsx("rect", { width: "20", height: "16", x: "2", y: "4", rx: "2" }),
    e.jsx("path", { d: "m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" })
  ]
});

const X = ({ isOpen: W, onClose: b, onSuccess: w, initialMessage: D }) => {
  // Main tabs: "login" | "register"
  const [activeTab, setActiveTab] = a.useState("login");

  // Login sub-mode: "credentials" | "forgot_password"
  const [loginMode, setLoginMode] = a.useState("credentials");

  // Login form state
  const [username, setUsername] = a.useState("");
  const [password, setPassword] = a.useState("");

  // Forgot password flow state: "email" | "otp" | "new_password" | "done"
  const [forgotStep, setForgotStep] = a.useState("email");
  const [forgotEmail, setForgotEmail] = a.useState("");
  const [forgotCode, setForgotCode] = a.useState("");
  const [newPassword, setNewPassword] = a.useState("");
  const [confirmPassword, setConfirmPassword] = a.useState("");
  const [forgotTimer, setForgotTimer] = a.useState(0);

  // Register form state (Email-based)
  const [regEmail, setRegEmail] = a.useState("");
  const [regFullName, setRegFullName] = a.useState("");
  const [regCode, setRegCode] = a.useState("");
  const [regStep, setRegStep] = a.useState("email");
  const [regTimer, setRegTimer] = a.useState(0);

  // UI state
  const [loading, setLoading] = a.useState(false);
  const [errorMsg, setErrorMsg] = a.useState("");
  const [successMsg, setSuccessMsg] = a.useState("");

  const cleanNum = (r) => {
    let t = (r || "").toString().trim();
    t = t.replace(/[۰-۹]/g, (s) => String.fromCharCode(s.charCodeAt(0) - 1728));
    t = t.replace(/[٠-٩]/g, (s) => String.fromCharCode(s.charCodeAt(0) - 1584));
    return t;
  };

  const cleanPhone = (r) => {
    let t = cleanNum(r);
    t = t.replace(/[^0-9+]/g, "");
    if (t.startsWith("+98")) t = "0" + t.slice(3);
    if (t.startsWith("0098")) t = "0" + t.slice(4);
    if (t.startsWith("98")) t = "0" + t.slice(2);
    if (!t.startsWith("0") && t.length === 10) t = "0" + t;
    return t;
  };

  const cleanEmail = (r) => (r || "").toString().trim().toLowerCase();
  const isValidEmail = (r) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail(r));

  // Forgot Password OTP countdown (180s = 3 minutes)
  a.useEffect(() => {
    if (forgotTimer <= 0) return;
    const r = setInterval(() => {
      setForgotTimer((t) => (t > 0 ? t - 1 : 0));
    }, 1000);
    return () => clearInterval(r);
  }, [forgotTimer]);

  // Register OTP 3-minute countdown (180s)
  a.useEffect(() => {
    if (regTimer <= 0) return;
    const r = setInterval(() => {
      setRegTimer((t) => (t > 0 ? t - 1 : 0));
    }, 1000);
    return () => clearInterval(r);
  }, [regTimer]);

  // Check stored rate limit cooldown for registration email
  a.useEffect(() => {
    const em = cleanEmail(regEmail);
    if (isValidEmail(em)) {
      const lastSent = Number(localStorage.getItem("caffeine_reg_otp_ts_" + em) || 0);
      const elapsed = Math.floor((Date.now() - lastSent) / 1000);
      if (lastSent && elapsed < 180) {
        setRegTimer(180 - elapsed);
        setRegStep("otp");
      }
    }
  }, [regEmail]);

  // Check stored rate limit cooldown for forgot password email
  a.useEffect(() => {
    const em = cleanEmail(forgotEmail);
    if (isValidEmail(em)) {
      const lastSent = Number(localStorage.getItem("caffeine_forgot_otp_ts_" + em) || 0);
      const elapsed = Math.floor((Date.now() - lastSent) / 1000);
      if (lastSent && elapsed < 180) {
        setForgotTimer(180 - elapsed);
      }
    }
  }, [forgotEmail]);

  // Handle direct username/email + password login
  const handleLoginSubmit = async (ev) => {
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
  // ===================== FORGOT PASSWORD FLOW =====================
  // Step 1: Request OTP for password reset
  const handleForgotOtpRequest = async (ev) => {
    if (ev) ev.preventDefault();
    const email = cleanEmail(forgotEmail);
    if (!isValidEmail(email)) {
      setErrorMsg("لطفاً آدرس ایمیل معتبر حساب کاربری خود را وارد فرمایید (مانند name@example.com)");
      return;
    }

    const storageKey = "caffeine_forgot_otp_ts_" + email;
    const lastSent = Number(localStorage.getItem(storageKey) || 0);
    const elapsed = Math.floor((Date.now() - lastSent) / 1000);
    if (lastSent && elapsed < 180) {
      const remaining = 180 - elapsed;
      setForgotTimer(remaining);
      setForgotStep("otp");
      setErrorMsg("هر سه دقیقه یک کد بیشتر ارسال نمی‌شود. لطفاً " + formatTimer(remaining) + " دیگر شکیبا باشید.");
      return;
    }

    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const res = await y.sendOtp(email, "student", email);
      if (res && res.success) {
        localStorage.setItem(storageKey, Date.now().toString());
        setForgotTimer(180);
        setForgotStep("otp");
        setSuccessMsg(res.message || "کد تایید ۶ رقمی بازیابی رمز عبور با موفقیت به نشانی ایمیل شما ارسال شد.");
      } else {
        if (res?.retryAfterSeconds) {
          setForgotTimer(res.retryAfterSeconds);
          setForgotStep("otp");
        }
        setErrorMsg(res?.message || res?.error || "خطا در ارسال کد تایید بازیابی رمز عبور.");
      }
    } catch {
      setErrorMsg("خطا در برقراری ارتباط با سرور ایمیل. لطفاً پس از ۳ دقیقه مجدداً تلاش فرمایید.");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP for password reset
  const handleForgotVerifyOtp = async (ev, explicitCode) => {
    if (ev && ev.preventDefault) ev.preventDefault();
    const code = cleanNum(explicitCode !== undefined ? explicitCode : forgotCode).replace(/\D/g, "");
    const email = cleanEmail(forgotEmail);
    if (!code || code.length < 5) {
      setErrorMsg("لطفاً کد تایید ۶ رقمی ارسال‌شده را به صورت کامل وارد فرمایید.");
      return;
    }

    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const res = await y.verifyOtp(email, code);
      if (res && res.success) {
        setForgotStep("new_password");
        setSuccessMsg("کد تایید با موفقیت احراز شد. اکنون رمز عبور جدید خود را وارد نمایید.");
      } else {
        setErrorMsg(res?.message || "کد تایید نامعتبر است یا زمان آن منقضی شده است.");
      }
    } catch (err) {
      setErrorMsg(err?.message || "خطا در تایید کد تایید بازیابی.");
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Set and save new password
  const handleResetPasswordSubmit = async (ev) => {
    if (ev) ev.preventDefault();
    const np = (newPassword || "").trim();
    const cp = (confirmPassword || "").trim();
    const email = cleanEmail(forgotEmail);
    const code = cleanNum(forgotCode).replace(/\D/g, "");

    if (!np || np.length < 4) {
      setErrorMsg("رمز عبور جدید باید حداقل ۴ کاراکتر باشد.");
      return;
    }
    if (np !== cp) {
      setErrorMsg("رمز عبور جدید و تکرار آن با یکدیگر مطابقت ندارند.");
      return;
    }

    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const resp = await fetch("/api/v1/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          phone: email,
          otp: code,
          newPassword: np
        })
      });
      const data = await resp.json().catch(() => ({}));

      if (data && data.success) {
        try {
          const passMap = JSON.parse(localStorage.getItem("caffeine_custom_passwords_v1") || "{}");
          passMap[email] = np;
          localStorage.setItem("caffeine_custom_passwords_v1", JSON.stringify(passMap));
        } catch {}

        setUsername(email);
        setPassword(np);
        setForgotStep("done");
        setSuccessMsg("رمز عبور با موفقیت به‌روزرسانی شد! در حال انتقال به صفحه ورود...");

        setTimeout(() => {
          setLoginMode("credentials");
          setForgotStep("email");
          setForgotCode("");
          setNewPassword("");
          setConfirmPassword("");
          setSuccessMsg("رمز عبور شما تغییر یافت. اکنون می‌توانید وارد سامانه شوید.");
        }, 1500);
      } else {
        setErrorMsg(data?.message || "خطا در به‌روزرسانی رمز عبور.");
      }
    } catch {
      setErrorMsg("خطا در ذخیره رمز عبور جدید. لطفاً ارتباط خود را بررسی فرمایید.");
    } finally {
      setLoading(false);
    }
  };

  // ===================== REGISTRATION FLOW (EMAIL-BASED) =====================
  const handleRegOtpRequest = async (ev) => {
    if (ev) ev.preventDefault();
    const email = cleanEmail(regEmail);
    if (!isValidEmail(email)) {
      setErrorMsg("لطفاً آدرس ایمیل معتبر خود را وارد فرمایید (مانند name@example.com)");
      return;
    }
    const storageKey = "caffeine_reg_otp_ts_" + email;
    const lastSent = Number(localStorage.getItem(storageKey) || 0);
    const elapsed = Math.floor((Date.now() - lastSent) / 1000);
    if (lastSent && elapsed < 180) {
      const remaining = 180 - elapsed;
      setRegTimer(remaining);
      setRegStep("otp");
      setErrorMsg("هر سه دقیقه یک کد بیشتر ارسال نمی‌شود. لطفاً " + formatTimer(remaining) + " دیگر شکیبا باشید.");
      return;
    }
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");
    try {
      const res = await y.sendOtp(email, "student", email).catch(() => null);
      if (res && res.success) {
        localStorage.setItem(storageKey, Date.now().toString());
        setRegTimer(180);
        setRegStep("otp");
        if (res.devCode) {
          setRegCode(res.devCode);
          setSuccessMsg("کد تایید فعال‌سازی: " + res.devCode);
        } else {
          setSuccessMsg(res.message || "کد تایید ۶ رقمی فعال‌سازی با موفقیت به نشانی ایمیل شما ارسال شد.");
        }
      } else {
        localStorage.setItem(storageKey, Date.now().toString());
        setRegTimer(180);
        setRegStep("otp");
        setErrorMsg("خطا در ارسال کد تایید. لطفاً اتصال اینترنت خود را بررسی نموده و مجدداً تلاش فرمایید.");
      }
    } catch {
      localStorage.setItem(storageKey, Date.now().toString());
      setRegTimer(180);
      setRegStep("otp");
      setErrorMsg("خطا در ارسال کد تایید. لطفاً اتصال اینترنت خود را بررسی نموده و مجدداً تلاش فرمایید.");
    } finally {
      setLoading(false);
    }
  };  const handleRegVerify = async (ev, explicitCode) => {
    if (ev && ev.preventDefault) ev.preventDefault();
    const code = cleanNum(explicitCode !== undefined ? explicitCode : regCode).replace(/\D/g, "");
    const email = cleanEmail(regEmail);
    const fullName = (regFullName || "").trim() || (email.split("@")[0] || "داوطلب کافئین");
    if (!code || code.length < 5) {
      setErrorMsg("لطفاً کد تایید ۶ رقمی را به صورت کامل وارد فرمایید.");
      return;
    }
    setLoading(true);
    setErrorMsg("");
    try {
      let res = await y.verifyOtp(email, code, undefined, fullName).catch(() => null);
      if (!res || !res.success) { setErrorMsg(res && res.message ? res.message : "کد تایید وارد شده نامعتبر یا منقضی گردیده است."); return; }
      if (res && res.success) {
        const userRole = res.role || "student";
        const userName = res.user?.name || fullName;
        const studentId = res.user?.studentId || ("std-" + email.replace(/[^a-z0-9]/gi, "").slice(0, 6));
        const session = {
          id: res.user?.id || ("usr-" + studentId),
          name: userName,
          email,
          phone: res.user?.phone || undefined,
          role: userRole,
          username: email,
          studentId,
          token: res.token,
          loginAt: new Date().toISOString(),
          lastActiveAt: new Date().toISOString()
        };
        localStorage.setItem("caffeine_current_user", JSON.stringify(session));
        localStorage.setItem("caffeine_auth_user_session_v1", JSON.stringify(session));
        window.dispatchEvent(new CustomEvent("caffeine_rbac_auth_changed", { detail: session }));
        setSuccessMsg("ثبت‌نام با موفقیت انجام شد! در حال انتقال به سامانه...");
        setTimeout(() => {
          w(session, userRole);
          b();
        }, 400);
      } else {
        setErrorMsg(res?.message || "کد تایید واردشده نامعتبر است.");
      }
    } catch (err) {
      setErrorMsg(err?.message || "خطا در تایید کد ثبت‌نام. لطفاً مجدداً تلاش فرمایید.");
    } finally {
      setLoading(false);
    }
  };  const switchTab = (tab) => {
    setActiveTab(tab);
    setLoginMode("credentials");
    setForgotStep("email");
    setErrorMsg("");
    setSuccessMsg("");
  };

  return e.jsx(G, {
    isOpen: W,
    onClose: b,
    title: "سامانه یکپارچه کافئین",
    maxWidth: "max-w-md",
    children: e.jsxs("div", {
      className: "space-y-4",
      children: [
        // Top Tab Switcher: ورود به سامانه | ثبت‌نام داوطلب جدید
        e.jsxs("div", {
          className: "bg-[#F7F3EF] p-1 rounded-2xl flex border border-[#3C0E11]/10",
          children: [
            e.jsx("button", {
              type: "button",
              onClick: () => switchTab("login"),
              className: "flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer " +
                (activeTab === "login"
                  ? "bg-[#3C0E11] text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900"),
              children: "ورود به سامانه"
            }),
            e.jsx("button", {
              type: "button",
              onClick: () => switchTab("register"),
              className: "flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer " +
                (activeTab === "register"
                  ? "bg-[#3C0E11] text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900"),
              children: "ثبت‌نام داوطلب جدید"
            })
          ]
        }),

        // Header info
        e.jsxs("div", {
          className: "text-center space-y-1",
          children: [
            e.jsx("div", {
              className: "w-11 h-11 rounded-2xl bg-[#3C0E11] text-[#C5A880] flex items-center justify-center mx-auto text-lg font-black shadow-sm shadow-[#3C0E11]/20",
              children: "ک"
            }),
            e.jsx("h4", {
              className: "text-base font-black text-slate-800",
              children:
                activeTab === "register"
                  ? "ثبت‌نام با نشانی ایمیل در سامانه کافئین"
                  : loginMode === "forgot_password"
                  ? (forgotStep === "new_password"
                      ? "تعیین رمز عبور جدید"
                      : forgotStep === "otp"
                      ? "تایید ایمیل جهت تغییر رمز"
                      : forgotStep === "done"
                      ? "رمز عبور تغییر یافت"
                      : "فراموشی و بازیابی رمز عبور")
                  : "ورود با نام کاربری و رمز عبور"
            }),
            e.jsx("p", {
              className: "text-xs text-slate-500",
              children:
                activeTab === "register"
                  ? (regStep === "otp"
                      ? "کد ۶ رقمی ارسال‌شده به نشانی ایمیل خود را وارد فرمایید."
                      : "جهت عضویت، نشانی ایمیل خود را وارد نمایید تا کد تایید فعال‌سازی ارسال گردد.")
                  : loginMode === "forgot_password"
                  ? (forgotStep === "new_password"
                      ? "رمز عبور جدید خود را با حداقل ۴ کاراکتر وارد فرمایید."
                      : forgotStep === "otp"
                      ? ("کد تایید ۶ رقمی ارسال‌شده به " + forgotEmail + " را وارد نمایید.")
                      : forgotStep === "done"
                      ? "تغییر رمز عبور با موفقیت انجام شد. اکنون وارد شوید."
                      : "آدرس ایمیل حساب کاربری خود را وارد نمایید تا کد تایید ارسال شود.")
                  : D || "جهت ورود به پرتال اختصاصی، نام کاربری یا ایمیل و رمز عبور خود را وارد نمایید."
            })
          ]
        }),

        // Error message
        errorMsg &&
          e.jsxs("div", {
            className: "p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2",
            children: [e.jsx($, { className: "w-4 h-4 text-rose-600 shrink-0" }), e.jsx("span", { children: errorMsg })]
          }),

        // Success message
        successMsg &&
          e.jsxs("div", {
            className: "p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2",
            children: [e.jsx(q, { className: "w-4 h-4 text-emerald-600 shrink-0" }), e.jsx("span", { children: successMsg })]
          }),

        // ===================== REGISTER VIEW (EMAIL-BASED) =====================
        activeTab === "register"
          ? e.jsxs("form", {
              onSubmit: (ev) => {
                if (regStep === "otp") handleRegVerify(ev);
                else handleRegOtpRequest(ev);
              },
              className: "space-y-3.5",
              children: [
                // Email input
                e.jsxs("div", {
                  children: [
                    e.jsx("label", {
                      className: "block text-xs font-bold text-slate-700 mb-1.5",
                      children: "آدرس ایمیل داوطلب:"
                    }),
                    e.jsxs("div", {
                      className: "relative",
                      children: [
                        e.jsx(MailIcon, { className: "w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" }),
                        e.jsx("input", {
                          type: "email",
                          dir: "ltr",
                          placeholder: "name@example.com",
                          value: regEmail,
                          disabled: regStep === "otp" && regTimer > 0,
                          onChange: (r) => setRegEmail(r.target.value),
                          className: "w-full pl-3 pr-10 py-2.5 rounded-2xl border border-slate-200 focus:border-amber-600 focus:ring-2 focus:ring-amber-100 text-sm font-bold text-slate-800 outline-none text-left disabled:bg-slate-50 disabled:text-slate-500",
                          required: true,
                          autoFocus: regStep === "email"
                        })
                      ]
                    })
                  ]
                }),

                // Optional Full Name input (shown in email step)
                regStep === "email" &&
                  e.jsxs("div", {
                    children: [
                      e.jsx("label", {
                        className: "block text-xs font-bold text-slate-700 mb-1.5",
                        children: "نام و نام خانوادگی (اختیاری):"
                      }),
                      e.jsxs("div", {
                        className: "relative",
                        children: [
                          e.jsx(B, { className: "w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" }),
                          e.jsx("input", {
                            type: "text",
                            placeholder: "مثال: علی احمدی",
                            value: regFullName,
                            onChange: (r) => setRegFullName(r.target.value),
                            className: "w-full pl-3 pr-10 py-2.5 rounded-2xl border border-slate-200 focus:border-amber-600 focus:ring-2 focus:ring-amber-100 text-sm text-slate-800 outline-none text-right"
                          })
                        ]
                      })
                    ]
                  }),

                // Production OTP Code input using OtpField component
                regStep === "otp" &&
                  e.jsxs("div", {
                    className: "space-y-3 pt-1",
                    children: [
                      e.jsxs("div", {
                        className: "flex items-center justify-between mb-1",
                        children: [
                          e.jsxs("label", {
                            className: "block text-xs font-bold text-slate-700",
                            children: [
                              "کد ۶ رقمی ارسال‌شده به ",
                              e.jsx("span", { className: "font-mono font-black text-slate-900 dir-ltr inline-block mx-1", children: regEmail }),
                              ":"
                            ]
                          }),
                          e.jsx("button", {
                            type: "button",
                            onClick: () => {
                              setRegStep("email");
                              setRegCode("");
                              setErrorMsg("");
                            },
                            className: "text-[11px] text-amber-800 hover:underline cursor-pointer font-bold",
                            children: "ویرایش ایمیل"
                          })
                        ]
                      }),
                      e.jsx(OtpField, {
                        length: 6,
                        value: regCode,
                        onChange: (val) => setRegCode(val),
                        onComplete: (val) => {
                          setRegCode(val);
                          handleRegVerify(null, val);
                        },
                        disabled: loading,
                        size: "md",
                        "aria-label": "کد تأیید ثبت نام"
                      }),
                      e.jsx("p", {
                        className: "text-[11px] text-slate-400 text-center mt-1",
                        children: "لطفاً صندوق ورودی (Inbox) یا اسپم ایمیل خود را بررسی نمایید."
                      }),
                      regTimer > 0 ? (
                        e.jsxs("div", {
                          className: "mt-2 flex items-center justify-between text-[11px] text-slate-500 bg-slate-50 border border-slate-200/80 px-3 py-1.5 rounded-xl",
                          children: [
                            e.jsx("span", { children: "امکان درخواست مجدد کد:" }),
                            e.jsxs("span", { className: "font-bold text-[#3C0E11] font-mono", children: [formatTimer(regTimer), " ⏱"] })
                          ]
                        })
                      ) : (
                        e.jsx("div", {
                          className: "text-center pt-1",
                          children: e.jsx("button", {
                            type: "button",
                            onClick: handleRegOtpRequest,
                            className: "text-xs font-bold text-amber-800 hover:underline cursor-pointer",
                            children: "ارسال مجدد کد تایید ایمیلی"
                          })
                        })
                      )
                    ]
                  }),

                // Submit Button
                e.jsx(P, {
                  type: "submit",
                  variant: "primary",
                  size: "lg",
                  className: "w-full shadow-md shadow-amber-900/20 cursor-pointer bg-[#3C0E11] hover:bg-[#521317] text-white font-bold",
                  isLoading: loading,
                  disabled: regStep === "email" && regTimer > 0,
                  children:
                    regStep === "otp"
                      ? "تایید کد و ورود به سامانه ←"
                      : regTimer > 0
                      ? ("ارسال مجدد تا " + formatTimer(regTimer) + " دیگر")
                      : "ارسال کد تایید به ایمیل ←"
                }),

                // Switch to login tab
                e.jsxs("div", {
                  className: "flex items-center justify-between text-xs pt-1 border-t border-slate-100",
                  children: [
                    e.jsx("span", { className: "text-slate-500 text-[11px]", children: "قبلاً ثبت‌نام کرده‌اید؟" }),
                    e.jsx("button", {
                      type: "button",
                      onClick: () => switchTab("login"),
                      className: "text-[#3C0E11] hover:text-[#521317] font-bold cursor-pointer text-[11px]",
                      children: "ورود به حساب کاربری ←"
                    })
                  ]
                })
              ]
            })

          // ===================== FORGOT PASSWORD VIEW =====================
          : loginMode === "forgot_password"
          ? (
              forgotStep === "email"
                ? e.jsxs("form", {
                    onSubmit: handleForgotOtpRequest,
                    className: "space-y-3.5",
                    children: [
                      e.jsxs("div", {
                        children: [
                          e.jsx("label", {
                            className: "block text-xs font-bold text-slate-700 mb-1.5",
                            children: "نشانی ایمیل حساب کاربری:"
                          }),
                          e.jsxs("div", {
                            className: "relative",
                            children: [
                              e.jsx(MailIcon, { className: "w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" }),
                              e.jsx("input", {
                                type: "email",
                                dir: "ltr",
                                placeholder: "name@example.com",
                                value: forgotEmail,
                                onChange: (r) => setForgotEmail(r.target.value),
                                className: "w-full pl-3 pr-10 py-2.5 rounded-2xl border border-slate-200 focus:border-amber-600 focus:ring-2 focus:ring-amber-100 text-sm font-bold text-slate-800 outline-none text-left",
                                required: true,
                                autoFocus: true
                              })
                            ]
                          })
                        ]
                      }),
                      e.jsx(P, {
                        type: "submit",
                        variant: "primary",
                        size: "lg",
                        className: "w-full shadow-md shadow-amber-900/20 cursor-pointer bg-[#3C0E11] hover:bg-[#521317] text-white font-bold",
                        isLoading: loading,
                        disabled: forgotTimer > 0,
                        children: forgotTimer > 0 ? ("ارسال مجدد تا " + formatTimer(forgotTimer) + " دیگر") : "ارسال کد تایید به ایمیل ←"
                      }),
                      e.jsxs("div", {
                        className: "flex items-center justify-between text-xs pt-1 border-t border-slate-100",
                        children: [
                          e.jsx("button", {
                            type: "button",
                            onClick: () => {
                              setLoginMode("credentials");
                              setErrorMsg("");
                              setSuccessMsg("");
                            },
                            className: "text-slate-600 hover:text-slate-900 font-bold cursor-pointer text-[11px]",
                            children: "← بازگشت به صفحه ورود"
                          }),
                          e.jsx("button", {
                            type: "button",
                            onClick: () => switchTab("register"),
                            className: "text-[#3C0E11] hover:text-[#521317] font-bold cursor-pointer text-[11px]",
                            children: "ثبت‌نام جدید ←"
                          })
                        ]
                      })
                    ]
                  })
                : forgotStep === "otp"
                ? e.jsxs("form", {
                    onSubmit: (ev) => handleForgotVerifyOtp(ev),
                    className: "space-y-3.5",
                    children: [
                      e.jsxs("div", {
                        className: "space-y-3 pt-1",
                        children: [
                          e.jsxs("div", {
                            className: "flex items-center justify-between mb-1",
                            children: [
                              e.jsxs("label", {
                                className: "block text-xs font-bold text-slate-700",
                                children: [
                                  "کد ۶ رقمی تایید ارسال‌شده به ",
                                  e.jsx("span", { className: "font-mono font-black text-slate-900 dir-ltr inline-block mx-1", children: forgotEmail }),
                                  ":"
                                ]
                              }),
                              e.jsx("button", {
                                type: "button",
                                onClick: () => {
                                  setForgotStep("email");
                                  setForgotCode("");
                                  setErrorMsg("");
                                },
                                className: "text-[11px] text-amber-800 hover:underline cursor-pointer font-bold",
                                children: "ویرایش ایمیل"
                              })
                            ]
                          }),
                          e.jsx(OtpField, {
                            length: 6,
                            value: forgotCode,
                            onChange: (val) => setForgotCode(val),
                            onComplete: (val) => {
                              setForgotCode(val);
                              handleForgotVerifyOtp(null, val);
                            },
                            disabled: loading,
                            size: "md",
                            "aria-label": "کد تأیید بازیابی رمز"
                          }),
                          forgotTimer > 0 &&
                            e.jsxs("div", {
                              className: "mt-2 flex items-center justify-between text-[11px] text-slate-500 bg-slate-50 border border-slate-200/80 px-3 py-1.5 rounded-xl",
                              children: [
                                e.jsx("span", { children: "امکان درخواست مجدد کد:" }),
                                e.jsxs("span", { className: "font-bold text-[#3C0E11] font-mono", children: [formatTimer(forgotTimer), " ⏱"] })
                              ]
                            })
                        ]
                      }),
                      e.jsx(P, {
                        type: "submit",
                        variant: "primary",
                        size: "lg",
                        className: "w-full shadow-md shadow-amber-900/20 cursor-pointer bg-[#3C0E11] hover:bg-[#521317] text-white font-bold",
                        isLoading: loading,
                        children: "تایید کد و مرحله بعد (تغییر رمز) ←"
                      }),
                      e.jsxs("div", {
                        className: "flex items-center justify-between text-xs pt-1 border-t border-slate-100",
                        children: [
                          e.jsx("button", {
                            type: "button",
                            onClick: () => {
                              setLoginMode("credentials");
                              setErrorMsg("");
                              setSuccessMsg("");
                            },
                            className: "text-slate-600 hover:text-slate-900 font-bold cursor-pointer text-[11px]",
                            children: "← انصراف و بازگشت"
                          }),
                          forgotTimer <= 0 &&
                            e.jsx("button", {
                              type: "button",
                              onClick: handleForgotOtpRequest,
                              className: "text-[#3C0E11] hover:underline font-bold cursor-pointer text-[11px]",
                              children: "ارسال مجدد کد تایید"
                            })
                        ]
                      })
                    ]
                  })
                : forgotStep === "new_password"
                ? e.jsxs("form", {
                    onSubmit: handleResetPasswordSubmit,
                    className: "space-y-3.5",
                    children: [
                      e.jsxs("div", {
                        children: [
                          e.jsx("label", {
                            className: "block text-xs font-bold text-slate-700 mb-1.5",
                            children: "رمز عبور جدید:"
                          }),
                          e.jsxs("div", {
                            className: "relative",
                            children: [
                              e.jsx(V, { className: "w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" }),
                              e.jsx("input", {
                                type: "password",
                                dir: "ltr",
                                placeholder: "حداقل ۴ کاراکتر",
                                value: newPassword,
                                onChange: (r) => setNewPassword(r.target.value),
                                className: "w-full pl-3 pr-10 py-2.5 rounded-2xl border border-slate-200 focus:border-amber-600 focus:ring-2 focus:ring-amber-100 text-sm font-bold text-slate-800 outline-none text-left",
                                required: true,
                                autoFocus: true
                              })
                            ]
                          })
                        ]
                      }),
                      e.jsxs("div", {
                        children: [
                          e.jsx("label", {
                            className: "block text-xs font-bold text-slate-700 mb-1.5",
                            children: "تکرار رمز عبور جدید:"
                          }),
                          e.jsxs("div", {
                            className: "relative",
                            children: [
                              e.jsx(V, { className: "w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" }),
                              e.jsx("input", {
                                type: "password",
                                dir: "ltr",
                                placeholder: "تکرار مجدد رمز عبور جدید",
                                value: confirmPassword,
                                onChange: (r) => setConfirmPassword(r.target.value),
                                className: "w-full pl-3 pr-10 py-2.5 rounded-2xl border border-slate-200 focus:border-amber-600 focus:ring-2 focus:ring-amber-100 text-sm font-bold text-slate-800 outline-none text-left",
                                required: true
                              })
                            ]
                          })
                        ]
                      }),
                      e.jsx(P, {
                        type: "submit",
                        variant: "primary",
                        size: "lg",
                        className: "w-full shadow-md shadow-amber-900/20 cursor-pointer bg-[#3C0E11] hover:bg-[#521317] text-white font-bold",
                        isLoading: loading,
                        children: "ذخیره رمز عبور جدید و تکمیل ←"
                      }),
                      e.jsxs("div", {
                        className: "flex items-center justify-between text-xs pt-1 border-t border-slate-100",
                        children: [
                          e.jsx("button", {
                            type: "button",
                            onClick: () => {
                              setLoginMode("credentials");
                              setErrorMsg("");
                              setSuccessMsg("");
                            },
                            className: "text-slate-600 hover:text-slate-900 font-bold cursor-pointer text-[11px]",
                            children: "← انصراف و بازگشت"
                          })
                        ]
                      })
                    ]
                  })
                : e.jsxs("div", {
                    className: "text-center space-y-4 py-2",
                    children: [
                      e.jsx("div", {
                        className: "w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto text-xl font-bold",
                        children: "✓"
                      }),
                      e.jsx("p", {
                        className: "text-sm font-bold text-slate-800",
                        children: "رمز عبور شما با موفقیت به‌روزرسانی شد!"
                      }),
                      e.jsx(P, {
                        type: "button",
                        onClick: () => {
                          setLoginMode("credentials");
                          setForgotStep("email");
                          setErrorMsg("");
                          setSuccessMsg("");
                        },
                        variant: "primary",
                        size: "lg",
                        className: "w-full bg-[#3C0E11] hover:bg-[#521317] text-white font-bold cursor-pointer",
                        children: "ورود با رمز عبور جدید ←"
                      })
                    ]
                  })
            )

          // ===================== LOGIN VIEW (CREDENTIALS ONLY) =====================
          : e.jsxs("form", {
              onSubmit: handleLoginSubmit,
              className: "space-y-3.5",
              children: [
                e.jsxs("div", {
                  children: [
                    e.jsx("label", {
                      className: "block text-xs font-bold text-slate-700 mb-1.5",
                      children: "ایمیل یا نام کاربری:"
                    }),
                    e.jsxs("div", {
                      className: "relative",
                      children: [
                        e.jsx(B, { className: "w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" }),
                        e.jsx("input", {
                          type: "text",
                          dir: "ltr",
                          placeholder: "مثال: name@example.com یا admin",
                          value: username,
                          onChange: (r) => setUsername(r.target.value),
                          className: "w-full pl-3 pr-10 py-2.5 rounded-2xl border border-slate-200 focus:border-amber-600 focus:ring-2 focus:ring-amber-100 text-sm font-bold text-slate-800 outline-none text-left",
                          required: true,
                          autoFocus: true
                        })
                      ]
                    })
                  ]
                }),
                e.jsxs("div", {
                  children: [
                    e.jsxs("div", {
                      className: "flex items-center justify-between mb-1.5",
                      children: [
                        e.jsx("label", {
                          className: "block text-xs font-bold text-slate-700",
                          children: "رمز عبور:"
                        }),
                        e.jsx("button", {
                          type: "button",
                          onClick: () => {
                            setLoginMode("forgot_password");
                            setForgotStep("email");
                            setForgotEmail(cleanEmail(username) || "");
                            setErrorMsg("");
                            setSuccessMsg("");
                          },
                          className: "text-[11px] text-[#3C0E11] hover:text-[#521317] hover:underline font-bold cursor-pointer",
                          children: "فراموشی رمز عبور؟"
                        })
                      ]
                    }),
                    e.jsxs("div", {
                      className: "relative",
                      children: [
                        e.jsx(V, { className: "w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" }),
                        e.jsx("input", {
                          type: "password",
                          dir: "ltr",
                          placeholder: "رمز عبور حساب کاربری",
                          value: password,
                          onChange: (r) => setPassword(r.target.value),
                          className: "w-full pl-3 pr-10 py-2.5 rounded-2xl border border-slate-200 focus:border-amber-600 focus:ring-2 focus:ring-amber-100 text-sm font-bold text-slate-800 outline-none text-left",
                          required: true
                        })
                      ]
                    })
                  ]
                }),
                e.jsx(P, {
                  type: "submit",
                  variant: "primary",
                  size: "lg",
                  className: "w-full shadow-md shadow-amber-900/20 cursor-pointer text-sm font-bold bg-[#3C0E11] hover:bg-[#521317] text-white",
                  isLoading: loading,
                  children: "ورود به پرتال اختصاصی ←"
                }),
                e.jsxs("div", {
                  className: "flex items-center justify-between text-xs pt-1",
                  children: [
                    e.jsx("button", {
                      type: "button",
                      onClick: () => {
                        setLoginMode("forgot_password");
                        setForgotStep("email");
                        setForgotEmail(cleanEmail(username) || "");
                        setErrorMsg("");
                        setSuccessMsg("");
                      },
                      className: "text-amber-900 hover:text-amber-950 font-bold cursor-pointer text-[11px]",
                      children: "رمز عبور خود را فراموش کرده‌اید؟ بازیابی رمز ←"
                    }),
                    e.jsxs("div", {
                      className: "flex items-center gap-1 text-[11px] text-slate-400",
                      children: [e.jsx(U, { className: "w-3 h-3 text-emerald-500" }), "احراز هویت امن"]
                    })
                  ]
                }),
                // Link to registration
                e.jsxs("div", {
                  className: "pt-2 border-t border-slate-100 flex items-center justify-between text-xs",
                  children: [
                    e.jsx("span", { className: "text-slate-500 text-[11px]", children: "هنوز در سامانه حساب ندارید؟" }),
                    e.jsx("button", {
                      type: "button",
                      onClick: () => switchTab("register"),
                      className: "text-[#3C0E11] hover:text-[#521317] font-bold cursor-pointer text-[11px]",
                      children: "ثبت‌نام داوطلب کنکور با ایمیل ←"
                    })
                  ]
                })
              ]
            })
      ]
    })
  });
};

export { X as AuthModal };
