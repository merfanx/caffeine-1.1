const fs = require('fs');
const path = require('path');
const getFaCode = require('./sidebar_component.cjs');

function generateNewFa() {
  return getFaCode();
}

function patchFile(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log(`[Skip] File not found: ${filePath}`);
    return;
  }
  let code = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // 1. Clean Decluttered Top Bar (Restore brand text cleanly, no toggle button needed here as toggle is attached to sidebar)
  const toggleInTopBar = `e.jsxs("div",{className:"hidden lg:flex items-center gap-3 select-none",children:[e.jsxs("button",{type:"button",onClick:()=>window.dispatchEvent(new CustomEvent("caffeine:toggle_sidebar")),title:"باز / بستن سایدبار (Ctrl+B)",className:"flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-[#F7F3EF] hover:bg-[#E8DFD3] text-slate-700 hover:text-[#3C0E11] text-xs font-bold transition-all border border-[#E8DFD3] cursor-pointer active:scale-95 shadow-2xs",children:[e.jsxs("svg",{className:"w-3.5 h-3.5 text-[#C5A880]",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",children:[e.jsx("rect",{width:"18",height:"18",x:"3",y:"3",rx:"2"}),e.jsx("path",{d:"M9 3v18"})]}),e.jsx("span",{className:"text-[11px] font-bold",children:"سایدبار"})]}),e.jsxs("div",{className:"flex items-center gap-2 text-xs text-slate-400",children:[e.jsx("span",{className:"w-2 h-2 rounded-full bg-emerald-500 animate-pulse"}),e.jsx("span",{className:"text-slate-700 font-bold",children:"موسسه آموزشی کافئین"}),e.jsx("span",{className:"text-slate-300",children:"·"}),e.jsx("span",{className:"text-slate-500",children:"سیستم هوشمند کنکور"})]})]}),`;
  const cleanTopBar = `e.jsx("div",{className:"hidden lg:flex items-center gap-2 text-xs text-slate-400 select-none",children:[e.jsx("span",{className:"w-2 h-2 rounded-full bg-emerald-500 animate-pulse"}),e.jsx("span",{className:"text-slate-700 font-bold",children:"موسسه آموزشی کافئین"}),e.jsx("span",{className:"text-slate-300",children:"·"}),e.jsx("span",{className:"text-slate-500",children:"سیستم هوشمند و داده‌محور کنکور سراسری"})]}),`;

  if (code.includes(toggleInTopBar)) {
    code = code.replace(toggleInTopBar, cleanTopBar);
    modified = true;
    console.log(`[TopBar] Restored clean decluttered branding in ${filePath}`);
  }

  // 2. Add caffeine-root-layout to root container div for smooth padding-left transitions
  if (code.includes('relative lg:pl-64') && !code.includes('caffeine-root-layout')) {
    code = code.replace('relative lg:pl-64', 'relative caffeine-root-layout lg:pl-64');
    modified = true;
    console.log(`[Layout Padding] Added caffeine-root-layout to root container in ${filePath}`);
  } else if (code.includes('selection:text-[#3C0E11] relative",children:[') && !code.includes('caffeine-root-layout')) {
    code = code.replace('selection:text-[#3C0E11] relative",children:[', 'selection:text-[#3C0E11] relative caffeine-root-layout lg:pl-64",children:[');
    modified = true;
    console.log(`[Layout Padding] Added caffeine-root-layout lg:pl-64 to root container in ${filePath}`);
  }

  // 3. Optimize main padding for desktop (pb-28 lg:pb-10)
  const mainTargetOriginal = `e.jsx("main",{className:"relative z-10 flex-1 pb-28 lg:pb-16 xl:pb-20",children:`;
  const mainTargetNew = `e.jsx("main",{className:"relative z-10 flex-1 pb-28 lg:pb-10",children:`;

  if (code.includes(mainTargetOriginal)) {
    code = code.replace(mainTargetOriginal, mainTargetNew);
    modified = true;
    console.log(`[Main Padding] Adjusted main padding to pb-28 lg:pb-10 in ${filePath}`);
  }

  // 4. Replace Fa component with right-attached collapsible desktop sidebar + mobile dock
  const faStartTarget = `Fa=({currentView:t,currentUserRole:s,onNavigate:a,onOpenAuth:n,activePortalTab:r="overview",onPortalTabChange:i})=>{`;
  const faEndTarget = `Aa=({onNavigate:t})=>e.jsx("footer"`;

  const faStartIdx = code.indexOf(faStartTarget);
  const faEndIdx = code.indexOf(faEndTarget);

  if (faStartIdx !== -1 && faEndIdx !== -1 && faEndIdx > faStartIdx) {
    const newFaCode = generateNewFa();
    code = code.slice(0, faStartIdx) + newFaCode + code.slice(faEndIdx);
    modified = true;
    console.log(`[Sidebar & Dock] Replaced Fa with collapsible desktop sidebar in ${filePath}`);
  } else {
    console.log(`[Sidebar & Dock] Fa anchors not found in ${filePath}`);
  }

  if (modified) {
    fs.writeFileSync(filePath, code, 'utf8');
    console.log(`[Saved] Successfully updated ${filePath}`);
  } else {
    console.log(`[No Change] Nothing modified in ${filePath}`);
  }
}

const targetFiles = [
  path.join(__dirname, '..', 'public', 'assets', 'index-CvuvcUm9.js'),
  path.join(__dirname, '..', 'dist', 'assets', 'index-CvuvcUm9.js'),
  path.join(__dirname, '..', 'cpanel_ready', 'public_html', 'assets', 'index-CvuvcUm9.js'),
  path.join(__dirname, '..', 'cpanel_ready', 'nodejs_app', 'dist', 'assets', 'index-CvuvcUm9.js')
];

console.log('🚀 Running Desktop Optimization & Right-Attached Left Sidebar Patch...');
targetFiles.forEach(patchFile);
console.log('✨ Desktop Sidebar patch finished.');
