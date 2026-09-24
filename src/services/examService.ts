import { ExamModel, ExamAnalysisResult, StudentExamSession, SubjectExamResult } from '../types/examTypes';
import { buildEnhancedExamAnalytics } from './examAnalyticsEngine';

const STORAGE_KEY_EXAMS = 'kafein_custom_exams_v1';
const STORAGE_KEY_SESSIONS = 'kafein_exam_sessions_v1';
const STORAGE_KEY_RESULTS = 'kafein_exam_results_v1';

// Sample ready-to-use exams with pre-configured mock sample PDFs / question keys
export const PRELOADED_SAMPLE_EXAMS: ExamModel[] = [
  // --- EXPERIMENTAL EXAMS ---
  {
    id: 'sample-exam-exp-1403',
    title: 'کنکور سراسری نوبت دوم تیرماه ۱۴۰۳ (دفترچه اختصاصی تجربی)',
    subtitle: 'شامل تمام دروس اختصاصی تجربی (زیست، فیزیک، شیمی و ریاضی)',
    group: 'experimental',
    examType: 'comprehensive',
    subject: 'جامع',
    durationMinutes: 180,
    totalQuestions: 45,
    hasNegativeMarking: true,
    pdfFileName: 'konkur_tajrobi_1403_tir.pdf',
    pdfUrl: '',
    keyAnswers: {
      1: 2, 2: 4, 3: 1, 4: 3, 5: 2, 6: 1, 7: 4, 8: 3, 9: 2, 10: 1,
      11: 3, 12: 4, 13: 2, 14: 1, 15: 4, 16: 3, 17: 2, 18: 1, 19: 4, 20: 3,
      21: 1, 22: 2, 23: 4, 24: 3, 25: 1, 26: 2, 27: 4, 28: 3, 29: 2, 30: 1,
      31: 3, 32: 4, 33: 1, 34: 2, 35: 4, 36: 3, 37: 1, 38: 2, 39: 4, 40: 3,
      41: 2, 42: 1, 43: 4, 44: 3, 45: 2
    },
    subjectsBreakdown: [
      { name: 'زیست‌شناسی', fromQuestion: 1, toQuestion: 15 },
      { name: 'فیزیک', fromQuestion: 16, toQuestion: 25 },
      { name: 'شیمی', fromQuestion: 26, toQuestion: 35 },
      { name: 'ریاضیات تجربی', fromQuestion: 36, toQuestion: 45 }
    ],
    createdAt: '2024-07-15T10:00:00.000Z',
    isCustom: false
  },
  {
    id: 'sample-exam-exp-bio-genetics',
    title: 'آزمون تخصصی زیست‌شناسی جامع (ژنتیک، گیاهی و فیزیولوژی انسانی)',
    subtitle: '۳۰ تست تالیفی مفهومی و ترکیبی زیست پایه‌های دهم، یازدهم و دوازدهم',
    group: 'experimental',
    examType: 'subject',
    subject: 'زیست‌شناسی',
    durationMinutes: 45,
    totalQuestions: 30,
    hasNegativeMarking: true,
    pdfFileName: 'biology_comprehensive_specialized.pdf',
    pdfUrl: '',
    keyAnswers: {
      1: 3, 2: 2, 3: 4, 4: 1, 5: 2, 6: 4, 7: 3, 8: 1, 9: 4, 10: 2,
      11: 1, 12: 3, 13: 4, 14: 2, 15: 1, 16: 3, 17: 2, 18: 4, 19: 1, 20: 3,
      21: 4, 22: 2, 23: 1, 24: 3, 25: 4, 26: 2, 27: 1, 28: 3, 29: 4, 30: 2
    },
    subjectsBreakdown: [
      { name: 'زیست‌شناسی', fromQuestion: 1, toQuestion: 30 }
    ],
    createdAt: '2024-08-10T11:00:00.000Z',
    isCustom: false
  },
  {
    id: 'sample-exam-exp-chemistry',
    title: 'آزمون شبیه‌ساز شیمی جامع کنکور تجربی (استوکیومتری و مفاهیم)',
    subtitle: 'شامل تست‌های محاسباتی، تعادل شیمیایی، اسید و باز و الکتروشیمی',
    group: 'experimental',
    examType: 'subject',
    subject: 'شیمی',
    durationMinutes: 40,
    totalQuestions: 25,
    hasNegativeMarking: true,
    pdfFileName: 'chemistry_comprehensive_exp.pdf',
    pdfUrl: '',
    keyAnswers: {
      1: 1, 2: 4, 3: 2, 4: 3, 5: 1, 6: 4, 7: 2, 8: 3, 9: 1, 10: 4,
      11: 2, 12: 3, 13: 1, 14: 4, 15: 2, 16: 3, 17: 1, 18: 4, 19: 2, 20: 3,
      21: 1, 22: 4, 23: 2, 24: 3, 25: 1
    },
    subjectsBreakdown: [
      { name: 'شیمی', fromQuestion: 1, toQuestion: 25 }
    ],
    createdAt: '2024-08-12T14:00:00.000Z',
    isCustom: false
  },
  {
    id: 'sample-exam-exp-physics',
    title: 'آزمون فیزیک تجربی (حرکت‌شناسی، دینامیک، نوسان و مدارها)',
    subtitle: 'تست‌های تیپ‌بندی شده فیزیک پایه و دوازدهم تجربی',
    group: 'experimental',
    examType: 'subject',
    subject: 'فیزیک تجربی',
    durationMinutes: 40,
    totalQuestions: 25,
    hasNegativeMarking: true,
    pdfFileName: 'physics_experimental_mastery.pdf',
    pdfUrl: '',
    keyAnswers: {
      1: 4, 2: 2, 3: 1, 4: 3, 5: 4, 6: 2, 7: 1, 8: 3, 9: 4, 10: 2,
      11: 1, 12: 3, 13: 4, 14: 2, 15: 1, 16: 3, 17: 4, 18: 2, 19: 1, 20: 3,
      21: 4, 22: 2, 23: 1, 24: 3, 25: 4
    },
    subjectsBreakdown: [
      { name: 'فیزیک', fromQuestion: 1, toQuestion: 25 }
    ],
    createdAt: '2024-08-14T09:30:00.000Z',
    isCustom: false
  },
  {
    id: 'sample-exam-exp-math',
    title: 'آزمون ریاضیات تجربی جامع (تابع، مثلثات، حد و مشتق)',
    subtitle: 'مرور جامع مباحث پر تست ریاضیات کنکور رشته تجربی',
    group: 'experimental',
    examType: 'subject',
    subject: 'ریاضیات تجربی',
    durationMinutes: 45,
    totalQuestions: 25,
    hasNegativeMarking: true,
    pdfFileName: 'math_experimental_core.pdf',
    pdfUrl: '',
    keyAnswers: {
      1: 2, 2: 3, 3: 1, 4: 4, 5: 2, 6: 3, 7: 1, 8: 4, 9: 2, 10: 3,
      11: 1, 12: 4, 13: 2, 14: 3, 15: 1, 16: 4, 17: 2, 18: 3, 19: 1, 20: 4,
      21: 2, 22: 3, 23: 1, 24: 4, 25: 2
    },
    subjectsBreakdown: [
      { name: 'ریاضیات تجربی', fromQuestion: 1, toQuestion: 25 }
    ],
    createdAt: '2024-08-16T15:00:00.000Z',
    isCustom: false
  },
  // --- MATH EXAMS ---
  {
    id: 'sample-exam-math-1403',
    title: 'آزمون جامع ریاضی و فیزیک شبیه‌ساز کنکور ۱۴۰۴',
    subtitle: 'حسابان و ریاضیات پایه، هندسه، گسسته و فیزیک جامع',
    group: 'math',
    examType: 'comprehensive',
    subject: 'جامع',
    durationMinutes: 145,
    totalQuestions: 40,
    hasNegativeMarking: true,
    pdfFileName: 'math_physics_comprehensive_1404.pdf',
    pdfUrl: '',
    keyAnswers: {
      1: 3, 2: 1, 3: 4, 4: 2, 5: 3, 6: 1, 7: 2, 8: 4, 9: 3, 10: 1,
      11: 4, 12: 2, 13: 3, 14: 1, 15: 4, 16: 2, 17: 1, 18: 3, 19: 4, 20: 2,
      21: 3, 22: 1, 23: 2, 24: 4, 25: 3, 26: 1, 27: 4, 28: 2, 29: 3, 30: 1,
      31: 2, 32: 4, 33: 3, 34: 1, 35: 4, 36: 2, 37: 3, 38: 1, 39: 2, 40: 4
    },
    subjectsBreakdown: [
      { name: 'حسابان و دیفرانسیل', fromQuestion: 1, toQuestion: 15 },
      { name: 'هندسه و گسسته', fromQuestion: 16, toQuestion: 25 },
      { name: 'فیزیک', fromQuestion: 26, toQuestion: 40 }
    ],
    createdAt: '2024-08-01T12:00:00.000Z',
    isCustom: false
  },
  {
    id: 'sample-exam-math-calculus',
    title: 'آزمون تخصصی حسابان، دیفرانسیل و ریاضی پایه ریاضی',
    subtitle: 'مباحث مشتق، کاربرد مشتق، حد و پیوستگی و مثلثات',
    group: 'math',
    examType: 'subject',
    subject: 'حسابان و ریاضیات',
    durationMinutes: 50,
    totalQuestions: 25,
    hasNegativeMarking: true,
    pdfFileName: 'calculus_specialized_math.pdf',
    pdfUrl: '',
    keyAnswers: {
      1: 1, 2: 2, 3: 4, 4: 3, 5: 1, 6: 2, 7: 4, 8: 3, 9: 1, 10: 2,
      11: 4, 12: 3, 13: 1, 14: 2, 15: 4, 16: 3, 17: 1, 18: 2, 19: 4, 20: 3,
      21: 1, 22: 2, 23: 4, 24: 3, 25: 1
    },
    subjectsBreakdown: [
      { name: 'حسابان', fromQuestion: 1, toQuestion: 25 }
    ],
    createdAt: '2024-08-18T10:00:00.000Z',
    isCustom: false
  },
  // --- HUMANITIES EXAMS ---
  {
    id: 'sample-exam-humanities-1403',
    title: 'کنکور سراسری علوم انسانی (دفترچه تخصصی)',
    subtitle: 'علوم و فنون، اقتصاد، روانشناسی، جامعه‌شناسی، فلسفه و منطق',
    group: 'humanities',
    examType: 'comprehensive',
    subject: 'جامع',
    durationMinutes: 160,
    totalQuestions: 40,
    hasNegativeMarking: true,
    pdfFileName: 'humanities_comprehensive_1403.pdf',
    pdfUrl: '',
    keyAnswers: {
      1: 1, 2: 2, 3: 3, 4: 4, 5: 1, 6: 2, 7: 3, 8: 4, 9: 1, 10: 2,
      11: 3, 12: 4, 13: 1, 14: 2, 15: 3, 16: 4, 17: 1, 18: 2, 19: 3, 20: 4,
      21: 1, 22: 2, 23: 3, 24: 4, 25: 1, 26: 2, 27: 3, 28: 4, 29: 1, 30: 2,
      31: 3, 32: 4, 33: 1, 34: 2, 35: 3, 36: 4, 37: 1, 38: 2, 39: 3, 40: 4
    },
    subjectsBreakdown: [
      { name: 'علوم و فنون ادبی', fromQuestion: 1, toQuestion: 10 },
      { name: 'جامعه‌شناسی', fromQuestion: 11, toQuestion: 20 },
      { name: 'روانشناسی و فلسفه', fromQuestion: 21, toQuestion: 30 },
      { name: 'اقتصاد و ریاضی انسانی', fromQuestion: 31, toQuestion: 40 }
    ],
    createdAt: '2024-07-20T09:00:00.000Z',
    isCustom: false
  },
  {
    id: 'sample-exam-hum-literature',
    title: 'آزمون علوم و فنون ادبی تخصصی انسانی (عروض، قافیه و آرایه‌ها)',
    subtitle: 'شامل تست‌های قرابت معنایی، تاریخ ادبیات و سبک‌شناسی',
    group: 'humanities',
    examType: 'subject',
    subject: 'علوم و فنون ادبی',
    durationMinutes: 40,
    totalQuestions: 25,
    hasNegativeMarking: true,
    pdfFileName: 'literature_specialized_hum.pdf',
    pdfUrl: '',
    keyAnswers: {
      1: 4, 2: 3, 3: 2, 4: 1, 5: 4, 6: 3, 7: 2, 8: 1, 9: 4, 10: 3,
      11: 2, 12: 1, 13: 4, 14: 3, 15: 2, 16: 1, 17: 4, 18: 3, 19: 2, 20: 1,
      21: 4, 22: 3, 23: 2, 24: 1, 25: 4
    },
    subjectsBreakdown: [
      { name: 'علوم و فنون ادبی', fromQuestion: 1, toQuestion: 25 }
    ],
    createdAt: '2024-08-20T12:00:00.000Z',
    isCustom: false
  }
];

export const PRELOADED_SAMPLE_RESULTS: ExamAnalysisResult[] = [
  {
    id: 'res-sample-01',
    studentId: 'std-001',
    studentName: 'علیرضا رضایی (دوازدهم تجربی)',
    studentGroup: 'experimental',
    studentPhone: '09123456789',
    examId: 'sample-exam-exp-1403',
    examTitle: 'کنکور سراسری نوبت دوم تیرماه ۱۴۰۳ (دفترچه اختصاصی تجربی)',
    completedAt: new Date(Date.now() - 3600 * 1000 * 4).toISOString(),
    totalQuestions: 45,
    totalCorrect: 33,
    totalWrong: 6,
    totalUnanswered: 6,
    overallPercentage: 68.89,
    timeSpentSeconds: 9840,
    subjectsResults: [
      { name: 'زیست‌شناسی', totalQuestions: 15, correctCount: 12, wrongCount: 2, unansweredCount: 1, percentage: 75.56 },
      { name: 'فیزیک', totalQuestions: 10, correctCount: 7, wrongCount: 2, unansweredCount: 1, percentage: 63.33 },
      { name: 'شیمی', totalQuestions: 10, correctCount: 8, wrongCount: 1, unansweredCount: 1, percentage: 76.67 },
      { name: 'ریاضیات تجربی', totalQuestions: 10, correctCount: 6, wrongCount: 1, unansweredCount: 3, percentage: 56.67 }
    ],
    detailedQuestions: Array.from({ length: 45 }, (_, idx) => {
      const qNum = idx + 1;
      const correctOption = PRELOADED_SAMPLE_EXAMS[0].keyAnswers[qNum];
      const isCorrect = qNum % 5 !== 0 && qNum % 7 !== 0;
      const isUnanswered = qNum % 7 === 0;
      const userAns = isUnanswered ? null : isCorrect ? correctOption : ((correctOption % 4) + 1 as 1 | 2 | 3 | 4);
      return {
        number: qNum,
        subject: qNum <= 15 ? 'زیست‌شناسی' : qNum <= 25 ? 'فیزیک' : qNum <= 35 ? 'شیمی' : 'ریاضیات تجربی',
        userAnswer: userAns,
        correctAnswer: correctOption,
        isCorrect: !isUnanswered && isCorrect,
        isUnanswered,
        flag: qNum === 3 ? 'doubt' : qNum === 18 ? 'time_consuming' : null
      };
    })
  },
  {
    id: 'res-sample-02',
    studentId: 'std-002',
    studentName: 'سارا رادمنش (دوازدهم ریاضی)',
    studentGroup: 'math',
    studentPhone: '09198765432',
    examId: 'sample-exam-math-1403',
    examTitle: 'آزمون جامع ریاضی و فیزیک شبیه‌ساز کنکور ۱۴۰۴',
    completedAt: new Date(Date.now() - 3600 * 1000 * 26).toISOString(),
    totalQuestions: 40,
    totalCorrect: 29,
    totalWrong: 5,
    totalUnanswered: 6,
    overallPercentage: 68.33,
    timeSpentSeconds: 8100,
    subjectsResults: [
      { name: 'حسابان و دیفرانسیل', totalQuestions: 15, correctCount: 11, wrongCount: 2, unansweredCount: 2, percentage: 68.89 },
      { name: 'هندسه و گسسته', totalQuestions: 10, correctCount: 7, wrongCount: 1, unansweredCount: 2, percentage: 66.67 },
      { name: 'فیزیک', totalQuestions: 15, correctCount: 11, wrongCount: 2, unansweredCount: 2, percentage: 68.89 }
    ],
    detailedQuestions: Array.from({ length: 40 }, (_, idx) => {
      const qNum = idx + 1;
      const correctOption = PRELOADED_SAMPLE_EXAMS[1].keyAnswers[qNum];
      const isCorrect = qNum % 4 !== 0;
      const isUnanswered = qNum % 6 === 0;
      const userAns = isUnanswered ? null : isCorrect ? correctOption : ((correctOption % 4) + 1 as 1 | 2 | 3 | 4);
      return {
        number: qNum,
        subject: qNum <= 15 ? 'حسابان و دیفرانسیل' : qNum <= 25 ? 'هندسه و گسسته' : 'فیزیک',
        userAnswer: userAns,
        correctAnswer: correctOption,
        isCorrect: !isUnanswered && isCorrect,
        isUnanswered,
        flag: null
      };
    })
  },
  {
    id: 'res-sample-03',
    studentId: 'std-003',
    studentName: 'محمدامین کریمی (فارغ‌التحصیل تجربی)',
    studentGroup: 'experimental',
    studentPhone: '09351112233',
    examId: 'sample-exam-exp-1403',
    examTitle: 'کنکور سراسری نوبت دوم تیرماه ۱۴۰۳ (دفترچه اختصاصی تجربی)',
    completedAt: new Date(Date.now() - 3600 * 1000 * 50).toISOString(),
    totalQuestions: 45,
    totalCorrect: 37,
    totalWrong: 4,
    totalUnanswered: 4,
    overallPercentage: 79.26,
    timeSpentSeconds: 9600,
    subjectsResults: [
      { name: 'زیست‌شناسی', totalQuestions: 15, correctCount: 14, wrongCount: 1, unansweredCount: 0, percentage: 91.11 },
      { name: 'فیزیک', totalQuestions: 10, correctCount: 8, wrongCount: 1, unansweredCount: 1, percentage: 76.67 },
      { name: 'شیمی', totalQuestions: 10, correctCount: 8, wrongCount: 1, unansweredCount: 1, percentage: 76.67 },
      { name: 'ریاضیات تجربی', totalQuestions: 10, correctCount: 7, wrongCount: 1, unansweredCount: 2, percentage: 66.67 }
    ],
    detailedQuestions: Array.from({ length: 45 }, (_, idx) => {
      const qNum = idx + 1;
      const correctOption = PRELOADED_SAMPLE_EXAMS[0].keyAnswers[qNum];
      const isCorrect = qNum % 8 !== 0;
      const isUnanswered = qNum % 11 === 0;
      const userAns = isUnanswered ? null : isCorrect ? correctOption : ((correctOption % 4) + 1 as 1 | 2 | 3 | 4);
      return {
        number: qNum,
        subject: qNum <= 15 ? 'زیست‌شناسی' : qNum <= 25 ? 'فیزیک' : qNum <= 35 ? 'شیمی' : 'ریاضیات تجربی',
        userAnswer: userAns,
        correctAnswer: correctOption,
        isCorrect: !isUnanswered && isCorrect,
        isUnanswered,
        flag: null
      };
    })
  }
];

export function getAllExams(): ExamModel[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_EXAMS);
    if (!raw) {
      return PRELOADED_SAMPLE_EXAMS;
    }
    const customExams: ExamModel[] = JSON.parse(raw);
    return [...customExams, ...PRELOADED_SAMPLE_EXAMS];
  } catch (e) {
    console.error('Error loading exams from storage:', e);
    return PRELOADED_SAMPLE_EXAMS;
  }
}

export function saveCustomExam(exam: ExamModel): void {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_EXAMS);
    const existing: ExamModel[] = raw ? JSON.parse(raw) : [];
    const updated = [exam, ...existing.filter((e) => e.id !== exam.id)];
    localStorage.setItem(STORAGE_KEY_EXAMS, JSON.stringify(updated));
  } catch (e) {
    console.error('Error saving custom exam:', e);
  }
}

export function deleteCustomExam(examId: string): void {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_EXAMS);
    if (!raw) return;
    const existing: ExamModel[] = JSON.parse(raw);
    const updated = existing.filter((e) => e.id !== examId);
    localStorage.setItem(STORAGE_KEY_EXAMS, JSON.stringify(updated));
  } catch (e) {
    console.error('Error deleting exam:', e);
  }
}

export function getExamById(id: string): ExamModel | undefined {
  const all = getAllExams();
  return all.find((e) => e.id === id);
}

// Calculate Sanjesh Standard Percentage Formula: ((3 * C) - W) / (3 * T) * 100
export function calculateExamResults(
  exam: ExamModel,
  userAnswers: Record<number, 1 | 2 | 3 | 4 | null>,
  questionFlags: Record<number, 'doubt' | 'time_consuming' | 'crossed' | null>,
  timeSpentSeconds: number,
  studentInfo?: {
    studentId?: string;
    studentName?: string;
    studentGroup?: any;
    studentPhone?: string;
  }
): ExamAnalysisResult {
  const totalQuestions = exam.totalQuestions;
  let totalCorrect = 0;
  let totalWrong = 0;
  let totalUnanswered = 0;

  const detailedQuestions = [];

  for (let q = 1; q <= totalQuestions; q++) {
    const userAns = userAnswers[q] || null;
    const correctAns = exam.keyAnswers[q];
    const isUnanswered = userAns === null || userAns === undefined;
    const isCorrect = !isUnanswered && userAns === correctAns;
    const flag = questionFlags[q] || null;

    if (isUnanswered) {
      totalUnanswered++;
    } else if (isCorrect) {
      totalCorrect++;
    } else {
      totalWrong++;
    }

    // Find subject
    let subjectName = undefined;
    if (exam.subjectsBreakdown) {
      const match = exam.subjectsBreakdown.find(
        (s) => q >= s.fromQuestion && q <= s.toQuestion
      );
      if (match) subjectName = match.name;
    }

    detailedQuestions.push({
      number: q,
      subject: subjectName,
      userAnswer: userAns,
      correctAnswer: correctAns,
      isCorrect,
      isUnanswered,
      flag
    });
  }

  // Calculate Overall percentage
  const rawScore = exam.hasNegativeMarking
    ? (3 * totalCorrect) - totalWrong
    : (3 * totalCorrect);
  const maxScore = 3 * totalQuestions;
  const overallPercentage = maxScore > 0 ? Number(((rawScore / maxScore) * 100).toFixed(2)) : 0;

  // Calculate subject-by-subject percentage
  const subjectsResults: SubjectExamResult[] = [];
  if (exam.subjectsBreakdown && exam.subjectsBreakdown.length > 0) {
    exam.subjectsBreakdown.forEach((subj) => {
      let subjCorrect = 0;
      let subjWrong = 0;
      let subjUnanswered = 0;
      const subjTotal = subj.toQuestion - subj.fromQuestion + 1;

      for (let q = subj.fromQuestion; q <= subj.toQuestion; q++) {
        const userAns = userAnswers[q];
        const correctAns = exam.keyAnswers[q];
        if (userAns === null || userAns === undefined) {
          subjUnanswered++;
        } else if (userAns === correctAns) {
          subjCorrect++;
        } else {
          subjWrong++;
        }
      }

      const subjRaw = exam.hasNegativeMarking
        ? (3 * subjCorrect) - subjWrong
        : (3 * subjCorrect);
      const subjMax = 3 * subjTotal;
      const subjPct = subjMax > 0 ? Number(((subjRaw / subjMax) * 100).toFixed(2)) : 0;

      subjectsResults.push({
        name: subj.name,
        totalQuestions: subjTotal,
        correctCount: subjCorrect,
        wrongCount: subjWrong,
        unansweredCount: subjUnanswered,
        percentage: subjPct
      });
    });
  }

  // Generate Advanced Topic Breakdown, Trap Diagnostics and Remedial Action Plan
  const enhancedAnalytics = buildEnhancedExamAnalytics(
    exam,
    userAnswers,
    questionFlags,
    timeSpentSeconds,
    detailedQuestions
  );

  const result: ExamAnalysisResult = {
    id: `res-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    studentId: studentInfo?.studentId || 'std-active-01',
    studentName: studentInfo?.studentName || 'علیرضا رضایی (دانش‌آموز دوازدهم)',
    studentGroup: studentInfo?.studentGroup || exam.group,
    studentPhone: studentInfo?.studentPhone || '09123456789',
    examId: exam.id,
    examTitle: exam.title,
    completedAt: new Date().toISOString(),
    totalQuestions,
    totalCorrect,
    totalWrong,
    totalUnanswered,
    overallPercentage,
    timeSpentSeconds,
    subjectsResults,
    topicBreakdown: enhancedAnalytics.topicBreakdown,
    weaknessesSummary: enhancedAnalytics.weaknessesSummary,
    testTrapAnalysis: enhancedAnalytics.testTrapAnalysis,
    remedialPlan: enhancedAnalytics.remedialPlan,
    detailedQuestions
  };

  // Save to history
  saveExamResult(result);

  return result;
}

export function saveExamResult(result: ExamAnalysisResult): void {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_RESULTS);
    const existing: ExamAnalysisResult[] = raw ? JSON.parse(raw) : [];
    const updated = [result, ...existing.filter((r) => r.id !== result.id)];
    localStorage.setItem(STORAGE_KEY_RESULTS, JSON.stringify(updated.slice(0, 100)));
  } catch (e) {
    console.error('Error saving exam result:', e);
  }
}

export function deleteExamResult(resultId: string): void {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_RESULTS);
    const existing: ExamAnalysisResult[] = raw ? JSON.parse(raw) : [];
    const updated = existing.filter((r) => r.id !== resultId);
    localStorage.setItem(STORAGE_KEY_RESULTS, JSON.stringify(updated));
  } catch (e) {
    console.error('Error deleting exam result:', e);
  }
}

export function getExamResultsHistory(): ExamAnalysisResult[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_RESULTS);
    let resultsList: ExamAnalysisResult[] = raw ? JSON.parse(raw) : [];

    if (!resultsList || resultsList.length === 0) {
      resultsList = PRELOADED_SAMPLE_RESULTS;
    }

    // Ensure all results have topicBreakdown, testTrapAnalysis and remedialPlan
    const allExams = getAllExams();
    const enrichedResults = resultsList.map((res) => {
      if (!res.topicBreakdown || !res.testTrapAnalysis || !res.remedialPlan) {
        const matchingExam = allExams.find((e) => e.id === res.examId) || PRELOADED_SAMPLE_EXAMS[0];
        const userAnswers: Record<number, number | null> = {};
        const questionFlags: Record<number, 'doubt' | 'time_consuming' | 'crossed' | null> = {};

        res.detailedQuestions.forEach((q) => {
          userAnswers[q.number] = q.userAnswer;
          questionFlags[q.number] = q.flag || null;
        });

        const analytics = buildEnhancedExamAnalytics(
          matchingExam,
          userAnswers,
          questionFlags,
          res.timeSpentSeconds,
          res.detailedQuestions
        );

        return {
          ...res,
          topicBreakdown: res.topicBreakdown || analytics.topicBreakdown,
          weaknessesSummary: res.weaknessesSummary || analytics.weaknessesSummary,
          testTrapAnalysis: res.testTrapAnalysis || analytics.testTrapAnalysis,
          remedialPlan: res.remedialPlan || analytics.remedialPlan
        };
      }
      return res;
    });

    localStorage.setItem(STORAGE_KEY_RESULTS, JSON.stringify(enrichedResults));
    return enrichedResults;
  } catch (e) {
    console.error('Error loading exam results:', e);
    return PRELOADED_SAMPLE_RESULTS;
  }
}
