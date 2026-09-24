import fs from 'fs';
import { SUBJECT_TAXONOMIES } from '../src/data/subjectTaxonomies.js';

// Build compact taxonomy tree
const tree = {};
for (const [key, item] of Object.entries(SUBJECT_TAXONOMIES)) {
  tree[item.subject] = {
    field: item.field || 'تجربی',
    grades: item.grades.map(g => ({
      grade: g.grade,
      chapters: g.chapters.map(c => ({
        title: c.title,
        lessons: c.lessons.map(l => l.title)
      }))
    }))
  };
}

const treeJson = JSON.stringify(tree);

let code = fs.readFileSync('public/assets/ExamSystemHub-C3IMNpAU.js', 'utf8');

// 1. Embed tree right before the component or near start
const taxTreeDecl = `window.__TAXONOMY_TREE__ = ${treeJson};\n`;
if (!code.includes('window.__TAXONOMY_TREE__')) {
  code = taxTreeDecl + code;
}

// 2. Locate and replace me=async()
const oldMe = `me=async()=>{  try {    const sub = x.subject || "زیست‌شناسی";    const res = await fetch(\`/api/v1/ai/subject-prompt?subject=\${encodeURIComponent(sub)}&chapter=\${encodeURIComponent(x.chapter||"")}&grade=\${encodeURIComponent(x.grade||"twelfth")}\`);    let finalPrompt = "";    if (res.ok) {      const data = await res.json();      finalPrompt = data.prompt || "";    }    const fullClipboard = finalPrompt ? \`\${finalPrompt}\\n\\nسلام. لطفاً از روی فایل PDF / تصویر / متن آزمون ارسالی، تمام سوالات ۴ گزینه‌ای درس «\${sub}» را استخراج کرده و دقیقاً طبق فرمت استاندارد زیر خروجی بده. بین هر دو سوال حتماً ۳ خط تیره (---) قرار بده:\\n---\\n۱- [متن کامل صورت سوال]\\n۱) [متن گزینه ۱]\\n۲) [متن گزینه ۲]\\n۳) [متن گزینه ۳]\\n۴) [متن گزینه ۴]\\nپاسخ: [شماره گزینه صحیح از ۱ تا ۴]\\nپاسخ تشریحی: [تحلیل کامل راه حل و دام گزینه‌ها]\\n[درس: \${sub}] [فصل: نام دقیق فصل از جدول بالا] [مبحث: نام دقیق گفتار/درس از جدول بالا] [پایه: \${x.grade||"دوازدهم"}] [رشته: تجربی] [سختی: متوسط] [منبع: کنکور ۱۴۰۳]\\n#\${sub}\\n---\\nدستورالعمل‌های الزامی:\\n۱. مقادیر «فصل» و «مبحث» را منحصراً و بدون دستکاری از جدول سرفصل‌های بالا انتخاب کنید.\\n۲. فرمول‌های ریاضی و فیزیک و واکنش‌های شیمیایی حتماً به صورت LaTeX ($...$) باشند.\\n۳. خروجی فقط سوالات تستی با فرمت فوق باشد.\` : \`سلام. لطفاً سوالات ۴ گزینه‌ای درس \${sub} را استخراج نمایید.\`;    await navigator.clipboard.writeText(fullClipboard);    N(\`✅ پرامپت اختصاصی درس «\${sub}» همراه با لیست مباحث رسمی در حافظه کپی شد!\`);  } catch(e) {    N("پرامپت در دسترس است.");  }}`;

const newMe = `me=async(forcePrompt)=>{
  try {
    if (typeof forcePrompt === "string" && forcePrompt.length > 30) {
      await navigator.clipboard.writeText(forcePrompt);
      N("✅ پرامپت استخراج با موفقیت در حافظه کپی شد!");
      return;
    }
    const sub = x.subject || "زیست‌شناسی";
    const curGrade = x.promptGrade || x.grade || "دوازدهم";
    const payload = {
      subject: sub,
      grade: curGrade,
      field: x.group || "تجربی",
      chapters: (x.selectedChapters && x.selectedChapters.length > 0) ? x.selectedChapters : (x.chapter ? [x.chapter] : undefined),
      lessons: (x.selectedLessons && x.selectedLessons.length > 0) ? x.selectedLessons : (x.topic ? [x.topic] : undefined)
    };
    const res = await fetch("/api/v1/ai/subject-prompt", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (res.ok) {
      const data = await res.json();
      const pText = data.prompt || "";
      if (pText) {
        await navigator.clipboard.writeText(pText);
        b(prev => ({ ...prev, previewPrompt: pText }));
        N("✅ پرامپت اختصاصی درس «" + sub + "» با موفقیت در حافظه کپی شد!");
      }
    } else {
      const err = await res.json().catch(() => ({}));
      D(err.errors ? err.errors.join(" | ") : (err.message || "خطا در استخراج پرامپت"));
    }
  } catch(e) {
    N("پرامپت در حافظه کپی شد.");
  }
}`;

if (code.includes(oldMe)) {
  code = code.replace(oldMe, newMe);
  console.log("Successfully replaced me=async()");
} else {
  console.warn("oldMe string not found exactly, searching by pattern...");
  const meIdx = code.indexOf('me=async()');
  const meEnd = code.indexOf('fe=async()', meIdx);
  if (meIdx !== -1 && meEnd !== -1) {
    code = code.substring(0, meIdx) + newMe + ', ' + code.substring(meEnd);
    console.log("Pattern-replaced me=async()");
  }
}

// 3. Replace the banner markup in text_batch
const bannerStartMarker = 's.jsxs("div",{className:"p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-indigo-50/90 via-sky-50/50 to-indigo-50/90 border border-indigo-200/90 space-y-4 shadow-sm"';
const bannerStart = code.indexOf(bannerStartMarker);
const pMarker = 's.jsx("p",{className:"text-[11px] text-slate-600';
const pIdx = code.indexOf(pMarker, bannerStart);
const closeIdx = code.indexOf("]})", pIdx);

console.log("bannerStart index:", bannerStart, "closeIdx:", closeIdx);

if (bannerStart !== -1 && closeIdx !== -1) {
  const replacementUI = `(()=>{
    const taxTree = window.__TAXONOMY_TREE__ || {};
    const subList = Object.keys(taxTree);
    const curSub = x.subject || "زیست‌شناسی";
    const subData = taxTree[curSub] || taxTree["زیست‌شناسی"] || { grades: [] };
    const curGrade = x.promptGrade || "دوازدهم";
    
    // Get chapters for current grade (or all if جامع)
    let availableChapters = [];
    if (curGrade === "جامع") {
      subData.grades.forEach(g => {
        g.chapters.forEach(ch => availableChapters.push(ch));
      });
    } else {
      const gObj = subData.grades.find(g => g.grade === curGrade) || subData.grades[0];
      if (gObj) availableChapters = gObj.chapters;
    }
    
    const selChaps = Array.isArray(x.selectedChapters) ? x.selectedChapters : [];
    
    // Get lessons for active chapters
    let availableLessons = [];
    const chapsToUse = selChaps.length > 0 
      ? availableChapters.filter(c => selChaps.includes(c.title))
      : availableChapters;
      
    chapsToUse.forEach(c => {
      if (Array.isArray(c.lessons)) {
        c.lessons.forEach(l => {
          if (!availableLessons.includes(l)) availableLessons.push(l);
        });
      }
    });
    
    const selLessons = Array.isArray(x.selectedLessons) ? x.selectedLessons : [];
    const showPrev = !!x.showPromptPreview;

    const subIcons = {
      "زیست‌شناسی": "🧬",
      "شیمی": "🧪",
      "فیزیک": "⚡",
      "ریاضی": "📐",
      "ادبیات": "📚",
      "عربی": "📖",
      "دین و زندگی": "🕊️",
      "زبان انگلیسی": "🌐"
    };

    return s.jsxs("div", {
      className: "p-5 rounded-3xl bg-gradient-to-br from-indigo-50/95 via-sky-50/70 to-indigo-50/95 border border-indigo-200 shadow-md space-y-4",
      children: [
        // Header
        s.jsxs("div", {
          className: "flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-indigo-100",
          children: [
            s.jsxs("div", {
              className: "flex items-center gap-2",
              children: [
                s.jsx(pn, { className: "w-5 h-5 text-indigo-600 animate-pulse shrink-0" }),
                s.jsxs("div", {
                  children: [
                    s.jsx("h4", { className: "text-sm font-black text-indigo-950", children: "سیستم هوشمند تولید Prompt استخراج سوالات با تفکیک سرفصل" }),
                    s.jsx("p", { className: "text-[11px] text-slate-600", children: "محدوده درس، پایه، فصل و مبحث را فیلتر کنید تا AI فقط در همین سرفصل‌ها سوالات را دسته‌بندی کند." })
                  ]
                })
              ]
            }),
            s.jsxs("div", {
              className: "flex flex-wrap items-center gap-2",
              children: [
                s.jsxs("button", {
                  type: "button",
                  onClick: () => me(),
                  className: "px-4 py-2 rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs font-black transition-all shadow-md shadow-indigo-600/20 flex items-center gap-2",
                  children: [
                    s.jsx(Nv, { className: "w-4 h-4" }),
                    s.jsxs("span", { children: ["📋 کپی Prompt استخراج «", curSub, "»"] })
                  ]
                }),
                s.jsxs("button", {
                  type: "button",
                  onClick: async () => {
                    const nextShow = !showPrev;
                    b(prev => ({ ...prev, showPromptPreview: nextShow }));
                    if (nextShow && !x.previewPrompt) {
                      try {
                        const res = await fetch("/api/v1/ai/subject-prompt", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            subject: curSub,
                            grade: curGrade,
                            chapters: selChaps.length > 0 ? selChaps : undefined,
                            lessons: selLessons.length > 0 ? selLessons : undefined
                          })
                        });
                        if (res.ok) {
                          const dt = await res.json();
                          b(prev => ({ ...prev, previewPrompt: dt.prompt || "" }));
                        }
                      } catch(e) {}
                    }
                  },
                  className: "px-3 py-2 rounded-2xl bg-white border border-indigo-200 hover:bg-indigo-50 text-indigo-900 text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs",
                  children: [
                    s.jsx("span", { children: showPrev ? "🙈 بستن پیش‌نمایش" : "👁️ پیش‌نمایش Prompt" })
                  ]
                }),
                s.jsxs("button", {
                  type: "button",
                  onClick: V,
                  className: "px-3 py-2 rounded-2xl bg-white/80 border border-slate-200 hover:bg-white text-slate-700 text-xs font-bold transition-all flex items-center gap-1 shadow-xs",
                  children: [
                    s.jsx(H5, { className: "w-3.5 h-3.5 text-indigo-600" }),
                    s.jsx("span", { children: "نمونه سوال" })
                  ]
                })
              ]
            })
          ]
        }),

        // 1. Subject Selector (All 8 subjects)
        s.jsxs("div", {
          className: "space-y-1.5",
          children: [
            s.jsxs("div", {
              className: "flex items-center justify-between text-xs font-bold text-slate-700",
              children: [
                s.jsxs("span", { className: "flex items-center gap-1", children: ["۱. انتخاب درس:", s.jsx("span", { className: "text-indigo-600 font-black", children: curSub })] }),
                s.jsx("span", { className: "text-[10px] text-slate-500 font-normal", children: "قابل گسترش به کلیه دروس اختصاصی و عمومی" })
              ]
            }),
            s.jsx("div", {
              className: "flex flex-wrap gap-1.5",
              children: subList.map(sb => s.jsxs("button", {
                key: sb,
                type: "button",
                onClick: () => {
                  const firstChap = (taxTree[sb]?.grades[0]?.chapters[0]?.title) || "فصل ۱";
                  b(prev => ({
                    ...prev,
                    subject: sb,
                    chapter: firstChap,
                    topic: firstChap,
                    selectedChapters: [],
                    selectedLessons: [],
                    previewPrompt: ""
                  }));
                  N("درس «" + sb + "» فعال شد. سرفصل‌ها به‌روزرسانی شدند.");
                },
                className: "px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 " + (curSub === sb ? "bg-indigo-600 text-white shadow-sm ring-2 ring-indigo-400/40 font-black scale-[1.02]" : "bg-white hover:bg-indigo-50/70 text-slate-700 border border-slate-200/80"),
                children: [
                  subIcons[sb] || "📖",
                  s.jsx("span", { children: sb })
                ]
              }))
            })
          ]
        }),

        // 2. Grade Selector
        s.jsxs("div", {
          className: "space-y-1.5 pt-1",
          children: [
            s.jsxs("div", {
              className: "flex items-center justify-between text-xs font-bold text-slate-700",
              children: [
                s.jsxs("span", { className: "flex items-center gap-1", children: ["۲. انتخاب پایه:", s.jsx("span", { className: "text-indigo-600 font-black", children: curGrade })] }),
                s.jsx("span", { className: "text-[10px] text-slate-500 font-normal", children: "سرفصل‌ها بر اساس پایه فیلتر می‌شوند" })
              ]
            }),
            s.jsx("div", {
              className: "flex flex-wrap gap-1.5",
              children: ["دهم", "یازدهم", "دوازدهم", "جامع"].map(gr => s.jsx("button", {
                key: gr,
                type: "button",
                onClick: () => {
                  b(prev => ({
                    ...prev,
                    promptGrade: gr,
                    grade: gr === "دهم" ? "tenth" : gr === "یازدهم" ? "eleventh" : gr === "دوازدهم" ? "twelfth" : "comprehensive",
                    selectedChapters: [],
                    selectedLessons: [],
                    previewPrompt: ""
                  }));
                },
                className: "px-3 py-1.5 rounded-xl text-xs font-bold transition-all " + (curGrade === gr ? "bg-indigo-600 text-white shadow-sm ring-2 ring-indigo-400/40 font-black" : "bg-white hover:bg-indigo-50/70 text-slate-700 border border-slate-200/80"),
                children: gr === "جامع" ? "🌐 جامع (تمام پایه‌ها)" : "پایه " + gr
              }))
            })
          ]
        }),

        // 3. Cascading Chapters Selector
        s.jsxs("div", {
          className: "space-y-1.5 pt-1",
          children: [
            s.jsxs("div", {
              className: "flex items-center justify-between text-xs font-bold text-slate-700",
              children: [
                s.jsxs("span", { className: "flex items-center gap-1", children: ["۳. انتخاب فصل‌ها:", s.jsx("span", { className: "text-indigo-600 font-bold", children: selChaps.length === 0 ? "همه فصل‌ها (" + availableChapters.length + " فصل)" : selChaps.length + " فصل انتخاب‌شده" })] }),
                s.jsx("span", { className: "text-[10px] text-slate-500 font-normal", children: "امکان انتخاب یک، چند فصل یا همه" })
              ]
            }),
            s.jsxs("div", {
              className: "flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-2 bg-white/70 rounded-2xl border border-indigo-100",
              children: [
                s.jsx("button", {
                  type: "button",
                  onClick: () => b(prev => ({ ...prev, selectedChapters: [], selectedLessons: [], previewPrompt: "" })),
                  className: "px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all " + (selChaps.length === 0 ? "bg-indigo-600 text-white font-black" : "bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200"),
                  children: "🌟 همه فصل‌ها"
                }),
                availableChapters.map(ch => {
                  const isSel = selChaps.includes(ch.title);
                  return s.jsx("button", {
                    key: ch.title,
                    type: "button",
                    onClick: () => {
                      const next = isSel ? selChaps.filter(c => c !== ch.title) : [...selChaps, ch.title];
                      b(prev => ({
                        ...prev,
                        selectedChapters: next,
                        chapter: next[0] || ch.title,
                        selectedLessons: [],
                        previewPrompt: ""
                      }));
                    },
                    className: "px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all " + (isSel ? "bg-indigo-600 text-white font-black shadow-xs ring-1 ring-indigo-400" : "bg-white hover:bg-indigo-50/80 text-slate-700 border border-slate-200"),
                    children: ch.title
                  });
                })
              ]
            })
          ]
        }),

        // 4. Cascading Topics / Lessons Selector
        s.jsxs("div", {
          className: "space-y-1.5 pt-1",
          children: [
            s.jsxs("div", {
              className: "flex items-center justify-between text-xs font-bold text-slate-700",
              children: [
                s.jsxs("span", { className: "flex items-center gap-1", children: ["۴. انتخاب مباحث / گفتارها:", s.jsx("span", { className: "text-indigo-600 font-bold", children: selLessons.length === 0 ? "همه مباحث (" + availableLessons.length + " مبحث)" : selLessons.length + " مبحث فیلترشده" })] }),
                s.jsx("span", { className: "text-[10px] text-slate-500 font-normal", children: "هوش مصنوعی محدود به مباحث انتخابی خواهد شد" })
              ]
            }),
            s.jsxs("div", {
              className: "flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-2 bg-white/70 rounded-2xl border border-indigo-100",
              children: [
                s.jsx("button", {
                  type: "button",
                  onClick: () => b(prev => ({ ...prev, selectedLessons: [], previewPrompt: "" })),
                  className: "px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all " + (selLessons.length === 0 ? "bg-indigo-600 text-white font-black" : "bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200"),
                  children: "🌟 همه مباحث فصل"
                }),
                availableLessons.map(ls => {
                  const isSel = selLessons.includes(ls);
                  return s.jsx("button", {
                    key: ls,
                    type: "button",
                    onClick: () => {
                      const next = isSel ? selLessons.filter(l => l !== ls) : [...selLessons, ls];
                      b(prev => ({
                        ...prev,
                        selectedLessons: next,
                        topic: next[0] || ls,
                        previewPrompt: ""
                      }));
                    },
                    className: "px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all " + (isSel ? "bg-indigo-600 text-white font-black shadow-xs ring-1 ring-indigo-400" : "bg-white hover:bg-indigo-50/80 text-slate-700 border border-slate-200"),
                    children: ls
                  });
                })
              ]
            })
          ]
        }),

        // 5. Strict AI Scope Notice & Summary Bar
        s.jsxs("div", {
          className: "p-3 rounded-2xl bg-amber-500/10 border border-amber-300/40 text-amber-950 flex flex-wrap items-center justify-between gap-2 text-xs",
          children: [
            s.jsxs("div", {
              className: "flex items-center gap-1.5 font-bold",
              children: [
                s.jsx("span", { children: "⛔ قفل سرفصل AI:" }),
                s.jsxs("span", { className: "text-amber-800 font-medium", children: ["هوش مصنوعی منحصراً در محدوده «", curSub, " - ", curGrade, "» مجاز به دسته‌بندی است و هیچ مبحثی خارج از این دامنه را نمی‌پذیرد."] })
              ]
            }),
            s.jsxs("div", {
              className: "text-[11px] px-2.5 py-1 rounded-xl bg-white border border-amber-200 font-bold text-amber-900 shadow-xs",
              children: [selChaps.length > 0 ? selChaps.length + " فصل" : "تمام فصول", " | ", selLessons.length > 0 ? selLessons.length + " مبحث" : "تمام مباحث"]
            })
          ]
        }),

        // 6. Live Preview Drawer (if toggled)
        showPrev && s.jsxs("div", {
          className: "p-4 rounded-2xl bg-slate-900 text-slate-100 space-y-2 border border-indigo-400/30 shadow-inner",
          children: [
            s.jsxs("div", {
              className: "flex items-center justify-between pb-2 border-b border-slate-800 text-xs font-bold",
              children: [
                s.jsxs("span", { className: "text-emerald-400 flex items-center gap-1.5", children: [s.jsx(pn, { className: "w-4 h-4" }), "پیش‌نمایش متن نهایی پرامپت تولیدشده:"] }),
                s.jsxs("button", {
                  type: "button",
                  onClick: () => me(x.previewPrompt),
                  className: "px-3 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black transition-all flex items-center gap-1 shadow-sm",
                  children: [s.jsx(Nv, { className: "w-3.5 h-3.5" }), "کپی همین متن"]
                })
              ]
            }),
            s.jsx("textarea", {
              rows: 8,
              readOnly: true,
              value: x.previewPrompt || "در حال آماده‌سازی و استخراج پرامپت پویا...",
              className: "w-full p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px] font-mono leading-relaxed text-indigo-100 focus:outline-none resize-y"
            })
          ]
        })
      ]
    });
  })()`;

  const bannerFullEnd = closeIdx + 3;
  code = code.substring(0, bannerStart) + replacementUI + code.substring(bannerFullEnd);
  console.log("Successfully replaced banner markup with cascading prompt builder UI!");
} else {
  console.error("Failed to find banner start or end!");
}

fs.writeFileSync('public/assets/ExamSystemHub-C3IMNpAU.js', code);
console.log("Saved updated public/assets/ExamSystemHub-C3IMNpAU.js");
