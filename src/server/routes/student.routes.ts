import { Router } from 'express';
import { studentController } from '../controllers/student.controller.js';
import { requireAuth, requireRole, optionalAuth } from '../middleware/auth.middleware.js';
import { formSubmissionRateLimiter } from '../middleware/rateLimit.middleware.js';

export const studentRouter = Router();

// Tools
studentRouter.post('/tools/rank-estimator', formSubmissionRateLimiter, studentController.rankEstimatorTool);
studentRouter.post('/tools/gpa-impact', formSubmissionRateLimiter, studentController.gpaImpactTool);
studentRouter.post('/tools/study-planner', formSubmissionRateLimiter, studentController.studyPlannerTool);

// Assessment
studentRouter.post('/assessment/submit', formSubmissionRateLimiter, studentController.submitAssessment);

// Daily Reports
studentRouter.post('/student/daily-report', formSubmissionRateLimiter, requireAuth, studentController.submitDailyReport);
studentRouter.post('/student/daily-reports', formSubmissionRateLimiter, requireAuth, studentController.submitDailyReport);
studentRouter.post('/student/daily-report/feedback', requireRole('admin', 'advisor'), studentController.submitDailyReportFeedback);
studentRouter.get('/student/daily-reports', requireAuth, studentController.getDailyReports);
studentRouter.get('/student/daily-report', requireAuth, studentController.getDailyReports);

// Weekly Study Plans (Coffee Plan)
studentRouter.get('/student/study-plan', requireAuth, studentController.getStudyPlan);
studentRouter.get('/student/study-plans', requireAuth, studentController.getStudyPlan);
studentRouter.post('/student/study-plan', requireAuth, studentController.saveStudyPlan);
studentRouter.post('/student/study-plans', requireAuth, studentController.saveStudyPlan);

// Student Profile
studentRouter.get('/student/dashboard-summary', optionalAuth, studentController.getDashboardSummary);
studentRouter.get('/student/profile/:id', requireAuth, studentController.getProfile);
studentRouter.post('/user/profile', requireAuth, studentController.updateProfile);

// Avatars
studentRouter.get('/avatars', studentController.getAvatars);
studentRouter.post('/admin/avatars', requireRole('admin'), studentController.updateAvatars);
studentRouter.post('/admin/avatars/reset', requireRole('admin'), studentController.resetAvatars);
studentRouter.post('/admin/grant-medal', requireRole('admin', 'advisor'), studentController.grantMedal);
studentRouter.post('/student/purchase-barista-avatar', optionalAuth, studentController.purchaseBaristaAvatar);

// Monthly Reports
studentRouter.get('/student/monthly-reports', studentController.getMonthlyReports);
studentRouter.post('/student/monthly-reports', requireRole('admin', 'advisor'), studentController.saveMonthlyReport);
