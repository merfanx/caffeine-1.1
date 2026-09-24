import { Router } from 'express';
import { securityController } from '../controllers/security.controller.js';
import { requireAdminAuth, requireRole } from '../middleware/auth.middleware.js';
import { formSubmissionRateLimiter, aiRateLimiter } from '../middleware/rateLimit.middleware.js';

export const securityRouter = Router();

// Security Posture & Sanitizer Sandbox
securityRouter.get('/security/status', securityController.getSecurityStatus);
securityRouter.post('/security/test-sanitizer', securityController.testSanitizer);
securityRouter.post('/security/regression/run', requireAdminAuth, securityController.runRegression);

// AI Configuration Settings (Admin Only)
securityRouter.get('/settings/ai-config', securityController.getAiConfig);
securityRouter.post('/settings/ai-config', requireAdminAuth, securityController.updateAiConfig);
securityRouter.post('/settings/ai-config/test', aiRateLimiter, requireAdminAuth, securityController.testAiConfig);

// SMS Configuration & Verification Tests (Admin Only)
securityRouter.get('/settings/sms-config', requireAdminAuth, securityController.getSmsConfig);
securityRouter.post('/settings/sms-config', requireAdminAuth, securityController.updateSmsConfig);
securityRouter.post('/settings/sms/test-verification', requireAdminAuth, securityController.testSmsVerification);
securityRouter.get('/settings/sms/credit', requireAdminAuth, securityController.getSmsCredit);
securityRouter.get('/settings/sms/lines', requireAdminAuth, securityController.getSmsLines);

// Confidential Health Records & Privacy (Admin & Assigned Advisor with Strict BOLA)
securityRouter.get('/privacy/confidential-records', requireRole('admin', 'advisor'), securityController.getConfidentialRecords);
securityRouter.post('/privacy/confidential-records', requireRole('admin', 'advisor'), securityController.createConfidentialRecord);
securityRouter.post('/privacy/test-access', securityController.testPrivacyAccess);
securityRouter.get('/privacy/audit-posture', securityController.getPrivacyAuditPosture);

// Student Comments & Reviews
securityRouter.get('/comments', securityController.getComments);
securityRouter.post('/comments', formSubmissionRateLimiter, securityController.createComment);
