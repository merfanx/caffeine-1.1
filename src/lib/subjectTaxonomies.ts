export interface ChapterTaxonomy {
  number: number;
  title: string;
  grade: '10th' | '11th' | '12th' | string;
  lessons: string[];
}

export interface SubjectGradeTaxonomy {
  grade: string;
  gradeTitle: string;
  chapters: ChapterTaxonomy[];
}

export interface SubjectTaxonomy {
  id: string;
  name: string;
  field: 'experimental' | 'mathematics' | 'humanities' | 'general';
  fieldTitle: string;
  icon: string;
  grades: SubjectGradeTaxonomy[];
}

export const SUBJECT_TAXONOMIES: SubjectTaxonomy[] = [
  {
    id: 'biology',
    name: 'زیست‌شناسی',
    field: 'experimental',
    fieldTitle: 'علوم تجربی',
    icon: '🧬',
    grades: [
      {
        grade: '10th',
        gradeTitle: 'پایه دهم',
        chapters: [
          { number: 1, title: 'فصل ۱: زیست‌شناسی، دیروز، امروز و فردا', grade: '10th', lessons: ['گفتار ۱: زیست‌شناسی چیست؟', 'گفتار ۲: نگرش‌های نوین در زیست‌شناسی'] },
          { number: 2, title: 'فصل ۲: گوارش و جذب مواد', grade: '10th', lessons: ['گفتار ۱: ساختار و عملکرد لوله گوارش', 'گفتار ۲: فرایند گوارش و جذب غذا', 'گفتار ۳: تنوع گوارش در جانوران'] },
          { number: 3, title: 'فصل ۳: تبادلات گازی', grade: '10th', lessons: ['گفتار ۱: ساختار و کار دستگاه تنفس', 'گفتار ۲: تهویه ششی', 'گفتار ۳: تنوع تبادلات گازی در جانوران'] },
          { number: 4, title: 'فصل ۴: گردش مواد در بدن', grade: '10th', lessons: ['گفتار ۱: قلب و گردش خون', 'گفتار ۲: رگ‌ها و فشار خون', 'گفتار ۳: خون و هموستازی', 'گفتار ۴: تنوع گردش مواد در جانوران'] },
          { number: 5, title: 'فصل ۵: تنظیم اسمزی و دفع مواد زائد', grade: '10th', lessons: ['گفتار ۱: هموستازی و کلیه‌ها', 'گفتار ۲: تشکیل ادرار و تخلیه آن', 'گفتار ۳: تنوع دفع در جانداران'] },
          { number: 6, title: 'فصل ۶: از یاخته تا گیاه', grade: '10th', lessons: ['گفتار ۱: ویژگی‌های یاخته گیاهی', 'گفتار ۲: سامانه‌های بافتی گیاه', 'گفتار ۳: ساختار گیاهان'] },
          { number: 7, title: 'فصل ۷: جذب و انتقال مواد در گیاهان', grade: '10th', lessons: ['گفتار ۱: تغذیه گیاهی', 'گفتار ۲: انتقال مواد در گیاهان'] }
        ]
      },
      {
        grade: '11th',
        gradeTitle: 'پایه یازدهم',
        chapters: [
          { number: 1, title: 'فصل ۱: تنظیم عصبی', grade: '11th', lessons: ['گفتار ۱: یاخته‌های بافت عصبی و پتانسیل عمل', 'گفتار ۲: ساختار دستگاه عصبی'] },
          { number: 2, title: 'فصل ۲: حواس', grade: '11th', lessons: ['گفتار ۱: گیرنده‌های حسی', 'گفتار ۲: حواس ویژه (بینایی، شنوایی، چشایی، بویایی)', 'گفتار ۳: گیرنده‌های حسی جانوران'] },
          { number: 3, title: 'فصل ۳: دستگاه حرکتی', grade: '11th', lessons: ['گفتار ۱: استخوان‌ها و اسکلت', 'گفتار ۲: ماهیچه و انقباض عضلانی'] },
          { number: 4, title: 'فصل ۴: تنظیم شیمیایی', grade: '11th', lessons: ['گفتار ۱: ارتباط شیمیایی و هورمون‌ها', 'گفتار ۲: غدد درون‌ریز بدن'] },
          { number: 5, title: 'فصل ۵: ایمنی', grade: '11th', lessons: ['گفتار ۱: نخستین خط دفاعی', 'گفتار ۲: دومین خط دفاعی (غیراختصاصی)', 'گفتار ۳: سومین خط دفاعی (اختصاصی)'] },
          { number: 6, title: 'فصل ۶: تقسیم یاخته', grade: '11th', lessons: ['گفتار ۱: کروموزوم‌ها و میتوز', 'گفتار ۲: میوز و تولید مثل جنسی'] },
          { number: 7, title: 'فصل ۷: تولید مثل', grade: '11th', lessons: ['گفتار ۱: دستگاه تولید مثل مرد', 'گفتار ۲: دستگاه تولید مثل زن', 'گفتار ۳: رشد و نمو جنین'] },
          { number: 8, title: 'فصل ۸: تولید مثل نهاندانگان', grade: '11th', lessons: ['گفتار ۱: تولید مثل غیرجنسی', 'گفتار ۲: تولید مثل جنسی و گرده‌افشانی', 'گفتار ۳: رویش دانه و میوه'] },
          { number: 9, title: 'فصل ۹: پاسخ گیاهان به محرک‌ها', grade: '11th', lessons: ['گفتار ۱: تنظیم‌کننده‌های رشد گیاهی (هورمون‌ها)', 'گفتار ۲: پاسخ به محیط'] }
        ]
      },
      {
        grade: '12th',
        gradeTitle: 'پایه دوازدهم',
        chapters: [
          { number: 1, title: 'فصل ۱: مولکول‌های اطلاعاتی', grade: '12th', lessons: ['گفتار ۱: نوکلئیک اسیدها و ساختار DNA', 'گفتار ۲: همانندسازی دِنا', 'گفتار ۳: پروتئین‌ها'] },
          { number: 2, title: 'فصل ۲: جریان اطلاعات در یاخته', grade: '12th', lessons: ['گفتار ۱: رونویسی', 'گفتار ۲: به سوی پروتئین (ترجمه)', 'گفتار ۳: تنظیم بیان ژن'] },
          { number: 3, title: 'فصل ۳: انتقال اطلاعات در نسل‌ها (ژنتیک)', grade: '12th', lessons: ['گفتار ۱: مفاهیم پایه ژنتیک و مندل', 'گفتار ۲: انواع صفات و وراثت'] },
          { number: 4, title: 'فصل ۴: تغییر در اطلاعات وراثتی', grade: '12th', lessons: ['گفتار ۱: جهش و انواع آن', 'گفتار ۲: شواهد تغییر گونه‌ها', 'گفتار ۳: جریان اطلاعات در جمعیت‌ها'] },
          { number: 5, title: 'فصل ۵: از ماده به انرژی (تنفس یاخته‌ای)', grade: '12th', lessons: ['گفتار ۱: گلیکولیز و تنفس یاخته‌ای', 'گفتار ۲: اکسایش پیرووات و چرخه کربس', 'گفتار ۳: زنجیره انتقال الکترون و تخمیر'] },
          { number: 6, title: 'فصل ۶: از انرژی به ماده (فتوسنتز)', grade: '12th', lessons: ['گفتار ۱: فتوسنتز و جذب نور', 'گفتار ۲: واکنش‌های نوری و تاریکی فتوسنتز', 'گفتار ۳: گیاهان C3, C4 و CAM'] },
          { number: 7, title: 'فصل ۷: فناوری‌های نوین زیستی', grade: '12th', lessons: ['گفتار ۱: مهندسی ژنتیک و کلونینگ', 'گفتار ۲: کاربردهای زیست‌فناوری'] },
          { number: 8, title: 'فصل ۸: رفتارهای جانوران', grade: '12th', lessons: ['گفتار ۱: اساس رفتارهای جانوری', 'گفتار ۲: انتخاب طبیعی و تکامل رفتارها'] }
        ]
      }
    ]
  },
  {
    id: 'chemistry',
    name: 'شیمی',
    field: 'experimental',
    fieldTitle: 'علوم تجربی و ریاضی',
    icon: '🧪',
    grades: [
      {
        grade: '10th',
        gradeTitle: 'پایه دهم',
        chapters: [
          { number: 1, title: 'فصل ۱: کیهان زادگاه الفبای هستی', grade: '10th', lessons: ['ساختار اتم و ایزوتوپ‌ها', 'جرم اتمی و جدول تناوبی', 'آرایش الکترونی و یون‌ها'] },
          { number: 2, title: 'فصل ۲: رد پای گازها در زندگی', grade: '10th', lessons: ['هواکره و گازهای تشکیل‌دهنده', 'قوانین گازها و استوکیومتری گاز', 'سوختن و شیمی سبز'] },
          { number: 3, title: 'فصل ۳: آب، آهنگ زندگی', grade: '10th', lessons: ['محلول‌ها و انحلال‌پذیری', 'غلظت‌های مولی، درصدی و ppm', 'نیروهای بین‌مولکولی'] }
        ]
      },
      {
        grade: '11th',
        gradeTitle: 'پایه یازدهم',
        chapters: [
          { number: 1, title: 'فصل ۱: قدر هدایای زمینی را بدانیم', grade: '11th', lessons: ['شیمی آلی و هیدروکربن‌ها', 'آلکان‌ها، آلکن‌ها و آلکین‌ها', 'استخراج فلزات و بازده درصدی'] },
          { number: 2, title: 'فصل ۲: در پی غذای سالم', grade: '11th', lessons: ['ترمودینامیک شیمیایی و آنتالپی', 'سینتیک شیمیایی و سرعت واکنش', 'قانون هس و گرمازدایی'] },
          { number: 3, title: 'فصل ۳: پوشاک، نیازی پایان‌ناپذیر', grade: '11th', lessons: ['پلیمرها و درشت‌مولکول‌ها', 'استرها و الکل‌ها', 'پلی‌استر و پلی‌آمید'] }
        ]
      },
      {
        grade: '12th',
        gradeTitle: 'پایه دوازدهم',
        chapters: [
          { number: 1, title: 'فصل ۱: مولکول‌ها در خدمت تندرستی', grade: '12th', lessons: ['پاک‌کننده‌ها و صابون‌ها', 'اسیدها و بازها و pH', 'خنثی‌شدن و بافرها'] },
          { number: 2, title: 'فصل ۲: آسایش و رفاه در سایه شیمی', grade: '12th', lessons: ['الکتروشیمی و عدد اکسایش', 'سلول‌های گالوانی و پتانسیل استاندارد', 'سلول‌های الکترولیتی و خوردگی'] },
          { number: 3, title: 'فصل ۳: شیمی جلوه‌ای از هنر، زیبایی و دستاوردها', grade: '12th', lessons: ['جامدهای کووالانسی، یونی و فلزی', 'الماس، گرافیت و سیلیس'] },
          { number: 4, title: 'فصل ۴: شیمی، راهی به سوی آینده‌ای روشن‌تر', grade: '12th', lessons: ['انرژی فعال‌سازی و کاتالیزورها', 'تعادل شیمیایی و اصل لوشاتلیه', 'سنتز آمونیاک به روش هابر'] }
        ]
      }
    ]
  },
  {
    id: 'physics',
    name: 'فیزیک',
    field: 'experimental',
    fieldTitle: 'علوم تجربی و ریاضی',
    icon: '⚡',
    grades: [
      {
        grade: '10th',
        gradeTitle: 'پایه دهم',
        chapters: [
          { number: 1, title: 'فصل ۱: فیزیک و اندازه‌گیری', grade: '10th', lessons: ['کمیت‌ها و یکاها', 'دقت اندازه‌گیری و چگالی'] },
          { number: 2, title: 'فصل ۲: ویژگی‌های فیزیکی مواد', grade: '10th', lessons: ['نیروهای بین مولکولی و فشار', 'فشار در شاره‌ها و جوسنجی', 'شناوری و اصل ارشمیدس'] },
          { number: 3, title: 'فصل ۳: کار، انرژی و توان', grade: '10th', lessons: ['کار انجام شده توسط نیروی ثابت', 'قضیه کار و انرژی جنبشی', 'پایستگی انرژی مکانیکی و بازده'] },
          { number: 4, title: 'فصل ۴: دما و گرما', grade: '10th', lessons: ['دما و دماسنجی', 'گرمای ویژه و گرمای نهان', 'روش‌های انتقال گرما و قوانین گازها'] }
        ]
      },
      {
        grade: '11th',
        gradeTitle: 'پایه یازدهم',
        chapters: [
          { number: 1, title: 'فصل ۱: الکتریسیته ساکن', grade: '11th', lessons: ['قانون کولن و میدان الکتریکی', 'پتانسیل الکتریکی و خازن‌ها'] },
          { number: 2, title: 'فصل ۲: جریان الکتریکی و مدارهای جریان مستقیم', grade: '11th', lessons: ['جریان الکتریکی و قانون اهم', 'مدارها و توان الکتریکی'] },
          { number: 3, title: 'فصل ۳: مغناطیس و القای الکترومغناطیسی', grade: '11th', lessons: ['میدان مغناطیسی و نیروی لورنتس', 'قانون فارادی و قانون لنز'] }
        ]
      },
      {
        grade: '12th',
        gradeTitle: 'پایه دوازدهم',
        chapters: [
          { number: 1, title: 'فصل ۱: حرکت بر خط راست', grade: '12th', lessons: ['بردار مکان و سرعت', 'حرکت با شتاب ثابت و نمودارها'] },
          { number: 2, title: 'فصل ۲: دینامیک و حرکت دایره‌ای', grade: '12th', lessons: ['قوانین نیوتون و نیروی اصطکاک', 'نیروی کشسانی فنر و گرانش'] },
          { number: 3, title: 'فصل ۳: نوسان و امواج', grade: '12th', lessons: ['نوسانگر ساده و انرژی نوسان', 'امواج مکانیکی، صوتی و الکترومغناطیسی'] },
          { number: 4, title: 'فصل ۴: فیزیک اتمی و هسته‌ای', grade: '12th', lessons: ['اثر فوتوالکتریک و طیف اتمی', 'ساختار هسته و پرتوزایی'] }
        ]
      }
    ]
  },
  {
    id: 'mathematics',
    name: 'ریاضیات',
    field: 'experimental',
    fieldTitle: 'علوم تجربی',
    icon: '📐',
    grades: [
      {
        grade: '10th',
        gradeTitle: 'پایه دهم',
        chapters: [
          { number: 1, title: 'فصل ۱: مجموعه‌ها، الگو و دنباله', grade: '10th', lessons: ['مجموعه‌های متناهی و نامتناهی', 'دنباله حسابی و هندسی'] },
          { number: 2, title: 'فصل ۲: مثلثات', grade: '10th', lessons: ['نسبت‌های مثلثاتی و دایره مثلثاتی', 'روابط تکمیلی مثلثات'] },
          { number: 3, title: 'فصل ۳: توان‌های گویا و عبارت‌های جبری', grade: '10th', lessons: ['ریشه و توان گویا', 'اتحادها و تجزیه عبارات'] },
          { number: 4, title: 'فصل ۴: معادله و نامعادله', grade: '10th', lessons: ['معادله درجه دوم و روش‌های حل', 'تعیین علامت و نامعادلات'] }
        ]
      },
      {
        grade: '11th',
        gradeTitle: 'پایه یازدهم',
        chapters: [
          { number: 1, title: 'فصل ۱: هندسه تحلیلی و جبر', grade: '11th', lessons: ['معادله خط و فاصله نقطه از خط', 'معادلات گویا و رادیکالی'] },
          { number: 2, title: 'فصل ۲: هندسه', grade: '11th', lessons: ['استدلال و قضیه تالس', 'تشابه مثلث‌ها'] },
          { number: 3, title: 'فصل ۳: تابع', grade: '11th', lessons: ['مفاهیم تابع و توابع وارون', 'توابع گویا و پله‌ای'] },
          { number: 4, title: 'فصل ۴: مثلثات', grade: '11th', lessons: ['رادیان و دایره مثلثاتی', 'توابع مثلثاتی'] },
          { number: 5, title: 'فصل ۵: توابع نمایی و لگاریتمی', grade: '11th', lessons: ['تابع نمایی', 'تابع لگاریتمی و ویژگی‌های آن'] },
          { number: 6, title: 'فصل ۶: حد و پیوستگی', grade: '11th', lessons: ['فرآیندهای حدی و محاسبه حد', 'پیوستگی تابع'] },
          { number: 7, title: 'فصل ۷: آمار و احتمال', grade: '11th', lessons: ['احتمال شرطی و پیشامدهای مستقل', 'آمار توصیفی و پراکندگی'] }
        ]
      },
      {
        grade: '12th',
        gradeTitle: 'پایه دوازدهم',
        chapters: [
          { number: 1, title: 'فصل ۱: تابع', grade: '12th', lessons: ['ترکیب توابع و تبدیل نمودارها', 'توابع یک‌به‌یک و وارون‌پذیری'] },
          { number: 2, title: 'فصل ۲: مثلثات', grade: '12th', lessons: ['تناوب و تانژانت', 'معادلات مثلثاتی'] },
          { number: 3, title: 'فصل ۳: حدهای نامتناهی و حد در بی‌نهایت', grade: '12th', lessons: ['حدهای یک‌طرفه نامتناهی', 'مجانب‌های قائم و افقی'] },
          { number: 4, title: 'فصل ۴: مشتق', grade: '12th', lessons: ['مفهوم و تعریف مشتق', 'قواعد مشتق‌گیری و آهنگ تغییرات'] },
          { number: 5, title: 'فصل ۵: کاربرد مشتق', grade: '12th', lessons: ['نقاط بحرانی و اکسترمم‌های نسبی', 'یکنوایی و آزمون مشتق اول'] },
          { number: 6, title: 'فصل ۶: هندسه', grade: '12th', lessons: ['مقاطع مخروطی (دایره و بیضی)'] },
          { number: 7, title: 'فصل ۷: احتمال', grade: '12th', lessons: ['قانون احتمال کل و فرمول بیز'] }
        ]
      }
    ]
  }
];

export function getSubjectTaxonomy(subjectName: string): SubjectTaxonomy | undefined {
  if (!subjectName) return undefined;
  const clean = subjectName.trim().toLowerCase();
  return SUBJECT_TAXONOMIES.find(
    (s) =>
      s.id.toLowerCase() === clean ||
      s.name.toLowerCase() === clean ||
      clean.includes(s.name.toLowerCase()) ||
      s.name.toLowerCase().includes(clean)
  );
}

export function getAllSubjectNames(): string[] {
  return SUBJECT_TAXONOMIES.map((s) => s.name);
}

export function getSubjectLessons(subjectName: string, grade?: string): string[] {
  const tax = getSubjectTaxonomy(subjectName);
  if (!tax) return [];
  const lessons: string[] = [];
  tax.grades.forEach((g) => {
    if (!grade || g.grade === grade || g.gradeTitle.includes(grade)) {
      g.chapters.forEach((c) => {
        lessons.push(...c.lessons);
      });
    }
  });
  return lessons;
}
