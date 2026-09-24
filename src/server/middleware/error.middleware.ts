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

  const statusCode = typeof err.statusCode === 'number' ? err.statusCode : 500;
  const message = err.message || 'یک خطای غیرمنتظره در پردازش درخواست سمت سرور رخ داد.';

  res.status(statusCode).json({
    success: false,
    error: err.code || 'INTERNAL_SERVER_ERROR',
    message
  });
}

export const globalErrorHandler = errorHandler;
