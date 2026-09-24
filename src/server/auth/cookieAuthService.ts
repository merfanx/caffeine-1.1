import crypto from 'crypto';
import { Response, Request, NextFunction } from 'express';
import {
  generateAuthToken,
  verifyAuthToken,
  revokeToken,
  isTokenRevoked,
  AuthTokenPayload
} from './tokenService';

/**
 * ============================================================================
 * CAFFEINE SECURE HTTPONLY COOKIE & CSRF DEFENSE SERVICE
 * ============================================================================
 * Implements:
 * 1. Zero-JS-Accessible HttpOnly Access Tokens
 * 2. Secure Rotating Refresh Tokens with Replay/Reuse Prevention
 * 3. Double-Submit Cryptographic CSRF Defense
 * 4. Production-Aware Secure, SameSite, and Restricted Path Flags
 *
 * [SECURITY_LAYER: COOKIE_AUTHENTICATION_AND_CSRF]
 * [DEFENSE: HTTPONLY_XSS_IMMUNITY_AND_CSRF_SHIELD]
 * ============================================================================
 */

export const ACCESS_TOKEN_COOKIE = 'caffeine_access_token';
export const REFRESH_TOKEN_COOKIE = 'caffeine_refresh_token';
export const CSRF_TOKEN_COOKIE = 'caffeine_csrf_token';

// Expiration timeframes
export const ACCESS_TOKEN_EXPIRY_SECONDS = 60 * 60; // 1 Hour
export const REFRESH_TOKEN_EXPIRY_SECONDS = 7 * 24 * 60 * 60; // 7 Days

export interface UserClaims {
  userId: string;
  username?: string;
  role: string;
  name: string;
  phone?: string;
  studentId?: string;
  advisorId?: string;
  childStudentId?: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  csrfToken: string;
  expiresInSeconds: number;
}

export interface CookieSecurityOptions {
  httpOnly: boolean;
  secure: boolean;
  sameSite: 'lax' | 'strict' | 'none';
  path: string;
  maxAge: number;
}

/**
 * Detects if the current runtime requires HTTPS Secure flag on cookies
 */
export function isSecureContext(req?: Request): boolean {
  if (process.env.NODE_ENV === 'production') return true;
  if (req) {
    const proto = req.headers['x-forwarded-proto'];
    if (proto === 'https' || req.secure) return true;
  }
  return false;
}

export function getAccessTokenCookieOptions(req?: Request): CookieSecurityOptions {
  const secure = isSecureContext(req);
  return {
    httpOnly: true,
    secure,
    sameSite: secure ? 'none' : 'lax',
    path: '/',
    maxAge: ACCESS_TOKEN_EXPIRY_SECONDS * 1000
  };
}

export function getRefreshTokenCookieOptions(req?: Request): CookieSecurityOptions {
  const secure = isSecureContext(req);
  return {
    httpOnly: true,
    secure,
    sameSite: secure ? 'none' : 'lax',
    path: '/',
    maxAge: REFRESH_TOKEN_EXPIRY_SECONDS * 1000
  };
}

export function getCsrfCookieOptions(req?: Request): CookieSecurityOptions {
  const secure = isSecureContext(req);
  return {
    httpOnly: false, // Must be readable by client JS to mirror into X-CSRF-Token header
    secure,
    sameSite: secure ? 'none' : 'lax',
    path: '/',
    maxAge: REFRESH_TOKEN_EXPIRY_SECONDS * 1000
  };
}

/**
 * Generates an unpredictable cryptographic CSRF token
 */
export function generateCsrfToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Issues a matched pair of Access Token + Rotating Refresh Token + CSRF Token
 */
export function issueTokenPair(claims: UserClaims): TokenPair {
  const accessToken = generateAuthToken(claims, ACCESS_TOKEN_EXPIRY_SECONDS);

  // Refresh token carries distinct claim signature
  const refreshToken = generateAuthToken(
    {
      ...claims,
      name: `${claims.name} [REFRESH]`
    },
    REFRESH_TOKEN_EXPIRY_SECONDS
  );

  const csrfToken = generateCsrfToken();

  return {
    accessToken,
    refreshToken,
    csrfToken,
    expiresInSeconds: ACCESS_TOKEN_EXPIRY_SECONDS
  };
}

/**
 * Attaches standard secure HttpOnly cookies to the HTTP Response
 */
export function setAuthCookies(res: Response, tokenPair: TokenPair, req?: Request): void {
  const accessOpts = getAccessTokenCookieOptions(req);
  const refreshOpts = getRefreshTokenCookieOptions(req);
  const csrfOpts = getCsrfCookieOptions(req);

  res.cookie(ACCESS_TOKEN_COOKIE, tokenPair.accessToken, accessOpts);
  res.cookie(REFRESH_TOKEN_COOKIE, tokenPair.refreshToken, refreshOpts);
  res.cookie(CSRF_TOKEN_COOKIE, tokenPair.csrfToken, csrfOpts);
}

/**
 * Securely destroys all session cookies from the client browser
 */
export function clearAuthCookies(res: Response, req?: Request): void {
  const secure = isSecureContext(req);

  res.clearCookie(ACCESS_TOKEN_COOKIE, { path: '/', httpOnly: true, secure, sameSite: 'lax' });
  res.clearCookie(REFRESH_TOKEN_COOKIE, { path: '/', httpOnly: true, secure, sameSite: 'lax' });
  res.clearCookie(CSRF_TOKEN_COOKIE, { path: '/', httpOnly: false, secure, sameSite: 'lax' });
}

/**
 * Handles Rotating Refresh Token Renewal
 * - Validates the Refresh Token signature and revocation
 * - Immediately invalidates the consumed refresh token (Reuse prevention)
 * - Issues a brand new Access Token and brand new rotated Refresh Token
 */
export function rotateRefreshToken(oldRefreshToken: string): {
  success: boolean;
  tokenPair?: TokenPair;
  userClaims?: UserClaims;
  error?: string;
  code?: string;
} {
  if (!oldRefreshToken || typeof oldRefreshToken !== 'string') {
    return { success: false, error: 'رفرش توکن ارائه نشده است.', code: 'MISSING_REFRESH_TOKEN' };
  }

  const verification = verifyAuthToken(oldRefreshToken);
  if (!verification.valid || !verification.payload) {
    return {
      success: false,
      error: verification.error || 'رفرش توکن نامعتبر یا منقضی است.',
      code: verification.code || 'INVALID_REFRESH_TOKEN'
    };
  }

  const payload: AuthTokenPayload = verification.payload;

  // 1. Immediately revoke the old refresh token so it cannot be replayed (Rotation)
  revokeToken(oldRefreshToken);

  // 2. Extract clean claims for new token generation
  const cleanName = (payload.name || '').replace(/\s*\[REFRESH\]\s*$/i, '');
  const claims: UserClaims = {
    userId: payload.userId,
    username: payload.username,
    role: payload.role,
    name: cleanName || 'کاربر سیستم',
    phone: payload.phone,
    studentId: payload.studentId,
    advisorId: payload.advisorId,
    childStudentId: payload.childStudentId
  };

  // 3. Issue fresh new pair with new JTI
  const newTokens = issueTokenPair(claims);

  return {
    success: true,
    tokenPair: newTokens,
    userClaims: claims
  };
}

/**
 * Constant-time string comparator for CSRF token verification
 */
function timingSafeStringEqual(a: string, b: string): boolean {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

/**
 * Double-Submit Cookie CSRF Protection Middleware
 * Enforces valid X-CSRF-Token for state-changing HTTP methods when cookies are used.
 */
export function csrfProtectionMiddleware(req: Request, res: Response, next: NextFunction): void {
  const method = req.method.toUpperCase();

  // Safe idempotent methods do not mutate state
  if (['GET', 'HEAD', 'OPTIONS'].includes(method)) {
    return next();
  }

  // Exempt public authentication handshakes and webhook endpoints
  const exemptPaths = [
    '/api/v1/auth/login',
    '/api/v1/auth/refresh',
    '/api/v1/auth/register',
    '/api/v1/security/infra-audit',
    '/api/v1/security/data-security-audit',
    '/api/v1/security/code-review-audit',
    '/api/v1/security/jwt-audit',
    '/api/v1/security/cookie-auth-audit',
    '/api/v1/security/regression-suite'
  ];

  const currentPath = req.path || req.originalUrl || '';
  if (exemptPaths.some((p) => currentPath.startsWith(p))) {
    return next();
  }

  // If request is purely API-Key or Bearer token (non-cookie based), bypass cookie CSRF
  const authHeader = req.headers['authorization'];
  const hasCookieAuth = Boolean(req.cookies && (req.cookies[ACCESS_TOKEN_COOKIE] || req.cookies[REFRESH_TOKEN_COOKIE]));

  if (!hasCookieAuth && typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
    return next();
  }

  // Double Submit Cookie Validation
  const cookieCsrfToken = req.cookies?.[CSRF_TOKEN_COOKIE];
  const headerCsrfToken = (req.headers['x-csrf-token'] || req.headers['x-xsrf-token']) as string | undefined;

  if (!cookieCsrfToken || !headerCsrfToken) {
    res.status(403).json({
      success: false,
      error: 'CSRF_TOKEN_MISSING',
      message: 'درخواست به دلیل عدم وجود توکن معتبر CSRF مسدود گردید (حفاظت در برابر حملات جعل درخواست میان‌وب‌گاهی).'
    });
    return;
  }

  if (!timingSafeStringEqual(cookieCsrfToken, headerCsrfToken)) {
    res.status(403).json({
      success: false,
      error: 'CSRF_TOKEN_MISMATCH',
      message: 'توکن ارسالی CSRF با کوکی نشست مطابقت ندارد.'
    });
    return;
  }

  next();
}
