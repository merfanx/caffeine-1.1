import { Router } from 'express';
import { emailController } from '../controllers/email.controller.js';
import { requireAuth, requireAdminAuth } from '../middleware/auth.middleware.js';
import { formSubmissionRateLimiter } from '../middleware/rateLimit.middleware.js';

export const emailRouter = Router();

// Public & Student Endpoints
emailRouter.post('/email/assessment-report', formSubmissionRateLimiter, emailController.sendAssessmentReport);
emailRouter.post('/email/study-plan', requireAuth, emailController.sendStudyPlan);
emailRouter.post('/email/report-card', requireAuth, emailController.sendReportCard);
emailRouter.post('/email/send-welcome', requireAuth, emailController.sendWelcome);

// Admin & Settings Endpoints
emailRouter.get('/settings/email', requireAdminAuth, emailController.getSettings);
emailRouter.post('/settings/email', requireAdminAuth, emailController.updateSettings);
emailRouter.post('/settings/email/test', formSubmissionRateLimiter, requireAdminAuth, emailController.testEmail);
emailRouter.get('/email/logs', requireAdminAuth, emailController.getLogs);
emailRouter.post('/email/broadcast', requireAdminAuth, emailController.sendBroadcast);
emailRouter.post('/email/send', requireAdminAuth, emailController.sendGenericEmail);
