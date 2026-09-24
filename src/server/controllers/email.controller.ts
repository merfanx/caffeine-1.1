import { Request, Response } from 'express';
import {
  sendEmail,
  sendWelcomeEmail,
  sendOtpEmail,
  sendStudyPlanEmail,
  sendAssessmentResultEmail,
  sendReportCardEmail,
  getEmailLogs,
  getEffectiveEmailConfig,
  updateEmailCredentials,
  hasConfiguredSmtpCredentials,
  EmailLogEntry
} from '../services/emailService.js';
import { db } from '../storage/dbBridge.js';
import { sanitizeString } from '../security/apiHardening.js';

const COL_STUDENTS = 'student_profiles';
const COL_LEADS = 'leads';

export const emailController = {
  // 1. Get SMTP & Email Settings
  async getSettings(req: Request, res: Response) {
    try {
      const config = getEffectiveEmailConfig();
      const hasRealSmtp = hasConfiguredSmtpCredentials();

      res.json({
        success: true,
        host: config.host,
        port: config.port,
        secure: config.secure,
        user: config.user,
        fromName: config.fromName,
        fromAddress: config.fromAddress,
        hasPassword: Boolean(config.pass),
        maskedPassword: config.pass ? '••••••••••••' : '',
        isActive: config.isActive,
        status: hasRealSmtp ? 'operational' : 'SIMULATED'
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  },

  // 2. Update SMTP & Email Settings
  async updateSettings(req: Request, res: Response) {
    try {
      const { host, port, secure, user, pass, fromName, fromAddress, isActive } = req.body;
      const updated = updateEmailCredentials({
        host: host ? String(host).trim() : undefined,
        port: port !== undefined ? Number(port) : undefined,
        secure: typeof secure === 'boolean' ? secure : undefined,
        user: user !== undefined ? String(user).trim() : undefined,
        pass: pass !== undefined && pass !== '' ? String(pass).trim() : undefined,
        fromName: fromName !== undefined ? String(fromName).trim() : undefined,
        fromAddress: fromAddress !== undefined ? String(fromAddress).trim() : undefined,
        isActive: typeof isActive === 'boolean' ? isActive : undefined
      });

      const hasRealSmtp = hasConfiguredSmtpCredentials();

      res.json({
        success: true,
        message: 'تنظیمات سرور ایمیل با موفقیت در پایگاه داده ذخیره شد.',
        settings: {
          host: updated.host,
          port: updated.port,
          secure: updated.secure,
          user: updated.user,
          fromName: updated.fromName,
          fromAddress: updated.fromAddress,
          hasPassword: Boolean(updated.pass),
          maskedPassword: updated.pass ? '••••••••••••' : '',
          isActive: updated.isActive,
          status: hasRealSmtp ? 'operational' : 'SIMULATED'
        }
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  },

  // 3. Test Email Dispatch
  async testEmail(req: Request, res: Response) {
    try {
      const { to } = req.body;
      if (!to || !to.includes('@')) {
        res.status(400).json({ success: false, message: 'لطفاً یک آدرس ایمیل معتبر برای تست وارد کنید.' });
        return;
      }

      const config = getEffectiveEmailConfig();
      const hasRealSmtp = hasConfiguredSmtpCredentials();

      if (!hasRealSmtp) {
        res.status(400).json({
          success: false,
          message: `تنظیمات پیش‌فرض سرور Gmail برای اکانت ${config.user || 'شما'} ثبت شده است. برای اینکه ایمیل تستی واقعاً در اینباکس جیمیل شما بنشیند، لطفاً «رمز عبور برنامه» (App Password ۱۶ رقمی) را در کادر کلمه عبور وارد کرده و دکمه «ذخیره تنظیمات» را بزنید.`,
          error: 'MISSING_SMTP_PASSWORD'
        });
        return;
      }

      const cleanTo = sanitizeString(String(to)).sanitized;
      const resData = await sendEmail({
        to: cleanTo,
        subject: 'تست موفقیت‌آمیز ارتباط سرور ایمیل کافئین ☕⚡',
        html: `
          <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; direction: rtl; text-align: right; background-color: #f8fafc; padding: 24px;">
            <div style="max-width: 500px; margin: 0 auto; background: #ffffff; border-radius: 16px; padding: 28px; box-shadow: 0 4px 16px rgba(0,0,0,0.05); border: 1px solid #e2e8f0;">
              <div style="text-align: center; margin-bottom: 20px;">
                <h2 style="color: #3C0E11; margin: 0 0 6px;">🎉 تست ارتباط سرور ایمیل کافئین موفق بود!</h2>
                <p style="color: #64748b; font-size: 13px; margin: 0;">ماژول ارسال ایمیل پلتفرم کافئین با موفقیت به اینباکس متصل گردید.</p>
              </div>
              <div style="background: #fdfaf6; border: 1px solid #f2e3d5; border-radius: 12px; padding: 14px; margin: 18px 0; font-size: 13px;">
                <div style="margin-bottom: 6px;"><strong>گیرنده:</strong> ${cleanTo}</div>
                <div style="margin-bottom: 6px;"><strong>فرستنده:</strong> ${config.fromName} (${config.fromAddress})</div>
                <div style="margin-bottom: 6px;"><strong>زمان ارسال:</strong> ${new Date().toLocaleString('fa-IR')}</div>
                <div><strong>وضعیت:</strong> تحویل داده شده به اینباکس واقعی</div>
              </div>
              <p style="color: #475569; font-size: 13px; line-height: 1.7;">
                این پیام تأیید می‌کند که ارتباط سامانه با سرور SMTP با موفقیت برقرار است و تمام پیام‌های سیستمی، کدهای تایید، کارنامه‌ها و پلن‌های درسی به اینباکس تحویل خواهند شد.
              </p>
            </div>
          </div>
        `,
        templateType: 'custom_notification',
        metadata: { isTest: true }
      });

      if (!resData.success) {
        res.status(400).json({
          success: false,
          message: resData.message,
          error: resData.error || 'SMTP_DISPATCH_ERROR'
        });
        return;
      }

      res.json({
        success: true,
        status: 'DELIVERED',
        message: `ایمیل تستی با موفقیت به اینباکس ${cleanTo} ارسال شد.`,
        previewUrl: resData.previewUrl,
        logId: resData.logId,
        messageId: resData.messageId
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message, message: 'خطای سیستمی در اجرای تست ایمیل.' });
    }
  },

  // 4. Send Generic / Custom Email
  async sendGenericEmail(req: Request, res: Response) {
    try {
      const { to, subject, html, text, templateType = 'custom_notification', metadata } = req.body;
      if (!to || !subject) {
        res.status(400).json({ success: false, message: 'آدرس ایمیل و موضوع پیام الزامی است.' });
        return;
      }

      const cleanTo = sanitizeString(String(to)).sanitized;
      const cleanSubject = sanitizeString(String(subject)).sanitized;

      const result = await sendEmail({
        to: cleanTo,
        subject: cleanSubject,
        html: html || `<p>${text || cleanSubject}</p>`,
        text,
        templateType,
        metadata
      });

      res.json(result);
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  },

  // 5. Send Welcome Email
  async sendWelcome(req: Request, res: Response) {
    try {
      const { to, fullName, role = 'student', studentId } = req.body;
      if (!to) {
        res.status(400).json({ success: false, message: 'ایمیل گیرنده الزامی است.' });
        return;
      }

      const result = await sendWelcomeEmail(to, fullName, role, studentId);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  },

  // 6. Send Assessment Report Email
  async sendAssessmentReport(req: Request, res: Response) {
    try {
      const { to, studentName, score, archetype, primaryBlocker, prescriptionSummary } = req.body;
      if (!to) {
        res.status(400).json({ success: false, message: 'ایمیل گیرنده الزامی است.' });
        return;
      }

      const result = await sendAssessmentResultEmail(
        to,
        studentName || 'داوطلب کافئین',
        Number(score) || 75,
        archetype || 'کمال‌گرای اهمال‌کار',
        primaryBlocker || 'مقاومت در شروع مطالعه',
        prescriptionSummary || ''
      );

      res.json(result);
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  },

  // 7. Send Study Plan Email
  async sendStudyPlan(req: Request, res: Response) {
    try {
      const { to, studentName, planTitle, weekNumber = 1, totalHours = 45, advisorName } = req.body;
      if (!to) {
        res.status(400).json({ success: false, message: 'ایمیل گیرنده الزامی است.' });
        return;
      }

      const result = await sendStudyPlanEmail(
        to,
        studentName || 'دانش‌آموز عزیز',
        planTitle || 'کافئین پلن هفته اول',
        weekNumber,
        totalHours,
        advisorName || 'دکتر کاظمی'
      );

      res.json(result);
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  },

  // 8. Send Monthly Report Card Email
  async sendReportCard(req: Request, res: Response) {
    try {
      const { to, studentName, monthName = 'شهریور', studyHours = 180, testCount = 3200, advisorNote = '' } = req.body;
      if (!to) {
        res.status(400).json({ success: false, message: 'ایمیل گیرنده الزامی است.' });
        return;
      }

      const result = await sendReportCardEmail(
        to,
        studentName || 'دانش‌آموز',
        monthName,
        studyHours,
        testCount,
        advisorNote
      );

      res.json(result);
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  },

  // 9. Get Email Logs
  async getLogs(req: Request, res: Response) {
    try {
      const limit = Number(req.query.limit) || 50;
      const logs = getEmailLogs(limit);
      res.json({
        success: true,
        total: logs.length,
        logs
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  },

  // 10. Broadcast Email to Audience
  async sendBroadcast(req: Request, res: Response) {
    try {
      const { audience = 'all_students', subject, message, customRecipients = [] } = req.body;

      if (!subject || !message) {
        res.status(400).json({ success: false, message: 'موضوع و متن ایمیل الزامی است.' });
        return;
      }

      let emails: string[] = [];

      if (audience === 'custom' && Array.isArray(customRecipients)) {
        emails = customRecipients.filter((e) => typeof e === 'string' && e.includes('@'));
      } else {
        const students = db.find<any>(COL_STUDENTS, undefined, []) || [];
        const leads = db.find<any>(COL_LEADS, undefined, []) || [];

        if (audience === 'all_students' || audience === 'all') {
          students.forEach((s) => {
            if (s.email && s.email.includes('@')) emails.push(s.email);
          });
        }
        if (audience === 'all_leads' || audience === 'all') {
          leads.forEach((l) => {
            if (l.email && l.email.includes('@')) emails.push(l.email);
          });
        }
      }

      // De-duplicate
      emails = Array.from(new Set(emails.map((e) => e.trim().toLowerCase())));

      if (emails.length === 0) {
        res.status(400).json({
          success: false,
          message: 'هیچ آدرس ایمیل معتبری در گروه مخاطبان انتخابی یافت نشد.'
        });
        return;
      }

      let delivered = 0;
      let failed = 0;

      for (const email of emails) {
        const resSend = await sendEmail({
          to: email,
          subject,
          html: `<div style="line-height: 1.8; color: #1e293b;"><p>${message.replace(/\n/g, '<br>')}</p></div>`,
          templateType: 'custom_notification',
          metadata: { broadcastAudience: audience }
        });

        if (resSend.success) delivered++;
        else failed++;
      }

      res.json({
        success: true,
        message: `عملیات ارسال ایمیل گروهی انجام شد: ${delivered} ارسال موفق، ${failed} ناموفق.`,
        totalRecipients: emails.length,
        delivered,
        failed
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }
};
