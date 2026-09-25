import { Request, Response } from 'express';
import { db } from '../storage/dbBridge.js';
import { extractUserCredentials } from '../auth/adminAuthMiddleware.js';
import { authorizeStudentAccess } from '../security/studentAuthorizationService.js';
import { normalizeId } from '../security/bolaIdorService.js';
import { examRepository } from '../repositories/examRepository.js';
import { PRELOADED_SAMPLE_EXAMS } from '../../services/examService.js';
import { INITIAL_QUESTION_BANK } from '../../services/questionBankService.js';
import { INITIAL_ARTICLES } from '../../services/magazineService.js';

const COL_EXAMS = 'exams';
const COL_EXAM_RESULTS = 'exam_results';
const COL_QUESTIONS = 'questions';
const COL_QUESTION_REPORTS = 'question_reports';
const COL_ARTICLES = 'magazine_articles';

export const examController = {
  // 1. Get Exams Catalog
  getExams(req: Request, res: Response) {
    try {
      const exams = db.find(COL_EXAMS, undefined, PRELOADED_SAMPLE_EXAMS);
      res.json({ success: true, count: exams.length, exams });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  },

  // 2. Create / Update Exam
  saveExam(req: Request, res: Response) {
    try {
      const exam = req.body;
      if (!exam || !exam.title) {
        res.status(400).json({ success: false, message: 'عنوان آزمون الزامی است.' });
        return;
      }
      const saved = db.insert(COL_EXAMS, exam, PRELOADED_SAMPLE_EXAMS);
      res.json({ success: true, exam: saved });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  },

  // 3. Get Scoped Exam Results (Strict BOLA / IDOR Verification)
  async getExamResults(req: Request, res: Response) {
    try {
      const user = extractUserCredentials(req);
      if (!user) {
        res.status(401).json({
          success: false,
          error: 'UNAUTHORIZED_401',
          message: 'احراز هویت الزامی است. مشاهده نتایج آزمون‌ها نیازمند ورود به حساب است.'
        });
        return;
      }

      const requestedStudentId = (req.query.studentId as string) || (user.studentId || user.userId || user.id || 'std-101');
      const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 50));
      const offset = Math.max(0, parseInt(req.query.offset as string) || 0);
      const sortBy = (req.query.sortBy as string) === 'score' ? 'score' : 'completedAt';
      const sortOrder = (req.query.sortOrder as string) === 'asc' ? 'asc' : 'desc';
      const examId = req.query.examId ? String(req.query.examId) : undefined;

      const authResult = await authorizeStudentAccess(user, requestedStudentId, {
        req,
        resourceName: `/api/v1/exams/results?studentId=${requestedStudentId}`
      });

      if (!authResult.authorized) {
        res.status(authResult.statusCode).json({
          success: false,
          error: authResult.error || 'FORBIDDEN_IDOR_403',
          message: authResult.message || 'عدم دسترسی: شما مجاز به مشاهده کارنامه آزمون سایر داوطلبان نیستید.'
        });
        return;
      }

      const results = await examRepository.findScopedExamResults({
        user,
        studentId: requestedStudentId,
        examId,
        limit,
        offset,
        sortBy,
        sortOrder
      });

      const normTarget = normalizeId(requestedStudentId);
      const sanitizedResults = Array.isArray(results)
        ? results.filter((r: any) => normalizeId(r.studentId) === normTarget)
        : [];

      res.json({
        success: true,
        count: sanitizedResults.length,
        scope: authResult.scope,
        pagination: { limit, offset },
        results: sanitizedResults
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  },

  // 4. Get Single Exam Result by ID
  async getExamResultById(req: Request, res: Response) {
    try {
      const user = extractUserCredentials(req);
      if (!user) {
        res.status(401).json({
          success: false,
          error: 'UNAUTHORIZED_401',
          message: 'احراز هویت الزامی است.'
        });
        return;
      }

      const { id } = req.params;
      const result = await examRepository.findExamResultById(id, user);

      if (!result) {
        res.status(403).json({
          success: false,
          error: 'FORBIDDEN_IDOR_403',
          message: 'عدم دسترسی: شما مجاز به مشاهده جزئیات این آزمون نیستید.'
        });
        return;
      }

      res.json({ success: true, result });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  },

  // 5. Submit Exam Result
  submitExamResult(req: Request, res: Response) {
    try {
      const authUser = req.authUser;
      const result = { ...req.body };

      if (authUser && authUser.role === 'student') {
        result.studentId = authUser.studentId || authUser.userId || authUser.id;
      } else if (!authUser) {
        result.studentId = `guest-${Date.now()}`;
      }

      const saved = db.insert(COL_EXAM_RESULTS, result, []);
      res.json({ success: true, result: saved });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  },

  // 6. Question Bank
  getQuestions(req: Request, res: Response) {
    try {
      const { subject, group, difficulty } = req.query;
      let questions = db.find(COL_QUESTIONS, undefined, INITIAL_QUESTION_BANK);
      if (subject && subject !== 'all') {
        questions = questions.filter((q: any) => q.subject === subject);
      }
      if (group && group !== 'all') {
        questions = questions.filter((q: any) => q.group === group);
      }
      if (difficulty && difficulty !== 'all') {
        questions = questions.filter((q: any) => q.difficulty === difficulty);
      }
      res.json({ success: true, count: questions.length, questions });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  },

  batchInsertQuestions(req: Request, res: Response) {
    try {
      const { questions = [] } = req.body;
      if (!Array.isArray(questions) || questions.length === 0) {
        res.status(400).json({ success: false, message: 'لیست سوالات نامعتبر است.' });
        return;
      }
      const inserted = db.insertMany(COL_QUESTIONS, questions, INITIAL_QUESTION_BANK);
      res.json({ success: true, count: inserted.length, inserted });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  },

  // Update a question in the bank
  updateQuestion(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updatedData = req.body;
      if (!id || !updatedData) {
        res.status(400).json({ success: false, message: 'شناسه و اطلاعات سوال الزامی است.' });
        return;
      }

      const existing = db.findById(COL_QUESTIONS, id, INITIAL_QUESTION_BANK);
      let saved;
      if (existing) {
        saved = db.update(COL_QUESTIONS, id, { ...existing, ...updatedData }, INITIAL_QUESTION_BANK);
      } else {
        saved = db.insert(COL_QUESTIONS, { ...updatedData, id }, INITIAL_QUESTION_BANK);
      }

      // If there was a report associated with this question, optionally resolve it
      if (req.body.resolveReportId) {
        db.update(COL_QUESTION_REPORTS, req.body.resolveReportId, {
          status: 'resolved',
          resolvedAt: new Date().toISOString(),
          resolvedBy: req.authUser?.name || 'مدیر سیستم'
        }, []);
      }

      res.json({ success: true, question: saved });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  },

  // 6.2 Question Reporting System (Student & Admin)
  reportQuestion(req: Request, res: Response) {
    try {
      const {
        questionId,
        studentName = 'دانش‌آموز',
        studentId,
        reason = 'other',
        reasonLabel = 'سایر اشکالات',
        description = '',
        questionSnapshot,
        attachmentImageUrl,
        attachmentImageName,
        attachmentImageSize
      } = req.body;

      if (!questionId) {
        res.status(400).json({ success: false, message: 'شناسه سوال الزامی است.' });
        return;
      }

      const report = {
        id: `qrep-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        questionId,
        studentId: studentId || req.authUser?.id || req.authUser?.studentId || 'std-guest',
        studentName: req.authUser?.name || studentName,
        reason,
        reasonLabel,
        description: String(description || '').trim(),
        attachmentImageUrl: attachmentImageUrl || undefined,
        attachmentImageName: attachmentImageName || undefined,
        attachmentImageSize: attachmentImageSize ? Number(attachmentImageSize) : undefined,
        status: 'pending',
        reportedAt: new Date().toISOString(),
        questionSnapshot: questionSnapshot || null
      };

      const saved = db.insert(COL_QUESTION_REPORTS, report, []);
      res.json({ success: true, report: saved, message: 'گزارش با موفقیت ثبت شد و برای بررسی مدیر ارسال گردید.' });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  },

  getQuestionReports(req: Request, res: Response) {
    try {
      const { status, questionId } = req.query;
      let reports = db.find(COL_QUESTION_REPORTS, undefined, []);
      if (status && status !== 'all') {
        reports = reports.filter((r: any) => r.status === status);
      }
      if (questionId) {
        reports = reports.filter((r: any) => r.questionId === questionId);
      }
      reports.sort((a: any, b: any) => new Date(b.reportedAt).getTime() - new Date(a.reportedAt).getTime());
      res.json({ success: true, count: reports.length, reports });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  },

  updateQuestionReport(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status, adminNote } = req.body;
      if (!id) {
        res.status(400).json({ success: false, message: 'شناسه گزارش الزامی است.' });
        return;
      }

      const existing = db.findById(COL_QUESTION_REPORTS, id, []);
      if (!existing) {
        res.status(404).json({ success: false, message: 'گزارش مورد نظر یافت نشد.' });
        return;
      }

      const updated = db.update(COL_QUESTION_REPORTS, id, {
        ...existing,
        status: status || existing.status,
        adminNote: adminNote !== undefined ? adminNote : existing.adminNote,
        resolvedAt: status === 'resolved' ? new Date().toISOString() : existing.resolvedAt,
        resolvedBy: req.authUser?.name || 'مدیر سیستم'
      }, []);

      res.json({ success: true, report: updated });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  },

  // 7. Magazine Articles
  getArticles(req: Request, res: Response) {
    try {
      const { category, targetGroup } = req.query;
      let articles = db.find(COL_ARTICLES, undefined, INITIAL_ARTICLES);
      if (category && category !== 'all') {
        articles = articles.filter((a: any) => a.category === category);
      }
      if (targetGroup && targetGroup !== 'all') {
        articles = articles.filter((a: any) => a.targetGroup === targetGroup || a.targetGroup === 'all');
      }
      res.json({ success: true, count: articles.length, articles });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  },

  saveArticle(req: Request, res: Response) {
    try {
      const article = req.body;
      if (!article || !article.title) {
        res.status(400).json({ success: false, message: 'عنوان مقاله الزامی است.' });
        return;
      }
      const existing = article.id ? db.findById(COL_ARTICLES, article.id, INITIAL_ARTICLES) : null;
      let saved;
      if (existing) {
        saved = db.update(COL_ARTICLES, article.id, article, INITIAL_ARTICLES);
      } else {
        saved = db.insert(COL_ARTICLES, article, INITIAL_ARTICLES);
      }
      res.json({ success: true, article: saved });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }
};
