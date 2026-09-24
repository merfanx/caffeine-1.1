import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';
import { db } from '../storage/dbBridge.js';

export interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  fromName: string;
  fromAddress: string;
  isActive: boolean;
}

export interface EmailLogEntry {
  id: string;
  to: string;
  subject: string;
  type: string;
  status: 'sent' | 'failed';
  error?: string;
  messageId?: string;
  previewUrl?: string;
  sentAt: string;
  provider?: string;
}

export interface SendEmailOptions {
  to: string;
  subject: string;
  html?: string;
  text?: string;
  type?: string;
  templateType?: string;
  metadata?: any;
}

export interface SendEmailResult {
  success: boolean;
  message: string;
  logId: string;
  messageId?: string;
  previewUrl?: string;
  error?: string;
  isTestMode?: boolean;
}

const COL_SETTINGS = 'system_settings';
const COL_EMAIL_LOGS = 'email_logs';
const EMAIL_CONFIG_ID = 'email_config';

let inMemoryEmailConfig: Partial<EmailConfig> = {};
let cachedTransporter: Transporter | null = null;
let cachedTransporterKey = '';
let testAccountPromise: Promise<nodemailer.TestAccount> | null = null;

/**
 * Translates technical SMTP and network errors into clear, actionable Persian instructions
 */
export function translateSmtpError(err: any): string {
  const msg = String(err?.message || err || '').toLowerCase();
  const code = String(err?.code || '').toUpperCase();

  if (code === 'EAUTH' || msg.includes('invalid login') || msg.includes('authentication failed') || msg.includes('535') || msg.includes('badcredentials')) {
    return 'خطای احراز هویت سرور ایمیل (نام کاربری یا رمز عبور اشتباه است). در صورت استفاده از Gmail، باید از «گذرواژه برنامه» (App Password ۱۶ رقمی) به جای پسورد اصلی اکانت استفاده کنید.';
  }
  if (code === 'ETIMEDOUT' || msg.includes('timeout') || code === 'ESOCKETTIMEDOUT') {
    return 'تایم‌اوت در اتصال به سرور ایمیل: سرور درگاه به پورت مشخص‌شده پاسخ نداد. بررسی کنید آیا پورت ۵۸۷ یا ۴۶۵ در فایروال هاست باز است یا خیر.';
  }
  if (code === 'ENOTFOUND' || msg.includes('getaddrinfo enotfound')) {
    return 'آدرس هاست سرور ایمیل (SMTP Host) یافت نشد. لطفاً آدرس سرور (مثلاً smtp.gmail.com یا mail.domain.com) را بررسی نمایید.';
  }
  if (code === 'ECONNREFUSED' || msg.includes('connection refused')) {
    return 'اتصال توسط سرور مقصد رد شد (Connection Refused). لطفاً شماره پورت و فعال بودن سرویس SMTP در هاست را بررسی نمایید.';
  }
  if (msg.includes('self signed certificate') || msg.includes('certificate')) {
    return 'خطای گواهی امنیتی SSL/TLS سرور ایمیل. حالت گواهی معتبر هاست را بررسی کنید.';
  }

  return err?.message || 'خطای ناشناخته در ارسال ایمیل از درگاه SMTP';
}

/**
 * Retrieves the effective email configuration with persistent database precedence
 */
export function getEffectiveEmailConfig(): EmailConfig {
  let dbConfig: Partial<EmailConfig> = {};
  try {
    const saved = db.findById<any>(COL_SETTINGS, EMAIL_CONFIG_ID, []);
    if (saved && typeof saved === 'object') {
      dbConfig = saved;
    }
  } catch (e) {
    // Fallback if db is not ready yet
  }

  const host = inMemoryEmailConfig.host || dbConfig.host || process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = Number(inMemoryEmailConfig.port || dbConfig.port || process.env.SMTP_PORT || 587);
  const secure = inMemoryEmailConfig.secure ?? dbConfig.secure ?? (process.env.SMTP_SECURE === 'true' || port === 465);
  const user = inMemoryEmailConfig.user ?? dbConfig.user ?? process.env.SMTP_USER ?? 'merfanx@gmail.com';
  const pass = inMemoryEmailConfig.pass ?? dbConfig.pass ?? process.env.SMTP_PASS ?? '';
  const fromName = inMemoryEmailConfig.fromName || dbConfig.fromName || process.env.SMTP_FROM_NAME || 'آکادمی کافئین | Caffeine OS';
  const fromAddress = inMemoryEmailConfig.fromAddress || dbConfig.fromAddress || process.env.SMTP_FROM_ADDRESS || process.env.SMTP_FROM || user || 'merfanx@gmail.com';

  const hasCredentials = Boolean(user && pass && host && host !== 'smtp.caffeine-edu.com');
  const isActive = inMemoryEmailConfig.isActive ?? dbConfig.isActive ?? (hasCredentials || Boolean(process.env.SMTP_ACTIVE === 'true'));

  return {
    host,
    port,
    secure,
    user,
    pass,
    fromName,
    fromAddress,
    isActive
  };
}

/**
 * Updates SMTP credentials, saves them permanently to the persistent database, and resets transporter
 */
export function updateEmailCredentials(config: Partial<EmailConfig>): EmailConfig {
  inMemoryEmailConfig = { ...inMemoryEmailConfig, ...config };
  cachedTransporter = null;
  cachedTransporterKey = '';

  const current = getEffectiveEmailConfig();
  const configToSave = {
    id: EMAIL_CONFIG_ID,
    host: config.host !== undefined ? String(config.host).trim() : current.host,
    port: config.port !== undefined ? Number(config.port) : current.port,
    secure: config.secure !== undefined ? Boolean(config.secure) : current.secure,
    user: config.user !== undefined ? String(config.user).trim() : current.user,
    pass: config.pass !== undefined && config.pass !== '' ? String(config.pass).trim() : current.pass,
    fromName: config.fromName !== undefined ? String(config.fromName).trim() : current.fromName,
    fromAddress: config.fromAddress !== undefined ? String(config.fromAddress).trim() : current.fromAddress,
    isActive: config.isActive !== undefined ? Boolean(config.isActive) : current.isActive,
    updatedAt: new Date().toISOString()
  };

  try {
    const existing = db.findById<any>(COL_SETTINGS, EMAIL_CONFIG_ID, []);
    if (existing) {
      db.update(COL_SETTINGS, EMAIL_CONFIG_ID, configToSave, []);
    } else {
      db.insert(COL_SETTINGS, configToSave, []);
    }
  } catch (err) {
    console.warn('[EmailService] Could not persist email config to DB:', err);
  }

  return getEffectiveEmailConfig();
}

/**
 * Checks if the current configuration has user-provided real SMTP credentials
 */
export function hasConfiguredSmtpCredentials(): boolean {
  const c = getEffectiveEmailConfig();
  return Boolean(
    c.user &&
    c.pass &&
    c.host &&
    c.host !== 'smtp.caffeine-edu.com' &&
    !c.user.includes('caffeine-edu.com')
  );
}

/**
 * Builds or retrieves the active Nodemailer transporter
 */
async function getTransporter(): Promise<{ transporter: Transporter; isTestMode: boolean }> {
  const config = getEffectiveEmailConfig();
  const hasRealCreds = hasConfiguredSmtpCredentials();

  if (hasRealCreds) {
    const key = `${config.host}:${config.port}:${config.secure}:${config.user}:${config.pass}`;
    if (cachedTransporter && cachedTransporterKey === key) {
      return { transporter: cachedTransporter, isTestMode: false };
    }

    const transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: {
        user: config.user,
        pass: config.pass
      },
      tls: {
        rejectUnauthorized: false // Essential for Iranian hosts, Let's Encrypt, and cPanel mail servers
      },
      connectionTimeout: 12000,
      greetingTimeout: 10000,
      socketTimeout: 15000
    });

    cachedTransporter = transporter;
    cachedTransporterKey = key;
    return { transporter, isTestMode: false };
  }

  // If no live SMTP credentials configured yet (development/sandbox preview mode),
  // use Ethereal Email test account for real RFC-compliant test dispatch with instant web preview
  if (!testAccountPromise) {
    testAccountPromise = nodemailer.createTestAccount();
  }

  const testAccount = await testAccountPromise;
  const testTransporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass
    },
    tls: {
      rejectUnauthorized: false
    },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000
  });

  return { transporter: testTransporter, isTestMode: true };
}

/**
 * Primary versatile sendEmail method:
 * - Overload 1: sendEmail({ to, subject, html, text, type, templateType, metadata })
 * - Overload 2: sendEmail(to, subject, html, type)
 * Dispatches via live SMTP or Sandbox, and logs in the database.
 */
export async function sendEmail(options: SendEmailOptions): Promise<SendEmailResult>;
export async function sendEmail(to: string, subject: string, html: string, type?: string): Promise<SendEmailResult>;
export async function sendEmail(
  first: string | SendEmailOptions,
  second?: string,
  third?: string,
  fourth?: string
): Promise<SendEmailResult> {
  let to = '';
  let subject = '';
  let html = '';
  let text = '';
  let type = 'general';

  if (typeof first === 'object' && first !== null) {
    to = String(first.to || '').trim();
    subject = String(first.subject || '').trim();
    html = first.html || '';
    text = first.text || '';
    type = first.type || first.templateType || 'general';
  } else {
    to = String(first || '').trim();
    subject = String(second || '').trim();
    html = third || '';
    type = fourth || 'general';
  }

  const logId = `email-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
  const config = getEffectiveEmailConfig();

  const logEntry: EmailLogEntry = {
    id: logId,
    to,
    subject,
    type,
    status: 'sent',
    sentAt: new Date().toISOString()
  };

  if (!to || !to.includes('@')) {
    logEntry.status = 'failed';
    logEntry.error = 'آدرس ایمیل نامعتبر است.';
    try {
      db.insert(COL_EMAIL_LOGS, logEntry);
    } catch (_) {}
    return {
      success: false,
      message: 'آدرس ایمیل مقصد نامعتبر است.',
      error: 'INVALID_EMAIL',
      logId
    };
  }

  try {
    const { transporter, isTestMode } = await getTransporter();

    const fromHeader = config.fromName
      ? `"${config.fromName}" <${config.fromAddress || config.user || 'noreply@caffeine-os.ir'}>`
      : (config.fromAddress || config.user || 'noreply@caffeine-os.ir');

    const info = await transporter.sendMail({
      from: fromHeader,
      to,
      subject,
      html: html || (text ? `<p>${text}</p>` : `<p>${subject}</p>`),
      text: text || undefined
    });

    logEntry.messageId = info.messageId;
    logEntry.provider = isTestMode ? 'Ethereal Sandbox' : `SMTP (${config.host}:${config.port})`;

    let previewUrl: string | undefined;
    if (isTestMode) {
      const url = nodemailer.getTestMessageUrl(info);
      if (url) {
        previewUrl = url;
        logEntry.previewUrl = url;
      }
    }

    try {
      db.insert(COL_EMAIL_LOGS, logEntry);
    } catch (_) {}

    let successMessage = 'ایمیل با موفقیت از طریق درگاه SMTP ارسال شد.';
    if (isTestMode) {
      successMessage = 'ایمیل در محیط تست با موفقیت ارسال شد و در سرور به ثبت رسید. جهت ارسال به اینباکس‌های واقعی در هاست، مشخصات SMTP خود را در بخش تنظیمات وارد نمایید.';
    }

    return {
      success: true,
      message: successMessage,
      logId,
      messageId: info.messageId,
      previewUrl,
      isTestMode
    };
  } catch (err: any) {
    const friendlyError = translateSmtpError(err);
    logEntry.status = 'failed';
    logEntry.error = friendlyError;

    try {
      db.insert(COL_EMAIL_LOGS, logEntry);
    } catch (_) {}

    console.warn(`[EmailService] SMTP Dispatch Failed to ${to}:`, err?.message || err);

    return {
      success: false,
      message: `ارسال ایمیل ناموفق بود: ${friendlyError}`,
      error: err?.message || 'SMTP_ERROR',
      logId
    };
  }
}

/**
 * Send OTP Verification Email
 */
export async function sendOtpEmail(to: string, code: string): Promise<SendEmailResult> {
  const subject = `کد تایید ورود به کافئین: ${code}`;
  const html = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; direction: rtl; text-align: right; background-color: #f8fafc; padding: 30px; border-radius: 16px;">
      <div style="max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 20px; padding: 32px; box-shadow: 0 4px 20px rgba(0,0,0,0.06); border: 1px solid #e2e8f0;">
        <div style="text-align: center; margin-bottom: 24px;">
          <div style="display: inline-block; width: 56px; height: 56px; background-color: #3C0E11; border-radius: 16px; line-height: 56px; color: #C5A880; font-size: 26px; font-weight: bold;">☕</div>
          <h2 style="color: #3C0E11; margin: 16px 0 6px; font-size: 22px;">آکادمی کنکور کافئین</h2>
          <p style="color: #64748b; font-size: 13px; margin: 0;">سامانه جامع مشاوره، آزمون و هدایت تحصیلی</p>
        </div>

        <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 20px 0;" />

        <h3 style="color: #1e293b; font-size: 16px; margin-top: 0;">کد ورود یکبار مصرف شما:</h3>
        <p style="color: #475569; font-size: 14px; line-height: 1.7;">
          جهت ورود یا تکمیل احراز هویت در سامانه، از کد زیر استفاده نمایید:
        </p>

        <div style="background: #faf5ee; border: 2px dashed #C5A880; border-radius: 16px; padding: 20px; text-align: center; margin: 24px 0;">
          <span style="font-size: 34px; font-weight: 900; letter-spacing: 8px; color: #3C0E11; font-family: monospace;">${code}</span>
        </div>

        <p style="color: #94a3b8; font-size: 12px; line-height: 1.6; text-align: center;">
          ⏱️ این کد به مدت <strong>۵ دقیقه</strong> معتبر است.<br>
          چنانچه شما درخواست ورود نداده‌اید، لطفاً این پیام را نادیده بگیرید.
        </p>
      </div>
    </div>
  `;
  return sendEmail({ to, subject, html, type: 'otp' });
}

/**
 * Send Welcome Email
 */
export async function sendWelcomeEmail(to: string, name: string, role = 'student', studentId?: string): Promise<SendEmailResult> {
  const roleTitle = role === 'admin' ? 'مدیر سیستم' : role === 'advisor' ? 'مشاور تحصیلی' : role === 'parent' ? 'اولیاء گرامی' : 'داوطلب کوشا';
  const subject = `به آکادمی تخصصی کنکور کافئین خوش آمدید، ${name}`;
  const html = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; direction: rtl; text-align: right; background-color: #f8fafc; padding: 30px; border-radius: 16px;">
      <div style="max-width: 540px; margin: 0 auto; background: #ffffff; border-radius: 20px; padding: 32px; box-shadow: 0 4px 20px rgba(0,0,0,0.06); border: 1px solid #e2e8f0;">
        <div style="text-align: center; margin-bottom: 24px;">
          <div style="display: inline-block; width: 56px; height: 56px; background-color: #3C0E11; border-radius: 16px; line-height: 56px; color: #C5A880; font-size: 26px; font-weight: bold;">☕</div>
          <h2 style="color: #3C0E11; margin: 16px 0 6px; font-size: 22px;">خوش آمدید ${name}!</h2>
          <p style="color: #64748b; font-size: 13px; margin: 0;">ثبت‌نام شما در آکادمی کافئین با موفقیت انجام شد.</p>
        </div>

        <div style="background: #f8fafc; border-radius: 14px; padding: 18px; margin: 20px 0; border: 1px solid #e2e8f0;">
          <p style="margin: 6px 0; font-size: 14px; color: #334155;"><strong>نقش کاربری:</strong> ${roleTitle}</p>
          ${studentId ? `<p style="margin: 6px 0; font-size: 14px; color: #334155;"><strong>کد داوطلبی:</strong> <span style="font-family: monospace; color: #3C0E11; font-weight: bold;">${studentId}</span></p>` : ''}
          <p style="margin: 6px 0; font-size: 14px; color: #334155;"><strong>تاریخ فعال‌سازی:</strong> ${new Date().toLocaleDateString('fa-IR')}</p>
        </div>

        <p style="color: #475569; font-size: 14px; line-height: 1.8;">
          اکنون می‌توانید با مراجعه به پرتال اختصاصی خود، برنامه‌های مطالعاتی هفتگی، آزمون‌های شبیه‌ساز کنکور، و تحلیل‌های پیشرفته را مشاهده فرمایید.
        </p>

        <div style="text-align: center; margin-top: 28px;">
          <a href="https://caffeine-os.ir" style="display: inline-block; background-color: #3C0E11; color: #ffffff; padding: 12px 28px; border-radius: 12px; font-weight: bold; text-decoration: none; font-size: 14px;">ورود به پرتال دانش‌آموزی ←</a>
        </div>
      </div>
    </div>
  `;
  return sendEmail({ to, subject, html, type: 'welcome' });
}

/**
 * Send Study Plan Notification Email
 */
export async function sendStudyPlanEmail(
  to: string,
  studentName: string,
  planTitle: string,
  weekNumber = 1,
  totalHours = 45,
  advisorName = 'دکتر کاظمی'
): Promise<SendEmailResult> {
  const subject = `برنامه مطالعاتی جدید: ${planTitle} (هفته ${weekNumber})`;
  const html = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; direction: rtl; text-align: right; background-color: #f8fafc; padding: 30px; border-radius: 16px;">
      <div style="max-width: 540px; margin: 0 auto; background: #ffffff; border-radius: 20px; padding: 32px; box-shadow: 0 4px 20px rgba(0,0,0,0.06); border: 1px solid #e2e8f0;">
        <h2 style="color: #3C0E11; margin-top: 0; font-size: 20px;">📅 برنامه مطالعاتی جدید برای ${studentName}</h2>
        <p style="color: #475569; font-size: 14px; line-height: 1.8;">
          مشاور ارشد شما، <strong>${advisorName}</strong>، برنامه جدید هفتگی شما را با عنوان «<strong>${planTitle}</strong>» در پرتال بارگذاری نمود.
        </p>

        <div style="background: #fdfaf6; border: 1px solid #f2e3d5; border-radius: 14px; padding: 18px; margin: 20px 0;">
          <p style="margin: 6px 0; font-size: 14px; color: #334155;"><strong>هفته مطالعاتی:</strong> هفته ${weekNumber}</p>
          <p style="margin: 6px 0; font-size: 14px; color: #334155;"><strong>حجم مطالعه هدف:</strong> ${totalHours} ساعت در هفته</p>
          <p style="margin: 6px 0; font-size: 14px; color: #334155;"><strong>مشاور تنظیم‌کننده:</strong> ${advisorName}</p>
        </div>

        <p style="color: #64748b; font-size: 13px;">لطفاً جهت مشاهده جزئیات باکس‌های مطالعاتی و ثبت گزارش کار روزانه وارد سامانه شوید.</p>
      </div>
    </div>
  `;
  return sendEmail({ to, subject, html, type: 'study_plan' });
}

/**
 * Send Comprehensive Assessment Result Email
 */
export async function sendAssessmentResultEmail(
  to: string,
  studentName: string,
  score: number,
  archetype = 'کمال‌گرای اهمال‌کار',
  primaryBlocker = 'مقاومت در شروع مطالعه',
  prescriptionSummary = ''
): Promise<SendEmailResult> {
  const subject = `نتیجه ارزیابی هوشمند سطح کنکور: ${studentName} (امتیاز ${score}/۱۰۰)`;
  const html = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; direction: rtl; text-align: right; background-color: #f8fafc; padding: 30px; border-radius: 16px;">
      <div style="max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 20px; padding: 32px; box-shadow: 0 4px 20px rgba(0,0,0,0.06); border: 1px solid #e2e8f0;">
        <div style="text-align: center; margin-bottom: 24px;">
          <div style="display: inline-block; width: 56px; height: 56px; background-color: #3C0E11; border-radius: 16px; line-height: 56px; color: #C5A880; font-size: 26px; font-weight: bold;">📊</div>
          <h2 style="color: #3C0E11; margin: 16px 0 6px; font-size: 22px;">گزارش تحلیل اسکن ۲ دقیقه‌ای کافئین</h2>
          <p style="color: #64748b; font-size: 13px; margin: 0;">تحلیل تخصصی وضعیت تحصیلی و شناختی ${studentName}</p>
        </div>

        <div style="text-align: center; background: #f8fafc; border-radius: 16px; padding: 22px; margin: 20px 0; border: 1px solid #e2e8f0;">
          <span style="font-size: 13px; color: #64748b; display: block; margin-bottom: 6px;">امتیاز آمادگی کنکور:</span>
          <span style="font-size: 42px; font-weight: 900; color: #3C0E11;">${score}</span>
          <span style="font-size: 18px; color: #94a3b8;"> / ۱۰۰</span>
        </div>

        <div style="space-y: 12px; margin-bottom: 24px;">
          <div style="background: #eef2ff; border: 1px solid #c7d2fe; border-radius: 12px; padding: 14px; margin-bottom: 12px;">
            <strong style="color: #3730a3; font-size: 14px;">تیپ شخصیتی مطالعاتی:</strong>
            <p style="margin: 4px 0 0; color: #1e1b4b; font-size: 13px;">${archetype}</p>
          </div>

          <div style="background: #fff1f2; border: 1px solid #fecdd3; border-radius: 12px; padding: 14px; margin-bottom: 12px;">
            <strong style="color: #9f1239; font-size: 14px;">مانع اصلی رشد تراز:</strong>
            <p style="margin: 4px 0 0; color: #4c0519; font-size: 13px;">${primaryBlocker}</p>
          </div>

          ${prescriptionSummary ? `
            <div style="background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 12px; padding: 14px;">
              <strong style="color: #065f46; font-size: 14px;">توصیه راهبردی مشاور:</strong>
              <p style="margin: 4px 0 0; color: #064e3b; font-size: 13px; line-height: 1.7;">${prescriptionSummary}</p>
            </div>
          ` : ''}
        </div>

        <p style="color: #64748b; font-size: 13px; text-align: center;">مشاوران کافئین برای هماهنگی جلسه رفع اشکال و تنظیم برنامه با شما تماس خواهند گرفت.</p>
      </div>
    </div>
  `;
  return sendEmail({ to, subject, html, type: 'assessment' });
}

/**
 * Send Monthly Exam & Study Report Card Email
 */
export async function sendReportCardEmail(
  to: string,
  studentName: string,
  monthName = 'شهریور',
  studyHours = 180,
  testCount = 3200,
  advisorNote = ''
): Promise<SendEmailResult> {
  const subject = `کارنامه و تحلیل ماهانه کنکور: ${studentName} (${monthName})`;
  const html = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; direction: rtl; text-align: right; background-color: #f8fafc; padding: 30px; border-radius: 16px;">
      <div style="max-width: 540px; margin: 0 auto; background: #ffffff; border-radius: 20px; padding: 32px; box-shadow: 0 4px 20px rgba(0,0,0,0.06); border: 1px solid #e2e8f0;">
        <h2 style="color: #3C0E11; margin-top: 0; font-size: 20px;">📈 گزارش عملکرد ماهانه (${monthName})</h2>
        <p style="color: #475569; font-size: 14px;">داوطلب گرامی <strong>${studentName}</strong>، خلاصه بازدهی و عملکرد ماه جاری شما آماده است:</p>

        <div style="display: flex; gap: 12px; margin: 20px 0;">
          <div style="flex: 1; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 14px; padding: 16px; text-align: center;">
            <span style="font-size: 12px; color: #64748b; display: block;">مجموع ساعت مطالعه</span>
            <span style="font-size: 24px; font-weight: 800; color: #3C0E11;">${studyHours}</span>
            <span style="font-size: 11px; color: #94a3b8;"> ساعت</span>
          </div>
          <div style="flex: 1; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 14px; padding: 16px; text-align: center;">
            <span style="font-size: 12px; color: #64748b; display: block;">تست‌های حل شده</span>
            <span style="font-size: 24px; font-weight: 800; color: #0284c7;">${testCount}</span>
            <span style="font-size: 11px; color: #94a3b8;"> تست</span>
          </div>
        </div>

        ${advisorNote ? `
          <div style="background: #fdfaf6; border: 1px solid #f2e3d5; border-radius: 14px; padding: 16px; margin-top: 16px;">
            <strong style="color: #8E2800; font-size: 13px;">یادداشت مشاور تحصیلی:</strong>
            <p style="margin: 6px 0 0; color: #431407; font-size: 13px; line-height: 1.7;">${advisorNote}</p>
          </div>
        ` : ''}
      </div>
    </div>
  `;
  return sendEmail({ to, subject, html, type: 'report_card' });
}

/**
 * Retrieve sorted list of email dispatch logs
 */
export function getEmailLogs(limit = 100): EmailLogEntry[] {
  try {
    const raw = db.find<any>(COL_EMAIL_LOGS) || [];
    const formatted: EmailLogEntry[] = raw.map((entry) => ({
      id: entry.id,
      to: typeof entry.to === 'object' && entry.to?.to ? entry.to.to : String(entry.to || ''),
      subject: typeof entry.to === 'object' && entry.to?.subject ? entry.to.subject : String(entry.subject || 'بدون موضوع'),
      type: entry.type || 'general',
      status: entry.status === 'sent' ? 'sent' : 'failed',
      error: entry.error,
      messageId: entry.messageId,
      previewUrl: entry.previewUrl,
      sentAt: entry.sentAt || entry.createdAt || new Date().toISOString(),
      provider: entry.provider
    }));

    return formatted.slice(-limit).reverse();
  } catch (err) {
    console.warn('[EmailService] Error retrieving logs:', err);
    return [];
  }
}

