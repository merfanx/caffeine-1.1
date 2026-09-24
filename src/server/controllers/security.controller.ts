import { Request, Response } from 'express';
import { db } from '../storage/dbBridge.js';
import { sanitizeString, getSecurityAuditSnapshot } from '../security/apiHardening.js';
import { runSecurityRegressionSuite } from '../security/securityRegressionSuite.js';
import {
  getEffectiveApiKey,
  getActiveAiModel,
  setActiveAiConfig,
  testGeminiConnection
} from '../services/aiService.js';
import {
  getEffectiveSmsApiKey,
  getEffectiveSmsTemplateId,
  getEffectiveSmsLineNumber,
  updateSmsCredentials,
  dispatchSmsIrVerification,
  fetchSmsIrCredit,
  fetchSmsIrLines,
  normalizeIranianMobile,
  maskPhoneNumber
} from '../services/smsService.js';
import {
  seedConfidentialRecords,
  checkConfidentialHealthAccess,
  ConfidentialHealthRecord
} from '../security/confidentialHealthService.js';
import { DEFAULT_STUDENT_COMMENTS } from '../../services/commentService.js';

const COL_CONFIDENTIAL_HEALTH = 'confidential_health_records';
const COL_COMMENTS = 'student_comments';

export const securityController = {
  // 1. Security Status & Posture
  getSecurityStatus(req: Request, res: Response) {
    try {
      const snapshot = getSecurityAuditSnapshot();
      res.json(snapshot);
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  },

  // 2. Sanitizer Sandbox Test
  testSanitizer(req: Request, res: Response) {
    try {
      const { testInput } = req.body;
      if (typeof testInput !== 'string') {
        res.status(400).json({ success: false, message: 'مقدار testInput باید از نوع متنی باشد.' });
        return;
      }
      const { sanitized, wasModified } = sanitizeString(testInput);
      res.json({
        success: true,
        original: testInput,
        sanitized,
        threatDetectedAndNeutralized: wasModified,
        neutralizationType: wasModified ? 'HTML/Script vectors stripped' : 'Input clean'
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  },

  // 3. Run Security Regression Suite
  async runRegression(req: Request, res: Response) {
    try {
      const results = await runSecurityRegressionSuite();
      res.json(results);
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  },

  // 4. AI Engine Configuration
  getAiConfig(req: Request, res: Response) {
    try {
      const effectiveKey = getEffectiveApiKey();
      const model = getActiveAiModel();
      let maskedKey = '';
      if (effectiveKey) {
        maskedKey = effectiveKey.length > 8
          ? `${effectiveKey.slice(0, 4)}••••••••${effectiveKey.slice(-4)}`
          : '••••••••';
      }

      res.json({
        success: true,
        hasKey: Boolean(effectiveKey),
        maskedKey,
        model,
        provider: effectiveKey
          ? 'Google Gemini 2.5'
          : 'Caffeine Heuristic Engine (حالت پیش‌فرض بدون کلید)',
        status: effectiveKey ? 'operational' : 'fallback'
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  },

  updateAiConfig(req: Request, res: Response) {
    try {
      const { apiKey, model } = req.body;
      if (!apiKey || typeof apiKey !== 'string' || apiKey.trim().length < 8) {
        res.status(400).json({
          success: false,
          message: 'کلید وارد شده نامعتبر است. کلید API گوگل معمولاً با AIza آغاز می‌شود.'
        });
        return;
      }

      const cleanKey = apiKey.trim();
      setActiveAiConfig(cleanKey, model);

      const maskedKey = `${cleanKey.slice(0, 4)}••••••••${cleanKey.slice(-4)}`;
      res.json({
        success: true,
        message: 'کلید هوش مصنوعی با موفقیت ذخیره و در سامانه فعال شد.',
        maskedKey,
        model: model || getActiveAiModel(),
        source: 'custom'
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  },

  async testAiConfig(req: Request, res: Response) {
    try {
      const { apiKey, model } = req.body;
      const testKey = apiKey && typeof apiKey === 'string' && apiKey.trim().length > 0
        ? apiKey.trim()
        : getEffectiveApiKey();

      if (!testKey) {
        res.status(400).json({
          success: false,
          message: 'کلید API برای تست اتصال مشخص نشده است.'
        });
        return;
      }

      const result = await testGeminiConnection(testKey, model);
      if (result.success) {
        res.json({
          success: true,
          message: 'اتصال به هوش مصنوعی گوگل با موفقیت برقرار شد.',
          latencyMs: result.latencyMs,
          sampleResponse: result.sampleResponse
        });
      } else {
        res.status(400).json({
          success: false,
          message: result.error || 'خطا در برقراری ارتباط با جمینای'
        });
      }
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  },

  // 5. SMS.ir Configuration
  getSmsConfig(req: Request, res: Response) {
    try {
      const effectiveKey = getEffectiveSmsApiKey();
      const templateId = getEffectiveSmsTemplateId();
      const lineNumber = getEffectiveSmsLineNumber();

      let maskedKey = '';
      if (effectiveKey) {
        maskedKey = effectiveKey.length > 8
          ? `${effectiveKey.slice(0, 4)}••••••••${effectiveKey.slice(-4)}`
          : '••••••••';
      }

      res.json({
        success: true,
        hasKey: Boolean(effectiveKey),
        maskedKey,
        templateId,
        lineNumber: lineNumber || '30007732932454',
        provider: 'SMS.ir UltraFast Verification Gateway',
        status: effectiveKey ? 'operational' : 'unconfigured'
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  },

  updateSmsConfig(req: Request, res: Response) {
    try {
      const { apiKey, templateId, lineNumber } = req.body;
      const updated = updateSmsCredentials({ apiKey, templateId, lineNumber });
      res.json({
        success: true,
        message: 'تنظیمات درگاه پیامک SMS.ir با موفقیت ذخیره گردید.',
        config: updated
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  },

  async testSmsVerification(req: Request, res: Response) {
    try {
      const { testMobile, apiKey, templateId } = req.body;
      if (!testMobile) {
        res.status(400).json({ success: false, message: 'شماره موبایل گیرنده برای تست الزامی است.' });
        return;
      }

      const normPhone = normalizeIranianMobile(testMobile);
      const testCode = '88241';
      const startTime = Date.now();

      const result = await dispatchSmsIrVerification(normPhone, testCode, apiKey, templateId);
      const latencyMs = Date.now() - startTime;

      if (result && (result.status === 1 || result.data?.messageId)) {
        res.json({
          success: true,
          message: 'پیامک اعتبارسنجی تستی با موفقیت از طریق SMS.ir به شماره مقصد ارسال شد.',
          recipient: maskPhoneNumber(normPhone),
          testCode,
          messageId: result.data?.messageId,
          cost: result.data?.cost,
          latencyMs
        });
      } else {
        res.status(400).json({
          success: false,
          message: result?.message || 'خطا در ارسال پیامک از طریق SMS.ir',
          details: result,
          latencyMs
        });
      }
    } catch (err: any) {
      res.status(500).json({
        success: false,
        message: 'خطا در برقراری ارتباط با وب‌سرویس SMS.ir: ' + err.message
      });
    }
  },

  async getSmsCredit(req: Request, res: Response) {
    try {
      const creditRes = await fetchSmsIrCredit();
      if (creditRes && creditRes.status === 1) {
        res.json({ success: true, credit: creditRes.data });
      } else {
        res.status(400).json({ success: false, message: creditRes?.message || 'خطا در دریافت موجودی' });
      }
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  },

  async getSmsLines(req: Request, res: Response) {
    try {
      const linesRes = await fetchSmsIrLines();
      if (linesRes && linesRes.status === 1) {
        res.json({ success: true, lines: linesRes.data });
      } else {
        res.status(400).json({ success: false, message: linesRes?.message || 'خطا در دریافت خطوط' });
      }
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  },

  // 6. Confidential Health Records (Strict BOLA & Privacy Protection)
  getConfidentialRecords(req: Request, res: Response) {
    try {
      const authUser = req.authUser!;
      const seeds = seedConfidentialRecords();
      const records = db.find<ConfidentialHealthRecord>(COL_CONFIDENTIAL_HEALTH, undefined, seeds);

      const authorizedRecords = records
        .map((record) => {
          const access = checkConfidentialHealthAccess(authUser, record);
          if (access.allowed) {
            return record;
          }
          return null;
        })
        .filter(Boolean);

      res.json({
        success: true,
        count: authorizedRecords.length,
        records: authorizedRecords
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  },

  createConfidentialRecord(req: Request, res: Response) {
    try {
      const authUser = req.authUser!;
      const {
        studentId,
        studentName,
        title,
        recoveryNote,
        mentalHealthScore,
        sleepQualityIndex,
        stressLevel,
        counselorAssessment,
        actionItems,
        chatTranscript
      } = req.body;

      if (!studentId || !title || !recoveryNote) {
        res.status(400).json({
          success: false,
          message: 'شناسه دانش‌آموز، عنوان گزارش و یادداشت بازتوانی الزامی هستند.'
        });
        return;
      }

      const effectiveAdvisorId = authUser.role === 'admin' ? (req.body.advisorId || 'adv-1') : (authUser.advisorId || authUser.id);
      const effectiveAdvisorName = authUser.name || 'مشاور ارشد کافئین';

      const newRecord: ConfidentialHealthRecord = {
        id: `conf-rec-${Date.now()}`,
        studentId: String(studentId),
        studentName: studentName ? sanitizeString(String(studentName)).sanitized : 'دانش‌آموز',
        advisorId: effectiveAdvisorId,
        advisorName: effectiveAdvisorName,
        title: sanitizeString(String(title)).sanitized,
        recoveryNote: sanitizeString(String(recoveryNote)).sanitized,
        mentalHealthScore: Number(mentalHealthScore) || 75,
        sleepQualityIndex: Number(sleepQualityIndex) || 80,
        stressLevel: stressLevel || 'medium',
        counselorAssessment: counselorAssessment ? sanitizeString(String(counselorAssessment)).sanitized : undefined,
        actionItems: Array.isArray(actionItems) ? actionItems.map((item) => sanitizeString(String(item)).sanitized) : [],
        chatTranscript: chatTranscript || undefined,
        authorizedRoles: ['admin', 'assigned_advisor'],
        createdBy: `${effectiveAdvisorName} (${authUser.role === 'admin' ? 'مدیر سیستم' : 'مشاور مستقیم'})`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const seeds = seedConfidentialRecords();
      const saved = db.insert(COL_CONFIDENTIAL_HEALTH, newRecord, seeds);

      res.json({
        success: true,
        message: 'یادداشت محرمانه سلامت و بازتوانی با برچسب حساسیت بالا و دسترسی محدود ذخیره گردید.',
        record: saved
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  },

  testPrivacyAccess(req: Request, res: Response) {
    try {
      const { testRole = 'parent', testAdvisorId, recordId = 'conf-rec-101-recovery' } = req.body;
      const seeds = seedConfidentialRecords();
      const record = db.findById<ConfidentialHealthRecord>(COL_CONFIDENTIAL_HEALTH, recordId, seeds);

      if (!record) {
        res.status(404).json({ success: false, message: 'رکورد محرمانه یافت نشد.' });
        return;
      }

      const simulatedUser = { role: testRole, advisorId: testAdvisorId };
      const access = checkConfidentialHealthAccess(simulatedUser, record);

      res.json({
        success: true,
        recordId: record.id,
        recordTitle: record.title,
        studentName: record.studentName,
        assignedAdvisorName: record.advisorName,
        simulatedUser,
        isAllowed: access.allowed,
        status: access.allowed ? 'ACCESS_GRANTED_200' : 'ACCESS_BLOCKED_403',
        reason: access.allowed
          ? `دسترسی مجاز: نقش «${testRole}» ${testRole === 'admin' ? '(مدیر ارشد)' : '(مشاور مستقیم اختصاصی)'} صلاحیت مشاهده کامل پرونده سلامت روان و یادداشت‌های بازتوانی را داراست.`
          : access.reason
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  },

  getPrivacyAuditPosture(req: Request, res: Response) {
    try {
      const seeds = seedConfidentialRecords();
      const records = db.find<ConfidentialHealthRecord>(COL_CONFIDENTIAL_HEALTH, undefined, seeds);

      res.json({
        success: true,
        dataPrivacyPosture: {
          confidentialityActive: true,
          confidentialRecordsCount: records.length,
          sensitiveDataTypes: ['یادداشت‌های بازتوانی (Recovery Notes)', 'نمرات سلامت روان (Mental Health Scores)', 'چت‌های خصوصی مشاوره (Counseling Chats)'],
          authorizedRoles: ['admin', 'assigned_advisor'],
          accessStrictlyDeniedTo: ['parents', 'unassigned_advisors', 'other_students', 'public_guests'],
          dataClassification: 'RESTRICTED_PSYCHOLOGICAL_CONFIDENTIALITY',
          complianceRule: 'اصل رازداری حرفه‌ای مشاوره و حفاظت از سلامت روحی داوطلب'
        }
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  },

  // 7. Student Comments & Reviews
  getComments(req: Request, res: Response) {
    try {
      const comments = db.find(COL_COMMENTS, undefined, DEFAULT_STUDENT_COMMENTS);
      res.json({ success: true, count: comments.length, comments });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  },

  createComment(req: Request, res: Response) {
    try {
      const { authorName, commentText, rating = 5, group = 'general', grade = '12th', city = 'تهران', advisorName, targetMajor, studentId } = req.body;

      if (!authorName || !commentText) {
        res.status(400).json({ success: false, message: 'نام نویسنده و متن نظر الزامی است.' });
        return;
      }

      const safeAuthor = sanitizeString(String(authorName).trim()).sanitized;
      const safeComment = sanitizeString(String(commentText).trim()).sanitized;
      const safeCity = city ? sanitizeString(String(city).trim()).sanitized : 'تهران';
      const safeAdvisor = advisorName ? sanitizeString(String(advisorName).trim()).sanitized : undefined;
      const safeMajor = targetMajor ? sanitizeString(String(targetMajor).trim()).sanitized : undefined;

      const newComment = {
        id: `cmt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        studentId: studentId || undefined,
        authorName: safeAuthor,
        authorRole: 'داوطلب کنکور سراسری',
        group,
        grade,
        city: safeCity,
        avatarUrl: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=250`,
        rating: Math.max(1, Math.min(5, Number(rating) || 5)),
        commentText: safeComment,
        advisorName: safeAdvisor,
        targetMajor: safeMajor,
        createdAt: new Date().toLocaleDateString('fa-IR'),
        status: 'published',
        isPinned: false,
        isVerifiedStudent: true,
        likesCount: 0
      };

      const saved = db.insert<any>(COL_COMMENTS, newComment, DEFAULT_STUDENT_COMMENTS);
      res.json({ success: true, message: 'نظر شما با موفقیت ثبت شد.', comment: saved });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }
};
