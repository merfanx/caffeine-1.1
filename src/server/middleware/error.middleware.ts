import { Request, Response, NextFunction } from 'express';

export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({
    success: false,
    error: 'NOT_FOUND',
    message: `مسیر درخواستی «${req.method} ${req.originalUrl || req.url}» در سرور یافت نشد.`
  });
}

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  console.error('[Caffeine Server Error Handler]:', err);
  if (res.headersSent) {
    return next(err);
  }

  const statusCode = typeof err.statusCode === 'number' && err.statusCode >= 400 && err.statusCode <= 599
    ? err.statusCode
    : (typeof err.status === 'number' && err.status >= 400 && err.status <= 599 ? err.status : 500);

  // Sanitize internal error messages so server paths or SQL details never leak (M-06)
  let rawMsg = typeof err.message === 'string' ? err.message : '';
  if (rawMsg.includes('/') || rawMsg.includes('\\') || rawMsg.includes('node_modules') || rawMsg.includes('at ') || rawMsg.includes('SELECT') || rawMsg.includes('INSERT')) {
    rawMsg = 'در پردازش درخواست شما خطای سیستمی رخ داد. لطفاً مجدداً تلاش فرمایید.';
  }

  const message = rawMsg || (statusCode === 500 ? 'یک خطای غیرمنتظره در پردازش درخواست سمت سرور رخ داد.' : 'درخواست ارسال‌شده معتبر نمی‌باشد.');

  res.status(statusCode).json({
    success: false,
    error: err.code || (statusCode === 400 ? 'BAD_REQUEST' : statusCode === 401 ? 'UNAUTHORIZED' : statusCode === 403 ? 'FORBIDDEN' : statusCode === 404 ? 'NOT_FOUND' : statusCode === 429 ? 'RATE_LIMIT_EXCEEDED' : 'INTERNAL_SERVER_ERROR'),
    message
  });
}

export const globalErrorHandler = errorHandler;
