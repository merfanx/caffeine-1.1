import {
  ExamModel,
  DetailedQuestionResult,
  TopicBreakdownItem,
  TestTrapItem,
  RemedialPlanItem,
  EnhancedAnalyticsResult
} from '../types/examTypes';

/**
 * Builds diagnostic and remedial insights from exam results
 */
export function buildEnhancedExamAnalytics(
  exam: ExamModel,
  userAnswers: Record<number, number | null>,
  questionFlags: Record<number, 'doubt' | 'time_consuming' | 'crossed' | null>,
  timeSpentSeconds: number,
  detailedQuestions: DetailedQuestionResult[]
): EnhancedAnalyticsResult {
  const topicsMap: Record<string, { total: number; correct: number; wrong: number; unanswered: number; subject: string }> = {};

  // Standard topics mapping
  detailedQuestions.forEach((q) => {
    const topic = q.topic || `${q.subjectName} - مبحث سوال ${q.number}`;
    if (!topicsMap[topic]) {
      topicsMap[topic] = { total: 0, correct: 0, wrong: 0, unanswered: 0, subject: q.subjectName };
    }
    topicsMap[topic].total++;
    if (q.isCorrect) topicsMap[topic].correct++;
    else if (q.isWrong) topicsMap[topic].wrong++;
    else topicsMap[topic].unanswered++;
  });

  const topicBreakdown: TopicBreakdownItem[] = Object.entries(topicsMap).map(([topic, stats]) => {
    const pct = stats.total > 0 ? ((stats.correct * 3 - stats.wrong) / (stats.total * 3)) * 100 : 0;
    const boundedPct = Math.round(Math.max(0, Math.min(100, pct)));
    let status: 'mastered' | 'acceptable' | 'critical_weakness' = 'acceptable';
    if (boundedPct >= 70) status = 'mastered';
    else if (boundedPct < 40) status = 'critical_weakness';

    return {
      topic,
      subject: stats.subject,
      total: stats.total,
      correct: stats.correct,
      wrong: stats.wrong,
      unanswered: stats.unanswered,
      percentage: boundedPct,
      status
    };
  });

  // Calculate trap analysis
  let doubtErrors = 0;
  let calculationErrors = 0;
  let timePressureErrors = 0;

  detailedQuestions.forEach((q) => {
    if (q.isWrong) {
      if (q.flag === 'doubt') doubtErrors++;
      else if (q.number % 3 === 0) calculationErrors++;
      else timePressureErrors++;
    }
  });

  const testTrapAnalysis: TestTrapItem[] = [
    {
      trapType: 'doubt',
      title: 'شک بین دو گزینه (افت دقت به دلیل عدم اطمینان)',
      count: doubtErrors,
      impactPercentageLoss: doubtErrors * 1.8,
      description: 'سوالاتی که با تردید پاسخ داده شده و منجر به نمره منفی شده‌اند.',
      recommendation: 'علامت‌گذاری سوالات شک‌دار با تکنیک ضربدر و منها و خودداری از ریسک بالا در دور اول.'
    },
    {
      trapType: 'calculation',
      title: 'خطای محاسباتی و بی‌دقتی در اعداد',
      count: calculationErrors,
      impactPercentageLoss: calculationErrors * 1.5,
      description: 'اشتباه در مراحل آخر محاسبات یا علامت مثبت/منفی.',
      recommendation: 'نوشتن منظم چرک‌نویس با خط خوانا و بررسی یکاهای فیزیک و شیمی.'
    },
    {
      trapType: 'time_pressure',
      title: 'فشار زمان و سرعت‌زدگی در خواندن صورت سوال',
      count: timePressureErrors,
      impactPercentageLoss: timePressureErrors * 1.6,
      description: 'نادیده گرفتن قیود مانند «به‌جز»، «همواره» و «نادرست است».',
      recommendation: 'هایلایت چشمی یا خط کشیدن زیر کلمات کلیدی صورت سوال پیش از بررسی گزینه‌ها.'
    }
  ];

  // Weaknesses Summary
  const weaknessesSummary: string[] = topicBreakdown
    .filter((t) => t.status === 'critical_weakness')
    .map((t) => `نیاز به مرور فوری مبحث «${t.topic}» در درس ${t.subject} (درصد: ${t.percentage}٪)`);

  if (weaknessesSummary.length === 0) {
    weaknessesSummary.push('عملکرد متوازن و قابل قبول در اکثر مباحث؛ تمرکز بر تثبیت و آزمون‌های زمان‌دار.');
  }

  // Remedial Plan
  const remedialPlan: RemedialPlanItem[] = topicBreakdown
    .filter((t) => t.status === 'critical_weakness')
    .slice(0, 4)
    .map((t, idx) => ({
      subject: t.subject,
      topic: t.topic,
      priority: idx === 0 ? 'urgent' : 'high',
      recommendedResource: `تست‌های کتاب آبی و سه‌سطحی ${t.subject}`,
      recommendedTestCount: 40,
      daysToTarget: 5,
      actionableStep: `حل ۲۰ تست آموزشی بدون زمان و ۲۰ تست زمان‌دار در بازه‌های ۲۵ دقیقه‌ای.`
    }));

  return {
    topicBreakdown,
    weaknessesSummary,
    testTrapAnalysis,
    remedialPlan
  };
}
