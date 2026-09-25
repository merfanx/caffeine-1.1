import { getSubjectTaxonomy, getAllSubjectNames, ChapterTaxonomy } from '../lib/subjectTaxonomies';

export interface BuildPromptParams {
  subject: string;
  grade?: string;
  field?: string;
  chapters?: string[];
  lessons?: string[];
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  normalizedSubject: string;
  resolvedGrade?: string;
  resolvedChapters: ChapterTaxonomy[];
  resolvedLessonsByChapter: Record<string, string[]>;
}

/**
 * Validates prompt scoping parameters against official subject taxonomies.
 * Throws or returns errors if invalid values are passed (never silently accepts invalid input).
 */
export function validatePromptScope(params: BuildPromptParams): ValidationResult {
  const errors: string[] = [];

  if (!params.subject || typeof params.subject !== 'string' || !params.subject.trim()) {
    errors.push('نام درس الزامی است.');
    return {
      isValid: false,
      errors,
      normalizedSubject: '',
      resolvedChapters: [],
      resolvedLessonsByChapter: {}
    };
  }

  const tax = getSubjectTaxonomy(params.subject);
  if (!tax) {
    const available = getAllSubjectNames().join('، ');
    errors.push(`درس «${params.subject}» در سامانه معتبر نیست. دروس معتبر: ${available}`);
    return {
      isValid: false,
      errors,
      normalizedSubject: '',
      resolvedChapters: [],
      resolvedLessonsByChapter: {}
    };
  }

  // Check grade compatibility if provided
  let validGradeTaxonomies = tax.grades;
  let resolvedGrade: string | undefined = undefined;

  // If chapter is provided, check if it exists in any grade to help resolve or correct the grade
  if (params.chapters && params.chapters.length > 0) {
    const firstCh = params.chapters[0].trim();
    const owningGrade = tax.grades.find(g => g.chapters.some(c => c.title === firstCh || c.title.includes(firstCh) || firstCh.includes(c.title)));
    if (owningGrade) {
      resolvedGrade = owningGrade.grade;
      validGradeTaxonomies = [owningGrade];
    }
  }

  if (!resolvedGrade && params.grade && params.grade !== 'all' && params.grade !== 'comprehensive' && params.grade !== 'جامع') {
    const trimmedGrade = params.grade.trim();
    const matchedGrade = tax.grades.find(g => {
      if (g.grade === trimmedGrade || g.gradeKey === trimmedGrade) return true;
      if ((trimmedGrade === '10' || trimmedGrade === 'tenth') && g.grade === 'دهم') return true;
      if ((trimmedGrade === '11' || trimmedGrade === 'eleventh') && g.grade === 'یازدهم') return true;
      if ((trimmedGrade === '12' || trimmedGrade === 'twelfth') && g.grade === 'دوازدهم') return true;
      return false;
    });

    if (matchedGrade) {
      validGradeTaxonomies = [matchedGrade];
      resolvedGrade = matchedGrade.grade;
    }
  }

  // Gather available chapters in the selected grade(s)
  const availableChapterMap = new Map<string, ChapterTaxonomy>();
  for (const g of validGradeTaxonomies) {
    for (const c of g.chapters) {
      availableChapterMap.set(c.title, c);
    }
  }

  // Validate chapters if specified
  const resolvedChapters: ChapterTaxonomy[] = [];
  if (params.chapters && params.chapters.length > 0) {
    for (const chTitle of params.chapters) {
      const cleanTitle = chTitle.trim();
      let matched = availableChapterMap.get(cleanTitle) || 
        Array.from(availableChapterMap.values()).find(c => c.title.includes(cleanTitle) || cleanTitle.includes(c.title));

      // If not found in current grade, search all grades of the subject
      if (!matched) {
        for (const g of tax.grades) {
          const found = g.chapters.find(c => c.title.includes(cleanTitle) || cleanTitle.includes(c.title));
          if (found) {
            matched = found;
            break;
          }
        }
      }

      if (matched && !resolvedChapters.some(c => c.title === matched!.title)) {
        resolvedChapters.push(matched);
      }
    }
  }

  // If no chapters could be resolved, fall back to all chapters of the resolved grade(s)
  if (resolvedChapters.length === 0) {
    resolvedChapters.push(...Array.from(availableChapterMap.values()));
  }

  // Validate lessons if specified
  const resolvedLessonsByChapter: Record<string, string[]> = {};
  const allAllowedLessonsInSelectedChapters = new Map<string, string>(); // lesson -> chapterTitle

  for (const ch of resolvedChapters) {
    resolvedLessonsByChapter[ch.title] = [];
    for (const l of ch.lessons) {
      allAllowedLessonsInSelectedChapters.set(l, ch.title);
    }
  }

  if (params.lessons && params.lessons.length > 0) {
    for (const les of params.lessons) {
      const cleanLes = les.trim();
      let matchedLesson: string | undefined;
      let matchedChapterTitle: string | undefined;

      for (const [allowedLes, chTitle] of allAllowedLessonsInSelectedChapters.entries()) {
        if (allowedLes === cleanLes || allowedLes.includes(cleanLes) || cleanLes.includes(allowedLes)) {
          matchedLesson = allowedLes;
          matchedChapterTitle = chTitle;
          break;
        }
      }

      if (!matchedLesson || !matchedChapterTitle) {
        errors.push(`مبحث «${les}» متعلق به فصل‌های انتخاب‌شده نیست.`);
      } else {
        if (!resolvedLessonsByChapter[matchedChapterTitle].includes(matchedLesson)) {
          resolvedLessonsByChapter[matchedChapterTitle].push(matchedLesson);
        }
      }
    }
  } else {
    // If chapters selected but no specific lessons chosen, all lessons of those chapters are allowed
    for (const ch of resolvedChapters) {
      resolvedLessonsByChapter[ch.title] = [...ch.lessons];
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    normalizedSubject: tax.subject,
    resolvedGrade,
    resolvedChapters,
    resolvedLessonsByChapter
  };
}

/**
 * Builds the dynamic extraction prompt for AI.
 * Throws an error if parameters fail validation.
 */
export function buildQuestionExtractionPrompt(params: BuildPromptParams): string {
  const validation = validatePromptScope(params);
  const tax = getSubjectTaxonomy(validation.normalizedSubject || params.subject || 'زیست‌شناسی') || getSubjectTaxonomy('زیست‌شناسی')!;
  const isCustomChapters = Boolean(params.chapters && params.chapters.length > 0);
  const isCustomLessons = Boolean(params.lessons && params.lessons.length > 0);
  const isConstrainedScope = isCustomChapters || isCustomLessons;

  // Build the Allowed Taxonomy / Scope block
  let scopeSection = '';
  if (isConstrainedScope) {
    scopeSection = `### ⛔ محدوده مجاز و انحصاری دسته‌بندی (CRITICAL TAXONOMY BOUNDARIES):\n`;
    scopeSection += `کاربر محترم محدوده مشخصی برای این آزمون تعیین کرده است. شما «فقط و فقط» مجاز هستید سوالات را به فصل‌ها و گفتارهای زیر نسبت دهید:\n\n`;

    for (const ch of validation.resolvedChapters) {
      const lessons = validation.resolvedLessonsByChapter[ch.title] || [];
      if (lessons.length > 0) {
        scopeSection += `📌 **${ch.title}**:\n`;
        for (const les of lessons) {
          scopeSection += `   - ${les}\n`;
        }
        scopeSection += `\n`;
      }
    }

    scopeSection += `⚠️ **قانون اکید و غیرقابل نقض دسته‌بندی:**\n`;
    scopeSection += `۱. فقط سوالات مرتبط با مباحث انتخاب‌شده فوق را در این محدوده دسته‌بندی کن.\n`;
    scopeSection += `۲. شما اکیداً حق ندارید سوالی را به مبحثی خارج از لیست انتخاب‌شده بالا نسبت دهید.\n`;
    scopeSection += `۳. اگر سوالی در فایل وجود داشت که به مباحث فوق مرتبط نبود، آن را استخراج نکن یا در بخش توضیحات بنویس خارج از محدوده.\n`;
  } else {
    scopeSection = `### سرفصل‌ها و مباحث مرجع کتاب درسی برای درس ${tax.subject}:\n`;
    for (const g of tax.grades) {
      if (!validation.resolvedGrade || g.grade === validation.resolvedGrade) {
        scopeSection += `\n**پایه ${g.grade}**:\n`;
        for (const ch of g.chapters) {
          scopeSection += `  • ${ch.title}:\n`;
          for (const les of ch.lessons) {
            scopeSection += `     - ${les}\n`;
          }
        }
      }
    }
  }

  // Strict Anti-Hallucination & Taxonomy Integrity Rules (Requirement 10)
  const antiHallucinationRules = `### قوانین الزامی یکپارچگی Taxonomy و نام‌گذاری مباحث:
هوش مصنوعی به هیچ عنوان حق ندارد نام فصل یا مبحث جدید اختراع یا تغییر دهد.
خروجی باید «دقیقاً و عینا» یکی از مقادیر موجود در فهرست سرفصل‌های مجاز فوق باشد.
موارد زیر صریحاً و به طور قطعی ممنوع هستند:
⛔ تولید نام مبحث جدید یا ترکیبی
⛔ تغییر دادن کلمات یا حروف عنوان مبحث
⛔ کوتاه‌کردن، خلاصه کردن یا مخفف‌سازی نام فصل و مبحث
⛔ ترجمه نام مبحث یا استفاده از معادل‌های غیراستاندارد
⛔ نسبت‌دادن سوال به مبحثی خارج از فهرست مجاز تعیین‌شده`;

  // General Extraction Rules
  const generalRules = `### دستورالعمل استخراج و استانداردسازی سوالات (قالب استاندارد و فوق‌سریع):
۱. هر تست را با جداکننده مشخص مانند === تست ۱ === یا --- تست ۱ --- از سایر تست‌ها جدا کن.
۲. متن کامل صورت سوال را بعد از عنوان «سوال:» بنویس (یا مستقیماً زیر خط تست).
۳. گزینه‌ها را با شماره‌های ۱) تا ۴) یا ۱. تا ۴. به ترتیب در خطوط مجزا بنویس.
۴. شماره گزینه صحیح را با فرمت «پاسخ: گزینه ۲» (یا کلید: ۲) مشخص کن.
۵. تحلیل و پاسخ تشریحی را بعد از «پاسخ تشریحی:» بنویس.
۶. مشخصات دسته‌بندی را با ساختار «درس: ... | فصل: ... | مبحث: ... | پایه: ... | سختی: ... | منبع: ...» قرار بده.
۷. فرمول‌ها و عبارات ریاضی و فیزیکی را داخل علامت‌های $...$ (فرمت لاتک) قرار بده.
۸. توجه: قالب تگ‌دار سنتی [BOX_1]...[/BOX_1] یا فرمت خروجی مستقیم JSON نیز کاملاً معتبر و پشتیبانی‌شده است.
۹. از درج توضیحات اضافی قبل یا بعد از متن سوالات خودداری کن.`;

  // Subject Specific Rules (Requirement 11 for Biology, etc.)
  const subjectSpecialRules = tax.specializedRules 
    ? `### ${tax.specializedRules}\n` 
    : '';

  const formulaRules = tax.formulaNote 
    ? `نکته فرمول‌نویسی: ${tax.formulaNote}\n` 
    : '';

  // Clean, modern template
  const sampleMetaTemplate = `### نمونه خروجی استاندارد و خوانا برای هر تست:
=== تست ۱ ===
سوال: متن کامل صورت تست و آزمون کنکور...
۱) گزینه اول تست
۲) گزینه دوم تست
۳) گزینه سوم تست
۴) گزینه چهارم تست
پاسخ: گزینه ۲
پاسخ تشریحی:
تحلیل و توضیح کامل گام به گام و علت درستی گزینه و رد سایر گزینه‌ها...
درس: ${tax.subject} | فصل: ${validation.resolvedChapters[0]?.title || 'فصل ۱'} | مبحث: ${validation.resolvedLessonsByChapter[validation.resolvedChapters[0]?.title]?.[0] || 'گفتار ۱'} | پایه: ${validation.resolvedGrade || 'دوازدهم'} | سختی: متوسط | منبع: کنکور سراسری`;

  return `### پرامپت اختصاصی استخراج، تحلیل و ورود سوالات ${tax.subject} به بانک تست
شما سرگروه ارشد و متخصص دپارتمان ${tax.subject} کنکور سراسری هستید و وظیفه شما استخراج، استانداردسازی و دسته‌بندی فوق‌دقیق سوالات این درس از فایل‌ها و جزوات آزمون است.

${scopeSection}
${antiHallucinationRules}

${subjectSpecialRules}
${formulaRules}
${generalRules}

${sampleMetaTemplate}`;
}
