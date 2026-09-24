import { Router } from 'express';
import { aiController } from '../controllers/ai.controller.js';
import { requireRole } from '../middleware/auth.middleware.js';
import { aiRateLimiter } from '../middleware/rateLimit.middleware.js';

export const aiRouter = Router();

aiRouter.get('/ai/taxonomy', aiController.getTaxonomy);
aiRouter.get('/ai/subject-prompt', aiController.getSubjectPrompt);
aiRouter.post('/ai/subject-prompt', aiController.getSubjectPrompt);
aiRouter.post('/ai/chat', aiRateLimiter, aiController.chat);
aiRouter.post('/ai/parse-questions', aiRateLimiter, aiController.parseQuestions);
aiRouter.post('/ai/solve-question', aiRateLimiter, aiController.solveQuestion);
aiRouter.post('/ai/ocr-image-to-questions', aiRateLimiter, requireRole('admin', 'advisor'), aiController.ocrImageToQuestions);
aiRouter.post('/ai/generate-question-clones', aiRateLimiter, requireRole('admin', 'advisor'), aiController.generateQuestionClones);
aiRouter.post('/ai/generate-article-draft', aiRateLimiter, requireRole('admin', 'advisor'), aiController.generateArticleDraft);
aiRouter.post('/ai/analyze-exam-analytics', aiRateLimiter, requireRole('admin', 'advisor'), aiController.analyzeExamAnalytics);

