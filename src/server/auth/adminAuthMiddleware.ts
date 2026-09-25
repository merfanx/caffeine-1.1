import { Request, Response, NextFunction } from 'express';
import path from 'path';
import { recordSensitiveAudit } from '../storage/auditLogManager';
import { verifyAuthToken, AuthTokenPayload } from './tokenService';
import { ACCESS_TOKEN_COOKIE } from './cookieAuthService';
import { extractSecureClientIp } from '../security/ipSecurity';

/**
 * ============================================================================
 * CAFFEINE CENTRAL AUTHENTICATION & AUTHORIZATION GATEWAY (ZERO CLIENT TRUST)
 * ============================================================================
 * Implements strict, server-side cryptographic JWT verification, robust RBAC,
 * and BOLA/IDOR perimeter validation.
 *
 * [SECURITY_LAYER: CENTRAL_AUTH_GATEWAY]
 * [DEFENSE: ZERO_CLIENT_TRUST_IDENTITY]
 * [RBAC: SERVER_ENFORCED_PERMISSIONS]
 * ============================================================================
 */

export interface AuthenticatedUserContext {
  id: string;
  userId?: string;
  name: string;
  role: string;
  username?: string;
  phone?: string;
  studentId?: string;
  advisorId?: string;
  childStudentId?: string;
  jti?: string;
}

declare global {
  namespace Express {
    interface Request {
      authUser?: AuthenticatedUserContext;
      user?: AuthenticatedUserContext;
    }
  }
}

export const ALLOWED_COLLECTIONS = new Set([
  'leads',
  'daily_reports',
  'student_profiles',
  'monthly_reports',
  'exams',
  'exam_results',
  'questions',
  'articles',
  'student_comments',
  'question_reports',
  'system_settings',
  'sms_campaigns',
  'avatar_catalog',
  'internal_chat_rooms',
  'internal_chat_messages',
  'confidential_health_records',
  'user_credentials',
  'security_audit_logs',
  'audit_logs',
  'toolbox_years',
  'toolbox_admissions',
  'toolbox_benchmarks'
]);

const DANGEROUS_OBJECT_KEYS = new Set(['__proto__', 'constructor', 'prototype']);

/**
 * Helper to extract client IP safely preventing header spoofing
 */
export function getRequestIp(req: Request): string {
  return extractSecureClientIp(req);
}

/**
 * Extracts and cryptographically verifies user authentication credentials from request.
 * NEVER trusts client-submitted 'x-user-role', 'x-user-id', body roles, or query roles!
 * Identity is SOLELY derived from a valid, cryptographically signed token.
 */
export function extractUserCredentials(req: Request): AuthenticatedUserContext | null {
  if (req.authUser) {
    return req.authUser;
  }
  if (req.user) {
    return req.user;
  }

  let token = '';

  // 1. Check HttpOnly Access Token Cookie (Primary Browser Auth Path)
  if (req.cookies && req.cookies[ACCESS_TOKEN_COOKIE]) {
    const cookieToken = req.cookies[ACCESS_TOKEN_COOKIE];
    if (typeof cookieToken === 'string' && cookieToken.split('.').length === 3) {
      token = cookieToken.trim();
    }
  }

  // 2. Check Authorization header: Bearer <jwt_token>
  if (!token) {
    const authHeader = req.headers['authorization'];
    if (typeof authHeader === 'string') {
      if (authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7).trim();
      } else if (authHeader.length > 20 && !authHeader.includes(' ')) {
        token = authHeader.trim();
      }
    }
  }

  // 3. Check custom API/client headers (X-Auth-Token, X-Access-Token, X-Caffeine-Token)
  if (!token) {
    const customHeader =
      req.headers['x-auth-token'] ||
      req.headers['x-access-token'] ||
      req.headers['x-caffeine-token'] ||
      req.headers['x-caffeine-auth'];
    if (typeof customHeader === 'string' && customHeader.trim().length > 10) {
      token = customHeader.trim();
    }
  }

  // 4. Query param token (only for browser file downloads like export/backup if valid JWT)
  if (!token && req.query) {
    const queryToken = (req.query.token || req.query.auth_token || req.query.access_token) as string | undefined;
    if (queryToken && typeof queryToken === 'string' && queryToken.split('.').length === 3) {
      token = queryToken.trim();
    }
  }

  // 5. Check request body if applicable
  if (!token && req.body && typeof req.body === 'object') {
    const bodyToken = req.body.token || req.body.authToken || req.body.accessToken;
    if (typeof bodyToken === 'string' && bodyToken.split('.').length === 3) {
      token = bodyToken.trim();
    }
  }

  if (!token) {
    return null;
  }

  // 6. Cryptographically verify token signature, expiration, and revocation
  const verification = verifyAuthToken(token);
  if (!verification.valid || !verification.payload) {
    return null;
  }

  const payload: AuthTokenPayload = verification.payload;

  const authUser: AuthenticatedUserContext = {
    id: payload.userId,
    userId: payload.userId,
    name: payload.name || payload.username || 'کاربر سیستم',
    role: payload.role.toLowerCase(),
    username: payload.username,
    phone: payload.phone,
    studentId: payload.studentId || (payload.role === 'student' ? payload.userId : undefined),
    advisorId: payload.advisorId || (payload.role === 'advisor' ? payload.userId : undefined),
    childStudentId: payload.childStudentId,
    jti: payload.jti
  };

  return authUser;
}

/**
 * Central Authentication Middleware (401 Unauthorized if missing/invalid token)
 */
export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const user = extractUserCredentials(req);
  if (!user) {
    const ip = getRequestIp(req);
    recordSensitiveAudit({
      category: 'SECURITY_ACCESS',
      action: 'UNAUTHORIZED_ACCESS_ATTEMPT',
      userId: 'anonymous',
      userName: 'کاربر ناشناس',
      userRole: 'guest',
      resource: req.originalUrl || req.url,
      details: `تلاش برای دسترسی به مسیر محافظت‌شده بدون توکن معتبر (${req.method} ${req.path}).`,
      status: 'denied',
      severity: 'warning',
      ip,
      userAgent: req.headers['user-agent'] as string
    });

    res.status(401).json({
      success: false,
      error: 'UNAUTHORIZED_401',
      message: 'احراز هویت الزامی است. لطفاً ابتدا وارد حساب کاربری خود شوید.'
    });
    return;
  }

  req.authUser = user;
  req.user = user;
  next();
}

/**
 * Optional Authentication Middleware (Attaches req.authUser if valid token exists, proceeds regardless)
 */
export function optionalAuth(req: Request, res: Response, next: NextFunction): void {
  const user = extractUserCredentials(req);
  if (user) {
    req.authUser = user;
    req.user = user;
  }
  next();
}

/**
 * Strict Admin Authentication & Authorization Middleware
 * Chain: Authentication (401) -> Authorization & Admin Permission (403)
 */
export function requireAdminAuth(req: Request, res: Response, next: NextFunction): void {
  const ip = getRequestIp(req);
  const user = extractUserCredentials(req);

  // 1. Authentication Check (401 Unauthorized)
  if (!user) {
    recordSensitiveAudit({
      category: 'SECURITY_ACCESS',
      action: 'UNAUTHORIZED_ADMIN_ACCESS_ATTEMPT',
      userId: 'anonymous',
      userName: 'کاربر ناشناس',
      userRole: 'guest',
      resource: req.originalUrl || req.url,
      details: `تلاش برای دسترسی بدون احراز هویت به بخش مدیریت (${req.method} ${req.path}).`,
      status: 'denied',
      severity: 'warning',
      ip,
      userAgent: req.headers['user-agent'] as string
    });

    res.status(401).json({
      success: false,
      error: 'UNAUTHORIZED_401',
      message: 'احراز هویت الزامی است: برای دسترسی به بخش‌های مدیریتی، توکن معتبر مدیر ارشد الزامی است.'
    });
    return;
  }

  // 2. Authorization & Admin Role Check (403 Forbidden)
  if (user.role !== 'admin' && user.role !== 'super_admin') {
    recordSensitiveAudit({
      category: 'SECURITY_ACCESS',
      action: 'FORBIDDEN_ADMIN_ACCESS_BLOCKED',
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      resource: req.originalUrl || req.url,
      details: `دسترسی مدیریتی مسدود شد: کاربر با نقش غیرمجاز «${user.role}» قصد انجام عملیات حساس مدیریتی را داشت.`,
      status: 'denied',
      severity: 'critical',
      ip,
      userAgent: req.headers['user-agent'] as string,
      metadata: {
        attemptedMethod: req.method,
        attemptedPath: req.path,
        userRole: user.role
      }
    });

    res.status(403).json({
      success: false,
      error: 'FORBIDDEN_403',
      message: 'سطح دسترسی ناکافی: فقط مدیران ارشد سیستم به این عملیات دسترسی دارند.'
    });
    return;
  }

  // Success - attach authenticated admin context
  req.authUser = user;
  req.user = user;
  next();
}

/**
 * Role-Based Access Control (RBAC) Guard Middleware
 */
export function requireRole(...allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const user = req.authUser || extractUserCredentials(req);
    if (!user) {
      res.status(401).json({
        success: false,
        error: 'UNAUTHORIZED_401',
        message: 'احراز هویت الزامی است. لطفاً ابتدا وارد حساب کاربری خود شوید.'
      });
      return;
    }

    req.authUser = user;
    req.user = user;

    // Admin & Super Admin have universal bypass
    if (user.role === 'admin' || user.role === 'super_admin') {
      next();
      return;
    }

    if (!allowedRoles.includes(user.role)) {
      const ip = getRequestIp(req);
      recordSensitiveAudit({
        category: 'SECURITY_ACCESS',
        action: 'FORBIDDEN_ROLE_ACCESS_BLOCKED',
        userId: user.id,
        userName: user.name,
        userRole: user.role,
        resource: req.originalUrl || req.url,
        details: `نقش «${user.role}» فاقد مجوز دسترسی به این بخش است. نقش‌های مجاز: ${allowedRoles.join(', ')}`,
        status: 'denied',
        severity: 'warning',
        ip
      });

      res.status(403).json({
        success: false,
        error: 'FORBIDDEN_403',
        message: `عدم دسترسی: نقش کاربری شما (${user.role}) مجاز به انجام این عملیات نیست.`
      });
      return;
    }

    next();
  };
}

/**
 * Validates and sanitizes backup ID parameter to prevent Path Traversal attacks
 */
export function validateSafeBackupId(backupId: string, backupDir: string): { isValid: boolean; safePath: string; error?: string } {
  if (!backupId || typeof backupId !== 'string') {
    return { isValid: false, safePath: '', error: 'شناسه نسخه پشتیبان الزامی است.' };
  }

  // 1. Strict regex whitelist for backupId: only alphanumeric characters, underscores, and dashes
  const cleanId = backupId.trim().replace(/\.json$/i, '');
  if (!/^[a-zA-Z0-9_-]{3,120}$/.test(cleanId)) {
    return {
      isValid: false,
      safePath: '',
      error: 'شناسه نسخه پشتیبان حاوی کاراکترهای غیرمجاز یا ساختار نامعتبر است (تنها حروف، ارقام، خط تیره و زیرخط مجاز است).'
    };
  }

  // 2. Explicitly reject path traversal sequences
  if (backupId.includes('..') || backupId.includes('/') || backupId.includes('\\') || backupId.includes('%') || backupId.includes('\0')) {
    return {
      isValid: false,
      safePath: '',
      error: 'مسیر نامعتبر است و ممکن است حاوی کاراکترهای عبور از مسیر (Path Traversal) باشد.'
    };
  }

  // 3. Absolute path resolution and boundary containment check
  const resolvedBackupDir = path.resolve(backupDir);
  const targetFile = path.resolve(resolvedBackupDir, `${cleanId}.json`);

  // Ensure targetFile starts with resolvedBackupDir + separator
  if (!targetFile.startsWith(resolvedBackupDir + path.sep)) {
    return {
      isValid: false,
      safePath: '',
      error: 'تخطی از محدوده پوشه نسخه‌های پشتیبان تشخیص داده شد.'
    };
  }

  return { isValid: true, safePath: targetFile };
}

/**
 * Validates database import & restore payloads
 * Protects against Prototype Pollution, Collection Injection, and Malformed Objects
 */
export function validateCollectionsPayload(payload: any): { isValid: boolean; collections: Record<string, any[]>; error?: string } {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return { isValid: false, collections: {}, error: 'فرمت محتوای پشتیبان نامعتبر است (باید ساختار شیء JSON معتبر باشد).' };
  }

  // Extract collections map (supports both structured snapshot and raw collections format)
  const rawCollections = payload.collections || payload;
  if (!rawCollections || typeof rawCollections !== 'object' || Array.isArray(rawCollections)) {
    return { isValid: false, collections: {}, error: 'جداول و کالکشن‌های معتبر در داده‌های پشتیبان یافت نشد.' };
  }

  const sanitizedCollections: Record<string, any[]> = {};

  for (const [colName, colData] of Object.entries(rawCollections)) {
    // 1. Prototype pollution protection
    if (DANGEROUS_OBJECT_KEYS.has(colName)) {
      return { isValid: false, collections: {}, error: `شناسه مخرب (${colName}) در کلیدهای کالکشن تشخیص داده شد.` };
    }

    // 2. Collection name whitelist validation
    const cleanColName = colName.trim().toLowerCase();
    if (!ALLOWED_COLLECTIONS.has(cleanColName)) {
      return { isValid: false, collections: {}, error: `نام کالکشن «${colName}» در فهرست مجاز سامانه کافئین قرار ندارد.` };
    }

    // 3. Array data validation
    if (!Array.isArray(colData)) {
      return { isValid: false, collections: {}, error: `داده‌های کالکشن «${colName}» باید از نوع آرایه باشند.` };
    }

    sanitizedCollections[cleanColName] = colData;
  }

  if (Object.keys(sanitizedCollections).length === 0) {
    return { isValid: false, collections: {}, error: 'هیچ کالکشن معتبری برای درون‌ریزی یافت نشد.' };
  }

  return { isValid: true, collections: sanitizedCollections };
}
