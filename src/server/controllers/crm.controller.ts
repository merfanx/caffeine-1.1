import { Request, Response } from 'express';
import { db } from '../storage/dbBridge.js';
import { sanitizeString } from '../security/apiHardening.js';
import { normalizeIranianMobile, maskPhoneNumber, dispatchSmsIrBroadcast } from '../services/smsService.js';
import { MOCK_LEADS } from '../../data/mockDatabase.js';
import { Lead } from '../../types.js';

const COL_LEADS = 'leads';
const COL_STUDENTS = 'student_profiles';
const DEFAULT_STUDENTS_LIST: any[] = [];

function getRequestIp(req: Request): string {
  return (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.ip || '127.0.0.1';
}

export const crmController = {
  // 1. Get Leads List with Filters & Search
  getLeads(req: Request, res: Response) {
    try {
      const { status, group, search } = req.query;
      let results = db.find<Lead>(COL_LEADS, undefined, MOCK_LEADS);

      if (status && status !== 'all') {
        results = results.filter((l) => l.status === status);
      }
      if (group && group !== 'all') {
        results = results.filter((l) => l.group === group);
      }
      if (search && typeof search === 'string') {
        const query = search.toLowerCase();
        results = results.filter((l) => l.fullName.toLowerCase().includes(query) || l.phone.includes(query));
      }

      res.json({
        success: true,
        totalCount: results.length,
        leads: results
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  },

  // 2. Create Lead
  createLead(req: Request, res: Response) {
    try {
      const { fullName, phone, grade, group, goalUniversity, goalMajor, score, source } = req.body;

      if (!phone) {
        res.status(400).json({ success: false, message: 'شماره تماس الزامی است.' });
        return;
      }

      const safeName = fullName ? sanitizeString(String(fullName)).sanitized : 'داوطلب جدید';
      const safePhone = sanitizeString(String(phone)).sanitized;

      const newLead: Lead = {
        id: `lead-${Date.now()}`,
        fullName: safeName,
        phone: safePhone,
        grade: grade || '12th',
        group: group || 'experimental',
        goalUniversity: goalUniversity || 'دانشگاه تهران',
        goalMajor: goalMajor || 'پزشکی',
        score: Number(score) || 75,
        source: (source as any) || 'external_api',
        landingPage: 'headless-api',
        status: 'new',
        notes: [],
        contactAttempts: 0,
        createdAt: new Date().toISOString()
      };

      const inserted = db.insert<Lead>(COL_LEADS, newLead, MOCK_LEADS);
      res.json({ success: true, lead: inserted });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  },

  // 3. Update Lead
  updateLead(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status, note, assignedAdvisorId } = req.body;

      const lead = db.findById<Lead>(COL_LEADS, id, MOCK_LEADS);
      if (!lead) {
        res.status(404).json({ success: false, message: 'سرنخ یافت نشد.' });
        return;
      }

      const updates: Partial<Lead> = {};
      if (status) updates.status = status;
      if (assignedAdvisorId) updates.assignedAdvisorId = assignedAdvisorId;
      if (note) {
        const safeNote = sanitizeString(String(note)).sanitized;
        const updatedNotes = [...(lead.notes || [])];
        updatedNotes.push(`${new Date().toLocaleDateString('fa-IR')} ${new Date().toLocaleTimeString('fa-IR')}: ${safeNote}`);
        updates.notes = updatedNotes;
        updates.contactAttempts = (lead.contactAttempts || 0) + 1;
      }

      const updated = db.update<Lead>(COL_LEADS, id, updates, MOCK_LEADS);
      res.json({ success: true, lead: updated });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  },

  // 4. SMS Broadcast: Recipients Summary
  getRecipientsSummary(req: Request, res: Response) {
    try {
      const leads = db.find<any>(COL_LEADS, undefined, MOCK_LEADS) || [];
      const students = db.find<any>(COL_STUDENTS, undefined, DEFAULT_STUDENTS_LIST) || [];

      const leadsPhones = leads
        .map((l) => (l.phone ? normalizeIranianMobile(l.phone) : ''))
        .filter((p) => /^09\d{9}$/.test(p));
      const uniqueLeadsPhones = Array.from(new Set(leadsPhones));

      const allStudentsPhones = students
        .map((s) => (s.phone ? normalizeIranianMobile(s.phone) : ''))
        .filter((p) => /^09\d{9}$/.test(p));
      const uniqueAllStudents = Array.from(new Set(allStudentsPhones));

      const grade12Phones = students
        .filter((s) => s.grade === '12th' || s.grade === 'konkur')
        .map((s) => (s.phone ? normalizeIranianMobile(s.phone) : ''))
        .filter((p) => /^09\d{9}$/.test(p));
      const unique12th = Array.from(new Set(grade12Phones));

      const baseGradePhones = students
        .filter((s) => s.grade === '10th' || s.grade === '11th')
        .map((s) => (s.phone ? normalizeIranianMobile(s.phone) : ''))
        .filter((p) => /^09\d{9}$/.test(p));
      const uniqueBase = Array.from(new Set(baseGradePhones));

      const parentPhones = students
        .map((s) => (s.parentPhone ? normalizeIranianMobile(s.parentPhone) : ''))
        .filter((p) => /^09\d{9}$/.test(p));
      const uniqueParents = Array.from(new Set(parentPhones));

      res.json({
        success: true,
        audiences: {
          leads: {
            label: 'تمامی سرنخ‌ها و متقاضیان مشاوره',
            count: uniqueLeadsPhones.length,
            sample: uniqueLeadsPhones.slice(0, 3).map(maskPhoneNumber)
          },
          students_all: {
            label: 'تمامی دانش‌آموزان ثبت‌نامی آکادمی',
            count: uniqueAllStudents.length,
            sample: uniqueAllStudents.slice(0, 3).map(maskPhoneNumber)
          },
          students_12th: {
            label: 'دانش‌آموزان کنکوری و پایه دوازدهم',
            count: unique12th.length,
            sample: unique12th.slice(0, 3).map(maskPhoneNumber)
          },
          students_base: {
            label: 'دانش‌آموزان پایه‌های دهم و یازدهم',
            count: uniqueBase.length,
            sample: uniqueBase.slice(0, 3).map(maskPhoneNumber)
          },
          parents: {
            label: 'شماره‌های ثبت‌شده اولیا و والدین',
            count: uniqueParents.length,
            sample: uniqueParents.slice(0, 3).map(maskPhoneNumber)
          }
        }
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  },

  // 5. SMS Broadcast: Send Bulk Campaign
  async sendBroadcast(req: Request, res: Response) {
    try {
      const {
        title = 'اطلاع‌رسانی همگانی',
        targetAudience = 'leads',
        customMobiles = [],
        messageText,
        senderLine
      } = req.body;

      if (!messageText || typeof messageText !== 'string' || messageText.trim().length === 0) {
        res.status(400).json({ success: false, message: 'متن پیامک ارسالی نمی‌تواند خالی باشد.' });
        return;
      }

      let targetPhones: string[] = [];

      if (targetAudience === 'custom') {
        if (Array.isArray(customMobiles)) {
          targetPhones = customMobiles;
        } else if (typeof customMobiles === 'string') {
          targetPhones = customMobiles.split(/[\n,;،\s]+/).filter(Boolean);
        }
      } else if (targetAudience === 'leads') {
        const leads = db.find<any>(COL_LEADS, undefined, MOCK_LEADS) || [];
        targetPhones = leads.map((l) => l.phone).filter(Boolean);
      } else if (targetAudience === 'students_all') {
        const students = db.find<any>(COL_STUDENTS, undefined, DEFAULT_STUDENTS_LIST) || [];
        targetPhones = students.map((s) => s.phone).filter(Boolean);
      } else if (targetAudience === 'students_12th') {
        const students = db.find<any>(COL_STUDENTS, undefined, DEFAULT_STUDENTS_LIST) || [];
        targetPhones = students.filter((s) => s.grade === '12th' || s.grade === 'konkur').map((s) => s.phone).filter(Boolean);
      } else if (targetAudience === 'students_base') {
        const students = db.find<any>(COL_STUDENTS, undefined, DEFAULT_STUDENTS_LIST) || [];
        targetPhones = students.filter((s) => s.grade === '10th' || s.grade === '11th').map((s) => s.phone).filter(Boolean);
      } else if (targetAudience === 'parents') {
        const students = db.find<any>(COL_STUDENTS, undefined, DEFAULT_STUDENTS_LIST) || [];
        targetPhones = students.map((s) => s.parentPhone).filter(Boolean);
      }

      const cleanMobiles = Array.from(
        new Set(
          targetPhones
            .map((p) => normalizeIranianMobile(p))
            .filter((p) => /^09\d{9}$/.test(p))
        )
      );

      if (cleanMobiles.length === 0) {
        res.status(400).json({
          success: false,
          message: 'هیچ شماره موبایل معتبری برای گروه مخاطبان انتخاب‌شده یافت نشد.'
        });
        return;
      }

      const startTime = Date.now();
      let resJson: any = null;
      let isSuccess = false;
      let errorMsg = '';

      try {
        resJson = await dispatchSmsIrBroadcast(messageText, cleanMobiles, senderLine);
        if (resJson && (resJson.status === 1 || resJson.data?.packId || resJson.data?.messageId)) {
          isSuccess = true;
        } else {
          errorMsg = resJson?.message || 'پاسخ ناموفق از سامانه SMS.ir';
        }
      } catch (err: any) {
        errorMsg = err.message || 'خطا در اتصال به سامانه SMS.ir';
      }

      const latencyMs = Date.now() - startTime;

      res.json({
        success: isSuccess,
        message: isSuccess ? 'کمپین پیامکی با موفقیت به سامانه SMS.ir تحویل شد.' : `خطا در ارسال: ${errorMsg}`,
        campaign: {
          title,
          targetAudience,
          recipientsCount: cleanMobiles.length,
          messageText,
          packId: resJson?.data?.packId,
          cost: resJson?.data?.cost,
          latencyMs
        }
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }
};
