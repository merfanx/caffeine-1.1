import express, { Express, Request, Response, NextFunction } from 'express';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import { apiRouter } from './routes/index.js';
import {
  helmetSecurityMiddleware,
  smartCorsMiddleware,
  expressSanitizationMiddleware,
  sensitivePathBlockMiddleware
} from './middleware/security.middleware.js';
import { generalApiRateLimiter } from './middleware/rateLimit.middleware.js';
import { errorHandler, notFoundHandler } from './middleware/error.middleware.js';
import { getAiState } from './services/aiService.js';
import { getGemini } from './services/aiService.js';

export function createApp(): Express {
  const app = express();

  // 1. Trust proxy for Cloud Run and reverse proxies
  app.set('trust proxy', 1);

  // 2. High Performance Compression
  app.use(
    compression({
      level: 6,
      threshold: 1024,
      filter: (req, res) => {
        if (req.headers['x-no-compression']) return false;
        return compression.filter(req, res);
      }
    })
  );

  // 3. Cookie & Body Parsing (Supports attachments and data backups)
  app.use(cookieParser());
  app.use(express.json({ limit: '25mb' }));
  app.use(express.urlencoded({ extended: true, limit: '25mb' }));

  // 4. Security Headers & CORS Layer
  app.use(smartCorsMiddleware);
  app.use(helmetSecurityMiddleware);
  app.use(sensitivePathBlockMiddleware);
  app.use(expressSanitizationMiddleware);

  // 5. Global Logging / Request Audit Hook
  app.use((req: Request, res: Response, next: NextFunction) => {
    // Standard request tracking
    next();
  });

  // 6. Base Health & System Endpoints
  app.get('/api/health', (req: Request, res: Response) => {
    res.json({
      status: 'ok',
      service: 'Caffeine Academic OS Server',
      uptime: process.uptime(),
      timestamp: new Date().toISOString()
    });
  });

  app.get('/api/v1/health', (req: Request, res: Response) => {
    res.json({
      status: 'ok',
      service: 'Caffeine Academic OS Server v1',
      uptime: process.uptime(),
      timestamp: new Date().toISOString()
    });
  });

  app.get('/api/v1/system/status', (req: Request, res: Response) => {
    const aiState = getAiState();
    res.json({
      online: true,
      hasGeminiApiKey: aiState.hasApiKey,
      aiState,
      mode: process.env.NODE_ENV || 'development',
      nodeVersion: process.version,
      memoryUsage: process.memoryUsage(),
      timestamp: new Date().toISOString()
    });
  });

  app.get('/api/v1/docs', (req: Request, res: Response) => {
    res.json({
      service: 'Caffeine Academic OS API v1',
      version: '2.1.0',
      status: 'active',
      modules: [
        'auth',
        'student',
        'advisor',
        'exam',
        'ai',
        'crm',
        'email',
        'backup',
        'security',
        'chat',
        'toolboxDatabase'
      ]
    });
  });

  // 7. General API Rate Limiting for /api/
  app.use('/api/', generalApiRateLimiter);

  // 8. Mount Full Modular API Routes under both /api/v1 and /api (for maximum backward compatibility)
  app.use('/api/v1', apiRouter);
  app.use('/api', apiRouter);

  // 9. API 404 handler (matches any unhandled /api/* route)
  app.use('/api/*', (req: Request, res: Response) => {
    res.status(404).json({
      success: false,
      error: 'NOT_FOUND',
      message: `مسیر درخواستی «${req.method} ${req.originalUrl || req.url}» در API سرور یافت نشد.`
    });
  });

  // 10. Global Error Handler
  app.use(errorHandler);

  return app;
}
