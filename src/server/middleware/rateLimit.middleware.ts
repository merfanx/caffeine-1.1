import { Request, Response, NextFunction } from 'express';

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

const limitStore = new Map<string, RateLimitRecord>();

function createRateLimiter(maxRequests: number, windowMs: number, errorMessage: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    const rawIp = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || 'unknown';
    const ip = rawIp.split(',')[0].trim();

    if (ip === '127.0.0.1' || ip === '::1' || ip === 'localhost') {
      return next();
    }

    const key = `${req.path}:${ip}`;
    const now = Date.now();

    const record = limitStore.get(key);

    if (!record || now > record.resetTime) {
      limitStore.set(key, { count: 1, resetTime: now + windowMs });
      return next();
    }

    record.count++;
    if (record.count > maxRequests) {
      return res.status(429).json({
        error: errorMessage,
        retryAfterSeconds: Math.ceil((record.resetTime - now) / 1000)
      });
    }

    next();
  };
}

export const generalApiRateLimiter = createRateLimiter(
  1000,
  15 * 60 * 1000,
  'تعداد درخواست‌ها بیش از حد مجاز است. لطفاً کمی بعد دوباره تلاش کنید.'
);

export const aiRateLimiter = createRateLimiter(
  60,
  60 * 1000,
  'محدودیت استفاده از هوش مصنوعی فعال شده است. لطفاً چند لحظه صبر کنید.'
);

export const otpRateLimiter = createRateLimiter(
  10,
  10 * 60 * 1000,
  'تعداد دفعات درخواست کد تایید بیش از حد مجاز است.'
);

export const loginRateLimitMiddleware = createRateLimiter(
  15,
  15 * 60 * 1000,
  'تعداد دفعات تلاش ناموفق ورود بیش از حد مجاز است.'
);

export const dbBackupRateLimiter = createRateLimiter(
  20,
  60 * 1000,
  'درخواست پشتیبان‌گیری محدود شده است.'
);

export const formSubmissionRateLimiter = createRateLimiter(
  100,
  60 * 1000,
  'تعداد ارسال فرم بیش از حد مجاز است.'
);
