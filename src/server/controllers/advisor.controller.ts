import { Request, Response } from 'express';
import { db } from '../storage/dbBridge.js';
import { authorizeStudentAccess } from '../security/studentAuthorizationService.js';
import { normalizeId } from '../security/bolaIdorService.js';
import { ADVISORS, AT_RISK_STUDENTS } from '../../data/mockDatabase.js';

const COL_STUDENTS = 'student_profiles';
const DEFAULT_STUDENTS_LIST: any[] = [];

const MOCK_STUDENT_PROFILE = {
  id: 'std-101',
  name: 'آرین محمدی',
  avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&auto=format&fit=crop&q=80',
  title: 'داوطلب کنکور تجربی ۱۴۰۴',
  grade: '12th',
  group: 'experimental',
  targetMajor: 'پزشکی',
  targetUniversity: 'دانشگاه علوم پزشکی تهران',
  healthScore: 88,
  healthStatus: 'green',
  advisorName: 'دکتر علیرضا کاظمی',
  advisorId: 'adv-1'
};

export const advisorController = {
  // 1. Get All Advisors
  getAdvisors(req: Request, res: Response) {
    try {
      res.json({
        success: true,
        count: ADVISORS.length,
        advisors: ADVISORS
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  },

  // 2. Get Assigned Students for Advisor
  getAssignedStudents(req: Request, res: Response) {
    try {
      const authUser = req.authUser!;
      const students = db.find<any>(COL_STUDENTS, undefined, DEFAULT_STUDENTS_LIST) || [];

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
      let scopedList = [...AT_RISK_STUDENTS];

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

      const student = authResult.student || db.findById(COL_STUDENTS, studentId, [MOCK_STUDENT_PROFILE]) || MOCK_STUDENT_PROFILE;

      const generatedScript = `سلام ${student.name} عزیز. 
تحلیل داده‌های هفتگی‌ات رو بررسی کردم: ۴۶.۵ ساعت مطالعه با ۹۸۰ تست ثبت کردی. 
در درس زیست‌شناسی روند جهشی عالی داشتی (+۸٪)، اما در تست‌های شیمی زمان‌دار سرعت حل تست‌ها افت ۲۰ درصدی داشته. 
برای برنامه هفته پیش‌رو، ۲ پارت تستی به مبحث استوکیومتری اضافه کردیم تا قبل از آزمون جمعه به تسلط کامل برسی. به تلاشت با همین انرژی ادامه بده!`;

      res.json({
        success: true,
        model: 'GLM-4-Air / Quick Briefing Router',
        generatedAt: new Date().toISOString(),
        feedbackScript: generatedScript,
        actionItems: [
          'تایید و ارسال وویس ۱ دقیقه‌ای بر اساس متن بالا',
          'افزودن پارت تست زمان‌دار شیمی در برنامه شنبه',
          'پایش نمره تراز در آزمون قلم‌چی جمعه'
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

      const student = db.findById<any>(COL_STUDENTS, studentId, [MOCK_STUDENT_PROFILE]);
      const advisor = ADVISORS.find((a) => a.id === advisorId);

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
