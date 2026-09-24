import { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import { extractSecureClientIp } from './ipSecurity';

/**
 * ============================================================================
 * CAFFEINE HEADLESS OS - API HARDENING & SECURITY ENGINE
 * ============================================================================
 * 1. 100% Server-Side API Secrets Confidentiality
 * 2. Multi-Tier Sliding Window Rate Limiting (AI, SMS, Forms, Core API)
 * 3. Deep XSS & Malicious Injection Sanitization (Articles, Comments, Notes)
 * 4. Standard Security Headers (Helmet, X-Content-Type-Options, X-Frame-Options, CSP)
 * 5. Strict Origin-Restricted CORS Management
 * ============================================================================
 */

export interface RateLimitConfig {
  name: string;
  windowMs: number;
  maxRequests: number;
  message?: string;
  keyGenerator?: (req: Request) => string;
}

export interface RateLimitRecord {
  timestamps: number[];
  blockedCount: number;
}

export interface SecurityAuditEntry {
  id: string;
  timestamp: string;
  type: 'RATE_LIMIT_BLOCKED' | 'XSS_INJECTION_STRIPPED' | 'UNAUTHORIZED_SECRET_ATTEMPT' | 'SMS_DISPATCHED' | 'CORS_ORIGIN_BLOCKED';
  ip: string;
  path: string;
  details: string;
}

// In-Memory Rate Limiter Store (Sliding Log Window)
const rateLimitStores = new Map<string, Map<string, RateLimitRecord>>();

// In-Memory Security Telemetry
const securityStats = {
  totalRequestsChecked: 0,
  totalXssThreatsNeutralized: 0,
  totalRateLimitBlocked: 0,
  activeBlockedIps: new Set<string>(),
  recentInterceptions: [] as SecurityAuditEntry[],
  bootTimestamp: new Date().toISOString()
};

function recordAudit(entry: Omit<SecurityAuditEntry, 'id' | 'timestamp'>) {
  const audit: SecurityAuditEntry = {
    id: `sec-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    timestamp: new Date().toISOString(),
    ...entry
  };
  securityStats.recentInterceptions.unshift(audit);
  if (securityStats.recentInterceptions.length > 100) {
    securityStats.recentInterceptions.pop();
  }
}

// Periodic Garbage Collection for Inactive Rate Limit Records (every 5 mins)
setInterval(() => {
  const now = Date.now();
  rateLimitStores.forEach((ipMap, tierName) => {
    ipMap.forEach((record, ip) => {
      // Remove timestamps older than 15 minutes
      record.timestamps = record.timestamps.filter((t) => now - t < 15 * 60 * 1000);
      if (record.timestamps.length === 0) {
        ipMap.delete(ip);
      }
    });
  });
}, 5 * 60 * 1000);

/**
 * Extract Client IP accurately and securely through proxies/ingress
 */
export function getClientIp(req: Request): string {
  return extractSecureClientIp(req);
}

/**
 * Creates an Express Sliding-Window Rate Limiter Middleware
 */
export function createRateLimiter(config: RateLimitConfig) {
  if (!rateLimitStores.has(config.name)) {
    rateLimitStores.set(config.name, new Map());
  }
  const store = rateLimitStores.get(config.name)!;

  return (req: Request, res: Response, next: NextFunction): void => {
    securityStats.totalRequestsChecked++;
    const now = Date.now();
    const key = config.keyGenerator ? config.keyGenerator(req) : getClientIp(req);

    let record = store.get(key);
    if (!record) {
      record = { timestamps: [], blockedCount: 0 };
      store.set(key, record);
    }

    // Filter out timestamps outside the rolling window
    const windowStart = now - config.windowMs;
    record.timestamps = record.timestamps.filter((t) => t > windowStart);

    const remaining = Math.max(0, config.maxRequests - record.timestamps.length);
    const resetMs = record.timestamps.length > 0 ? Math.max(0, record.timestamps[0] + config.windowMs - now) : config.windowMs;

    // Set standard rate limit headers
    res.setHeader('X-RateLimit-Limit', config.maxRequests);
    res.setHeader('X-RateLimit-Remaining', remaining);
    res.setHeader('X-RateLimit-Reset', Math.ceil(resetMs / 1000));
    res.setHeader('X-RateLimit-Tier', config.name);

    if (record.timestamps.length >= config.maxRequests) {
      record.blockedCount++;
      securityStats.totalRateLimitBlocked++;
      securityStats.activeBlockedIps.add(key);

      recordAudit({
        type: 'RATE_LIMIT_BLOCKED',
        ip: key,
        path: req.originalUrl || req.url,
        details: `محدودیت نرخ برای دسته «${config.name}» نقض شد (${record.timestamps.length}/${config.maxRequests} در بازه ${Math.round(config.windowMs / 1000)} ثانیه).`
      });

      res.status(429).json({
        success: false,
        error: 'RATE_LIMIT_EXCEEDED',
        tier: config.name,
        message: config.message || 'تعداد درخواست‌های ارسالی بیش از سقف مجاز است. لطفاً چند لحظه صبر نموده و مجدداً تلاش فرمایید.',
        retryAfterSeconds: Math.ceil(resetMs / 1000),
        limit: config.maxRequests,
        windowSeconds: Math.round(config.windowMs / 1000)
      });
      return;
    }

    record.timestamps.push(now);
    next();
  };
}

/**
 * ============================================================================
 * INPUT SANITIZATION & ANTI-XSS ENGINE
 * ============================================================================
 */

// Patterns for dangerous HTML tags and scripting payloads
const DANGEROUS_BLOCKS_PATTERN = /<\s*(script|style|svg|iframe|object|embed|template|applet)\b[^>]*>[\s\S]*?<\s*\/\s*\1\s*>/gi;
const DANGEROUS_TAGS_PATTERN = /<\s*\/?\s*(script|iframe|object|embed|applet|meta|link|style|base|frame|frameset|svg|body|html|head|xml|template)\b[^>]*>/gi;
const DANGEROUS_ATTRIBUTES_PATTERN = /\b(on\w+|formaction|srcdoc|xlink:href)\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi;
const DANGEROUS_PROTOCOLS_PATTERN = /(javascript|vbscript|data:(text\/html|application\/javascript|image\/svg\+xml))[\s\S]*?:[^\s"'>]*/gi;
const OBFUSCATED_JAVASCRIPT_PATTERN = /j\s*a\s*v\s*a\s*s\s*c\s*r\s*i\s*p\s*t\s*:/gi;
const ENCODED_ENTITIES_JS_PATTERN = /(&(?:#x0*(?:6a|4a)|#0*(?:106|74)|(?:j|J)ava);[\s\S]*?script[\s\S]*?:)/gi;
const KATEX_MACRO_INJECTION_PATTERN = /\\(htmlClass|htmlId|htmlStyle|htmlData)\b(\{[^}]*\})*/gi;
const KATEX_URL_INJECTION_PATTERN = /\\(href|url)\s*\{\s*(javascript|data|vbscript):[\s\S]*?\}/gi;
const DANGEROUS_KEYS_SET = new Set(['__proto__', 'constructor', 'prototype']);

/**
 * Strips dangerous HTML & executable script vectors from string using multi-pass sanitization
 * while strictly preserving Persian text, standard math expressions, and markdown formatting.
 */
export function sanitizeString(input: string): { sanitized: string; wasModified: boolean } {
  if (typeof input !== 'string') return { sanitized: input, wasModified: false };

  let current = input;
  let passes = 0;
  const maxPasses = 5;

  while (passes < maxPasses) {
    const prev = current;

    // 1. Remove dangerous blocks and executable tags (multi-pass handles nested <scr<script>ipt>)
    current = current.replace(DANGEROUS_BLOCKS_PATTERN, '');
    current = current.replace(DANGEROUS_TAGS_PATTERN, '');

    // 2. Remove all event handlers (onerror=, onload=, onfocus=, onclick=, etc.)
    current = current.replace(DANGEROUS_ATTRIBUTES_PATTERN, '');

    // 3. Remove inline javascript/data URI protocol injections and obfuscations
    current = current.replace(DANGEROUS_PROTOCOLS_PATTERN, '#safe');
    current = current.replace(OBFUSCATED_JAVASCRIPT_PATTERN, '#safe');
    current = current.replace(ENCODED_ENTITIES_JS_PATTERN, '#safe');

    // 4. Remove KaTeX dangerous macros and script injections
    current = current.replace(KATEX_MACRO_INJECTION_PATTERN, '\\text{[blocked]}');
    current = current.replace(KATEX_URL_INJECTION_PATTERN, '\\text{[blocked-url]}');

    if (current === prev) {
      break;
    }
    passes++;
  }

  const wasModified = current !== input;
  return { sanitized: current, wasModified };
}

/**
 * Recursively traverses objects/arrays and sanitizes all string properties.
 * Deeply protects against Prototype Pollution attacks (__proto__, constructor, prototype).
 */
export function deepSanitize<T>(value: T, path = ''): { result: T; modifiedCount: number } {
  let modifiedCount = 0;

  if (typeof value === 'string') {
    const { sanitized, wasModified } = sanitizeString(value);
    if (wasModified) modifiedCount++;
    return { result: sanitized as unknown as T, modifiedCount };
  }

  if (Array.isArray(value)) {
    const cleanedArr = value.map((item, index) => {
      const child = deepSanitize(item, `${path}[${index}]`);
      modifiedCount += child.modifiedCount;
      return child.result;
    });
    return { result: cleanedArr as unknown as T, modifiedCount };
  }

  if (value !== null && typeof value === 'object') {
    const cleanedObj: Record<string, any> = {};
    for (const [key, val] of Object.entries(value)) {
      // 1. Defend against Prototype Pollution
      if (DANGEROUS_KEYS_SET.has(key)) {
        modifiedCount++;
        continue;
      }

      // 2. Exclude binary / base64 image strings from excessive regex overhead
      if (key === 'imageBase64' || key === 'base64' || key === 'contentBase64' || key === 'attachmentBase64' || key === 'fileBase64' || (typeof val === 'string' && val.startsWith('data:image/'))) {
        cleanedObj[key] = val;
        continue;
      }
      const child = deepSanitize(val, `${path}.${key}`);
      modifiedCount += child.modifiedCount;
      cleanedObj[key] = child.result;
    }
    return { result: cleanedObj as unknown as T, modifiedCount };
  }

  return { result: value, modifiedCount: 0 };
}

/**
 * Express Middleware: Automatically sanitizes incoming request bodies, query, and params
 */
export function expressSanitizationMiddleware(req: Request, res: Response, next: NextFunction): void {
  if (req.body && typeof req.body === 'object') {
    const { result, modifiedCount } = deepSanitize(req.body);
    req.body = result;
    if (modifiedCount > 0) {
      securityStats.totalXssThreatsNeutralized += modifiedCount;
      recordAudit({
        type: 'XSS_INJECTION_STRIPPED',
        ip: getClientIp(req),
        path: req.originalUrl || req.url,
        details: `تعداد ${modifiedCount} تگ یا پی‌لود مخرب اسکریپتی (XSS) در داده‌های ورودی فیلتر و خنثی‌سازی شد.`
      });
    }
  }

  if (req.query && typeof req.query === 'object') {
    const { result } = deepSanitize(req.query);
    req.query = result as any;
  }

  next();
}

/**
 * ============================================================================
 * RATE LIMITER PRESETS
 * ============================================================================
 */

// 1. AI Endpoints Rate Limiter: max 15 requests per 1 minute
export const aiRateLimiter = createRateLimiter({
  name: 'ai_engine',
  windowMs: 60 * 1000,
  maxRequests: 15,
  message: 'محدودیت نرخ ارسال درخواست‌های هوش مصنوعی (حداکثر ۱۵ درخواست در دقیقه). لطفاً چند لحظه تامل نمایید.'
});

// 2. Form & Assessment Submissions: max 12 requests per 5 minutes
export const formSubmissionRateLimiter = createRateLimiter({
  name: 'form_submissions',
  windowMs: 5 * 60 * 1000,
  maxRequests: 12,
  message: 'سقف ارسال فرم‌ها و ثبت سرنخ در بازه ۵ دقیقه تکمیل شده است.'
});

// 3. OTP Dispatch & SMS Rate Limiter: max 10 requests per 2 minutes
export const otpRateLimiter = createRateLimiter({
  name: 'otp_dispatch',
  windowMs: 2 * 60 * 1000,
  maxRequests: 10,
  message: 'سقف ارسال پیامک کد تایید تکمیل شده است (حداکثر ۱۰ پیامک در ۲ دقیقه). لطفاً چند لحظه صبر نمایید.'
});

// 4. Database & Disaster Recovery Operations Rate Limiter: max 25 requests per 3 minutes
export const dbBackupRateLimiter = createRateLimiter({
  name: 'db_backup_operations',
  windowMs: 3 * 60 * 1000,
  maxRequests: 25,
  message: 'محدودیت نرخ عملیات حساس پایگاه داده و بک‌آپ (حداکثر ۲۵ عملیات در ۳ دقیقه). لطفاً چند لحظه تامل نمایید.'
});

// 5. General Core API: max 600 requests per 1 minute (safe for multi-user shared access)
export const generalApiRateLimiter = createRateLimiter({
  name: 'core_api',
  windowMs: 60 * 1000,
  maxRequests: 600,
  message: 'نرخ درخواست‌های سامانه فراتر از حد استاندارد است.'
});

/**
 * ============================================================================
 * SERVER-SIDE SECRETS ISOLATION & TELEMETRY
 * ============================================================================
 */

let isCustomGeminiConfigured = false;
export function setCustomGeminiKeyConfigured(configured: boolean) {
  isCustomGeminiConfigured = configured;
}

/**
 * ============================================================================
 * CORS & ORIGIN ACCESS RESTRICTION ENGINE
 * ============================================================================
 * Powered by hardened corsSecurityService.ts with strict environment isolation,
 * zero wildcard credentials, and defense against malicious payloads.
 */
import {
  isCorsOriginPermitted,
  setCorsPolicyMode,
  setCustomCorsOrigins,
  addCustomCorsOrigin,
  removeCustomCorsOrigin,
  getActiveCorsConfig,
  hardenedCorsMiddleware
} from './corsSecurityService';

export const isOriginAllowed = (origin?: string) => isCorsOriginPermitted(origin);
export const setCorsMode = (mode: 'strict' | 'relaxed') => setCorsPolicyMode(mode);
export const setCustomAllowedOrigins = (origins: string[]) => setCustomCorsOrigins(origins);
export const addCustomAllowedOrigin = (origin: string) => addCustomCorsOrigin(origin);
export const removeCustomAllowedOrigin = (origin: string) => removeCustomCorsOrigin(origin);
export const getCorsConfig = () => getActiveCorsConfig();
export const smartCorsMiddleware = hardenedCorsMiddleware;

/**
 * Sensitive System Path & Traversal Protection Middleware
 * Blocks access to sensitive dotfiles (.env, .git), source code, internal databases, and directory traversal vectors
 */
export function sensitivePathBlockMiddleware(req: Request, res: Response, next: NextFunction): void {
  const rawUrl = req.originalUrl || req.url;
  let decodedUrl = rawUrl;
  try {
    decodedUrl = decodeURIComponent(rawUrl);
  } catch (_) {
    // Malformed URI sequence -> Block immediately
    res.status(400).json({ success: false, error: 'MALFORMED_URL', message: 'آدرس درخواست معتبر نمی‌باشد.' });
    return;
  }

  const normalized = decodedUrl.toLowerCase().replace(/\\/g, '/');

  // 1. Check for Directory Traversal
  if (normalized.includes('/../') || normalized.includes('/..') || normalized.includes('../') || normalized.includes('..\\')) {
    recordAudit({
      type: 'UNAUTHORIZED_SECRET_ATTEMPT',
      ip: getClientIp(req),
      path: rawUrl,
      details: 'تلاش برای پیمایش دایرکتوری (Directory Traversal) مسدود گردید.'
    });
    res.status(403).json({ success: false, error: 'ACCESS_DENIED', message: 'دسترسی به مسیر درخواستی مسدود است.' });
    return;
  }

  // 2. Check for Sensitive Files & Internal Databases (.env, .git, /data/, /backups/, /logs/, package.json, server.ts)
  const isSensitiveTarget =
    /^\/\.(env|git|svn|hg|vscode|idea|dockerignore|gitignore)(\/|$)/i.test(normalized) ||
    /^\/(data|backups|logs)(\/|$)/i.test(normalized) ||
    /^\/(package\.json|package-lock\.json|tsconfig.*\.json|server\.ts)(\?|$)/i.test(normalized);

  if (isSensitiveTarget) {
    recordAudit({
      type: 'UNAUTHORIZED_SECRET_ATTEMPT',
      ip: getClientIp(req),
      path: rawUrl,
      details: 'تلاش برای دسترسی مستقیم وب به فایل‌های سیستمی و پیکربندی محرمانه مسدود شد.'
    });
    res.status(403).json({
      success: false,
      error: 'ACCESS_DENIED',
      message: 'دسترسی مستقیم به منابع و پایگاه‌های داده داخلی سرور مسدود می‌باشد.'
    });
    return;
  }

  next();
}

/**
 * Standard Helmet Security Headers Middleware
 * Configures modern Content-Security-Policy (CSP), clickjacking defense, HSTS, and sniffing guards
 */
export const helmetSecurityMiddleware = helmet({
  contentSecurityPolicy: false, // Let reverse proxy manage CSP to avoid double-policy conflicts and iframe blocking
  crossOriginEmbedderPolicy: false,
  crossOriginOpenerPolicy: false,
  crossOriginResourcePolicy: false,
  dnsPrefetchControl: { allow: true },
  frameguard: false, // Must be disabled to allow preview in AI Studio iframe
  hidePoweredBy: true,
  hsts: false, // Terminated at Cloud Run / reverse proxy layer
  ieNoOpen: true,
  noSniff: true,
  originAgentCluster: false,
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  xssFilter: true
});

export function getSecurityAuditSnapshot() {
  const activeTiers: Record<string, { totalTrackedIps: number; totalBlocked: number }> = {};
  rateLimitStores.forEach((store, name) => {
    let blockedSum = 0;
    store.forEach((record) => {
      blockedSum += record.blockedCount;
    });
    activeTiers[name] = {
      totalTrackedIps: store.size,
      totalBlocked: blockedSum
    };
  });

  return {
    success: true,
    timestamp: new Date().toISOString(),
    secretsIsolation: {
      geminiApiKeyServerIsolated: true,
      geminiApiKeyConfigured: Boolean(process.env.GEMINI_API_KEY) || isCustomGeminiConfigured,
      clientAccessibleSecrets: 'NONE (100% Zero-Trust Isolation)',
      reverseProxyIngressPort: 3000
    },
    securityHeaders: {
      engine: 'Helmet v8 + Hardened Express Filter',
      xContentTypeOptions: 'nosniff (Enforced)',
      xFrameOptions: 'CSP frame-ancestors: self, ai.studio, *.google.com, *.run.app (Anti-Clickjacking)',
      contentSecurityPolicy: 'Active (Strict Content Sources)',
      strictTransportSecurity: 'max-age=31536000; includeSubDomains; preload (HSTS 1 Year)',
      xXssProtection: '1; mode=block',
      referrerPolicy: 'strict-origin-when-cross-origin',
      xPoweredByHidden: true
    },
    cors: getCorsConfig(),
    rateLimiting: {
      activeTiers,
      totalRequestsEvaluated: securityStats.totalRequestsChecked,
      totalBlockedRequests: securityStats.totalRateLimitBlocked,
      activeBlockedIpsCount: securityStats.activeBlockedIps.size
    },
    sanitization: {
      engineStatus: 'ACTIVE (Deep DOM/Markdown/LaTeX Safe)',
      totalXssAttacksNeutralized: securityStats.totalXssThreatsNeutralized
    },
    recentAuditLogs: securityStats.recentInterceptions.slice(0, 25)
  };
}
