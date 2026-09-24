// Clean standalone component definition for Fa with Collapsible Desktop Left Sidebar + Mobile Dock
const React = require('react');

module.exports = function getFaCode() {
  return `Fa=({currentView:t,currentUserRole:s,onNavigate:a,onOpenAuth:n,activePortalTab:r="overview",onPortalTabChange:i})=>{
    const[l,d]=c.useState(!1),
      [y,f]=c.useState(0),
      w=c.useRef(null),
      [isLoggedIn,setIsLoggedIn]=c.useState(()=>{
        try{
          const hS=Boolean(localStorage.getItem(ks)||localStorage.getItem("caffeine_current_user")||localStorage.getItem("caffeine_access_token")||localStorage.getItem("caffeine_auth_token_v1")),
            hR=Boolean(s&&s!=="guest");
          return hS||hR;
        }catch(e){
          return Boolean(s&&s!=="guest");
        }
      }),
      [isCollapsed,setIsCollapsed]=c.useState(()=>{
        try{
          return localStorage.getItem("caffeine_desktop_sidebar_collapsed")==="true";
        }catch(e){
          return!1;
        }
      });

    c.useEffect(()=>{
      const applyState=(cl)=>{
        try{
          if(cl){
            document.body&&document.body.classList.add("caffeine-sidebar-collapsed");
            document.documentElement.classList.add("caffeine-sidebar-collapsed");
          }else{
            document.body&&document.body.classList.remove("caffeine-sidebar-collapsed");
            document.documentElement.classList.remove("caffeine-sidebar-collapsed");
          }
        }catch(e){}
      };
      applyState(isCollapsed);

      const onToggle=()=>{
        setIsCollapsed(pr=>{
          const nx=!pr;
          try{localStorage.setItem("caffeine_desktop_sidebar_collapsed",String(nx))}catch(e){}
          applyState(nx);
          return nx;
        });
      };

      const onKey=(M)=>{
        if((M.ctrlKey||M.metaKey)&&(M.key==="b"||M.key==="B")){
          M.preventDefault();
          onToggle();
        }
      };

      window.addEventListener("caffeine:toggle_sidebar",onToggle);
      window.addEventListener("keydown",onKey);
      return()=>{
        window.removeEventListener("caffeine:toggle_sidebar",onToggle);
        window.removeEventListener("keydown",onKey);
      };
    },[isCollapsed]);

    const toggleSidebar=()=>{
      setIsCollapsed(pr=>{
        const nx=!pr;
        try{localStorage.setItem("caffeine_desktop_sidebar_collapsed",String(nx))}catch(e){}
        return nx;
      });
    };

    c.useEffect(()=>{
      const check=()=>{
        try{
          const hS=Boolean(localStorage.getItem(ks)||localStorage.getItem("caffeine_current_user")||localStorage.getItem("caffeine_access_token")||localStorage.getItem("caffeine_auth_token_v1")),
            hR=Boolean(s&&s!=="guest");
          setIsLoggedIn(hS||hR);
        }catch(e){
          setIsLoggedIn(Boolean(s&&s!=="guest"));
        }
      };
      check();
      window.addEventListener(Ge,check);
      window.addEventListener("storage",check);
      return()=>{
        window.removeEventListener(Ge,check);
        window.removeEventListener("storage",check);
      };
    },[s]);

    c.useEffect(()=>{
      const u=()=>{
        try{
          const A=it.getUnreadCount("room-general");
          f(A);
        }catch(e){
          f(0);
        }
      };
      u();
      const M=setInterval(u,4e3);
      return()=>clearInterval(M);
    },[]);

    c.useEffect(()=>{
      const u=M=>{
        w.current&&!w.current.contains(M.target)&&d(!1);
      };
      return l&&(document.addEventListener("mousedown",u),document.addEventListener("touchstart",u,{passive:!0})),()=>{
        document.removeEventListener("mousedown",u);
        document.removeEventListener("touchstart",u);
      };
    },[l]);

    c.useEffect(()=>{
      d(!1);
    },[t]);

    const k=()=>{
      switch(s){
        case"student":return"student-portal";
        case"advisor":return"advisor-portal";
        case"parent":return"parent-portal";
        case"admin":return"admin-crm";
        default:return null;
      }
    },
    b=()=>{
      const u=isLoggedIn?k():null;
      u?a(u):n();
    },
    N=["student-portal","advisor-portal","parent-portal","admin-portal","admin-crm"].includes(t),
    v=(u=>{
      switch(u){
        case"student-portal":
          return{title:"پنل دانش‌آموز",tabs:[{id:"overview",label:"داشبورد",icon:js},{id:"daily-report",label:"گزارش‌کار",icon:Zs},{id:"study-plan",label:"برنامه",icon:Mt},{id:"chat",label:"تالار گفتگو",icon:xe},{id:"monthly-report",label:"کارنامه ماهانه",icon:Ae},{id:"exam-analysis",label:"آزمون‌ها",icon:Be},{id:"forest",label:"کافه باریستا",icon:os},{id:"my-reviews",label:"دیدگاه‌ها",icon:Ee}]};
        case"parent-portal":
          return{title:"پنل اولیاء",tabs:[{id:"overview",label:"داشبورد",icon:He},{id:"reports",label:"گزارش‌ها",icon:Ks},{id:"sms",label:"هشدارها",icon:xe},{id:"meetings",label:"جلسات",icon:Mt},{id:"finance",label:"امور مالی",icon:ns},{id:"guidance",label:"راهنما",icon:nt}]};
        case"advisor-portal":
          return{title:"پنل مشاور",tabs:[{id:"coffee-plan",label:"برنامه Coffee",icon:os,badge:"جدید"},{id:"roster",label:"داوطلبان",icon:ke},{id:"pending-reports",label:"گزارش‌ها",icon:ws},{id:"chat",label:"تالار گفتگو",icon:xe},{id:"monthly-reports",label:"کارنامه‌ها",icon:Ae},{id:"exams",label:"آزمون‌ها",icon:Be},{id:"magazine",label:"مقالات",icon:Fe},{id:"confidential-notes",label:"محرمانه",icon:He},{id:"student-reviews",label:"دیدگاه‌ها",icon:Ee}]};
        case"admin-crm":
        case"admin-portal":
          return{title:"پنل مدیریت",tabs:[{id:"overview",label:"داشبورد",icon:Re},{id:"pipeline",label:"سرنخ‌ها",icon:ke},{id:"students",label:"دانش‌آموزان",icon:je},{id:"advisors",label:"مشاوران",icon:Ae},{id:"exams",label:"آزمون‌ها",icon:Be},{id:"finance",label:"مالی",icon:ns},{id:"ai-system",label:"هوش مصنوعی",icon:ys},{id:"magazine",label:"مجله",icon:Fe},{id:"comments",label:"نظرات",icon:xe},{id:"atmosphere",label:"اتمسفر",icon:te},{id:"settings",label:"تنظیمات",icon:Xs}]};
        default:
          return{title:"",tabs:[]};
      }
    })(t),
    x=v.tabs.slice(0,4),
    C=v.tabs.slice(4),
    m=C.some(u=>u.id===r),
    h=C.find(u=>u.id===r);

    let curUser = null;
    try { curUser = ge(); } catch(e) {}

    return e.jsxs(e.Fragment,{children:[
      l&&e.jsx("div",{className:"fixed inset-0 z-40 bg-slate-950/45 backdrop-blur-xs transition-opacity animate-in fade-in lg:hidden",onClick:()=>d(!1),onTouchStart:()=>d(!1),"aria-hidden":"true"}),

      /* Mobile Bottom Dock (Hidden on lg+) */
      e.jsx("nav",{id:"mobile-bottom-dock","aria-label":"ناوبری سریع موبایل",className:"lg:hidden fixed bottom-0 inset-x-0 z-40 select-none bg-white/95 backdrop-blur-lg border-t border-[#E8DFD3] shadow-[0_-4px_24px_rgba(60,14,17,0.06)] pb-safe transition-all duration-300",children:N&&v.tabs.length>0?e.jsxs("div",{className:"relative",children:[
        l&&C.length>0&&e.jsxs("div",{ref:w,id:"portal-overflow-dropdown",className:"fixed bottom-0 inset-x-0 max-h-[80dvh] bg-white rounded-t-[28px] border-t border-[#E8DFD3] shadow-[0_-10px_40px_rgba(60,14,17,0.15)] p-4 pb-safe z-50 animate-in slide-in-from-bottom duration-250 flex flex-col",dir:"rtl",children:[
          e.jsx("div",{className:"w-12 h-1.5 rounded-full bg-slate-300 mx-auto mb-3 shrink-0"}),
          e.jsxs("div",{className:"flex items-center justify-between pb-3 mb-3 border-b border-slate-100 shrink-0",children:[
            e.jsxs("div",{className:"flex items-center gap-2",children:[
              e.jsx("span",{className:"w-2.5 h-2.5 rounded-full bg-[#3C0E11]"}),
              e.jsxs("span",{className:"text-xs font-black text-[#3C0E11]",children:["سایر امکانات و ماژول‌های ",v.title]})
            ]}),
            e.jsx("button",{type:"button",onClick:()=>d(!1),className:"w-7 h-7 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer","aria-label":"بستن",children:e.jsx(dt,{className:"w-4 h-4"})})
          ]}),
          e.jsx("div",{className:"grid grid-cols-2 gap-2 overflow-y-auto max-h-[50dvh] p-0.5 no-scrollbar",children:C.map(u=>{
            const M=u.icon,A=r===u.id;
            return e.jsxs("button",{key:u.id,type:"button",onClick:()=>{i?.(u.id);d(!1);window.scrollTo({top:0,behavior:"smooth"})},className:"flex items-center justify-between p-3 rounded-2xl text-xs font-bold transition-all text-right cursor-pointer min-h-[48px] active:scale-[0.98] "+(A?"bg-[#3C0E11] text-white shadow-md":"bg-[#F7F3EF] text-slate-800 hover:bg-[#EFE9E1] border border-[#E8DFD3]"),children:[
              e.jsxs("div",{className:"flex items-center gap-2 min-w-0",children:[
                e.jsx(M,{className:"w-4 h-4 shrink-0 "+(A?"text-[#C5A880]":"text-slate-600")}),
                e.jsx("span",{className:"truncate",children:u.label})
              ]}),
              u.badge&&e.jsx("span",{className:"text-[10px] px-1.5 py-0.5 rounded-md font-black shrink-0 "+(A?"bg-white/20 text-white":"bg-[#3C0E11] text-white"),children:u.badge})
            ]});
          })}),
          e.jsxs("div",{className:"mt-3 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 shrink-0",children:[
            e.jsxs("button",{type:"button",onClick:()=>{d(!1);a("home")},className:"py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer min-h-[44px]",children:[
              e.jsx(rs,{className:"w-4 h-4 text-slate-600"}),
              e.jsx("span",{children:"صفحه اصلی سایت"})
            ]}),
            e.jsxs("button",{type:"button",onClick:()=>{d(!1);a("chat")},className:"py-2.5 px-3 rounded-xl bg-[#F7F3EF] hover:bg-[#EFE9E1] text-[#3C0E11] text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-[#E8DFD3] min-h-[44px]",children:[
              e.jsx(xe,{className:"w-4 h-4 text-[#C5A880]"}),
              e.jsx("span",{children:"تالار گفتگو"})
            ]})
          ]})
        ]}),
        e.jsxs("div",{id:"portal-single-bottom-bar",className:"max-w-md mx-auto grid grid-cols-5 items-center px-1.5 py-1.5",dir:"rtl",children:[
          x.map(u=>{
            const M=u.icon,A=r===u.id;
            return e.jsxs("button",{key:u.id,type:"button",onClick:()=>{d(!1);i?.(u.id);window.scrollTo({top:0,behavior:"smooth"})},className:"relative flex flex-col items-center justify-center min-h-[50px] py-1 px-1 rounded-2xl transition-all cursor-pointer active:scale-90 hover:bg-[#F7F3EF]/70 "+(A?"text-[#3C0E11] font-black bg-[#3C0E11]/5":"text-slate-500 hover:text-slate-900 font-medium"),children:[
              e.jsxs("div",{className:"relative",children:[
                e.jsx(M,{className:"w-5 h-5 mb-0.5 transition-transform "+(A?"scale-115 text-[#3C0E11]":"text-slate-500")}),
                u.id==="chat"&&y>0&&e.jsx("span",{className:"absolute -top-1 -right-1.5 w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-white"})
              ]}),
              e.jsx("span",{className:"text-[10px] leading-tight truncate w-full text-center tracking-tight",children:u.label}),
              A&&e.jsx("span",{className:"w-1.5 h-1.5 rounded-full bg-[#3C0E11] mt-0.5"})
            ]});
          }),
          e.jsxs("button",{type:"button",onClick:()=>d(u=>!u),className:"relative flex flex-col items-center justify-center min-h-[50px] py-1 px-1 rounded-2xl transition-all cursor-pointer active:scale-90 hover:bg-[#F7F3EF]/70 "+(m||l?"text-[#3C0E11] font-black bg-[#3C0E11]/5":"text-slate-500 hover:text-slate-900 font-medium"),children:[
            e.jsxs("div",{className:"flex items-center justify-center gap-0.5",children:[
              e.jsx(Ys,{className:"w-5 h-5 mb-0.5 transition-transform "+(m||l?"scale-115 text-[#3C0E11]":"text-slate-500")}),
              e.jsx(at,{className:"w-2.5 h-2.5 transition-transform "+(l?"rotate-180 text-[#3C0E11]":"text-slate-400")})
            ]}),
            e.jsx("span",{className:"text-[10px] leading-tight truncate w-full text-center tracking-tight",children:m&&h?h.label:"سایر"}),
            (m||l)&&e.jsx("span",{className:"w-1.5 h-1.5 rounded-full bg-[#3C0E11] mt-0.5"})
          ]})
        ]})
      ]}):e.jsxs("div",{className:"max-w-md mx-auto grid grid-cols-5 items-center px-1.5 py-1.5",dir:"rtl",children:[
        e.jsxs("button",{type:"button",onClick:()=>{a("home");window.scrollTo({top:0,behavior:"smooth"})},className:"flex flex-col items-center justify-center min-h-[50px] py-1 px-1 rounded-2xl transition-all cursor-pointer active:scale-90 hover:bg-[#F7F3EF]/70 "+(t==="home"?"text-[#3C0E11] font-black bg-[#3C0E11]/5":"text-slate-500 hover:text-slate-900 font-medium"),children:[
          e.jsx(rs,{className:"w-5 h-5 mb-0.5 transition-transform "+(t==="home"?"scale-115 text-[#3C0E11]":"text-slate-500")}),
          e.jsx("span",{className:"text-[10px] leading-tight tracking-tight",children:"خانه"}),
          t==="home"&&e.jsx("span",{className:"w-1.5 h-1.5 rounded-full bg-[#3C0E11] mt-0.5"})
        ]}),
        e.jsxs("button",{type:"button",onClick:()=>{a("tools");window.scrollTo({top:0,behavior:"smooth"})},className:"flex flex-col items-center justify-center min-h-[50px] py-1 px-1 rounded-2xl transition-all cursor-pointer active:scale-90 hover:bg-[#F7F3EF]/70 "+(t==="tools"?"text-[#3C0E11] font-black bg-[#3C0E11]/5":"text-slate-500 hover:text-slate-900 font-medium"),children:[
          e.jsx(Ws,{className:"w-5 h-5 mb-0.5 transition-transform "+(t==="tools"?"scale-115 text-[#3C0E11]":"text-slate-500")}),
          e.jsx("span",{className:"text-[10px] leading-tight tracking-tight",children:"ابزارها"}),
          t==="tools"&&e.jsx("span",{className:"w-1.5 h-1.5 rounded-full bg-[#3C0E11] mt-0.5"})
        ]}),
        e.jsxs("button",{type:"button",onClick:()=>{a("chat");window.scrollTo({top:0,behavior:"smooth"})},className:"relative flex flex-col items-center justify-center min-h-[50px] py-1 px-1 rounded-2xl transition-all cursor-pointer active:scale-90 hover:bg-[#F7F3EF]/70 "+(t==="chat"?"text-[#3C0E11] font-black bg-[#3C0E11]/5":"text-slate-500 hover:text-slate-900 font-medium"),children:[
          e.jsxs("div",{className:"relative",children:[
            e.jsx(xe,{className:"w-5 h-5 mb-0.5 transition-transform "+(t==="chat"?"scale-115 text-[#3C0E11]":"text-slate-500")}),
            y>0&&e.jsx("span",{className:"absolute -top-1 -right-1.5 w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-white animate-pulse"})
          ]}),
          e.jsx("span",{className:"text-[10px] leading-tight tracking-tight",children:"تالار گفتگو"}),
          t==="chat"&&e.jsx("span",{className:"w-1.5 h-1.5 rounded-full bg-[#3C0E11] mt-0.5"})
        ]}),
        e.jsxs("button",{type:"button",onClick:()=>{a("magazine");window.scrollTo({top:0,behavior:"smooth"})},className:"flex flex-col items-center justify-center min-h-[50px] py-1 px-1 rounded-2xl transition-all cursor-pointer active:scale-90 hover:bg-[#F7F3EF]/70 "+(t==="magazine"?"text-[#3C0E11] font-black bg-[#3C0E11]/5":"text-slate-500 hover:text-slate-900 font-medium"),children:[
          e.jsx(Fe,{className:"w-5 h-5 mb-0.5 transition-transform "+(t==="magazine"?"scale-115 text-[#3C0E11]":"text-slate-500")}),
          e.jsx("span",{className:"text-[10px] leading-tight tracking-tight",children:"مجله کنکور"}),
          t==="magazine"&&e.jsx("span",{className:"w-1.5 h-1.5 rounded-full bg-[#3C0E11] mt-0.5"})
        ]}),
        e.jsxs("button",{type:"button",onClick:b,className:"flex flex-col items-center justify-center min-h-[50px] py-1 px-1 rounded-2xl transition-all cursor-pointer active:scale-90 hover:bg-[#F7F3EF]/70 "+(N?"text-[#3C0E11] font-black bg-[#3C0E11]/5":"text-slate-500 hover:text-slate-900 font-medium"),children:[
          N?e.jsx(Re,{className:"w-5 h-5 mb-0.5 scale-115 text-[#3C0E11]"}):e.jsx(vs,{className:"w-5 h-5 mb-0.5 text-slate-500"}),
          e.jsx("span",{className:"text-[10px] leading-tight tracking-tight",children:isLoggedIn?"پرتال من":"ورود"}),
          N&&e.jsx("span",{className:"w-1.5 h-1.5 rounded-full bg-[#3C0E11] mt-0.5"})
        ]})
      ]})}),

      /* Desktop Left Sidebar (Collapsible, Visible on lg+) */
      e.jsxs("aside",{id:"desktop-left-sidebar","aria-label":"ناوبری سایدبار چپ دسکتاپ کافئین",className:"hidden lg:flex fixed left-0 top-0 bottom-0 w-64 bg-white/95 backdrop-blur-xl border-r border-[#E8DFD3] shadow-[4px_0_24px_rgba(60,14,17,0.06)] z-40 flex-col justify-between select-none",dir:"rtl",children:[
        
        /* Persistent Toggle Handle attached to the right border (remains sticking out when collapsed) */
        e.jsx("button",{
          type:"button",
          id:"desktop-sidebar-toggle-handle",
          onClick:toggleSidebar,
          title:isCollapsed?"باز کردن سایدبار (Ctrl+B)":"بستن سایدبار (Ctrl+B)",
          "aria-label":isCollapsed?"باز کردن سایدبار":"بستن سایدبار",
          className:"absolute top-20 left-full -ml-[1px] z-50 flex items-center justify-center w-7 h-14 rounded-r-xl bg-white/95 backdrop-blur-md border border-l-0 border-[#E8DFD3] shadow-[3px_2px_12px_rgba(60,14,17,0.10)] hover:shadow-[4px_4px_18px_rgba(60,14,17,0.18)] hover:bg-[#FAF7F2] hover:border-[#C5A880] text-slate-500 hover:text-[#3C0E11] transition-all duration-200 cursor-pointer group active:scale-95",
          children:e.jsx("svg",{
            className:"w-4 h-4 text-slate-500 group-hover:text-[#3C0E11] transition-transform duration-200 group-hover:scale-115",
            viewBox:"0 0 24 24",
            fill:"none",
            stroke:"currentColor",
            strokeWidth:"2.5",
            strokeLinecap:"round",
            strokeLinejoin:"round",
            children:e.jsx("path",{d:isCollapsed?"m9 18 6-6-6-6":"m15 18-6-6 6-6"})
          })
        }),

        e.jsxs("div",{className:"p-3.5 border-b border-[#E8DFD3]/80 shrink-0 flex items-center justify-between gap-2",children:[
          e.jsxs("div",{onClick:()=>{a("home");window.scrollTo({top:0,behavior:"smooth"})},className:"group flex items-center gap-2.5 cursor-pointer p-1 rounded-2xl hover:bg-[#F7F3EF] transition-all min-w-0 flex-1",children:[
            e.jsx("div",{className:"w-9 h-9 bg-[#3C0E11] rounded-xl flex items-center justify-center text-white shadow-sm shadow-[#3C0E11]/20 group-hover:scale-105 transition-transform border border-[#C5A880]/30 shrink-0",children:e.jsx(ct,{color:"#FFFFFF",className:"w-4 h-4"})}),
            e.jsxs("div",{className:"min-w-0 flex-1 text-right",children:[
              e.jsx("span",{className:"font-brand font-bold text-sm text-[#3C0E11] block leading-tight tracking-wide truncate",children:N?v.title:"CAFFEINE ELITE"}),
              e.jsx("span",{className:"text-[10px] text-slate-500 font-medium block leading-tight truncate mt-0.5",children:N?(s==="student"?"پرتال دانش‌آموز":s==="advisor"?"پرتال مشاور":s==="parent"?"پرتال اولیاء":"پنل مدیریت"):"سیستم عامل کنکور"})
            ]})
          ]})
        ]}),

        e.jsx("div",{className:"flex-1 overflow-y-auto px-3 py-3 space-y-1 no-scrollbar",children:N&&v.tabs.length>0?e.jsxs("div",{className:"space-y-1",children:[
          e.jsx("div",{className:"px-3 py-1.5 text-[11px] font-black text-slate-400 tracking-wider",children:"امکانات پرتال"}),
          v.tabs.map(u=>{
            const M=u.icon,isActive=r===u.id;
            return e.jsxs("button",{key:u.id,type:"button",onClick:()=>{i?.(u.id);window.scrollTo({top:0,behavior:"smooth"})},className:"w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-right cursor-pointer min-h-[42px] "+(isActive?"bg-[#3C0E11] text-white shadow-sm":"text-slate-600 hover:text-[#3C0E11] hover:bg-[#F7F3EF]"),children:[
              e.jsxs("div",{className:"flex items-center gap-2.5 min-w-0",children:[
                e.jsx(M,{className:"w-4 h-4 shrink-0 "+(isActive?"text-[#C5A880]":"text-slate-500")}),
                e.jsx("span",{className:"truncate",children:u.label})
              ]}),
              u.badge?e.jsx("span",{className:"text-[10px] px-1.5 py-0.2 rounded-md font-black shrink-0 "+(isActive?"bg-white/20 text-white":"bg-[#3C0E11] text-white"),children:u.badge}):u.id==="chat"&&y>0?e.jsx("span",{className:"w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white animate-pulse"}):isActive?e.jsx("span",{className:"w-1.5 h-1.5 rounded-full bg-[#C5A880]"}):null
            ]});
          }),
          e.jsx("div",{className:"my-2 border-t border-slate-100"}),
          e.jsxs("button",{type:"button",onClick:()=>{a("home");window.scrollTo({top:0,behavior:"smooth"})},className:"w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-[#F7F3EF] hover:text-[#3C0E11] transition-colors cursor-pointer",children:[
            e.jsx(rs,{className:"w-4 h-4 text-slate-400"}),
            e.jsx("span",{children:"صفحه اصلی سایت"})
          ]}),
          e.jsxs("button",{type:"button",onClick:()=>{a("chat");window.scrollTo({top:0,behavior:"smooth"})},className:"w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-[#F7F3EF] hover:text-[#3C0E11] transition-colors cursor-pointer",children:[
            e.jsxs("div",{className:"flex items-center gap-2.5",children:[
              e.jsx(xe,{className:"w-4 h-4 text-slate-400"}),
              e.jsx("span",{children:"تالار گفتگو"})
            ]}),
            y>0&&e.jsxs("span",{className:"text-[10px] px-1.5 py-0.2 rounded-full bg-rose-500 text-white font-bold",children:[y," پیام"]})
          ]})
        ]}):e.jsxs("div",{className:"space-y-1",children:[
          e.jsx("div",{className:"px-3 py-1.5 text-[11px] font-black text-slate-400 tracking-wider",children:"ناوبری اصلی"}),
          e.jsxs("button",{type:"button",onClick:()=>{a("home");window.scrollTo({top:0,behavior:"smooth"})},className:"w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-right cursor-pointer min-h-[42px] "+(t==="home"?"bg-[#3C0E11] text-white shadow-sm":"text-slate-600 hover:text-[#3C0E11] hover:bg-[#F7F3EF]"),children:[
            e.jsxs("div",{className:"flex items-center gap-2.5",children:[
              e.jsx(rs,{className:"w-4 h-4 shrink-0 "+(t==="home"?"text-[#C5A880]":"text-slate-500")}),
              e.jsx("span",{children:"صفحه اصلی"})
            ]}),
            t==="home"&&e.jsx("span",{className:"w-1.5 h-1.5 rounded-full bg-[#C5A880]"})
          ]}),
          e.jsxs("button",{type:"button",onClick:()=>{a("assessment");window.scrollTo({top:0,behavior:"smooth"})},className:"w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-right cursor-pointer min-h-[42px] "+(t==="assessment"?"bg-[#3C0E11] text-white shadow-sm":"text-slate-600 hover:text-[#3C0E11] hover:bg-[#F7F3EF]"),children:[
            e.jsxs("div",{className:"flex items-center gap-2.5",children:[
              e.jsx(te,{className:"w-4 h-4 shrink-0 "+(t==="assessment"?"text-[#C5A880]":"text-amber-600")}),
              e.jsx("span",{children:"ارزیابی هوشمند ۲ دقیقه‌ای"})
            ]}),
            e.jsx("span",{className:"text-[10px] px-1.5 py-0.2 rounded-md font-bold "+(t==="assessment"?"bg-white/20 text-white":"bg-amber-100 text-amber-800"),children:"رایگان"})
          ]}),
          e.jsxs("button",{type:"button",onClick:()=>{a("tools");window.scrollTo({top:0,behavior:"smooth"})},className:"w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-right cursor-pointer min-h-[42px] "+(t==="tools"?"bg-[#3C0E11] text-white shadow-sm":"text-slate-600 hover:text-[#3C0E11] hover:bg-[#F7F3EF]"),children:[
            e.jsxs("div",{className:"flex items-center gap-2.5",children:[
              e.jsx(Ws,{className:"w-4 h-4 shrink-0 "+(t==="tools"?"text-[#C5A880]":"text-slate-500")}),
              e.jsx("span",{children:"جعبه ابزار کنکور"})
            ]}),
            t==="tools"&&e.jsx("span",{className:"w-1.5 h-1.5 rounded-full bg-[#C5A880]"})
          ]}),
          e.jsxs("button",{type:"button",onClick:()=>{a("admission-ranks");window.scrollTo({top:0,behavior:"smooth"})},className:"w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-right cursor-pointer min-h-[42px] "+(t==="admission-ranks"?"bg-[#3C0E11] text-white shadow-sm":"text-slate-600 hover:text-[#3C0E11] hover:bg-[#F7F3EF]"),children:[
            e.jsxs("div",{className:"flex items-center gap-2.5",children:[
              e.jsx(Ae,{className:"w-4 h-4 shrink-0 "+(t==="admission-ranks"?"text-[#C5A880]":"text-slate-500")}),
              e.jsx("span",{children:"بانک کارنامه‌ها و قبولی‌ها"})
            ]}),
            t==="admission-ranks"&&e.jsx("span",{className:"w-1.5 h-1.5 rounded-full bg-[#C5A880]"})
          ]}),
          e.jsxs("button",{type:"button",onClick:()=>{a("chat");window.scrollTo({top:0,behavior:"smooth"})},className:"w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-right cursor-pointer min-h-[42px] "+(t==="chat"?"bg-[#3C0E11] text-white shadow-sm":"text-slate-600 hover:text-[#3C0E11] hover:bg-[#F7F3EF]"),children:[
            e.jsxs("div",{className:"flex items-center gap-2.5",children:[
              e.jsx(xe,{className:"w-4 h-4 shrink-0 "+(t==="chat"?"text-[#C5A880]":"text-slate-500")}),
              e.jsx("span",{children:"تالارهای گفتگوی آنلاین"})
            ]}),
            y>0?e.jsxs("span",{className:"text-[10px] px-1.5 py-0.2 rounded-full bg-rose-500 text-white font-bold animate-pulse",children:[y," جدید"]}):e.jsx("span",{className:"w-2 h-2 rounded-full bg-emerald-500"})
          ]}),
          e.jsxs("button",{type:"button",onClick:()=>{a("magazine");window.scrollTo({top:0,behavior:"smooth"})},className:"w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-right cursor-pointer min-h-[42px] "+(t==="magazine"?"bg-[#3C0E11] text-white shadow-sm":"text-slate-600 hover:text-[#3C0E11] hover:bg-[#F7F3EF]"),children:[
            e.jsxs("div",{className:"flex items-center gap-2.5",children:[
              e.jsx(Fe,{className:"w-4 h-4 shrink-0 "+(t==="magazine"?"text-[#C5A880]":"text-slate-500")}),
              e.jsx("span",{children:"مجله تحلیلی و مقالات"})
            ]}),
            t==="magazine"&&e.jsx("span",{className:"w-1.5 h-1.5 rounded-full bg-[#C5A880]"})
          ]}),
          e.jsxs("button",{type:"button",onClick:()=>{a("konkur-hub");window.scrollTo({top:0,behavior:"smooth"})},className:"w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-right cursor-pointer min-h-[42px] "+(t==="konkur-hub"?"bg-[#3C0E11] text-white shadow-sm":"text-slate-600 hover:text-[#3C0E11] hover:bg-[#F7F3EF]"),children:[
            e.jsxs("div",{className:"flex items-center gap-2.5",children:[
              e.jsx(je,{className:"w-4 h-4 shrink-0 "+(t==="konkur-hub"?"text-[#C5A880]":"text-slate-500")}),
              e.jsx("span",{children:"پورتال کنکور سراسری"})
            ]}),
            t==="konkur-hub"&&e.jsx("span",{className:"w-1.5 h-1.5 rounded-full bg-[#C5A880]"})
          ]}),
          e.jsxs("button",{type:"button",onClick:()=>{a("elite");window.scrollTo({top:0,behavior:"smooth"})},className:"w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-black transition-all text-right cursor-pointer min-h-[42px] "+(t==="elite"||t==="caffeine-elite"?"bg-[#3C0E11] text-[#C5A880] shadow-sm":"text-[#8E2800] hover:text-[#3C0E11] hover:bg-[#FAF7F2]"),children:[
            e.jsxs("div",{className:"flex items-center gap-2.5",children:[
              e.jsx(te,{className:"w-4 h-4 shrink-0 text-[#C5A880]"}),
              e.jsx("span",{children:"طرح مشاوره خصوصی Elite"})
            ]}),
            e.jsx("span",{className:"text-[10px] px-1.5 py-0.2 rounded-md bg-[#3C0E11] text-[#C5A880] font-mono font-bold",children:"VIP"})
          ]})
        ]})}),

        e.jsx("div",{className:"p-3 border-t border-[#E8DFD3]/80 bg-[#FAF7F2]/60 shrink-0",children:isLoggedIn?e.jsxs("div",{className:"space-y-2",children:[
          e.jsxs("div",{onClick:b,className:"flex items-center gap-2.5 p-2 rounded-xl bg-white border border-[#E8DFD3] hover:border-[#C5A880] transition-colors cursor-pointer shadow-2xs group",children:[
            e.jsx("div",{className:"w-9 h-9 rounded-xl overflow-hidden bg-[#3C0E11] text-white flex items-center justify-center font-bold text-xs shrink-0 border border-white shadow-2xs group-hover:scale-105 transition-transform",children:curUser?.avatar?e.jsx("img",{src:curUser.avatar,alt:"User",className:"w-full h-full object-cover",referrerPolicy:"no-referrer"}):e.jsx("span",{children:curUser?.name?curUser.name.slice(0,2):"ک"})}),
            e.jsxs("div",{className:"min-w-0 flex-1 text-right",children:[
              e.jsx("span",{className:"text-xs font-black text-slate-900 block truncate",children:curUser?.name||"کاربر کافئین"}),
              e.jsx("span",{className:"text-[10px] text-[#C5A880] font-bold block truncate mt-0.5",children:s==="student"?"داوطلب کنکور":s==="advisor"?"مشاور ارشد":s==="parent"?"ولی دانش‌آموز":"مدیر سیستم"})
            ]}),
            e.jsx("span",{className:"text-slate-400 group-hover:text-[#3C0E11] text-xs font-bold font-mono",children:"←"})
          ]}),
          e.jsxs("div",{className:"flex items-center gap-1.5",children:[
            e.jsx("button",{type:"button",onClick:b,className:"flex-1 py-1.5 px-2 rounded-lg bg-[#3C0E11] hover:bg-[#28080A] text-white text-[11px] font-bold text-center transition-colors cursor-pointer",children:"مشاهده پرتال"}),
            e.jsx("button",{type:"button",onClick:()=>ya(),className:"py-1.5 px-2.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 text-[11px] font-bold text-center transition-colors cursor-pointer",children:"خروج"})
          ]})
        ]}):e.jsxs("div",{className:"space-y-2",children:[
          e.jsxs("button",{type:"button",onClick:n,className:"w-full py-2.5 px-3 rounded-xl bg-[#3C0E11] hover:bg-[#28080A] text-white text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer active:scale-98",children:[
            e.jsx(vs,{className:"w-4 h-4 text-[#C5A880]"}),
            e.jsx("span",{children:"ورود / عضویت در سامانه"})
          ]}),
          e.jsx("p",{className:"text-[10px] text-slate-400 text-center leading-tight",children:"دسترسی به پرتال، گزارش‌ها و ابزارها"})
        ]})})
      ]})
    ]});
  },`;
};
