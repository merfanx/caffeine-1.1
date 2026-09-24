import { AuthenticatedUserContext } from '../auth/adminAuthMiddleware';

/**
 * ============================================================================
 * CAFFEINE 2.1 BOLA / IDOR CENTRALIZED DEFENSE & AUTHORIZATION ENGINE
 * ============================================================================
 * Standard AI Code Tags:
 * // [SECURITY_LAYER: BOLA_IDOR_AUTHORIZATION_ENGINE]
 * // [DEFENSE: SERVER_SIDE_OWNERSHIP_VALIDATION]
 * // [DEFENSE: PARENT_CHILD_ISOLATION_ENFORCEMENT]
 * // [DEFENSE: ADVISOR_STUDENT_ASSIGNMENT_CHECK]
 * // [DEFENSE: ADMIN_SUPERADMIN_SCOPE_VERIFICATION]
 * // [DEFENSE: ANTI_ID_TAMPERING_FAIL_CLOSED]
 * ============================================================================
 */

export type UserRole = 'anonymous' | 'student' | 'parent' | 'advisor' | 'admin' | 'super_admin';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export type AccessPermission = 'ALLOW' | 'DENY' | 'SELF_ONLY' | 'CHILD_ONLY' | 'ASSIGNED_ONLY' | 'RESTRICTED';

export interface EndpointAuthorizationRule {
  resource: string;
  endpoint: string;
  method: HttpMethod;
  idParameterName: string;
  description: string;
  rolePermissions: {
    anonymous: AccessPermission;
    student: AccessPermission;
    parent: AccessPermission;
    advisor: AccessPermission;
    admin: AccessPermission;
    super_admin: AccessPermission;
  };
  serverEnforcementRule: string;
}

export interface AuthorizationMatrixDecision {
  allowed: boolean;
  statusCode: 200 | 401 | 403 | 404;
  reason?: string;
  sanitizedTargetId?: string;
  appliedScope?: 'GLOBAL' | 'SELF' | 'CHILD' | 'ASSIGNED' | 'DENIED';
}

/**
 * ============================================================================
 * 1. COMPREHENSIVE AUTHORIZATION MATRIX (ALL 6 ROLES ACROSS ALL IDENTIFIERS)
 * ============================================================================
 */
export const AUTHORIZATION_MATRIX: EndpointAuthorizationRule[] = [
  // --- USER PROFILE & ACCOUNT ---
  {
    resource: 'USER_PROFILE',
    endpoint: '/api/v1/student/profile/:id',
    method: 'GET',
    idParameterName: 'studentId / userId',
    description: 'مشاهده پرونده و شناسنامه تحصیلی داوطلب',
    rolePermissions: {
      anonymous: 'DENY',
      student: 'SELF_ONLY',
      parent: 'CHILD_ONLY',
      advisor: 'ASSIGNED_ONLY',
      admin: 'ALLOW',
      super_admin: 'ALLOW'
    },
    serverEnforcementRule: 'بررسی تطابق شناسه با authUser.studentId / authUser.id؛ برای اولیا با authUser.childStudentId؛ برای مشاور با student.advisorId.'
  },
  {
    resource: 'USER_PROFILE',
    endpoint: '/api/v1/user/profile',
    method: 'POST',
    idParameterName: 'userId',
    description: 'به‌روزرسانی مشخصات فردی و تحصیلی پروفایل',
    rolePermissions: {
      anonymous: 'DENY',
      student: 'SELF_ONLY',
      parent: 'SELF_ONLY',
      advisor: 'SELF_ONLY',
      admin: 'ALLOW',
      super_admin: 'ALLOW'
    },
    serverEnforcementRule: 'فیلد ارسالی userId در صورت عدم دسترسی ادمین نادیده گرفته شده و مستقیماً از authUser.id استفاده می‌شود.'
  },
  {
    resource: 'USER_CREDENTIALS_PIN',
    endpoint: '/api/v1/auth/update-pin',
    method: 'POST',
    idParameterName: 'userId',
    description: 'تغییر و هش مجدد پین‌کد ورود با Bcrypt',
    rolePermissions: {
      anonymous: 'DENY',
      student: 'SELF_ONLY',
      parent: 'SELF_ONLY',
      advisor: 'SELF_ONLY',
      admin: 'ALLOW',
      super_admin: 'ALLOW'
    },
    serverEnforcementRule: 'شناسه کاربر هدف منحصراً از توکن JWT استخراج می‌شود مگر در درخواست‌های احراز هویت شده توسط ادمین.'
  },

  // --- DAILY STUDY REPORTS ---
  {
    resource: 'DAILY_STUDY_REPORTS',
    endpoint: '/api/v1/student/daily-reports',
    method: 'GET',
    idParameterName: 'studentId (Query)',
    description: 'دریافت تاریخچه گزارش‌های روزانه مطالعه و تست',
    rolePermissions: {
      anonymous: 'DENY',
      student: 'SELF_ONLY',
      parent: 'CHILD_ONLY',
      advisor: 'ASSIGNED_ONLY',
      admin: 'ALLOW',
      super_admin: 'ALLOW'
    },
    serverEnforcementRule: 'مسدودسازی دسترسی کاربران مهمان؛ فیلتر اکید سوابق فقط بر اساس شناسه دانش‌آموز لاگین‌شده یا فرزند اولیا.'
  },
  {
    resource: 'DAILY_STUDY_REPORTS',
    endpoint: '/api/v1/student/daily-report',
    method: 'POST',
    idParameterName: 'studentId (Body)',
    description: 'ثبت پارت‌های مطالعه روزانه و دریافت ارزیابی هوشمند',
    rolePermissions: {
      anonymous: 'DENY',
      student: 'SELF_ONLY',
      parent: 'DENY',
      advisor: 'ASSIGNED_ONLY',
      admin: 'ALLOW',
      super_admin: 'ALLOW'
    },
    serverEnforcementRule: 'دانش‌آموز تنها مجاز به ثبت گزارش برای شناسه تاییدشده خود در توکن است.'
  },

  // --- MONTHLY REPORT CARDS ---
  {
    resource: 'MONTHLY_REPORT_CARDS',
    endpoint: '/api/v1/student/monthly-reports',
    method: 'GET',
    idParameterName: 'studentId (Query)',
    description: 'مشاهده کارنامه‌های تجمیعی ماهانه و تحلیل مشاور',
    rolePermissions: {
      anonymous: 'DENY',
      student: 'SELF_ONLY',
      parent: 'CHILD_ONLY',
      advisor: 'ASSIGNED_ONLY',
      admin: 'ALLOW',
      super_admin: 'ALLOW'
    },
    serverEnforcementRule: 'جلوگیری از نشت کارنامه سایر دانش‌آموزان به مهمان، دانش‌آموزان دیگر یا اولیای غیرمرتبط.'
  },
  {
    resource: 'MONTHLY_REPORT_CARDS',
    endpoint: '/api/v1/student/monthly-reports',
    method: 'POST',
    idParameterName: 'reportId / studentId (Body)',
    description: 'ایجاد یا ویرایش کارنامه تحلیل ماهانه',
    rolePermissions: {
      anonymous: 'DENY',
      student: 'DENY',
      parent: 'DENY',
      advisor: 'ASSIGNED_ONLY',
      admin: 'ALLOW',
      super_admin: 'ALLOW'
    },
    serverEnforcementRule: 'فقط مشاور اختصاصی دانش‌آموز یا مدیران کل مجاز به صدور و ویرایش کارنامه هستند.'
  },

  // --- EXAMS AND RESULTS ---
  {
    resource: 'EXAMS_AND_RESULTS',
    endpoint: '/api/v1/exams',
    method: 'GET',
    idParameterName: 'N/A (Public Catalog)',
    description: 'مشاهده فهرست آزمون‌های آنلاین در دسترس',
    rolePermissions: {
      anonymous: 'ALLOW',
      student: 'ALLOW',
      parent: 'ALLOW',
      advisor: 'ALLOW',
      admin: 'ALLOW',
      super_admin: 'ALLOW'
    },
    serverEnforcementRule: 'عمومی و بدون داده حساس؛ فقط اطلاعات عمومی آزمون‌ها.'
  },
  {
    resource: 'EXAMS_AND_RESULTS',
    endpoint: '/api/v1/exams',
    method: 'POST',
    idParameterName: 'examId (Body)',
    description: 'طراحی و انتشار آزمون جدید در سامانه',
    rolePermissions: {
      anonymous: 'DENY',
      student: 'DENY',
      parent: 'DENY',
      advisor: 'ALLOW',
      admin: 'ALLOW',
      super_admin: 'ALLOW'
    },
    serverEnforcementRule: 'منحصراً به مشاوران و مدیران دارای مجوز طراحی آزمون محدود است.'
  },
  {
    resource: 'EXAMS_AND_RESULTS',
    endpoint: '/api/v1/exams/results',
    method: 'GET',
    idParameterName: 'studentId / examId (Query)',
    description: 'مشاهده نتایج، درصدها و کارنامه آزمون‌ها',
    rolePermissions: {
      anonymous: 'DENY',
      student: 'SELF_ONLY',
      parent: 'CHILD_ONLY',
      advisor: 'ASSIGNED_ONLY',
      admin: 'ALLOW',
      super_admin: 'ALLOW'
    },
    serverEnforcementRule: 'کاربران مهمان هیچ کارنامه‌ای دریافت نمی‌کنند؛ دانش‌آموز و ولی فقط نتایج مجاز خود را می‌بینند.'
  },
  {
    resource: 'EXAMS_AND_RESULTS',
    endpoint: '/api/v1/exams/results',
    method: 'POST',
    idParameterName: 'studentId / examId (Body)',
    description: 'ثبت نتیجه و پاسخ‌برگ آزمون داوطلب',
    rolePermissions: {
      anonymous: 'DENY',
      student: 'SELF_ONLY',
      parent: 'DENY',
      advisor: 'ASSIGNED_ONLY',
      admin: 'ALLOW',
      super_admin: 'ALLOW'
    },
    serverEnforcementRule: 'شناسه دانش‌آموز در پاسخ‌برگ با شناسه توکن بازنویسی می‌شود تا امکان تقلب یا تخریب نتیجه دیگران مسدود گردد.'
  },

  // --- CONFIDENTIAL PSYCHOLOGICAL HEALTH RECORDS ---
  {
    resource: 'CONFIDENTIAL_HEALTH_RECORDS',
    endpoint: '/api/v1/privacy/confidential-records',
    method: 'GET',
    idParameterName: 'recordId / studentId',
    description: 'مشاهده یادداشت‌های بازتوانی و پرونده‌های محرمانه سلامت روان',
    rolePermissions: {
      anonymous: 'DENY',
      student: 'DENY',
      parent: 'DENY',
      advisor: 'ASSIGNED_ONLY',
      admin: 'ALLOW',
      super_admin: 'ALLOW'
    },
    serverEnforcementRule: 'دسترسی اولیا، دانش‌آموز و مشاوران غیرمرتبط قطعاً با خطای ۴۰۳ مسدود می‌گردد (رازداری حرفه‌ای).'
  },
  {
    resource: 'CONFIDENTIAL_HEALTH_RECORDS',
    endpoint: '/api/v1/privacy/confidential-records',
    method: 'POST',
    idParameterName: 'studentId / recordId',
    description: 'ثبت یادداشت روان‌شناختی محرمانه برای داوطلب',
    rolePermissions: {
      anonymous: 'DENY',
      student: 'DENY',
      parent: 'DENY',
      advisor: 'ASSIGNED_ONLY',
      admin: 'ALLOW',
      super_admin: 'ALLOW'
    },
    serverEnforcementRule: 'فقط مشاور مسئول پرونده و ادمین مجاز به ثبت یادداشت هستند.'
  },

  // --- ADVISOR COPILOT & AT-RISK RADAR ---
  {
    resource: 'ADVISOR_COPILOT_AND_AT_RISK',
    endpoint: '/api/v1/advisor/copilot/draft-feedback',
    method: 'POST',
    idParameterName: 'studentId (Body)',
    description: 'تولید پیش‌نویس متن مشاوره اختصاصی با هوش مصنوعی',
    rolePermissions: {
      anonymous: 'DENY',
      student: 'DENY',
      parent: 'DENY',
      advisor: 'ASSIGNED_ONLY',
      admin: 'ALLOW',
      super_admin: 'ALLOW'
    },
    serverEnforcementRule: 'مشاور تنها می‌تواند برای داوطلبان تحت سرپرستی خود فیدبک تولید کند.'
  },
  {
    resource: 'ADVISOR_COPILOT_AND_AT_RISK',
    endpoint: '/api/v1/advisor/students-at-risk',
    method: 'GET',
    idParameterName: 'advisorId (Filter)',
    description: 'رادار پایش داوطلبان دارای افت تراز یا بحران افت روحیه',
    rolePermissions: {
      anonymous: 'DENY',
      student: 'DENY',
      parent: 'DENY',
      advisor: 'ASSIGNED_ONLY',
      admin: 'ALLOW',
      super_admin: 'ALLOW'
    },
    serverEnforcementRule: 'مشاوران تنها لیست داوطلبان در معرض افت خود را مشاهده می‌کنند.'
  },

  // --- CHAT ROOMS & DIRECT SUPPORT SESSIONS ---
  {
    resource: 'CHAT_ROOMS_AND_MESSAGES',
    endpoint: '/api/v1/chat/rooms',
    method: 'GET',
    idParameterName: 'roomId',
    description: 'دریافت فهرست تالارهای عمومی و کانال‌های خصوصی مجاز',
    rolePermissions: {
      anonymous: 'RESTRICTED',
      student: 'RESTRICTED',
      parent: 'RESTRICTED',
      advisor: 'ALLOW',
      admin: 'ALLOW',
      super_admin: 'ALLOW'
    },
    serverEnforcementRule: 'تالارهای پشتیبانی خصوصی سایر داوطلبان از خروجی فیلتر و حذف می‌شوند.'
  },
  {
    resource: 'CHAT_ROOMS_AND_MESSAGES',
    endpoint: '/api/v1/chat/messages',
    method: 'GET',
    idParameterName: 'roomId (Query)',
    description: 'خواندن پیام‌های یک تالار یا گفت‌وگوی خصوصی',
    rolePermissions: {
      anonymous: 'RESTRICTED',
      student: 'RESTRICTED',
      parent: 'RESTRICTED',
      advisor: 'ASSIGNED_ONLY',
      admin: 'ALLOW',
      super_admin: 'ALLOW'
    },
    serverEnforcementRule: 'در صورت درخواست گفت‌وگوی خصوصی dm-support-*, دسترسی غیرمجاز با ۴۰۳ بلاک می‌شود.'
  },
  {
    resource: 'CHAT_ROOMS_AND_MESSAGES',
    endpoint: '/api/v1/chat/messages',
    method: 'POST',
    idParameterName: 'roomId / senderId (Body)',
    description: 'ارسال پیام متنی یا پیوست در تالار',
    rolePermissions: {
      anonymous: 'RESTRICTED',
      student: 'RESTRICTED',
      parent: 'RESTRICTED',
      advisor: 'ALLOW',
      admin: 'ALLOW',
      super_admin: 'ALLOW'
    },
    serverEnforcementRule: 'هویت فرستنده فقط از سشن خوانده شده و ارسال پیام در کانال‌های فقط‌خواندنی مسدود می‌شود.'
  },
  {
    resource: 'CHAT_ROOMS_AND_MESSAGES',
    endpoint: '/api/v1/chat/messages/:id',
    method: 'DELETE',
    idParameterName: 'messageId (Param)',
    description: 'حذف پیام از تالار یا گفت‌وگو',
    rolePermissions: {
      anonymous: 'DENY',
      student: 'SELF_ONLY',
      parent: 'SELF_ONLY',
      advisor: 'ALLOW',
      admin: 'ALLOW',
      super_admin: 'ALLOW'
    },
    serverEnforcementRule: 'بررسی مالکیت سروری؛ کاربر عادی تنها مجاز به حذف پیام ارسالی خود است.'
  },
  {
    resource: 'CHAT_ROOMS_AND_MESSAGES',
    endpoint: '/api/v1/chat/messages/pin',
    method: 'POST',
    idParameterName: 'messageId / roomId (Body)',
    description: 'سنجاق کردن پیام مهم در تالار',
    rolePermissions: {
      anonymous: 'DENY',
      student: 'DENY',
      parent: 'DENY',
      advisor: 'ALLOW',
      admin: 'ALLOW',
      super_admin: 'ALLOW'
    },
    serverEnforcementRule: 'فقط مشاوران و مدیران دارای مجوز پین پیام هستند.'
  },

  // --- CRM LEADS PIPELINE ---
  {
    resource: 'CRM_LEADS',
    endpoint: '/api/v1/crm/leads',
    method: 'GET',
    idParameterName: 'leadId / assignedAdvisorId',
    description: 'فهرست سرنخ‌های جذب و ثبت‌نام دانش‌آموزان جدید',
    rolePermissions: {
      anonymous: 'DENY',
      student: 'DENY',
      parent: 'DENY',
      advisor: 'ASSIGNED_ONLY',
      admin: 'ALLOW',
      super_admin: 'ALLOW'
    },
    serverEnforcementRule: 'مشاوران صرفاً سرنخ‌های ارجاع‌شده به خود را می‌بینند؛ مدیران دسترسی سراسری دارند.'
  },
  {
    resource: 'CRM_LEADS',
    endpoint: '/api/v1/crm/leads/:id',
    method: 'PATCH',
    idParameterName: 'leadId (Param)',
    description: 'تغییر وضعیت یا درج پیگیری برای سرنخ CRM',
    rolePermissions: {
      anonymous: 'DENY',
      student: 'DENY',
      parent: 'DENY',
      advisor: 'ASSIGNED_ONLY',
      admin: 'ALLOW',
      super_admin: 'ALLOW'
    },
    serverEnforcementRule: 'ویرایش وضعیت سرنخ مشروط به تخصیص به مشاور است.'
  },

  // --- DATABASE BACKUPS & EXPORT ---
  {
    resource: 'DATABASE_BACKUPS_AND_EXPORT',
    endpoint: '/api/v1/db/backups/download/:backupId',
    method: 'GET',
    idParameterName: 'backupId (Param)',
    description: 'دانلود فایل پشتیبان متنی/فشرده پایگاه داده',
    rolePermissions: {
      anonymous: 'DENY',
      student: 'DENY',
      parent: 'DENY',
      advisor: 'DENY',
      admin: 'ALLOW',
      super_admin: 'ALLOW'
    },
    serverEnforcementRule: 'تایید کامل امضای ادمین و مسدودسازی Path Traversal و شناسه جعلی بکاپ.'
  },
  {
    resource: 'DATABASE_BACKUPS_AND_EXPORT',
    endpoint: '/api/v1/db/backups/restore/:backupId',
    method: 'POST',
    idParameterName: 'backupId (Param)',
    description: 'بازگردانی دیتابیس از فایل پشتیبان',
    rolePermissions: {
      anonymous: 'DENY',
      student: 'DENY',
      parent: 'DENY',
      advisor: 'DENY',
      admin: 'ALLOW',
      super_admin: 'ALLOW'
    },
    serverEnforcementRule: 'انحصار قطعی به مدیر ارشد سیستم با لاگ حساس در Audit Logs.'
  },

  // --- SMS GATEWAY & BROADCAST ---
  {
    resource: 'SMS_GATEWAY_AND_BROADCAST',
    endpoint: '/api/v1/sms/broadcast/send',
    method: 'POST',
    idParameterName: 'campaignId / recipientIds',
    description: 'ارسال پیامک انبوه اطلاع‌رسانی به دانش‌آموزان یا اولیا',
    rolePermissions: {
      anonymous: 'DENY',
      student: 'DENY',
      parent: 'DENY',
      advisor: 'DENY',
      admin: 'ALLOW',
      super_admin: 'ALLOW'
    },
    serverEnforcementRule: 'کنترل سخت‌گیرانه پنل پیامکی و خطوط خدماتی صرفاً برای مدیر ارشد.'
  }
];

/**
 * ============================================================================
 * 2. SERVER-SIDE BOLA/IDOR VALIDATION HELPERS (FAIL-CLOSED)
 * ============================================================================
 */

/**
 * Normalize an identifier for consistent matching (strip 'usr-', 'std-', etc.)
 */
export function normalizeId(id: string | null | undefined): string {
  if (!id) return '';
  return String(id).trim().replace(/^(usr-|std-|adv-|parent-)/i, '').toLowerCase();
}

/**
 * Core Policy: Validate whether the authenticated context can access a student's resource
 */
export function validateStudentDataAccess(
  user: AuthenticatedUserContext | null | undefined,
  targetStudentId: string,
  studentContext?: { advisorId?: string; parentPhone?: string; id?: string }
): AuthorizationMatrixDecision {
  // 1. Unauthenticated (Anonymous) -> 401
  if (!user) {
    return {
      allowed: false,
      statusCode: 401,
      reason: 'احراز هویت الزامی است. دسترسی مهمان به اطلاعات پرونده تحصیلی مسدود است.',
      appliedScope: 'DENIED'
    };
  }

  const normTarget = normalizeId(targetStudentId);
  const userRole = (user.role || '').toLowerCase();

  // 2. Super Admin & Admin -> Full Global Scope
  if (userRole === 'admin' || userRole === 'super_admin') {
    return {
      allowed: true,
      statusCode: 200,
      appliedScope: 'GLOBAL',
      sanitizedTargetId: targetStudentId
    };
  }

  // 3. Student -> Strict Self Ownership
  if (userRole === 'student') {
    const myStudentId = normalizeId(user.studentId || user.id || user.userId);
    if (myStudentId && myStudentId === normTarget) {
      return {
        allowed: true,
        statusCode: 200,
        appliedScope: 'SELF',
        sanitizedTargetId: user.studentId || user.id
      };
    }
    return {
      allowed: false,
      statusCode: 403,
      reason: 'عدم دسترسی (IDOR): شما منحصراً مجاز به دسترسی به پرونده و سوابق تحصیلی خود هستید.',
      appliedScope: 'DENIED'
    };
  }

  // 4. Parent -> Strict Child Isolation
  if (userRole === 'parent') {
    const childId = normalizeId(user.childStudentId);
    if (childId && childId === normTarget) {
      return {
        allowed: true,
        statusCode: 200,
        appliedScope: 'CHILD',
        sanitizedTargetId: user.childStudentId
      };
    }
    return {
      allowed: false,
      statusCode: 403,
      reason: 'عدم دسترسی (Parent IDOR): اولیا منحصراً مجاز به مشاهده اطلاعات فرزند ثبت‌شده خود هستند.',
      appliedScope: 'DENIED'
    };
  }

  // 5. Advisor -> Strict Advisor Assignment Isolation
  if (userRole === 'advisor') {
    const myAdvisorId = normalizeId(user.advisorId || user.id || user.userId);
    const assignedAdvisor = normalizeId(studentContext?.advisorId);

    // If student record specifies advisor, check assignment
    if (assignedAdvisor) {
      if (assignedAdvisor === myAdvisorId) {
        return {
          allowed: true,
          statusCode: 200,
          appliedScope: 'ASSIGNED',
          sanitizedTargetId: targetStudentId
        };
      }
      return {
        allowed: false,
        statusCode: 403,
        reason: 'عدم دسترسی (Advisor BOLA): این دانش‌آموز به مشاور دیگری تخصیص داده شده است.',
        appliedScope: 'DENIED'
      };
    }

    // If student context is provided but has no advisor, or unassigned -> Deny to enforce zero-trust assignment
    if (studentContext) {
      return {
        allowed: false,
        statusCode: 403,
        reason: 'عدم دسترسی (Advisor BOLA): داوطلب به شما تخصیص داده نشده است.',
        appliedScope: 'DENIED'
      };
    }

    return {
      allowed: true,
      statusCode: 200,
      appliedScope: 'ASSIGNED',
      sanitizedTargetId: targetStudentId
    };
  }

  // 6. Any other role -> Fail Closed
  return {
    allowed: false,
    statusCode: 403,
    reason: 'نقش کاربری فاقد مجوزهای لازم برای دسترسی به این رکورد است.',
    appliedScope: 'DENIED'
  };
}

/**
 * Validate ownership of a confidential counseling record
 */
export function validateConfidentialRecordAccess(
  user: AuthenticatedUserContext | null | undefined,
  record: { advisorId?: string; isConfidential?: boolean; studentId?: string }
): AuthorizationMatrixDecision {
  if (!user) {
    return { allowed: false, statusCode: 401, reason: 'احراز هویت الزامی است.', appliedScope: 'DENIED' };
  }

  const role = (user.role || '').toLowerCase();

  // Admin and Super Admin
  if (role === 'admin' || role === 'super_admin') {
    return { allowed: true, statusCode: 200, appliedScope: 'GLOBAL' };
  }

  // Advisor -> Must be assigned advisor
  if (role === 'advisor') {
    const myAdvId = normalizeId(user.advisorId || user.id);
    const recordAdvId = normalizeId(record.advisorId);
    if (!recordAdvId || recordAdvId === myAdvId) {
      return { allowed: true, statusCode: 200, appliedScope: 'ASSIGNED' };
    }
    return {
      allowed: false,
      statusCode: 403,
      reason: 'عدم دسترسی: پرونده‌های سلامت روان منحصراً توسط مشاور مستقیم مسئول پرونده قابل مشاهده است.',
      appliedScope: 'DENIED'
    };
  }

  // Students and Parents are strictly forbidden from viewing confidential counselor notes
  return {
    allowed: false,
    statusCode: 403,
    reason: 'عدم دسترسی: پرونده‌های سلامت روان و یادداشت‌های روان‌شناختی دارای طبقه‌بندی محرمانه هستند.',
    appliedScope: 'DENIED'
  };
}

/**
 * Validate chat message ownership for deletion/modification
 */
export function validateChatMessageOwnership(
  user: AuthenticatedUserContext | null | undefined,
  message: { senderId?: string; roomId?: string }
): AuthorizationMatrixDecision {
  if (!user) {
    return { allowed: false, statusCode: 401, reason: 'احراز هویت الزامی است.', appliedScope: 'DENIED' };
  }

  const role = (user.role || '').toLowerCase();
  if (role === 'admin' || role === 'super_admin' || role === 'advisor') {
    return { allowed: true, statusCode: 200, appliedScope: 'GLOBAL' };
  }

  const myId = normalizeId(user.studentId || user.id || user.userId);
  const msgSenderId = normalizeId(message.senderId);

  if (myId && msgSenderId && myId === msgSenderId) {
    return { allowed: true, statusCode: 200, appliedScope: 'SELF' };
  }

  return {
    allowed: false,
    statusCode: 403,
    reason: 'عدم دسترسی: شما تنها مجاز به مدیریت و حذف پیام‌های ارسالی خود هستید.',
    appliedScope: 'DENIED'
  };
}

/**
 * Validate CRM Lead Access
 */
export function validateCrmLeadAccess(
  user: AuthenticatedUserContext | null | undefined,
  lead: { assignedAdvisorId?: string; id?: string }
): AuthorizationMatrixDecision {
  if (!user) {
    return { allowed: false, statusCode: 401, reason: 'احراز هویت الزامی است.', appliedScope: 'DENIED' };
  }

  const role = (user.role || '').toLowerCase();
  if (role === 'admin' || role === 'super_admin') {
    return { allowed: true, statusCode: 200, appliedScope: 'GLOBAL' };
  }

  if (role === 'advisor') {
    const myAdvId = normalizeId(user.advisorId || user.id);
    const assignedAdv = normalizeId(lead.assignedAdvisorId);
    if (!assignedAdv || assignedAdv === myAdvId) {
      return { allowed: true, statusCode: 200, appliedScope: 'ASSIGNED' };
    }
    return {
      allowed: false,
      statusCode: 403,
      reason: 'عدم دسترسی: این سرنخ به مشاور دیگری اختصاص یافته است.',
      appliedScope: 'DENIED'
    };
  }

  return {
    allowed: false,
    statusCode: 403,
    reason: 'عدم دسترسی: سیستم مدیریت سرنخ‌ها و CRM تنها در دسترس کادر آموزشی است.',
    appliedScope: 'DENIED'
  };
}

/**
 * Validate Database Backup Access
 */
export function validateDatabaseBackupAccess(
  user: AuthenticatedUserContext | null | undefined,
  backupId: string
): AuthorizationMatrixDecision {
  if (!user) {
    return { allowed: false, statusCode: 401, reason: 'احراز هویت الزامی است.', appliedScope: 'DENIED' };
  }

  const role = (user.role || '').toLowerCase();
  if (role === 'admin' || role === 'super_admin') {
    // Validate backupId format to prevent path traversal
    if (!/^[\w.-]+$/.test(backupId) || backupId.includes('..') || backupId.includes('/') || backupId.includes('\\')) {
      return {
        allowed: false,
        statusCode: 403,
        reason: 'شناسه فایل پشتیبان نامعتبر است (Path Traversal Detected).',
        appliedScope: 'DENIED'
      };
    }
    return { allowed: true, statusCode: 200, appliedScope: 'GLOBAL' };
  }

  return {
    allowed: false,
    statusCode: 403,
    reason: 'دسترسی به نسخه‌های پشتیبان دیتابیس انحصاراً در اختیار مدیر ارشد است.',
    appliedScope: 'DENIED'
  };
}
