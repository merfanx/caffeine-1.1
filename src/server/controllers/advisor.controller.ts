import { Request, Response } from 'express';
import { db } from '../storage/dbBridge.js';
import { authorizeStudentAccess } from '../security/studentAuthorizationService.js';
import { normalizeId } from '../security/bolaIdorService.js';

const COL_STUDENTS = 'student_profiles';
const COL_ADVISORS = 'advisors';
const COL_AT_RISK = 'at_risk_students';

export const OFFICIAL_ADVISORS = [
  {
    id: 'adv-1',
    name: 'دکتر علیرضا کاظمی',
    title: 'مشاور ارشد و طراح برنامه‌ریزی استراتژیک کنکور',
    rankInKonkur: 'رتبه ۲۱ کنکور سراسری تجربی',
    university: 'دانشگاه علوم پزشکی تهران',
    activeStudents: 18,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80'
  },
  {
    id: 'adv-2',
    name: 'مهندس امیرحسین رضایی',
    title: 'سرپرست دپارتمان ریاضی و فیزیک',
    rankInKonkur: 'رتبه ۴۲ کنکور سراسری ریاضی',
    university: 'دانشگاه صنعتی شریف',
    activeStudents: 14,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80'
  }
];

export const advisorController = {
  // 1. Get All Advisors
  getAdvisors(req: Request, res: Response) {
    try {
      const advisors = db.find<any>(COL_ADVISORS, undefined, OFFICIAL_ADVISORS);
      res.json({
        success: true,
        count: advisors.length,
        advisors
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  },

  // 2. Get Assigned Students for Advisor
  getAssignedStudents(req: Request, res: Response) {
    try {
      const authUser = req.authUser!;
      const students = db.find<any>(COL_STUDENTS, undefined, []) || [];

      if (authUser.role === 'admin' || authUser.role === 'super_admin') {
        res.json({
          success: true,
          count: students.length,
          students
        });
        return;
      }

      const myAdvisorId = normalizeId(authUser.advisorId || authUser.userId || authUser.id);
      const scoped = students.filter((s) => {
        const advId = normalizeId(s.advisorId);
        return !advId || advId === myAdvisorId;
      });

      res.json({
        success: true,
        count: scoped.length,
        students: scoped
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  },

  // 3. Get At Risk Students
  getStudentsAtRisk(req: Request, res: Response) {
    try {
      const authUser = req.authUser!;
      let scopedList = db.find<any>(COL_AT_RISK, undefined, []);

      if (authUser.role === 'advisor') {
        const myAdvisorId = normalizeId(authUser.advisorId || authUser.userId || authUser.id);
        scopedList = scopedList.filter((s: any) => {
          const studentAdvId = normalizeId(s.advisorId);
          return !studentAdvId || studentAdvId === myAdvisorId;
        });
      }

      res.json({
        success: true,
        totalMonitored: scopedList.length,
        atRiskCount: scopedList.length,
        students: scopedList
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  },

  // 4. Copilot: Draft Feedback
  async draftFeedback(req: Request, res: Response) {
    try {
      const authUser = req.authUser!;
      const { studentId = 'std-101', tone = 'supportive_expert' } = req.body;

      const authResult = await authorizeStudentAccess(authUser, studentId, {
        req,
        resourceName: '/api/v1/advisor/copilot/draft-feedback'
      });

      if (!authResult.authorized) {
        res.status(authResult.statusCode).json({
          success: false,
          error: authResult.error || 'FORBIDDEN_BOLA_403',
          message: authResult.message || 'عدم دسترسی: شما فقط مجاز به تحلیل داده‌ها و فیدبک هوش مصنوعی برای داوطلبان تحت نظارت خود هستید.'
        });
        return;
      }

      const student = authResult.student || db.findById(COL_STUDENTS, studentId) || { name: 'داوطلب گرامی' };

      const generatedScript = `سلام ${student.name} عزیز. 
تحلیل داده‌های هفتگی‌ات رو بررسی کردم: مطالعه و تست‌های ثبت‌شده حاکی از تلاش مستمر شماست. 
در پارت‌های تستی زمان‌دار تمرکز را حفظ کن تا قبل از آزمون به تسلط کامل برسی. به تلاشت با همین انرژی ادامه بده!`;

      res.json({
        success: true,
        model: 'GLM-4-Air / Quick Briefing Router',
        generatedAt: new Date().toISOString(),
        feedbackScript: generatedScript,
        actionItems: [
          'تایید و ارسال وویس ۱ دقیقه‌ای بر اساس تحلیل روند',
          'افزودن پارت تست زمان‌دار در برنامه هفتگی',
          'پایش نمره تراز در آزمون جامع جمعه'
        ]
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  },

  // 5. Assign Advisor to Student (Admin Only)
  assignAdvisor(req: Request, res: Response) {
    try {
      const { studentId, advisorId } = req.body;
      if (!studentId || !advisorId) {
        res.status(400).json({ success: false, message: 'شناسه دانش‌آموز و شناسه مشاور الزامی است.' });
        return;
      }

      const advisors = db.find<any>(COL_ADVISORS, undefined, OFFICIAL_ADVISORS);
      const student = db.findById<any>(COL_STUDENTS, studentId);
      const advisor = advisors.find((a) => a.id === advisorId);

      if (!advisor) {
        res.status(404).json({ success: false, message: 'مشاور مورد نظر یافت نشد.' });
        return;
      }

      if (student) {
        student.advisorId = advisor.id;
        student.advisorName = advisor.name;
        db.update(COL_STUDENTS, student.id, student);
      } else {
        db.insert(COL_STUDENTS, {
          id: studentId,
          name: `دانش‌آموز ${studentId}`,
          advisorId: advisor.id,
          advisorName: advisor.name,
          createdAt: new Date().toISOString()
        });
      }

      res.json({
        success: true,
        message: `مشاور ${advisor.name} با موفقیت به دانش‌آموز تخصیص داده شد.`,
        advisor
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }
};
