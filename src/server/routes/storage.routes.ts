import { Router } from 'express';
import { storageController } from '../controllers/storage.controller.js';
import { requireAdminAuth, optionalAuth } from '../middleware/auth.middleware.js';
import { dbBackupRateLimiter } from '../middleware/rateLimit.middleware.js';

export const storageRouter = Router();

// 1. Storage Health & Diagnostic (Public / Telemetry)
storageRouter.get('/storage/health', storageController.getHealth);

// 2. Storage Upload & File Retrieval
storageRouter.post('/storage/upload', optionalAuth, storageController.uploadFile);
storageRouter.post('/storage/upload-stream', optionalAuth, storageController.uploadStream);
storageRouter.get('/storage/files/:category/:filename', optionalAuth, storageController.getFile);
storageRouter.get('/storage/list/:category', requireAdminAuth, storageController.listCategoryFiles);
storageRouter.delete('/storage/files/:category/:filename', requireAdminAuth, storageController.deleteFile);

// 3. Backups via storage router
storageRouter.get('/storage/backups', requireAdminAuth, storageController.listBackups);
storageRouter.post('/storage/backups', dbBackupRateLimiter, requireAdminAuth, storageController.createBackup);
storageRouter.post('/storage/backups/:backupId/restore', dbBackupRateLimiter, requireAdminAuth, storageController.restoreBackup);
