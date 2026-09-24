import { MonthlyReportCardData } from '../types.js';

export const INITIAL_REPORTS: MonthlyReportCardData[] = [
  {
    id: 'rep-m-101-01',
    studentId: 'std-101',
    studentName: 'آرین محمدی',
    monthName: 'شهریور',
    year: 1403,
    totalMonthlyStudyHours: 210,
    totalMonthlyTests: 3400,
    testsAccuracyPercentage: 78,
    avgDailyStudyHours: 7.0,
    streakDays: 28,
    advisorMonthlyVerdict: {
      advisorName: 'دکتر علیرضا کاظمی',
      grade: 'A',
      summary: 'عملکرد داوطلب در طول ماه شهریور بسیار منظم و همراه با افزایش چشمگیر سرعت تست‌زنی در دروس اختصاصی بود.',
      keyDirectivesForNextMonth: [
        'افزایش تعداد تست زمان‌دار در درس فیزیک',
        'مرور هفتگی لغات و قرابت معنایی ادبیات'
      ]
    },
    topMasteredSubjects: [
      { subject: 'زیست‌شناسی پایه دهم', hours: 65, percentage: 84 },
      { subject: 'شیمی یازدهم', hours: 50, percentage: 80 }
    ],
    weaknessAreas: [
      { subject: 'فیزیک دوازدهم - حرکت‌شناسی', reason: 'عدم تسلط بر تحلیل نمودارها', advice: 'حل ۵۰ تست تیپ‌بندی‌شده زمان‌دار' }
    ],
    createdAt: '2026-09-01T00:00:00.000Z'
  }
];

export const monthlyReportService = {
  getReports(): MonthlyReportCardData[] {
    return INITIAL_REPORTS;
  }
};
