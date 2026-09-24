import { Router } from 'express';
import { advisorController } from '../controllers/advisor.controller.js';
import { requireRole } from '../middleware/auth.middleware.js';
import { aiRateLimiter } from '../middleware/rateLimit.middleware.js';

export const advisorRouter = Router();

// Public / Authenticated Advisor routes
advisorRouter.get('/advisors', advisorController.getAdvisors);
advisorRouter.get('/advisor/students', requireRole('admin', 'advisor'), advisorController.getAssignedStudents);
advisorRouter.get('/advisor/students-at-risk', requireRole('admin', 'advisor'), advisorController.getStudentsAtRisk);
advisorRouter.post('/advisor/copilot/draft-feedback', aiRateLimiter, requireRole('admin', 'advisor'), advisorController.draftFeedback);
advisorRouter.post('/admin/assign-advisor', requireRole('admin'), advisorController.assignAdvisor);
