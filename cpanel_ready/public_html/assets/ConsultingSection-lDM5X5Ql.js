import{r as x,j as e,U as d,S as o,J as m,t as p,aa as arr,C as cIcon}from"./vendor-react-AAJfNG8R.js";
import{a,P as t,A as h}from"./index-CvuvcUm9.js";
import"./vendor-katex-BEwRSR0t.js";

const N = ({ onNavigate: l, onBookConsultant: r }) => {
  const [copied, setCopied] = x.useState(false);
  const telegramId = "caffeineelite";
  const telegramUrl = "https://t.me/caffeineelite";

  const handleCopyId = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText("@" + telegramId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const plans = [
    {
      id: "private-1m",
      name: "طرح خصوصی کافئین الیت (۱ ماهه)",
      priceTomans: "۲,۹۰۰,۰۰۰",
      period: "۱ ماهه (۳۰ روزه)",
      badge: "دوره هدایت فردی ماهانه",
      badgeColor: "blue",
      description: "همراهی و نظارت اختصاصی منتور رتبه برتر، برنامه‌ریزی شخصی‌سازی‌شده و پایش شبانه عملکرد",
      features: [
        "منتور اختصاصی رتبه برتر و هماهنگی هفتگی منظم",
        "تنظیم دفترچه استراتژیک برنامه روزانه متناسب با سطح درسی و هدف",
        "پایش شبانه ساعت مطالعه، تعداد تست و فیدبک اصلاحی",
        "تحلیل دقیق آزمون‌های آزمایشی و بررسی نقاط ضعف مبحثی",
        "پشتیبانی مستقیم آنلاین و پیگیری مستمر روند مطالعه"
      ],
      isPopular: false
    },
    {
      id: "private-3m",
      name: "طرح خصوصی کافئین الیت (۳ ماهه فصلی)",
      priceTomans: "۶,۹۰۰,۰۰۰",
      period: "۳ ماهه (۹۰ روزه)",
      badge: "پیشنهاد ویژه • تخفیف فصلی",
      badgeColor: "mint",
      description: "جامع‌ترین دوره هدایت پیوسته کنکور با تخفیف فصلی، تحلیل پیشرفته رشد تراز و تثبیت عادات رتبه‌برتر",
      features: [
        "تمام امکانات طرح خصوصی ۱ ماهه با پوشش جامع فصلی",
        "پایش استمرار ۹۰ روزه تا رسیدن به تسلط پایدار در آزمون‌ها",
        "جلسات تحلیلی ویدیویی کارنامه‌ها و ریشه‌یابی افت تراز",
        "کوچینگ مدیریت استرس، تکنیک‌های تست‌زنی و امتحانات نهایی",
        "خط مستقیم ارتباطی با مشاور ارشد برای فوریت‌های تحصیلی"
      ],
      isPopular: true
    }
  ];

  return e.jsxs("div", {
    className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-14 text-right",
    children: [
      /* Header */
      e.jsxs("div", {
        className: "text-center max-w-3xl mx-auto space-y-3",
        children: [
          e.jsx(a, {
            variant: "lavender",
            size: "md",
            icon: d,
            children: "طرح مشاوره و هدایت خصوصی کافئین الیت"
          }),
          e.jsx("h1", {
            className: "text-3xl sm:text-4xl font-black text-slate-900",
            children: "فقط طرح خصوصی؛ همراهی مستقیم با رتبه‌های برتر"
          }),
          e.jsx("p", {
            className: "text-sm text-slate-600 leading-relaxed max-w-2xl mx-auto",
            children: "در کافئین ما فقط طرح خصوصی ارائه می‌دهیم؛ زیرا موفقیت واقعی در کنکور نیازمند ساخت سیستم فردی، پایش روزانه و ارتباط مستقیم با منتور رتبه برتر است."
          })
        ]
      }),

      /* Telegram Payment Activation Banner */
      e.jsxs("div", {
        className: "relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#3C0E11] via-[#2A080A] to-[#1F0507] text-white p-6 sm:p-8 border border-[#C5A880]/30 shadow-xl",
        children: [
          e.jsx("div", {
            className: "absolute -right-16 -top-16 w-64 h-64 bg-[#C5A880]/15 rounded-full blur-3xl pointer-events-none"
          }),
          e.jsxs("div", {
            className: "relative z-10 flex flex-col lg:flex-row items-center justify-between gap-6",
            children: [
              e.jsxs("div", {
                className: "space-y-3 text-right max-w-2xl",
                children: [
                  e.jsxs("div", {
                    className: "inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-xs font-bold text-[#D4B992]",
                    children: [
                      e.jsx("span", { className: "w-2 h-2 rounded-full bg-emerald-400 animate-pulse" }),
                      e.jsx("span", { children: "مرکز ثبت‌نام و فعال‌سازی فوری اشتراک" })
                    ]
                  }),
                  e.jsx("h2", {
                    className: "text-xl sm:text-2xl font-black text-white",
                    children: "نحوه پرداخت و فعال‌سازی اشتراک طرح خصوصی"
                  }),
                  e.jsxs("p", {
                    className: "text-xs sm:text-sm text-white/85 leading-relaxed",
                    children: [
                      "دانش‌آموزان گرامی، برای پرداخت هزینه، ثبت‌نام و فعال‌سازی آنی دسترسی اختصاصی خود، لطفاً پیام درخواست یا فیش واریزی را به آیدی تلگرام ",
                      e.jsx("strong", { className: "text-[#D4B992] font-mono text-sm px-1.5 py-0.5 rounded-md bg-white/10 mx-1", children: "@caffeineelite" }),
                      " ارسال فرمایید."
                    ]
                  })
                ]
              }),
              e.jsxs("div", {
                className: "flex flex-col sm:flex-row items-center gap-3 shrink-0 w-full sm:w-auto",
                children: [
                  e.jsxs("a", {
                    href: telegramUrl,
                    target: "_blank",
                    rel: "noopener noreferrer",
                    className: "w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-[#C5A880] hover:bg-[#D4B992] text-[#3C0E11] font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95 cursor-pointer",
                    children: [
                      e.jsx("span", { children: "ارسال پیام در تلگرام (@caffeineelite)" })
                    ]
                  }),
                  e.jsxs("button", {
                    type: "button",
                    onClick: handleCopyId,
                    className: "w-full sm:w-auto px-4 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer",
                    children: [
                      e.jsx("span", { children: copied ? "✓ آیدی کپی شد!" : "کپی آیدی @caffeineelite" })
                    ]
                  })
                ]
              })
            ]
          })
        ]
      }),

      /* 2 Pricing Cards (1-Month & 3-Month) */
      e.jsx("div", {
        className: "grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto items-stretch",
        children: plans.map((s) =>
          e.jsxs("div", {
            className: "rounded-3xl p-7 sm:p-8 border flex flex-col justify-between transition-all duration-300 " +
              (s.isPopular
                ? "bg-white border-[#3C0E11] shadow-2xl ring-2 ring-[#C5A880]/50 relative"
                : "bg-white border-slate-200/90 shadow-sm hover:border-slate-300"),
            children: [
              s.isPopular &&
                e.jsx("div", {
                  className: "absolute -top-3.5 right-1/2 translate-x-1/2",
                  children: e.jsx(a, {
                    variant: "mint",
                    size: "md",
                    icon: o,
                    children: "پیشنهاد ویژه کافئین • تخفیف فصلی"
                  })
                }),
              e.jsxs("div", {
                className: "space-y-5",
                children: [
                  e.jsxs("div", {
                    className: "flex items-center justify-between",
                    children: [
                      e.jsx("h3", {
                        className: "text-xl font-black text-slate-900",
                        children: s.name
                      }),
                      e.jsx(a, {
                        variant: s.badgeColor,
                        size: "sm",
                        children: s.badge
                      })
                    ]
                  }),
                  e.jsx("p", {
                    className: "text-xs text-slate-500 leading-relaxed",
                    children: s.description
                  }),
                  e.jsxs("div", {
                    className: "pt-4 pb-3 border-y border-slate-100 flex items-baseline gap-1.5",
                    children: [
                      e.jsx("span", {
                        className: "text-3xl sm:text-4xl font-black text-slate-900 tracking-tight font-mono",
                        children: s.priceTomans
                      }),
                      e.jsxs("span", {
                        className: "text-xs text-slate-500 font-bold",
                        children: ["تومان / ", s.period]
                      })
                    ]
                  }),
                  e.jsx("ul", {
                    className: "space-y-3 pt-2 text-xs sm:text-sm text-slate-700",
                    children: s.features.map((feat, idx) =>
                      e.jsxs("li", {
                        className: "flex items-start gap-2.5",
                        children: [
                          e.jsx(m, {
                            className: "w-4 h-4 text-emerald-600 shrink-0 mt-0.5"
                          }),
                          e.jsx("span", { className: "leading-relaxed", children: feat })
                        ]
                      }, idx)
                    )
                  })
                ]
              }),
              e.jsxs("div", {
                className: "pt-6 mt-6 border-t border-slate-100 space-y-2.5",
                children: [
                  e.jsxs("a", {
                    href: telegramUrl,
                    target: "_blank",
                    rel: "noopener noreferrer",
                    className: "w-full py-3.5 px-4 rounded-2xl " +
                      (s.isPopular
                        ? "bg-[#3C0E11] hover:bg-[#250608] text-white shadow-md shadow-[#3C0E11]/20"
                        : "bg-slate-900 hover:bg-slate-800 text-white") +
                      " font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer",
                    children: [
                      e.jsx("span", {
                        children: s.isPopular
                          ? "پرداخت و ثبت‌نام در تلگرام (@caffeineelite) ←"
                          : "ثبت‌نام طرح ۱ ماهه در تلگرام (@caffeineelite) ←"
                      })
                    ]
                  }),
                  e.jsx("p", {
                    className: "text-[11px] text-center text-slate-400 font-medium",
                    children: "فعال‌سازی آنی پس از ارسال پیام به آیدی @caffeineelite"
                  })
                ]
              })
            ]
          }, s.id)
        )
      })
    ]
  });
};

export { N as ConsultingSection };
