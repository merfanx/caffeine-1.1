const fs = require('fs');
const path = require('path');

function patchIndexFiles() {
  const files = [
    path.join(__dirname, '..', 'public', 'assets', 'index-CvuvcUm9.js'),
    path.join(__dirname, '..', 'dist', 'assets', 'index-CvuvcUm9.js')
  ];

  files.forEach(file => {
    if (!fs.existsSync(file)) return;
    let content = fs.readFileSync(file, 'utf8');

    // 1. Remove student names from room titles and descriptions
    content = content.replace(/name:"☕ پشتیبانی کافئین \(آرین محمدی\)"/g, 'name:"☕ پشتیبانی و مشاوره تخصصی کافئین"');
    content = content.replace(/description:"کانال ارتباط مستقیم دانش‌آموز آرین محمدی با واحد پشتیبانی کافئین"/g, 'description:"کانال ارتباط مستقیم با واحد پشتیبانی و مشاوره کافئین"');

    content = content.replace(/name:"☕ پشتیبانی کافئین \(سحر تهرانی\)"/g, 'name:"☕ پشتیبانی و مشاوره تخصصی کافئین"');
    content = content.replace(/description:"کانال ارتباط مستقیم دانش‌آموز سحر تهرانی با واحد پشتیبانی کافئین"/g, 'description:"کانال ارتباط مستقیم با واحد پشتیبانی و مشاوره کافئین"');

    content = content.replace(/name:"☕ پشتیبانی کافئین \(امیرحسین رضایی\)"/g, 'name:"☕ پشتیبانی و مشاوره تخصصی کافئین"');
    content = content.replace(/description:"کانال ارتباط مستقیم دانش‌آموز امیرحسین رضایی با واحد پشتیبانی کافئین"/g, 'description:"کانال ارتباط مستقیم با واحد پشتیبانی و مشاوره کافئین"');

    // 2. Remove student name injection from ensureSupportRoom fallback
    content = content.replace(/name:`☕ پشتیبانی آنلاین کافئین \(\$\{s\|\|"دانش‌آموز"\}\)`/g, 'name:"☕ پشتیبانی و مشاوره تخصصی کافئین"');

    fs.writeFileSync(file, content, 'utf8');
    console.log(`[Patched Index] ${file}`);
  });
}

function patchInternalChatHubFiles() {
  const files = [
    path.join(__dirname, '..', 'public', 'assets', 'InternalChatHub-DzulPtxr.js'),
    path.join(__dirname, '..', 'dist', 'assets', 'InternalChatHub-DzulPtxr.js')
  ];

  files.forEach(file => {
    if (!fs.existsSync(file)) return;
    let content = fs.readFileSync(file, 'utf8');

    // 1. Default user identity fallback: MUST be guest, NOT std-101 / student!
    content = content.replace(
      'd=w.id||"std-101",v=w.role||"student",y=w.name||"کاربر"',
      'd=w.id||"usr-guest",v=w.role||"guest",y=w.name||"کاربر مهمان"'
    );

    // 2. ne room filter: Guest must NEVER see student support rooms!
    const targetFilter = 'ne=nt.useMemo(()=>{if(v==="admin")return I;const a=d.replace(/^usr-/,"");return I.filter(r=>r.type==="direct"||r.category==="direct"?r.isSupportRoom?r.studentId===a||r.participants?.includes(a)||r.participants?.includes(d)||a==="std-101"||r.id==="dm-support"||r.id===`dm-support-${a}`:r.participants?.includes(a)||r.participants?.includes(d)||v==="advisor"&&(r.participants?.some(B=>B.startsWith("adv-"))||r.advisorId===d):r.isAdvisorStudentGroup?v==="advisor"&&(r.advisorId===d||r.creatorId===d)||r.approvalStatus==="approved":r.approvalStatus==="pending_approval"||r.approvalStatus==="rejected"?v==="admin"||r.creatorId===d:!0)},[I,v,d])';
    
    const replacementFilter = 'ne=nt.useMemo(()=>{if(v==="admin")return I;const a=d.replace(/^usr-/,"");return I.filter(r=>{if(r.type==="direct"||r.category==="direct"){if(r.isSupportRoom){if(v==="guest")return r.id==="direct-support-guest"||r.id==="dm-support-guest"||r.directStudentId==="guest"||r.studentId==="guest";if(v==="student")return r.studentId===a||r.directStudentId===a||r.id===`direct-support-${a}`||r.id===`dm-support-${a}`||r.participants?.includes(a)||r.participants?.includes(d);return r.participants?.includes(a)||r.participants?.includes(d)||v==="advisor"&&r.advisorId===d}return v!=="guest"&&(r.participants?.includes(a)||r.participants?.includes(d)||v==="advisor"&&(r.participants?.some(B=>B.startsWith("adv-"))||r.advisorId===d))}if(r.isAdvisorStudentGroup)return v==="advisor"&&(r.advisorId===d||r.creatorId===d)||v!=="guest"&&r.approvalStatus==="approved";if(r.approvalStatus==="pending_approval"||r.approvalStatus==="rejected")return v==="admin"||r.creatorId===d;return!0})},[I,v,d])';

    if (content.includes(targetFilter)) {
      content = content.replace(targetFilter, replacementFilter);
    } else {
      console.warn('targetFilter not found directly in', file);
    }

    // 3. Message Input Hardening:
    // - Guests cannot send messages in groups / channels
    // - Announcements cannot receive student / guest messages
    // - Locked channels cannot receive messages
    const targetInput = 'e.jsx(ht,{onSendMessage:be,replyingTo:S,onCancelReply:()=>m(null),onTyping:a=>R.sendTyping(a)})';
    
    const replacementInput = 'v==="guest"&&!Oe.isSupportRoom?e.jsxs("div",{className:"p-3 sm:p-4 bg-slate-900/90 border-t border-slate-800 text-center flex flex-col sm:flex-row items-center justify-between gap-3 select-none",children:[e.jsxs("div",{className:"flex items-center gap-2 text-xs sm:text-sm text-slate-300",children:[e.jsx("span",{className:"text-amber-400 font-bold",children:"🔒 حالت مهمان:"}),e.jsx("span",{children:"ارسال پیام در این تالار نیازمند ورود به حساب کاربری است."})]}),e.jsx("button",{type:"button",onClick:()=>window.dispatchEvent(new CustomEvent("caffeine:open_auth_modal")),className:"px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-amber-500/20 active:scale-95 transition-all cursor-pointer whitespace-nowrap",children:"ورود یا عضویت"})]}):(Oe.type==="announcement"||Oe.id==="room-announcements")&&v!=="admin"&&v!=="advisor"?e.jsxs("div",{className:"p-3 sm:p-4 bg-slate-900/90 border-t border-slate-800 text-center flex items-center justify-center gap-2 text-xs sm:text-sm text-slate-400 select-none",children:[e.jsx("span",{className:"text-amber-400",children:"📢"}),e.jsx("span",{children:"این کانال صرفاً جهت اطلاع‌رسانی رسمی است و ارسال پیام تنها برای مشاوران ارشد و مدیریت مجاز می‌باشد."})] }):Oe.isLocked&&v!=="admin"&&v!=="advisor"?e.jsxs("div",{className:"p-3 sm:p-4 bg-slate-900/90 border-t border-slate-800 text-center flex items-center justify-center gap-2 text-xs sm:text-sm text-slate-400 select-none",children:[e.jsx("span",{className:"text-rose-400",children:"🔒"}),e.jsx("span",{children:"این تالار گفتگو توسط مدیریت قفل شده است و ارسال پیام موقتاً مسدود می‌باشد."})] }):e.jsx(ht,{onSendMessage:be,replyingTo:S,onCancelReply:()=>m(null),onTyping:a=>R.sendTyping(a)})';

    if (content.includes('v==="guest"&&!Oe.isSupportRoom')) {
      console.log('Message Input Hardening already applied in', file);
    } else if (content.includes(targetInput)) {
      content = content.replace(targetInput, replacementInput);
    } else {
      console.warn('targetInput not found in', file);
    }

    // 4. Send Message Guard
    const targetBe = 'be=async a=>{await R.sendMessage({...a,roomId:b}),setTimeout(ee,60)}';
    const replacementBe = 'be=async a=>{if(v==="guest"&&!Oe.isSupportRoom){alert("ارسال پیام در تالارهای عمومی نیازمند ورود به حساب کاربری است.");window.dispatchEvent(new CustomEvent("caffeine:open_auth_modal"));return;}if((Oe.type==="announcement"||Oe.id==="room-announcements")&&v!=="admin"&&v!=="advisor"){alert("این کانال صرفاً جهت اطلاعیه‌های رسمی است و ارسال پیام تنها برای مشاوران ارشد مجاز می‌باشد.");return;}await R.sendMessage({...a,roomId:b}),setTimeout(ee,60)}';

    if (content.includes(targetBe)) {
      content = content.replace(targetBe, replacementBe);
    } else {
      console.warn('targetBe not found in', file);
    }

    // 5. Zero PII in support room title display (both header and sidebar)
    content = content.replace(
      'children:s.name}),s.category==="academic"',
      'children:s.isSupportRoom?(s.directStudentId==="guest"||s.id.includes("guest")?"پشتیبانی و مشاوره آنلاین (مهمان)":"پشتیبانی و مشاوره تخصصی کافئین"):s.name}),s.category==="academic"'
    );

    content = content.replace(
      'children:t.name}),t.isPinned&&e.jsx(Z,',
      'children:t.isSupportRoom?(t.directStudentId==="guest"||t.id.includes("guest")?"پشتیبانی و مشاوره آنلاین (مهمان)":"پشتیبانی و مشاوره تخصصی کافئین"):t.name}),t.isPinned&&e.jsx(Z,'
    );

    fs.writeFileSync(file, content, 'utf8');
    console.log(`[Patched InternalChatHub] ${file}`);
  });
}

patchIndexFiles();
patchInternalChatHubFiles();
console.log('Done patching chat assets.');
