import fs from 'fs';

const filePath = 'public/assets/ExamSystemHub-C3IMNpAU.js';
let content = fs.readFileSync(filePath, 'utf8');

// 2. Storage helper code and RepModal
const helperAndModal = `
_KEY_REPORTS = "caffeine_reported_questions_v1",
getStoredReports = () => {
  try {
    const raw = localStorage.getItem(_KEY_REPORTS);
    if (!raw) return [];
    const p = JSON.parse(raw);
    return Array.isArray(p) ? p : [];
  } catch (e) {
    return [];
  }
},
setStoredReports = (reports) => {
  try {
    localStorage.setItem(_KEY_REPORTS, JSON.stringify(reports));
    window.dispatchEvent(new CustomEvent('caffeine_question_reports_updated', { detail: reports }));
  } catch (e) {}
},
updateReportStatusAction = async (reportId, newStatus, adminNote) => {
  const list = getStoredReports().map(r => {
    if (r.id === reportId) {
      return {
        ...r,
        status: newStatus,
        adminNote: adminNote !== undefined ? adminNote : r.adminNote,
        resolvedAt: newStatus === "resolved" ? new Date().toISOString() : r.resolvedAt,
        resolvedBy: "مدیر سیستم"
      };
    }
    return r;
  });
  setStoredReports(list);
  try {
    await fetch("/api/v1/exams/questions/reports/" + reportId, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus, adminNote })
    });
  } catch (e) {}
},
RepModal = ({ question, studentName = "دانش‌آموز", onClose, onReportSuccess }) => {
  const [reason, setReason] = Q.useState("text_error");
  const [desc, setDesc] = Q.useState("");
  const [submitting, setSubmitting] = Q.useState(false);
  const [done, setDone] = Q.useState(false);

  const REASONS = [
    { id: "text_error", label: "اشکال علمی در صورت سوال یا فرمول‌ها" },
    { id: "options_error", label: "غلط بودن یا ابهام در گزینه‌ها" },
    { id: "wrong_answer_key", label: "اشتباه در کلید یا گزینه اعلام‌شده" },
    { id: "explanation_error", label: "نقص یا اشکال در پاسخ تشریحی" },
    { id: "typo_error", label: "غلط تایپی، نگارشی یا ساختاری" },
    { id: "other", label: "سایر موارد و توضیحات آزاد" }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!desc.trim()) {
      alert("لطفاً توضیح مختصری درباره اشکال تست بنویسید.");
      return;
    }
    setSubmitting(true);
    const selectedReason = REASONS.find(r => r.id === reason);
    const repData = {
      id: "qrep-" + Date.now() + "-" + Math.random().toString(36).substring(2, 6),
      questionId: question.id,
      studentName: studentName || "دانش‌آموز",
      studentId: "std-" + Date.now().toString(36),
      reason: reason,
      reasonLabel: selectedReason ? selectedReason.label : "سایر موارد",
      description: desc.trim(),
      status: "pending",
      reportedAt: new Date().toISOString(),
      questionSnapshot: {
        id: question.id,
        subject: question.subject,
        chapter: question.chapter,
        topic: question.topic,
        questionText: question.questionText,
        options: question.options,
        correctOption: question.correctOption,
        explanation: question.explanation,
        source: question.source,
        difficulty: question.difficulty
      }
    };

    const existing = getStoredReports();
    setStoredReports([repData, ...existing]);

    try {
      await fetch("/api/v1/exams/questions/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(repData)
      });
    } catch (err) {}

    setSubmitting(false);
    setDone(true);
    if (onReportSuccess) onReportSuccess(repData);
    setTimeout(() => {
      onClose();
    }, 1400);
  };

  return s.jsx("div", {
    className: "fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto",
    children: s.jsxs("div", {
      className: "bg-white rounded-3xl p-6 sm:p-7 max-w-xl w-full border border-slate-200 shadow-2xl space-y-5 my-6",
      children: [
        s.jsxs("div", {
          className: "flex items-center justify-between border-b border-slate-100 pb-3",
          children: [
            s.jsxs("div", {
              className: "flex items-center gap-2",
              children: [
                s.jsx("div", {
                  className: "w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0",
                  children: s.jsx("svg", {
                    className: "w-4 h-4",
                    viewBox: "0 0 24 24",
                    fill: "none",
                    stroke: "currentColor",
                    strokeWidth: "2",
                    strokeLinecap: "round",
                    strokeLinejoin: "round",
                    children: [
                      s.jsx("path", { d: "m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" }),
                      s.jsx("line", { x1: "12", y1: "9", x2: "12", y2: "13" }),
                      s.jsx("line", { x1: "12", y1: "17", x2: "12.01", y2: "17" })
                    ]
                  })
                }),
                s.jsxs("div", {
                  children: [
                    s.jsx("h3", { className: "text-sm font-black text-slate-900", children: "گزارش اشکال یا خطا در تست" }),
                    s.jsx("p", { className: "text-[11px] text-slate-500", children: "گزارش شما مستقیماً در کارتابل مدیر برای بررسی و اصلاح قرار می‌گیرد." })
                  ]
                })
              ]
            }),
            s.jsx("button", {
              type: "button",
              onClick: onClose,
              className: "p-1.5 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer",
              children: s.jsx(gs, { className: "w-5 h-5" })
            })
          ]
        }),
        done ? s.jsxs("div", {
          className: "py-8 text-center space-y-3",
          children: [
            s.jsx("div", {
              className: "w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto",
              children: s.jsx(Ut, { className: "w-6 h-6" })
            }),
            s.jsx("h4", { className: "text-sm font-black text-slate-900", children: "گزارش با موفقیت ثبت گردید" }),
            s.jsx("p", { className: "text-xs text-slate-500", children: "با تشکر از ثبت گزارش شما؛ مدیر سیستم سوال را بررسی و اصلاح خواهد نمود." })
          ]
        }) : s.jsxs("form", {
          onSubmit: handleSubmit,
          className: "space-y-4 text-right",
          children: [
            s.jsxs("div", {
              className: "p-3 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1 text-xs",
              children: [
                s.jsxs("div", {
                  className: "flex items-center gap-2 text-slate-500 font-bold text-[11px]",
                  children: [
                    s.jsx("span", { children: question.subject || "تست" }),
                    s.jsx("span", { children: "•" }),
                    s.jsx("span", { children: question.chapter || "" })
                  ]
                }),
                s.jsx("p", {
                  className: "text-slate-800 line-clamp-2 leading-relaxed font-medium",
                  children: question.questionText
                })
              ]
            }),
            s.jsxs("div", {
              className: "space-y-1.5",
              children: [
                s.jsx("label", { className: "text-xs font-bold text-slate-700 block", children: "نوع اشکال مشاهده‌شده:" }),
                s.jsx("div", {
                  className: "grid grid-cols-1 sm:grid-cols-2 gap-2",
                  children: REASONS.map(r => s.jsxs("button", {
                    key: r.id,
                    type: "button",
                    onClick: () => setReason(r.id),
                    className: "p-2.5 rounded-xl border text-right text-xs font-bold transition-all flex items-center gap-2 cursor-pointer " + (reason === r.id ? "bg-rose-50 border-rose-400 text-rose-800 shadow-sm" : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"),
                    children: [
                      s.jsx("span", { className: "w-3 h-3 rounded-full border shrink-0 flex items-center justify-center " + (reason === r.id ? "border-rose-600 bg-rose-600" : "border-slate-300") }),
                      s.jsx("span", { className: "leading-tight", children: r.label })
                    ]
                  }))
                })
              ]
            }),
            s.jsxs("div", {
              className: "space-y-1",
              children: [
                s.jsx("label", { className: "text-xs font-bold text-slate-700 block", children: "شرح اشکال و پیشنهاد اصلاح:" }),
                s.jsx("textarea", {
                  rows: 3,
                  value: desc,
                  onChange: e => setDesc(e.target.value),
                  placeholder: "توضیح دهید اشکال در کدام بخش است و اصلاح پیشنهادی شما چیست...",
                  className: "w-full p-3 rounded-2xl border border-slate-200 text-xs focus:ring-2 focus:ring-rose-400 focus:border-rose-400 outline-none leading-relaxed"
                })
              ]
            }),
            s.jsxs("div", {
              className: "flex items-center justify-end gap-2 pt-2 border-t border-slate-100",
              children: [
                s.jsx("button", {
                  type: "button",
                  onClick: onClose,
                  className: "px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 transition-colors cursor-pointer",
                  children: "انصراف"
                }),
                s.jsxs("button", {
                  type: "submit",
                  disabled: submitting,
                  className: "px-5 py-2.5 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-200 flex items-center gap-1.5 transition-all disabled:opacity-50 cursor-pointer",
                  children: [
                    s.jsx("span", { children: submitting ? "در حال ارسال..." : "ثبت و ارسال گزارش به مدیر" })
                  ]
                })
              ]
            })
          ]
        })
      ]
    })
  });
},
ReportedQuestionsAdminView = ({ reportsList, questions, onEditQuestion, onUpdateReportStatus, onDeleteQuestion }) => {
  const [filter, setFilter] = Q.useState("all");
  const [search, setSearch] = Q.useState("");

  const filtered = (reportsList || []).filter(r => {
    if (filter !== "all" && r.status !== filter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const sName = (r.studentName || "").toLowerCase();
      const desc = (r.description || "").toLowerCase();
      const qText = (r.questionSnapshot?.questionText || "").toLowerCase();
      const reasonLbl = (r.reasonLabel || "").toLowerCase();
      if (!sName.includes(q) && !desc.includes(q) && !qText.includes(q) && !reasonLbl.includes(q)) {
        return false;
      }
    }
    return true;
  });

  const pendingCount = (reportsList || []).filter(r => r.status === "pending").length;
  const resolvedCount = (reportsList || []).filter(r => r.status === "resolved").length;
  const dismissedCount = (reportsList || []).filter(r => r.status === "dismissed").length;

  return s.jsxs("div", {
    className: "bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6 text-right",
    children: [
      s.jsxs("div", {
        className: "flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5",
        children: [
          s.jsxs("div", {
            className: "space-y-1",
            children: [
              s.jsxs("div", {
                className: "flex items-center gap-2",
                children: [
                  s.jsx("div", {
                    className: "w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0",
                    children: s.jsx("svg", {
                      className: "w-4 h-4",
                      viewBox: "0 0 24 24",
                      fill: "none",
                      stroke: "currentColor",
                      strokeWidth: "2",
                      strokeLinecap: "round",
                      strokeLinejoin: "round",
                      children: [
                        s.jsx("path", { d: "m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" }),
                        s.jsx("line", { x1: "12", y1: "9", x2: "12", y2: "13" }),
                        s.jsx("line", { x1: "12", y1: "17", x2: "12.01", y2: "17" })
                      ]
                    })
                  }),
                  s.jsx("h2", { className: "text-base font-black text-slate-900", children: "کارتابل تست‌های گزارش‌شده توسط دانش‌آموزان" }),
                  pendingCount > 0 && s.jsxs("span", {
                    className: "px-2 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-bold animate-pulse",
                    children: [pendingCount, " در انتظار بررسی"]
                  })
                ]
              }),
              s.jsx("p", { className: "text-xs text-slate-500", children: "گزارش‌های خطا در تست‌ها را بررسی کنید؛ با زدن دکمه «ویرایش تست» می‌توانید مستقیماً سوال را تصحیح و رفع اشکال کنید." })
            ]
          }),
          s.jsxs("div", {
            className: "flex items-center gap-2 flex-wrap",
            children: [
              s.jsxs("div", {
                className: "px-3.5 py-2 rounded-2xl bg-slate-50 border border-slate-200/80 text-center min-w-[75px]",
                children: [
                  s.jsx("div", { className: "text-[10px] font-bold text-slate-500", children: "کل گزارش‌ها" }),
                  s.jsx("div", { className: "text-sm font-black text-slate-800 font-mono", children: reportsList.length })
                ]
              }),
              s.jsxs("div", {
                className: "px-3.5 py-2 rounded-2xl bg-amber-50 border border-amber-200 text-center min-w-[75px]",
                children: [
                  s.jsx("div", { className: "text-[10px] font-bold text-amber-700", children: "در انتظار" }),
                  s.jsx("div", { className: "text-sm font-black text-amber-900 font-mono", children: pendingCount })
                ]
              }),
              s.jsxs("div", {
                className: "px-3.5 py-2 rounded-2xl bg-emerald-50 border border-emerald-200 text-center min-w-[75px]",
                children: [
                  s.jsx("div", { className: "text-[10px] font-bold text-emerald-700", children: "اصلاح‌شده" }),
                  s.jsx("div", { className: "text-sm font-black text-emerald-900 font-mono", children: resolvedCount })
                ]
              }),
              s.jsxs("div", {
                className: "px-3.5 py-2 rounded-2xl bg-slate-100 border border-slate-200 text-center min-w-[75px]",
                children: [
                  s.jsx("div", { className: "text-[10px] font-bold text-slate-600", children: "رد شده" }),
                  s.jsx("div", { className: "text-sm font-black text-slate-700 font-mono", children: dismissedCount })
                ]
              })
            ]
          })
        ]
      }),
      s.jsxs("div", {
        className: "flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200/80",
        children: [
          s.jsxs("div", {
            className: "flex items-center gap-1.5 flex-wrap w-full sm:w-auto",
            children: [
              s.jsx("button", {
                type: "button",
                onClick: () => setFilter("all"),
                className: "px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer " + (filter === "all" ? "bg-white text-slate-900 shadow-sm ring-1 ring-slate-200" : "text-slate-600 hover:text-slate-900"),
                children: "همه"
              }),
              s.jsxs("button", {
                type: "button",
                onClick: () => setFilter("pending"),
                className: "px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 " + (filter === "pending" ? "bg-amber-100 text-amber-900 font-black shadow-sm" : "text-amber-800 hover:bg-amber-50"),
                children: [
                  s.jsx("span", { children: "در انتظار بررسی" }),
                  pendingCount > 0 && s.jsx("span", { className: "w-2 h-2 rounded-full bg-amber-500 animate-pulse" })
                ]
              }),
              s.jsx("button", {
                type: "button",
                onClick: () => setFilter("resolved"),
                className: "px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer " + (filter === "resolved" ? "bg-emerald-100 text-emerald-900 font-black shadow-sm" : "text-emerald-800 hover:bg-emerald-50"),
                children: "اصلاح و حل‌شده"
              }),
              s.jsx("button", {
                type: "button",
                onClick: () => setFilter("dismissed"),
                className: "px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer " + (filter === "dismissed" ? "bg-slate-200 text-slate-900 font-black shadow-sm" : "text-slate-600 hover:bg-slate-100"),
                children: "رد شده"
              })
            ]
          }),
          s.jsx("input", {
            type: "text",
            value: search,
            onChange: e => setSearch(e.target.value),
            placeholder: "جستجو در متن سوال، دانش‌آموز یا شرح اشکال...",
            className: "w-full sm:w-72 px-3.5 py-1.5 text-xs bg-white rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-400"
          })
        ]
      }),
      filtered.length === 0 ? s.jsxs("div", {
        className: "p-12 text-center space-y-3 bg-slate-50/50 rounded-3xl border border-dashed border-slate-200",
        children: [
          s.jsx("div", {
            className: "w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto",
            children: s.jsx(Ut, { className: "w-6 h-6" })
          }),
          s.jsx("h4", { className: "text-sm font-black text-slate-700", children: "هیچ گزارش تستی با این فیلتر وجود ندارد" }),
          s.jsx("p", { className: "text-xs text-slate-400", children: "هر زمان دانش‌آموزان تستی را گزارش کنند، در این کارتابل نمایش داده می‌شود." })
        ]
      }) : s.jsx("div", {
        className: "space-y-4",
        children: filtered.map(rep => {
          const matchedQ = (questions || []).find(q => q.id === rep.questionId) || rep.questionSnapshot || {};
          const isPending = rep.status === "pending";
          const isResolved = rep.status === "resolved";

          return s.jsxs("div", {
            key: rep.id,
            className: "rounded-3xl border p-5 sm:p-6 transition-all space-y-4 " + (isPending ? "border-amber-300 bg-white shadow-sm ring-1 ring-amber-100" : isResolved ? "border-emerald-200 bg-emerald-50/15" : "border-slate-200 bg-slate-50/40"),
            children: [
              s.jsxs("div", {
                className: "flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3",
                children: [
                  s.jsxs("div", {
                    className: "flex items-center gap-2 flex-wrap",
                    children: [
                      s.jsx("div", {
                        className: "w-7 h-7 rounded-lg bg-indigo-100 text-indigo-800 text-xs font-bold flex items-center justify-center font-mono",
                        children: (rep.studentName || "دانش‌آموز")[0]
                      }),
                      s.jsx("span", { className: "text-xs font-black text-slate-900", children: rep.studentName || "دانش‌آموز" }),
                      s.jsx("span", { className: "text-[11px] text-slate-400", children: rep.reportedAt ? new Date(rep.reportedAt).toLocaleDateString("fa-IR") : "" }),
                      s.jsx("span", { className: "text-[11px] font-bold px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200", children: rep.reasonLabel || "اشکال تست" })
                    ]
                  }),
                  s.jsx("div", {
                    className: "flex items-center gap-2",
                    children: isPending ? s.jsxs("span", {
                      className: "text-[11px] font-bold px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 flex items-center gap-1.5",
                      children: [
                        s.jsx("span", { className: "w-2 h-2 rounded-full bg-amber-500 animate-ping" }),
                        s.jsx("span", { children: "در انتظار بررسی و اقدام مدیر" })
                      ]
                    }) : isResolved ? s.jsxs("span", {
                      className: "text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-1",
                      children: [
                        s.jsx(Ut, { className: "w-3.5 h-3.5 text-emerald-600" }),
                        s.jsx("span", { children: "اصلاح و رفع اشکال شد" })
                      ]
                    }) : s.jsx("span", {
                      className: "text-[11px] font-bold px-2.5 py-1 rounded-full bg-slate-200 text-slate-700",
                      children: "رد گزارش (بدون اشکال)"
                    })
                  })
                ]
              }),
              s.jsxs("div", {
                className: "p-3.5 rounded-2xl bg-rose-50/80 border border-rose-100 text-xs text-rose-950 leading-relaxed flex items-start gap-2.5",
                children: [
                  s.jsx("div", {
                    className: "w-5 h-5 rounded-md bg-rose-200 text-rose-800 flex items-center justify-center shrink-0 mt-0.5",
                    children: s.jsx("span", { className: "font-black text-[11px]", children: "!" })
                  }),
                  s.jsxs("div", {
                    className: "space-y-0.5",
                    children: [
                      s.jsx("div", { className: "font-black text-rose-900 text-[11px]", children: "گزارش و توضیح دانش‌آموز:" }),
                      s.jsx("p", { className: "font-medium", children: rep.description || "توضیحی ثبت نشده است." })
                    ]
                  })
                ]
              }),
              s.jsxs("div", {
                className: "p-4 rounded-2xl bg-slate-50/80 border border-slate-200 space-y-3",
                children: [
                  s.jsxs("div", {
                    className: "flex items-center gap-2 flex-wrap text-xs",
                    children: [
                      s.jsx("span", { className: "font-black text-slate-800", children: matchedQ.subject || "درس نامشخص" }),
                      matchedQ.chapter && s.jsxs("span", { className: "text-slate-500", children: ["• ", matchedQ.chapter] }),
                      matchedQ.difficulty && s.jsxs("span", {
                        className: "text-[10px] font-bold px-2 py-0.5 rounded bg-slate-200 text-slate-700",
                        children: ["سطح: ", matchedQ.difficulty === "easy" ? "آسان" : matchedQ.difficulty === "hard" ? "سخت" : "متوسط"]
                      }),
                      matchedQ.source && matchedQ.source !== "none" && s.jsx("span", {
                        className: "text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200",
                        children: matchedQ.source === "konkur_recent" ? "کنکور سراسری" : matchedQ.source === "sanjesh" ? "سنجش" : "تالیفی"
                      })
                    ]
                  }),
                  s.jsx("div", {
                    className: "text-xs font-bold text-slate-900 leading-relaxed border-r-2 border-indigo-500 pr-2.5",
                    children: s.jsx(Vt, { text: matchedQ.questionText || "متن سوال در دسترس نیست." })
                  }),
                  matchedQ.options && Array.isArray(matchedQ.options) && s.jsx("div", {
                    className: "grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1",
                    children: matchedQ.options.map((opt, oIdx) => {
                      const optNum = oIdx + 1;
                      const isCorrect = Number(matchedQ.correctOption) === optNum;
                      return s.jsxs("div", {
                        key: oIdx,
                        className: "p-2.5 rounded-xl border text-xs flex items-center gap-2 " + (isCorrect ? "bg-emerald-50 border-emerald-300 text-emerald-950 font-bold" : "bg-white border-slate-200 text-slate-700"),
                        children: [
                          s.jsx("span", {
                            className: "w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold font-mono " + (isCorrect ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-600"),
                            children: optNum
                          }),
                          s.jsx("span", { className: "flex-1", children: opt }),
                          isCorrect && s.jsx("span", { className: "text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded", children: "کلید فعلی" })
                        ]
                      });
                    })
                  }),
                  matchedQ.explanation && s.jsxs("div", {
                    className: "p-3 rounded-xl bg-indigo-50/50 border border-indigo-100 text-xs space-y-1 text-slate-700",
                    children: [
                      s.jsx("div", { className: "font-black text-indigo-900 text-[11px]", children: "پاسخ تشریحی فعلی:" }),
                      s.jsx("div", { className: "leading-relaxed text-[11px]", children: s.jsx(Vt, { text: matchedQ.explanation }) })
                    ]
                  })
                ]
              }),
              rep.adminNote && s.jsxs("div", {
                className: "p-3 rounded-xl bg-slate-100 text-xs text-slate-700 flex items-center gap-2",
                children: [
                  s.jsx("span", { className: "font-bold", children: "یادداشت مدیر:" }),
                  s.jsx("span", { children: rep.adminNote })
                ]
              }),
              s.jsxs("div", {
                className: "flex items-center justify-between gap-2 flex-wrap pt-2 border-t border-slate-100",
                children: [
                  s.jsxs("div", {
                    className: "flex items-center gap-2 flex-wrap",
                    children: [
                      s.jsxs("button", {
                        type: "button",
                        onClick: () => onEditQuestion(matchedQ, rep.id),
                        className: "px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-1.5 shadow-sm shadow-indigo-200 transition-all cursor-pointer",
                        children: [
                          s.jsx(ep, { className: "w-3.5 h-3.5" }),
                          s.jsx("span", { children: "ویرایش و تصحیح تست" })
                        ]
                      }),
                      isPending && s.jsxs("button", {
                        type: "button",
                        onClick: () => onUpdateReportStatus(rep.id, "resolved", "تست توسط مدیر بررسی و رفع اشکال گردید."),
                        className: "px-3 py-2 rounded-xl text-xs font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1 transition-colors cursor-pointer",
                        children: [
                          s.jsx(Ut, { className: "w-3.5 h-3.5 text-emerald-600" }),
                          s.jsx("span", { children: "تایید و حل شد" })
                        ]
                      }),
                      isPending && s.jsxs("button", {
                        type: "button",
                        onClick: () => onUpdateReportStatus(rep.id, "dismissed", "گزارش بررسی شد؛ تست فاقد اشکال است."),
                        className: "px-3 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer",
                        children: [
                          s.jsx("span", { children: "رد گزارش (تست درست است)" })
                        ]
                      })
                    ]
                  }),
                  s.jsxs("button", {
                    type: "button",
                    onClick: () => onDeleteQuestion(rep.questionId, rep.id),
                    className: "p-2 rounded-xl text-xs font-bold text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors cursor-pointer flex items-center gap-1",
                    title: "حذف کامل تست از بانک سوالات",
                    children: [
                      s.jsx(Da, { className: "w-3.5 h-3.5" }),
                      s.jsx("span", { className: "text-[11px]", children: "حذف تست از بانک" })
                    ]
                  })
                ]
              })
            ]
          });
        })
      })
    ]
  });
}
`;

console.log('helperAndModal length:', helperAndModal.length);
