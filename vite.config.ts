import path from 'path';
import { defineConfig, Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { SUBJECT_TAXONOMIES } from './src/data/subjectTaxonomies';
import { buildQuestionExtractionPrompt, validatePromptScope } from './src/services/promptBuilder';
import { parseQuestionsHeuristically } from './src/services/questionBankService';

function apiDevPlugin(): Plugin {
  return {
    name: 'api-dev-server',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url === '/api/health' || req.url === '/api/v1/health') {
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ status: 'ok', service: 'Caffeine Academic OS Server' }));
          return;
        }

        if (req.url && (req.url.startsWith('/api/v1/ai/taxonomy') || req.url.startsWith('/api/ai/taxonomy'))) {
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({
            success: true,
            subjectTaxonomies: SUBJECT_TAXONOMIES
          }));
          return;
        }

        if (req.url && (req.url.startsWith('/api/v1/ai/subject-prompt') || req.url.startsWith('/api/ai/subject-prompt'))) {
          const handlePrompt = (payload: any) => {
            try {
              const subject = payload.subject || 'زیست‌شناسی';
              const grade = payload.grade;
              const field = payload.field;
              let chapters = payload.chapters;
              if (typeof chapters === 'string' && chapters.trim()) {
                chapters = chapters.split(',').map((c: string) => c.trim()).filter(Boolean);
              } else if (payload.chapter && typeof payload.chapter === 'string') {
                chapters = [payload.chapter.trim()];
              }
              let lessons = payload.lessons;
              if (typeof lessons === 'string' && lessons.trim()) {
                lessons = lessons.split(',').map((l: string) => l.trim()).filter(Boolean);
              } else if (payload.topic && typeof payload.topic === 'string') {
                lessons = [payload.topic.trim()];
              }

              const validation = validatePromptScope({
                subject: String(subject),
                grade: grade ? String(grade) : undefined,
                field: field ? String(field) : undefined,
                chapters: Array.isArray(chapters) ? chapters : undefined,
                lessons: Array.isArray(lessons) ? lessons : undefined
              });

              if (!validation.isValid) {
                res.statusCode = 400;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({
                  success: false,
                  errors: validation.errors,
                  message: 'پارامترهای ارسالی با ساختار سرفصل‌ها تطابق ندارند.'
                }));
                return;
              }

              const prompt = buildQuestionExtractionPrompt({
                subject: String(subject),
                grade: grade ? String(grade) : undefined,
                field: field ? String(field) : undefined,
                chapters: Array.isArray(chapters) ? chapters : undefined,
                lessons: Array.isArray(lessons) ? lessons : undefined
              });

              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({
                success: true,
                subject: validation.normalizedSubject,
                grade: validation.resolvedGrade,
                chaptersCount: validation.resolvedChapters.length,
                lessonsCount: Object.values(validation.resolvedLessonsByChapter).reduce((acc, l) => acc + l.length, 0),
                prompt
              }));
            } catch (err: any) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: false, error: err.message }));
            }
          };

          if (req.method === 'POST') {
            let body = '';
            req.on('data', chunk => { body += chunk; });
            req.on('end', () => {
              try {
                handlePrompt(JSON.parse(body || '{}'));
              } catch (e: any) {
                handlePrompt({});
              }
            });
          } else {
            const urlObj = new URL(req.url, 'http://localhost:3000');
            const q: Record<string, string> = {};
            urlObj.searchParams.forEach((v, k) => { q[k] = v; });
            handlePrompt(q);
          }
          return;
        }

        if (req.url === '/api/v1/ai/parse-questions' || req.url === '/api/v1/ai/parse-long-text') {
          let body = '';
          req.on('data', chunk => { body += chunk; });
          req.on('end', async () => {
            try {
              const parsedBody = JSON.parse(body || '{}');
              const {
                rawText,
                defaultSubject = 'زیست‌شناسی',
                defaultChapter = 'فصل ۱',
                defaultTopic = '',
                defaultGrade = 'twelfth',
                defaultGroup = 'experimental',
                defaultSource = 'talifi',
                defaultDifficulty = 'medium',
                forceInternalEngine = false
              } = parsedBody;

              const defaults = {
                subject: defaultSubject,
                chapter: defaultChapter,
                topic: defaultTopic,
                grade: defaultGrade,
                group: defaultGroup,
                source: defaultSource,
                difficulty: defaultDifficulty
              };

              if (process.env.GEMINI_API_KEY && !forceInternalEngine) {
                try {
                  const { GoogleGenAI } = await import('@google/genai');
                  const ai = new GoogleGenAI({
                    apiKey: process.env.GEMINI_API_KEY,
                    httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
                  });

                  const prompt = `شما یک سیستم هوش مصنوعی تخصصی برای تفکیک سوالات تستی کنکوری فارسی هستید. متن داده شده ممکن است با قالب باکسی [BOX_n]...[/BOX_n] با تگ‌های [SOAL]، [GOZ1-4]، [JAVAB]، [TASHRIHI]، [DARS]، [FASL]، [MABHAS] باشد یا متن خام آزمون.
متن را به آرایه‌ای از سوالات ساختاربندی‌شده JSON تبدیل کنید (بدون باقی گذاشتن تگ‌ها در متن سوال یا گزینه‌ها).
خروجی منحصراً JSON معتبر باشد:
[
  {
    "subject": "${defaultSubject}",
    "chapter": "${defaultChapter}",
    "topic": "مبحث سوال",
    "grade": "${defaultGrade}",
    "group": "${defaultGroup}",
    "difficulty": "${defaultDifficulty}",
    "source": "${defaultSource}",
    "year": "۱۴۰۳",
    "questionText": "متن صورت تست با فرمول لاتک $...$",
    "options": ["گزینه ۱", "گزینه ۲", "گزینه ۳", "گزینه ۴"],
    "correctOption": 1,
    "explanation": "پاسخ تشریحی کامل..."
  }
]`;

                  const response = await ai.models.generateContent({
                    model: 'gemini-2.5-flash',
                    contents: `${prompt}\n\n${rawText.slice(0, 45000)}`,
                    config: { responseMimeType: 'application/json' }
                  });

                  const parsedAI = JSON.parse(response.text || '[]');
                  if (Array.isArray(parsedAI) && parsedAI.length > 0) {
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify({
                      success: true,
                      provider: 'Gemini 2.5 Flash AI Engine',
                      engineType: 'ai_cloud',
                      count: parsedAI.length,
                      questions: parsedAI
                    }));
                    return;
                  }
                } catch (e) {
                  console.warn('Dev Gemini fallback to local:', e);
                }
              }

              const questions = parseQuestionsHeuristically(rawText, defaults);
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({
                success: true,
                provider: 'موتور پردازشگر داخلی و بومی کافئین (Caffeine Native NLP Parser)',
                engineType: 'native_internal',
                count: questions.length,
                questions,
                message: `تعداد ${questions.length} سوال توسط موتور اختصاصی داخلی استخراج شد.`
              }));
            } catch (err: any) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: false, error: err?.message, questions: [] }));
            }
          });
          return;
        }

        next();
      });
    }
  };
}

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  plugins: [
    react(),
    tailwindcss(),
    apiDevPlugin()
  ],
  server: {
    port: 3000,
    host: '0.0.0.0'
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    chunkSizeWarningLimit: 1500,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom'],
          'vendor-charts': ['recharts'],
          'vendor-katex': ['katex'],
          'vendor-xlsx': ['xlsx']
        }
      }
    }
  }
});

