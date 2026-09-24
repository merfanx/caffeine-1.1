import{r as n,j as e,S as ce,l as ne,B as xe,x as je,ah as ue,ai as re,J as fe,aj as Ne,ak as me,a1 as he,al as ve,am as we,o as ye,A as Q,an as ke,a2 as Se,G as ie,W as Ce,e as Me,n as pe}from"./vendor-react-AAJfNG8R.js";import{P as J,a as z,U as G,M as P}from"./index-CvuvcUm9.js";import{g as Re}from"./aiGateway-B6J2Luyc.js";import{R as le,K as be,e as Te,g as Ae,F as Z,c as Ie}from"./tarazEstimationEngine-ChF54Mnh.js";
const _lc=(v)=>v==null?"":String(v).toLowerCase();
import"./vendor-katex-BEwRSR0t.js";const Ee=({onNavigate:D,onLeadCaptured:V})=>{const[p,j]=n.useState("experimental"),[N,$]=n.useState("region1"),[b,X]=n.useState("ordibehesht"),[q,oe]=n.useState("50-50"),[Y,ee]=n.useState("19.45"),[w,se]=n.useState("quick-gpa"),[R,B]=n.useState({fa3:19.25,dini3:19.5,eng3:18.75,arab3:19,health:19.5,social:19,bio3:19,chem3:18.5,math3:18.25,phys3:18.5}),[g,u]=n.useState("calculator"),[H,K]=n.useState(null),[y,O]=n.useState(""),[k,T]=n.useState("all"),[S,A]=n.useState("all"),[C,_]=n.useState("all"),[f,U]=n.useState("all"),[I,v]=n.useState({bio:{code:"bio",inputMode:"percentage",percentage:72,correctAnswers:34,wrongAnswers:4,unanswered:7},chem:{code:"chem",inputMode:"percentage",percentage:65,correctAnswers:24,wrongAnswers:3,unanswered:8},phys:{code:"phys",inputMode:"percentage",percentage:58,correctAnswers:18,wrongAnswers:2,unanswered:10},math_exp:{code:"math_exp",inputMode:"percentage",percentage:52,correctAnswers:16,wrongAnswers:2,unanswered:12},geo:{code:"geo",inputMode:"percentage",percentage:40,correctAnswers:6,wrongAnswers:0,unanswered:9}}),M=le[p][b],E=Z[p]||Z.experimental,L=n.useMemo(()=>be.filter(s=>{if(k!=="all"&&s.group!==k||S!=="all"&&s.region!==S||C!=="all"&&s.year.toString()!==C||f==="above-11000"&&s.totalTaraz<11e3||f==="10000-11000"&&(s.totalTaraz<1e4||s.totalTaraz>=11e3)||f==="9000-10000"&&(s.totalTaraz<9e3||s.totalTaraz>=1e4)||f==="below-9000"&&s.totalTaraz>=9e3)return!1;if(y.trim()){const a=_lc(y.trim()),i=_lc(s.admittedMajor).includes(a),r=_lc(s.admittedUniversity).includes(a),l=_lc(s.city).includes(a),m=s.studentName?.toLowerCase().includes(a);if(!i&&!r&&!l&&!m)return!1}return!0}),[k,S,C,f,y]),te=s=>{j(s.group),$(s.region),s.gpa&&ee(s.gpa.toString());const a=le[s.group][b],i={};Object.keys(a).forEach(r=>{const l=a[r].questionCount,m=s.percentages[r]!==void 0?s.percentages[r]:50,x=Math.max(0,Math.round(m/100*l)),h=Math.max(0,Math.round((l-x)*.2)),F=Math.max(0,l-(x+h));i[r]={code:r,inputMode:"percentage",percentage:m,correctAnswers:x,wrongAnswers:h,unanswered:F}}),v(i),K(s.id),setTimeout(()=>K(null),2e3),u("calculator")},ae=s=>{j(s);const a=le[s][b],i={};Object.keys(a).forEach(m=>{const x=a[m].questionCount;i[m]={code:m,inputMode:"percentage",percentage:55,correctAnswers:Math.round(x*.6),wrongAnswers:Math.round(x*.1),unanswered:Math.round(x*.3)}}),v(i);const r=Z[s]||Z.experimental,l={};Object.keys(r).forEach(m=>{l[m]=19}),B(l)},W=(s,a)=>{const i=M[s],r=i?i.questionCount:30,l=Math.max(-33.33,Math.min(100,a)),m=Math.max(0,Math.round(Math.max(0,l)/100*r)),x=Math.max(0,Math.round((r-m)*.2)),h=Math.max(0,r-(m+x));v(F=>({...F,[s]:{...F[s],code:s,percentage:l,correctAnswers:m,wrongAnswers:x,unanswered:h}}))},t=(s,a,i)=>{const r=M[s],l=r?r.questionCount:30,m=I[s]||{correctAnswers:0,wrongAnswers:0};let x=a==="correct"?Math.max(0,Math.min(l,i)):m.correctAnswers??0,h=a==="wrong"?Math.max(0,Math.min(l-x,i)):m.wrongAnswers??0;x+h>l&&(a==="correct"?h=l-x:x=l-h);const F=Math.max(0,l-(x+h)),ge=Ie(x,h,l);v(de=>({...de,[s]:{...de[s],code:s,correctAnswers:x,wrongAnswers:h,unanswered:F,percentage:ge}}))},d=s=>{v(a=>({...a,[s]:{...a[s],inputMode:a[s]?.inputMode==="details"?"percentage":"details"}}))},c=(s,a)=>{const i=Math.max(0,Math.min(20,a));B(r=>({...r,[s]:i}))},o=n.useMemo(()=>{const s=parseFloat(Y)||18;return Te({group:p,region:N,examPeriod:b,weightModel:q,inputs:I,finalExamInputMode:w,finalExamGpa:s,finalExamGrades:R})},[p,N,b,q,I,w,Y,R]);return e.jsxs("div",{id:"realistic-taraz-estimator",className:"space-y-8",children:[e.jsxs("div",{className:"bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden",children:[e.jsx("div",{className:"absolute top-0 left-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -translate-x-1/2 -translate-y-1/2"}),e.jsx("div",{className:"absolute bottom-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none translate-x-1/3 translate-y-1/3"}),e.jsxs("div",{className:"relative z-10 space-y-4 max-w-4xl",children:[e.jsxs("div",{className:"flex flex-wrap items-center gap-2",children:[e.jsxs("span",{className:"px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-black flex items-center gap-1.5",children:[e.jsx(ce,{className:"w-3.5 h-3.5"}),"موتور کالیبره‌شده سنجش (Empirical Engine)"]}),e.jsx("span",{className:"px-3 py-1 rounded-full bg-white/10 text-slate-300 text-xs font-medium border border-white/10",children:"داده‌های آماری واقعی کنکور ۱۴۰۲ و ۱۴۰۳"})]}),e.jsx("h1",{className:"text-2xl sm:text-4xl font-black tracking-tight leading-tight",children:"سامانه تخصصی تخمین تراز و رتبه واقعی کنکور"}),e.jsxs("p",{className:"text-xs sm:text-sm text-slate-300 leading-relaxed font-normal",children:["محاسبه دقیق نمره تراز استاندارد (",e.jsx("span",{className:"font-mono text-emerald-400",children:"T-Score"}),") به تفکیک سختی هر درس، میانگین کشوری، انحراف معیار، اعمال سوابق تحصیلی قطعی (امتحانات نهایی) و شبیه‌سازی رتبه در سهمیه مناطق ۱، ۲ و ۳."]}),e.jsxs("div",{className:"pt-2 flex items-center gap-2 border-t border-white/10 overflow-x-auto pb-1",children:[e.jsxs("button",{onClick:()=>u("calculator"),className:`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${g==="calculator"?"bg-indigo-600 text-white shadow-lg shadow-indigo-600/30":"bg-white/5 text-slate-300 hover:bg-white/10"}`,children:[e.jsx(ne,{className:"w-3.5 h-3.5"}),"محاسبه‌گر تراز و رتبه"]}),e.jsxs("button",{onClick:()=>u("kanoon"),className:`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${g==="kanoon"?"bg-emerald-600 text-white shadow-lg shadow-emerald-600/30":"bg-white/5 text-slate-300 hover:bg-white/10"}`,children:[e.jsx(xe,{className:"w-3.5 h-3.5"}),"بانک کارنامه‌های کانون (قلم‌چی) و سنجش"]}),e.jsxs("button",{onClick:()=>u("benchmarks"),className:`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${g==="benchmarks"?"bg-indigo-600 text-white shadow-lg shadow-indigo-600/30":"bg-white/5 text-slate-300 hover:bg-white/10"}`,children:[e.jsx(je,{className:"w-3.5 h-3.5"}),"جدول سختی و میانگین کشوری دروس"]}),e.jsxs("button",{onClick:()=>u("methodology"),className:`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${g==="methodology"?"bg-indigo-600 text-white shadow-lg shadow-indigo-600/30":"bg-white/5 text-slate-300 hover:bg-white/10"}`,children:[e.jsx(ue,{className:"w-3.5 h-3.5"}),"فرمول ریاضی و روان‌سنجی سنجش"]})]})]})]}),g==="methodology"&&e.jsxs("div",{className:"p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 space-y-6 animate-in fade-in",children:[e.jsxs("div",{className:"flex items-center gap-3",children:[e.jsx("div",{className:"w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold",children:e.jsx(re,{className:"w-5 h-5"})}),e.jsxs("div",{children:[e.jsx("h3",{className:"text-lg font-black text-slate-900",children:"سازوکار علمی و ریاضی کالیبراسیون تراز و رتبه (T-Score & Rank Modeling)"}),e.jsx("p",{className:"text-xs text-slate-500",children:"برگرفته از اصول روان‌سنجی آزمون‌های استاندارد کشوری و مدل‌سازی تجربی سازمان سنجش"})]})]}),e.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-3 gap-4 text-xs leading-relaxed text-slate-700",children:[e.jsxs("div",{className:"p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2",children:[e.jsx("span",{className:"font-bold text-indigo-700 block",children:"۱. نمره خام استاندارد درس‌به‌درس (Z-Score):"}),e.jsxs("p",{children:["درصد هر درس با میانگین کشوری (",e.jsx("span",{className:"font-mono",children:"μ"}),") مقایسه شده و بر انحراف معیار جامعه (",e.jsx("span",{className:"font-mono",children:"σ"}),") تقسیم می‌شود:"]}),e.jsx("div",{className:"p-2 rounded-lg bg-white border font-mono text-center text-slate-900 font-bold",children:"Z = (X - μ) / σ"}),e.jsx("p",{className:"text-slate-500 text-[11px]",children:"اگر درسی بسیار سخت باشد (میانگین پایین)، حتی درصد ۳۰ تراز بسیار بالاتری نسبت به یک درس آسان ایجاد می‌کند."})]}),e.jsxs("div",{className:"p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2",children:[e.jsx("span",{className:"font-bold text-indigo-700 block",children:"۲. تراز تفکیکی امتحانات نهایی دیپلم (سوابق):"}),e.jsx("p",{children:"به‌جای محاسبه تقریبی با یک معدل ساده، نمرات کتبی هر درس نهایی (فارسی، دینی، زبان، دروس تخصصی) جداگانه بر اساس میانگین کشوری آن درس در خرداد تراز شده و با ضرایب مصوب شورای سنجش تجمیع می‌گردد:"}),e.jsx("div",{className:"p-2 rounded-lg bg-white border font-mono text-center text-emerald-800 font-bold text-[11px]",children:"تراز نهایی = Σ(T_درس × ضریب_درس) / Σضرایب"}),e.jsx("p",{className:"text-slate-500 text-[11px]",children:"این متد مانع از خطای همگن‌سازی معدل شده و اثر سختی دروس نهایی مثل فارسی ۳ و سلامت را دقیقاً مدل می‌کند."})]}),e.jsxs("div",{className:"p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2",children:[e.jsx("span",{className:"font-bold text-indigo-700 block",children:"۳. تخمین رتبه پیوسته با تابع چگالی تجربی:"}),e.jsx("p",{children:"به‌جای تقسیم‌بندی‌های پله‌ای، رتبه سهمیه و کشوری از درون‌یابی توانی-لگاریتمی روی ۶۰+ نقطه لنگر تجربی (Empirical Rank Anchors) از کارنامه‌های واقعی کنکور محاسبه می‌شود."}),e.jsx("div",{className:"p-2 rounded-lg bg-white border font-mono text-center text-indigo-900 font-bold text-[11px]",children:"Rank = R1 × (R2 / R1) ^ ( (T1 - T) / (T1 - T2) )"}),e.jsx("p",{className:"text-slate-500 text-[11px]",children:"این تابع کاملاً یکنواخت و بدون پرش ناگهانی است و بازه عدم قطعیت (حداقل/حداکثر) را نیز ارائه می‌دهد."})]})]})]}),g==="kanoon"&&e.jsxs("div",{className:"space-y-6 animate-in fade-in",children:[e.jsxs("div",{className:"p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-6",children:[e.jsxs("div",{className:"flex flex-col sm:flex-row sm:items-center justify-between gap-4",children:[e.jsxs("div",{className:"space-y-1",children:[e.jsx("div",{className:"flex items-center gap-2",children:e.jsxs("span",{className:"px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-black flex items-center gap-1.5",children:[e.jsx(fe,{className:"w-3.5 h-3.5"}),"داده‌های رسمی و مستند کارنامه‌های کنکور سراسری و سازمان سنجش"]})}),e.jsx("h3",{className:"text-xl font-black text-slate-900",children:"بانک کارنامه‌های واقعی کنکور ۱۴۰۲، ۱۴۰۳ و ۱۴۰۴"}),e.jsx("p",{className:"text-xs text-slate-500",children:"استخراج‌شده از نتایج واقعی پذیرفته‌شدگان کنکور سراسری شامل درصدها، تراز کل، تراز سوابق، رتبه منطقه و رشته قبولی"})]}),e.jsxs("div",{className:"p-3 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center gap-3",children:[e.jsx("div",{className:"w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black text-xs",children:L.length}),e.jsxs("div",{children:[e.jsx("span",{className:"text-[10px] text-indigo-500 font-bold block",children:"کارنامه در دسترس"}),e.jsx("span",{className:"text-xs font-black text-indigo-900",children:"هم‌ترازسازی‌شده"})]})]})]}),e.jsxs("div",{className:"grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-4 border-t border-slate-100",children:[e.jsxs("div",{className:"relative",children:[e.jsx(Ne,{className:"w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2"}),e.jsx("input",{type:"text",value:y,onChange:s=>O(s.target.value),placeholder:"جستجوی رشته، دانشگاه، شهر یا رتبه...",className:"w-full pl-3 pr-9 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 placeholder:text-slate-400 bg-slate-50/50 focus:bg-white focus:border-indigo-500 outline-none"})]}),e.jsx("div",{children:e.jsxs("select",{value:k,onChange:s=>T(s.target.value),className:"w-full p-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 bg-white",children:[e.jsx("option",{value:"all",children:"همه گروه‌ها (تجربی، ریاضی، انسانی، هنر، زبان)"}),e.jsx("option",{value:"experimental",children:"علوم تجربی"}),e.jsx("option",{value:"math",children:"ریاضی و فنی"}),e.jsx("option",{value:"humanities",children:"علوم انسانی"}),e.jsx("option",{value:"art",children:"هنر"}),e.jsx("option",{value:"language",children:"زبان‌های خارجی"})]})}),e.jsx("div",{children:e.jsxs("select",{value:S,onChange:s=>A(s.target.value),className:"w-full p-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 bg-white",children:[e.jsx("option",{value:"all",children:"همه سهمیه‌ها (مناطق ۱، ۲، ۳)"}),e.jsx("option",{value:"region1",children:"سهمیه منطقه ۱"}),e.jsx("option",{value:"region2",children:"سهمیه منطقه ۲"}),e.jsx("option",{value:"region3",children:"سهمیه منطقه ۳"})]})}),e.jsx("div",{children:e.jsxs("select",{value:f,onChange:s=>U(s.target.value),className:"w-full p-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 bg-white",children:[e.jsx("option",{value:"all",children:"تمام بازه‌های ترازی"}),e.jsx("option",{value:"above-11000",children:"تراز بالای ۱۱,۰۰۰ (رتبه‌های برتر)"}),e.jsx("option",{value:"10000-11000",children:"تراز ۱۰,۰۰۰ تا ۱۱,۰۰۰"}),e.jsx("option",{value:"9000-10000",children:"تراز ۹,۰۰۰ تا ۱۰,۰۰۰"}),e.jsx("option",{value:"below-9000",children:"تراز زیر ۹,۰۰۰"})]})}),e.jsx("div",{children:e.jsxs("select",{value:C,onChange:s=>_(s.target.value),className:"w-full p-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 bg-white",children:[e.jsx("option",{value:"all",children:"همه سال‌ها (۱۴۰۴، ۱۴۰۳ و ۱۴۰۲)"}),e.jsx("option",{value:"1404",children:"پذیرفته‌شدگان ۱۴۰۴ / کنکور۱۰۰"}),e.jsx("option",{value:"1403",children:"کنکور ۱۴۰۳ (نوبت‌های ۱ و ۲)"}),e.jsx("option",{value:"1402",children:"کنکور ۱۴۰۲"})]})})]}),e.jsxs("div",{className:"flex items-center justify-between pt-1 text-xs text-slate-500",children:[e.jsxs("span",{children:["تعداد کارنامه‌های مطابق با فیلتر: ",e.jsx("strong",{className:"text-indigo-700 font-bold",children:L.length.toLocaleString("fa-IR")})," مورد از ",e.jsx("strong",{className:"text-slate-800 font-bold",children:be.length.toLocaleString("fa-IR")})," کارنامه مستند"]}),(y||k!=="all"||S!=="all"||C!=="all"||f!=="all")&&e.jsx("button",{onClick:()=>{O(""),T("all"),A("all"),_("all"),U("all")},className:"text-indigo-600 hover:text-indigo-800 font-bold text-xs",children:"پاکسازی فیلترها"})]})]}),e.jsx("div",{className:"grid grid-cols-1 md:grid-cols-2 gap-4",children:L.map(s=>{s.group==="experimental"||s.group==="math"||s.group==="humanities"||s.group;const a=s.region==="region1"?"منطقه ۱":s.region==="region2"?"منطقه ۲":"منطقه ۳";return e.jsxs("div",{className:"p-5 rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-4 hover:border-indigo-300 hover:shadow-md transition-all",children:[e.jsxs("div",{className:"flex items-start justify-between gap-3 pb-3 border-b border-slate-100",children:[e.jsxs("div",{className:"space-y-1",children:[e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("span",{className:"text-sm font-black text-slate-900",children:s.admittedMajor}),e.jsx("span",{className:"text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600",children:s.courseType})]}),e.jsxs("div",{className:"flex items-center gap-2 text-xs text-slate-600 font-medium",children:[e.jsx(me,{className:"w-3.5 h-3.5 text-slate-400"}),e.jsx("span",{children:s.admittedUniversity}),e.jsx("span",{children:"•"}),e.jsx(he,{className:"w-3 h-3 text-slate-400"}),e.jsx("span",{children:s.city})]})]}),e.jsxs("div",{className:"text-left shrink-0",children:[e.jsxs("span",{className:"px-2.5 py-1 rounded-full text-[11px] font-black bg-indigo-50 text-indigo-700 border border-indigo-100 block",children:["رتبه ",s.rankRegion.toLocaleString("fa-IR")," ",a]}),e.jsxs("div",{className:"flex items-center justify-end gap-1.5 text-[10px] text-slate-400 mt-1",children:[s.source&&e.jsx("span",{className:"px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[9px] font-bold",children:s.source}),e.jsxs("span",{children:["کنکور ",s.year," (",s.period==="ordibehesht"?"اردیبهشت":"تیر",")"]})]})]})]}),e.jsxs("div",{className:"grid grid-cols-4 gap-2 text-center text-xs",children:[e.jsxs("div",{className:"p-2 rounded-xl bg-slate-50 border border-slate-100",children:[e.jsx("span",{className:"text-[10px] text-slate-400 block mb-0.5",children:"تراز کل"}),e.jsx("span",{className:"font-black text-indigo-900 font-mono text-xs",children:s.totalTaraz.toLocaleString("fa-IR")})]}),e.jsxs("div",{className:"p-2 rounded-xl bg-slate-50 border border-slate-100",children:[e.jsx("span",{className:"text-[10px] text-slate-400 block mb-0.5",children:"تراز آزمون"}),e.jsx("span",{className:"font-black text-slate-800 font-mono text-xs",children:s.konkurTaraz.toLocaleString("fa-IR")})]}),e.jsxs("div",{className:"p-2 rounded-xl bg-slate-50 border border-slate-100",children:[e.jsx("span",{className:"text-[10px] text-slate-400 block mb-0.5",children:"تراز سوابق"}),e.jsx("span",{className:"font-black text-emerald-700 font-mono text-xs",children:s.savabeghTaraz.toLocaleString("fa-IR")})]}),e.jsxs("div",{className:"p-2 rounded-xl bg-slate-50 border border-slate-100",children:[e.jsx("span",{className:"text-[10px] text-slate-400 block mb-0.5",children:"معدل نهایی"}),e.jsx("span",{className:"font-black text-slate-700 font-mono text-xs",children:s.gpa?s.gpa:"—"})]})]}),e.jsxs("div",{className:"space-y-1.5 pt-1",children:[e.jsx("span",{className:"text-[11px] font-bold text-slate-500 block",children:"درصدهای واقعی کسب‌شده در کنکور:"}),e.jsx("div",{className:"flex flex-wrap gap-1.5",children:Object.entries(s.percentages).map(([i,r])=>e.jsxs("div",{className:"px-2.5 py-1 rounded-xl bg-slate-100/70 border border-slate-200/60 text-[11px] flex items-center gap-1.5",children:[e.jsxs("span",{className:"text-slate-600 font-medium",children:[Ae(i),":"]}),e.jsxs("strong",{className:"text-slate-900 font-mono font-bold",children:[r,"%"]})]},i))})]}),s.notes&&e.jsxs("div",{className:"text-[10px] text-amber-700 bg-amber-50/80 px-2.5 py-1 rounded-lg border border-amber-200/60",children:["💡 ",s.notes]}),e.jsx("div",{className:"pt-2",children:e.jsx("button",{onClick:()=>te(s),className:`w-full py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${H===s.id?"bg-emerald-600 text-white shadow-xs":"bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200/80"}`,children:H===s.id?e.jsxs(e.Fragment,{children:[e.jsx(ve,{className:"w-3.5 h-3.5"}),e.jsx("span",{children:"درصدها به محاسبه‌گر منتقل شد!"})]}):e.jsxs(e.Fragment,{children:[e.jsx(ne,{className:"w-3.5 h-3.5 text-indigo-600"}),e.jsx("span",{children:"انتقال درصدهای این کارنامه به محاسبه‌گر"})]})})})]},s.id)})}),L.length===0&&e.jsxs("div",{className:"p-12 text-center rounded-3xl bg-white border border-slate-200 space-y-3",children:[e.jsx(we,{className:"w-8 h-8 text-slate-400 mx-auto"}),e.jsx("h4",{className:"text-sm font-bold text-slate-700",children:"کارنامه‌ای با این فیلترها یافت نشد"}),e.jsx("p",{className:"text-xs text-slate-400",children:"لطفاً فیلترها یا عبارت جستجو را تغییر دهید."})]})]}),g==="benchmarks"&&e.jsxs("div",{className:"p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 space-y-6 animate-in fade-in",children:[e.jsxs("div",{className:"flex flex-col sm:flex-row sm:items-center justify-between gap-4",children:[e.jsxs("div",{children:[e.jsx("h3",{className:"text-lg font-black text-slate-900",children:"ماتریس میانگین و سختی دروس کشوری"}),e.jsx("p",{className:"text-xs text-slate-500",children:"استخراج شده از کارنامه‌های واقعی کنکورهای اخیر"})]}),e.jsx("div",{className:"flex items-center gap-2",children:e.jsxs("select",{value:b,onChange:s=>X(s.target.value),className:"p-2.5 rounded-xl border border-slate-200 text-xs font-bold bg-white text-slate-800",children:[e.jsx("option",{value:"ordibehesht",children:"نوبت اول (اردیبهشت ۱۴۰۳)"}),e.jsx("option",{value:"tir",children:"نوبت دوم (تیرماه ۱۴۰۳)"}),e.jsx("option",{value:"forecast1404",children:"پیش‌بینی کالیبره کنکور ۱۴۰۴"})]})})]}),e.jsx("div",{className:"overflow-x-auto",children:e.jsxs("table",{className:"w-full text-right text-xs",children:[e.jsx("thead",{children:e.jsxs("tr",{className:"border-b border-slate-200 bg-slate-50 text-slate-600 font-bold",children:[e.jsx("th",{className:"p-3",children:"نام درس"}),e.jsx("th",{className:"p-3",children:"ضریب رسمی"}),e.jsx("th",{className:"p-3",children:"تعداد سوالات"}),e.jsx("th",{className:"p-3",children:"میانگین کشوری (μ)"}),e.jsx("th",{className:"p-3",children:"انحراف معیار (σ)"}),e.jsx("th",{className:"p-3",children:"سطح دشواری آزمون"})]})}),e.jsx("tbody",{className:"divide-y divide-slate-100 font-medium",children:Object.values(M).map(s=>e.jsxs("tr",{className:"hover:bg-slate-50/80",children:[e.jsx("td",{className:"p-3 font-bold text-slate-900",children:s.name}),e.jsx("td",{className:"p-3 text-indigo-600 font-bold",children:s.coefficient}),e.jsxs("td",{className:"p-3 text-slate-600",children:[s.questionCount," سوال (",s.timeMinutes," دقیقه)"]}),e.jsxs("td",{className:"p-3 font-bold text-slate-800",children:[s.nationalMean,"%"]}),e.jsxs("td",{className:"p-3 text-slate-500",children:["±",s.standardDeviation,"%"]}),e.jsx("td",{className:"p-3",children:e.jsx("span",{className:`px-2.5 py-1 rounded-full text-[11px] font-bold ${s.difficultyLevel==="خیلی سخت"?"bg-rose-100 text-rose-800":s.difficultyLevel==="سخت"?"bg-amber-100 text-amber-800":s.difficultyLevel==="متوسط"?"bg-sky-100 text-sky-800":"bg-emerald-100 text-emerald-800"}`,children:s.difficultyLevel})})]},s.code))})]})})]}),g==="calculator"&&e.jsxs("div",{className:"space-y-8",children:[e.jsxs("div",{className:"bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6",children:[e.jsxs("div",{className:"flex items-center gap-2 pb-4 border-b border-slate-100",children:[e.jsx(ye,{className:"w-5 h-5 text-indigo-600"}),e.jsx("h2",{className:"text-base font-black text-slate-900",children:"تنظیمات جامعه آماری و سهمیه"})]}),e.jsxs("div",{className:"grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4",children:[e.jsxs("div",{children:[e.jsx("label",{className:"block text-xs font-bold text-slate-700 mb-1.5",children:"گروه آزمایشی:"}),e.jsxs("select",{value:p,onChange:s=>ae(s.target.value),className:"w-full p-3 rounded-2xl border border-slate-200 text-xs font-bold text-slate-800 bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none",children:[e.jsx("option",{value:"experimental",children:"علوم تجربی"}),e.jsx("option",{value:"math",children:"ریاضی و فنی"}),e.jsx("option",{value:"humanities",children:"علوم انسانی"}),e.jsx("option",{value:"art",children:"هنر"}),e.jsx("option",{value:"language",children:"زبان‌های خارجی"})]})]}),e.jsxs("div",{children:[e.jsx("label",{className:"block text-xs font-bold text-slate-700 mb-1.5",children:"سهمیه منطقه داوطلب:"}),e.jsxs("select",{value:N,onChange:s=>$(s.target.value),className:"w-full p-3 rounded-2xl border border-slate-200 text-xs font-bold text-slate-800 bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none",children:[e.jsx("option",{value:"region1",children:"منطقه ۱ (تهران، اصفهان، مشهد، شیراز، تبریز)"}),e.jsx("option",{value:"region2",children:"منطقه ۲ (مراکز استان‌ها و شهرهای پرجمعیت)"}),e.jsx("option",{value:"region3",children:"منطقه ۳ (مناطق کمتر برخوردار و شهرهای کوچک)"})]})]}),e.jsxs("div",{children:[e.jsx("label",{className:"block text-xs font-bold text-slate-700 mb-1.5",children:"سال و نوبت کنکور مبنا:"}),e.jsxs("select",{value:b,onChange:s=>X(s.target.value),className:"w-full p-3 rounded-2xl border border-slate-200 text-xs font-bold text-slate-800 bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none",children:[e.jsx("option",{value:"ordibehesht",children:"نوبت اول (اردیبهشت ۱۴۰۳)"}),e.jsx("option",{value:"tir",children:"نوبت دوم (تیرماه ۱۴۰۳)"}),e.jsx("option",{value:"forecast1404",children:"پیش‌بینی کالیبره کنکور ۱۴۰۴"})]})]}),e.jsxs("div",{children:[e.jsx("label",{className:"block text-xs font-bold text-slate-700 mb-1.5",children:"الگوی تأثیر سوابق نهایی:"}),e.jsxs("select",{value:q,onChange:s=>oe(s.target.value),className:"w-full p-3 rounded-2xl border border-slate-200 text-xs font-bold text-slate-800 bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none",children:[e.jsx("option",{value:"50-50",children:"۵۰٪ سوابق + ۵۰٪ کنکور (قانون ۱۴۰۳)"}),e.jsx("option",{value:"60-40",children:"۶۰٪ سوابق + ۴۰٪ کنکور (قانون ۱۴۰۴)"}),e.jsx("option",{value:"100-konkur",children:"فقط آزمون کنکور (۱۰۰٪)"})]})]})]}),q!=="100-konkur"&&e.jsxs("div",{className:"p-5 sm:p-6 rounded-3xl bg-indigo-50/50 border border-indigo-100 space-y-4",children:[e.jsxs("div",{className:"flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-indigo-100/80",children:[e.jsxs("div",{className:"flex items-center gap-3",children:[e.jsx("div",{className:"w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-xs",children:e.jsx(Q,{className:"w-5 h-5"})}),e.jsxs("div",{children:[e.jsx("h4",{className:"text-sm font-black text-slate-900",children:"سوابق تحصیلی قطعی (امتحانات نهایی پایه دوازدهم)"}),e.jsx("p",{className:"text-xs text-slate-500",children:"تاثیر قطعی ۵۰٪ (کنکور ۱۴۰۳) یا ۶۰٪ (کنکور ۱۴۰۴) در تراز کل"})]})]}),e.jsxs("div",{className:"flex items-center gap-1.5 p-1 rounded-xl bg-white border border-indigo-200/80 self-start sm:self-auto text-xs font-bold",children:[e.jsx("button",{onClick:()=>se("quick-gpa"),className:`px-3 py-1.5 rounded-lg transition-all ${w==="quick-gpa"?"bg-indigo-600 text-white shadow-2xs":"text-slate-600 hover:text-indigo-900"}`,children:"ورود سریع با معدل کل"}),e.jsxs("button",{onClick:()=>se("subject-grades"),className:`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${w==="subject-grades"?"bg-indigo-600 text-white shadow-2xs":"text-slate-600 hover:text-indigo-900"}`,children:[e.jsx(ce,{className:"w-3.5 h-3.5 text-amber-300"}),"ورود دقیق درس‌به‌درس (ترازسنج)"]})]})]}),w==="quick-gpa"&&e.jsxs("div",{className:"flex flex-col sm:flex-row items-center justify-between gap-4 pt-1",children:[e.jsx("div",{className:"text-xs text-slate-600",children:"معدل کتبی نهایی خود (از ۲۰) را وارد کنید تا تراز تقریبی سوابق با فرمول منحنی هم‌ترازسازی محاسبه شود:"}),e.jsxs("div",{className:"flex items-center gap-3 w-full sm:w-auto",children:[e.jsx("input",{type:"number",step:"0.01",min:0,max:20,dir:"ltr",value:Y,onChange:s=>ee(s.target.value),className:"p-2.5 px-4 w-32 rounded-xl border border-indigo-200 bg-white text-center font-black text-indigo-900 text-sm outline-none focus:ring-2 focus:ring-indigo-300",placeholder:"19.50"}),e.jsxs("div",{className:"text-left",children:[e.jsx("span",{className:"text-[10px] text-slate-400 block",children:"تراز کل سوابق:"}),e.jsx("span",{className:"text-xs font-black text-indigo-700 font-mono",children:o.finalExamTScore.toLocaleString("fa-IR")})]})]})]}),w==="subject-grades"&&e.jsxs("div",{className:"space-y-4 pt-1",children:[e.jsxs("div",{className:"flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs",children:[e.jsx("p",{className:"text-slate-600",children:"نمره کتبی هر درس نهایی (از ۲۰) را وارد کنید. سیستم تراز دقیق هر درس را بر مبنای سختی کشوری و ضرایب شورای سنجش محاسبه می‌کند:"}),e.jsxs("div",{className:"px-3 py-1.5 rounded-xl bg-white border border-indigo-200 text-indigo-900 font-bold flex items-center gap-2 self-start sm:self-auto shrink-0",children:[e.jsx("span",{children:"معدل معادل:"}),e.jsx("strong",{className:"font-mono text-emerald-700 font-black text-xs",children:o.finalExamGpa.toFixed(2)}),e.jsx("span",{className:"text-slate-300",children:"|"}),e.jsx("span",{children:"تراز سوابق:"}),e.jsx("strong",{className:"font-mono text-indigo-700 font-black text-xs",children:o.finalExamTScore.toLocaleString("fa-IR")})]})]}),e.jsx("div",{className:"grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3",children:Object.keys(E).map(s=>{const a=E[s],i=R[s]!==void 0?R[s]:19,r=o.finalExamSubjectResults?.find(l=>l.code===s);return e.jsxs("div",{className:"p-3.5 rounded-2xl bg-white border border-indigo-100/90 shadow-2xs space-y-2.5 hover:border-indigo-300 transition-all",children:[e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsx("span",{className:"font-black text-slate-900 text-xs truncate",children:a.name}),e.jsx("span",{className:`text-[10px] px-1.5 py-0.5 rounded-md font-bold ${a.gradeType==="عمومی"?"bg-amber-50 text-amber-700":"bg-sky-50 text-sky-700"}`,children:a.gradeType==="عمومی"?"عمومی":"تخصصی"})]}),e.jsxs("div",{className:"flex items-center justify-between text-[11px] text-slate-500",children:[e.jsx("span",{children:"وزن در سوابق:"}),e.jsxs("span",{className:"font-mono font-bold text-slate-700",children:[a.weightPercent,"%"]})]}),e.jsxs("div",{className:"flex items-center justify-between text-[11px] text-slate-500",children:[e.jsx("span",{children:"میانگین کشوری:"}),e.jsx("span",{className:"font-mono text-slate-600",children:a.nationalMeanGrade})]}),e.jsxs("div",{className:"pt-1 flex items-center justify-between gap-2",children:[e.jsx("span",{className:"text-[11px] font-bold text-slate-700",children:"نمره:"}),e.jsx("input",{type:"number",step:"0.25",min:0,max:20,dir:"ltr",value:i,onChange:l=>c(s,parseFloat(l.target.value)||0),className:"w-20 p-1.5 rounded-lg border border-indigo-200 bg-indigo-50/30 text-center font-mono font-black text-indigo-950 text-xs outline-none focus:bg-white focus:ring-2 focus:ring-indigo-300"})]}),r&&e.jsxs("div",{className:"pt-1.5 border-t border-slate-100 flex items-center justify-between text-[11px]",children:[e.jsx("span",{className:"text-slate-400",children:"تراز درس:"}),e.jsx("span",{className:"font-mono font-black text-indigo-700 text-xs",children:r.tScore.toLocaleString("fa-IR")})]})]},s)})})]})]})]}),e.jsxs("div",{className:"space-y-4",children:[e.jsxs("div",{className:"flex flex-col sm:flex-row sm:items-center justify-between gap-2",children:[e.jsxs("div",{children:[e.jsx("h3",{className:"text-lg font-black text-slate-900",children:"درصدها و عملکرد درس‌به‌درس"}),e.jsx("p",{className:"text-xs text-slate-500",children:"می‌توانید درصد مستقیم یا تعداد صحیح/غلط را برای محاسبه خودکار نمره منفی وارد کنید."})]}),e.jsxs("div",{className:"text-xs font-medium text-slate-400",children:["جامعه آماری: ",e.jsx("span",{className:"font-bold text-slate-700",children:p==="experimental"?"تجربی":p==="math"?"ریاضی":"انسانی"})," (",b==="ordibehesht"?"اردیبهشت":"تیر",")"]})]}),e.jsx("div",{className:"grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4",children:Object.keys(M).map(s=>{const a=M[s],i=I[s]||{inputMode:"percentage",percentage:50,correctAnswers:0,wrongAnswers:0,unanswered:a.questionCount},r=o.subjectResults.find(l=>l.code===s);return e.jsxs("div",{className:"p-5 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-4 hover:border-indigo-200 transition-all",children:[e.jsxs("div",{className:"flex items-center justify-between pb-3 border-b border-slate-100",children:[e.jsxs("div",{children:[e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("span",{className:"text-sm font-black text-slate-900",children:a.name}),e.jsxs("span",{className:"text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100",children:["ضریب ",a.coefficient]})]}),e.jsxs("span",{className:"text-[10px] text-slate-400",children:[a.questionCount," تست • میانگین کشور: ",a.nationalMean,"%"]})]}),e.jsx("button",{onClick:()=>d(s),className:"text-[11px] font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50/60 hover:bg-indigo-100 px-2.5 py-1 rounded-xl transition-colors",children:i.inputMode==="percentage"?"ورود با صحیح/غلط":"ورود با درصد"})]}),i.inputMode==="percentage"?e.jsxs("div",{className:"space-y-3",children:[e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsx("span",{className:"text-xs font-bold text-slate-600",children:"درصد کسب‌شده:"}),e.jsxs("div",{className:"flex items-center gap-1",children:[e.jsx("input",{type:"number",dir:"ltr",step:"0.1",min:-33.33,max:100,value:i.percentage,onChange:l=>W(s,parseFloat(l.target.value)||0),className:"w-20 p-2 text-center rounded-xl border border-slate-200 font-black text-slate-900 text-sm focus:border-indigo-500 outline-none"}),e.jsx("span",{className:"text-xs font-bold text-slate-400",children:"%"})]})]}),e.jsx("input",{type:"range",min:-10,max:100,step:1,value:Math.max(-10,i.percentage),onChange:l=>W(s,parseFloat(l.target.value)),className:"w-full accent-indigo-600 h-2 bg-slate-100 rounded-lg cursor-pointer"})]}):e.jsxs("div",{className:"space-y-3",children:[e.jsxs("div",{className:"grid grid-cols-3 gap-2 text-center text-xs",children:[e.jsxs("div",{className:"p-2 rounded-xl bg-emerald-50/60 border border-emerald-100",children:[e.jsx("span",{className:"text-[10px] text-emerald-700 font-bold block mb-1",children:"صحیح"}),e.jsx("input",{type:"number",min:0,max:a.questionCount,value:i.correctAnswers??0,onChange:l=>t(s,"correct",parseInt(l.target.value)||0),className:"w-full p-1 text-center font-black text-emerald-900 rounded-lg border border-emerald-200 bg-white text-xs"})]}),e.jsxs("div",{className:"p-2 rounded-xl bg-rose-50/60 border border-rose-100",children:[e.jsx("span",{className:"text-[10px] text-rose-700 font-bold block mb-1",children:"غلط (منفی)"}),e.jsx("input",{type:"number",min:0,max:a.questionCount,value:i.wrongAnswers??0,onChange:l=>t(s,"wrong",parseInt(l.target.value)||0),className:"w-full p-1 text-center font-black text-rose-900 rounded-lg border border-rose-200 bg-white text-xs"})]}),e.jsxs("div",{className:"p-2 rounded-xl bg-slate-50 border border-slate-200",children:[e.jsx("span",{className:"text-[10px] text-slate-500 font-bold block mb-1",children:"نزده"}),e.jsx("span",{className:"block p-1 text-center font-bold text-slate-700 text-xs",children:i.unanswered??0})]})]}),e.jsxs("div",{className:"flex items-center justify-between text-xs font-bold pt-1",children:[e.jsx("span",{className:"text-slate-500",children:"درصد محاسبه شده:"}),e.jsxs("span",{className:"text-indigo-700 font-mono text-sm",children:[i.percentage,"%"]})]})]}),r&&e.jsxs("div",{className:"pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]",children:[e.jsxs("span",{className:"text-slate-400",children:["تراز درس: ",e.jsx("strong",{className:"text-slate-800 font-mono text-xs",children:r.tScore.toLocaleString("fa-IR")})]}),e.jsxs("span",{className:`font-bold ${r.diffFromMean>=0?"text-emerald-600":"text-rose-600"}`,children:[r.diffFromMean>=0?`+${r.diffFromMean}%`:`${r.diffFromMean}%`," نسبت به میانگین"]})]})]},s)})})]}),e.jsxs("div",{className:"p-6 sm:p-10 rounded-3xl bg-gradient-to-b from-indigo-50/40 via-white to-slate-50/50 border border-indigo-100 shadow-xl space-y-8 animate-in zoom-in-95",children:[e.jsxs("div",{className:"grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4",children:[e.jsxs("div",{className:"p-6 rounded-3xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-700 text-white shadow-xl shadow-indigo-200/80 space-y-2 text-center md:text-right",children:[e.jsx("span",{className:"text-[11px] font-bold text-indigo-200 block",children:"نمره کل نهایی (تراز ترکیبی):"}),e.jsx("p",{className:"text-4xl font-black font-mono tracking-tight",children:o.totalCompositeTScore.toLocaleString("fa-IR")}),e.jsxs("div",{className:"pt-2 text-[11px] text-indigo-100 flex items-center justify-between border-t border-indigo-500/50",children:[e.jsx("span",{children:"وضعیت کلی:"}),e.jsx("span",{className:"font-bold",children:o.overallGrade})]})]}),e.jsxs("div",{className:"p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-2 text-center md:text-right",children:[e.jsxs("span",{className:"text-[11px] font-bold text-slate-500 block",children:["رتبه تخمینی در ",N==="region1"?"سهمیه منطقه ۱":N==="region2"?"سهمیه منطقه ۲":"سهمیه منطقه ۳",":"]}),e.jsxs("p",{className:"text-3xl font-black text-slate-900 font-mono",children:[o.estimatedRankRegion.min.toLocaleString("fa-IR")," تا ",o.estimatedRankRegion.max.toLocaleString("fa-IR")]}),e.jsxs("div",{className:"pt-2 text-[11px] text-slate-500 flex items-center justify-between border-t border-slate-100",children:[e.jsx("span",{children:"رتبه محتمل میانه:"}),e.jsx("strong",{className:"text-indigo-700 font-bold text-xs",children:o.estimatedRankRegion.median.toLocaleString("fa-IR")})]})]}),e.jsxs("div",{className:"p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-2 text-center md:text-right",children:[e.jsx("span",{className:"text-[11px] font-bold text-slate-500 block",children:"رتبه تخمینی کشوری:"}),e.jsxs("p",{className:"text-3xl font-black text-slate-900 font-mono",children:[o.estimatedRankCountry.min.toLocaleString("fa-IR")," تا ",o.estimatedRankCountry.max.toLocaleString("fa-IR")]}),e.jsxs("div",{className:"pt-2 text-[11px] text-slate-500 flex items-center justify-between border-t border-slate-100",children:[e.jsx("span",{children:"رتبه میانه کشوری:"}),e.jsx("strong",{className:"text-slate-800 font-bold text-xs",children:o.estimatedRankCountry.median.toLocaleString("fa-IR")})]})]}),e.jsxs("div",{className:"p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-3",children:[e.jsx("span",{className:"text-[11px] font-bold text-slate-500 block",children:"اجزای تشکیل‌دهنده تراز:"}),e.jsxs("div",{className:"space-y-1.5 text-xs",children:[e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsx("span",{className:"text-slate-600",children:"تراز آزمون کنکور:"}),e.jsx("span",{className:"font-mono font-bold text-slate-900",children:o.konkurTScore.toLocaleString("fa-IR")})]}),e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsx("span",{className:"text-slate-600",children:"تراز سوابق تحصیلی:"}),e.jsx("span",{className:"font-mono font-bold text-indigo-600",children:o.finalExamTScore.toLocaleString("fa-IR")})]}),e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsx("span",{className:"text-slate-600",children:"میانگین درصدها:"}),e.jsxs("span",{className:"font-mono font-bold text-emerald-600",children:[o.averagePercent,"%"]})]})]})]})]}),e.jsxs("div",{className:"space-y-3",children:[e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsxs("h4",{className:"text-sm font-black text-slate-900 flex items-center gap-2",children:[e.jsx(ke,{className:"w-4 h-4 text-indigo-600"}),"ریز محاسبات تراز و جایگاه رقابتی در هر درس"]}),e.jsx("span",{className:"text-xs text-slate-400 font-medium",children:"مقیاس استاندارد سنجش (T-Score)"})]}),e.jsx("div",{className:"overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-2xs",children:e.jsxs("table",{className:"w-full text-right text-xs",children:[e.jsx("thead",{children:e.jsxs("tr",{className:"border-b border-slate-200 bg-slate-50/80 text-slate-500 font-bold",children:[e.jsx("th",{className:"p-3.5",children:"درس"}),e.jsx("th",{className:"p-3.5",children:"ضریب"}),e.jsx("th",{className:"p-3.5",children:"درصد خام"}),e.jsx("th",{className:"p-3.5",children:"نمره Z (انحراف از میانگین)"}),e.jsx("th",{className:"p-3.5",children:"تراز درس (T-Score)"}),e.jsx("th",{className:"p-3.5",children:"تاثیر ترازسازی"}),e.jsx("th",{className:"p-3.5",children:"توصیه راهبردی مشاور"})]})}),e.jsx("tbody",{className:"divide-y divide-slate-100 font-medium",children:o.subjectResults.map(s=>e.jsxs("tr",{className:"hover:bg-indigo-50/30 transition-colors",children:[e.jsx("td",{className:"p-3.5 font-black text-slate-900",children:s.name}),e.jsx("td",{className:"p-3.5 text-indigo-600 font-bold",children:s.coefficient}),e.jsxs("td",{className:"p-3.5 font-bold font-mono text-slate-800",children:[s.percentage,"%"]}),e.jsx("td",{className:"p-3.5 font-mono text-slate-600",children:s.zScore>0?`+${s.zScore}`:s.zScore}),e.jsx("td",{className:"p-3.5 font-black font-mono text-indigo-900 text-sm",children:s.tScore.toLocaleString("fa-IR")}),e.jsx("td",{className:"p-3.5",children:e.jsx("span",{className:`px-2.5 py-1 rounded-full text-[10px] font-black ${s.impactTag==="ترازساز طلایی"?"bg-amber-100 text-amber-900 border border-amber-300":s.impactTag==="مطلوب و رقابتی"?"bg-emerald-100 text-emerald-800":s.impactTag==="متوسط"?"bg-sky-100 text-sky-800":"bg-rose-100 text-rose-800"}`,children:s.impactTag})}),e.jsx("td",{className:"p-3.5 text-slate-600 text-[11px] max-w-xs",children:s.recommendation})]},s.code))})]})})]}),o.finalExamSubjectResults&&e.jsxs("div",{className:"space-y-3 pt-2",children:[e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsxs("h4",{className:"text-sm font-black text-slate-900 flex items-center gap-2",children:[e.jsx(Q,{className:"w-4 h-4 text-emerald-600"}),"ریز محاسبات تراز و ضرایب امتحانات نهایی دیپلم"]}),e.jsx("span",{className:"text-xs text-slate-400 font-medium",children:"ضرایب رسمی شورای سنجش و پذیرش"})]}),e.jsx("div",{className:"overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-2xs",children:e.jsxs("table",{className:"w-full text-right text-xs",children:[e.jsx("thead",{children:e.jsxs("tr",{className:"border-b border-slate-200 bg-emerald-50/50 text-slate-600 font-bold",children:[e.jsx("th",{className:"p-3",children:"نام درس نهایی"}),e.jsx("th",{className:"p-3",children:"نوع درس"}),e.jsx("th",{className:"p-3",children:"وزن در سوابق"}),e.jsx("th",{className:"p-3",children:"نمره کتبی"}),e.jsx("th",{className:"p-3",children:"میانگین کشوری"}),e.jsx("th",{className:"p-3",children:"نمره استاندارد (Z)"}),e.jsx("th",{className:"p-3",children:"تراز اختصاصی درس (T-Score)"})]})}),e.jsx("tbody",{className:"divide-y divide-slate-100 font-medium",children:o.finalExamSubjectResults.map(s=>e.jsxs("tr",{className:"hover:bg-emerald-50/20 transition-colors",children:[e.jsx("td",{className:"p-3 font-black text-slate-900",children:s.name}),e.jsx("td",{className:"p-3",children:e.jsx("span",{className:`px-2 py-0.5 rounded-md text-[10px] font-bold ${s.gradeType==="عمومی"?"bg-amber-50 text-amber-700":"bg-sky-50 text-sky-700"}`,children:s.gradeType==="عمومی"?"عمومی":"تخصصی"})}),e.jsxs("td",{className:"p-3 font-mono font-bold text-indigo-700",children:[s.weightPercent,"%"]}),e.jsx("td",{className:"p-3 font-mono font-bold text-slate-900 text-sm",children:s.grade}),e.jsx("td",{className:"p-3 font-mono text-slate-500",children:s.nationalMeanGrade}),e.jsx("td",{className:"p-3 font-mono text-slate-600",children:s.zScore>0?`+${s.zScore}`:s.zScore}),e.jsx("td",{className:"p-3 font-mono font-black text-emerald-800 text-sm",children:s.tScore.toLocaleString("fa-IR")})]},s.code))})]})})]}),e.jsxs("div",{className:"p-6 rounded-3xl bg-amber-50/60 border border-amber-200/80 space-y-4",children:[e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx(Se,{className:"w-5 h-5 text-amber-600"}),e.jsx("h4",{className:"text-sm font-black text-slate-900",children:"شبیه‌ساز حساسیت و جهش رتبه (اگر در هر درس ۱۰٪ بهتر بزنید چه می‌شود؟)"})]}),e.jsx("p",{className:"text-xs text-slate-600",children:"این شبیه‌ساز نشان می‌دهد سرمایه‌گذاری مطالعاتی روی کدام درس بیشترین آورده ترازی و جهش رتبه را برای شما خواهد داشت:"}),e.jsx("div",{className:"grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3",children:o.whatIfScenarios.map((s,a)=>e.jsxs("div",{className:"p-4 rounded-2xl bg-white border border-amber-100 shadow-2xs space-y-2 text-xs",children:[e.jsxs("div",{className:"flex items-center justify-between font-bold",children:[e.jsxs("span",{className:"text-slate-900",children:[s.subjectName," (+۱۰٪)"]}),e.jsxs("span",{className:"text-emerald-600 font-mono",children:["+",s.gain10PercentTScore," تراز درس"]})]}),e.jsxs("div",{className:"text-[11px] text-slate-600 space-y-1",children:[e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsx("span",{children:"تراز کل جدید:"}),e.jsx("strong",{className:"font-mono text-slate-900",children:s.newTotalTaraz.toLocaleString("fa-IR")})]}),e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsx("span",{children:"بهبود رتبه در سهمیه:"}),e.jsx("strong",{className:"text-indigo-700 font-bold",children:s.rankImprovement>0?`جهش ${s.rankImprovement.toLocaleString("fa-IR")} پله‌ای`:"تثبیت رتبه"})]})]})]},a))})]}),e.jsxs("div",{className:"space-y-4",children:[e.jsxs("div",{className:"flex flex-col sm:flex-row sm:items-center justify-between gap-3",children:[e.jsxs("div",{children:[e.jsxs("h4",{className:"text-sm font-black text-slate-900 flex items-center gap-2",children:[e.jsx(ie,{className:"w-4 h-4 text-emerald-600"}),"ماتریس شانس قبولی دانشگاه‌ها بر اساس این تراز نهایی"]}),e.jsx("p",{className:"text-xs text-slate-500",children:"منطبق بر کارنامه‌های قبولی قطعی سازمان سنجش در آزمون‌های سراسری اخیر"})]}),e.jsxs("button",{onClick:()=>{T(p),A(N),u("kanoon")},className:"px-4 py-2 rounded-xl bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200 text-xs font-bold transition-all flex items-center gap-2 self-start sm:self-auto",children:[e.jsx(xe,{className:"w-4 h-4 text-emerald-600"}),"مشاهده کارنامه‌های کانون مشابه این تراز"]})]}),e.jsx("div",{className:"grid grid-cols-1 md:grid-cols-2 gap-3",children:o.admissionChances.map((s,a)=>e.jsxs("div",{className:"p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex items-center justify-between gap-4 hover:border-indigo-200 transition-all",children:[e.jsxs("div",{className:"space-y-1",children:[e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("span",{className:"font-black text-slate-900 text-xs",children:s.major}),e.jsx("span",{className:"text-[10px] text-slate-500 px-1.5 py-0.5 rounded-md bg-slate-100",children:s.courseType})]}),e.jsxs("div",{className:"flex items-center gap-2 text-[11px] text-slate-500",children:[e.jsx(me,{className:"w-3 h-3 text-slate-400"}),e.jsx("span",{children:s.university}),e.jsx("span",{children:"•"}),e.jsx(he,{className:"w-3 h-3 text-slate-400"}),e.jsx("span",{children:s.city})]})]}),e.jsxs("div",{className:"text-left shrink-0",children:[e.jsx("span",{className:`px-2.5 py-1 rounded-full text-[10px] font-bold block ${s.chanceColor}`,children:s.chance}),e.jsxs("span",{className:"text-[10px] text-slate-400 mt-0.5 block font-mono",children:["حداقل تراز: ",s.lastAdmittedTaraz.toLocaleString("fa-IR")]})]})]},a))})]}),e.jsxs("div",{className:"p-6 rounded-3xl bg-slate-900 text-white flex flex-col sm:flex-row items-center justify-between gap-6",children:[e.jsxs("div",{className:"space-y-1 text-center sm:text-right",children:[e.jsx("span",{className:"text-xs text-indigo-300 font-bold block",children:"تحلیل استراتژیک کافئین:"}),e.jsx("h5",{className:"text-base font-black",children:"می‌خواهید برنامه مطالعاتی دقیق برای رسیدن به این تراز هدف دریافت کنید؟"}),e.jsx("p",{className:"text-xs text-slate-300",children:"مشاوران رتبه برتر کافئین با آنالیز ضعف‌های مبحثی، مسیر ارتقای تراز شما را گام‌به‌گام طراحی می‌کنند."})]}),e.jsx("div",{className:"flex items-center gap-3 shrink-0",children:e.jsx(J,{variant:"primary",size:"md",onClick:()=>D&&D("consulting"),children:"رزرو وقت مشاوره تخصصی ←"})})]})]})]})]})};
const ChanceEstimatorTool = ({ onNavigate }) => {
  const [group, setGroup] = n.useState("experimental");
  const [quota, setQuota] = n.useState("region1");
  const [mode, setMode] = n.useState("rank_quota");
  const [rankInput, setRankInput] = n.useState("1450");
  const [tarazInput, setTarazInput] = n.useState("9850");
  const [gpaInput, setGpaInput] = n.useState("19.4");
  const [search, setSearch] = n.useState("");
  const [courseFilter, setCourseFilter] = n.useState("all");
  const [chanceFilter, setChanceFilter] = n.useState("all");
  const [cityFilter, setCityFilter] = n.useState("all");
  const [sortBy, setSortBy] = n.useState("chance_desc");
  const [savedIds, setSavedIds] = n.useState([]);
  const [showSavedModal, setShowSavedModal] = n.useState(!1);
  const [copiedStatus, setCopiedStatus] = n.useState(!1);

  // Comprehensive Iranian University Cutoff Benchmark Database
  const ADMISSION_DATABASE = n.useMemo(() => [
    // === تجربی (EXPERIMENTAL) ===
    // پزشکی روزانه
    { id: 'exp-med-tehran', group: 'experimental', major: 'پزشکی', uni: 'دانشگاه علوم پزشکی تهران', city: 'تهران', course: 'روزانه', cutoffs: { region1: 95, region2: 130, region3: 100, country: 190, isargaran_5: 350, isargaran_25: 1200 }, minTaraz: 11600, capacity: 180 },
    { id: 'exp-med-beheshti', group: 'experimental', major: 'پزشکی', uni: 'دانشگاه علوم پزشکی شهید بهشتی', city: 'تهران', course: 'روزانه', cutoffs: { region1: 170, region2: 260, region3: 200, country: 380, isargaran_5: 580, isargaran_25: 1800 }, minTaraz: 11300, capacity: 160 },
    { id: 'exp-med-iran', group: 'experimental', major: 'پزشکی', uni: 'دانشگاه علوم پزشکی ایران', city: 'تهران', course: 'روزانه', cutoffs: { region1: 290, region2: 410, region3: 330, country: 670, isargaran_5: 850, isargaran_25: 2500 }, minTaraz: 10900, capacity: 140 },
    { id: 'exp-med-shiraz', group: 'experimental', major: 'پزشکی', uni: 'دانشگاه علوم پزشکی شیراز', city: 'شیراز', course: 'روزانه', cutoffs: { region1: 360, region2: 480, region3: 390, country: 780, isargaran_5: 980, isargaran_25: 2800 }, minTaraz: 10750, capacity: 150 },
    { id: 'exp-med-isfahan', group: 'experimental', major: 'پزشکی', uni: 'دانشگاه علوم پزشکی اصفهان', city: 'اصفهان', course: 'روزانه', cutoffs: { region1: 410, region2: 540, region3: 420, country: 890, isargaran_5: 1100, isargaran_25: 3100 }, minTaraz: 10600, capacity: 140 },
    { id: 'exp-med-mashhad', group: 'experimental', major: 'پزشکی', uni: 'دانشگاه علوم پزشکی مشهد', city: 'مشهد', course: 'روزانه', cutoffs: { region1: 460, region2: 600, region3: 470, country: 980, isargaran_5: 1250, isargaran_25: 3400 }, minTaraz: 10500, capacity: 160 },
    { id: 'exp-med-tabriz', group: 'experimental', major: 'پزشکی', uni: 'دانشگاه علوم پزشکی تبریز', city: 'تبریز', course: 'روزانه', cutoffs: { region1: 540, region2: 750, region3: 590, country: 1200, isargaran_5: 1450, isargaran_25: 4100 }, minTaraz: 10300, capacity: 140 },
    { id: 'exp-med-ahvaz', group: 'experimental', major: 'پزشکی', uni: 'دانشگاه علوم پزشکی جندی‌شاپور اهواز', city: 'اهواز', course: 'روزانه', cutoffs: { region1: 880, region2: 1150, region3: 920, country: 1850, isargaran_5: 1900, isargaran_25: 5200 }, minTaraz: 9950, capacity: 130 },
    { id: 'exp-med-gilan', group: 'experimental', major: 'پزشکی', uni: 'دانشگاه علوم پزشکی گیلان', city: 'رشت', course: 'روزانه', cutoffs: { region1: 780, region2: 1050, region3: 820, country: 1650, isargaran_5: 1750, isargaran_25: 4900 }, minTaraz: 10100, capacity: 110 },
    { id: 'exp-med-mazandaran', group: 'experimental', major: 'پزشکی', uni: 'دانشگاه علوم پزشکی مازندران', city: 'ساری', course: 'روزانه', cutoffs: { region1: 820, region2: 1080, region3: 870, country: 1750, isargaran_5: 1850, isargaran_25: 5100 }, minTaraz: 10050, capacity: 120 },
    { id: 'exp-med-kerman', group: 'experimental', major: 'پزشکی', uni: 'دانشگاه علوم پزشکی کرمان', city: 'کرمان', course: 'روزانه', cutoffs: { region1: 1250, region2: 1700, region3: 1380, country: 2800, isargaran_5: 2600, isargaran_25: 6800 }, minTaraz: 9650, capacity: 110 },
    { id: 'exp-med-yazd', group: 'experimental', major: 'پزشکی', uni: 'دانشگاه علوم پزشکی شهید صدوقی یزد', city: 'یزد', course: 'روزانه', cutoffs: { region1: 1320, region2: 1780, region3: 1420, country: 2950, isargaran_5: 2750, isargaran_25: 7100 }, minTaraz: 9600, capacity: 100 },
    { id: 'exp-med-qazvin', group: 'experimental', major: 'پزشکی', uni: 'دانشگاه علوم پزشکی قزوین', city: 'قزوین', course: 'روزانه', cutoffs: { region1: 1420, region2: 1920, region3: 1530, country: 3150, isargaran_5: 2950, isargaran_25: 7500 }, minTaraz: 9500, capacity: 90 },
    { id: 'exp-med-zahedan', group: 'experimental', major: 'پزشکی', uni: 'دانشگاه علوم پزشکی زاهدان', city: 'زاهدان', course: 'روزانه', cutoffs: { region1: 2250, region2: 3150, region3: 2550, country: 5300, isargaran_5: 4800, isargaran_25: 11500 }, minTaraz: 9100, capacity: 90 },
    
    // پزشکی پردیس و آزاد
    { id: 'exp-med-pardis-tehran', group: 'experimental', major: 'پزشکی', uni: 'پردیس خودگردان دانشگاه علوم پزشکی تهران', city: 'تهران', course: 'پردیس خودگردان', cutoffs: { region1: 670, region2: 920, region3: 770, country: 1550, isargaran_5: 1600, isargaran_25: 4500 }, minTaraz: 10150, capacity: 40 },
    { id: 'exp-med-pardis-beheshti', group: 'experimental', major: 'پزشکی', uni: 'پردیس خودگردان علوم پزشکی شهید بهشتی', city: 'تهران', course: 'پردیس خودگردان', cutoffs: { region1: 820, region2: 1180, region3: 920, country: 1950, isargaran_5: 1950, isargaran_25: 5300 }, minTaraz: 9900, capacity: 35 },
    { id: 'exp-med-pardis-shiraz', group: 'experimental', major: 'پزشکی', uni: 'پردیس خودگردان علوم پزشکی شیراز', city: 'شیراز', course: 'پردیس خودگردان', cutoffs: { region1: 1420, region2: 1980, region3: 1580, country: 3250, isargaran_5: 3100, isargaran_25: 7800 }, minTaraz: 9480, capacity: 30 },
    { id: 'exp-med-azad-tehran', group: 'experimental', major: 'پزشکی', uni: 'دانشگاه علوم پزشکی آزاد اسلامی تهران', city: 'تهران', course: 'دانشگاه آزاد', cutoffs: { region1: 2300, region2: 3200, region3: 2600, country: 4600, isargaran_5: 4200, isargaran_25: 11000 }, minTaraz: 9150, capacity: 180 },
    { id: 'exp-med-azad-mashhad', group: 'experimental', major: 'پزشکی', uni: 'دانشگاه آزاد اسلامی مشهد', city: 'مشهد', course: 'دانشگاه آزاد', cutoffs: { region1: 3100, region2: 4300, region3: 3500, country: 6400, isargaran_5: 5600, isargaran_25: 14000 }, minTaraz: 8850, capacity: 100 },

    // دندانپزشکی
    { id: 'exp-dent-tehran', group: 'experimental', major: 'دندانپزشکی', uni: 'دانشگاه علوم پزشکی تهران', city: 'تهران', course: 'روزانه', cutoffs: { region1: 65, region2: 90, region3: 75, country: 135, isargaran_5: 280, isargaran_25: 950 }, minTaraz: 11750, capacity: 60 },
    { id: 'exp-dent-beheshti', group: 'experimental', major: 'دندانپزشکی', uni: 'دانشگاه علوم پزشکی شهید بهشتی', city: 'تهران', course: 'روزانه', cutoffs: { region1: 115, region2: 175, region3: 135, country: 245, isargaran_5: 460, isargaran_25: 1400 }, minTaraz: 11450, capacity: 70 },
    { id: 'exp-dent-shiraz', group: 'experimental', major: 'دندانپزشکی', uni: 'دانشگاه علوم پزشکی شیراز', city: 'شیراز', course: 'روزانه', cutoffs: { region1: 290, region2: 390, region3: 320, country: 620, isargaran_5: 880, isargaran_25: 2600 }, minTaraz: 10850, capacity: 50 },
    { id: 'exp-dent-isfahan', group: 'experimental', major: 'دندانپزشکی', uni: 'دانشگاه علوم پزشکی اصفهان', city: 'اصفهان', course: 'روزانه', cutoffs: { region1: 320, region2: 430, region3: 350, country: 690, isargaran_5: 940, isargaran_25: 2800 }, minTaraz: 10750, capacity: 55 },
    { id: 'exp-dent-tabriz', group: 'experimental', major: 'دندانپزشکی', uni: 'دانشگاه علوم پزشکی تبریز', city: 'تبریز', course: 'روزانه', cutoffs: { region1: 460, region2: 640, region3: 520, country: 1020, isargaran_5: 1300, isargaran_25: 3700 }, minTaraz: 10400, capacity: 50 },
    { id: 'exp-dent-azad-tehran', group: 'experimental', major: 'دندانپزشکی', uni: 'دانشکده دندانپزشکی آزاد تهران', city: 'تهران', course: 'دانشگاه آزاد', cutoffs: { region1: 1950, region2: 2750, region3: 2200, country: 4000, isargaran_5: 3800, isargaran_25: 9800 }, minTaraz: 9280, capacity: 120 },

    // داروسازی
    { id: 'exp-pharm-tehran', group: 'experimental', major: 'داروسازی', uni: 'دانشگاه علوم پزشکی تهران', city: 'تهران', course: 'روزانه', cutoffs: { region1: 410, region2: 560, region3: 430, country: 870, isargaran_5: 1150, isargaran_25: 3200 }, minTaraz: 10600, capacity: 90 },
    { id: 'exp-pharm-beheshti', group: 'experimental', major: 'داروسازی', uni: 'دانشگاه علوم پزشکی شهید بهشتی', city: 'تهران', course: 'روزانه', cutoffs: { region1: 620, region2: 840, region3: 670, country: 1350, isargaran_5: 1550, isargaran_25: 4200 }, minTaraz: 10250, capacity: 80 },
    { id: 'exp-pharm-isfahan', group: 'experimental', major: 'داروسازی', uni: 'دانشگاه علوم پزشکی اصفهان', city: 'اصفهان', course: 'روزانه', cutoffs: { region1: 980, region2: 1340, region3: 1080, country: 2150, isargaran_5: 2200, isargaran_25: 5800 }, minTaraz: 9800, capacity: 70 },
    { id: 'exp-pharm-tabriz', group: 'experimental', major: 'داروسازی', uni: 'دانشگاه علوم پزشکی تبریز', city: 'تبریز', course: 'روزانه', cutoffs: { region1: 1250, region2: 1720, region3: 1390, country: 2850, isargaran_5: 2650, isargaran_25: 6900 }, minTaraz: 9600, capacity: 70 },
    { id: 'exp-pharm-azad-tehran', group: 'experimental', major: 'داروسازی', uni: 'دانشگاه علوم دارویی آزاد تهران', city: 'تهران', course: 'دانشگاه آزاد', cutoffs: { region1: 3400, region2: 4700, region3: 3800, country: 7200, isargaran_5: 6200, isargaran_25: 15500 }, minTaraz: 8700, capacity: 110 },

    // پیراپزشکی و توانبخشی
    { id: 'exp-physio-tehran', group: 'experimental', major: 'فیزیوتراپی', uni: 'دانشگاه علوم پزشکی تهران', city: 'تهران', course: 'روزانه', cutoffs: { region1: 1150, region2: 1550, region3: 1250, country: 2480, isargaran_5: 2400, isargaran_25: 6400 }, minTaraz: 9750, capacity: 40 },
    { id: 'exp-physio-shiraz', group: 'experimental', major: 'فیزیوتراپی', uni: 'دانشگاه علوم پزشکی شیراز', city: 'شیراز', course: 'روزانه', cutoffs: { region1: 1650, region2: 2280, region3: 1820, country: 3700, isargaran_5: 3400, isargaran_25: 8800 }, minTaraz: 9400, capacity: 35 },
    { id: 'exp-optom-beheshti', group: 'experimental', major: 'بینایی‌سنجی', uni: 'دانشگاه علوم پزشکی شهید بهشتی', city: 'تهران', course: 'روزانه', cutoffs: { region1: 2150, region2: 2980, region3: 2450, country: 4900, isargaran_5: 4400, isargaran_25: 11200 }, minTaraz: 9150, capacity: 30 },
    { id: 'exp-radio-tehran', group: 'experimental', major: 'رادیولوژی (تکنولوژی پرتوشناسی)', uni: 'دانشگاه علوم پزشکی تهران', city: 'تهران', course: 'روزانه', cutoffs: { region1: 2850, region2: 3900, region3: 3180, country: 6350, isargaran_5: 5600, isargaran_25: 14200 }, minTaraz: 8900, capacity: 35 },
    { id: 'exp-lab-beheshti', group: 'experimental', major: 'علوم آزمایشگاهی', uni: 'دانشگاه علوم پزشکی شهید بهشتی', city: 'تهران', course: 'روزانه', cutoffs: { region1: 3450, region2: 4750, region3: 3900, country: 7700, isargaran_5: 6800, isargaran_25: 16800 }, minTaraz: 8650, capacity: 50 },
    { id: 'exp-nurse-tehran', group: 'experimental', major: 'پرستاری', uni: 'دانشگاه علوم پزشکی تهران', city: 'تهران', course: 'روزانه', cutoffs: { region1: 3250, region2: 4600, region3: 3850, country: 7650, isargaran_5: 6700, isargaran_25: 16500 }, minTaraz: 8700, capacity: 100 },
    { id: 'exp-nurse-beheshti', group: 'experimental', major: 'پرستاری', uni: 'دانشگاه علوم پزشکی شهید بهشتی', city: 'تهران', course: 'روزانه', cutoffs: { region1: 4100, region2: 5650, region3: 4700, country: 9200, isargaran_5: 7900, isargaran_25: 19500 }, minTaraz: 8450, capacity: 90 },
    { id: 'exp-nurse-isfahan', group: 'experimental', major: 'پرستاری', uni: 'دانشگاه علوم پزشکی اصفهان', city: 'اصفهان', course: 'روزانه', cutoffs: { region1: 5800, region2: 8100, region3: 6700, country: 13200, isargaran_5: 11000, isargaran_25: 26000 }, minTaraz: 7950, capacity: 80 },
    { id: 'exp-nurse-gilan', group: 'experimental', major: 'پرستاری', uni: 'دانشگاه علوم پزشکی گیلان', city: 'رشت', course: 'روزانه', cutoffs: { region1: 7600, region2: 10800, region3: 8900, country: 17800, isargaran_5: 14500, isargaran_25: 34000 }, minTaraz: 7450, capacity: 70 },
    { id: 'exp-anest-shiraz', group: 'experimental', major: 'هوشبری', uni: 'دانشگاه علوم پزشکی شیراز', city: 'شیراز', course: 'روزانه', cutoffs: { region1: 6900, region2: 9700, region3: 8100, country: 15800, isargaran_5: 13200, isargaran_25: 31000 }, minTaraz: 7650, capacity: 35 },
    { id: 'exp-surg-tabriz', group: 'experimental', major: 'اتاق عمل', uni: 'دانشگاه علوم پزشکی تبریز', city: 'تبریز', course: 'روزانه', cutoffs: { region1: 8200, region2: 11600, region3: 9600, country: 19200, isargaran_5: 15500, isargaran_25: 36000 }, minTaraz: 7300, capacity: 35 },
    { id: 'exp-vet-tehran', group: 'experimental', major: 'دکتری عمومی دامپزشکی', uni: 'دانشگاه تهران', city: 'تهران', course: 'روزانه', cutoffs: { region1: 4600, region2: 6350, region3: 5250, country: 10800, isargaran_5: 9200, isargaran_25: 22000 }, minTaraz: 8300, capacity: 80 },

    // === ریاضی و فنی (MATH) ===
    { id: 'mat-comp-sharif', group: 'math', major: 'مهندسی کامپیوتر', uni: 'دانشگاه صنعتی شریف', city: 'تهران', course: 'روزانه', cutoffs: { region1: 98, region2: 52, region3: 32, country: 125, isargaran_5: 210, isargaran_25: 680 }, minTaraz: 11800, capacity: 140 },
    { id: 'mat-elec-sharif', group: 'math', major: 'مهندسی برق', uni: 'دانشگاه صنعتی شریف', city: 'تهران', course: 'روزانه', cutoffs: { region1: 165, region2: 95, region3: 58, country: 215, isargaran_5: 360, isargaran_25: 1100 }, minTaraz: 11500, capacity: 160 },
    { id: 'mat-mech-sharif', group: 'math', major: 'مهندسی مکانیک', uni: 'دانشگاه صنعتی شریف', city: 'تهران', course: 'روزانه', cutoffs: { region1: 225, region2: 145, region3: 85, country: 320, isargaran_5: 490, isargaran_25: 1450 }, minTaraz: 11200, capacity: 150 },
    { id: 'mat-ind-sharif', group: 'math', major: 'مهندسی صنایع', uni: 'دانشگاه صنعتی شریف', city: 'تهران', course: 'روزانه', cutoffs: { region1: 360, region2: 230, region3: 130, country: 520, isargaran_5: 750, isargaran_25: 2200 }, minTaraz: 10850, capacity: 90 },
    { id: 'mat-comp-tehran', group: 'math', major: 'مهندسی کامپیوتر', uni: 'دانشگاه تهران', city: 'تهران', course: 'روزانه', cutoffs: { region1: 215, region2: 125, region3: 78, country: 290, isargaran_5: 470, isargaran_25: 1380 }, minTaraz: 11300, capacity: 120 },
    { id: 'mat-elec-tehran', group: 'math', major: 'مهندسی برق', uni: 'دانشگاه تهران', city: 'تهران', course: 'روزانه', cutoffs: { region1: 390, region2: 250, region3: 145, country: 540, isargaran_5: 820, isargaran_25: 2400 }, minTaraz: 10800, capacity: 140 },
    { id: 'mat-comp-aut', group: 'math', major: 'مهندسی کامپیوتر', uni: 'دانشگاه صنعتی امیرکبیر (پلی‌تکنیک)', city: 'تهران', course: 'روزانه', cutoffs: { region1: 330, region2: 195, region3: 115, country: 450, isargaran_5: 710, isargaran_25: 2100 }, minTaraz: 11000, capacity: 130 },
    { id: 'mat-mech-aut', group: 'math', major: 'مهندسی مکانیک', uni: 'دانشگاه صنعتی امیرکبیر (پلی‌تکنیک)', city: 'تهران', course: 'روزانه', cutoffs: { region1: 560, region2: 360, region3: 215, country: 770, isargaran_5: 1150, isargaran_25: 3300 }, minTaraz: 10450, capacity: 140 },
    { id: 'mat-comp-iust', group: 'math', major: 'مهندسی کامپیوتر', uni: 'دانشگاه علم و صنعت ایران', city: 'تهران', course: 'روزانه', cutoffs: { region1: 660, region2: 440, region3: 275, country: 920, isargaran_5: 1350, isargaran_25: 3900 }, minTaraz: 10300, capacity: 110 },
    { id: 'mat-comp-kntu', group: 'math', major: 'مهندسی کامپیوتر', uni: 'دانشگاه صنعتی خواجه نصیرالدین طوسی', city: 'تهران', course: 'روزانه', cutoffs: { region1: 970, region2: 660, region3: 420, country: 1350, isargaran_5: 1950, isargaran_25: 5600 }, minTaraz: 9850, capacity: 90 },
    { id: 'mat-comp-iut', group: 'math', major: 'مهندسی کامپیوتر', uni: 'دانشگاه صنعتی اصفهان', city: 'اصفهان', course: 'روزانه', cutoffs: { region1: 1250, region2: 880, region3: 535, country: 1680, isargaran_5: 2400, isargaran_25: 6800 }, minTaraz: 9550, capacity: 100 },
    { id: 'mat-comp-shiraz', group: 'math', major: 'مهندسی کامپیوتر', uni: 'دانشگاه شیراز', city: 'شیراز', course: 'روزانه', cutoffs: { region1: 1550, region2: 1100, region3: 680, country: 2100, isargaran_5: 2900, isargaran_25: 8200 }, minTaraz: 9300, capacity: 90 },
    { id: 'mat-comp-fum', group: 'math', major: 'مهندسی کامپیوتر', uni: 'دانشگاه فردوسی مشهد', city: 'مشهد', course: 'روزانه', cutoffs: { region1: 1650, region2: 1180, region3: 720, country: 2250, isargaran_5: 3100, isargaran_25: 8800 }, minTaraz: 9200, capacity: 90 },
    { id: 'mat-civil-tehran', group: 'math', major: 'مهندسی عمران', uni: 'دانشگاه تهران', city: 'تهران', course: 'روزانه', cutoffs: { region1: 1150, region2: 780, region3: 470, country: 1550, isargaran_5: 2200, isargaran_25: 6200 }, minTaraz: 9650, capacity: 110 },
    { id: 'mat-arch-tehran', group: 'math', major: 'مهندسی معماری', uni: 'دانشگاه تهران (پردیس هنرهای زیبا)', city: 'تهران', course: 'روزانه', cutoffs: { region1: 860, region2: 560, region3: 355, country: 1220, isargaran_5: 1750, isargaran_25: 4900 }, minTaraz: 9950, capacity: 60 },
    { id: 'mat-comp-azad-sr', group: 'math', major: 'مهندسی کامپیوتر', uni: 'دانشگاه آزاد اسلامی واحد علوم و تحقیقات', city: 'تهران', course: 'دانشگاه آزاد', cutoffs: { region1: 6500, region2: 5200, region3: 3800, country: 12500, isargaran_5: 9800, isargaran_25: 26000 }, minTaraz: 7100, capacity: 250 },
    { id: 'mat-comp-azad-tn', group: 'math', major: 'مهندسی کامپیوتر', uni: 'دانشگاه آزاد اسلامی تهران شمال / جنوب', city: 'تهران', course: 'دانشگاه آزاد', cutoffs: { region1: 8500, region2: 6800, region3: 4900, country: 16500, isargaran_5: 12500, isargaran_25: 32000 }, minTaraz: 6600, capacity: 300 },

    // === علوم انسانی (HUMANITIES) ===
    { id: 'hum-law-tehran', group: 'humanities', major: 'حقوق', uni: 'دانشگاه تهران', city: 'تهران', course: 'روزانه', cutoffs: { region1: 48, region2: 32, region3: 22, country: 64, isargaran_5: 110, isargaran_25: 320 }, minTaraz: 11700, capacity: 80 },
    { id: 'hum-law-beheshti', group: 'humanities', major: 'حقوق', uni: 'دانشگاه شهید بهشتی', city: 'تهران', course: 'روزانه', cutoffs: { region1: 98, region2: 68, region3: 47, country: 135, isargaran_5: 220, isargaran_25: 640 }, minTaraz: 11350, capacity: 70 },
    { id: 'hum-law-allameh', group: 'humanities', major: 'حقوق', uni: 'دانشگاه علامه طباطبایی', city: 'تهران', course: 'روزانه', cutoffs: { region1: 185, region2: 125, region3: 88, country: 255, isargaran_5: 390, isargaran_25: 1150 }, minTaraz: 10900, capacity: 80 },
    { id: 'hum-law-shiraz', group: 'humanities', major: 'حقوق', uni: 'دانشگاه شیراز', city: 'شیراز', course: 'روزانه', cutoffs: { region1: 360, region2: 245, region3: 165, country: 510, isargaran_5: 760, isargaran_25: 2200 }, minTaraz: 10400, capacity: 60 },
    { id: 'hum-law-fum', group: 'humanities', major: 'حقوق', uni: 'دانشگاه فردوسی مشهد', city: 'مشهد', course: 'روزانه', cutoffs: { region1: 390, region2: 265, region3: 180, country: 550, isargaran_5: 820, isargaran_25: 2400 }, minTaraz: 10300, capacity: 65 },
    { id: 'hum-judic-tehran', group: 'humanities', major: 'علوم قضایی (بورسیه قوه قضائیه)', uni: 'دانشگاه علوم قضایی و خدمات اداری', city: 'تهران', course: 'روزانه', cutoffs: { region1: 125, region2: 85, region3: 64, country: 168, isargaran_5: 270, isargaran_25: 780 }, minTaraz: 11150, capacity: 60 },
    { id: 'hum-psych-tehran', group: 'humanities', major: 'روانشناسی', uni: 'دانشگاه تهران', city: 'تهران', course: 'روزانه', cutoffs: { region1: 115, region2: 78, region3: 54, country: 155, isargaran_5: 250, isargaran_25: 730 }, minTaraz: 11200, capacity: 55 },
    { id: 'hum-psych-beheshti', group: 'humanities', major: 'روانشناسی', uni: 'دانشگاه شهید بهشتی', city: 'تهران', course: 'روزانه', cutoffs: { region1: 225, region2: 155, region3: 105, country: 310, isargaran_5: 480, isargaran_25: 1400 }, minTaraz: 10750, capacity: 50 },
    { id: 'hum-psych-allameh', group: 'humanities', major: 'روانشناسی', uni: 'دانشگاه علامه طباطبایی', city: 'تهران', course: 'روزانه', cutoffs: { region1: 290, region2: 195, region3: 135, country: 395, isargaran_5: 610, isargaran_25: 1780 }, minTaraz: 10550, capacity: 60 },
    { id: 'hum-farhangian-tehran', group: 'humanities', major: 'آموزش ابتدایی / دبیری (فرهنگیان)', uni: 'دانشگاه فرهنگیان (پردیس‌های تهران)', city: 'تهران', course: 'فرهنگیان', cutoffs: { region1: 3600, region2: 4700, region3: 3100, country: 6800, isargaran_5: 5800, isargaran_25: 15000 }, minTaraz: 8100, capacity: 350 },
    { id: 'hum-farhangian-shiraz', group: 'humanities', major: 'آموزش ابتدایی / دبیری (فرهنگیان)', uni: 'دانشگاه فرهنگیان شیراز / اصفهان', city: 'شیراز', course: 'فرهنگیان', cutoffs: { region1: 4200, region2: 5400, region3: 3600, country: 7900, isargaran_5: 6700, isargaran_25: 17500 }, minTaraz: 7850, capacity: 400 },
    { id: 'hum-fin-tehran', group: 'humanities', major: 'مدیریت مالی', uni: 'دانشگاه تهران', city: 'تهران', course: 'روزانه', cutoffs: { region1: 390, region2: 268, region3: 185, country: 530, isargaran_5: 810, isargaran_25: 2350 }, minTaraz: 10350, capacity: 50 },
    { id: 'hum-acc-tehran', group: 'humanities', major: 'حسابداری', uni: 'دانشگاه تهران', city: 'تهران', course: 'روزانه', cutoffs: { region1: 460, region2: 320, region3: 215, country: 635, isargaran_5: 950, isargaran_25: 2750 }, minTaraz: 10200, capacity: 60 },
    { id: 'hum-acc-allameh', group: 'humanities', major: 'حسابداری', uni: 'دانشگاه علامه طباطبایی', city: 'تهران', course: 'روزانه', cutoffs: { region1: 680, region2: 470, region3: 320, country: 940, isargaran_5: 1400, isargaran_25: 4100 }, minTaraz: 9800, capacity: 70 },
    { id: 'hum-pol-tehran', group: 'humanities', major: 'علوم سیاسی و روابط بین‌الملل', uni: 'دانشگاه تهران', city: 'تهران', course: 'روزانه', cutoffs: { region1: 620, region2: 430, region3: 295, country: 870, isargaran_5: 1300, isargaran_25: 3800 }, minTaraz: 9950, capacity: 60 },
    { id: 'hum-econ-tehran', group: 'humanities', major: 'اقتصاد', uni: 'دانشگاه تهران', city: 'تهران', course: 'روزانه', cutoffs: { region1: 760, region2: 510, region3: 355, country: 1080, isargaran_5: 1550, isargaran_25: 4500 }, minTaraz: 9750, capacity: 60 },
    { id: 'hum-soc-tehran', group: 'humanities', major: 'جامعه‌شناسی', uni: 'دانشگاه تهران', city: 'تهران', course: 'روزانه', cutoffs: { region1: 920, region2: 660, region3: 460, country: 1320, isargaran_5: 1900, isargaran_25: 5500 }, minTaraz: 9500, capacity: 50 },
    { id: 'hum-lit-tehran', group: 'humanities', major: 'زبان و ادبیات فارسی', uni: 'دانشگاه تهران', city: 'تهران', course: 'روزانه', cutoffs: { region1: 1100, region2: 780, region3: 540, country: 1580, isargaran_5: 2250, isargaran_25: 6500 }, minTaraz: 9350, capacity: 60 },
    { id: 'hum-law-azad-sr', group: 'humanities', major: 'حقوق', uni: 'دانشگاه آزاد اسلامی واحد علوم و تحقیقات', city: 'تهران', course: 'دانشگاه آزاد', cutoffs: { region1: 4500, region2: 3600, region3: 2800, country: 9200, isargaran_5: 7500, isargaran_25: 21000 }, minTaraz: 7600, capacity: 300 }
  ], []);

  // Effective Rank Calculation based on Mode & Quota
  const effectiveRank = n.useMemo(() => {
    if (mode === "taraz") {
      const t = parseFloat(tarazInput) || 8000;
      if (t >= 11500) return 90;
      if (t >= 11000) return 250;
      if (t >= 10500) return 550;
      if (t >= 10000) return 1100;
      if (t >= 9500) return 2100;
      if (t >= 9000) return 3800;
      if (t >= 8500) return 6500;
      if (t >= 8000) return 10500;
      if (t >= 7500) return 16500;
      if (t >= 7000) return 24000;
      return 35000;
    }
    if (mode === "rank_country") {
      const c = parseInt(rankInput, 10) || 5000;
      const ratio = quota === "region1" ? 0.45 : quota === "region2" ? 0.55 : quota === "region3" ? 0.35 : quota === "isargaran_5" ? 0.60 : 0.85;
      return Math.max(1, Math.round(c * ratio));
    }
    return Math.max(1, parseInt(rankInput, 10) || 1500);
  }, [mode, rankInput, tarazInput, quota]);

  // Compute Chance for each record
  const evaluatedRecords = n.useMemo(() => {
    return ADMISSION_DATABASE
      .filter(item => item.group === group)
      .map(item => {
        const cutoff = item.cutoffs[quota] || item.cutoffs.region1;
        const ratio = effectiveRank / cutoff;
        let chancePercent = 5;
        let status = 'reach'; // safe | likely | borderline | reach

        if (ratio <= 0.65) {
          chancePercent = Math.min(99, Math.round(99 - ratio * 8));
          status = 'safe';
        } else if (ratio <= 0.85) {
          chancePercent = Math.round(95 - (ratio - 0.65) * 60);
          status = 'safe';
        } else if (ratio <= 1.0) {
          chancePercent = Math.round(83 - (ratio - 0.85) * 120);
          status = 'likely';
        } else if (ratio <= 1.15) {
          chancePercent = Math.round(65 - (ratio - 1.0) * 166);
          status = 'borderline';
        } else if (ratio <= 1.35) {
          chancePercent = Math.round(40 - (ratio - 1.15) * 125);
          status = 'reach';
        } else {
          chancePercent = Math.max(2, Math.round(15 / (ratio * 0.9)));
          status = 'reach';
        }

        const diff = cutoff - effectiveRank;

        return {
          ...item,
          cutoff,
          chancePercent,
          status,
          diff
        };
      });
  }, [ADMISSION_DATABASE, group, quota, effectiveRank]);

  // Counts by zone
  const stats = n.useMemo(() => {
    const safeCount = evaluatedRecords.filter(r => r.status === 'safe').length;
    const likelyCount = evaluatedRecords.filter(r => r.status === 'likely').length;
    const borderCount = evaluatedRecords.filter(r => r.status === 'borderline').length;
    const reachCount = evaluatedRecords.filter(r => r.status === 'reach').length;
    const total = evaluatedRecords.length;
    return { safeCount, likelyCount, borderCount, reachCount, total };
  }, [evaluatedRecords]);

  // Filter & Sort
  const filteredRecords = n.useMemo(() => {
    return evaluatedRecords.filter(item => {
      const matchSearch = search.trim() === "" || 
        _lc(item.major).includes(_lc(search)) || 
        _lc(item.uni).includes(_lc(search)) ||
        _lc(item.city).includes(_lc(search));
      
      const matchCourse = courseFilter === "all" || item.course === courseFilter;
      const matchChance = chanceFilter === "all" || item.status === chanceFilter;
      const matchCity = cityFilter === "all" || 
        (cityFilter === "تهران" && item.city === "تهران") ||
        (cityFilter === "سایر" && item.city !== "تهران") ||
        (item.city === cityFilter);

      return matchSearch && matchCourse && matchChance && matchCity;
    }).sort((a, b) => {
      if (sortBy === "chance_desc") return b.chancePercent - a.chancePercent;
      if (sortBy === "chance_asc") return a.chancePercent - b.chancePercent;
      if (sortBy === "rank_asc") return a.cutoff - b.cutoff;
      if (sortBy === "rank_desc") return b.cutoff - a.cutoff;
      if (sortBy === "alpha") return a.uni.localeCompare(b.uni, 'fa');
      return 0;
    });
  }, [evaluatedRecords, search, courseFilter, chanceFilter, cityFilter, sortBy]);

  const toggleSave = (id) => {
    setSavedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const copySummary = () => {
    const safeItems = evaluatedRecords.filter(r => r.status === 'safe').slice(0, 5).map(r => `• ${r.major} - ${r.uni} (${r.course})`).join('\n');
    const likelyItems = evaluatedRecords.filter(r => r.status === 'likely').slice(0, 5).map(r => `• ${r.major} - ${r.uni} (${r.course})`).join('\n');
    const textToCopy = `📊 گزارش تخمین شانس قبولی کنکور سراسری کافئین:\nرتبه در سهمیه: ${effectiveRank.toLocaleString('fa-IR')} | سهمیه: ${quota === 'region1' ? 'منطقه ۱' : quota === 'region2' ? 'منطقه ۲' : quota === 'region3' ? 'منطقه ۳' : 'ایثارگران'}\n\n🟢 گزینه‌های قبولی حتمی و قطعی:\n${safeItems || 'موردی یافت نشد'}\n\n🔵 گزینه‌های شانس بالا:\n${likelyItems || 'موردی یافت نشد'}\n\n✨ محاسبه شده با سامانه جعبه ابزار تخصصی کافئین`;
    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopiedStatus(!0);
      setTimeout(() => setCopiedStatus(!1), 2500);
    });
  };

  const setPreset = (r) => {
    setMode("rank_quota");
    setRankInput(String(r));
  };

  return e.jsxs("div", { className: "space-y-8 animate-in fade-in", children: [
    // Header
    e.jsxs("div", { className: "flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100", children: [
      e.jsxs("div", { className: "space-y-1.5", children: [
        e.jsxs("div", { className: "inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 text-sky-700 border border-sky-200 text-xs font-bold", children: [
          e.jsx(Me, { className: "w-3.5 h-3.5 text-sky-600" }),
          e.jsx("span", { children: "ابزار تخصصی سنجش و شبیه‌سازی انتخاب رشته" })
        ]}),
        e.jsx("h2", { className: "text-xl sm:text-2xl font-black text-slate-900", children: "تخمین هوشمند شانس قبولی دانشگاه بر پایه کارنامه‌های رسمی" }),
        e.jsx("p", { className: "text-xs sm:text-sm text-slate-500 max-w-2xl", children: "رتبه یا تراز خود را وارد نمایید تا شانس قبولی شما در رشته‌ها و دانشگاه‌های سراسری و آزاد در ۴ طیف تحلیلی شبیه‌سازی شود." })
      ]}),
      e.jsxs("div", { className: "flex items-center gap-2", children: [
        savedIds.length > 0 && e.jsxs("button", { onClick: () => setShowSavedModal(!0), className: "px-3.5 py-2 rounded-2xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm cursor-pointer", children: [
          e.jsx(ye, { className: "w-4 h-4 text-amber-600 fill-amber-500" }),
          e.jsxs("span", { children: ["اولویت‌های نشان‌شده (", savedIds.length, ")"] })
        ]}),
        e.jsxs("button", { onClick: copySummary, className: "px-3.5 py-2 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm cursor-pointer", children: [
          e.jsx(Ce, { className: "w-4 h-4 text-emerald-400" }),
          e.jsx("span", { children: copiedStatus ? "کپی شد! ✓" : "کپی گزارش خلاصه" })
        ]})
      ]})
    ]}),

    // Input & Configuration Panel
    e.jsxs("div", { className: "bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white border border-slate-800 shadow-xl space-y-6 relative overflow-hidden", children: [
      e.jsx("div", { className: "absolute top-0 left-0 w-80 h-80 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" }),
      
      // Selectors row
      e.jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-4 relative z-10", children: [
        e.jsxs("div", { className: "space-y-1.5", children: [
          e.jsx("label", { className: "block text-xs font-bold text-slate-300", children: "۱. گروه آزمایشی:" }),
          e.jsxs("select", { value: group, onChange: t => setGroup(t.target.value), className: "w-full p-3 rounded-2xl bg-slate-800/90 border border-slate-700 text-xs font-bold text-white focus:ring-2 focus:ring-sky-400 outline-none", children: [
            e.jsx("option", { value: "experimental", children: "علوم تجربی (پزشکی، دندان، دارو، پیرا...)" }),
            e.jsx("option", { value: "math", children: "ریاضی و فنی (کامپیوتر، برق، مکانیک، صنایع...)" }),
            e.jsx("option", { value: "humanities", children: "علوم انسانی (حقوق، روانشناسی، فرهنگیان...)" })
          ]})
        ]}),

        e.jsxs("div", { className: "space-y-1.5", children: [
          e.jsx("label", { className: "block text-xs font-bold text-slate-300", children: "۲. سهمیه قبولی:" }),
          e.jsxs("select", { value: quota, onChange: t => setQuota(t.target.value), className: "w-full p-3 rounded-2xl bg-slate-800/90 border border-slate-700 text-xs font-bold text-white focus:ring-2 focus:ring-sky-400 outline-none", children: [
            e.jsx("option", { value: "region1", children: "سهمیه منطقه ۱ (تهران، مشهد، اصفهان، شیراز، تبریز)" }),
            e.jsx("option", { value: "region2", children: "سهمیه منطقه ۲ (مراکز استان‌ها و شهرستان‌های بزرگ)" }),
            e.jsx("option", { value: "region3", children: "سهمیه منطقه ۳ (مناطق محروم و کمتر توسعه‌یافته)" }),
            e.jsx("option", { value: "isargaran_5", children: "سهمیه ۵٪ ایثارگران" }),
            e.jsx("option", { value: "isargaran_25", children: "سهمیه ۲۵٪ ایثارگران" })
          ]})
        ]}),

        e.jsxs("div", { className: "space-y-1.5", children: [
          e.jsx("label", { className: "block text-xs font-bold text-slate-300", children: "۳. شیوه محاسبه:" }),
          e.jsxs("select", { value: mode, onChange: t => setMode(t.target.value), className: "w-full p-3 rounded-2xl bg-slate-800/90 border border-slate-700 text-xs font-bold text-white focus:ring-2 focus:ring-sky-400 outline-none", children: [
            e.jsx("option", { value: "rank_quota", children: "ورود مستقیم رتبه در سهمیه (پیشنهادی)" }),
            e.jsx("option", { value: "rank_country", children: "ورود رتبه کل کشوری" }),
            e.jsx("option", { value: "taraz", children: "ورود تراز نهایی کنکور و سوابق" })
          ]})
        ]})
      ]}),

      // Input Value & Quick Presets
      e.jsxs("div", { className: "bg-white/10 backdrop-blur-md p-5 rounded-2xl border border-white/15 flex flex-col sm:flex-row items-center justify-between gap-5 relative z-10", children: [
        e.jsxs("div", { className: "flex-1 w-full space-y-2", children: [
          e.jsxs("div", { className: "flex items-center justify-between", children: [
            e.jsx("span", { className: "text-xs font-bold text-indigo-200", children: mode === "taraz" ? "تراز کل کنکور و سوابق (۵۰۰۰ تا ۱۲۵۰۰):" : mode === "rank_country" ? "رتبه کل کشوری بدون سهمیه:" : "رتبه دقیق در سهمیه نهایی:" }),
            e.jsxs("span", { className: "text-xs font-bold text-sky-300 font-mono", children: ["رتبه معادل مبنا: ", effectiveRank.toLocaleString("fa-IR")] })
          ]}),
          e.jsx("input", {
            type: "text",
            dir: "ltr",
            value: mode === "taraz" ? tarazInput : rankInput,
            onChange: t => mode === "taraz" ? setTarazInput(t.target.value) : setRankInput(t.target.value),
            className: "w-full p-3.5 rounded-xl bg-slate-900/90 border border-indigo-400/40 text-xl font-black text-emerald-400 text-left outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-500/30",
            placeholder: mode === "taraz" ? "9850" : "1450"
          })
        ]}),

        // Quick presets
        e.jsxs("div", { className: "w-full sm:w-auto space-y-1.5", children: [
          e.jsx("span", { className: "text-[11px] font-bold text-slate-300 block text-right", children: "تست سریع رتبه‌های پرتکرار:" }),
          e.jsxs("div", { className: "flex flex-wrap gap-1.5", children: [
            [350, 950, 1800, 3800, 7500, 15000].map(r => e.jsx("button", {
              key: r,
              onClick: () => setPreset(r),
              className: `px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${effectiveRank === r ? "bg-sky-500 text-white shadow-md shadow-sky-500/30" : "bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700"}`,
              children: r.toLocaleString("fa-IR")
            }))
          ]})
        ]})
      ]})
    ]}),

    // 4 Probability Zone Stat Cards
    e.jsxs("div", { className: "grid grid-cols-2 lg:grid-cols-4 gap-3.5", children: [
      // Safe (85%+)
      e.jsxs("button", {
        onClick: () => setChanceFilter(chanceFilter === "safe" ? "all" : "safe"),
        className: `p-4 rounded-3xl border transition-all text-right cursor-pointer flex flex-col justify-between ${chanceFilter === "safe" ? "bg-emerald-500 text-white border-emerald-600 shadow-lg ring-2 ring-emerald-300" : "bg-emerald-50/70 border-emerald-200 hover:bg-emerald-100/70 text-slate-900"}`,
        children: [
          e.jsxs("div", { className: "flex items-center justify-between w-full mb-2", children: [
            e.jsx("span", { className: `text-xs font-black ${chanceFilter === "safe" ? "text-emerald-100" : "text-emerald-800"}`, children: "🟢 قبولی حتمی و قطعی" }),
            e.jsx("span", { className: `text-[10px] px-2 py-0.5 rounded-full font-bold ${chanceFilter === "safe" ? "bg-white/20 text-white" : "bg-emerald-200 text-emerald-900"}`, children: "بیش از ۸۵٪" })
          ]}),
          e.jsxs("div", { className: "flex items-baseline gap-1.5", children: [
            e.jsx("span", { className: "text-2xl sm:text-3xl font-black", children: stats.safeCount.toLocaleString("fa-IR") }),
            e.jsx("span", { className: `text-xs font-bold ${chanceFilter === "safe" ? "text-emerald-100" : "text-slate-500"}`, children: "کدرشته‌محل" })
          ]}),
          e.jsx("p", { className: `text-[11px] mt-1.5 leading-snug ${chanceFilter === "safe" ? "text-emerald-100" : "text-emerald-700"}`, children: "رتبه شما بسیار بهتر از آخرین رتبه قبولی سال قبل است." })
        ]
      }),

      // Likely (60%-85%)
      e.jsxs("button", {
        onClick: () => setChanceFilter(chanceFilter === "likely" ? "all" : "likely"),
        className: `p-4 rounded-3xl border transition-all text-right cursor-pointer flex flex-col justify-between ${chanceFilter === "likely" ? "bg-sky-600 text-white border-sky-700 shadow-lg ring-2 ring-sky-300" : "bg-sky-50/70 border-sky-200 hover:bg-sky-100/70 text-slate-900"}`,
        children: [
          e.jsxs("div", { className: "flex items-center justify-between w-full mb-2", children: [
            e.jsx("span", { className: `text-xs font-black ${chanceFilter === "likely" ? "text-sky-100" : "text-sky-800"}`, children: "🔵 شانس بسیار بالا" }),
            e.jsx("span", { className: `text-[10px] px-2 py-0.5 rounded-full font-bold ${chanceFilter === "likely" ? "bg-white/20 text-white" : "bg-sky-200 text-sky-900"}`, children: "۶۰٪ تا ۸۵٪" })
          ]}),
          e.jsxs("div", { className: "flex items-baseline gap-1.5", children: [
            e.jsx("span", { className: "text-2xl sm:text-3xl font-black", children: stats.likelyCount.toLocaleString("fa-IR") }),
            e.jsx("span", { className: `text-xs font-bold ${chanceFilter === "likely" ? "text-sky-100" : "text-slate-500"}`, children: "کدرشته‌محل" })
          ]}),
          e.jsx("p", { className: `text-[11px] mt-1.5 leading-snug ${chanceFilter === "likely" ? "text-sky-100" : "text-sky-700"}`, children: "رتبه شما در بازه میانه داوطلبان پذیرفته‌شده قرار دارد." })
        ]
      }),

      // Borderline (35%-60%)
      e.jsxs("button", {
        onClick: () => setChanceFilter(chanceFilter === "borderline" ? "all" : "borderline"),
        className: `p-4 rounded-3xl border transition-all text-right cursor-pointer flex flex-col justify-between ${chanceFilter === "borderline" ? "bg-amber-500 text-white border-amber-600 shadow-lg ring-2 ring-amber-300" : "bg-amber-50/70 border-amber-200 hover:bg-amber-100/70 text-slate-900"}`,
        children: [
          e.jsxs("div", { className: "flex items-center justify-between w-full mb-2", children: [
            e.jsx("span", { className: `text-xs font-black ${chanceFilter === "borderline" ? "text-amber-100" : "text-amber-800"}`, children: "🟡 شانس منطقی و لب‌مرز" }),
            e.jsx("span", { className: `text-[10px] px-2 py-0.5 rounded-full font-bold ${chanceFilter === "borderline" ? "bg-white/20 text-white" : "bg-amber-200 text-amber-900"}`, children: "۳۵٪ تا ۶۰٪" })
          ]}),
          e.jsxs("div", { className: "flex items-baseline gap-1.5", children: [
            e.jsx("span", { className: "text-2xl sm:text-3xl font-black", children: stats.borderCount.toLocaleString("fa-IR") }),
            e.jsx("span", { className: `text-xs font-bold ${chanceFilter === "borderline" ? "text-amber-100" : "text-slate-500"}`, children: "کدرشته‌محل" })
          ]}),
          e.jsx("p", { className: `text-[11px] mt-1.5 leading-snug ${chanceFilter === "borderline" ? "text-amber-100" : "text-amber-700"}`, children: "بسیار نزدیک به کف قبولی سال قبل؛ حتماً در انتخاب رشته درج شود." })
        ]
      }),

      // Reach (10%-35%)
      e.jsxs("button", {
        onClick: () => setChanceFilter(chanceFilter === "reach" ? "all" : "reach"),
        className: `p-4 rounded-3xl border transition-all text-right cursor-pointer flex flex-col justify-between ${chanceFilter === "reach" ? "bg-rose-600 text-white border-rose-700 shadow-lg ring-2 ring-rose-300" : "bg-rose-50/70 border-rose-200 hover:bg-rose-100/70 text-slate-900"}`,
        children: [
          e.jsxs("div", { className: "flex items-center justify-between w-full mb-2", children: [
            e.jsx("span", { className: `text-xs font-black ${chanceFilter === "reach" ? "text-rose-100" : "text-rose-800"}`, children: "🔴 شانس کم و ریسکی" }),
            e.jsx("span", { className: `text-[10px] px-2 py-0.5 rounded-full font-bold ${chanceFilter === "reach" ? "bg-white/20 text-white" : "bg-rose-200 text-rose-900"}`, children: "کمتر از ۳۵٪" })
          ]}),
          e.jsxs("div", { className: "flex items-baseline gap-1.5", children: [
            e.jsx("span", { className: "text-2xl sm:text-3xl font-black", children: stats.reachCount.toLocaleString("fa-IR") }),
            e.jsx("span", { className: `text-xs font-bold ${chanceFilter === "reach" ? "text-rose-100" : "text-slate-500"}`, children: "کدرشته‌محل" })
          ]}),
          e.jsx("p", { className: `text-[11px] mt-1.5 leading-snug ${chanceFilter === "reach" ? "text-rose-100" : "text-rose-700"}`, children: "گزینه‌های خوش‌بینانه و رویایی برای اولویت‌های نخست فرم." })
        ]
      })
    ]}),

    // Search and Filter Bar
    e.jsxs("div", { className: "bg-white p-4 rounded-3xl border border-slate-200/80 shadow-sm space-y-3", children: [
      e.jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3", children: [
        e.jsxs("div", { className: "relative", children: [
          e.jsx(Ne, { className: "w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" }),
          e.jsx("input", {
            type: "text",
            placeholder: "جستجوی رشته (پزشکی، کامپیوتر...) یا دانشگاه...",
            value: search,
            onChange: t => setSearch(t.target.value),
            className: "w-full pl-3 pr-10 py-2.5 rounded-2xl border border-slate-200 text-xs font-bold text-slate-800 placeholder:text-slate-400 outline-none focus:border-sky-500"
          })
        ]}),

        e.jsxs("select", { value: courseFilter, onChange: t => setCourseFilter(t.target.value), className: "w-full p-2.5 rounded-2xl border border-slate-200 text-xs font-bold text-slate-800 bg-white", children: [
          e.jsx("option", { value: "all", children: "همه دوره‌ها (روزانه / پردیس / آزاد / فرهنگیان)" }),
          e.jsx("option", { value: "روزانه", children: "فقط روزانه (دولتی رایگان)" }),
          e.jsx("option", { value: "پردیس خودگردان", children: "فقط پردیس خودگردان (بین‌الملل)" }),
          e.jsx("option", { value: "دانشگاه آزاد", children: "فقط دانشگاه آزاد اسلامی" }),
          e.jsx("option", { value: "فرهنگیان", children: "فقط فرهنگیان و تربیت معلم" })
        ]}),

        e.jsxs("select", { value: cityFilter, onChange: t => setCityFilter(t.target.value), className: "w-full p-2.5 rounded-2xl border border-slate-200 text-xs font-bold text-slate-800 bg-white", children: [
          e.jsx("option", { value: "all", children: "همه استان‌ها و شهرها" }),
          e.jsx("option", { value: "تهران", children: "دانشگاه‌های شهر تهران" }),
          e.jsx("option", { value: "اصفهان", children: "اصفهان" }),
          e.jsx("option", { value: "شیراز", children: "شیراز" }),
          e.jsx("option", { value: "مشهد", children: "مشهد" }),
          e.jsx("option", { value: "تبریز", children: "تبریز" }),
          e.jsx("option", { value: "سایر", children: "سایر شهرستان‌ها و مراکز استان" })
        ]}),

        e.jsxs("select", { value: sortBy, onChange: t => setSortBy(t.target.value), className: "w-full p-2.5 rounded-2xl border border-slate-200 text-xs font-bold text-slate-800 bg-white", children: [
          e.jsx("option", { value: "chance_desc", children: "مرتب‌سازی: بیشترین شانس قبولی" }),
          e.jsx("option", { value: "chance_asc", children: "مرتب‌سازی: کمترین شانس قبولی" }),
          e.jsx("option", { value: "rank_asc", children: "مرتب‌سازی: رتبه مورد نیاز (سخت به آسان)" }),
          e.jsx("option", { value: "rank_desc", children: "مرتب‌سازی: رتبه مورد نیاز (آسان به سخت)" }),
          e.jsx("option", { value: "alpha", children: "مرتب‌سازی: الفبای نام دانشگاه" })
        ]})
      ]}),

      // Active filters pills
      e.jsxs("div", { className: "flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs", children: [
        e.jsxs("div", { className: "flex items-center gap-2 text-slate-500", children: [
          e.jsx("span", { className: "font-bold", children: "تعداد نتایج منطبق:" }),
          e.jsxs("span", { className: "font-black text-slate-900 px-2 py-0.5 rounded-lg bg-slate-100", children: [filteredRecords.length.toLocaleString("fa-IR"), " کدرشته"] })
        ]}),
        (chanceFilter !== "all" || courseFilter !== "all" || cityFilter !== "all" || search !== "") && e.jsxs("button", {
          onClick: () => { setChanceFilter("all"); setCourseFilter("all"); setCityFilter("all"); setSearch(""); },
          className: "text-rose-600 hover:text-rose-800 font-bold transition-colors cursor-pointer",
          children: "پاک‌کردن فیلترها ✕"
        })
      ]})
    ]}),

    // Results Table / Cards
    e.jsxs("div", { className: "bg-white rounded-3xl border border-slate-200/80 shadow-lg overflow-hidden space-y-0", children: [
      e.jsxs("div", { className: "p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between", children: [
        e.jsxs("span", { className: "text-xs font-bold text-slate-700 flex items-center gap-2", children: [
          e.jsx(Me, { className: "w-4 h-4 text-indigo-600" }),
          `لیست رشته‌محل‌های برآورد شده برای رتبه ${effectiveRank.toLocaleString('fa-IR')}`
        ]}),
        e.jsx(z, { variant: "mint", size: "sm", children: "بر مبنای کنکور ۱۴۰۳ و پیش‌بینی ۱۴۰۴" })
      ]}),

      filteredRecords.length === 0 ? e.jsxs("div", { className: "p-12 text-center space-y-3", children: [
        e.jsx("div", { className: "w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto text-xl font-bold", children: "🔍" }),
        e.jsx("h4", { className: "text-sm font-black text-slate-800", children: "هیچ رشته‌محلی با این مشخصات و فیلترها یافت نشد" }),
        e.jsx("p", { className: "text-xs text-slate-500", children: "لطفاً عبارت جستجو را تغییر دهید یا فیلتر سطح شانس و دوره‌ها را روی حالت «همه» بگذارید." }),
        e.jsx("button", { onClick: () => { setSearch(""); setChanceFilter("all"); setCourseFilter("all"); }, className: "px-4 py-2 rounded-xl bg-sky-600 text-white text-xs font-bold hover:bg-sky-700 transition-all", children: "نمایش همه رشته‌ها" })
      ]}) : e.jsx("div", { className: "overflow-x-auto", children:
        e.jsxs("table", { className: "w-full text-right text-xs", children: [
          e.jsx("thead", { children:
            e.jsxs("tr", { className: "border-b border-slate-200 bg-slate-50/70 text-slate-500 font-bold", children: [
              e.jsx("th", { className: "p-4", children: "رشته تحصیلی" }),
              e.jsx("th", { className: "p-4", children: "دانشگاه و شهر" }),
              e.jsx("th", { className: "p-4", children: "دوره" }),
              e.jsx("th", { className: "p-4 text-center", children: "آخرین رتبه قبولی سال قبل" }),
              e.jsx("th", { className: "p-4 text-center", children: "اختلاف با رتبه شما" }),
              e.jsx("th", { className: "p-4 text-center", children: "درصد شانس قبولی" }),
              e.jsx("th", { className: "p-4 text-center", children: "وضعیت قبولی" }),
              e.jsx("th", { className: "p-4 text-center", children: "اقدام" })
            ]})
          }),
          e.jsx("tbody", { className: "divide-y divide-slate-100", children:
            filteredRecords.map(item => {
              const isSaved = savedIds.includes(item.id);
              return e.jsxs("tr", { key: item.id, className: `hover:bg-sky-50/50 transition-colors ${item.status === 'safe' ? 'bg-emerald-50/15' : item.status === 'likely' ? 'bg-sky-50/15' : ''}`, children: [
                e.jsxs("td", { className: "p-4", children: [
                  e.jsx("span", { className: "font-black text-slate-900 block text-sm", children: item.major }),
                  e.jsxs("span", { className: "text-[10px] text-slate-400 block mt-0.5", children: ["کف تراز پیشنهادی: ", item.minTaraz.toLocaleString('fa-IR')] })
                ]}),
                e.jsxs("td", { className: "p-4", children: [
                  e.jsx("span", { className: "font-bold text-slate-800 block", children: item.uni }),
                  e.jsxs("span", { className: "text-[11px] text-slate-500", children: ["شهر: ", item.city] })
                ]}),
                e.jsx("td", { className: "p-4", children:
                  e.jsx("span", { className: `px-2 py-0.5 rounded-lg text-[10px] font-bold ${item.course === 'روزانه' ? 'bg-emerald-100 text-emerald-800' : item.course === 'پردیس خودگردان' ? 'bg-purple-100 text-purple-800' : item.course === 'فرهنگیان' ? 'bg-sky-100 text-sky-800' : 'bg-amber-100 text-amber-800'}`, children: item.course })
                }),
                e.jsx("td", { className: "p-4 text-center font-black text-slate-900 font-mono text-sm", children:
                  item.cutoff.toLocaleString('fa-IR')
                }),
                e.jsx("td", { className: "p-4 text-center", children:
                  item.diff >= 0 ? e.jsxs("span", { className: "px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-black text-[11px] font-mono", children: ["+", item.diff.toLocaleString('fa-IR'), " بهتر"] }) :
                                  e.jsxs("span", { className: "px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 font-black text-[11px] font-mono", children: [Math.abs(item.diff).toLocaleString('fa-IR'), " رتبه فاصله"] })
                }),
                e.jsxs("td", { className: "p-4 text-center", children: [
                  e.jsxs("span", { className: `text-sm font-black font-mono block ${item.status === 'safe' ? 'text-emerald-700' : item.status === 'likely' ? 'text-sky-700' : item.status === 'borderline' ? 'text-amber-700' : 'text-rose-700'}`, children: [item.chancePercent, "%"] }),
                  e.jsx("div", { className: "w-16 mx-auto bg-slate-200 rounded-full h-1.5 overflow-hidden mt-1", children:
                    e.jsx("div", { className: `h-full rounded-full ${item.status === 'safe' ? 'bg-emerald-500' : item.status === 'likely' ? 'bg-sky-500' : item.status === 'borderline' ? 'bg-amber-500' : 'bg-rose-500'}`, style: { width: `${item.chancePercent}%` } })
                  })
                ]}),
                e.jsx("td", { className: "p-4 text-center", children:
                  item.status === 'safe' ? e.jsx("span", { className: "px-2.5 py-1 rounded-xl bg-emerald-100 text-emerald-800 font-black text-[11px]", children: "🟢 قبولی حتمی" }) :
                  item.status === 'likely' ? e.jsx("span", { className: "px-2.5 py-1 rounded-xl bg-sky-100 text-sky-800 font-black text-[11px]", children: "🔵 شانس بالا" }) :
                  item.status === 'borderline' ? e.jsx("span", { className: "px-2.5 py-1 rounded-xl bg-amber-100 text-amber-800 font-black text-[11px]", children: "🟡 لب‌مرز" }) :
                  e.jsx("span", { className: "px-2.5 py-1 rounded-xl bg-rose-100 text-rose-800 font-black text-[11px]", children: "🔴 ریسکی" })
                }),
                e.jsx("td", { className: "p-4 text-center", children:
                  e.jsxs("button", {
                    onClick: () => toggleSave(item.id),
                    className: `p-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 mx-auto ${isSaved ? "bg-amber-500 text-white shadow-sm" : "bg-slate-100 hover:bg-slate-200 text-slate-700"}`,
                    title: isSaved ? "حذف از نشان‌شده‌ها" : "افزودن به نشان‌شده‌ها",
                    children: [
                      e.jsx(ye, { className: `w-3.5 h-3.5 ${isSaved ? "fill-white text-white" : "text-slate-500"}` }),
                      e.jsx("span", { className: "text-[10px]", children: isSaved ? "نشان شده" : "ذخیره" })
                    ]
                  })
                })
              ]});
            })
          })
        ]})
      })
    ]}),

    // Strategic Guidance Card
    e.jsxs("div", { className: "p-6 rounded-3xl bg-gradient-to-r from-indigo-50 via-sky-50 to-emerald-50 border border-indigo-100 flex flex-col md:flex-row items-center justify-between gap-6", children: [
      e.jsxs("div", { className: "space-y-2 text-right", children: [
        e.jsxs("div", { className: "flex items-center gap-2", children: [
          e.jsx(Me, { className: "w-5 h-5 text-indigo-700" }),
          e.jsx("h4", { className: "text-base font-black text-slate-900", children: "توصیه استراتژیک چیدمان فرم انتخاب رشته سنجش" })
        ]}),
        e.jsx("p", { className: "text-xs text-slate-600 max-w-2xl leading-relaxed", children: "طبق فرمول استاندارد آکادمی کافئین، بهترین ساختار ۱۵۰ انتخاب کنکور شامل: ۳۰ انتخاب خوش‌بینانه و ریسکی (۲۰٪)، ۷۵ انتخاب منطقی و شانس بالا (۵۰٪) و ۴۵ انتخاب قبولی قطعی و حتمی (۳۰٪) می‌باشد تا حداکثر آرامش خاطر و قبولی در بالاترین اولویت حاصل شود." })
      ]}),
      e.jsxs("div", { className: "flex flex-wrap items-center gap-2 shrink-0", children: [
        e.jsx("button", { onClick: () => onNavigate("assessment"), className: "px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black shadow-md shadow-indigo-200 transition-all cursor-pointer", children: "ورود به سیستم جامع انتخاب رشته ←" }),
        e.jsx("button", { onClick: () => onNavigate("consulting"), className: "px-4 py-2.5 rounded-2xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold transition-all cursor-pointer", children: "رزرو مشاوره انتخاب رشته" })
      ]})
    ]}),

    // Saved Items Modal
    showSavedModal && e.jsx("div", { className: "fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto", children:
      e.jsxs("div", { className: "bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 border border-slate-200 shadow-2xl space-y-6 animate-in zoom-in-95", children: [
        e.jsxs("div", { className: "flex items-center justify-between pb-4 border-b border-slate-100", children: [
          e.jsxs("div", { children: [
            e.jsx("h3", { className: "text-lg font-black text-slate-900", children: "لیست رشته‌محل‌های منتخب شما" }),
            e.jsxs("p", { className: "text-xs text-slate-500 mt-0.5", children: ["تعداد ", savedIds.length, " اولویت ذخیره‌شده برای رتبه ", effectiveRank.toLocaleString("fa-IR")] })
          ]}),
          e.jsx("button", { onClick: () => setShowSavedModal(!1), className: "p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer", children: "✕" })
        ]}),

        e.jsx("div", { className: "max-h-80 overflow-y-auto space-y-2 divide-y divide-slate-100", children:
          savedIds.map(id => {
            const item = ADMISSION_DATABASE.find(x => x.id === id);
            if (!item) return null;
            return e.jsxs("div", { key: id, className: "pt-2 flex items-center justify-between text-xs", children: [
              e.jsxs("div", { children: [
                e.jsx("span", { className: "font-black text-slate-900 block", children: item.major }),
                e.jsxs("span", { className: "text-[11px] text-slate-500", children: [item.uni, " (", item.course, ") • شهر: ", item.city] })
              ]}),
              e.jsx("button", { onClick: () => toggleSave(id), className: "text-rose-600 hover:text-rose-800 text-[11px] font-bold p-1", children: "حذف" })
            ]});
          })
        }),

        e.jsxs("div", { className: "pt-4 border-t border-slate-100 flex items-center justify-between", children: [
          e.jsx("button", { onClick: () => setSavedIds([]), className: "text-xs text-rose-600 hover:underline font-bold", children: "پاک‌کردن همه" }),
          e.jsx("button", { onClick: () => setShowSavedModal(!1), className: "px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold", children: "بستن" })
        ]})
      ]})
    })
  ]});
};

const $e=({initialTool:D="rank-estimator",onNavigate:V,onLeadCaptured:p,currentUserRole:passedRole})=>{const[userRole,setUserRole]=n.useState(()=>{if(passedRole)return passedRole;try{const raw=localStorage.getItem("caffeine_auth_user_session_v1");if(raw){const u=JSON.parse(raw);if(u&&u.role)return u.role;}}catch(e){}return"student";});n.useEffect(()=>{if(passedRole){setUserRole(passedRole);}const syncRole=()=>{try{const raw=localStorage.getItem("caffeine_auth_user_session_v1");if(raw){const u=JSON.parse(raw);if(u&&u.role)setUserRole(u.role);}}catch(e){}};const onAuthEvent=(e)=>{const u=e?.detail?.user||e?.detail;if(u&&u.role)setUserRole(u.role);};window.addEventListener("caffeine_auth_state_changed",onAuthEvent);window.addEventListener("storage",syncRole);return()=>{window.removeEventListener("caffeine_auth_state_changed",onAuthEvent);window.removeEventListener("storage",syncRole);};},[passedRole]);const isUserAdmin=userRole==="admin";
  const[j,N]=n.useState(D),
       [$,b]=n.useState("experimental"),
       [X,q]=n.useState("region1"),
       [oe,Y]=n.useState("19.3"),
       [ee,w]=n.useState({bio:72,chem:65,phys:58,math_exp:52,geo:45}),
       [se,R]=n.useState(null),
       [B,g]=n.useState("19.5"),
       [u,H]=n.useState("19.2"),
       [K,y]=n.useState("19.0"),
       [O,k]=n.useState(null),
       [T,S]=n.useState("u-tehran-uni"),
       [A,C]=n.useState("u-sharif"),
       [_,f]=n.useState("m-medicine"),
       [U,I]=n.useState("m-dentistry"),
       [v,M]=n.useState(8),
       [E,L]=n.useState(null),
       te=()=>{const t=parseFloat(B)||18,d=parseFloat(u)||18,c=parseFloat(K)||18,o=t*.166+d*.333+c*.501,s=Math.round(o/20*10500+400);k(s)},
       W=[
         {id:"rank-estimator",title:"تخمین تراز و رتبه واقعی کنکور",icon:ne,badge:"داده‌های واقعی"},
         {id:"admission-chances",title:"تخمین شانس قبولی دانشگاه",icon:Me,badge:"داده‌محور و دقیق"},
         {id:"final-exam-impact",title:"محاسبه‌گر تأثیر ۶۰٪ سوابق نهایی",icon:Q,badge:"قانون جدید"},
         {id:"university-comparator",title:"مقایسه تخصصی دانشگاه‌ها",icon:ie,badge:"جامع"},
         {id:"major-comparator",title:"مقایسه تخصصی رشته‌ها و درآمد",icon:re,badge:"بازار کار"}
       ];

   if(!isUserAdmin){return e.jsxs("div",{className:"max-w-4xl mx-auto px-4 py-10 sm:py-16 text-right animate-in fade-in duration-300",dir:"rtl",children:[e.jsxs("div",{className:"bg-white rounded-[28px] border border-[#3C0E11]/10 p-6 sm:p-12 shadow-xl shadow-[#3C0E11]/5 text-center relative overflow-hidden",children:[e.jsx("div",{className:"absolute top-0 right-0 left-0 h-1.5 bg-gradient-to-r from-amber-500 via-[#C5A880] to-[#3C0E11]"}),e.jsxs("div",{className:"inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-50 text-amber-900 border border-amber-200/80 text-xs font-black mb-6 animate-pulse",children:[e.jsx("span",{className:"w-2 h-2 rounded-full bg-amber-500"}),e.jsx("span",{children:"در حال توسعه و به‌روزرسانی سامانه"})]}),e.jsx("div",{className:"w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-[#F7F3EF] border-2 border-[#E8DFD3] text-[#3C0E11] flex items-center justify-center mx-auto mb-6 shadow-xs",children:e.jsx("span",{className:"text-3xl sm:text-4xl",children:"⚙️"})}),e.jsx("h2",{className:"text-2xl sm:text-3xl font-black text-[#3C0E11] mb-3 tracking-tight",children:"این بخش در حال توسعه است"}),e.jsx("p",{className:"text-slate-600 text-xs sm:text-sm sm:text-base leading-relaxed max-w-xl mx-auto mb-8 font-medium",children:"داوطلب گرامی، مجموعه ابزارهای محاسباتی و هوشمند کنکور در حال کالیبراسیون داده‌ای با آخرین تغییرات سازمان سنجش هستند و در حال حاضر تنها برای مدیران سیستم در دسترس می‌باشند."}),e.jsxs("div",{className:"grid grid-cols-1 sm:grid-cols-3 gap-3.5 max-w-2xl mx-auto mb-8 text-right",children:[e.jsxs("div",{className:"p-4 rounded-2xl bg-[#F7F3EF]/80 border border-[#E8DFD3] flex flex-col gap-1.5",children:[e.jsx("span",{className:"text-sm sm:text-base font-black text-[#3C0E11]",children:"📊 تخمین تراز هوشمند"}),e.jsx("span",{className:"text-[11px] text-slate-500 leading-snug",children:"محاسبه تراز تلفیقی نهایی و کنکور بر پایه داده‌های واقعی"})]}),e.jsxs("div",{className:"p-4 rounded-2xl bg-[#F7F3EF]/80 border border-[#E8DFD3] flex flex-col gap-1.5",children:[e.jsx("span",{className:"text-sm sm:text-base font-black text-[#3C0E11]",children:"🎯 اثر قطعی ۶۰٪ نهایی"}),e.jsx("span",{className:"text-[11px] text-slate-500 leading-snug",children:"سنجش دقیق نمرات کتبی نهایی بر رتبه و شانس قبولی"})]}),e.jsxs("div",{className:"p-4 rounded-2xl bg-[#F7F3EF]/80 border border-[#E8DFD3] flex flex-col gap-1.5",children:[e.jsx("span",{className:"text-sm sm:text-base font-black text-[#3C0E11]",children:"🏛️ شانس‌سنج قبولی"}),e.jsx("span",{className:"text-[11px] text-slate-500 leading-snug",children:"آنالیز هوشمند احتمال قبولی در ۵۰ دانشگاه برتر کشور"})]})]}),e.jsxs("div",{className:"flex flex-wrap items-center justify-center gap-3",children:[e.jsx("button",{type:"button",onClick:()=>V("assessment"),className:"px-6 py-3 rounded-2xl bg-[#3C0E11] text-[#C5A880] hover:bg-[#2B0A0C] font-black text-xs sm:text-sm transition-all shadow-md shadow-[#3C0E11]/20 active:scale-95 cursor-pointer",children:"شروع ارزیابی هوشمند ۲ دقیقه‌ای ←"}),e.jsx("button",{type:"button",onClick:()=>V("home"),className:"px-6 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm transition-all active:scale-95 cursor-pointer",children:"بازگشت به صفحه اصلی"})]}),e.jsx("p",{className:"text-[11px] text-slate-400 mt-6 pt-4 border-t border-slate-100",children:"🔒 دسترسی به این بخش در فاز توسعه اختصاصی مدیران سیستم می‌باشد."})]})]});}; return e.jsxs("div",{className:"max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10",children:[
    e.jsxs("div",{className:"text-center max-w-3xl mx-auto mb-10 space-y-3",children:[
      e.jsx(z,{variant:"mint",size:"md",icon:Ce,children:"جعبه ابزار رایگان کنکور کافئین (Free Toolbox)"}),
      e.jsx("h1",{className:"text-3xl sm:text-4xl font-black text-slate-900",children:"مجموعه ابزارهای محاسباتی و تحلیلی تخصصی کنکور"}),
      e.jsx("p",{className:"text-xs sm:text-sm text-slate-600",children:"بدون نیاز به ثبت‌نام، رتبه، درصدها یا نمرات خود را وارد کنید و تحلیل‌های دقیق محاسباتی دریافت نمایید."})
    ]}),

    e.jsx("div",{className:"grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 mb-10",children:
      W.map(t=>{
        const d=t.icon,c=j===t.id;
        return e.jsxs("button",{
          key:t.id,
          onClick:()=>{N(t.id);R(null)},
          className:`p-3.5 rounded-2xl border text-center transition-all flex flex-col items-center justify-between gap-2.5 cursor-pointer ${c?"border-sky-500 bg-sky-50 text-sky-950 shadow-md ring-2 ring-sky-200":"border-slate-200 bg-white text-slate-700 hover:bg-slate-50"}`,
          children:[
            e.jsxs("div",{className:"flex items-center justify-between w-full",children:[
              e.jsx("span",{className:"text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-white border border-slate-200 text-slate-500",children:t.badge}),
              e.jsx(d,{className:`w-4 h-4 ${c?"text-sky-600":"text-slate-400"}`})
            ]}),
            e.jsx("span",{className:"text-xs font-bold leading-tight",children:t.title})
          ]
        })
      })
    }),

    e.jsxs("div",{className:"bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/80 shadow-xl",children:[
      j==="rank-estimator"&&e.jsx(Ee,{onNavigate:V,onLeadCaptured:p}),
      j==="admission-chances"&&e.jsx(ChanceEstimatorTool,{onNavigate:V}),
      j==="final-exam-impact"&&e.jsxs("div",{className:"space-y-8",children:[
        e.jsxs("div",{children:[
          e.jsx(z,{variant:"lavender",size:"sm",icon:Q,children:"ابزار شماره ۳"}),
          e.jsx("h2",{className:"text-xl sm:text-2xl font-black text-slate-900 mt-1",children:"محاسبه‌گر تأثیر قطعی ۶۰ درصدی سوابق تحصیلی (امتحانات نهایی)"}),
          e.jsx("p",{className:"text-xs text-slate-500 mt-1",children:"محاسبه تراز نهایی دروس کتبی دهم، یازدهم و دوازدهم بر اساس جدیدترین مصوبات شورای عالی انقلاب فرهنگی"})
        ]}),
        e.jsxs("div",{className:"grid grid-cols-1 sm:grid-cols-3 gap-4",children:[
          e.jsxs("div",{className:"p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2",children:[
            e.jsx("label",{className:"block text-xs font-bold text-slate-700",children:"معدل کتبی نهایی دهم (سهم ۱۰٪):"}),
            e.jsx("input",{type:"text",dir:"ltr",value:B,onChange:t=>g(t.target.value),className:"w-full p-3 rounded-xl border border-slate-200 font-bold text-sm text-left bg-white",placeholder:"19.5"})
          ]}),
          e.jsxs("div",{className:"p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2",children:[
            e.jsx("label",{className:"block text-xs font-bold text-slate-700",children:"معدل کتبی نهایی یازدهم (سهم ۲۰٪):"}),
            e.jsx("input",{type:"text",dir:"ltr",value:u,onChange:t=>H(t.target.value),className:"w-full p-3 rounded-xl border border-slate-200 font-bold text-sm text-left bg-white",placeholder:"19.2"})
          ]}),
          e.jsxs("div",{className:"p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2",children:[
            e.jsx("label",{className:"block text-xs font-bold text-slate-700",children:"معدل کتبی نهایی دوازدهم (سهم ۳۰٪):"}),
            e.jsx("input",{type:"text",dir:"ltr",value:K,onChange:t=>y(t.target.value),className:"w-full p-3 rounded-xl border border-slate-200 font-bold text-sm text-left bg-white",placeholder:"19.0"})
          ]})
        ]}),
        e.jsx(J,{variant:"primary",size:"lg",onClick:te,className:"w-full",children:"محاسبه تراز قطعی سوابق تحصیلی ←"}),
        O!==null&&e.jsxs("div",{className:"p-6 rounded-3xl bg-sky-50 border border-sky-100 flex flex-col sm:flex-row items-center justify-between gap-4 animate-in fade-in",children:[
          e.jsxs("div",{children:[
            e.jsx("span",{className:"text-xs font-bold text-sky-700 block",children:"تراز ترکیبی ۶۰٪ سوابق شما:"}),
            e.jsxs("p",{className:"text-3xl font-black text-slate-900 mt-1",children:[O," از ۱۲,۰۰۰"]}),
            e.jsx("p",{className:"text-xs text-slate-600 mt-1",children:"این تراز معادل رتبه زیر ۵۰۰ در کنکور سراسری جهت اعمال در نمره کل داوطلب است."})
          ]}),
          e.jsx(J,{variant:"outline",size:"sm",onClick:()=>V("magazine"),children:"راهنمای کسب نمره ۲۰ نهایی"})
        ]})
      ]}),
      j==="university-comparator"&&e.jsxs("div",{className:"space-y-8",children:[
        e.jsxs("div",{children:[
          e.jsx(z,{variant:"yellow",size:"sm",icon:ie,children:"ابزار شماره ۴"}),
          e.jsx("h2",{className:"text-xl sm:text-2xl font-black text-slate-900 mt-1",children:"مقایسه تخصصی ۲ دانشگاه برتر کشور"}),
          e.jsx("p",{className:"text-xs text-slate-500 mt-1",children:"مقایسه رتبه علمی، سطح اساتید، امکانات خوابگاهی، شهر، و بازخورد دانشجویان فعلی"})
        ]}),
        e.jsxs("div",{className:"grid grid-cols-1 sm:grid-cols-2 gap-4",children:[
          e.jsxs("div",{children:[
            e.jsx("label",{className:"block text-xs font-bold text-slate-700 mb-1.5",children:"دانشگاه اول:"}),
            e.jsx("select",{value:T,onChange:t=>S(t.target.value),className:"w-full p-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 bg-white",children:G.map(t=>e.jsxs("option",{value:t.id,children:[t.name," (",t.city,")"]},t.id))})
          ]}),
          e.jsxs("div",{children:[
            e.jsx("label",{className:"block text-xs font-bold text-slate-700 mb-1.5",children:"دانشگاه دوم:"}),
            e.jsx("select",{value:A,onChange:t=>C(t.target.value),className:"w-full p-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 bg-white",children:G.map(t=>e.jsxs("option",{value:t.id,children:[t.name," (",t.city,")"]},t.id))})
          ]})
        ]}),
        (()=>{
          const t=G.find(c=>c.id===T)||G[0],d=G.find(c=>c.id===A)||G[1];
          return e.jsxs("div",{className:"grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4",children:[
            e.jsxs("div",{className:"p-6 rounded-3xl border border-sky-200 bg-gradient-to-b from-sky-50/50 to-white space-y-4",children:[
              e.jsxs("div",{className:"flex items-center gap-3",children:[
                e.jsx("img",{src:t.image,alt:t.name,className:"w-16 h-16 rounded-2xl object-cover"}),
                e.jsxs("div",{children:[
                  e.jsx("h4",{className:"text-base font-black text-slate-900",children:t.name}),
                  e.jsxs("p",{className:"text-xs text-slate-500",children:["شهر: ",t.city," • تأسیس: ",t.establishedYear]})
                ]})
              ]}),
              e.jsxs("div",{className:"space-y-2 text-xs text-slate-700 pt-2 border-t border-slate-100",children:[
                e.jsxs("div",{className:"flex justify-between",children:[e.jsx("span",{className:"text-slate-500",children:"رتبه کشوری:"}),e.jsxs("span",{className:"font-bold",children:["رتبه ",t.ranking]})]}),
                e.jsxs("div",{className:"flex justify-between",children:[e.jsx("span",{className:"text-slate-500",children:"رضایت دانشجویان:"}),e.jsxs("span",{className:"font-bold text-amber-600",children:["⭐ ",t.satisfactionScore," / 5"]})]}),
                e.jsxs("div",{className:"flex justify-between",children:[e.jsx("span",{className:"text-slate-500",children:"وضعیت خوابگاه:"}),e.jsx("span",{className:"font-bold text-emerald-600",children:t.dormitoryStatus})]})
              ]})
            ]}),
            e.jsxs("div",{className:"p-6 rounded-3xl border border-indigo-200 bg-gradient-to-b from-indigo-50/50 to-white space-y-4",children:[
              e.jsxs("div",{className:"flex items-center gap-3",children:[
                e.jsx("img",{src:d.image,alt:d.name,className:"w-16 h-16 rounded-2xl object-cover"}),
                e.jsxs("div",{children:[
                  e.jsx("h4",{className:"text-base font-black text-slate-900",children:d.name}),
                  e.jsxs("p",{className:"text-xs text-slate-500",children:["شهر: ",d.city," • تأسیس: ",d.establishedYear]})
                ]})
              ]}),
              e.jsxs("div",{className:"space-y-2 text-xs text-slate-700 pt-2 border-t border-slate-100",children:[
                e.jsxs("div",{className:"flex justify-between",children:[e.jsx("span",{className:"text-slate-500",children:"رتبه کشوری:"}),e.jsxs("span",{className:"font-bold",children:["رتبه ",d.ranking]})]}),
                e.jsxs("div",{className:"flex justify-between",children:[e.jsx("span",{className:"text-slate-500",children:"رضایت دانشجویان:"}),e.jsxs("span",{className:"font-bold text-amber-600",children:["⭐ ",d.satisfactionScore," / 5"]})]}),
                e.jsxs("div",{className:"flex justify-between",children:[e.jsx("span",{className:"text-slate-500",children:"وضعیت خوابگاه:"}),e.jsx("span",{className:"font-bold text-emerald-600",children:d.dormitoryStatus})]})
              ]})
            ]})
          ]});
        })()
      ]}),
      j==="major-comparator"&&e.jsxs("div",{className:"space-y-8",children:[
        e.jsxs("div",{children:[
          e.jsx(z,{variant:"pink",size:"sm",icon:re,children:"ابزار شماره ۵"}),
          e.jsx("h2",{className:"text-xl sm:text-2xl font-black text-slate-900 mt-1",children:"مقایسه تخصصی رشته‌های دانشگاهی و درآمد"}),
          e.jsx("p",{className:"text-xs text-slate-500 mt-1",children:"مقایسه طول دوره، درآمد میانگین ماهانه، بازار کار در ایران و مهاجرت‌پذیری"})
        ]}),
        e.jsxs("div",{className:"grid grid-cols-1 sm:grid-cols-2 gap-4",children:[
          e.jsxs("div",{children:[
            e.jsx("label",{className:"block text-xs font-bold text-slate-700 mb-1.5",children:"رشته اول:"}),
            e.jsx("select",{value:_,onChange:t=>f(t.target.value),className:"w-full p-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 bg-white",children:P.map(t=>e.jsxs("option",{value:t.id,children:[t.title," (",t.group==="experimental"?"تجربی":t.group==="math"?"ریاضی":"انسانی",")"]},t.id))})
          ]}),
          e.jsxs("div",{children:[
            e.jsx("label",{className:"block text-xs font-bold text-slate-700 mb-1.5",children:"رشته دوم:"}),
            e.jsx("select",{value:U,onChange:t=>I(t.target.value),className:"w-full p-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 bg-white",children:P.map(t=>e.jsxs("option",{value:t.id,children:[t.title," (",t.group==="experimental"?"تجربی":t.group==="math"?"ریاضی":"انسانی",")"]},t.id))})
          ]})
        ]}),
        (()=>{
          const t=P.find(c=>c.id===_)||P[0],d=P.find(c=>c.id===U)||P[1];
          return e.jsxs("div",{className:"grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4",children:[
            e.jsxs("div",{className:"p-6 rounded-3xl border border-pink-200 bg-gradient-to-b from-pink-50/50 to-white space-y-4",children:[
              e.jsx("h4",{className:"text-base font-black text-slate-900",children:t.title}),
              e.jsx("p",{className:"text-xs text-slate-600 leading-relaxed",children:t.description}),
              e.jsxs("div",{className:"space-y-2 text-xs text-slate-700 pt-2 border-t border-slate-100",children:[
                e.jsxs("div",{className:"flex justify-between",children:[e.jsx("span",{className:"text-slate-500",children:"طول دوره:"}),e.jsxs("span",{className:"font-bold",children:[t.durationYears," سال"]})]}),
                e.jsxs("div",{className:"flex justify-between",children:[e.jsx("span",{className:"text-slate-500",children:"میانگین درآمد ماهانه:"}),e.jsxs("span",{className:"font-bold text-emerald-600",children:[t.approxMonthlyIncomeMinMillion," تا ",t.approxMonthlyIncomeMaxMillion," میلیون تومان"]})]}),
                e.jsxs("div",{className:"flex justify-between",children:[e.jsx("span",{className:"text-slate-500",children:"آخرین رتبه قبولی منطقه ۱:"}),e.jsx("span",{className:"font-bold",children:t.minRankRegion1})]})
              ]})
            ]}),
            e.jsxs("div",{className:"p-6 rounded-3xl border border-purple-200 bg-gradient-to-b from-purple-50/50 to-white space-y-4",children:[
              e.jsx("h4",{className:"text-base font-black text-slate-900",children:d.title}),
              e.jsx("p",{className:"text-xs text-slate-600 leading-relaxed",children:d.description}),
              e.jsxs("div",{className:"space-y-2 text-xs text-slate-700 pt-2 border-t border-slate-100",children:[
                e.jsxs("div",{className:"flex justify-between",children:[e.jsx("span",{className:"text-slate-500",children:"طول دوره:"}),e.jsxs("span",{className:"font-bold",children:[d.durationYears," سال"]})]}),
                e.jsxs("div",{className:"flex justify-between",children:[e.jsx("span",{className:"text-slate-500",children:"میانگین درآمد ماهانه:"}),e.jsxs("span",{className:"font-bold text-emerald-600",children:[d.approxMonthlyIncomeMinMillion," تا ",d.approxMonthlyIncomeMaxMillion," میلیون تومان"]})]}),
                e.jsxs("div",{className:"flex justify-between",children:[e.jsx("span",{className:"text-slate-500",children:"آخرین رتبه قبولی منطقه ۱:"}),e.jsx("span",{className:"font-bold",children:d.minRankRegion1})]})
              ]})
            ]})
          ]});
        })()
      ]})
    ]})
  ]});
};

export{$e as FreeToolbox,$e as default};
