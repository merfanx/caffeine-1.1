/**
 * ============================================================================
 * CAFFEINE DATA PRIVACY & CONFIDENTIAL HEALTH RECORDS REPOSITORY
 * ============================================================================
 * Implements strict Confidentiality for:
 * 1. Recovery & Rehabilitation Notes (یادداشت‌های بازتوانی و فرسودگی تحصیلی)
 * 2. Psychological & Mental Health Scores (نمرات پایش سلامت روان و اضطراب آزمون)
 * 3. Counseling Chat Transcripts (تاریخچه چت‌های مشاوره خصوصی)
 *
 * All records are marked with sensitivity: 'CONFIDENTIAL'
 * Access Rule: Strictly limited to Direct Assigned Advisor & System Admin.
 * Parents and third-party advisors receive masked/redacted views with HTTP 403.
 *
 * [SECURITY_LAYER: DATA_PRIVACY_ENFORCEMENT]
 * [PERSISTENCE_LAYER: POSTGRESQL_DRIZZLE]
 * ============================================================================
 */

export const COL_CONFIDENTIAL_HEALTH = 'confidential_health_records';

export type ConfidentialRecordType =
  | 'recovery_note'
  | 'mental_health_score'
  | 'counseling_chat'
  | 'psychological_assessment';

export interface CounselingChatMessage {
  id: string;
  senderRole: 'student' | 'advisor';
  senderName: string;
  message: string;
  timestamp: string;
  isConfidential: true;
}

export interface RecoveryPlanData {
  burnoutRiskLevel: 'low' | 'moderate' | 'high' | 'critical';
  fatigueIndex: number; // 0-100
  sleepTargetHours: number;
  activeRestSessionsPerWeek: number;
  recommendedIntervention: string;
  clinicalObservations: string;
}

export interface ConfidentialHealthRecord {
  id: string;
  studentId: string;
  studentName: string;
  advisorId: string;
  advisorName: string;
  type: ConfidentialRecordType;
  title: string;
  // Sensitivity Flags
  isConfidential: true;
  sensitivityLevel: 'CONFIDENTIAL_RESTRICTED';
  dataClassification: 'PSYCHOLOGICAL_HEALTH_AND_RECOVERY';
  // Sensitive Data Payloads
  confidentialNotes: string;
  healthScore?: number; // 0-100 sensitive mental health score
  recoveryPlan?: RecoveryPlanData;
  chatTranscript?: CounselingChatMessage[];
  // Metadata
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  authorizedRoles: Array<'admin' | 'assigned_advisor'>;
}

/**
 * Default Seed of Confidential Records
 */
export function seedConfidentialRecords(): ConfidentialHealthRecord[] {
  const now = new Date().toISOString();

  return [
    {
      id: 'conf-rec-101-recovery',
      studentId: 'std-101',
      studentName: 'آرین محمدی',
      advisorId: 'adv-1',
      advisorName: 'دکتر علیرضا کاظمی',
      type: 'recovery_note',
      title: 'یادداشت محرمانه بازتوانی روحی و رفع فرسودگی آزمون قلم‌چی',
      isConfidential: true,
      sensitivityLevel: 'CONFIDENTIAL_RESTRICTED',
      dataClassification: 'PSYCHOLOGICAL_HEALTH_AND_RECOVERY',
      confidentialNotes: 'داوطلب به دلیل افت درصد زیست در آزمون اخیر، علائم کمال‌گرایی منفی و اضطراب خواب نشان داده است. برنامه بازتوانی ۴ روزه با پارت‌های استراحت ۳۰ دقیقه‌ای و جایگزینی تست‌های سخت با تست‌های تثبیتی آموزشی تنظیم شد تا انگیزه داوطلب ترمیم شود.',
      healthScore: 78,
      recoveryPlan: {
        burnoutRiskLevel: 'moderate',
        fatigueIndex: 45,
        sleepTargetHours: 7.5,
        activeRestSessionsPerWeek: 3,
        recommendedIntervention: 'کاهش پارت‌های شبانه و پیاده‌روی عصرگاهی در هوای آزاد قبل از خواب',
        clinicalObservations: 'تمرکز ذهنی در دروس محاسباتی حفظ شده اما در زیست احساس فشار روانی دارد.'
      },
      authorizedRoles: ['admin', 'assigned_advisor'],
      createdBy: 'دکتر علیرضا کاظمی (مشاور مستقیم)',
      createdAt: now,
      updatedAt: now
    },
    {
      id: 'conf-rec-101-chat',
      studentId: 'std-101',
      studentName: 'آرین محمدی',
      advisorId: 'adv-1',
      advisorName: 'دکتر علیرضا کاظمی',
      type: 'counseling_chat',
      title: 'تاریخچه گفتگوی خصوصی و مشاوره بالینی تحصیلی',
      isConfidential: true,
      sensitivityLevel: 'CONFIDENTIAL_RESTRICTED',
      dataClassification: 'PSYCHOLOGICAL_HEALTH_AND_RECOVERY',
      confidentialNotes: 'جلسه گفتگوی صوتی و پیام‌های متنی در خصوص مهار اضطراب خانواده و آرام‌سازی روانی.',
      healthScore: 78,
      chatTranscript: [
        {
          id: 'msg-1',
          senderRole: 'student',
          senderName: 'آرین محمدی',
          message: 'سلام دکتر کاظمی، این روزها احساس می‌کنم هر چقدر تست می‌زنم درصدم در آزمون بالا نمیاد و خیلی نگران واکنش خانواده هستم.',
          timestamp: '۱۴۰۴/۰۶/۱۰ - ساعت ۱۸:۲۵',
          isConfidential: true
        },
        {
          id: 'msg-2',
          senderRole: 'advisor',
          senderName: 'دکتر علیرضا کاظمی',
          message: 'سلام آرین جان، کاملاً متوجه نگرانیت هستم اما افت مقطعی در فاز تثبیت کاملاً طبیعیه. خیالت راحت، تمام مکالمات و یادداشت‌های روحی ما کاملاً محرمانه بین خودمون و تیم ارشد باقی می‌مونه. برنامه امروزت رو به فاز بازتوانی سبک تغییر دادم.',
          timestamp: '۱۴۰۴/۰۶/۱۰ - ساعت ۱۸:۲۹',
          isConfidential: true
        },
        {
          id: 'msg-3',
          senderRole: 'student',
          senderName: 'آرین محمدی',
          message: 'خیلی ممنون از درک و همراهیتون دکتر، واقعاً خیالم راحت شد. حتماً توصیه‌های بازتوانی رو امشب رعایت می‌کنم.',
          timestamp: '۱۴۰۴/۰۶/۱۰ - ساعت ۱۸:۳۲',
          isConfidential: true
        }
      ],
      authorizedRoles: ['admin', 'assigned_advisor'],
      createdBy: 'دکتر علیرضا کاظمی (مشاور مستقیم)',
      createdAt: now,
      updatedAt: now
    },
    {
      id: 'conf-rec-st3-psych',
      studentId: 'st-3',
      studentName: 'فاطمه صادقی',
      advisorId: 'adv-1',
      advisorName: 'دکتر علیرضا کاظمی',
      type: 'psychological_assessment',
      title: 'ارزیابی تخصصی تنش و نمره سلامت روان در دوره جمع‌بندی',
      isConfidential: true,
      sensitivityLevel: 'CONFIDENTIAL_RESTRICTED',
      dataClassification: 'PSYCHOLOGICAL_HEALTH_AND_RECOVERY',
      confidentialNotes: 'شاخص سلامت روان به دلیل تراکم بالای امتحانات آزمایشی به ۵۴ رسیده است. در صورت عدم اصلاح سبک خواب، ریسک افت کیفیت مطالعه بالاست. پروتکل بازتوانی اضطراری فعال شد.',
      healthScore: 54,
      recoveryPlan: {
        burnoutRiskLevel: 'high',
        fatigueIndex: 72,
        sleepTargetHours: 8,
        activeRestSessionsPerWeek: 4,
        recommendedIntervention: 'توقف آزمون‌های سنگین روزانه و اختصاص ۲ روز کامل به بازیابی روحی و مرور سبک',
        clinicalObservations: 'نشانه‌های سندرم خستگی مزمن کنکوری مشاهده شد.'
      },
      authorizedRoles: ['admin', 'assigned_advisor'],
      createdBy: 'دکتر علیرضا کاظمی (مشاور مستقیم)',
      createdAt: now,
      updatedAt: now
    }
  ];
}

/**
 * Evaluates whether a requesting user has clearance to view confidential health records
 */
export function checkConfidentialHealthAccess(
  user: {
    role: string;
    userId?: string;
    advisorId?: string;
    studentId?: string;
    childStudentId?: string;
  },
  record: ConfidentialHealthRecord
): { allowed: boolean; reason?: string; isMasked?: boolean } {
  // 1. Admin has global audit clearance
  if (user.role === 'admin') {
    return { allowed: true };
  }

  // 2. Assigned advisor has direct clearance
  if (user.role === 'advisor') {
    if (user.advisorId && user.advisorId === record.advisorId) {
      return { allowed: true };
    }
    return {
      allowed: false,
      reason: 'عدم دسترسی: شما مشاور مستقیم این دانش‌آموز نیستید. بر اساس سیاست حفظ حریم خصوصی مراجعان، یادداشت‌های بازتوانی و چت‌های روحی منحصراً برای مشاور مستقیم و مدیر قابل رؤیت است.'
    };
  }

  // 3. Parents, other students, guests are forbidden from confidential notes and private chats
  return {
    allowed: false,
    reason: 'دسترسی مسدود شد (حریم خصوصی): اطلاعات تفصیلی سلامت روان، چت‌های مشاوره و یادداشت‌های بازتوانی به عنوان داده‌های حساس طبقه‌بندی شده و در راستای اصل رازداری و آرامش داوطلب فقط در اختیار مشاور مستقیم و مدیر قرار دارد.'
  };
}

/**
 * Produces a sanitized, redacted version for unauthorized callers
 */
export function maskConfidentialRecord(record: ConfidentialHealthRecord): Partial<ConfidentialHealthRecord> {
  return {
    id: record.id,
    studentId: record.studentId,
    studentName: record.studentName,
    advisorId: record.advisorId,
    advisorName: record.advisorName,
    type: record.type,
    title: record.title,
    isConfidential: true,
    sensitivityLevel: 'CONFIDENTIAL_RESTRICTED',
    dataClassification: 'PSYCHOLOGICAL_HEALTH_AND_RECOVERY',
    // Redacted fields
    confidentialNotes: '🔒 [اطلاعات محرمانه: یادداشت‌های بازتوانی و سلامت روان صرفاً برای مشاور مستقیم و مدیر قابل رؤیت است]',
    healthScore: undefined, // Hidden
    recoveryPlan: undefined, // Redacted
    chatTranscript: undefined, // Redacted
    authorizedRoles: ['admin', 'assigned_advisor'],
    createdBy: record.createdBy,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt
  };
}

/**
 * Get confidential records with RBAC clearance filtering
 */
export function getConfidentialRecordsForUser(user: {
  role: string;
  userId?: string;
  advisorId?: string;
  studentId?: string;
  childStudentId?: string;
}): { records: Array<Partial<ConfidentialHealthRecord>>; total: number; confidentialCount: number } {
  const allRecords = seedConfidentialRecords();

  const filtered = allRecords.map((rec) => {
    const access = checkConfidentialHealthAccess(user, rec);
    if (access.allowed) {
      return rec;
    }
    return maskConfidentialRecord(rec);
  });

  return {
    records: filtered,
    total: allRecords.length,
    confidentialCount: allRecords.length
  };
}
