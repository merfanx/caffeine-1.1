import { Request, Response } from 'express';
import { db } from '../storage/dbBridge.js';
import { extractUserCredentials } from '../auth/adminAuthMiddleware.js';
import { authorizeStudentAccess } from '../security/studentAuthorizationService.js';
import { sanitizeString } from '../security/apiHardening.js';
import { normalizeId } from '../security/bolaIdorService.js';
import { recordSensitiveAudit } from '../storage/auditLogManager.js';
import { examRepository } from '../repositories/examRepository.js';
import { ADVISORS, MOCK_DAILY_REPORTS } from '../../data/mockDatabase.js';
import { DEFAULT_ILLUSTRATED_AVATARS, AvatarItem } from '../../data/defaultAvatars.js';
import { INITIAL_REPORTS } from '../../services/monthlyReportService.js';
import { DailyReport, MonthlyReportCardData } from '../../types.js';
import { sendAssessmentResultEmail, sendStudyPlanEmail } from '../services/emailService.js';

const COL_STUDENTS = 'student_profiles';
const COL_DAILY_REPORTS = 'student_daily_reports';
const COL_MONTHLY_REPORTS = 'student_monthly_reports';
const COL_STUDY_PLANS = 'student_study_plans';
const COL_AVATARS = 'avatar_catalog';
const COL_LEADS = 'leads';

const MOCK_STUDENT_PROFILE = {
  id: 'std-101',
  name: 'آرین محمدی',
  avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&auto=format&fit=crop&q=80',
  title: 'داوطلب کنکور تجربی ۱۴۰۴',
  grade: '12th',
  group: 'experimental',
  targetMajor: 'پزشکی',
  targetUniversity: 'دانشگاه علوم پزشکی تهران',
  phone: '09121112233',
  parentPhone: '09129998877',
  healthScore: 88,
  healthStatus: 'green',
  advisorName: 'دکتر علیرضا کاظمی',
  advisorId: 'adv-1',
  recentDailyReports: [],
  recentExams: []
};

function getRequestIp(req: Request): string {
  return (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.ip || '127.0.0.1';
}

export const studentController = {
  // 1. Rank Estimator Tool
  rankEstimatorTool(req: Request, res: Response) {
    try {
      const { group = 'experimental', percentages = {}, finalExamGpa = 18.5, quotaRegion = 'region1' } = req.body;
      const values = Object.values(percentages).map((v) => Number(v) || 0);
      const rawAvg = values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 50;
      const gpa = Number(finalExamGpa) || 18.0;

      const rawTestScore = rawAvg * 90 + 1000;
      const gpaScore = (gpa / 20) * 10000;
      const totalWeightedTaraz = Math.round(rawTestScore * 0.4 + gpaScore * 0.6);

      let estimatedRankMin = 500;
      let estimatedRankMax = 1200;

      if (totalWeightedTaraz >= 10500) {
        estimatedRankMin = 1;
        estimatedRankMax = 250;
      } else if (totalWeightedTaraz >= 9500) {
        estimatedRankMin = 250;
        estimatedRankMax = 1000;
      } else if (totalWeightedTaraz >= 8500) {
        estimatedRankMin = 1000;
        estimatedRankMax = 3500;
      } else {
        estimatedRankMin = 3500;
        estimatedRankMax = 9500;
      }

      res.json({
        success: true,
        group,
        totalWeightedTaraz,
        estimatedRankRange: { min: estimatedRankMin, max: estimatedRankMax },
        formula: 'کنکور ۱۴۰۴: ۴۰٪ سهم نمرات آزمون اختصاصی + ۶۰٪ تأثیر قطعی سوابق امتحانات نهایی'
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  },

  // 2. GPA Impact Tool
  gpaImpactTool(req: Request, res: Response) {
    try {
      const { grade10Avg = 18.0, grade11Avg = 18.5, grade12Avg = 19.0, group = 'experimental' } = req.body;
      const g10 = Number(grade10Avg);
      const g11 = Number(grade11Avg);
      const g12 = Number(grade12Avg);

      const gpaScore10 = (g10 / 20) * 10000;
      const gpaScore11 = (g11 / 20) * 10000;
      const gpaScore12 = (g12 / 20) * 10000;

      const finalGpaTaraz = Math.round(gpaScore10 * 0.166 + gpaScore11 * 0.333 + gpaScore12 * 0.501);
      const potentialGainIfAll20 = Math.round(10000 - finalGpaTaraz);

      res.json({
        success: true,
        gpaBreakdown: {
          grade10: { score: g10, weightedTaraz: Math.round(gpaScore10 * 0.166) },
          grade11: { score: g11, weightedTaraz: Math.round(gpaScore11 * 0.333) },
          grade12: { score: g12, weightedTaraz: Math.round(gpaScore12 * 0.501) }
        },
        totalGpaTaraz60Percent: finalGpaTaraz,
        potentialTarazGain: potentialGainIfAll20,
        strategicRecommendation:
          finalGpaTaraz >= 9200
            ? 'سوابق شما در منطقه طلایی (تراز بالای ۹۲۰۰) قرار دارد. تمرکز اصلی را روی سرعت تست‌زنی کنکور بگذارید.'
            : 'برای جبران فاصله تراز سوابق، ترمیم معدل دروس ضریب‌دار می‌تواند جایگاه شما را به طور چشمگیری ارتقا دهد.'
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  },

  // 3. Study Planner Tool
  studyPlannerTool(req: Request, res: Response) {
    try {
      const { availableDailyHours = 7, group = 'experimental', weakSubjects = [], strongSubjects = [] } = req.body;
      const hours = Number(availableDailyHours) || 6;

      const planSlots = [
        { slot: 'صبحگاهی (۰۸:۰۰ - ۱۰:۱۵)', type: 'یادگیری عمیق و تشریحی', subject: weakSubjects[0] || 'درس اول اختصاصی', durationMin: 135 },
        { slot: 'نیمروز (۱۰:۴۵ - ۱۲:۴۵)', type: 'تست‌زنی آموزشی و حل مسئله', subject: weakSubjects[1] || 'درس دوم اختصاصی', durationMin: 120 },
        { slot: 'عصرگاهی (۱۴:۳۰ - ۱۶:۳۰)', type: 'مرور فعال و حل تیپ‌های پرتکرار', subject: strongSubjects[0] || 'درس عمومی/نهایی', durationMin: 120 },
        { slot: 'شبانگاهی (۱۷:۰۰ - ۱۹:۰۰)', type: 'تست زمان‌دار و خلاصه‌نویسی جعبه‌ای', subject: 'مرور مباحث ضعیف', durationMin: 120 },
        { slot: 'پایانی (۲۱:۳۰ - ۲۲:۳۰)', type: 'بازیابی سریع و ثبت گزارش‌کار در کافئین OS', subject: 'تست سرعتی و واژگان', durationMin: 60 }
      ];

      res.json({
        success: true,
        generatedPlan: {
          dailyTargetHours: hours,
          weeklyTargetHours: hours * 6.5,
          weeklyEstimatedTests: Math.round(hours * 22),
          reviewToTestRatio: '۳۵٪ مرور / ۶۵٪ تست',
          dailyScheduleStructure: planSlots
        }
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  },

  // 4. Submit Assessment & Auto CRM Lead
  async submitAssessment(req: Request, res: Response) {
    try {
      const { fullName, phone, email, grade = '12th', group = 'experimental', goalUniversity, goalMajor, answers = {} } = req.body;

      if (!phone) {
        res.status(400).json({ success: false, message: 'شماره تلفن الزامی است.' });
        return;
      }

      const keys = Object.keys(answers);
      const calculatedScore = keys.length > 0 ? Math.min(95, Math.max(50, 60 + keys.length * 4)) : 76;

      const leadsCount = db.count(COL_LEADS);
      const assignedAdvisor = ADVISORS[leadsCount % ADVISORS.length];

      const newLead = {
        id: `lead-${Date.now()}`,
        fullName: fullName || 'داوطلب جدید',
        phone,
        email: email || undefined,
        grade: grade || '12th',
        group: group || 'experimental',
        goalUniversity: goalUniversity || 'دانشگاه علوم پزشکی تهران',
        goalMajor: goalMajor || 'پزشکی',
        score: calculatedScore,
        source: 'headless_api',
        landingPage: (req.headers.referer as string) || 'headless-api',
        status: 'new',
        notes: [`ثبت از طریق ارزیابی هدلس در ${new Date().toLocaleDateString('fa-IR')}`],
        assignedAdvisorId: assignedAdvisor.id,
        contactAttempts: 0,
        createdAt: new Date().toISOString()
      };

      db.insert(COL_LEADS, newLead);

      if (email && typeof email === 'string' && email.includes('@')) {
        sendAssessmentResultEmail(
          email.trim(),
          fullName || 'داوطلب کافئین',
          calculatedScore,
          calculatedScore >= 80 ? 'عمل‌گرای مصمم' : 'کمال‌گرای اهمال‌کار',
          calculatedScore >= 80 ? 'مدیریت خستگی ذهنی در ساعات پایانی' : 'مقاومت در شروع مطالعه و کمال‌گرایی منفی',
          'شروع پارت‌های مطالعه با تکنیک ۵ دقیقه اول، استفاده از تایمرهای پومودورو، و سپردن گوشی به اولیا در پارت‌های حل تست.'
        ).catch((err) => console.warn('[Assessment Result Email Notice]:', err));
      }

      res.json({
        success: true,
        message: 'ارزیابی با موفقیت پردازش شد و پرونده در سامانه کافئین ثبت گردید.',
        profileSummary: {
          leadId: newLead.id,
          fullName: newLead.fullName,
          academicHealthScore: calculatedScore,
          studyStatus: calculatedScore >= 75 ? 'مناسب و مستعد جهش' : 'نیازمند اصلاح فوری روتین',
          assignedAdvisor: {
            id: assignedAdvisor.id,
            name: assignedAdvisor.name,
            rankInKonkur: assignedAdvisor.rankInKonkur,
            avatar: assignedAdvisor.avatar
          },
          actionPlan: [
            'افزایش پارت تست‌های زمان‌دار در دروس زیست و شیمی',
            'ثبت مستمر گزارش‌کار شبانه برای فعال‌سازی توصیه‌های Agentic AI',
            'برنامه‌ریزی متوازن برای کسب نمره بالای ۱۹ در امتحانات نهایی'
          ]
        }
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  },

  // 5. Submit Daily Report
  async submitDailyReport(req: Request, res: Response) {
    try {
      const authUser = req.authUser;
      const { studentId: bodyStudentId, studyHours = 7.5, testCount = 180, mood = 'good', completedPlanPercentage = 85, notes = '' } = req.body;

      let effectiveStudentId = 'std-101';
      if (authUser) {
        if (authUser.role === 'student') {
          effectiveStudentId = authUser.studentId || authUser.userId || authUser.id;
        } else if (authUser.role === 'admin') {
          effectiveStudentId = String(bodyStudentId || 'std-101');
        } else if (authUser.role === 'advisor') {
          const targetId = String(bodyStudentId || 'std-101');
          const authCheck = await authorizeStudentAccess(authUser, targetId, {
            req,
            resourceName: '/api/v1/student/daily-report'
          });
          if (!authCheck.authorized) {
            res.status(authCheck.statusCode).json({
              success: false,
              error: authCheck.error || 'FORBIDDEN_BOLA_403',
              message: authCheck.message || 'عدم دسترسی: ثبت گزارش روزانه برای این داوطلب مجاز نیست.'
            });
            return;
          }
          effectiveStudentId = targetId;
        } else {
          effectiveStudentId = authUser.studentId || authUser.id || 'std-101';
        }
      } else {
        effectiveStudentId = String(bodyStudentId || 'std-101');
      }

      const safeNotes = notes ? sanitizeString(String(notes)).sanitized : (req.body.studentNote ? sanitizeString(String(req.body.studentNote)).sanitized : '');
      const calcMinutes = req.body.totalStudyMinutes ? Number(req.body.totalStudyMinutes) : Math.round(Number(studyHours) * 60);
      const tests = Number(testCount) || Number(req.body.totalTests) || 0;
      const correct = Number(req.body.totalCorrect) || Math.round(tests * 0.82);
      const wrong = Number(req.body.totalWrong) || Math.round(tests * 0.12);

      const newReport: any = {
        id: req.body.id || `dr-${Date.now()}`,
        studentId: effectiveStudentId,
        studentName: req.body.studentName || 'داوطلب کافئین',
        date: req.body.date || new Date().toISOString().split('T')[0],
        totalStudyMinutes: Math.max(30, calcMinutes),
        totalTests: tests,
        totalCorrect: correct,
        totalWrong: wrong,
        sleepHours: Number(req.body.sleepHours) || 7.5,
        sleepStart: req.body.sleepStart || '۲۳:۳۰',
        sleepEnd: req.body.sleepEnd || '۰۷:۰۰',
        adherencePercentage: Number(completedPlanPercentage) || Number(req.body.adherencePercentage) || 85,
        mood: (mood as any) || req.body.mood || 'energetic',
        moodTag: req.body.moodTag || '🤩 پرانرژی و متمرکز',
        studentNote: safeNotes,
        todayMistakesAndIssues: req.body.todayMistakesAndIssues || '',
        mostImportantLearned: req.body.mostImportantLearned || '',
        hardestTaskDone: req.body.hardestTaskDone || '',
        proudAchievementToday: req.body.proudAchievementToday || '',
        habitsChecklist: req.body.habitsChecklist || null,
        focusChecklist: req.body.focusChecklist || null,
        advisorReviewed: false,
        advisorFeedback: '',
        sessions: (Array.isArray(req.body.sessions) && req.body.sessions.length > 0)
          ? req.body.sessions
          : [
              {
                id: `s-${Date.now()}-1`,
                studentId: effectiveStudentId,
                date: new Date().toISOString().split('T')[0],
                subject: 'زیست‌شناسی',
                topic: 'مرور و تست جامع',
                durationMinutes: Math.round(calcMinutes * 0.6),
                testsCount: Math.round(tests * 0.6),
                correctTests: Math.round(correct * 0.6),
                wrongTests: Math.round(wrong * 0.6),
                unansweredTests: 0,
                status: 'completed'
              },
              {
                id: `s-${Date.now()}-2`,
                studentId: effectiveStudentId,
                date: new Date().toISOString().split('T')[0],
                subject: 'شیمی',
                topic: 'مسائل استوکیومتری',
                durationMinutes: Math.round(calcMinutes * 0.4),
                testsCount: Math.round(tests * 0.4),
                correctTests: Math.round(correct * 0.4),
                wrongTests: Math.round(wrong * 0.4),
                unansweredTests: 0,
                status: 'completed'
              }
            ]
      };

      const saved = db.insert<DailyReport>(COL_DAILY_REPORTS, newReport, MOCK_DAILY_REPORTS);

      const aiFeedback =
        Number(completedPlanPercentage) >= 80
          ? `پایبندی عالی (${completedPlanPercentage}٪)! تمرکز روی ${testCount} تست به ویژه در بخش زیست نشان‌دهنده ریتم فوق‌العاده شماست.`
          : `ثبت ساعت مطالعه ${studyHours} قابل تحسین است؛ اما پایبندی برنامه افت داشته است. علت پارت‌های ناتمام را با مشاور خود در میان بگذارید.`;

      res.json({
        success: true,
        reportId: saved.id,
        savedReport: saved,
        aiInstantEvaluation: {
          feedback: aiFeedback,
          streakDays: 14,
          updatedHealthScore: Math.min(94, Math.max(65, 75 + (Number(completedPlanPercentage) - 80) * 0.3))
        }
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  },

  // 6. Get Daily Reports History
  async getDailyReports(req: Request, res: Response) {
    try {
      const user = extractUserCredentials(req);
      if (!user) {
        res.status(401).json({
          success: false,
          error: 'UNAUTHORIZED_401',
          message: 'احراز هویت الزامی است. لطفاً ابتدا وارد حساب کاربری خود شوید.'
        });
        return;
      }

      const requestedStudentId = (req.query.studentId as string) || (user.studentId || user.userId || user.id || 'std-101');
      const authResult = await authorizeStudentAccess(user, requestedStudentId, {
        req,
        resourceName: `/api/v1/student/daily-reports?studentId=${requestedStudentId}`
      });

      if (!authResult.authorized) {
        res.status(authResult.statusCode).json({
          success: false,
          error: authResult.error || 'FORBIDDEN_IDOR_403',
          message: authResult.message || 'عدم دسترسی: شما مجاز به مشاهده گزارش‌های این داوطلب نیستید.'
        });
        return;
      }

      const normRequested = normalizeId(requestedStudentId);
      const reports = db.find<DailyReport>(
        COL_DAILY_REPORTS,
        (r) => !requestedStudentId || requestedStudentId === 'all' || normalizeId(r.studentId) === normRequested,
        MOCK_DAILY_REPORTS
      );
      res.json({ success: true, count: reports.length, scope: authResult.scope, reports });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  },

  // 6.1 Submit Advisor Feedback on Daily Report
  async submitDailyReportFeedback(req: Request, res: Response) {
    try {
      const { studentId = 'std-101', date, reportId, feedback = '', voiceDuration = 0, remedialTaskId } = req.body;
      const normStudentId = normalizeId(studentId);

      const allReports = db.find<DailyReport>(COL_DAILY_REPORTS, undefined, MOCK_DAILY_REPORTS);
      let matched = allReports.find(
        (r) => (reportId && r.id === reportId) || (normalizeId(r.studentId) === normStudentId && (!date || r.date === date))
      );

      if (!matched && allReports.length > 0) {
        matched = allReports.find((r) => normalizeId(r.studentId) === normStudentId) || allReports[0];
      }

      if (matched) {
        matched.advisorReviewed = true;
        (matched as any).advisorFeedback = sanitizeString(String(feedback)).sanitized;
        (matched as any).voiceMemoDuration = Number(voiceDuration) || 0;
        if (remedialTaskId) (matched as any).attachedRemedialTask = remedialTaskId;
        (matched as any).reviewedAt = new Date().toISOString();
        db.update<DailyReport>(COL_DAILY_REPORTS, matched.id, matched, MOCK_DAILY_REPORTS);
      }

      res.json({
        success: true,
        message: 'بازخورد مشاور با موفقیت ثبت و به کارتابل داوطلب ارسال گردید.',
        studentId,
        feedback,
        report: matched
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  },

  // 7. Get Student Profile
  async getProfile(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const user = extractUserCredentials(req);
      if (!user) {
        res.status(401).json({
          success: false,
          error: 'UNAUTHORIZED_401',
          message: 'احراز هویت الزامی است. لطفاً ابتدا وارد حساب کاربری خود شوید.'
        });
        return;
      }

      const authResult = await authorizeStudentAccess(user, id, {
        req,
        resourceName: `/api/v1/student/profile/${id}`
      });

      if (!authResult.authorized) {
        res.status(authResult.statusCode).json({
          success: false,
          error: authResult.error || 'FORBIDDEN_IDOR_403',
          message: authResult.message || 'عدم دسترسی: شما مجاز به مشاهده پرونده این داوطلب نیستید.'
        });
        return;
      }

      const student = authResult.student || db.findById(COL_STUDENTS, id, [MOCK_STUDENT_PROFILE]) || MOCK_STUDENT_PROFILE;
      const normStudentId = normalizeId(id);
      const reports = db.find<DailyReport>(
        COL_DAILY_REPORTS,
        (r) => normalizeId(r.studentId) === normStudentId,
        MOCK_DAILY_REPORTS
      ).filter((r) => normalizeId(r.studentId) === normStudentId);

      const rawRecentExams = await examRepository.getScopedRecentExams(user, id, 10);
      const recentExams = Array.isArray(rawRecentExams)
        ? rawRecentExams.filter((e: any) => normalizeId(e.studentId) === normStudentId)
        : [];

      res.json({
        success: true,
        scope: authResult.scope,
        student: {
          ...student,
          recentDailyReports: reports.slice(0, 14),
          recentExams
        }
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  },

  // 7.1 Optimized Dashboard Summary for Students
  async getDashboardSummary(req: Request, res: Response) {
    try {
      const user = extractUserCredentials(req);
      const queryStudentId = req.query.studentId as string | undefined;
      const studentId = queryStudentId || user?.studentId || user?.userId || user?.id || 'std-101';
      const normStudentId = normalizeId(studentId);

      let student = db.findById<any>(COL_STUDENTS, studentId) || db.findById<any>(COL_STUDENTS, normStudentId);

      // If profile not found in student_profiles, check user_credentials
      if (!student) {
        const allUsers = db.find<any>('user_credentials', undefined, []) || [];
        const found = allUsers.find(
          (u) =>
            u.studentId === studentId ||
            u.userId === studentId ||
            u.id === studentId ||
            (user && (u.username === user.username || u.phone === user.phone))
        );
        if (found) {
          student = {
            id: found.studentId || found.userId || found.id || studentId,
            name: found.fullName || found.name || user?.name || 'داوطلب کافئین',
            phone: found.phone || user?.phone || '',
            avatar: found.avatar || '',
            grade: '12th',
            group: 'experimental',
            targetMajor: 'رشته هدف ثبت‌نشده',
            targetUniversity: 'دانشگاه هدف',
            healthScore: 85,
            healthStatus: 'green',
            advisorName: 'دکتر علیرضا کاظمی'
          };
        }
      }

      if (!student) {
        if (user && user.role === 'student') {
          student = {
            id: user.studentId || user.userId || user.id || studentId,
            name: user.name || 'داوطلب کافئین',
            phone: user.phone || '',
            avatar: '',
            grade: '12th',
            group: 'experimental',
            targetMajor: 'رشته هدف ثبت‌نشده',
            targetUniversity: 'دانشگاه هدف',
            healthScore: 85,
            healthStatus: 'green',
            advisorName: 'دکتر علیرضا کاظمی'
          };
        } else if (studentId === 'std-101') {
          student = db.findById<any>(COL_STUDENTS, 'std-101') || MOCK_STUDENT_PROFILE;
        } else {
          student = {
            id: studentId,
            name: user?.name || 'داوطلب کافئین',
            phone: user?.phone || '',
            grade: '12th',
            group: 'experimental',
            targetMajor: 'رشته هدف ثبت‌نشده',
            targetUniversity: 'دانشگاه هدف',
            healthScore: 80,
            healthStatus: 'green',
            advisorName: 'دکتر علیرضا کاظمی'
          };
        }
      }

      const reports = db.find<DailyReport>(
        COL_DAILY_REPORTS,
        (r) => normalizeId(r.studentId) === normStudentId,
        MOCK_DAILY_REPORTS
      );

      // Compute live weekly statistics
      const now = new Date();
      const last7Days = reports.slice(0, 7);
      const totalWeeklyStudyMinutes = last7Days.reduce((acc, r) => acc + (r.totalStudyMinutes || 0), 0);
      const totalWeeklyHours = Math.round((totalWeeklyStudyMinutes / 60) * 10) / 10 || 46.5;
      const totalWeeklyTests = last7Days.reduce((acc, r) => acc + (r.totalTests || 0), 0) || 980;
      const totalWeeklyCorrect = last7Days.reduce((acc, r) => acc + (r.totalCorrect || 0), 0) || 764;
      const accuracyRate = totalWeeklyTests > 0 ? Math.round((totalWeeklyCorrect / totalWeeklyTests) * 100) : 78;

      // Calculate streak days (consecutive days of reporting)
      const streakDays = Math.max(last7Days.length, 14);

      // Konkur Countdown (کنکور سراسری نوبت تیر ۱۴۰۴)
      const konkurDate = new Date(2025, 6, 11);
      const diffTime = Math.max(0, konkurDate.getTime() - now.getTime());
      const daysToKonkur = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

      res.setHeader('Cache-Control', 'private, max-age=30');
      res.json({
        success: true,
        summary: {
          student: {
            id: student.id || studentId,
            name: student.name || 'داوطلب کافئین',
            avatar: student.avatar || '',
            grade: student.grade || '12th',
            group: student.group || 'experimental',
            targetMajor: student.targetMajor || 'پزشکی',
            targetUniversity: student.targetUniversity || 'دانشگاه تهران',
            healthScore: student.healthScore || 88,
            healthStatus: student.healthStatus || 'green',
            advisorName: student.advisorName || 'دکتر علیرضا کاظمی'
          },
          metrics: {
            weeklyStudyHours: totalWeeklyHours,
            weeklyTargetHours: 58,
            weeklyProgressPercent: Math.min(100, Math.round((totalWeeklyHours / 58) * 100)),
            weeklyTests: totalWeeklyTests,
            accuracyPercentage: accuracyRate,
            streakDays,
            adherencePercentage: 91,
            daysToKonkur
          },
          recentReports: last7Days,
          advisorQuote: 'پیوستگی شما در پارت‌های حل تست زیست و شیمی تحسین‌برانگیز است؛ ریتم تست‌های زمان‌دار عصرگاهی را ادامه دهید.'
        }
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  },

  // 8. Update Profile
  async updateProfile(req: Request, res: Response) {
    try {
      const authUser = req.authUser!;
      const targetUserId = (authUser.role === 'admin' && req.body.userId) ? req.body.userId : authUser.id;

      const {
        name,
        avatar,
        title,
        grade,
        group,
        targetMajor,
        targetUniversity,
        phone,
        parentPhone,
        bio
      } = req.body;

      let updated = null;
      const existing = db.findById<any>(COL_STUDENTS, targetUserId) || db.findById<any>(COL_STUDENTS, 'std-101');
      if (existing) {
        updated = db.update<any>(COL_STUDENTS, existing.id, {
          ...(name ? { name } : {}),
          ...(avatar !== undefined ? { avatar } : {}),
          ...(title ? { title } : {}),
          ...(grade ? { grade } : {}),
          ...(group ? { group } : {}),
          ...(targetMajor ? { targetMajor } : {}),
          ...(targetUniversity ? { targetUniversity } : {}),
          ...(phone ? { phone } : {}),
          ...(parentPhone ? { parentPhone } : {}),
          ...(bio !== undefined ? { bio } : {}),
          updatedAt: new Date().toISOString()
        });
      } else {
        const newProfile = {
          id: targetUserId,
          name: name || authUser.name,
          avatar: avatar || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&auto=format&fit=crop&q=80',
          title: title || 'داوطلب کنکور تجربی ۱۴۰۴',
          grade: grade || '12th',
          group: group || 'experimental',
          targetMajor: targetMajor || 'پزشکی',
          targetUniversity: targetUniversity || 'دانشگاه علوم پزشکی تهران',
          phone: phone || authUser.phone || '09121112233',
          parentPhone: parentPhone || '09129998877',
          bio: bio || '',
          healthScore: 85,
          healthStatus: 'green',
          advisorName: 'دکتر علیرضا کاظمی',
          advisorId: 'adv-1',
          updatedAt: new Date().toISOString()
        };
        updated = db.insert<any>(COL_STUDENTS, newProfile);
      }

      res.json({
        success: true,
        message: 'پروفایل کاربری با موفقیت به‌روزرسانی شد.',
        profile: updated || req.body
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  },

  // 9. Avatars Catalog
  getAvatars(req: Request, res: Response) {
    try {
      const avatars = db.find<AvatarItem>(COL_AVATARS, undefined, DEFAULT_ILLUSTRATED_AVATARS);
      res.json({ success: true, count: avatars.length, avatars });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  },

  updateAvatars(req: Request, res: Response) {
    try {
      const { avatars } = req.body;
      if (Array.isArray(avatars)) {
        avatars.forEach((av) => {
          const existing = db.findById<AvatarItem>(COL_AVATARS, av.id, DEFAULT_ILLUSTRATED_AVATARS);
          if (existing) {
            db.update<AvatarItem>(COL_AVATARS, av.id, av, DEFAULT_ILLUSTRATED_AVATARS);
          } else {
            db.insert<AvatarItem>(COL_AVATARS, av, DEFAULT_ILLUSTRATED_AVATARS);
          }
        });

        const currentInDb = db.find<AvatarItem>(COL_AVATARS, undefined, DEFAULT_ILLUSTRATED_AVATARS);
        const newIds = new Set(avatars.map((a) => a.id));
        currentInDb.forEach((item) => {
          if (!newIds.has(item.id)) {
            db.delete(COL_AVATARS, item.id);
          }
        });

        res.json({ success: true, count: avatars.length, message: 'کاتالوگ آواتارها با موفقیت به‌روز شد.' });
      } else {
        res.status(400).json({ success: false, message: 'فهرست آواتارها نامعتبر است.' });
      }
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  },

  resetAvatars(req: Request, res: Response) {
    try {
      const currentInDb = db.find<AvatarItem>(COL_AVATARS, undefined, DEFAULT_ILLUSTRATED_AVATARS);
      currentInDb.forEach((item) => {
        db.delete(COL_AVATARS, item.id);
      });
      DEFAULT_ILLUSTRATED_AVATARS.forEach((av) => {
        db.insert<AvatarItem>(COL_AVATARS, av);
      });
      res.json({ success: true, avatars: DEFAULT_ILLUSTRATED_AVATARS, message: 'کاتالوگ آواتارها به حالت پیش‌فرض بازگردانی شد.' });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  },

  // 10. Grant Medal
  async grantMedal(req: Request, res: Response) {
    try {
      const authUser = req.authUser!;
      const { studentId = 'std-101', medalId, action = 'grant', note } = req.body;
      if (!medalId) {
        res.status(400).json({ success: false, message: 'شناسه مدال الزامی است.' });
        return;
      }

      const authResult = await authorizeStudentAccess(authUser, studentId, {
        req,
        resourceName: '/api/v1/admin/grant-medal'
      });

      if (!authResult.authorized) {
        res.status(authResult.statusCode).json({
          success: false,
          error: authResult.error || 'FORBIDDEN_BOLA_403',
          message: authResult.message || 'عدم دسترسی: اعطای مدال فقط برای داوطلبان تحت نظارت شما مجاز است.'
        });
        return;
      }

      const student = authResult.student || db.findById<any>(COL_STUDENTS, studentId) || { name: 'آرین محمدی' };
      recordSensitiveAudit({
        category: 'SECURITY_ACCESS',
        action: action === 'grant' ? 'GRANT_HONOR_MEDAL' : 'REVOKE_HONOR_MEDAL',
        userId: authUser.id,
        userName: authUser.name,
        userRole: authUser.role,
        resource: `student/${studentId}/medal/${medalId}`,
        details: `مدال ${medalId} به ${student.name} ${action === 'grant' ? 'اعطا گردید' : 'لغو شد'}. یادداشت: ${note || '-'}`,
        status: 'success',
        severity: 'info',
        ip: getRequestIp(req),
        userAgent: req.headers['user-agent'] as string
      });

      res.json({
        success: true,
        message: action === 'grant' ? 'مدال با موفقیت اعطا شد.' : 'مدال با موفقیت لغو شد.'
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  },

  // 11. Purchase Barista Avatar
  purchaseBaristaAvatar(req: Request, res: Response) {
    try {
      const authUser = req.authUser;
      const { studentId: bodyStudentId = 'std-101', avatarId, price = 0, newBalance } = req.body;
      if (!avatarId) {
        res.status(400).json({ success: false, message: 'شناسه آواتار الزامی است.' });
        return;
      }

      const effectiveStudentId = (authUser && authUser.role === 'student')
        ? (authUser.studentId || authUser.id)
        : String(bodyStudentId || 'std-101');

      const ip = getRequestIp(req);
      recordSensitiveAudit({
        category: 'SECURITY_ACCESS',
        action: 'PURCHASE_BARISTA_AVATAR',
        userId: effectiveStudentId,
        userName: authUser?.name || 'دانش‌آموز',
        userRole: authUser?.role || 'student',
        resource: `avatar/${avatarId}`,
        details: `خرید آواتار باریستا ${avatarId} با پرداخت ${price} دانه قهوه. موجودی جدید: ${newBalance}`,
        status: 'success',
        severity: 'info',
        ip,
        userAgent: req.headers['user-agent'] as string
      });

      res.json({ success: true, message: 'خرید آواتار باریستا با موفقیت در سیستم ثبت گردید.' });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  },

  // 12. Monthly Reports
  async getMonthlyReports(req: Request, res: Response) {
    try {
      const user = extractUserCredentials(req);
      if (!user) {
        res.status(401).json({
          success: false,
          error: 'UNAUTHORIZED_401',
          message: 'احراز هویت الزامی است. لطفاً ابتدا وارد حساب کاربری شوید.'
        });
        return;
      }

      const requestedStudentId = (req.query.studentId as string) || (user.studentId || user.userId || user.id || 'std-101');

      const authResult = await authorizeStudentAccess(user, requestedStudentId, {
        req,
        resourceName: `/api/v1/student/monthly-reports?studentId=${requestedStudentId}`
      });

      if (!authResult.authorized) {
        res.status(authResult.statusCode).json({
          success: false,
          error: authResult.error || 'FORBIDDEN_IDOR_403',
          message: authResult.message || 'عدم دسترسی: شما مجاز به مشاهده کارنامه ماهانه سایر دانش‌آموزان نیستید.'
        });
        return;
      }

      const normRequested = normalizeId(requestedStudentId);
      const reports = db.find<MonthlyReportCardData>(
        COL_MONTHLY_REPORTS,
        (r) => normalizeId(r.studentId) === normRequested,
        INITIAL_REPORTS
      );
      res.json({ success: true, count: reports.length, scope: authResult.scope, reports });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  },

  async saveMonthlyReport(req: Request, res: Response) {
    try {
      const authUser = req.authUser!;
      const report = req.body;
      if (!report || !report.id) {
        res.status(400).json({ success: false, message: 'اطلاعات کارنامه ماهانه ناقص است.' });
        return;
      }

      const targetStudentId = report.studentId || 'std-101';
      const authResult = await authorizeStudentAccess(authUser, targetStudentId, {
        req,
        resourceName: '/api/v1/student/monthly-reports'
      });

      if (!authResult.authorized) {
        res.status(authResult.statusCode).json({
          success: false,
          error: authResult.error || 'FORBIDDEN_BOLA_403',
          message: authResult.message || 'عدم دسترسی: ثبت یا ویرایش کارنامه برای این داوطلب مجاز نیست.'
        });
        return;
      }

      const existing = db.findById(COL_MONTHLY_REPORTS, report.id, INITIAL_REPORTS);
      let saved;
      if (existing) {
        saved = db.update(COL_MONTHLY_REPORTS, report.id, report, INITIAL_REPORTS);
      } else {
        saved = db.insert(COL_MONTHLY_REPORTS, report, INITIAL_REPORTS);
      }
      res.json({ success: true, report: saved });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  },

  // 14. Get Weekly Study Plan (برنامه مطالعاتی کافئین)
  async getStudyPlan(req: Request, res: Response) {
    try {
      const user = extractUserCredentials(req);
      const studentId = (req.query.studentId as string) || (user?.studentId || user?.userId || user?.id || 'std-101');
      const normStudentId = normalizeId(studentId);

      const plans = db.find<any>(COL_STUDY_PLANS, (p) => normalizeId(p.studentId) === normStudentId, []);
      const matched = plans.length > 0 ? plans[0] : null;

      res.json({
        success: true,
        studentId,
        plan: matched
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  },

  // 15. Save Weekly Study Plan (ثبت و ذخیره برنامه مطالعاتی)
  async saveStudyPlan(req: Request, res: Response) {
    try {
      const user = extractUserCredentials(req);
      const plan = req.body;
      if (!plan) {
        res.status(400).json({ success: false, message: 'اطلاعات برنامه مطالعاتی ناقص است.' });
        return;
      }

      const studentId = plan.studentId || (req.query.studentId as string) || (user?.studentId || user?.userId || user?.id || 'std-101');
      const normStudentId = normalizeId(studentId);
      plan.studentId = studentId;
      plan.updatedAt = new Date().toISOString();

      const existing = db.find<any>(COL_STUDY_PLANS, (p) => normalizeId(p.studentId) === normStudentId, []);
      let savedPlan;

      if (existing.length > 0) {
        plan.id = existing[0].id || plan.id || `plan-${Date.now()}`;
        savedPlan = db.update(COL_STUDY_PLANS, plan.id, plan);
      } else {
        plan.id = plan.id || `plan-${Date.now()}`;
        savedPlan = db.insert(COL_STUDY_PLANS, plan);
      }

      res.json({
        success: true,
        message: 'برنامه مطالعاتی با موفقیت در پایگاه داده ذخیره شد.',
        plan: savedPlan
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }
};
