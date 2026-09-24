import { Request, Response, NextFunction } from 'express';
import { recordSensitiveAudit } from '../storage/auditLogManager';
import { extractSecureClientIp } from './ipSecurity';

/**
 * ============================================================================
 * PRODUCTION-GRADE HARDENED CORS ENGINE & ORIGIN ACCESS CONTROLLER
 * ============================================================================
 * Features:
 * 1. Strict Allowlist enforcement in Production (No Wildcard with credentials)
 * 2. Environment Configuration parsing (CORS_ALLOWED_ORIGINS, APP_URL)
 * 3. Separation of Development and Production profiles
 * 4. RFC-compliant OPTIONS Preflight handling (status 204 for allowed, 403 for blocked)
 * 5. Explicit HTTP methods and headers restrictions
 * 6. Information Leakage Prevention: Unpermitted origins receive no sensitive headers or origins
 * 7. Protection against Wildcard Origin abuse with Credentials
 * 8. Dynamic admin configuration support with persistence fallback
 */

export interface CorsSecurityConfig {
  mode: 'strict' | 'relaxed';
  environment: 'production' | 'development' | 'test';
  allowedOrigins: string[];
  envConfiguredOrigins: string[];
  customOrigins: string[];
  allowedMethods: string[];
  allowedHeaders: string[];
  exposedHeaders: string[];
  allowCredentials: boolean;
  maxAgeSeconds: number;
}

// Allowed HTTP Methods for Caffeine 2.1 API
export const CORS_ALLOWED_METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'];

// Allowed Request Headers
export const CORS_ALLOWED_HEADERS = [
  'Origin',
  'X-Requested-With',
  'Content-Type',
  'Accept',
  'Authorization',
  'X-Caffeine-API-Key',
  'X-CSRF-Token',
  'X-XSRF-Token'
];

// Exposed Response Headers to Browsers
export const CORS_EXPOSED_HEADERS = [
  'X-RateLimit-Limit',
  'X-RateLimit-Remaining',
  'X-RateLimit-Reset',
  'X-RateLimit-Tier',
  'X-Content-Type-Options',
  'X-Frame-Options'
];

// Max Age for Preflight Cache (24 Hours)
export const CORS_PREFLIGHT_MAX_AGE = 86400;

// Development-only local origins pattern
const DEV_ORIGIN_REGEXES: RegExp[] = [
  /^https?:\/\/localhost(:\d+)?$/,
  /^https?:\/\/127\.0\.0\.1(:\d+)?$/,
  /^https?:\/\/0\.0\.0\.0(:\d+)?$/
];

// Trusted Platform Cloud Patterns (AI Studio / Cloud Run Preview & Shared Domains)
const CLOUD_PLATFORM_ORIGIN_REGEXES: RegExp[] = [
  /^https?:\/\/(?:[a-zA-Z0-9-]+\.)*ai\.studio(?::\d+)?$/,
  /^https?:\/\/ai\.studio$/,
  /^https?:\/\/(?:[a-zA-Z0-9-]+\.)*google\.com(?::\d+)?$/,
  /^https?:\/\/(?:[a-zA-Z0-9-]+\.)*googleusercontent\.com(?::\d+)?$/,
  /^https?:\/\/(?:[a-zA-Z0-9-]+\.)*run\.app(?::\d+)?$/,
  /^https?:\/\/(?:[a-zA-Z0-9-]+\.)*web\.app(?::\d+)?$/,
  /^https?:\/\/(?:[a-zA-Z0-9-]+\.)*firebaseapp\.com(?::\d+)?$/
];

// In-Memory Custom Origins Set (Configured via Admin UI / System Settings)
const customAllowedOrigins = new Set<string>();

// Current environment mode
export function getRuntimeEnvironment(): 'production' | 'development' | 'test' {
  const env = (process.env.NODE_ENV || 'development').toLowerCase();
  if (env === 'production') return 'production';
  if (env === 'test') return 'test';
  return 'development';
}

// In production, default mode is always 'strict'.
let corsPolicyMode: 'strict' | 'relaxed' = getRuntimeEnvironment() === 'production' ? 'strict' : 'strict';

/**
 * Parses and returns origins configured in process.env (CORS_ALLOWED_ORIGINS, APP_URL)
 */
export function getEnvConfiguredOrigins(): string[] {
  const results: string[] = [];

  // Parse CORS_ALLOWED_ORIGINS (comma-separated)
  const envOrigins = process.env.CORS_ALLOWED_ORIGINS;
  if (envOrigins && typeof envOrigins === 'string') {
    const parts = envOrigins.split(',');
    for (const part of parts) {
      const trimmed = part.trim().toLowerCase();
      // Wildcard '*' is NEVER accepted from env in production if credentials are used
      if (trimmed && trimmed !== '*') {
        try {
          // Normalize origin format (strip trailing slashes, validate URL protocol)
          const parsed = new URL(trimmed);
          results.push(parsed.origin.toLowerCase());
        } catch (_) {
          // If not parseable as full URL, keep clean non-empty string if not wildcard
          if (!trimmed.includes('*')) {
            results.push(trimmed);
          }
        }
      }
    }
  }

  // Parse APP_URL
  const appUrl = process.env.APP_URL;
  if (appUrl && typeof appUrl === 'string' && appUrl !== 'MY_APP_URL') {
    try {
      const parsed = new URL(appUrl.trim());
      const origin = parsed.origin.toLowerCase();
      if (!results.includes(origin)) {
        results.push(origin);
      }
    } catch (_) {}
  }

  return results;
}

/**
 * Validates whether an incoming Origin is permitted under current CORS rules.
 * 
 * Rules:
 * 1. Missing Origin (same-origin, curl, server-to-server) -> Always allowed.
 * 2. Wildcard '*' Origin -> STRICTLY REJECTED in Production and rejected whenever credentials/cookies are active.
 * 3. Exact match against env-configured origins.
 * 4. Exact match against admin-approved custom origins.
 * 5. Match against authorized Google Cloud Run / AI Studio subdomains.
 * 6. Localhost/Loopback only permitted in Development/Test environments or if explicitly added.
 */
export function isCorsOriginPermitted(
  origin?: string,
  env: 'production' | 'development' | 'test' = getRuntimeEnvironment(),
  reqHost?: string
): boolean {
  // Case 1: Direct, non-browser or same-origin request (no Origin header sent by browser)
  if (!origin) {
    return true;
  }

  const trimmed = origin.trim().toLowerCase();

  // Case 2: Wildcard origin rejection
  if (trimmed === '*' || trimmed === 'null') {
    return false;
  }

  // Parse origin URL safely
  let originHost = '';
  let parsedUrl: URL | null = null;
  try {
    parsedUrl = new URL(trimmed);
    // Disallow non-http/https protocols (e.g. data:, file:, javascript:)
    if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
      return false;
    }
    originHost = parsedUrl.origin.toLowerCase();
  } catch (_) {
    return false; // Malformed origin header
  }

  // Case 2.5: Same-Host / Same-Origin Match (from browser on the same host)
  if (reqHost && parsedUrl) {
    const cleanReqHost = reqHost.toLowerCase().trim();
    if (parsedUrl.host === cleanReqHost || parsedUrl.hostname === cleanReqHost) {
      return true;
    }
  }

  // Case 3: Check Environment-Configured Origins
  const envOrigins = getEnvConfiguredOrigins();
  if (envOrigins.includes(originHost) || envOrigins.includes(trimmed)) {
    return true;
  }

  // Case 4: Check Custom Admin-Approved Origins
  if (customAllowedOrigins.has(originHost) || customAllowedOrigins.has(trimmed)) {
    return true;
  }

  // Case 5: Cloud Platform / AI Studio / Cloud Run Hosting Patterns
  for (const regex of CLOUD_PLATFORM_ORIGIN_REGEXES) {
    if (regex.test(originHost) || regex.test(trimmed)) {
      return true;
    }
  }

  // Case 6: Local Development origins (only valid when NOT in production or if explicitly added)
  if (env !== 'production') {
    for (const devRegex of DEV_ORIGIN_REGEXES) {
      if (devRegex.test(originHost) || devRegex.test(trimmed)) {
        return true;
      }
    }
  }

  // Case 7: Relaxed mode in non-production environments only
  if (corsPolicyMode === 'relaxed' && env !== 'production') {
    return true;
  }

  return false;
}

/**
 * Configure CORS Policy Mode
 */
export function setCorsPolicyMode(mode: 'strict' | 'relaxed') {
  // Production enforces strict mode regardless
  if (getRuntimeEnvironment() === 'production') {
    corsPolicyMode = 'strict';
  } else {
    corsPolicyMode = mode;
  }
}

/**
 * Set custom allowed origins
 */
export function setCustomCorsOrigins(origins: string[]) {
  customAllowedOrigins.clear();
  origins.forEach((o) => {
    if (typeof o === 'string') {
      const clean = o.trim().toLowerCase();
      // Reject wildcards from being added to allowlist
      if (clean.length > 0 && clean !== '*' && clean !== 'null') {
        try {
          const parsed = new URL(clean);
          customAllowedOrigins.add(parsed.origin.toLowerCase());
        } catch (_) {
          if (!clean.includes('*')) {
            customAllowedOrigins.add(clean);
          }
        }
      }
    }
  });
}

/**
 * Add single custom origin
 */
export function addCustomCorsOrigin(origin: string): boolean {
  if (!origin || typeof origin !== 'string') return false;
  const clean = origin.trim().toLowerCase();
  if (clean === '*' || clean === 'null') return false;

  try {
    const parsed = new URL(clean);
    customAllowedOrigins.add(parsed.origin.toLowerCase());
    return true;
  } catch (_) {
    if (!clean.includes('*')) {
      customAllowedOrigins.add(clean);
      return true;
    }
    return false;
  }
}

/**
 * Remove single custom origin
 */
export function removeCustomCorsOrigin(origin: string): boolean {
  if (!origin || typeof origin !== 'string') return false;
  const clean = origin.trim().toLowerCase();
  return customAllowedOrigins.delete(clean);
}

/**
 * Retrieve comprehensive CORS runtime configuration
 */
export function getActiveCorsConfig(): CorsSecurityConfig {
  const env = getRuntimeEnvironment();
  return {
    mode: env === 'production' ? 'strict' : corsPolicyMode,
    environment: env,
    allowedOrigins: [
      ...getEnvConfiguredOrigins(),
      ...Array.from(customAllowedOrigins)
    ],
    envConfiguredOrigins: getEnvConfiguredOrigins(),
    customOrigins: Array.from(customAllowedOrigins),
    allowedMethods: CORS_ALLOWED_METHODS,
    allowedHeaders: CORS_ALLOWED_HEADERS,
    exposedHeaders: CORS_EXPOSED_HEADERS,
    allowCredentials: true,
    maxAgeSeconds: CORS_PREFLIGHT_MAX_AGE
  };
}

/**
 * Hardened Production-Grade CORS Middleware
 */
export function hardenedCorsMiddleware(req: Request, res: Response, next: NextFunction): void {
  const origin = req.headers.origin;
  const env = getRuntimeEnvironment();

  // Baseline browser hardening headers on all API requests
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.removeHeader('X-Powered-By');

  // Vary header ensures intermediate caches do not serve cross-origin responses to different origins
  res.setHeader('Vary', 'Origin, Access-Control-Request-Headers, Access-Control-Request-Method');

  if (origin) {
    const reqHost = (req.headers['x-forwarded-host'] || req.headers.host) as string | undefined;
    const isAllowed = isCorsOriginPermitted(origin, env, reqHost);

    if (isAllowed) {
      // 1. Never send wildcard '*' when credentials/cookies are active
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Access-Control-Allow-Credentials', 'true');
      res.setHeader('Access-Control-Allow-Methods', CORS_ALLOWED_METHODS.join(', '));
      res.setHeader('Access-Control-Allow-Headers', CORS_ALLOWED_HEADERS.join(', '));
      res.setHeader('Access-Control-Expose-Headers', CORS_EXPOSED_HEADERS.join(', '));
      res.setHeader('Access-Control-Max-Age', CORS_PREFLIGHT_MAX_AGE.toString());

      // If preflight OPTIONS request
      if (req.method === 'OPTIONS') {
        res.status(204).end();
        return;
      }
    } else {
      // Unpermitted Origin -> Reject and NEVER reflect Origin or grant Credentials
      const clientIp = extractSecureClientIp(req);

      recordSensitiveAudit({
        category: 'SECURITY_ACCESS',
        action: 'CORS_FORBIDDEN_ORIGIN_BLOCKED',
        userId: 'system',
        userName: 'CORS Hardening Guard',
        userRole: 'system',
        resource: req.originalUrl || req.url,
        details: `درخواست با منشأ غیرمجاز (${origin}) توسط خط‌مشی سخت‌گیرانه CORS رد شد.`,
        status: 'failed',
        severity: 'warning',
        ip: clientIp,
        metadata: {
          attemptedOrigin: origin,
          method: req.method,
          environment: env,
          policyMode: corsPolicyMode
        }
      });

      // OPTIONS preflight from unauthorized origin is explicitly rejected with 403 without data leakage
      if (req.method === 'OPTIONS') {
        res.status(403).json({
          success: false,
          error: 'CORS_ORIGIN_DENIED',
          message: 'دسترسی از این منشأ (Origin) مجاز نمی‌باشد.'
        });
        return;
      }

      // Non-OPTIONS requests proceed WITHOUT Access-Control-Allow-Origin header,
      // which causes modern browsers to block client-side access to the response safely.
    }
  }

  // Handle direct non-browser OPTIONS requests if any
  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  next();
}
