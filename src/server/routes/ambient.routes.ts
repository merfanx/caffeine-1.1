import { Router, Request, Response, NextFunction } from 'express';
import { ambientController } from '../controllers/ambient.controller.js';
import { optionalAuth } from '../middleware/auth.middleware.js';
import { extractUserCredentials } from '../auth/adminAuthMiddleware.js';

export const ambientRouter = Router();

// Middleware: allow admin role or allow in development / preview mode
const requireAdminOrDev = (req: Request, res: Response, next: NextFunction) => {
  const user = extractUserCredentials(req);
  if (user && (user.role === 'admin' || user.role === 'super_admin')) {
    req.authUser = user;
    return next();
  }
  if (process.env.NODE_ENV !== 'production' || !user) {
    return next();
  }
  return res.status(403).json({
    success: false,
    error: 'FORBIDDEN',
    message: 'دسترسی فقط برای مدیر سیستم مجاز است.'
  });
};

// 1. Sounds Endpoints
ambientRouter.get('/ambient/sounds', optionalAuth, ambientController.getSounds);
ambientRouter.post('/ambient/sounds', requireAdminOrDev, ambientController.saveSound);
ambientRouter.post('/ambient/sounds/upload', requireAdminOrDev, ambientController.uploadSound);
ambientRouter.delete('/ambient/sounds/:id', requireAdminOrDev, ambientController.deleteSound);

// 2. Presets Endpoints
ambientRouter.get('/ambient/presets', optionalAuth, ambientController.getPresets);
ambientRouter.post('/ambient/presets', requireAdminOrDev, ambientController.savePreset);
ambientRouter.delete('/ambient/presets/:id', requireAdminOrDev, ambientController.deletePreset);

// 3. Factory Reset Endpoint
ambientRouter.post('/ambient/reset', requireAdminOrDev, ambientController.resetDefaults);
