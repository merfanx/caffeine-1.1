import { StudentComment } from '../types.js';

export const DEFAULT_STUDENT_COMMENTS: StudentComment[] = [
  {
    id: 'comm-01',
    authorName: 'سارا رضایی',
    authorRole: 'رتبه ۲۴ کنکور تجربی ۱۴۰۳ - پزشکی دانشگاه تهران',
    konkurRank: '۲۴ منطقه ۱',
    admittedMajor: 'پزشکی',
    admittedUniversity: 'دانشگاه علوم پزشکی تهران',
    rating: 5,
    commentText: 'برنامه‌ریزی دقیق روزانه و نظارت مستمر مشاور آکادمی کافئین باعث شد در ماه‌های پایانی آرامش کامل داشته باشم.',
    text: 'برنامه‌ریزی دقیق روزانه و نظارت مستمر مشاور آکادمی کافئین باعث شد در ماه‌های پایانی آرامش کامل داشته باشم.',
    date: '۱۴۰۳/۰۶/۲۸',
    createdAt: '2026-09-01T00:00:00.000Z',
    isVerified: true,
    isVerifiedStudent: true,
    advisorName: 'دکتر علیرضا کاظمی',
    likesCount: 56,
    isPinned: true
  },
  {
    id: 'comm-02',
    authorName: 'امیرحسین موسوی',
    authorRole: 'رتبه ۸۹ کنکور ریاضی ۱۴۰۳ - مهندسی کامپیوتر شریف',
    konkurRank: '۸۹ کشوری',
    admittedMajor: 'مهندسی کامپیوتر',
    admittedUniversity: 'دانشگاه صنعتی شریف',
    rating: 5,
    commentText: 'تحلیل دقیق آزمون‌ها با موتور تخمین تراز و بانک تست کافئین مسیر قبولی من رو هموار کرد.',
    text: 'تحلیل دقیق آزمون‌ها با موتور تخمین تراز و بانک تست کافئین مسیر قبولی من رو هموار کرد.',
    date: '۱۴۰۳/۰۶/۲۵',
    createdAt: '2026-09-01T00:00:00.000Z',
    isVerified: true,
    isVerifiedStudent: true,
    advisorName: 'مهندس رادمنش',
    likesCount: 42,
    isPinned: true
  }
];

export const commentService = {
  getComments(): StudentComment[] {
    return DEFAULT_STUDENT_COMMENTS;
  }
};
