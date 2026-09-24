import { Request, Response, NextFunction } from 'express';
import {
  helmetSecurityMiddleware,
  smartCorsMiddleware,
  expressSanitizationMiddleware,
  sensitivePathBlockMiddleware,
  setCustomAllowedOrigins,
  setCorsMode,
  getCorsConfig,
  isOriginAllowed
} from '../security/apiHardening.js';
import {
  csrfProtectionMiddleware,
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
  CSRF_TOKEN_COOKIE,
  setAuthCookies,
  clearAuthCookies,
  issueTokenPair,
  rotateRefreshToken
} from '../auth/cookieAuthService.js';

export function requestAuditMiddleware(req: Request, res: Response, next: NextFunction) {
  // Pass-through request tracker / telemetry
  next();
}

export {
  helmetSecurityMiddleware,
  smartCorsMiddleware,
  expressSanitizationMiddleware,
  sensitivePathBlockMiddleware,
  csrfProtectionMiddleware,
  setCustomAllowedOrigins,
  setCorsMode,
  getCorsConfig,
  isOriginAllowed,
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
  CSRF_TOKEN_COOKIE,
  setAuthCookies,
  clearAuthCookies,
  issueTokenPair,
  rotateRefreshToken
};
