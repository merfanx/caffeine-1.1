import fs from 'fs';
import { spawnSync } from 'child_process';

const targetFile = 'public/assets/ExamSystemHub-C3IMNpAU.js';
const backupFile = 'public/assets/ExamSystemHub-C3IMNpAU.js.bak';

// 1. Restore from clean backup
if (fs.existsSync(backupFile)) {
  fs.copyFileSync(backupFile, targetFile);
} else {
  fs.copyFileSync(targetFile, backupFile);
}

let code = fs.readFileSync(targetFile, 'utf8');

// 2. Read helpers & modal code from patch_helpers.js
const helpersCode = fs.readFileSync('scripts/patch_helpers.js', 'utf8');
const helpersIndex = helpersCode.indexOf('_KEY_REPORTS =');
let helpersContent = helpersCode.substring(helpersIndex, helpersCode.lastIndexOf('console.log')).trim();
const lastBrace = helpersContent.lastIndexOf('}');
helpersContent = helpersContent.substring(0, lastBrace + 1);

// 3. Anchor 1: Insert helper & RepModal & ReportedQuestionsAdminView right before u4
const u4Anchor = '$(we=>[...we,...De])}})]})},u4=';
if (!code.includes(u4Anchor)) {
  throw new Error('u4Anchor not found');
}
code = code.replace(u4Anchor, '$(we=>[...we,...De])}})]})},' + helpersContent + ',u4=');

// 4. Anchor 2: Inside u4, add states inside the existing const declaration
const u4StateAnchor = 'const r=l==="admin"||l==="advisor",';
if (!code.includes(u4StateAnchor)) {
  throw new Error('u4StateAnchor not found');
}
const u4StateInjection = 'const r=l==="admin"||l==="advisor",[repQ,setRepQ]=Q.useState(null),[reportsList,setReportsList]=Q.useState(()=>getStoredReports()),[activeReportToResolve,setActiveReportToResolve]=Q.useState(null),';
code = code.replace(u4StateAnchor, u4StateInjection);

// 5. Anchor 2b: Inside useEffect in u4, add sync listener and API fetch
const u4EffectAnchor = 'Q.useEffect(()=>{se()},[]);';
if (!code.includes(u4EffectAnchor)) {
  throw new Error('u4EffectAnchor not found');
}
const u4EffectInjection = 'Q.useEffect(()=>{se();const h=()=>setReportsList(getStoredReports());window.addEventListener("caffeine_question_reports_updated",h);fetch("/api/v1/exams/questions/reports").then(r=>r.json()).then(d=>{if(d&&d.reports&&d.reports.length>0){setReportsList(d.reports);setStoredReports(d.reports)}}).catch(()=>{});return()=>window.removeEventListener("caffeine_question_reports_updated",h)},[]);';
code = code.replace(u4EffectAnchor, u4EffectInjection);

// 6. Anchor 3: Inside Ce in u4, resolve report if activeReportToResolve is set
const ceAnchor = `Ce=me=>{if(me.preventDefault(),!!P){if(!P.questionText.trim()||P.options.some(ut=>!ut.trim())){alert("لطفاً صورت سوال و ۴ گزینه را کامل پر کنید.");return}iA(P),H(null),se()}}`;
if (!code.includes(ceAnchor)) {
  throw new Error('ceAnchor not found');
}
const ceReplacement = `Ce=me=>{if(me.preventDefault(),!!P){if(!P.questionText.trim()||P.options.some(ut=>!ut.trim())){alert("لطفاً صورت سوال و ۴ گزینه را کامل پر کنید.");return}iA(P),activeReportToResolve&&(updateReportStatusAction(activeReportToResolve,"resolved","تست توسط مدیر ویرایش و اصلاح گردید."),setActiveReportToResolve(null)),H(null),se()}}`;
code = code.replace(ceAnchor, ceReplacement);

// 7. Anchor 4: Add "تست‌های گزارش‌شده" tab in u4
const tabAnchor = `r&&s.jsxs("button",{onClick:()=>o("add_question"),className:\`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer \${a==="add_question"?"bg-white text-indigo-700 shadow-sm":"text-slate-600 hover:text-slate-900"}\`,children:[s.jsx(Wl,{className:"w-3.5 h-3.5"}),s.jsx("span",{children:"افزودن دستی تست"})]})`;
if (!code.includes(tabAnchor)) {
  throw new Error('tabAnchor not found');
}
const tabInjection = tabAnchor + `,r&&s.jsxs("button",{type:"button",onClick:()=>o("reported"),className:\`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer \${a==="reported"?"bg-white text-rose-700 shadow-sm ring-1 ring-rose-200":"text-slate-600 hover:text-slate-900"}\`,children:[s.jsx("svg",{className:"w-3.5 h-3.5 text-rose-600",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",children:[s.jsx("path",{d:"m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"}),s.jsx("line",{x1:"12",y1:"9",x2:"12",y2:"13"}),s.jsx("line",{x1:"12",y1:"17",x2:"12.01",y2:"17"})]}),s.jsx("span",{children:"تست‌های گزارش‌شده"}),reportsList.filter(rep=>rep.status==="pending").length>0&&s.jsx("span",{className:"px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[9px] font-bold animate-pulse",children:reportsList.filter(rep=>rep.status==="pending").length})]})`;
code = code.replace(tabAnchor, tabInjection);

// 8. Anchor 5: In Mn.map on explorer question card, add "دارای گزارش خطا" badge and report button
const cardTitleAnchor = `s.jsx("span",{className:"text-xs font-black text-slate-900",children:me.subject}),`;
if (!code.includes(cardTitleAnchor)) {
  throw new Error('cardTitleAnchor not found');
}
const cardTitleReplacement = `reportsList.some(rep=>rep.questionId===me.id&&rep.status==="pending")&&s.jsxs("button",{type:"button",onClick:()=>{r?o("reported"):setRepQ(me)},className:"text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1 hover:bg-rose-100 transition-colors animate-pulse cursor-pointer",title:"مشاهده گزارش‌های خطا برای این تست",children:[s.jsx("svg",{className:"w-3 h-3 text-rose-600",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",children:[s.jsx("path",{d:"m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"}),s.jsx("line",{x1:"12",y1:"9",x2:"12",y2:"13"}),s.jsx("line",{x1:"12",y1:"17",x2:"12.01",y2:"17"})]}),s.jsx("span",{children:"دارای گزارش خطا"})]}),` + cardTitleAnchor;
code = code.replace(cardTitleAnchor, cardTitleReplacement);

const cardStarAnchor = `title:"نشان‌دار کردن تست",children:s.jsx(Xb,{className:\`w-4 h-4 \${te[me.id]?.isStarred?"fill-amber-500 text-amber-500":""}\`})}),r&&s.jsxs("div",{className:"flex items-center gap-1`;
if (!code.includes(cardStarAnchor)) {
  throw new Error('cardStarAnchor not found');
}
const cardStarReplacement = `title:"نشان‌دار کردن تست",children:s.jsx(Xb,{className:\`w-4 h-4 \${te[me.id]?.isStarred?"fill-amber-500 text-amber-500":""}\`})}),s.jsx("button",{type:"button",onClick:()=>setRepQ(me),className:"p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer",title:"گزارش اشکال در این تست",children:s.jsx("svg",{className:"w-4 h-4",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",children:[s.jsx("path",{d:"m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"}),s.jsx("line",{x1:"12",y1:"9",x2:"12",y2:"13"}),s.jsx("line",{x1:"12",y1:"17",x2:"12.01",y2:"17"})]})}),r&&s.jsxs("div",{className:"flex items-center gap-1`;
code = code.replace(cardStarAnchor, cardStarReplacement);

// 9. Anchor 6: Add ReportedQuestionsAdminView in u4 views
const u4ViewsAnchor = `,P&&s.jsx("div",{className:"fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm`;
if (!code.includes(u4ViewsAnchor)) {
  throw new Error('u4ViewsAnchor not found');
}
const u4ViewsReplacement = `,a==="reported"&&r&&s.jsx(ReportedQuestionsAdminView,{reportsList:reportsList,questions:G,onEditQuestion:(targetQ,repId)=>{setActiveReportToResolve(repId);H(targetQ)},onUpdateReportStatus:(repId,status,note)=>{updateReportStatusAction(repId,status,note);setReportsList(getStoredReports())},onDeleteQuestion:(qId,repId)=>{window.confirm("آیا از حذف این تست از بانک سوالات اطمینان دارید؟")&&(nA(qId),updateReportStatusAction(repId,"resolved","تست با تایید مدیر از بانک سوالات حذف گردید."),setReportsList(getStoredReports()),se())}})` + u4ViewsAnchor;
code = code.replace(u4ViewsAnchor, u4ViewsReplacement);

// 10. Anchor 7: Insert RepModal at the end of u4 container
const endU4Anchor = `Date().toISOString(),createdByRole:l||"student",creatorName:r?"سامانه طراح هوشمند":t};n(ut)}})]})},h4=`;
if (!code.includes(endU4Anchor)) {
  throw new Error('endU4Anchor not found');
}
const endU4Replacement = `Date().toISOString(),createdByRole:l||"student",creatorName:r?"سامانه طراح هوشمند":t};n(ut)}}),repQ&&s.jsx(RepModal,{question:repQ,studentName:t,onClose:()=>setRepQ(null),onReportSuccess:()=>{setReportsList(getStoredReports())}})]})},h4=`;
code = code.replace(endU4Anchor, endU4Replacement);

// 11. Anchor 8: Inside h4, add state and report button and RepModal
const h4StartAnchor = `h4=({quiz:l,onFinish:e,onExit:t})=>{const[n,i]=Q.useState(0),`;
if (!code.includes(h4StartAnchor)) {
  throw new Error('h4StartAnchor not found');
}
const h4StartReplacement = `h4=({quiz:l,onFinish:e,onExit:t})=>{const[repQ,setRepQ]=Q.useState(null),[n,i]=Q.useState(0),`;
code = code.replace(h4StartAnchor, h4StartReplacement);

const h4ActionButtonsAnchor = `s.jsxs("button",{onClick:()=>B("doubt"),className:\`p-2 rounded-xl text-xs font-bold flex items-center gap-1 transition-colors \${p[n]==="doubt"?"bg-amber-100 text-amber-800":"text-slate-400 hover:bg-slate-100 hover:text-slate-700"}\`,title:"نشانه‌گذاری به عنوان سوال شک‌دار",children:[s.jsx(Lx,{className:"w-4 h-4"}),s.jsx("span",{className:"hidden sm:inline",children:"شک‌دار"})]})`;
if (!code.includes(h4ActionButtonsAnchor)) {
  throw new Error('h4ActionButtonsAnchor not found');
}
const h4ActionButtonsReplacement = h4ActionButtonsAnchor + `,s.jsxs("button",{type:"button",onClick:()=>setRepQ(w),className:"p-2 rounded-xl text-xs font-bold flex items-center gap-1 transition-colors text-slate-400 hover:bg-rose-50 hover:text-rose-600 cursor-pointer",title:"گزارش اشکال یا خطا در سوال",children:[s.jsx("svg",{className:"w-4 h-4 text-rose-500",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",children:[s.jsx("path",{d:"m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"}),s.jsx("line",{x1:"12",y1:"9",x2:"12",y2:"13"}),s.jsx("line",{x1:"12",y1:"17",x2:"12.01",y2:"17"})]}),s.jsx("span",{className:"hidden sm:inline",children:"گزارش اشکال"})]})`;
code = code.replace(h4ActionButtonsAnchor, h4ActionButtonsReplacement);

// 12. End of h4 container: insert RepModal
const endH4Target = `s.jsx("span",{children:"پایان آزمون و دریافت کارنامه"})]})]})]})]})};async function p4`;
if (code.includes(endH4Target)) {
  code = code.replace(endH4Target, `s.jsx("span",{children:"پایان آزمون و دریافت کارنامه"})]})]})]}),repQ&&s.jsx(RepModal,{question:repQ,studentName:"دانش‌آموز",onClose:()=>setRepQ(null)})]})};async function p4`);
} else {
  console.log('endH4Target not found');
}

// 13. Seed initial reports in localStorage if empty
const seedStorageCode = `
try {
  if (!localStorage.getItem("caffeine_reported_questions_v1")) {
    localStorage.setItem("caffeine_reported_questions_v1", JSON.stringify([
      {
        id: "qrep-seed-1",
        questionId: "bio-101",
        studentName: "سارا حسینی (دوازدهم تجربی)",
        studentId: "std-101",
        reason: "explanation_error",
        reasonLabel: "نقص یا اشکال در پاسخ تشریحی",
        description: "در پاسخ تشریحی پیوند فسفودی‌استر با فرمول 2n - 2 محاسبه شده ولی در صورت سوال تصریح نشده که دنا خطی است یا حلقوی. لطفاً مشخص شود.",
        status: "pending",
        reportedAt: new Date(Date.now() - 3600000 * 5).toISOString(),
        questionSnapshot: {
          id: "bio-101",
          subject: "زیست‌شناسی",
          chapter: "فصل ۱: مولکول‌های اطلاعاتی",
          topic: "نوکلئیک اسیدها و پیوندهای فسفودی‌استر",
          questionText: "در ساختار یک مولکول دنای دورشته‌ای خطی با ۳۰۰ پیوند هیدروژنی و ۱۰۰ نوکلئوتید گوانین‌دار، تعداد کل پیوندهای فسفودی‌استر چقدر است؟",
          options: ["۲۹۸ پیوند فسفودی‌استر", "۲۴۸ پیوند فسفودی‌استر", "۱۹۸ پیوند فسفودی‌استر", "۳۴۸ پیوند فسفودی‌استر"],
          correctOption: 2,
          explanation: "تعداد نوکلئوتیدهای G برابر ۱۰۰ است، پس بین G و C تعداد ۳۰۰ = ۱۰۰ × ۳ پیوند سه‌گانه داریم. چون کل پیوندها ۳۰۰ است، نوکلئوتیدهای A و T صفر هستند. تعداد پیوندهای فسفودی‌استر در دنای خطی برابر 2n - 2 = (۲ × ۱۲۵) - ۲ = ۲۴۸ می‌باشد.",
          source: "konkur_recent",
          difficulty: "medium"
        }
      }
    ]));
  }
} catch(e) {}
`;

code = seedStorageCode + code;

fs.writeFileSync(targetFile, code, 'utf8');
console.log('Successfully applied patch!');
