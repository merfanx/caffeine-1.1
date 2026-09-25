import { Request, Response } from 'express';
import { getGemini, generateAiResponse } from '../services/aiService.js';
import { db } from '../storage/dbBridge.js';
import { authorizeStudentAccess } from '../security/studentAuthorizationService.js';
import {
  getSubjectAIPrompt,
  getTaxonomyMap,
  EXPERIMENTAL_TAXONOMY,
  getExperimentalChapters,
  getExperimentalTopics
} from '../../lib/konkurExperimentalTaxonomy.js';
import { SUBJECT_TAXONOMIES, getSubjectTaxonomy } from '../../lib/subjectTaxonomies.js';
import { buildQuestionExtractionPrompt, validatePromptScope } from '../../services/promptBuilder.js';
import { parseQuestionsHeuristically } from '../../services/questionBankService.js';

export const aiController = {
  // 0. Get Official Experimental Taxonomy
  getTaxonomy(req: Request, res: Response) {
    try {
      const { subject, chapter, grade } = req.query;
      if (subject && typeof subject === 'string') {
        const chapters = getExperimentalChapters(subject, typeof grade === 'string' ? grade : undefined);
        const topics = getExperimentalTopics(subject, typeof chapter === 'string' ? chapter : undefined);
        const tax = getSubjectTaxonomy(subject);
        res.json({
          success: true,
          subject,
          chapters,
          topics,
          subjectTaxonomy: tax
        });
        return;
      }

      res.json({
        success: true,
        taxonomy: getTaxonomyMap(),
        allEntries: EXPERIMENTAL_TAXONOMY,
        subjectTaxonomies: SUBJECT_TAXONOMIES
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  },

  // 0.1 Get Subject Specific Prompt for PDF/OCR Extraction with Dynamic Scope
  getSubjectPrompt(req: Request, res: Response) {
    try {
      const payload = req.method === 'POST' ? req.body : req.query;
      const subject = payload.subject || 'زیست‌شناسی';
      const grade = payload.grade;
      const field = payload.field;

      // Extract chapters (can be array or comma-separated string)
      let chapters: string[] | undefined = undefined;
      if (Array.isArray(payload.chapters)) {
        chapters = payload.chapters.map((c: any) => String(c).trim()).filter(Boolean);
      } else if (typeof payload.chapters === 'string' && payload.chapters.trim()) {
        chapters = payload.chapters.split(',').map((c: string) => c.trim()).filter(Boolean);
      } else if (payload.chapter && typeof payload.chapter === 'string') {
        chapters = [payload.chapter.trim()];
      }

      // Extract lessons (can be array or comma-separated string)
      let lessons: string[] | undefined = undefined;
      if (Array.isArray(payload.lessons)) {
        lessons = payload.lessons.map((l: any) => String(l).trim()).filter(Boolean);
      } else if (typeof payload.lessons === 'string' && payload.lessons.trim()) {
        lessons = payload.lessons.split(',').map((l: string) => l.trim()).filter(Boolean);
      } else if (payload.topic && typeof payload.topic === 'string') {
        lessons = [payload.topic.trim()];
      }

      const validation = validatePromptScope({
        subject: String(subject),
        grade: grade ? String(grade) : undefined,
        field: field ? String(field) : undefined,
        chapters,
        lessons
      });

      const prompt = buildQuestionExtractionPrompt({
        subject: String(subject),
        grade: grade ? String(grade) : undefined,
        field: field ? String(field) : undefined,
        chapters,
        lessons
      });

      res.json({
        success: true,
        warnings: validation.isValid ? undefined : validation.errors,
        subject: validation.normalizedSubject || String(subject),
        grade: validation.resolvedGrade || grade,
        chaptersCount: validation.resolvedChapters.length,
        lessonsCount: Object.values(validation.resolvedLessonsByChapter).reduce((acc, l) => acc + l.length, 0),
        prompt
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  },

  // 1. General AI Chat
  async chat(req: Request, res: Response) {
    try {
      const { message, context, model, history } = req.body;
      if (!message || typeof message !== 'string') {
        res.status(400).json({ success: false, message: 'پیام کاربر الزامی است.' });
        return;
      }

      const response = await generateAiResponse(message, context, model, history);
      res.json({
        success: true,
        response,
        model: model || 'gemini-2.5-flash',
        timestamp: new Date().toISOString()
      });
    } catch (err: any) {
      console.error('AI chat error:', err);
      res.status(500).json({ success: false, error: err.message });
    }
  },

  // 2. Parse Question Bank Documents with Strict Subject Taxonomy
  async parseQuestions(req: Request, res: Response) {
    try {
      const {
        rawText,
        defaultSubject = 'زیست‌شناسی',
        defaultChapter = '',
        defaultTopic = '',
        defaultGrade = 'twelfth',
        defaultGroup = 'experimental',
        defaultSource = 'talifi',
        defaultDifficulty = 'medium'
      } = req.body;

      if (!rawText || typeof rawText !== 'string' || rawText.trim().length < 10) {
        res.status(400).json({ success: false, message: 'متن ارسالی برای استخراج سوالات بسیار کوتاه یا خالی است.' });
        return;
      }

      const ai = getGemini();
      if (ai) {
        const subjectRule = getSubjectAIPrompt(defaultSubject, { chapter: defaultChapter, topic: defaultTopic, grade: defaultGrade });
        const systemPrompt = `${subjectRule}

شما یک سیستم هوش مصنوعی فوق‌تخصصی برای استخراج و ساختاربندی سوالات ۴گزینه‌ای کنکوری رشته تجربی هستید.
وظیفه شما تبدیل دقیق متن آزمون، PDF یا تصاویر به آرایه‌ای از سوالات JSON استاندارد با ساختار زیر است:
[
  {
    "subject": "${defaultSubject}",
    "chapter": "فصل رسمی و دقیق منطبق بر جدول سرفصل‌های بالا",
    "topic": "گفتار/درس/بخش رسمی و دقیق منطبق بر جدول سرفصل‌های بالا",
    "grade": "${defaultGrade}",
    "group": "${defaultGroup}",
    "difficulty": "${defaultDifficulty}",
    "source": "${defaultSource}",
    "year": "کنکور ۱۴۰۳",
    "questionText": "متن کامل صورت سوال...",
    "options": ["گزینه ۱", "گزینه ۲", "گزینه ۳", "گزینه ۴"],
    "correctOption": 2,
    "explanation": "پاسخ تشریحی کامل راه حل...",
    "tags": ["تگ۱", "تگ۲"]
  }
]

قوانین حیاتی و اجباری:
۱. متن ورودی ممکن است به فرمت‌های مختلفی باشد:
   - فرمت استاندارد مدرن آزمونی: با جداکننده === تست ۱ === یا شماره تست ۱- همراه گزینه‌های ۱) تا ۴)، پاسخ: گزینه X، پاسخ تشریحی و خط فراداده (درس: ... | فصل: ... | مبحث: ...)
   - فرمت باکسی ساختارمند کافئین با تگ‌های [BOX_n]...[/BOX_n] و کدهای اختصاصی [SOAL]، [GOZ1] تا [GOZ4]، [JAVAB]، [TASHRIHI]، [DARS]، [FASL]، [MABHAS]
   - فرمت متن خام، کپی شده از PDF، اسکن OCR یا خروجی چت‌بات‌ها (ChatGPT/Claude/DeepSeek)
   در همه موارد، تمام محتوا اعم از متن سوال، ۴ گزینه، کلید، تحلیل تشریحی و مبحث دقیق را شناسایی و ساختاربندی کنید.
۲. مقادیر فیلدهای «chapter» و «topic» باید منحصراً و بدون کوچکترین تغییر از فهرست رسمی سرفصل‌های درس «${defaultSubject}» در ابتدای این پرامپت انتخاب شوند مگر اینکه مقدار مشخصی در خط فراداده یا تگ‌ها تصریح شده باشد.
۳. تمام سوالات حتماً ۴ گزینه داشته باشند و هیچ گزینه‌ای خالی نباشد.
۴. گزینه صحیح (correctOption) عددی بین ۱ تا ۴ باشد.
۵. در صورت وجود فرمول‌های ریاضی، فیزیک، یا واکنش‌های شیمیایی، حتماً از نگارش استاندارد LaTeX استفاده کنید ($...$ یا $$...$$).
۶. خروجی فقط و فقط یک آرایه JSON معتبر باشد و هیچ متن توضیحی اضافه قبل یا بعد از آن قرار ندهید.`;

        let parsedQuestions: any[] = [];
        let providerName = 'Gemini Flash AI Engine';

        try {
          const response = await ai.models.generateContent({
            model: 'gemini-flash-latest',
            contents: `${systemPrompt}\n\n--- شروع متن سند آزمون ---\n${rawText.slice(0, 35000)}`
          });

          let jsonText = response.text || '[]';
          jsonText = jsonText.trim();
          if (jsonText.startsWith('```json')) {
            jsonText = jsonText.replace(/^```json\s*/, '').replace(/```$/, '').trim();
          } else if (jsonText.startsWith('```')) {
            jsonText = jsonText.replace(/^```\s*/, '').replace(/```$/, '').trim();
          }

          try {
            parsedQuestions = JSON.parse(jsonText);
          } catch {
            parsedQuestions = parseQuestionsHeuristically(rawText, {
              subject: defaultSubject,
              chapter: defaultChapter,
              topic: defaultTopic,
              grade: defaultGrade,
              group: defaultGroup,
              difficulty: defaultDifficulty,
              source: defaultSource
            });
            providerName = 'موتور استخراج هوشمند الگوهای ساختاریافته (Fallback)';
          }
        } catch (aiErr: any) {
          console.warn('AI extraction failed, using heuristic parser fallback:', aiErr?.message);
          parsedQuestions = parseQuestionsHeuristically(rawText, {
            subject: defaultSubject,
            chapter: defaultChapter,
            topic: defaultTopic,
            grade: defaultGrade,
            group: defaultGroup,
            difficulty: defaultDifficulty,
            source: defaultSource
          });
          providerName = 'موتور استخراج الگوریتمی باکسی کافئین (Fallback)';
        }

        res.json({
          success: true,
          provider: providerName,
          count: Array.isArray(parsedQuestions) ? parsedQuestions.length : 0,
          questions: Array.isArray(parsedQuestions) ? parsedQuestions : []
        });
      } else {
        const parsed = parseQuestionsHeuristically(rawText, {
          subject: defaultSubject,
          chapter: defaultChapter,
          topic: defaultTopic,
          grade: defaultGrade,
          group: defaultGroup,
          difficulty: defaultDifficulty,
          source: defaultSource
        });
        res.json({
          success: true,
          provider: 'Caffeine Heuristic Box Engine',
          count: parsed.length,
          questions: parsed.map(q => ({
            subject: q.subject,
            chapter: q.chapter,
            topic: q.topic,
            grade: q.grade,
            group: q.group,
            difficulty: q.difficulty,
            source: q.source,
            year: q.year,
            questionText: q.questionText,
            options: q.options,
            correctOption: q.correctOption,
            explanation: q.explanation,
            tags: q.tags
          })),
          message: 'استخراج با موتور ساختارمند باکسی کافئین با موفقیت انجام شد.'
        });
      }
    } catch (err: any) {
      console.error('AI question parsing error:', err);
      res.status(500).json({ success: false, error: err.message, questions: [] });
    }
  },

  // 3. AI Question Solver with Subject-Specific Depth
  async solveQuestion(req: Request, res: Response) {
    try {
      const { questionText, options = [], subject = 'زیست‌شناسی', chapter = '', topic = '' } = req.body;

      if (!questionText || typeof questionText !== 'string' || questionText.trim().length < 5) {
        res.status(400).json({ success: false, message: 'صورت سوال معتبر نمی‌باشد.' });
        return;
      }

      const ai = getGemini();
      if (ai) {
        const subjectRule = getSubjectAIPrompt(subject, { chapter, topic });
        const prompt = `${subjectRule}

لطفاً سوال تستی کنکوری زیر و ۴ گزینه آن را با دقت تحلیل علمی، مفهومی و محاسباتی کامل کنید:

صورت سوال:
${questionText}

گزینه‌ها:
۱) ${options[0] || '---'}
۲) ${options[1] || '---'}
۳) ${options[2] || '---'}
۴) ${options[3] || '---'}

وظایف:
۱. گزینه صحیح (۱ یا ۲ یا ۳ یا ۴) را به صورت قطعی تعیین کنید.
۲. یک پاسخ تشریحی جامع، آموزشی، روان و گام‌به‌گام به زبان فارسی بنویسید (در صورت وجود فرمول‌های ریاضی، فیزیک یا واکنش‌های شیمیایی، حتماً از فرمول‌نویسی استاندارد لاتک $...$ یا $$...$$ استفاده نمایید).
۳. علت رد سایر گزینه‌ها و دام‌های تستی طراحان کنکور را به طور دقیق بیان کنید.

خروجی شما باید منحصراً یک شیء JSON با ساختار زیر باشد:
{
  "correctOption": 2,
  "explanation": "پاسخ تشریحی کامل گام‌به‌گام با فرمول‌های لاتک...",
  "trapAnalysis": "تحلیل دام تستی گزینه‌ها..."
}`;

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt
        });

        let jsonText = response.text || '{}';
        jsonText = jsonText.trim();
        if (jsonText.startsWith('```json')) {
          jsonText = jsonText.replace(/^```json\s*/, '').replace(/```$/, '').trim();
        } else if (jsonText.startsWith('```')) {
          jsonText = jsonText.replace(/^```\s*/, '').replace(/```$/, '').trim();
        }

        const parsed = JSON.parse(jsonText);
        res.json({
          success: true,
          correctOption: parsed.correctOption || 1,
          explanation: parsed.explanation || 'پاسخ تشریحی توسط هوش مصنوعی تولید شد.',
          trapAnalysis: parsed.trapAnalysis || ''
        });
      } else {
        res.json({
          success: true,
          correctOption: 1,
          explanation: 'پاسخ تشریحی خودکار (به دلیل عدم دسترسی به هوش مصنوعی سرور، پیش‌فرض روی گزینه ۱ تنظیم گردید).'
        });
      }
    } catch (err: any) {
      console.error('AI Question Solver error:', err);
      res.status(500).json({ success: false, error: err.message });
    }
  },

  // 4. OCR Image to Questions with Subject-Specific Taxonomy
  async ocrImageToQuestions(req: Request, res: Response) {
    try {
      const {
        imageBase64,
        mimeType = 'image/jpeg',
        defaultSubject = 'زیست‌شناسی',
        defaultGrade = 'twelfth',
        defaultGroup = 'experimental',
        defaultSource = 'talifi',
        defaultDifficulty = 'medium'
      } = req.body;

      if (!imageBase64 || typeof imageBase64 !== 'string') {
        res.status(400).json({ success: false, message: 'داده تصویر ارسال نشده است.' });
        return;
      }

      const ai = getGemini();
      if (ai) {
        const cleanBase64 = imageBase64.replace(/^data:image\/[a-zA-Z]+;base64,/, '');
        const subjectRule = getSubjectAIPrompt(defaultSubject, { grade: defaultGrade });

        const prompt = `${subjectRule}

شما یک سیستم تخصصی بینایی ماشین (OCR هوشمند و خوانش اسناد آزمون) هستید.
در تصویر پیوست‌شده، یک یا چند سوال ۴گزینه‌ای کنکوری یا آزمایشی رشته تجربی وجود دارد.

وظیفه شما:
۱. صورت تک‌تک سوالات موجود در تصویر را با تمام جزئیات، شکل‌ها و فرمول‌ها به صورت کامل بازخوانی و تایپ کنید (فرمول‌های ریاضی، فیزیک، شیمی را در قالب استاندارد لاتک $...$ یا $$...$$ قرار دهید).
۲. هر ۴ گزینه را تمیز و بدون غلط تایپی استخراج کنید.
۳. گزینه صحیح (1, 2, 3, 4) و پاسخ تشریحی جامع را ارائه دهید.
۴. فصل (chapter) و مبحث (topic) را دقیقاً و منحصراً بر اساس سرفصل‌های رسمی اعلام‌شده در بالای پرامپت مقداردهی نمایید.

خروجی باید صرفاً یک آرایه JSON معتبر از اشیاء باشد:
[
  {
    "subject": "${defaultSubject}",
    "chapter": "فصل دقیق از جدول سرفصل‌های فوق",
    "topic": "گفتار/مبحث دقیق از جدول سرفصل‌های فوق",
    "grade": "${defaultGrade}",
    "group": "${defaultGroup}",
    "difficulty": "${defaultDifficulty}",
    "source": "${defaultSource}",
    "year": "۱۴۰۳",
    "questionText": "متن بازخوانی شده سوال...",
    "options": ["گزینه ۱", "گزینه ۲", "گزینه ۳", "گزینه ۴"],
    "correctOption": 2,
    "explanation": "پاسخ تشریحی حل سوال..."
  }
]`;

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: [
            { text: prompt },
            {
              inlineData: {
                data: cleanBase64,
                mimeType: mimeType || 'image/jpeg'
              }
            }
          ]
        });

        let jsonText = response.text || '[]';
        jsonText = jsonText.trim();
        if (jsonText.startsWith('```json')) {
          jsonText = jsonText.replace(/^```json\s*/, '').replace(/```$/, '').trim();
        } else if (jsonText.startsWith('```')) {
          jsonText = jsonText.replace(/^```\s*/, '').replace(/```$/, '').trim();
        }

        const parsed = JSON.parse(jsonText);
        res.json({
          success: true,
          count: Array.isArray(parsed) ? parsed.length : 0,
          questions: Array.isArray(parsed) ? parsed : []
        });
      } else {
        res.json({
          success: true,
          count: 0,
          questions: [],
          message: 'کلید جمینای تنظیم نشده است.'
        });
      }
    } catch (err: any) {
      console.error('OCR questions error:', err);
      res.status(500).json({ success: false, error: err.message, questions: [] });
    }
  },

  // 5. Generate Question Clones / Similar Questions strictly mapped to Subject Taxonomy
  async generateQuestionClones(req: Request, res: Response) {
    try {
      const {
        sourceQuestion,
        cloneCount = 2,
        strategy = 'similar_concept',
        targetDifficulty,
        customInstructions = ''
      } = req.body;

      if (!sourceQuestion || !sourceQuestion.questionText) {
        res.status(400).json({ success: false, message: 'سوال مبدا برای تولید سوالات مشابه الزامی است.' });
        return;
      }

      const ai = getGemini();
      if (!ai) {
        res.status(503).json({ success: false, message: 'موتور هوش مصنوعی سرور در دسترس نیست.' });
        return;
      }

      const subject = sourceQuestion.subject || 'زیست‌شناسی';
      const grade = sourceQuestion.grade || 'twelfth';
      const chapter = sourceQuestion.chapter || '';
      const topic = sourceQuestion.topic || '';
      const difficulty = targetDifficulty || sourceQuestion.difficulty || 'medium';

      const subjectRule = getSubjectAIPrompt(subject, { chapter, topic, grade });

      const strategyGuide =
        strategy === 'harder_variant'
          ? 'سطح سوالات جدید را پیچیده‌تر، ترکیبی‌تر و چندمرحله‌ای‌تر همراه با دام‌های مفهومی ظریف طراحی کنید.'
          : strategy === 'easier_variant'
          ? 'سطح سوالات جدید را روان‌تر، با تاکید بر درک مستقیم مفاهیم پایه و بدون پیچیدگی‌های غیرضروری طراحی کنید.'
          : strategy === 'cross_topic'
          ? 'سوالات را به صورت ترکیبی با سایر مباحث مرتبط همان درس طراحی کنید.'
          : 'سوالاتی با ساختار مشابه، تغییر مقادیر عددی یا شواهد زیستی/شیمیایی اما با هدف سنجش همان مفهوم کلیدی طراحی کنید.';

      const prompt = `${subjectRule}

شما طراح ارشد آزمون‌های آزمایشی استاندارد هستید.
بر اساس سوال مبدا زیر، تعداد ${cloneCount} سوال تستی ۴گزینه‌ای جدید، تالیفی، بدون کپی‌برداری مستقیم و استاندارد طراحی کنید:

سوال مبدا:
- درس: ${subject}
- پایه: ${grade}
- فصل: ${chapter}
- مبحث: ${topic}
- درجه سختی: ${sourceQuestion.difficulty}
- صورت سوال: ${sourceQuestion.questionText}
- گزینه‌ها: ${JSON.stringify(sourceQuestion.options || [])}
- گزینه صحیح: ${sourceQuestion.correctOption}
- پاسخ تشریحی: ${sourceQuestion.explanation || ''}

استراتژی تولید: ${strategyGuide}
سطح سختی هدف: ${difficulty}
${customInstructions ? `دستورات اختصاصی طراح: ${customInstructions}` : ''}

قوانین الزامی:
۱. خروجی باید یک آرایه JSON معتبر شامل دقیقاً ${cloneCount} سوال با ساختار کامل زیر باشد.
۲. فیلدهای «chapter» و «topic» سوالات جدید باید حتماً و دقیقاً منطبق با سرفصل‌های اعلام‌شده در ابتدای این پرامپت باشند.
۳. در صورت وجود فرمول ریاضی/فیزیک/شیمی حتماً از نمادگذاری LaTeX ($...$) استفاده شود.
۴. پاسخ تشریحی کامل و تحلیل دام گزینه‌ها برای هر تست ارائه شود.

ساختار JSON مورد نظر:
[
  {
    "subject": "${subject}",
    "chapter": "${chapter || 'فصل مجاز'}",
    "topic": "${topic || 'مبحث مجاز'}",
    "grade": "${grade}",
    "group": "experimental",
    "difficulty": "${difficulty}",
    "source": "talifi_ai",
    "year": "تالیفی ۱۴۰۳",
    "questionText": "صورت سوال جدید...",
    "options": ["گزینه ۱", "گزینه ۲", "گزینه ۳", "گزینه ۴"],
    "correctOption": 1,
    "explanation": "پاسخ تشریحی کامل...",
    "tags": ["تالیفی", "${subject}"]
  }
]`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
      });

      let jsonText = response.text || '[]';
      jsonText = jsonText.trim();
      if (jsonText.startsWith('```json')) {
        jsonText = jsonText.replace(/^```json\s*/, '').replace(/```$/, '').trim();
      } else if (jsonText.startsWith('```')) {
        jsonText = jsonText.replace(/^```\s*/, '').replace(/```$/, '').trim();
      }

      const clones = JSON.parse(jsonText);
      res.json({
        success: true,
        count: Array.isArray(clones) ? clones.length : 0,
        clones: Array.isArray(clones) ? clones : []
      });
    } catch (err: any) {
      console.error('Generate question clones error:', err);
      res.status(500).json({ success: false, error: err.message, clones: [] });
    }
  },

  // 6. Generate Article Draft
  async generateArticleDraft(req: Request, res: Response) {
    try {
      const { topic, grade, targetAudience, tone } = req.body;
      if (!topic) {
        res.status(400).json({ success: false, message: 'موضوع مقاله الزامی است.' });
        return;
      }

      const prompt = `یک مقاله آموزشی و انگیزشی جامع برای وبلاگ آموزشی کافئین با موضوع «${topic}» بنویسید.
مخاطب: داوطلبان کنکور و دانش‌آموزان ${grade || 'دوازدهم'}
لحن: ${tone || 'انگیزشی، راهبردی، دقیق و علمی'}
خروجی در قالب ساختاریافته مارک‌داون شامل تیترهای جذاب، نکات کلیدی، دام‌های رایج و برنامه پیشنهادی باشد.`;

      const ai = getGemini();
      let draftText = '';
      if (ai) {
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt
        });
        draftText = response.text || '';
      } else {
        draftText = `# ${topic}\n\nراهنمای جامع مطالعه و جمع‌بندی مبحث ${topic} ویژه داوطلبان کنکور سراسری...`;
      }

      res.json({
        success: true,
        title: topic,
        content: draftText,
        createdAt: new Date().toISOString()
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  },

  // 7. Analyze Exam Analytics
  async analyzeExamAnalytics(req: Request, res: Response) {
    try {
      const authUser = req.authUser!;
      const { studentId = 'std-101', examResults = [] } = req.body;

      const authResult = await authorizeStudentAccess(authUser, studentId, {
        req,
        resourceName: '/api/v1/ai/analyze-exam-analytics'
      });

      if (!authResult.authorized) {
        res.status(authResult.statusCode).json({
          success: false,
          error: authResult.error || 'FORBIDDEN_BOLA_403',
          message: authResult.message || 'عدم دسترسی: تحلیل آزمون فقط برای داوطلبان مجاز امکان‌پذیر است.'
        });
        return;
      }

      const prompt = `شما مشاور ارشد تحصیلی و تحلیل‌گر تخصصی کارنامه آزمون‌های آزمایشی هستید.
نتایج آزمون‌های داوطلب به شرح زیر است:
${JSON.stringify(examResults, null, 2)}

لطفاً یک تحلیل جامع شامل:
۱. نقاط قوت تثبیت‌شده
۲. مباحث پرریسک و با افت درصد
۳. استراتژی مطالعاتی و تغییر منابع برای ۲ هفته آتی
ارائه دهید.`;

      const ai = getGemini();
      let analysis = '';
      if (ai) {
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt
        });
        analysis = response.text || '';
      } else {
        analysis = 'روند کلی داوطلب در دروس اختصاصی مثبت بوده و تمرکز بیشتر روی تست‌های سرعتی توصیه می‌شود.';
      }

      res.json({
        success: true,
        studentId,
        analysis,
        analyzedAt: new Date().toISOString()
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }
};

