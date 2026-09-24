import { j as e, a8 as m, J as h, S as p, a$ as b, H as j, a9 as f } from "./vendor-react-AAJfNG8R.js";
import { ac as u, ad as g } from "./index-CvuvcUm9.js";
import "./vendor-katex-BEwRSR0t.js";

const k = ({ currentUser: s, requestedView: t, onNavigate: r, onOpenAuth: x, onRoleSwitched: i }) => {
  const n = u[t] || t,
    l = t === "advisor-portal" ? "advisor" : t === "parent-portal" ? "parent" : t === "admin-crm" ? "admin" : "student",
    a = { student: "دانش‌آموز", advisor: "مشاور تحصیلی", parent: "والدین", admin: "مدیریت ارشد", guest: "کاربر مهمان" },
    c = s.role === "student" ? "student-portal" : s.role === "advisor" ? "advisor-portal" : s.role === "parent" ? "parent-portal" : s.role === "admin" ? "admin-crm" : "home";

  return e.jsx("div", {
    className: "min-h-[75vh] flex items-center justify-center p-4 sm:p-8",
    children: e.jsxs("div", {
      className: "max-w-xl w-full bg-white rounded-3xl p-6 sm:p-8 border-2 border-rose-200 shadow-xl shadow-rose-100/50 space-y-6 text-right relative overflow-hidden",
      children: [
        e.jsx("div", { className: "absolute -left-12 -top-12 w-48 h-48 bg-rose-50 rounded-full blur-2xl pointer-events-none" }),
        e.jsx("div", { className: "absolute -right-12 -bottom-12 w-48 h-48 bg-amber-50 rounded-full blur-2xl pointer-events-none" }),
        e.jsxs("div", {
          className: "flex items-start gap-4",
          children: [
            e.jsx("div", {
              className: "w-14 h-14 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 shadow-inner",
              children: e.jsx(m, { className: "w-8 h-8 text-rose-600 animate-pulse" })
            }),
            e.jsxs("div", {
              className: "space-y-1",
              children: [
                e.jsxs("div", {
                  className: "flex items-center gap-2",
                  children: [
                    e.jsx("span", {
                      className: "px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[11px] font-black tracking-wider",
                      children: "خطای امنیتی ۴۰۳ • نیاز به ورود مجاز"
                    }),
                    e.jsx("span", { className: "text-xs text-slate-600 font-bold", children: "RBAC Security Guard" })
                  ]
                }),
                e.jsxs("h2", { className: "text-xl font-black text-slate-900", children: ["عدم دسترسی به ", n] })
              ]
            })
          ]
        }),
        e.jsxs("div", {
          className: "bg-rose-50/70 border border-rose-100 rounded-2xl p-4 space-y-2 text-xs sm:text-sm text-slate-700 leading-relaxed font-medium",
          children: [
            s.role === "guest"
              ? e.jsxs("p", {
                  children: [
                    "برای ورود به ",
                    e.jsx("strong", { className: "text-slate-900 font-black", children: n }),
                    "، لازم است با حساب کاربری دارای مجوز وارد سامانه شوید."
                  ]
                })
              : e.jsxs("p", {
                  children: [
                    "حساب کاربری فعلی شما با هویت ",
                    e.jsxs("strong", { className: "text-rose-900 font-black", children: [s.name, " (", a[s.role], ")"] }),
                    " مجوز ورود به بخش ",
                    e.jsx("strong", { className: "text-slate-900 font-black", children: n }),
                    " را ندارد."
                  ]
                }),
            e.jsxs("p", {
              className: "text-slate-600 text-xs",
              children: [
                "🛡️ ",
                e.jsx("strong", { children: "امنیت داده‌ها:" }),
                " جهت حفظ محرمانگی پرونده‌های داوطلبان، هر نقش کاربری منحصراً به پرتال قانونی خود دسترسی دارد."
              ]
            })
          ]
        }),
        e.jsxs("div", {
          className: "bg-slate-50 rounded-2xl p-3.5 border border-slate-200 space-y-2 text-xs",
          children: [
            e.jsx("div", { className: "text-[11px] font-black text-slate-600", children: "سطح دسترسی لازم برای این بخش:" }),
            e.jsxs("div", {
              className: "flex items-center justify-between p-2 rounded-xl bg-white border border-slate-200",
              children: [
                e.jsx("span", { className: "font-bold text-slate-800", children: "نقش مورد نیاز:" }),
                e.jsx("span", { className: "px-2.5 py-1 rounded-lg bg-indigo-100 text-indigo-800 font-black text-xs", children: a[l] })
              ]
            }),
            e.jsxs("div", {
              className: "flex items-center justify-between p-2 rounded-xl bg-white border border-slate-200",
              children: [
                e.jsx("span", { className: "font-bold text-slate-800", children: "وضعیت فعلی شما:" }),
                e.jsx("span", { className: "px-2.5 py-1 rounded-lg bg-rose-100 text-rose-800 font-black text-xs", children: a[s.role] })
              ]
            })
          ]
        }),
        e.jsxs("div", {
          className: "space-y-3 pt-2",
          children: [
            e.jsxs("button", {
              onClick: x,
              className: "w-full py-3 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-indigo-200 transition-all",
              children: [
                e.jsx(f, { className: "w-4 h-4" }),
                e.jsx("span", { children: s.role === "guest" ? "ورود با نام کاربری و رمز عبور ←" : "تغییر حساب و ورود با نقش مجاز ←" })
              ]
            }),
            s.role !== "guest" &&
              e.jsxs("button", {
                onClick: () => r(c),
                className: "w-full py-2.5 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all",
                children: [e.jsx(h, { className: "w-4 h-4 text-slate-500" }), e.jsxs("span", { children: ["بازگشت به پرتال مجاز من (", a[s.role], ")"] })]
              }),
            e.jsx("div", {
              className: "text-center pt-1",
              children: e.jsxs("button", {
                onClick: () => r("home"),
                className: "text-xs font-bold text-slate-500 hover:text-slate-800 inline-flex items-center gap-1 cursor-pointer",
                children: [e.jsx(j, { className: "w-3.5 h-3.5" }), e.jsx("span", { children: "صفحه اصلی سایت" })]
              })
            })
          ]
        })
      ]
    })
  });
};

export { k as SecurityAccessShield };
