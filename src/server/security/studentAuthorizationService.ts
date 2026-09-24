import { Request, Response, NextFunction } from 'express';
import { AuthenticatedUserContext } from '../auth/adminAuthMiddleware';
import { studentRepository } from '../repositories/studentRepository';
import { parentRepository } from '../repositories/parentRepository';
import { advisorRepository } from '../repositories/advisorRepository';
import { recordSensitiveAudit } from '../storage/auditLogManager';
import { extractSecureClientIp } from './ipSecurity';
import { dbBridge } from '../storage/dbBridge';

/**
 * ============================================================================
 * CAFFEINE CENTRAL STUDENT AUTHORIZATION & BOLA/IDOR DEFENSE SERVICE
 * ============================================================================
 * Standard AI Tags:
 * // [SECURITY_LAYER: CENTRAL_STUDENT_AUTHORIZATION]
 * // [DEFENSE: BOLA_IDOR_PREVENTION]
 * // [RBAC: STUDENT_ADVISOR_PARENT_ADMIN_MATRIX]
 * // [ZERO_CLIENT_TRUST: SERVER_ONLY_VERIFICATION]
 * ============================================================================
 */

export type StudentAccessScope = 'GLOBAL' | 'SELF' | 'ASSIGNED' | 'CHILD' | 'DENIED';

export interface StudentAuthorizationResult {
  authorized: boolean;
  statusCode: 200 | 400 | 401 | 403 | 404;
  error?: string;
  message?: string;
  scope: StudentAccessScope;
  student?: any;
  targetStudentId?: string;
}

export interface StudentAuthContext {
  id?: string;
  studentId?: string;
  advisorId?: string;
  childStudentId?: string;
  phone?: string;
  parentPhone?: string;
  [key: string]: any;
}

/**
 * Helper to normalize all user/student identifiers by stripping prefixes and whitespace
 */
export function normalizeStudentId(id?: string | null): string {
  if (!id) return '';
  return String(id)
    .trim()
    .replace(/^(usr-|std-|adv-|parent-|lead-)/i, '')
    .toLowerCase();
}

/**
 * Core async authorization function for student-scoped resources.
 * Executes on every request. Never trusts client input alone.
 *
 * Matrix:
 * 1. Unauthenticated (no user) -> 401 Unauthorized
 * 2. Admin / Super Admin -> Allowed (GLOBAL scope)
 * 3. Student -> Allowed ONLY if studentId matches authenticated user's studentId (SELF scope), else 403 Forbidden
 * 4. Advisor -> Allowed ONLY if student is assigned to this advisor (ASSIGNED scope), else 403 Forbidden
 * 5. Parent -> Allowed ONLY if student is verified child of parent (CHILD scope), else 403 Forbidden
 */
export async function authorizeStudentAccess(
  user: AuthenticatedUserContext | null | undefined,
  rawStudentId: string | null | undefined,
  requestContext?: { req?: Request; resourceName?: string }
): Promise<StudentAuthorizationResult> {
  // 1. Authentication Check
  if (!user || !user.role) {
    return {
      authorized: false,
      statusCode: 401,
      error: 'UNAUTHORIZED_401',
      message: 'احراز هویت الزامی است. لطفاً ابتدا وارد حساب کاربری خود شوید.',
      scope: 'DENIED'
    };
  }

  // 2. Target Student ID Normalization & Validation
  const targetId = (rawStudentId || '').trim();
  if (!targetId) {
    return {
      authorized: false,
      statusCode: 400,
      error: 'BAD_REQUEST_400',
      message: 'شناسه دانش‌آموز نامعتبر یا خالی است.',
      scope: 'DENIED'
    };
  }

  const normTarget = normalizeStudentId(targetId);
  const userRole = user.role.toLowerCase();

  // --------------------------------------------------------------------------
  // ROLE 1: ADMIN & SUPER_ADMIN (Global Unrestricted Management Access)
  // --------------------------------------------------------------------------
  if (userRole === 'admin' || userRole === 'super_admin') {
    let student = null;
    try {
      student = await studentRepository.findById(targetId);
    } catch {
      // Fallback to in-memory/file storage
      student = dbBridge.findById<any>('student_profiles', targetId);
    }

    if (!student) {
      student = dbBridge.findById<any>('student_profiles', targetId);
    }

    if (!student) {
      return {
        authorized: false,
        statusCode: 404,
        error: 'NOT_FOUND_404',
        message: 'پرونده داوطلب مورد نظر یافت نشد.',
        scope: 'DENIED',
        targetStudentId: targetId
      };
    }

    return {
      authorized: true,
      statusCode: 200,
      scope: 'GLOBAL',
      student,
      targetStudentId: targetId
    };
  }

  // --------------------------------------------------------------------------
  // ROLE 2: STUDENT (Strict Self-Isolation)
  // --------------------------------------------------------------------------
  if (userRole === 'student') {
    const myStudentId = normalizeStudentId(user.studentId || user.userId || user.id);

    // BOLA/IDOR Check: Compare requested student ID against verified authenticated user
    if (!myStudentId || myStudentId !== normTarget) {
      // Audit log the BOLA violation attempt
      if (requestContext?.req) {
        recordSensitiveAudit({
          category: 'SECURITY_ACCESS',
          action: 'BOLA_TAMPERING_ATTEMPT',
          userId: user.id,
          userName: user.name,
          userRole: user.role,
          resource: requestContext.resourceName || `/api/v1/student/profile/${targetId}`,
          details: `دانش‌آموز [${user.name} (${user.studentId || user.id})] سعی در دسترسی غیرمجاز به پرونده دانش‌آموز دیگر [${targetId}] داشت.`,
          status: 'denied',
          severity: 'critical',
          ip: extractSecureClientIp(requestContext.req),
          userAgent: requestContext.req.headers['user-agent'] as string
        });
      }

      return {
        authorized: false,
        statusCode: 403,
        error: 'FORBIDDEN_IDOR_403',
        message: 'عدم دسترسی: شما منحصراً مجاز به دسترسی به پرونده تحصیلی خود هستید.',
        scope: 'DENIED',
        targetStudentId: targetId
      };
    }

    // Fetch student's own record from DB or storage
    let student = null;
    try {
      student = await studentRepository.findById(targetId);
    } catch {
      student = dbBridge.findById<any>('student_profiles', targetId);
    }

    if (!student) {
      student = dbBridge.findById<any>('student_profiles', targetId);
    }

    if (!student) {
      return {
        authorized: false,
        statusCode: 404,
        error: 'NOT_FOUND_404',
        message: 'پرونده تحصیلی شما در سامانه یافت نشد.',
        scope: 'DENIED',
        targetStudentId: targetId
      };
    }

    return {
      authorized: true,
      statusCode: 200,
      scope: 'SELF',
      student,
      targetStudentId: targetId
    };
  }

  // --------------------------------------------------------------------------
  // ROLE 3: ADVISOR (Assigned Students Isolation)
  // --------------------------------------------------------------------------
  if (userRole === 'advisor') {
    const authAdvisorId = normalizeStudentId(user.advisorId || user.userId || user.id);

    // Fetch target student first
    let student = null;
    try {
      student = await studentRepository.findById(targetId);
    } catch {
      student = dbBridge.findById<any>('student_profiles', targetId);
    }

    if (!student) {
      student = dbBridge.findById<any>('student_profiles', targetId);
    }

    if (!student) {
      return {
        authorized: false,
        statusCode: 404,
        error: 'NOT_FOUND_404',
        message: 'پرونده داوطلب مورد نظر یافت نشد.',
        scope: 'DENIED',
        targetStudentId: targetId
      };
    }

    // Verify advisor assignment in DB / record
    const studentAssignedAdvisor = normalizeStudentId(
      student.advisorId || student.advisorDetails?.id || student.advisorDetails?.legacyId
    );

    let isAssigned = false;
    if (studentAssignedAdvisor && studentAssignedAdvisor === authAdvisorId) {
      isAssigned = true;
    }

    // Also check if advisor DB row matches user.id
    if (!isAssigned) {
      try {
        const advisorRow = await advisorRepository.findById(user.advisorId || user.id);
        if (advisorRow && (
          normalizeStudentId(advisorRow.id) === studentAssignedAdvisor ||
          normalizeStudentId(advisorRow.legacyId) === studentAssignedAdvisor
        )) {
          isAssigned = true;
        }
      } catch {
        // Continue
      }
    }

    if (!isAssigned) {
      // Audit log the Advisor BOLA violation
      if (requestContext?.req) {
        recordSensitiveAudit({
          category: 'SECURITY_ACCESS',
          action: 'ADVISOR_BOLA_VIOLATION',
          userId: user.id,
          userName: user.name,
          userRole: user.role,
          resource: requestContext.resourceName || `/api/v1/student/profile/${targetId}`,
          details: `مشاور [${user.name} (${user.id})] سعی در دسترسی به پرونده داوطلب غیرتخصیص‌یافته [${targetId}] داشت.`,
          status: 'denied',
          severity: 'warning',
          ip: extractSecureClientIp(requestContext.req),
          userAgent: requestContext.req.headers['user-agent'] as string
        });
      }

      return {
        authorized: false,
        statusCode: 403,
        error: 'FORBIDDEN_BOLA_403',
        message: 'عدم دسترسی: این داوطلب تحت نظارت و مشاوره شما قرار ندارد.',
        scope: 'DENIED',
        targetStudentId: targetId
      };
    }

    return {
      authorized: true,
      statusCode: 200,
      scope: 'ASSIGNED',
      student,
      targetStudentId: targetId
    };
  }

  // --------------------------------------------------------------------------
  // ROLE 4: PARENT (Child-Only Boundary Isolation)
  // --------------------------------------------------------------------------
  if (userRole === 'parent') {
    let student = null;
    try {
      student = await studentRepository.findById(targetId);
    } catch {
      student = dbBridge.findById<any>('student_profiles', targetId);
    }

    if (!student) {
      student = dbBridge.findById<any>('student_profiles', targetId);
    }

    if (!student) {
      return {
        authorized: false,
        statusCode: 404,
        error: 'NOT_FOUND_404',
        message: 'پرونده داوطلب مورد نظر یافت نشد.',
        scope: 'DENIED',
        targetStudentId: targetId
      };
    }

    // Check parent link
    let isParentAuthorized = false;

    // Direct token claim check
    if (user.childStudentId) {
      const normChild = normalizeStudentId(user.childStudentId);
      if (normChild === normTarget) {
        isParentAuthorized = true;
      }
    }

    // Direct phone matching
    if (!isParentAuthorized && user.phone && student.parentPhone) {
      if (user.phone.trim() === student.parentPhone.trim()) {
        isParentAuthorized = true;
      }
    }

    // Relational database verification
    if (!isParentAuthorized) {
      try {
        isParentAuthorized = await parentRepository.isParentLinkedToStudent(
          { id: user.id, phone: user.phone, childStudentId: user.childStudentId },
          targetId
        );
      } catch {
        // Continue
      }
    }

    if (!isParentAuthorized) {
      if (requestContext?.req) {
        recordSensitiveAudit({
          category: 'SECURITY_ACCESS',
          action: 'PARENT_BOLA_VIOLATION',
          userId: user.id,
          userName: user.name,
          userRole: user.role,
          resource: requestContext.resourceName || `/api/v1/student/profile/${targetId}`,
          details: `ولی [${user.name} (${user.id})] سعی در مشاهده اطلاعات دانش‌آموز غیرفرزند [${targetId}] داشت.`,
          status: 'denied',
          severity: 'warning',
          ip: extractSecureClientIp(requestContext.req),
          userAgent: requestContext.req.headers['user-agent'] as string
        });
      }

      return {
        authorized: false,
        statusCode: 403,
        error: 'FORBIDDEN_PARENT_403',
        message: 'عدم دسترسی: اولیا منحصراً مجاز به مشاهده اطلاعات تحصیلی فرزند ثبت‌شده خود هستند.',
        scope: 'DENIED',
        targetStudentId: targetId
      };
    }

    return {
      authorized: true,
      statusCode: 200,
      scope: 'CHILD',
      student,
      targetStudentId: targetId
    };
  }

  // Any other role or unauthorized tier
  return {
    authorized: false,
    statusCode: 403,
    error: 'FORBIDDEN_ROLE_403',
    message: 'عدم دسترسی: نقش کاربری شما مجوز دسترسی به اطلاعات پرونده دانش‌آموزان را ندارد.',
    scope: 'DENIED',
    targetStudentId: targetId
  };
}

/**
 * Synchronous version of student authorization for unit testing and fast memory evaluations
 */
export function authorizeStudentAccessSync(
  user: AuthenticatedUserContext | null | undefined,
  rawStudentId: string | null | undefined,
  studentContext?: StudentAuthContext | null
): StudentAuthorizationResult {
  if (!user || !user.role) {
    return {
      authorized: false,
      statusCode: 401,
      error: 'UNAUTHORIZED_401',
      message: 'احراز هویت الزامی است.',
      scope: 'DENIED'
    };
  }

  const targetId = (rawStudentId || '').trim();
  if (!targetId) {
    return {
      authorized: false,
      statusCode: 400,
      error: 'BAD_REQUEST_400',
      message: 'شناسه دانش‌آموز نامعتبر است.',
      scope: 'DENIED'
    };
  }

  const normTarget = normalizeStudentId(targetId);
  const userRole = user.role.toLowerCase();

  // Admin / Super Admin
  if (userRole === 'admin' || userRole === 'super_admin') {
    return {
      authorized: true,
      statusCode: 200,
      scope: 'GLOBAL',
      student: studentContext,
      targetStudentId: targetId
    };
  }

  // Student
  if (userRole === 'student') {
    const myStudentId = normalizeStudentId(user.studentId || user.userId || user.id);
    if (!myStudentId || myStudentId !== normTarget) {
      return {
        authorized: false,
        statusCode: 403,
        error: 'FORBIDDEN_IDOR_403',
        message: 'عدم دسترسی: شما منحصراً مجاز به مشاهده پرونده خود هستید.',
        scope: 'DENIED',
        targetStudentId: targetId
      };
    }
    return {
      authorized: true,
      statusCode: 200,
      scope: 'SELF',
      student: studentContext,
      targetStudentId: targetId
    };
  }

  // Advisor
  if (userRole === 'advisor') {
    const authAdvisorId = normalizeStudentId(user.advisorId || user.userId || user.id);
    const assignedAdvisorId = normalizeStudentId(studentContext?.advisorId);

    if (assignedAdvisorId && assignedAdvisorId === authAdvisorId) {
      return {
        authorized: true,
        statusCode: 200,
        scope: 'ASSIGNED',
        student: studentContext,
        targetStudentId: targetId
      };
    }

    return {
      authorized: false,
      statusCode: 403,
      error: 'FORBIDDEN_BOLA_403',
      message: 'عدم دسترسی: این داوطلب به مشاور دیگری تخصیص داده شده است.',
      scope: 'DENIED',
      targetStudentId: targetId
    };
  }

  // Parent
  if (userRole === 'parent') {
    const normChild = normalizeStudentId(user.childStudentId);
    if (normChild && normChild === normTarget) {
      return {
        authorized: true,
        statusCode: 200,
        scope: 'CHILD',
        student: studentContext,
        targetStudentId: targetId
      };
    }

    if (user.phone && studentContext?.parentPhone && user.phone.trim() === studentContext.parentPhone.trim()) {
      return {
        authorized: true,
        statusCode: 200,
        scope: 'CHILD',
        student: studentContext,
        targetStudentId: targetId
      };
    }

    return {
      authorized: false,
      statusCode: 403,
      error: 'FORBIDDEN_PARENT_403',
      message: 'عدم دسترسی: این داوطلب فرزند شما نمی‌باشد.',
      scope: 'DENIED',
      targetStudentId: targetId
    };
  }

  return {
    authorized: false,
    statusCode: 403,
    error: 'FORBIDDEN_ROLE_403',
    message: 'عدم دسترسی.',
    scope: 'DENIED',
    targetStudentId: targetId
  };
}
