import { Router } from 'express';
import { backupController } from '../controllers/backup.controller.js';
import { requireAdminAuth } from '../middleware/auth.middleware.js';
import { dbBackupRateLimiter } from '../middleware/rateLimit.middleware.js';

export const backupRouter = Router();

// DB Status (Public health / telemetry)
backupRouter.get('/db/status', backupController.getDbStatus);

// Raw Export & Restore (Admin Only)
backupRouter.get('/db/export', dbBackupRateLimiter, requireAdminAuth, backupController.exportDb);
backupRouter.post('/db/restore', dbBackupRateLimiter, requireAdminAuth, backupController.restoreDb);

// Backup Manager (Admin Only)
backupRouter.post('/admin/backup/create', dbBackupRateLimiter, requireAdminAuth, backupController.triggerBackup);
backupRouter.get('/admin/backup/list', requireAdminAuth, backupController.listBackups);
backupRouter.get('/admin/backup/schedule', requireAdminAuth, backupController.getBackupConfig);
backupRouter.post('/admin/backup/schedule', requireAdminAuth, backupController.updateBackupConfig);
