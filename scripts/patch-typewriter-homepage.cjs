const fs = require('fs');
const path = require('path');

function patchTypewriter() {
  const files = [
    path.join(__dirname, '..', 'public', 'assets', 'index-CvuvcUm9.js'),
    path.join(__dirname, '..', 'dist', 'assets', 'index-CvuvcUm9.js'),
    path.join(__dirname, '..', 'cpanel_ready', 'public_html', 'assets', 'index-CvuvcUm9.js'),
    path.join(__dirname, '..', 'cpanel_ready', 'nodejs_app', 'dist', 'assets', 'index-CvuvcUm9.js')
  ];

  const targetPhrasesCurrent = `const twPhrases=c.useMemo(()=>["با برنامه هوشمند و همراهی رتبه‌های برتر","با تحلیل موشکافانه آزمون‌ها و سنجش تراز","با برنامه‌ریزی داده‌محور و مشاوره تخصصی VIP","با ارزیابی مستمر و شخصی‌سازی مسیر پیشرفت"],[]);`;
  const newPhrases = `const twPhrases=c.useMemo(()=>["کافئین؛ مثل یه جرعه انرژی برای مغز و انگیزهست","برنامه‌ریزی هوشمند، مرور داده‌محور و سنجش تراز","همراهی مستقیم رتبه‌های برتر و مشاوران ارشد","مسیر قبولی کنکور با تحلیل موشکافانه آزمون‌ها"],[]);`;

  const targetH1Current = `e.jsxs("h1",{className:"text-2xl sm:text-4xl lg:text-5xl font-bold text-[#3C0E11] leading-tight sm:leading-tight tracking-tight flex flex-col items-center justify-center min-h-[2.8em] sm:min-h-[2.2em]",children:[e.jsx("span",{},"مسیر قبولی کنکور، "),e.jsxs("span",{className:"text-[#8E2800] inline-flex items-center justify-center mt-1 font-vazir",role:"text","aria-label":currentTwText,dir:"rtl",children:[e.jsx("span",{className:"select-text","aria-hidden":"true"},displayTwText),e.jsx("span",{className:"inline-block w-[3px] h-[0.85em] ms-1.5 align-middle bg-[#8E2800] rounded-full "+(twReduced?"opacity-75":"animate-pulse"),"aria-hidden":"true"})]})]})`;
  
  const newH1 = `e.jsxs("h1",{className:"text-2xl sm:text-4xl lg:text-5xl font-black text-[#3C0E11] leading-tight sm:leading-tight tracking-tight flex items-center justify-center min-h-[3.2em] sm:min-h-[2.4em] text-center",children:[e.jsxs("span",{className:"inline-flex items-center justify-center font-vazir text-[#3C0E11] text-center",role:"text","aria-label":currentTwText,dir:"rtl",children:[e.jsx("span",{className:"select-text","aria-hidden":"true"},displayTwText),e.jsx("span",{className:"inline-block w-[3px] h-[0.9em] ms-2 align-middle bg-[#8E2800] rounded-full "+(twReduced?"opacity-75":"animate-pulse"),"aria-hidden":"true"})]})]})`;

  // Also support the original unpatched state if building fresh
  const originalState = `const[n,r]=c.useState("experimental"),i=_t.find(l=>l.id===n)||_t[0];`;
  const originalH1 = `e.jsxs("h1",{className:"text-2xl sm:text-4xl lg:text-5xl font-bold text-[#3C0E11] leading-tight sm:leading-tight tracking-tight",children:["مسیر قبولی کنکور، با برنامه هوشمند ",e.jsx("br",{className:"hidden sm:inline"}),e.jsx("span",{className:"text-[#8C6B3E]",children:"و همراهی مستقیم رتبه‌های برتر"})]})`;

  files.forEach(file => {
    if (!fs.existsSync(file)) return;
    let content = fs.readFileSync(file, 'utf8');

    // 1. If currently has targetPhrasesCurrent, replace with newPhrases
    if (content.includes(targetPhrasesCurrent)) {
      content = content.replace(targetPhrasesCurrent, newPhrases);
      console.log(`[Updated twPhrases to requested text in ${file}]`);
    } else if (!content.includes('کافئین؛ مثل یه جرعه انرژی برای مغز و انگیزهست') && content.includes(originalState)) {
      const fullInjectedState = `${originalState}const twPhrases=c.useMemo(()=>["کافئین؛ مثل یه جرعه انرژی برای مغز و انگیزهست","برنامه‌ریزی هوشمند، مرور داده‌محور و سنجش تراز","همراهی مستقیم رتبه‌های برتر و مشاوران ارشد","مسیر قبولی کنکور با تحلیل موشکافانه آزمون‌ها"],[]);const[twIdx,setTwIdx]=c.useState(0);const[twSub,setTwSub]=c.useState(0);const[twDel,setTwDel]=c.useState(!1);const[twReduced,setTwReduced]=c.useState(!1);c.useEffect(()=>{if(typeof window!=="undefined"&&window.matchMedia){const mq=window.matchMedia("(prefers-reduced-motion: reduce)");setTwReduced(mq.matches);const h=(e)=>setTwReduced(e.matches);mq.addEventListener("change",h);return()=>mq.removeEventListener("change",h);}},[]);c.useEffect(()=>{const fullText=twPhrases[twIdx]||"";if(twReduced){setTwSub(fullText.length);return;}if(!twDel&&twSub===fullText.length){const t=setTimeout(()=>setTwDel(!0),1900);return()=>clearTimeout(t);}if(twDel&&twSub===0){setTwDel(!1);setTwIdx((p)=>(p+1)%twPhrases.length);return;}const speed=twDel?30:65;const t=setTimeout(()=>{setTwSub((p)=>p+(twDel?-1:1));},speed);return()=>clearTimeout(t);},[twSub,twDel,twIdx,twPhrases,twReduced]);const currentTwText=twPhrases[twIdx]||"";const displayTwText=currentTwText.slice(0,twSub);`;
      content = content.replace(originalState, fullInjectedState);
      console.log(`[Injected full state with requested text in ${file}]`);
    }

    // 2. If currently has targetH1Current, replace with newH1
    if (content.includes(targetH1Current)) {
      content = content.replace(targetH1Current, newH1);
      console.log(`[Updated H1 to requested text in ${file}]`);
    } else if (content.includes(originalH1)) {
      content = content.replace(originalH1, newH1);
      console.log(`[Replaced original H1 with newH1 in ${file}]`);
    }

    fs.writeFileSync(file, content, 'utf8');
  });
  console.log('Typewriter patch complete.');
}

patchTypewriter();
