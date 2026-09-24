import { GoogleGenAI } from '@google/genai';

let geminiClient: GoogleGenAI | null = null;
let customApiKey: string = '';
let activeModel: string = 'gemini-2.5-flash';

export function getEffectiveApiKey(): string {
  return customApiKey || process.env.GEMINI_API_KEY || '';
}

export function setCustomApiKey(key: string): void {
  customApiKey = key;
  geminiClient = null; // Invalidate client to rebuild
}

export function getGemini(): GoogleGenAI | null {
  const key = getEffectiveApiKey();
  if (!key) {
    return null;
  }
  if (!geminiClient) {
    try {
      geminiClient = new GoogleGenAI({
        apiKey: key,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build'
          }
        }
      });
    } catch (err) {
      console.warn('[AiService] Warning creating GoogleGenAI client:', err);
      return null;
    }
  }
  return geminiClient;
}

export function getAiState() {
  const hasKey = !!getEffectiveApiKey();
  return {
    configured: hasKey,
    hasApiKey: hasKey,
    activeModel,
    isCustomKey: !!customApiKey,
    status: hasKey ? 'active' : 'unconfigured'
  };
}

export function getActiveAiModel(): string {
  return activeModel;
}

export function setActiveAiConfig(config: { apiKey?: string; model?: string }) {
  if (config.apiKey !== undefined) {
    setCustomApiKey(config.apiKey);
  }
  if (config.model) {
    activeModel = config.model;
  }
  return getAiState();
}

export async function testGeminiConnection(): Promise<{ success: boolean; message: string; model?: string }> {
  const ai = getGemini();
  if (!ai) {
    return {
      success: false,
      message: 'کلید API هوش مصنوعی در سرور یافت نشد. لطفاً کلید معتبر تنظیم نمایید.'
    };
  }

  try {
    const response = await ai.models.generateContent({
      model: activeModel || 'gemini-2.5-flash',
      contents: 'پاسخ کوتاه تک‌کلمه‌ای بده: سلام'
    });
    return {
      success: true,
      message: 'ارتباط با موتور هوش مصنوعی با موفقیت برقرار شد.',
      model: activeModel
    };
  } catch (err: any) {
    return {
      success: false,
      message: `خطا در ارتباط با سرویس هوش مصنوعی: ${err?.message || 'نامشخص'}`
    };
  }
}

export async function generateAiResponse(
  message: string,
  context?: string,
  model = activeModel,
  history: Array<{ role: string; content: string }> = []
): Promise<string> {
  const ai = getGemini();
  if (!ai) {
    return 'پاسخ هوش مصنوعی آفلاین: در حال حاضر کلید جمینای تنظیم نشده است.';
  }

  try {
    const prompt = context
      ? `زمینه کمکی:\n${context}\n\nپیام کاربر:\n${message}`
      : message;

    const response = await ai.models.generateContent({
      model: model || 'gemini-2.5-flash',
      contents: prompt
    });

    return response.text || 'پاسخی دریافت نشد.';
  } catch (err: any) {
    console.error('[AiService] Error generating response:', err);
    throw new Error(`خطا در تولید پاسخ هوش مصنوعی: ${err.message}`);
  }
}
