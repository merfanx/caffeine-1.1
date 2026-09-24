const p="caffeine_beans_wallet",h="caffeine_purchased_barista_avatars",s="caffeine_student_granted_medals_map",b="caffeine:beans-updated",w="caffeine:barista-purchased",y="caffeine:medals-updated",d={"std-101":[{medalId:"av-shield",grantedAt:"1403/11/15",grantedBy:{id:"adv-1",name:"دکتر علیرضا کاظمی",role:"advisor"},note:"به پاس ثبت دقت ۹۴٪ در آزمون تخصصی شیمی و زیست‌شناسی"}],"st-01":[{medalId:"av-trophy",grantedAt:"1403/11/20",grantedBy:{id:"adv-1",name:"دکتر علیرضا کاظمی",role:"advisor"},note:"کسب رتبه ۱ آزمون قلم‌چی جامع"}]};function g(){if(typeof window>"u")return 220;try{const e=localStorage.getItem(p);if(e!==null){const t=Number(e);if(!isNaN(t))return Math.max(0,t)}}catch(e){console.warn("[avatarInventoryService] getUserCoffeeBeans error:",e)}return 220}function L(e){const t=Math.max(0,Math.round(e));if(typeof window<"u")try{localStorage.setItem(p,String(t)),window.dispatchEvent(new CustomEvent(b,{detail:{beans:t}}))}catch{}return t}function k(){if(typeof window>"u")return[];try{const e=localStorage.getItem(h);if(e){const t=JSON.parse(e);if(Array.isArray(t))return t}}catch(e){console.warn("[avatarInventoryService] getPurchasedBaristaAvatars error:",e)}return[]}function u(e){return k().includes(e)}function Y(e){const t=g(),o=e.priceBeans||0;if(u(e.id))return{success:!0,message:"این آواتار قبلاً توسط شما خریداری شده است.",newBalance:t};if(t<o)return{success:!1,message:`موجودی دانه قهوه شما کافی نیست! شما به ${o-t} دانه قهوه دیگر نیاز دارید (با مطالعه در جنگل کافئین دانه کسب کنید).`,newBalance:t};const f=L(t-o),a=k(),i=Array.from(new Set([...a,e.id]));if(typeof window<"u")try{localStorage.setItem(h,JSON.stringify(i)),window.dispatchEvent(new CustomEvent(w,{detail:{avatarId:e.id,avatar:e,newBalance:f}}))}catch(l){console.warn("[avatarInventoryService] save purchased error:",l)}try{fetch("/api/v1/student/purchase-barista-avatar",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({avatarId:e.id,price:o,newBalance:f})}).catch(()=>{})}catch{}return{success:!0,message:`تبریک! آواتار «${e.name}» با موفقیت با ${o} دانه قهوه خریداری و فعال شد.`,newBalance:f}}function n(){if(typeof window>"u")return d;try{const e=localStorage.getItem(s);if(e){const t=JSON.parse(e);if(t&&typeof t=="object")return t}}catch(e){console.warn("[avatarInventoryService] getAllStudentMedalsMap error:",e)}return d}function x(e="std-101"){const t=n();return t[e]||t["std-101"]||[]}function K(e,t,o,f){const a={...n()},i=a[e]?[...a[e]]:[];if(i.some(c=>c.medalId===t))return{success:!0,message:"این نشان افتخار قبلاً به این دانش‌آموز اعطا شده است.",records:i};const l={medalId:t,grantedAt:new Date().toLocaleDateString("fa-IR"),grantedBy:o,note:f};if(i.push(l),a[e]=i,typeof window<"u")try{localStorage.setItem(s,JSON.stringify(a)),window.dispatchEvent(new CustomEvent(y,{detail:{studentId:e,medalId:t,action:"grant",records:i}}))}catch(c){console.warn("[avatarInventoryService] grantMedal error:",c)}try{fetch("/api/v1/admin/grant-medal",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({studentId:e,medalId:t,action:"grant",granter:o,note:f})}).catch(()=>{})}catch{}return{success:!0,message:"مدال افتخار با موفقیت به دانش‌آموز اعطا گردید.",records:i}}function z(e,t){const o={...n()},a=(o[e]?[...o[e]]:[]).filter(i=>i.medalId!==t);if(o[e]=a,typeof window<"u")try{localStorage.setItem(s,JSON.stringify(o)),window.dispatchEvent(new CustomEvent(y,{detail:{studentId:e,medalId:t,action:"revoke",records:a}}))}catch(i){console.warn("[avatarInventoryService] revokeMedal error:",i)}try{fetch("/api/v1/admin/grant-medal",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({studentId:e,medalId:t,action:"revoke"})}).catch(()=>{})}catch{}return{success:!0,message:"مدال افتخار از حساب دانش‌آموز برداشته شد.",records:a}}function X(e,t="std-101",o="student"){if(e.category==="باریستا و کافه تمرکز"||e.priceBeans&&e.priceBeans>0)return u(e.id)?{isUnlocked:!0,type:"purchased",badgeText:"خریداری‌شده ✓",badgeColor:"bg-emerald-50 text-emerald-700 border-emerald-200"}:{isUnlocked:!1,type:"locked_barista",priceBeans:e.priceBeans||100,badgeText:`${e.priceBeans||100} ☕ دانه قهوه`,badgeColor:"bg-amber-50 text-amber-800 border-amber-300"};if(e.category==="افتخارات و مدال‌ها"||e.requiresAward){const a=x(t).find(i=>i.medalId===e.id);return a?{isUnlocked:!0,type:"awarded",badgeText:"اعطا شده توسط مشاور/مدیریت 🎖️",badgeColor:"bg-amber-100 text-amber-900 border-amber-400 font-black",criteria:e.awardCriteria,grantedInfo:a}:{isUnlocked:!1,type:"locked_medal",badgeText:"نیازمند اعطا توسط مشاور یا مدیریت 🔒",badgeColor:"bg-slate-100 text-slate-700 border-slate-300",criteria:e.awardCriteria||"نیاز به ارزیابی و تایید عملکرد توسط مشاور"}}return{isUnlocked:!0,type:"free",badgeText:"رایگان و آزاد",badgeColor:"bg-indigo-50 text-indigo-700 border-indigo-200"}}const r=(e,t,o,f,a="#ffffff")=>{const i=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="100%" height="100%">
    <defs>
      <linearGradient id="bg-${e}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${t}"/>
        <stop offset="100%" stop-color="${o}"/>
      </linearGradient>
      <linearGradient id="metal-${e}" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#ffffff" stop-opacity="0.95"/>
        <stop offset="50%" stop-color="${a}" stop-opacity="0.9"/>
        <stop offset="100%" stop-color="#f8fafc" stop-opacity="0.95"/>
      </linearGradient>
      <filter id="shadow-${e}" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="3" stdDeviation="4" flood-color="#000000" flood-opacity="0.35"/>
      </filter>
      <filter id="glow-${e}" x="-30%" y="-30%" width="160%" height="160%">
        <feGaussianBlur stdDeviation="3" result="blur"/>
        <feComposite in="SourceGraphic" in2="blur" operator="over"/>
      </filter>
    </defs>
    <!-- Background Tile -->
    <rect width="120" height="120" rx="34" fill="url(#bg-${e})"/>
    <!-- Subtle Inner Border -->
    <rect x="1.5" y="1.5" width="117" height="117" rx="32.5" fill="none" stroke="#ffffff" stroke-width="1.5" stroke-opacity="0.2"/>
    <!-- Icon Container with Drop Shadow -->
    <g filter="url(#shadow-${e})">
      ${f}
    </g>
  </svg>`;return`data:image/svg+xml;utf8,${encodeURIComponent(i.trim())}`},C=r("med","#0284c7","#0f172a",`<!-- Stethoscope & Heartbeat -->
  <path d="M 42 32 C 42 56 78 56 78 32" fill="none" stroke="#e0f2fe" stroke-width="4.5" stroke-linecap="round"/>
  <circle cx="42" cy="30" r="3.5" fill="#38bdf8"/>
  <circle cx="78" cy="30" r="3.5" fill="#38bdf8"/>
  <!-- Central Tube -->
  <path d="M 60 52 L 60 74 C 60 84 48 84 48 76" fill="none" stroke="#e0f2fe" stroke-width="4" stroke-linecap="round"/>
  <!-- Stethoscope Chestpiece -->
  <circle cx="48" cy="74" r="8" fill="#38bdf8" stroke="#ffffff" stroke-width="2"/>
  <circle cx="48" cy="74" r="4" fill="#0284c7"/>
  <!-- Pulse Line Accent -->
  <path d="M 68 76 L 73 76 L 76 68 L 81 84 L 85 73 L 88 76 L 94 76" fill="none" stroke="#38bdf8" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>`,"#38bdf8"),m=r("pharma","#059669","#064e3b",`<!-- Erlenmeyer Flask -->
  <path d="M 52 28 L 68 28 M 55 28 L 55 42 L 34 84 C 31 90 36 96 43 96 L 77 96 C 84 96 89 90 86 84 L 65 42 L 65 28" fill="none" stroke="#d1fae5" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
  <!-- Fluid level -->
  <path d="M 40 76 Q 60 72 80 76 L 82 86 C 81 92 78 94 74 94 L 46 94 C 42 94 39 92 38 86 Z" fill="#34d399" fill-opacity="0.8"/>
  <!-- Rising Bubbles -->
  <circle cx="56" cy="80" r="2.5" fill="#ffffff"/>
  <circle cx="66" cy="70" r="3" fill="#ffffff" fill-opacity="0.9"/>
  <circle cx="58" cy="60" r="2" fill="#a7f3d0"/>`,"#34d399"),S=r("aitech","#4f46e5","#1e1b4b",`<!-- Chip Square Body -->
  <rect x="36" y="36" width="48" height="48" rx="10" fill="#312e81" stroke="#818cf8" stroke-width="3.5"/>
  <!-- Core Pulse -->
  <rect x="47" y="47" width="26" height="26" rx="6" fill="#6366f1" stroke="#c7d2fe" stroke-width="2"/>
  <circle cx="60" cy="60" r="5" fill="#ffffff"/>
  <!-- Pins Left/Right/Top/Bottom -->
  <path d="M 28 46 L 36 46 M 28 60 L 36 60 M 28 74 L 36 74" stroke="#818cf8" stroke-width="3" stroke-linecap="round"/>
  <path d="M 84 46 L 92 46 M 84 60 L 92 60 M 84 74 L 92 74" stroke="#818cf8" stroke-width="3" stroke-linecap="round"/>
  <path d="M 46 28 L 46 36 M 60 28 L 60 36 M 74 28 L 74 36" stroke="#818cf8" stroke-width="3" stroke-linecap="round"/>
  <path d="M 46 84 L 46 92 M 60 84 L 60 92 M 74 84 L 74 92" stroke="#818cf8" stroke-width="3" stroke-linecap="round"/>`,"#818cf8"),M=r("eng","#d97706","#451a03",`<!-- Precision Cogwheel -->
  <g transform="translate(60,60)">
    <circle cx="0" cy="0" r="28" fill="#78350f" stroke="#fbbf24" stroke-width="3.5"/>
    <circle cx="0" cy="0" r="12" fill="#451a03" stroke="#fef08a" stroke-width="3"/>
    <!-- Cog Teeth -->
    <path d="M -6 -34 L 6 -34 L 5 -28 L -5 -28 Z" fill="#fbbf24"/>
    <path d="M -6 34 L 6 34 L 5 28 L -5 28 Z" fill="#fbbf24"/>
    <path d="M -34 -6 L -34 6 L -28 5 L -28 -5 Z" fill="#fbbf24"/>
    <path d="M 34 -6 L 34 6 L 28 5 L 28 -5 Z" fill="#fbbf24"/>
    <!-- Diagonal Teeth -->
    <path d="M -24 -24 L -16 -24 L -18 -18 L -24 -18 Z" fill="#fbbf24" transform="rotate(45)"/>
    <path d="M 24 24 L 16 24 L 18 18 L 24 18 Z" fill="#fbbf24" transform="rotate(45)"/>
    <path d="M -24 24 L -24 16 L -18 18 L -18 24 Z" fill="#fbbf24" transform="rotate(45)"/>
    <path d="M 24 -24 L 24 -16 L 18 -18 L 18 -24 Z" fill="#fbbf24" transform="rotate(45)"/>
  </g>`,"#fbbf24"),v=r("law","#475569","#0f172a",`<!-- Balance Pillar -->
  <path d="M 60 26 L 60 88 M 42 88 L 78 88 M 48 94 L 72 94" stroke="#e2e8f0" stroke-width="4" stroke-linecap="round"/>
  <!-- Top Balance Beam -->
  <path d="M 30 36 L 90 36" stroke="#fbbf24" stroke-width="4" stroke-linecap="round"/>
  <circle cx="60" cy="30" r="4" fill="#fbbf24"/>
  <!-- Left Pan -->
  <path d="M 30 36 L 20 62 M 30 36 L 40 62" stroke="#cbd5e1" stroke-width="2"/>
  <path d="M 16 62 C 16 70 44 70 44 62 Z" fill="#fbbf24" fill-opacity="0.85" stroke="#fef08a" stroke-width="1.5"/>
  <!-- Right Pan -->
  <path d="M 90 36 L 80 62 M 90 36 L 100 62" stroke="#cbd5e1" stroke-width="2"/>
  <path d="M 76 62 C 76 70 104 70 104 62 Z" fill="#fbbf24" fill-opacity="0.85" stroke="#fef08a" stroke-width="1.5"/>`,"#fbbf24"),B=r("arch","#e11d48","#4c0519",`<!-- Drafting Divider / Compass -->
  <circle cx="60" cy="30" r="5" fill="#ffffff" stroke="#fecdd3" stroke-width="2"/>
  <path d="M 58 35 L 36 90 M 62 35 L 84 90" stroke="#fecdd3" stroke-width="4" stroke-linecap="round"/>
  <!-- Compass Pivot Arc -->
  <path d="M 44 64 C 54 58 66 58 76 64" fill="none" stroke="#fb7185" stroke-width="3" stroke-linecap="round"/>
  <!-- Ruler / Measurement ticks -->
  <circle cx="36" cy="90" r="2.5" fill="#ffe4e6"/>
  <circle cx="84" cy="90" r="2.5" fill="#ffe4e6"/>`,"#fb7185"),A=r("econ","#0d9488","#134e4a",`<!-- Chart Grid Bars -->
  <rect x="28" y="66" width="10" height="26" rx="3" fill="#2dd4bf" fill-opacity="0.7"/>
  <rect x="44" y="52" width="10" height="40" rx="3" fill="#2dd4bf" fill-opacity="0.85"/>
  <rect x="60" y="40" width="10" height="52" rx="3" fill="#2dd4bf"/>
  <rect x="76" y="26" width="10" height="66" rx="3" fill="#5eead4"/>
  <!-- Ascending Trend Arrow -->
  <path d="M 28 62 L 48 46 L 64 36 L 86 20 M 86 20 L 74 20 M 86 20 L 86 32" fill="none" stroke="#ffffff" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>`,"#2dd4bf"),T=r("psych","#9333ea","#3b0764",`<!-- Cerebral Brain Hemisphere Lines -->
  <path d="M 60 26 C 45 26 34 38 34 52 C 34 60 38 67 42 72 C 44 82 52 88 60 88 C 68 88 76 82 78 72 C 82 67 86 60 86 52 C 86 38 75 26 60 26 Z" fill="#581c87" stroke="#c084fc" stroke-width="3.5"/>
  <path d="M 60 30 L 60 84 M 46 44 Q 60 50 46 64 M 74 44 Q 60 50 74 64" fill="none" stroke="#e9d5ff" stroke-width="2.5" stroke-linecap="round"/>
  <circle cx="60" cy="50" r="3" fill="#ffffff"/>
  <circle cx="48" cy="58" r="2.5" fill="#f3e8ff"/>
  <circle cx="72" cy="58" r="2.5" fill="#f3e8ff"/>`,"#c084fc"),_=r("lit","#b45309","#451a03",`<!-- Open Study Book -->
  <path d="M 60 48 C 45 42 30 46 22 50 L 22 84 C 30 80 45 76 60 82 C 75 76 90 80 98 84 L 98 50 C 90 46 75 42 60 48 Z" fill="#78350f" stroke="#fde68a" stroke-width="3.5" stroke-linejoin="round"/>
  <!-- Spine Line -->
  <path d="M 60 48 L 60 82" stroke="#fef3c7" stroke-width="3"/>
  <!-- Feather / Quill Pen -->
  <path d="M 78 22 C 70 30 68 44 64 56 L 60 62 L 64 64 C 70 54 82 36 86 24 Z" fill="#f59e0b" stroke="#ffffff" stroke-width="1.5"/>`,"#fbbf24"),E=r("coffee","#78350f","#1c1917",`<!-- Ceramic Cup & Saucer -->
  <ellipse cx="60" cy="88" rx="34" ry="7" fill="#441a03" stroke="#d97706" stroke-width="2.5"/>
  <path d="M 36 46 L 84 46 C 84 72 74 82 60 82 C 46 82 36 72 36 46 Z" fill="#542308" stroke="#fde68a" stroke-width="3.5"/>
  <!-- Cup Handle -->
  <path d="M 82 52 C 94 52 94 70 80 72" fill="none" stroke="#fde68a" stroke-width="3.5" stroke-linecap="round"/>
  <!-- Coffee Foam Surface -->
  <ellipse cx="60" cy="48" rx="22" ry="5" fill="#b45309"/>
  <!-- Aroma Steam Curves -->
  <path d="M 52 38 C 50 32 54 26 50 20" fill="none" stroke="#fef08a" stroke-width="2" stroke-linecap="round"/>
  <path d="M 60 36 C 58 30 62 24 58 18" fill="none" stroke="#fef08a" stroke-width="2.5" stroke-linecap="round"/>
  <path d="M 68 38 C 66 32 70 26 66 20" fill="none" stroke="#fef08a" stroke-width="2" stroke-linecap="round"/>`,"#f59e0b"),G=r("chrono","#ea580c","#7c2d12",`<!-- Stopwatch Body -->
  <circle cx="60" cy="62" r="28" fill="#431407" stroke="#fed7aa" stroke-width="3.5"/>
  <!-- Top Pushers -->
  <rect x="56" y="24" width="8" height="8" rx="2" fill="#fdba74"/>
  <line x1="52" y1="24" x2="68" y2="24" stroke="#fed7aa" stroke-width="3" stroke-linecap="round"/>
  <rect x="78" y="30" width="6" height="6" rx="1.5" fill="#fdba74" transform="rotate(30 81 33)"/>
  <!-- Clock Face & Hands -->
  <circle cx="60" cy="62" r="21" fill="#7c2d12"/>
  <circle cx="60" cy="62" r="3" fill="#ffffff"/>
  <line x1="60" y1="62" x2="60" y2="48" stroke="#f97316" stroke-width="2.5" stroke-linecap="round"/>
  <line x1="60" y1="62" x2="72" y2="62" stroke="#fdba74" stroke-width="2" stroke-linecap="round"/>`,"#fb923c"),R=r("bolt","#f59e0b","#78350f",`<!-- Powerful Lightning Bolt -->
  <polygon points="66,18 36,58 56,58 48,98 84,52 64,52" fill="#fef08a" stroke="#ffffff" stroke-width="2.5" stroke-linejoin="round"/>
  <!-- Radiating Sparkles -->
  <circle cx="28" cy="38" r="2.5" fill="#fde68a"/>
  <circle cx="92" cy="44" r="3" fill="#ffffff"/>
  <circle cx="34" cy="80" r="2" fill="#fde68a"/>
  <circle cx="86" cy="82" r="2.5" fill="#fef08a"/>`,"#fef08a"),D=r("goldbook","#ca8a04","#713f12",`<!-- Book Cover Perspective -->
  <path d="M 32 30 L 78 24 C 84 24 88 28 88 34 L 88 84 C 88 88 84 92 78 92 L 32 96 Z" fill="#854d0e" stroke="#fef08a" stroke-width="3"/>
  <!-- Page Block Edge -->
  <path d="M 38 34 L 82 28 L 82 86 L 38 90 Z" fill="#fef9c3"/>
  <!-- Bookmark Ribbon -->
  <path d="M 52 26 L 52 58 L 58 52 L 64 58 L 64 25" fill="#dc2626"/>
  <!-- Embossed Star on Cover -->
  <polygon points="60,64 62,70 68,70 63,74 65,80 60,76 55,80 57,74 52,70 58,70" fill="#ca8a04"/>`,"#fef08a"),I=r("zen","#059669","#022c22",`<!-- Lotus Petals -->
  <g transform="translate(60,64)">
    <path d="M 0 -28 C -14 -12 -12 12 0 16 C 12 12 14 -12 0 -28 Z" fill="#6ee7b7" stroke="#ffffff" stroke-width="2"/>
    <path d="M -8 -18 C -26 -6 -24 14 -6 16 C 4 14 6 -4 -8 -18 Z" fill="#34d399" fill-opacity="0.85"/>
    <path d="M 8 -18 C 26 -6 24 14 6 16 C -4 14 -6 -4 8 -18 Z" fill="#34d399" fill-opacity="0.85"/>
    <path d="M -16 -6 C -38 4 -32 20 -14 20 C -2 20 0 10 -16 -6 Z" fill="#059669" fill-opacity="0.9"/>
    <path d="M 16 -6 C 38 4 32 20 14 20 C 2 20 0 10 16 -6 Z" fill="#059669" fill-opacity="0.9"/>
    <!-- Water Ripple Base -->
    <ellipse cx="0" cy="20" rx="32" ry="5" fill="none" stroke="#a7f3d0" stroke-width="2"/>
  </g>`,"#6ee7b7"),Z=r("barista-master","#78350f","#1c1917",`<!-- Barista Portafilter & Crema Extraction -->
  <g transform="translate(60,56)">
    <!-- Portafilter Body -->
    <ellipse cx="0" cy="-16" rx="26" ry="10" fill="#292524" stroke="#fbbf24" stroke-width="3"/>
    <ellipse cx="0" cy="-16" rx="20" ry="7" fill="#78350f"/>
    <!-- Portafilter Handle Left -->
    <rect x="-44" y="-20" width="22" height="8" rx="4" fill="#441a03" stroke="#fbbf24" stroke-width="2"/>
    <!-- Dual Spout Bottom -->
    <path d="M -8 -8 L -12 8 M 8 -8 L 12 8" stroke="#fbbf24" stroke-width="3.5" stroke-linecap="round"/>
    <!-- Golden Crema Drips -->
    <circle cx="-12" cy="14" r="3" fill="#fef08a"/>
    <circle cx="12" cy="14" r="3" fill="#fef08a"/>
    <!-- Glass Espresso Cup Below -->
    <path d="M -22 20 L 22 20 L 16 42 L -16 42 Z" fill="#fef3c7" fill-opacity="0.3" stroke="#fde68a" stroke-width="2"/>
    <!-- Liquid Espresso in Cup -->
    <path d="M -18 28 L 18 28 L 14 40 L -14 40 Z" fill="#9a3412"/>
    <ellipse cx="0" cy="28" rx="18" ry="4" fill="#fbbf24"/>
  </g>`,"#fbbf24"),P=r("barista-coldbrew","#0f172a","#1e1b4b",`<!-- Cold Drip Tower & Ice Crystals -->
  <g transform="translate(60,60)">
    <!-- Top Ice Glass Globe -->
    <circle cx="0" cy="-28" r="16" fill="#38bdf8" fill-opacity="0.25" stroke="#7dd3fc" stroke-width="2.5"/>
    <circle cx="-4" cy="-30" r="4" fill="#ffffff" fill-opacity="0.8"/>
    <circle cx="5" cy="-26" r="3" fill="#ffffff" fill-opacity="0.8"/>
    <!-- Drip Valve & Middle Coffee Bed -->
    <line x1="0" y1="-12" x2="0" y2="-4" stroke="#7dd3fc" stroke-width="3" stroke-linecap="round"/>
    <rect x="-14" y="-4" width="28" height="18" rx="4" fill="#451a03" stroke="#38bdf8" stroke-width="2"/>
    <!-- Bottom Decanter Flask with Cold Brew -->
    <path d="M -8 14 L 8 14 L 18 36 L -18 36 Z" fill="#1e1b4b" stroke="#7dd3fc" stroke-width="2.5"/>
    <path d="M -15 24 L 15 24 L 17 35 L -17 35 Z" fill="#78350f"/>
    <!-- Sparkling Nitrogen bubbles -->
    <circle cx="-24" cy="12" r="2.5" fill="#38bdf8"/>
    <circle cx="26" cy="18" r="2" fill="#bae6fd"/>
    <circle cx="22" cy="-14" r="3" fill="#ffffff"/>
  </g>`,"#38bdf8"),O=r("barista-latteart","#9a3412","#431407",`<!-- Latte Art Swan in Wide Cup -->
  <g transform="translate(60,60)">
    <!-- Wide Cup Base -->
    <circle cx="0" cy="4" r="34" fill="#542308" stroke="#fef3c7" stroke-width="3"/>
    <circle cx="0" cy="4" r="30" fill="#78350f"/>
    <!-- Foam Surface Texture -->
    <circle cx="0" cy="4" r="28" fill="#b45309"/>
    <!-- Swan Latte Art Foam (White) -->
    <!-- Swan Body & Feathers -->
    <path d="M -16 14 C -12 2 -4 4 4 10 C 12 4 18 10 16 18 C 10 24 -12 24 -16 14 Z" fill="#ffffff" fill-opacity="0.95"/>
    <!-- Swan Graceful Neck & Head -->
    <path d="M -8 12 C -6 -4 8 -8 10 -16 C 10 -20 6 -20 4 -18 C 0 -12 -6 2 -8 12 Z" fill="#ffffff"/>
    <circle cx="7" cy="-18" r="1.5" fill="#78350f"/>
    <!-- Wing Texture Ripples -->
    <path d="M -10 10 Q -2 6 6 12 M -6 16 Q 2 12 10 18" stroke="#fde68a" stroke-width="1.5" fill="none" stroke-linecap="round"/>
  </g>`,"#ffedd5"),V=r("barista-roaster","#7c2d12","#290d05",`<!-- Roasting Drum & Aromatic Coffee Beans -->
  <g transform="translate(60,60)">
    <!-- Roaster Cylinder -->
    <rect x="-30" y="-20" width="60" height="40" rx="10" fill="#1c1917" stroke="#f97316" stroke-width="3"/>
    <!-- Glowing Heat Chamber Window -->
    <ellipse cx="0" cy="0" rx="18" ry="12" fill="#ea580c" stroke="#fef08a" stroke-width="2"/>
    <ellipse cx="0" cy="0" rx="12" ry="7" fill="#fbbf24"/>
    <!-- Coffee Beans Tumbled Out -->
    <ellipse cx="-16" cy="24" rx="7" ry="5" fill="#451a03" stroke="#fed7aa" stroke-width="1.5" transform="rotate(-20 -16 24)"/>
    <line x1="-19" y1="23" x2="-13" y2="25" stroke="#fed7aa" stroke-width="1.5"/>
    <ellipse cx="16" cy="24" rx="7" ry="5" fill="#78350f" stroke="#fed7aa" stroke-width="1.5" transform="rotate(25 16 24)"/>
    <line x1="13" y1="25" x2="19" y2="23" stroke="#fed7aa" stroke-width="1.5"/>
    <!-- Rising Roast Steam -->
    <path d="M -8 -24 C -6 -32 -2 -34 -6 -40 M 8 -24 C 10 -32 6 -34 10 -40" fill="none" stroke="#fed7aa" stroke-width="2" stroke-linecap="round"/>
  </g>`,"#f97316"),N=r("barista-syphon","#4338ca","#172554",`<!-- Laboratory Siphon Brewer & Chemistry Ring -->
  <g transform="translate(60,58)">
    <!-- Lower Glass Flask Sphere -->
    <circle cx="0" cy="16" r="18" fill="#1e1b4b" stroke="#38bdf8" stroke-width="2.5"/>
    <path d="M -16 18 Q 0 12 16 18 L 14 30 Q 0 34 -14 30 Z" fill="#9a3412" fill-opacity="0.9"/>
    <!-- Syphon Connecting Funnel Tube -->
    <rect x="-3" y="-12" width="6" height="14" fill="#a5f3fc"/>
    <!-- Top Cylindrical Chamber -->
    <rect x="-14" y="-34" width="28" height="22" rx="4" fill="#312e81" stroke="#38bdf8" stroke-width="2"/>
    <path d="M -12 -24 L 12 -24 L 12 -14 L -12 -14 Z" fill="#78350f"/>
    <!-- Blue Flame Below -->
    <path d="M -8 38 C -4 44 4 44 8 38 C 4 34 0 30 0 30 C 0 30 -4 34 -8 38 Z" fill="#38bdf8"/>
    <circle cx="0" cy="38" r="3" fill="#ffffff"/>
  </g>`,"#a5f3fc"),H=r("barista-golden","#b45309","#451a03",`<!-- Giant 3D Golden Coffee Bean with Radiant Crown & Laurels -->
  <g transform="translate(60,58)">
    <!-- Radiating Glory Sunburst -->
    <path d="M 0 -38 L 0 -30 M -26 -26 L -20 -20 M 26 -26 L 20 -20 M -38 0 L -30 0 M 38 0 L 30 0" stroke="#fde047" stroke-width="2.5" stroke-linecap="round"/>
    <!-- Golden Coffee Bean Shape -->
    <ellipse cx="0" cy="0" rx="26" ry="18" fill="#ca8a04" stroke="#fef08a" stroke-width="3" transform="rotate(-30)"/>
    <ellipse cx="0" cy="0" rx="22" ry="14" fill="#eab308" transform="rotate(-30)"/>
    <!-- Center S-Curved Crease -->
    <path d="M -14 -12 Q 0 6 14 12" fill="none" stroke="#713f12" stroke-width="3.5" stroke-linecap="round"/>
    <!-- Crown on top of the Bean -->
    <path d="M -14 -16 L -10 -8 L 0 -14 L 10 -8 L 14 -16 L 10 0 L -10 0 Z" fill="#fbbf24" stroke="#ffffff" stroke-width="1.5"/>
    <circle cx="0" cy="-14" r="2" fill="#ffffff"/>
    <!-- Sparkle Stars -->
    <circle cx="-22" cy="18" r="3" fill="#ffffff"/>
    <circle cx="24" cy="-14" r="3" fill="#ffffff"/>
  </g>`,"#fef08a"),F=r("trophy","#eab308","#713f12",`<!-- Grand Trophy Cup -->
  <path d="M 40 28 L 80 28 C 80 54 68 64 60 64 C 52 64 40 54 40 28 Z" fill="#ca8a04" stroke="#fef08a" stroke-width="3"/>
  <!-- Handles -->
  <path d="M 40 34 C 24 34 24 50 40 54" fill="none" stroke="#fef08a" stroke-width="3" stroke-linecap="round"/>
  <path d="M 80 34 C 96 34 96 50 80 54" fill="none" stroke="#fef08a" stroke-width="3" stroke-linecap="round"/>
  <!-- Stem & Pedestal Base -->
  <path d="M 56 64 L 56 76 L 46 80 L 46 88 L 74 88 L 74 80 L 64 76 L 64 64 Z" fill="#854d0e" stroke="#fde047" stroke-width="2.5"/>
  <!-- #1 Inscription -->
  <circle cx="60" cy="44" r="8" fill="#fef08a"/>
  <path d="M 58 40 L 61 38 L 61 48 M 57 48 L 65 48" stroke="#713f12" stroke-width="2" stroke-linecap="round"/>`,"#fef08a"),U=r("diamond","#06b6d4","#083344",`<!-- Faceted Diamond Geometry -->
  <polygon points="60,22 88,44 76,88 44,88 32,44" fill="#0891b2" stroke="#cffafe" stroke-width="3" stroke-linejoin="round"/>
  <polygon points="46,44 74,44 60,86" fill="#22d3ee" fill-opacity="0.8"/>
  <polygon points="60,24 46,44 60,86" fill="#06b6d4"/>
  <polygon points="60,24 74,44 60,86" fill="#67e8f9" fill-opacity="0.9"/>
  <!-- Sparkling Flares -->
  <circle cx="28" cy="28" r="2.5" fill="#ffffff"/>
  <circle cx="92" cy="32" r="3" fill="#ffffff"/>`,"#a5f3fc"),$=r("grad","#3b82f6","#172554",`<!-- Mortarboard Diamond Cap -->
  <polygon points="60,30 96,44 60,58 24,44" fill="#1e3a8a" stroke="#93c5fd" stroke-width="3" stroke-linejoin="round"/>
  <!-- Skullcap Base -->
  <path d="M 38 52 L 38 68 C 38 78 82 78 82 68 L 82 52" fill="#1d4ed8" stroke="#60a5fa" stroke-width="2.5"/>
  <!-- Tassel Ribbon & Ball -->
  <path d="M 60 44 L 88 56 L 88 74" fill="none" stroke="#fbbf24" stroke-width="2.5" stroke-linecap="round"/>
  <circle cx="88" cy="76" r="3" fill="#f59e0b"/>`,"#93c5fd"),j=r("shield","#6366f1","#1e1b4b",`<!-- Heraldic Shield -->
  <path d="M 60 22 C 78 22 88 28 88 44 C 88 68 68 84 60 92 C 52 84 32 68 32 44 C 32 28 42 22 60 22 Z" fill="#3730a3" stroke="#c7d2fe" stroke-width="3.5"/>
  <!-- Inner Shield Glow -->
  <path d="M 60 28 C 74 28 82 32 82 44 C 82 64 66 76 60 84 C 54 76 38 64 38 44 C 38 32 46 28 60 28 Z" fill="#4338ca" stroke="#818cf8" stroke-width="2"/>
  <!-- Center Star of Excellence -->
  <polygon points="60,40 63,48 71,48 65,53 67,61 60,56 53,61 55,53 49,48 57,48" fill="#fbbf24"/>`,"#c7d2fe"),W=r("star","#ec4899","#500724",`<!-- 5-Point Dimensional Star -->
  <g transform="translate(60,60)">
    <polygon points="0,-36 10,-12 34,-10 16,6 22,30 0,16 -22,30 -16,6 -34,-10 -10,-12" fill="#be185d" stroke="#fbcfe8" stroke-width="3" stroke-linejoin="round"/>
    <!-- Facet Light Shading -->
    <polygon points="0,-36 0,16 10,-12" fill="#f472b6"/>
    <polygon points="34,-10 0,16 16,6" fill="#f472b6"/>
    <polygon points="22,30 0,16 0,16" fill="#f472b6"/>
    <polygon points="-22,30 0,16 -16,6" fill="#f472b6"/>
    <polygon points="-34,-10 0,16 -10,-12" fill="#f472b6"/>
  </g>`,"#fbcfe8"),q=r("royal","#334155","#020617",`<!-- Crown -->
  <path d="M 40 44 L 46 60 L 74 60 L 80 44 L 68 50 L 60 38 L 52 50 Z" fill="#eab308" stroke="#fef08a" stroke-width="2.5" stroke-linejoin="round"/>
  <circle cx="40" cy="42" r="2.5" fill="#fef08a"/>
  <circle cx="60" cy="36" r="3" fill="#fef08a"/>
  <circle cx="80" cy="42" r="2.5" fill="#fef08a"/>
  <!-- Laurel Wreath Branch Left -->
  <path d="M 32 76 C 26 62 30 46 36 38" fill="none" stroke="#94a3b8" stroke-width="3" stroke-linecap="round"/>
  <!-- Laurel Wreath Branch Right -->
  <path d="M 88 76 C 94 62 90 46 84 38" fill="none" stroke="#94a3b8" stroke-width="3" stroke-linecap="round"/>
  <!-- Ribbon Base -->
  <path d="M 46 76 C 60 82 74 76 74 76" fill="none" stroke="#e2e8f0" stroke-width="3" stroke-linecap="round"/>`,"#e2e8f0"),Q=r("hex","#0f172a","#020617",`<!-- Outer Hexagon -->
  <polygon points="60,20 92,38 92,76 60,94 28,76 28,38" fill="none" stroke="#38bdf8" stroke-width="3.5"/>
  <!-- Inner Hexagon -->
  <polygon points="60,32 82,45 82,71 60,84 38,71 38,45" fill="#0369a1" fill-opacity="0.6" stroke="#7dd3fc" stroke-width="2"/>
  <!-- Core Node -->
  <circle cx="60" cy="58" r="6" fill="#ffffff"/>
  <line x1="60" y1="20" x2="60" y2="32" stroke="#38bdf8" stroke-width="2"/>
  <line x1="60" y1="84" x2="60" y2="94" stroke="#38bdf8" stroke-width="2"/>
  <line x1="28" y1="38" x2="38" y2="45" stroke="#38bdf8" stroke-width="2"/>
  <line x1="92" y1="76" x2="82" y2="71" stroke="#38bdf8" stroke-width="2"/>`,"#38bdf8"),J=r("orbit","#1e1b4b","#09090b",`<!-- Central Star Sphere -->
  <circle cx="60" cy="60" r="14" fill="#a855f7" stroke="#e9d5ff" stroke-width="2.5"/>
  <circle cx="60" cy="60" r="8" fill="#ffffff"/>
  <!-- Intersecting Elliptical Orbits -->
  <ellipse cx="60" cy="60" rx="38" ry="12" fill="none" stroke="#c084fc" stroke-width="2.5" transform="rotate(-30 60 60)"/>
  <ellipse cx="60" cy="60" rx="38" ry="12" fill="none" stroke="#818cf8" stroke-width="2.5" transform="rotate(30 60 60)"/>
  <!-- Orbiting Satellites -->
  <circle cx="86" cy="46" r="3.5" fill="#fbcfe8"/>
  <circle cx="34" cy="46" r="3" fill="#bae6fd"/>`,"#c084fc"),ee=[{id:"av-med",category:"رشته‌های هدف",name:"پزشکی و دندانپزشکی",url:C,description:"نماد گوشی پزشکی و نبض سلامت"},{id:"av-pharma",category:"رشته‌های هدف",name:"داروسازی و بیوتکنولوژی",url:m,description:"نماد بالن آزمایشگاه و ترکیبات شیمیایی"},{id:"av-aitech",category:"رشته‌های هدف",name:"مهندسی کامپیوتر و هوش مصنوعی",url:S,description:"تراشه سیلیکونی، الگوریتم و شبکه عصبی"},{id:"av-eng",category:"رشته‌های هدف",name:"مهندسی مکانیک، برق و عمران",url:M,description:"چرخ‌دنده‌های مهندسی و دقت محاسباتی"},{id:"av-law",category:"رشته‌های هدف",name:"حقوق و علوم قضایی",url:v,description:"ترازوی عدالت و استدلال‌های حقوقی"},{id:"av-arch",category:"رشته‌های هدف",name:"معماری، هنر و طراحی",url:B,description:"پرگار مهندسی، پرسپکتیو و خلاقیت"},{id:"av-econ",category:"رشته‌های هدف",name:"مدیریت و اقتصاد",url:A,description:"نمودار صعودی و تحلیل داده‌های مالی"},{id:"av-psych",category:"رشته‌های هدف",name:"روانشناسی و علوم شناختی",url:T,description:"مغز متفکر و یادگیری مفهومی"},{id:"av-lit",category:"رشته‌های هدف",name:"ادبیات و علوم انسانی",url:_,description:"کتاب مرجع و قلم زرین"},{id:"av-coffee",category:"کافئین و تمرکز",name:"شات اسپرسو کافئین",url:E,description:"انرژی و بیدارباش ذهن برای مطالعه عمیق"},{id:"av-chrono",category:"کافئین و تمرکز",name:"کرونومتر و تایمر مطالعه",url:G,description:"ثبت بالاترین رکورد ساعت مطالعه"},{id:"av-bolt",category:"کافئین و تمرکز",name:"جرقه تمرکز عمیق (Deep Focus)",url:R,description:"حداکثر سرعت و بازدهی در حل تست"},{id:"av-goldbook",category:"کافئین و تمرکز",name:"کتاب طلایی کنکور",url:D,description:"تسلط صددرصدی بر مفاهیم کتاب درسی"},{id:"av-zen",category:"کافئین و تمرکز",name:"لوتوس آرامش و ذن",url:I,description:"کنترل کامل استرس و تسلط در جلسه آزمون"},{id:"av-barista-master",category:"باریستا و کافه تمرکز",name:"باریستای مستر و پرتافیلتر",url:Z,description:"کلاه باریستای ایتالیایی، پرتافیلتر طلایی و عصاره‌گیری کرما",priceBeans:120},{id:"av-barista-coldbrew",category:"باریستا و کافه تمرکز",name:"آرتیزان نیترو کلدبرو",url:P,description:"برج قطره‌ای عصاره‌گیری شیشه‌ای، یخ‌های کریستالی و دکانتر سرد",priceBeans:150},{id:"av-barista-latteart",category:"باریستا و کافه تمرکز",name:"استاد لاته آرت و قو قهوه",url:O,description:"فنجان پهن سرامیکی با طرح لاته آرت شاهانه و پیچر استیل",priceBeans:180},{id:"av-barista-roaster",category:"باریستا و کافه تمرکز",name:"مستر رستر دانه‌های تخصصی",url:V,description:"درام برشته‌کاری قهوه تخصصی و دانه‌های معطر تازه رُست‌شده",priceBeans:200},{id:"av-barista-syphon",category:"باریستا و کافه تمرکز",name:"شیمیدان کافئین و سایفون",url:N,description:"دستگاه سایفون آزمایشگاهی، شعله حرارتی و مولکول‌های کافئین",priceBeans:250},{id:"av-barista-golden",category:"باریستا و کافه تمرکز",name:"باریستای اسطوره‌ای و دانه طلایی",url:H,description:"کاپ قهرمانی جهان با دانه قهوه تمام‌طلای ۲۴ عیار",priceBeans:300},{id:"av-trophy",category:"افتخارات و مدال‌ها",name:"کاپ قهرمانی رتبه ۱",url:F,description:"نماد رتبه برتر و قهرمان آزمون‌های آزمایشی کشوری",requiresAward:!0,awardCriteria:"کسب رتبه تک‌رقمی یا تراز بالای ۷۳۰۰ در آزمون آزمایشی"},{id:"av-diamond",category:"افتخارات و مدال‌ها",name:"الماس تراز برتر (+۷۵۰۰)",url:U,description:"درخشش در ترازهای برتر کشوری (+۷۵۰۰)",requiresAward:!0,awardCriteria:"رسیدن به تراز کل بالای ۷۵۰۰ در کارنامه رسمی"},{id:"av-grad",category:"افتخارات و مدال‌ها",name:"کلاه فارغ‌التحصیلی و دانشگاه برتر",url:$,description:"رسیدن به صندلی بهترین دانشگاه‌های کشور",requiresAward:!0,awardCriteria:"قبولی آزمایشی یا اتمام دوره ۱۲ ماهه برنامه جامع با تعهد کامل"},{id:"av-shield",category:"افتخارات و مدال‌ها",name:"سپر دقت (درصد ۱۰۰)",url:j,description:"پوشش کامل و حداقل نمره منفی در حل تست‌های چالشی",requiresAward:!0,awardCriteria:"ثبت دقت بالای ۹۰٪ یا درصد ۱۰۰ در حداقل ۲ درس تخصصی"},{id:"av-star",category:"افتخارات و مدال‌ها",name:"ستاره المپیاد و تیزهوشان",url:W,description:"تحلیل خلاقانه مسائل المپیادی و سرعت عمل بالا",requiresAward:!0,awardCriteria:"مدال‌آوری در المپیادهای علمی یا قبولی در مدارس استعدادهای درخشان"},{id:"av-royal",category:"افتخارات و مدال‌ها",name:"نشان فاخر نخبگان و تاج طلایی",url:q,description:"تاج و شاخه زیتون آکادمیک داوطلبان الگو",requiresAward:!0,awardCriteria:"پایبندی ۱۰۰٪ به گزارش‌کار ماهانه و اخلاق حرفه‌ای مطالعه"},{id:"av-hex",category:"نشان‌های مینیمال",name:"هگزاگون محاسباتی نئون",url:Q,description:"نظم هندسی و انسجام برنامه مطالعاتی"},{id:"av-orbit",category:"نشان‌های مینیمال",name:"مدار کهکشانی هدف",url:J,description:"چرخش حول محور اهداف بزرگ"}];export{ee as D,b as E,w as a,x as b,K as c,y as d,X as e,g,Y as p,z as r};
