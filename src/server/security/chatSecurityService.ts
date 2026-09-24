import { Request } from 'express';
import crypto from 'crypto';
import { AuthenticatedUserContext } from '../auth/adminAuthMiddleware';
import { sanitizeString } from './apiHardening';
import { sanitizeSafeUrl } from '../../utils/securitySanitizer';
import { recordSensitiveAudit } from '../storage/auditLogManager';
import { extractSecureClientIp } from './ipSecurity';

/**
 * ============================================================================
 * CAFFEINE 2.1 CHAT SECURITY, AUTHORIZATION & ANTI-SPOOFING ENGINE
 * ============================================================================
 * Standard AI Code Tags:
 * // [DB_COLLECTION: internal_chat_messages, internal_chat_rooms]
 * // [SECURITY_LAYER: CHAT_AUTH_IDENTITY_GATEWAY]
 * // [DEFENSE: ZERO_CLIENT_TRUST_SENDER_IDENTITY]
 * // [DEFENSE: CHAT_BOLA_IDOR_AUTHORIZATION_GUARD]
 * // [DEFENSE: CHAT_RATE_LIMIT_SPAM_PROTECTION]
 * // [DEFENSE: XSS_CONTENT_SANITIZATION]
 * ============================================================================
 */

export const MAX_CHAT_MESSAGE_LENGTH = 5000;
export const MAX_ATTACHMENT_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
export const FORBIDDEN_EXTENSIONS = new Set([
  'exe', 'sh', 'bat', 'cmd', 'msi', 'vbs', 'js', 'mjs', 'ts', 'php',
  'phtml', 'py', 'pl', 'jar', 'com', 'scr', 'dll', 'ps1', 'cgi'
]);

export interface ResolvedSenderIdentity {
  senderId: string;
  senderName: string;
  senderRole: 'admin' | 'advisor' | 'student' | 'parent' | 'guest';
  senderAvatar?: string;
  senderBadge?: string;
  isAuthenticated: boolean;
  isGuest: boolean;
  anonymousSessionId?: string;
}

export interface ChatAccessCheckResult {
  allowed: boolean;
  reason?: string;
  statusCode: number;
}

// Memory-backed sliding window rate limiters for chat
interface RateLimitBucket {
  count: number;
  resetAt: number;
}

const messageRateLimits = new Map<string, RateLimitBucket>();
const roomCreateRateLimits = new Map<string, RateLimitBucket>();

/**
 * Cleans up expired rate limit buckets periodically
 */
const cleanupTimer = setInterval(() => {
  const now = Date.now();
  for (const [key, bucket] of messageRateLimits.entries()) {
    if (now > bucket.resetAt) messageRateLimits.delete(key);
  }
  for (const [key, bucket] of roomCreateRateLimits.entries()) {
    if (now > bucket.resetAt) roomCreateRateLimits.delete(key);
  }
}, 60 * 1000);
if (typeof cleanupTimer.unref === 'function') {
  cleanupTimer.unref();
}

/**
 * Derives a cryptographically deterministic anonymous guest session identifier
 */
export function generateAnonymousGuestId(req: Request): string {
  const ip = extractSecureClientIp(req);
  const userAgent = req.headers['user-agent'] || 'unknown-client';
  const cookieSession = req.cookies?.['caffeine_guest_session'] || '';
  const hash = crypto
    .createHash('sha256')
    .update(`${ip}:${userAgent}:${cookieSession}`)
    .digest('hex')
    .substring(0, 12);
  return `anon-guest-${hash}`;
}

/**
 * Resolves the true sender identity using Zero-Trust principles:
 * - If user is cryptographically authenticated via token/cookie: uses server-side record.
 * - If unauthenticated: binds to an anonymous guest identity with strictly 'guest' role.
 * - Client-submitted `senderRole`, `senderId`, or `senderName` spoofing is neutralized.
 */
export function resolveSenderIdentity(req: Request, body: any = {}): ResolvedSenderIdentity {
  const authUser = req.authUser;

  if (authUser && authUser.id) {
    const rawRole = (authUser.role || 'student').toLowerCase();
    const validRole = (['admin', 'advisor', 'student', 'parent'].includes(rawRole)
      ? rawRole
      : 'student') as 'admin' | 'advisor' | 'student' | 'parent';

    // Normalize student ID vs User ID
    const effectiveSenderId = (authUser.studentId || authUser.id).replace(/^usr-/, '');
    const effectiveSenderName = authUser.name || authUser.username || 'کاربر کافئین';

    let defaultBadge = '';
    if (validRole === 'admin') defaultBadge = 'مدیریت سامانه';
    else if (validRole === 'advisor') defaultBadge = 'مشاور ارشد کافئین';
    else if (validRole === 'parent') defaultBadge = 'ولی دانش‌آموز';

    return {
      senderId: effectiveSenderId,
      senderName: effectiveSenderName,
      senderRole: validRole,
      senderAvatar: body.senderAvatar ? sanitizeSafeUrl(String(body.senderAvatar)) : undefined,
      senderBadge: defaultBadge || (body.senderBadge ? sanitizeString(String(body.senderBadge)).sanitized.substring(0, 40) : undefined),
      isAuthenticated: true,
      isGuest: false
    };
  }

  // Unauthenticated / Anonymous Guest
  const anonId = generateAnonymousGuestId(req);
  const requestedName = body.senderName ? sanitizeString(String(body.senderName)).sanitized.trim().substring(0, 30) : '';
  const safeGuestName = requestedName ? `مهمان (${requestedName})` : 'کاربر مهمان';

  return {
    senderId: anonId,
    senderName: safeGuestName,
    senderRole: 'guest',
    senderAvatar: body.senderAvatar ? sanitizeSafeUrl(String(body.senderAvatar)) : undefined,
    senderBadge: 'مهمان آکادمی',
    isAuthenticated: false,
    isGuest: true,
    anonymousSessionId: anonId
  };
}

/**
 * Checks chat message rate limit (max 30 msgs per minute per IP/User)
 */
export function checkChatMessageRateLimit(req: Request, userId: string): { allowed: boolean; retryAfterSeconds?: number } {
  const ip = extractSecureClientIp(req);
  const key = `msg:${userId || ip}`;
  const now = Date.now();
  const windowMs = 60 * 1000;
  const maxLimit = 30;

  const current = messageRateLimits.get(key);
  if (!current || now > current.resetAt) {
    messageRateLimits.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true };
  }

  if (current.count >= maxLimit) {
    const retryAfter = Math.ceil((current.resetAt - now) / 1000);
    return { allowed: false, retryAfterSeconds: Math.max(1, retryAfter) };
  }

  current.count++;
  return { allowed: true };
}

/**
 * Checks chat room creation rate limit (max 5 rooms per hour per IP/User)
 */
export function checkChatRoomCreateRateLimit(req: Request, userId: string): { allowed: boolean; retryAfterSeconds?: number } {
  const ip = extractSecureClientIp(req);
  const key = `room:${userId || ip}`;
  const now = Date.now();
  const windowMs = 60 * 60 * 1000;
  const maxLimit = 10;

  const current = roomCreateRateLimits.get(key);
  if (!current || now > current.resetAt) {
    roomCreateRateLimits.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true };
  }

  if (current.count >= maxLimit) {
    const retryAfter = Math.ceil((current.resetAt - now) / 1000);
    return { allowed: false, retryAfterSeconds: Math.max(1, retryAfter) };
  }

  current.count++;
  return { allowed: true };
}

/**
 * Authorizes chat room access based on user role, room type, and identity isolation (IDOR/BOLA Guard)
 */
export function authorizeChatRoomAccess(
  authUser: AuthenticatedUserContext | null,
  room: any,
  action: 'read' | 'write' | 'delete' | 'pin' | 'manage'
): ChatAccessCheckResult {
  if (!room) {
    return { allowed: false, statusCode: 404, reason: 'تالار گفتگو یافت نشد.' };
  }

  const role = authUser ? authUser.role : 'guest';
  const isAuthenticated = Boolean(authUser && authUser.id && role !== 'guest');
  const myUserId = authUser ? (authUser.studentId || authUser.id).replace(/^usr-/, '') : '';
  const myChildStudentId = authUser?.childStudentId ? authUser.childStudentId.replace(/^usr-/, '') : '';
  const roomStudentId = (room.studentId || room.directStudentId || '').replace(/^usr-/, '');
  const participants: string[] = Array.isArray(room.participants)
    ? room.participants.map((p: any) => String(p).replace(/^usr-/, ''))
    : [];
  const isLocked = Boolean(room.isLocked || room.locked);

  // 1. Admin has full governance
  if (role === 'admin' || role === 'super_admin') {
    return { allowed: true, statusCode: 200 };
  }

  // 2. Channel Lock Protection (Admins & Advisors can manage/write in locked rooms; other users cannot send messages)
  if (isLocked && action === 'write') {
    if (role === 'advisor') {
      // Advisors can post guidance even in locked rooms
      return { allowed: true, statusCode: 200 };
    }
    return {
      allowed: false,
      statusCode: 403,
      reason: 'این تالار گفتگو توسط مدیریت قفل شده است و ارسال پیام جدید موقتاً مسدود می‌باشد.'
    };
  }

  // 3. Announcements Channel: Read allowed to all, Write only to Admin & Advisor
  if (room.type === 'announcement' || room.id === 'room-announcements') {
    if (action === 'read') return { allowed: true, statusCode: 200 };
    if (action === 'write' || action === 'manage') {
      if (role === 'advisor') return { allowed: true, statusCode: 200 };
      return { allowed: false, statusCode: 403, reason: 'تنها مدیران و مشاوران ارشد مجاز به ارسال پیام در کانال اعلانات هستند.' };
    }
  }

  // 4. Pin messages: Admin & Advisor only
  if (action === 'pin') {
    if (role === 'advisor') return { allowed: true, statusCode: 200 };
    return { allowed: false, statusCode: 403, reason: 'پین کردن پیام‌ها نیازمند دسترسی مشاور یا مدیریت است.' };
  }

  // 5. Room Management (e.g. toggling lock, editing settings)
  if (action === 'manage') {
    if (role === 'advisor') return { allowed: true, statusCode: 200 };
    return { allowed: false, statusCode: 403, reason: 'مدیریت تنظیمات یا قفل کردن تالار نیازمند دسترسی مدیریت یا مشاور است.' };
  }

  // 6. Direct / Support / Private Rooms (IDOR/BOLA Protection)
  const isSupportRoom = Boolean(
    room.isSupportRoom ||
    room.category === 'support' ||
    room.id === 'dm-support' ||
    room.id === 'direct-support' ||
    room.id === 'direct-support-guest' ||
    room.id === 'dm-support-guest' ||
    room.id.startsWith('dm-support') ||
    room.id.startsWith('direct-support')
  );
  const isDirectRoom = room.type === 'direct' || room.category === 'direct' || isSupportRoom;

  if (isDirectRoom) {
    // Unauthenticated Guests: Requirement "بدون ورود فقط چت با پشتیبانی توی خصوصی ها باشه"
    if (!isAuthenticated) {
      // Guests are strictly restricted: CANNOT access student-to-student or advisor direct rooms
      if (!isSupportRoom) {
        return {
          allowed: false,
          statusCode: 401,
          reason: 'برای دسترسی به چت‌های خصوصی، ورود به حساب کاربری الزامی است. کاربران مهمان صرفاً به چت پشتیبانی دسترسی دارند.'
        };
      }

      // In support rooms: Guests can ONLY access the dedicated guest support room.
      // Strict PII protection: Guests can NEVER view or enter registered student support rooms!
      const isGuestSupportRoom = (
        room.id === 'direct-support-guest' ||
        room.id === 'dm-support-guest' ||
        roomStudentId === 'guest' ||
        room.directStudentId === 'guest' ||
        (typeof roomStudentId === 'string' && roomStudentId.startsWith('anon-guest-')) ||
        (typeof room.id === 'string' && room.id.includes('guest'))
      );

      if (!isGuestSupportRoom) {
        return {
          allowed: false,
          statusCode: 401,
          reason: 'برای دسترسی به گفتگوی پشتیبانی اختصاصی دانش‌آموزان ثبت‌نام‌شده، لطفاً ابتدا وارد حساب کاربری خود شوید.'
        };
      }

      return { allowed: true, statusCode: 200 };
    }

    // Authenticated Student:
    if (role === 'student') {
      const isMySupportRoom = isSupportRoom && (
        roomStudentId === myUserId ||
        room.directStudentId === myUserId ||
        room.id === `dm-support-${myUserId}` ||
        room.id === `direct-support-${myUserId}`
      );
      const isMyParticipant = participants.includes(myUserId);

      if (isMySupportRoom || isMyParticipant) {
        return { allowed: true, statusCode: 200 };
      }

      return {
        allowed: false,
        statusCode: 403,
        reason: 'عدم دسترسی: شما مجاز به مشاهده یا ارسال پیام در گفتگوی خصوصی سایر داوطلبان نیستید.'
      };
    }

    // Authenticated Parent:
    if (role === 'parent') {
      const isChildSupportRoom = isSupportRoom && (
        (myChildStudentId && (roomStudentId === myChildStudentId || room.directStudentId === myChildStudentId)) ||
        (myChildStudentId && (room.id === `dm-support-${myChildStudentId}` || room.id === `direct-support-${myChildStudentId}`))
      );
      const isChildParticipant = Boolean(myChildStudentId && participants.includes(myChildStudentId));

      if (isChildSupportRoom || isChildParticipant) {
        return { allowed: true, statusCode: 200 };
      }

      return {
        allowed: false,
        statusCode: 403,
        reason: 'عدم دسترسی: شما تنها به پرونده و چت‌های پشتیبانی فرزند ثبت‌شده خود دسترسی دارید.'
      };
    }

    // Authenticated Advisor:
    if (role === 'advisor') {
      const isAdvisorParticipant = participants.includes(myUserId) || room.advisorId === myUserId || room.id === `dm-advisor-${myUserId}`;
      if (isSupportRoom || isAdvisorParticipant) {
        return { allowed: true, statusCode: 200 };
      }
      if (room.advisorId && room.advisorId !== myUserId && !isAdvisorParticipant) {
        return {
          allowed: false,
          statusCode: 403,
          reason: 'عدم دسترسی: این گفتگوی مستقیم متعلق به مشاور دیگری است.'
        };
      }
      return { allowed: true, statusCode: 200 };
    }
  }

  // 7. Advisor Student Group Rooms
  if (room.isAdvisorStudentGroup) {
    if (!isAuthenticated) {
      return {
        allowed: false,
        statusCode: 401,
        reason: 'مشاهده و فعالیت در گروه‌های مشاوره‌ای نیازمند ورود به حساب کاربری است.'
      };
    }

    if (role === 'advisor') {
      const isMyGroup = room.advisorId === myUserId || room.creatorId === myUserId || participants.includes(myUserId);
      if (isMyGroup) return { allowed: true, statusCode: 200 };
      if (action === 'write') {
        return { allowed: false, statusCode: 403, reason: 'تنها مشاور مسئول گروه مجاز به ارسال پیام در این حلقه است.' };
      }
      return { allowed: true, statusCode: 200 };
    }

    // Students can read/write if approved
    if (room.approvalStatus === 'approved') {
      return { allowed: true, statusCode: 200 };
    }
    return { allowed: false, statusCode: 403, reason: 'این تالار در انتظار تایید مدیریت است.' };
  }

  // 8. Channels (Public vs Academic/Restricted)
  // Requirement: "صرفا کانال های عمومی بدون ورود دسترسی بدن، اونا هم امکان اینو داشته باشن که قفل کنند."
  const isPublicChannel = Boolean(
    room.isMainPublicChannel ||
    room.category === 'public' ||
    room.category === 'general' ||
    room.category === 'official' ||
    room.type === 'announcement' ||
    room.id === 'room-general' ||
    room.id === 'room-general-public' ||
    room.id === 'room-announcements'
  );

  if (!isPublicChannel) {
    // Academic or specialized channels (room-biology, room-chemistry, room-math, etc.)
    if (!isAuthenticated) {
      return {
        allowed: false,
        statusCode: 401,
        reason: 'دسترسی به تالارهای تخصصی و علمی نیازمند ورود به حساب کاربری است. لطفاً ابتدا وارد حساب کاربری خود شوید.'
      };
    }
  }

  // CRITICAL PRODUCTION-LEVEL SECURITY:
  // Unauthenticated guests CANNOT write/post messages in ANY group, channel, or public room!
  // Writing in groups requires an authenticated account (student, advisor, admin).
  // The only room where a guest may post is their own anonymous guest support room (direct-support-guest).
  if (!isAuthenticated && action === 'write') {
    return {
      allowed: false,
      statusCode: 401,
      reason: 'ارسال پیام در تالارهای گفتگو و گروه‌ها نیازمند ورود به حساب کاربری است. کاربران مهمان صرفاً در چت پشتیبانی امکان ارسال پیام دارند.'
    };
  }

  // Check approval status for unapproved rooms
  if (room.approvalStatus && room.approvalStatus !== 'approved' && role !== 'admin') {
    return { allowed: false, statusCode: 403, reason: 'این تالار هنوز مورد تایید مدیریت قرار نگرفته است.' };
  }

  return { allowed: true, statusCode: 200 };
}

/**
 * Validates and sanitizes a new chat message payload
 */
export function validateAndSanitizeMessage(body: any): {
  valid: boolean;
  error?: string;
  sanitizedText?: string;
  sanitizedAttachment?: {
    url: string;
    name?: string;
    type?: string;
    size?: number;
  };
} {
  const rawText = body.text ? String(body.text) : '';
  const attachmentUrl = body.attachmentUrl ? String(body.attachmentUrl) : '';

  if (!rawText.trim() && !attachmentUrl.trim()) {
    return { valid: false, error: 'متن پیام یا پیوست الزامی است.' };
  }

  if (rawText.length > MAX_CHAT_MESSAGE_LENGTH) {
    return {
      valid: false,
      error: `طول متن پیام بیش از حد مجاز (${MAX_CHAT_MESSAGE_LENGTH.toLocaleString('fa-IR')} کاراکتر) است.`
    };
  }

  const sanitizedText = rawText ? sanitizeString(rawText).sanitized : '';

  let sanitizedAttachment = undefined;
  if (attachmentUrl) {
    const safeUrl = sanitizeSafeUrl(attachmentUrl);
    if (!safeUrl || safeUrl === '#safe') {
      return { valid: false, error: 'آدرس پیوست حاوی پروتکل غیرمجاز یا ناامن است.' };
    }

    const attachmentName = body.attachmentName ? sanitizeString(String(body.attachmentName)).sanitized.substring(0, 100) : undefined;
    if (attachmentName) {
      const ext = attachmentName.split('.').pop()?.toLowerCase() || '';
      if (FORBIDDEN_EXTENSIONS.has(ext)) {
        return { valid: false, error: `ارسال فایل‌های اجرایی یا اسکریپتی (${ext}.) به دلایل امنیتی مجاز نیست.` };
      }
    }

    sanitizedAttachment = {
      url: safeUrl,
      name: attachmentName,
      type: body.attachmentType ? String(body.attachmentType).substring(0, 50) : undefined,
      size: typeof body.attachmentSize === 'number' ? Math.min(body.attachmentSize, MAX_ATTACHMENT_SIZE_BYTES) : undefined
    };
  }

  return {
    valid: true,
    sanitizedText,
    sanitizedAttachment
  };
}
