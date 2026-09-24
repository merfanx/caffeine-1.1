import { Router } from 'express';
import { examController } from '../controllers/exam.controller.js';
import { optionalAuth, requireRole } from '../middleware/auth.middleware.js';

export const examRouter = Router();

// Exams Catalog & Results
examRouter.get('/exams', examController.getExams);
examRouter.post('/exams', requireRole('admin', 'advisor'), examController.saveExam);
examRouter.get('/exams/results', examController.getExamResults);
examRouter.get('/exams/results/:id', examController.getExamResultById);
examRouter.post('/exams/results', optionalAuth, examController.submitExamResult);

// Question Bank & Reports
examRouter.get('/questions', examController.getQuestions);
examRouter.get('/exams/questions', examController.getQuestions);
examRouter.put('/questions/:id', examController.updateQuestion);
examRouter.put('/exams/questions/:id', examController.updateQuestion);
examRouter.post('/questions/batch', requireRole('admin', 'advisor'), examController.batchInsertQuestions);
examRouter.post('/questions/report', optionalAuth, examController.reportQuestion);
examRouter.post('/exams/questions/report', optionalAuth, examController.reportQuestion);
examRouter.get('/questions/reports', examController.getQuestionReports);
examRouter.get('/exams/questions/reports', examController.getQuestionReports);
examRouter.put('/questions/reports/:id', examController.updateQuestionReport);
examRouter.put('/exams/questions/reports/:id', examController.updateQuestionReport);

// Magazine Articles
examRouter.get('/magazine/articles', examController.getArticles);
examRouter.post('/magazine/articles', requireRole('admin', 'advisor'), examController.saveArticle);
