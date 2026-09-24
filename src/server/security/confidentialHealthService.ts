import { AuthenticatedUserContext } from '../auth/adminAuthMiddleware.js';
import { normalizeId } from './bolaIdorService.js';

export interface ConfidentialHealthRecord {
  id: string;
  studentId: string;
  studentName: string;
  advisorId: string;
  advisorName: string;
  title: string;
  recoveryNote: string;
  mentalHealthScore: number;
  sleepQualityIndex: number;
  stressLevel: 'low' | 'medium' | 'high' | 'critical';
  counselorAssessment?: string;
  actionItems: string[];
  chatTranscript?: string;
  authorizedRoles: string[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export function seedConfidentialRecords(): ConfidentialHealthRecord[] {
  return [
    {
      id: 'conf-rec-101-recovery',
      studentId: 'std-101',
      studentName: 'آرین محمدی',
      advisorId: 'adv-1',
      advisorName: 'دکتر علیرضا کاظمی',
      title: 'پایش تاب‌آوری روانی و رفع استرس آزمون جامع فروردین',
      recoveryNote: 'داوطلب به دلیل افت درصد شیمی دچار اضطراب عملکردی شده بود. با تکنیک‌های تنفس ۴-۷-۸ و تفکیک تایم‌بندی پارت‌های مطالعاتی، ریتم خواب و آرامش ذهنی به حالت نرمال بازگشت.',
      mentalHealthScore: 84,
      sleepQualityIndex: 88,
      stressLevel: 'medium',
      counselorAssessment: 'انگیزه بسیار بالا، اما کمال‌گرایی افراطی نیاز به مدیریت هفتگی دارد.',
      actionItems: ['تثبیت خواب شبانه حداقل ۷ ساعت', 'عدم محاسبه درصد بلافاصله پس از آزمون آزمایشی', 'جلسه هفتگی تمرین تمرکز'],
      authorizedRoles: ['admin', 'assigned_advisor'],
      createdBy: 'دکتر علیرضا کاظمی (مشاور مستقیم)',
      createdAt: '2026-09-01T08:30:00.000Z',
      updatedAt: '2026-09-01T08:30:00.000Z'
    }
  ];
}

export function checkConfidentialHealthAccess(
  user: { role?: string; advisorId?: string; id?: string; userId?: string } | null | undefined,
  record: { advisorId?: string; studentId?: string }
): { allowed: boolean; reason?: string } {
  if (!user) {
    return { allowed: false, reason: 'احراز هویت الزامی است.' };
  }

  const role = (user.role || '').toLowerCase();
  if (role === 'admin' || role === 'super_admin') {
    return { allowed: true };
  }

  if (role === 'advisor') {
    const myAdvId = normalizeId(user.advisorId || user.userId || user.id);
    const recordAdvId = normalizeId(record.advisorId);
    if (!recordAdvId || recordAdvId === myAdvId) {
      return { allowed: true };
    }
    return {
      allowed: false,
      reason: 'عدم دسترسی (Advisor Confidentiality): این پرونده سلامت روان متعلق به داوطلب تحت نظارت مشاور دیگری است.'
    };
  }

  return {
    allowed: false,
    reason: 'عدم دسترسی: پرونده‌های سلامت روان و یادداشت‌های روان‌شناختی طبق اصل رازداری فقط برای مدیر و مشاور مستقیم مجاز است.'
  };
}
