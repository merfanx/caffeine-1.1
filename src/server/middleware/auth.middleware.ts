import { Request, Response, NextFunction } from 'express';
import {
  extractUserCredentials,
  requireAuth as coreRequireAuth,
  requireRole as coreRequireRole,
  requireAdminAuth as coreRequireAdminAuth,
  AuthenticatedUserContext
} from '../auth/adminAuthMiddleware.js';

export function optionalAuth(req: Request, res: Response, next: NextFunction): void {
  const user = extractUserCredentials(req);
  if (user) {
    req.authUser = user;
    req.user = user;
  }
  next();
}

export const requireAuth = coreRequireAuth;
export const requireRole = coreRequireRole;
export const requireAdminAuth = coreRequireAdminAuth;

export type { AuthenticatedUserContext };
