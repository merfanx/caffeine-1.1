import { db } from '../storage/dbBridge.js';

export interface SmsConfig {
  apiKey: string;
  templateId: string;
  parameterName: string;
  sender: string;
  isActive: boolean;
}

let customSmsConfig: Partial<SmsConfig> = {};

export const otpStore = new Map<string, { code: string; expiresAt: number; role?: string; sentAt?: number; attempts?: number }>();

export function normalizeIranianMobile(phone: string | undefined | null): string {
  if (!phone) return '';
  let clean = String(phone)
    .trim()
    .replace(/[۰-۹]/g, (d: string) => String.fromCharCode(d.charCodeAt(0) - 1728))
    .replace(/[٠-٩]/g, (d: string) => String.fromCharCode(d.charCodeAt(0) - 1584))
    .replace(/[^0-9]/g, '');

  if (clean.startsWith('98')) {
    clean = '0' + clean.slice(2);
  } else if (clean.startsWith('+98')) {
    clean = '0' + clean.slice(3);
  } else if (clean.length === 10 && clean.startsWith('9')) {
    clean = '0' + clean;
  }

  return clean;
}

export function maskPhoneNumber(phone: string): string {
  if (!phone || phone.length < 7) return phone || '';
  return phone.slice(0, 4) + '***' + phone.slice(-4);
}

export function getEffectiveSmsKey(): string {
  return customSmsConfig.apiKey || process.env.SMSIR_API_KEY || '';
}

export function getEffectiveSmsApiKey(): string {
  return getEffectiveSmsKey();
}

export function getEffectiveSmsTemplateId(): string {
  return customSmsConfig.templateId || process.env.SMSIR_TEMPLATE_ID || '100000';
}

export function getEffectiveSmsParameterName(): string {
  return customSmsConfig.parameterName || process.env.SMSIR_PARAMETER_NAME || 'Code';
}

export function getEffectiveSmsSender(): string {
  return customSmsConfig.sender || process.env.SMSIR_LINE_NUMBER || '30007732';
}

export function getEffectiveSmsLineNumber(): string {
  return getEffectiveSmsSender();
}

export function setCustomSmsConfig(config: Partial<SmsConfig>) {
  customSmsConfig = { ...customSmsConfig, ...config };
}

export function updateSmsCredentials(config: Partial<SmsConfig>) {
  setCustomSmsConfig(config);
}

export async function dispatchSmsIrVerify(phone: string, code: string): Promise<any> {
  const apiKey = getEffectiveSmsKey();
  const templateId = parseInt(getEffectiveSmsTemplateId(), 10) || 100000;
  const paramName = getEffectiveSmsParameterName();

  if (!apiKey) {
    return {
      status: 1,
      message: 'شبیه‌سازی ارسال پیامک (کلید SMS.ir تنظیم نشده است)',
      data: { messageId: Math.floor(100000 + Math.random() * 900000), cost: 1 }
    };
  }

  try {
    const response = await fetch('https://api.sms.ir/v1/send/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey
      },
      body: JSON.stringify({
        mobile: phone,
        templateId,
        parameters: [
          {
            name: paramName,
            value: code
          }
        ]
      })
    });

    const data = await response.json();
    return data;
  } catch (err: any) {
    console.warn('[SmsService] Error dispatching SMS:', err);
    throw err;
  }
}

export async function dispatchSmsIrVerification(phone: string, code: string): Promise<any> {
  return dispatchSmsIrVerify(phone, code);
}

export async function dispatchSmsIrBroadcast(mobiles: string[], messageText: string): Promise<any> {
  const apiKey = getEffectiveSmsKey();
  const lineNumber = getEffectiveSmsSender();

  if (!apiKey) {
    return {
      status: 1,
      message: 'شبیه‌سازی ارسال پیامک همگانی',
      data: { count: mobiles.length, cost: mobiles.length }
    };
  }

  try {
    const response = await fetch('https://api.sms.ir/v1/send/bulk', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey
      },
      body: JSON.stringify({
        lineNumber,
        messageText,
        mobiles
      })
    });

    return await response.json();
  } catch (err: any) {
    console.warn('[SmsService] Bulk SMS error:', err);
    throw err;
  }
}

export async function fetchSmsIrCredit(): Promise<{ credit: number; currency: string }> {
  const apiKey = getEffectiveSmsKey();
  if (!apiKey) {
    return { credit: 500000, currency: 'IRR (Simulated)' };
  }

  try {
    const response = await fetch('https://api.sms.ir/v1/credit', {
      headers: { 'x-api-key': apiKey }
    });
    const data = await response.json();
    return { credit: data.data || 0, currency: 'IRR' };
  } catch (err) {
    return { credit: 0, currency: 'IRR' };
  }
}

export async function fetchSmsIrLines(): Promise<any[]> {
  const apiKey = getEffectiveSmsKey();
  if (!apiKey) {
    return [{ lineNumber: '30007732', type: 'dedicated' }];
  }

  try {
    const response = await fetch('https://api.sms.ir/v1/line', {
      headers: { 'x-api-key': apiKey }
    });
    const data = await response.json();
    return data.data || [];
  } catch (err) {
    return [];
  }
}
