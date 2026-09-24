import { Router } from 'express';
import { toolboxDatabaseController } from '../controllers/toolboxDatabase.controller.js';
import { requireAuth, requireRole, optionalAuth } from '../middleware/auth.middleware.js';
import { formSubmissionRateLimiter } from '../middleware/rateLimit.middleware.js';

export const toolboxDatabaseRouter = Router();

// =========================================================================
// 1. YEARS MANAGEMENT
// =========================================================================
// Public read of available years
toolboxDatabaseRouter.get('/tools/database/years', toolboxDatabaseController.getYears);
// Admin management of years
toolboxDatabaseRouter.post('/tools/database/years', requireRole('admin'), formSubmissionRateLimiter, toolboxDatabaseController.createYear);
toolboxDatabaseRouter.delete('/tools/database/years/:year', requireRole('admin'), toolboxDatabaseController.deleteYear);

// =========================================================================
// 2. ADMISSION RECORDS & ACCEPTANCES (قبولی‌ها و کارنامه‌ها)
// =========================================================================
// Public read with filtering by year, group, region, quota, search, pagination
toolboxDatabaseRouter.get('/tools/database/admissions', toolboxDatabaseController.getAdmissions);

// Admin CRUD & Import
toolboxDatabaseRouter.post('/tools/database/admissions', requireRole('admin'), formSubmissionRateLimiter, toolboxDatabaseController.createAdmission);
toolboxDatabaseRouter.put('/tools/database/admissions/:id', requireRole('admin'), formSubmissionRateLimiter, toolboxDatabaseController.updateAdmission);
toolboxDatabaseRouter.delete('/tools/database/admissions/:id', requireRole('admin'), toolboxDatabaseController.deleteAdmission);
toolboxDatabaseRouter.post('/tools/database/admissions/delete-multiple', requireRole('admin'), toolboxDatabaseController.deleteMultipleAdmissions);
toolboxDatabaseRouter.post('/tools/database/admissions/bulk-delete', requireRole('admin'), toolboxDatabaseController.deleteMultipleAdmissions);
toolboxDatabaseRouter.post('/tools/database/admissions/import', requireRole('admin'), formSubmissionRateLimiter, toolboxDatabaseController.importAdmissions);

// =========================================================================
// 3. RANK & TARAZ BENCHMARKS (ضرایب، میانگین‌ها و تنظیمات تخمین تراز)
// =========================================================================
// Public read of benchmarks for client estimator
toolboxDatabaseRouter.get('/tools/database/benchmarks', toolboxDatabaseController.getBenchmarks);

// Admin update of benchmarks
toolboxDatabaseRouter.put('/tools/database/benchmarks/:year', requireRole('admin'), formSubmissionRateLimiter, toolboxDatabaseController.updateBenchmarks);

// Admin reset to defaults
toolboxDatabaseRouter.post('/tools/database/reset', requireRole('admin'), toolboxDatabaseController.resetDefaults);

// =========================================================================
// 4. SQL QUERY ENGINE & SCHEMA INTROSPECTION (پایگاه داده بر پایه SQL)
// =========================================================================
toolboxDatabaseRouter.post('/tools/database/sql/query', requireRole('admin'), formSubmissionRateLimiter, toolboxDatabaseController.executeSqlQuery);
toolboxDatabaseRouter.get('/tools/database/sql/schema', requireRole('admin'), toolboxDatabaseController.getSqlSchema);
