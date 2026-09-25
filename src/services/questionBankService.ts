import { KonkurGroup } from '../types';
import { BankQuestion, QuizBuildConfig, GeneratedQuiz, QuestionUserProgress, GradeLevel, QuestionReport, QuestionReportReason } from '../types/questionBankTypes';
import { ExamModel } from '../types/examTypes';
import { saveCustomExam } from './examService';
import {
  EXPERIMENTAL_TAXONOMY,
  getExperimentalChapters,
  getExperimentalTopics,
  getSubjectAIPrompt
} from '../lib/konkurExperimentalTaxonomy';
import { buildQuestionExtractionPrompt, validatePromptScope, BuildPromptParams } from './promptBuilder';

export { buildQuestionExtractionPrompt, validatePromptScope };
export type { BuildPromptParams };

const LOCAL_STORAGE_KEY_BANK = 'caffeine_custom_question_bank_v1';
const LOCAL_STORAGE_KEY_PROGRESS = 'caffeine_question_user_progress_v1';

export const INITIAL_QUESTION_BANK: BankQuestion[] = [
  // ==========================================
  // زیست‌شناسی تجربی (Biology)
  // ==========================================
  {
    id: 'bio-101',
    group: 'experimental',
    grade: 'twelfth',
    subject: 'زیست‌شناسی',
    chapter: 'فصل ۱: مولکول‌های اطلاعاتی',
    topic: 'نوکلئیک اسیدها و پیوندهای فسفودی‌استر',
    difficulty: 'medium',
    source: 'konkur_recent',
    year: 'کنکور سراسری ۱۴۰۳',
    questionText: 'در ساختار یک مولکول دنای دورشته‌ای خطی با ۳۰۰ پیوند هیدروژنی و ۱۰۰ نوکلئوتید گوانین‌دار، تعداد کل پیوندهای فسفودی‌استر چقدر است؟',
    options: [
      '۲۹۸ پیوند فسفودی‌استر',
      '۲۴۸ پیوند فسفودی‌استر',
      '۱۹۸ پیوند فسفودی‌استر',
      '۳۴۸ پیوند فسفودی‌استر'
    ],
    correctOption: 2,
    explanation: 'تعداد نوکلئوتیدهای G برابر ۱۰۰ است، پس بین G و C تعداد ۳۰۰ = ۱۰۰ × ۳ پیوند سه‌گانه داریم. چون کل پیوندها ۳۰۰ است، نوکلئوتیدهای A و T صفر هستند (پیوند دوگانه نداریم). کل نوکلئوتیدها برابر ۲۵۰ جفت یا مجموعاً ۲۵۰ نوکلئوتید نیست بلکه ۲۰۰ نوکلئوتید (۱۰۰ G و ۱۰۰ C) در ۲ رشته داریم. تعداد پیوندهای فسفودی‌استر در دنای خطی برابر 2n - 2 = (۲ × ۱۲۵) - ۲ = ۲۴۸ می‌باشد.',
    tags: ['محاسباتی', 'دنا', 'کنکور ۱۴۰۳']
  },
  {
    id: 'bio-102',
    group: 'experimental',
    grade: 'twelfth',
    subject: 'زیست‌شناسی',
    chapter: 'فصل ۲: جریان اطلاعات در یاخته',
    topic: 'ترجمه و رونویسی',
    difficulty: 'hard',
    source: 'talifi',
    questionText: 'کدام عبارت در مورد فرآیند ترجمه در یوکاریوت‌ها صحیح است؟',
    options: [
      'در جایگاه A رناتن (ریبوزوم) همواره رنای ناقل متصل به آمینواسید قرار می‌گیرد و پیوند پپتیدی در آنجا تشکیل می‌شود.',
      'پیوند پپتیدی توسط بخش پروتئینی زیرواحد بزرگ رناتن کاتالیز می‌شود.',
      'با ورود عامل پایان ترجمه به جایگاه A، پیوند بین آخرین آمینواسید و tRNA شکسته شده و پلی‌پپتید آزاد می‌شود.',
      'حرکت رناتن روی رنای پیک همواره در جهت ۳ به ۵ انجام می‌شود.'
    ],
    correctOption: 3,
    explanation: 'در مرحله پایان ترجمه با قرار گرفتن یکی از رمزه (کدون) های پایان در جایگاه A، پروتئینی به نام عامل پایان ترجمه وارد این جایگاه شده و با شکستن پیوند استری بین آخرین آمینواسید و tRNA موجب رهایی رشته پلی‌پپتیدی می‌شود. گزینه ۱ غلط است چون در جایگاه P پیوند پپتیدی شکل می‌گیرد و گزینه ۲ غلط است چون rRNA نقش آنزیمی (ریبوزایم) دارد نه بخش پروتئینی.',
    tags: ['ترجمه', 'مفهومی', 'دوازدهم']
  },
  {
    id: 'bio-103',
    group: 'experimental',
    grade: 'tenth',
    subject: 'زیست‌شناسی',
    chapter: 'فصل ۴: گردش مواد در بدن',
    topic: 'قلب و گردش خون انسان',
    difficulty: 'medium',
    source: 'konkur_recent',
    year: 'کنکور سراسری ۱۴۰۲',
    questionText: 'در مرحله انقباض بطن‌ها (سیستول بطنی) در یک چرخه طبیعی قلب انسان، کدام وضعیت به درستی رخ می‌دهد؟',
    options: [
      'دریچه‌های دهلیزی-بطنی باز و دریچه‌های سینی بسته‌اند.',
      'فشار خون در بطن‌ها کمتر از دهلیزها می‌باشد.',
      'دریچه‌های سینی باز شده و صدای اول قلب به علت بسته شدن دریچه‌های لختی شنیده می‌شود.',
      'حجم خون درون دهلیزها به کمترین مقدار خود در چرخه قلبی می‌رسد.'
    ],
    correctOption: 3,
    explanation: 'در ابتدای انقباض بطن‌ها به دلیل افزایش فشار درون بطن، دریچه‌های میترال و سه‌لختی محکم بسته می‌شوند که صدای اول قلب (طولانی و بم) را ایجاد می‌کنند و سپس با فزونی فشار بطن از سرخرگ‌ها، دریچه‌های سینی باز می‌شوند.',
    tags: ['قلب', 'دهم', 'گردش مواد']
  },
  {
    id: 'bio-104',
    group: 'experimental',
    grade: 'eleventh',
    subject: 'زیست‌شناسی',
    chapter: 'فصل ۱: تنظیم عصبی',
    topic: 'پتانسیل عمل و پمپ سدیم-پتاسیم',
    difficulty: 'hard',
    source: 'sanjesh',
    questionText: 'در پتانسیل عمل یک یاخته عصبی (نورون)، در لحظه رسیدن پتانسیل غشا به ۳۰+ میلی‌ولت، کدام گزینه صحیح است؟',
    options: [
      'کانال‌های دریچه‌دار سدیمی بسته شده و کانال‌های دریچه‌دار پتاسیمی باز می‌شوند.',
      'پمپ سدیم-پتاسیم کاملاً غیرفعال بوده و انرژی مصرف نمی‌کند.',
      'تراکم یون پتاسیم در مایع بین یاخته‌ای بیشتر از درون نورون می‌گردد.',
      'پتانسیل غشا به دلیل خروج فعالانه یون‌های سدیم شروع به کاهش می‌کند.'
    ],
    correctOption: 1,
    explanation: 'در قله نمودار پتانسیل عمل (+30mV)، کانال‌های دریچه‌دار سدیمی بسته شده و کانال‌های دریچه‌دار پتاسیمی باز می‌شوند تا با خروج یون پتاسیم در جهت شیب غلظت، پتانسیل به سمت پتانسیل آرامش بازگردد. پمپ سدیم-پتاسیم همواره فعال است.',
    tags: ['عصب', 'پتانسیل عمل', 'یازدهم']
  },
  {
    id: 'bio-105',
    group: 'experimental',
    grade: 'twelfth',
    subject: 'زیست‌شناسی',
    chapter: 'فصل ۳: انتقال اطلاعات در نسل‌ها',
    topic: 'ژنتیک و صفات مستقل',
    difficulty: 'expert',
    source: 'talifi',
    questionText: 'در فردی با ژنوتیپ AaBbCcDd که تمام ژن‌ها روی کروموزوم‌های غیرمتصل (مستقل) قرار دارند، چه نسبتی از گامت‌ها حاوی حداقل ۳ الل غالب خواهند بود؟',
    options: [
      '۵/۱۶',
      '۴/۱۶',
      '۱/۱۶',
      '۶/۱۶'
    ],
    correctOption: 1,
    explanation: 'تعداد کل گامت‌ها ۲ به توان ۴ = ۱۶ است. حالاتی که حداقل ۳ الل غالب دارند: الف) دقیقاً ۴ الل غالب: ۱ حالت (ABCD). ب) دقیقاً ۳ الل غالب: ۴ حالت (ABCd, ABcD, AbCD, aBCD). مجموع حالات مساعد = ۱ + ۴ = ۵ حالت از ۱۶ حالت، یعنی ۵/۱۶.',
    tags: ['ژنتیک', 'احتمال', 'چالشی']
  },

  // ==========================================
  // شیمی تجربی و ریاضی (Chemistry)
  // ==========================================
  {
    id: 'chem-201',
    group: 'experimental',
    grade: 'tenth',
    subject: 'شیمی',
    chapter: 'فصل ۲: ردپای گازها در زندگی',
    topic: 'استوکیومتری و قانون گازها',
    difficulty: 'medium',
    source: 'konkur_recent',
    year: 'کنکور سراسری ۱۴۰۳',
    questionText: 'از تجزیه کامل ۱۰ گرم کلسیم کربنات خالص با جرم مولی ۱۰۰ گرم بر مول بر اثر گرما، چند لیتر گاز کربن دی‌اکسید در شرایط STP تولید می‌شود؟ (Ca=40, C=12, O=16)',
    options: [
      '۲.۲۴ لیتر',
      '۴.۴۸ لیتر',
      '۱.۱۲ لیتر',
      '۲۲.۴ لیتر'
    ],
    correctOption: 1,
    explanation: 'معادله واکنش: CaCO3(s) -> CaO(s) + CO2(g). تعداد مول CaCO3 برابر 10 / 100 = 0.1 مول است. طبق نسبت مولی، 0.1 مول CO2 حاصل می‌شود. در شرایط STP هر مول گاز 22.4 لیتر است، بنابراین حجم گاز = 0.1 × 22.4 = 2.24 لیتر.',
    tags: ['استوکیومتری', 'گازها', 'شیمی دهم']
  },
  {
    id: 'chem-202',
    group: 'experimental',
    grade: 'twelfth',
    subject: 'شیمی',
    chapter: 'فصل ۱: مولکول‌ها در خدمت تندرستی',
    topic: 'اسیدها، بازها و pH',
    difficulty: 'hard',
    source: 'sanjesh',
    questionText: 'اگر درصد یونش یک اسید ضعیف یک پروتون‌دار (HA) در محلول ۰.۱ مولار آن برابر ۲ درصد باشد، ثابت یونش این اسید (Ka) کدام است؟',
    options: [
      '۴ × ۱۰⁻⁵',
      '۲ × ۱۰⁻⁴',
      '۴ × ۱۰⁻⁴',
      '۲ × ۱۰⁻⁵'
    ],
    correctOption: 1,
    explanation: 'درصد یونش = ۲٪ یعنی درجه یونش α = ۰.۰۲ است. غلظت یون هیدرونیوم = M × α = ۰.۱ × ۰.۰۲ = ۲ × ۱۰⁻³ مولار. فرمول ثابت یونش: Ka = (M × α²) / (1 - α). با تقریب چون α < ۰.۰۵ است: Ka = ۰.۱ × (۰.۰۲)² = ۰.۱ × ۴ × ۱۰⁻⁴ = ۴ × ۱۰⁻⁵.',
    tags: ['اسید و باز', 'pH', 'دوازدهم']
  },
  {
    id: 'chem-203',
    group: 'experimental',
    grade: 'eleventh',
    subject: 'شیمی',
    chapter: 'فصل ۲: در پی غذای سالم',
    topic: 'آنتالپی و قانون هس',
    difficulty: 'medium',
    source: 'konkur_recent',
    year: 'کنکور ۱۴۰۲',
    questionText: 'با توجه به واکنش‌های گرماشیمیایی زیر، آنتالپی واکنش C(s) + O2(g) -> CO2(g) چقدر است؟\n۱) C(s) + 1/2 O2(g) -> CO(g) , ΔH = -110.5 kJ\n۲) CO(g) + 1/2 O2(g) -> CO2(g) , ΔH = -283.0 kJ',
    options: [
      '-393.5 کیلوژول',
      '-172.5 کیلوژول',
      '+393.5 کیلوژول',
      '-493.5 کیلوژول'
    ],
    correctOption: 1,
    explanation: 'با جمع زدن مستقیم معادله ۱ و معادله ۲، ماده واسط CO از دو طرف حذف شده و معادله کلی C + O2 -> CO2 حاصل می‌گردد. طبق قانون هس: ΔH = (-110.5) + (-283.0) = -393.5 kJ.',
    tags: ['آنتالپی', 'ترمودینامیک', 'قانون هس']
  },

  // ==========================================
  // فیزیک (Physics)
  // ==========================================
  {
    id: 'phy-301',
    group: 'experimental',
    grade: 'twelfth',
    subject: 'فیزیک',
    chapter: 'فصل ۱: حرکت بر خط راست',
    topic: 'حرکت با شتاب ثابت و نمودار سرعت-زمان',
    difficulty: 'medium',
    source: 'konkur_recent',
    year: 'کنکور سراسری ۱۴۰۳',
    questionText: 'متحرکی از حال سکون با شتاب ثابت ۲ متر بر مجذور ثانیه روی خط راست شروع به حرکت می‌کند. این متحرک در ثانیه چهارم حرکت خود چه مسافتی را طی می‌کند؟',
    options: [
      '۷ متر',
      '۱۶ متر',
      '۹ متر',
      '۸ متر'
    ],
    correctOption: 1,
    explanation: 'فرمول جابه‌جایی در ثانیه nام: Δx_n = 1/2 a (2n - 1) + v0. با جایگذاری a=2 و n=4 و v0=0 داریم: Δx_4 = 1/2 × 2 × (2(4) - 1) = 1 × 7 = 7 متر.',
    tags: ['سینماتیک', 'شتاب ثابت', 'فیزیک دوازدهم']
  },
  {
    id: 'phy-302',
    group: 'experimental',
    grade: 'twelfth',
    subject: 'فیزیک',
    chapter: 'فصل ۳: نوسان و امواج',
    topic: 'نوسانگر هماهنگ ساده',
    difficulty: 'hard',
    source: 'talifi',
    questionText: 'در یک نوسانگر وزنه-فنر، هنگامی که انرژی جنبشی نوسانگر ۳ برابر انرژی پتانسیل کشسانی آن است، مکان نوسانگر بر حسب دامنه (A) کدام است؟',
    options: [
      'x = ± A / 2',
      'x = ± A / √2',
      'x = ± A √3 / 2',
      'x = ± A / 4'
    ],
    correctOption: 1,
    explanation: 'انرژی کل E = K + U است. چون K = 3U داده شده: E = 3U + U = 4U. فرمول انرژی: E = 1/2 k A² و U = 1/2 k x². پس 1/2 k A² = 4 (1/2 k x²) => A² = 4 x² => x = ± A / 2.',
    tags: ['نوسان', 'انرژی نوسانگر']
  },

  // ==========================================
  // ریاضی تجربی و حسابان ریاضی (Math)
  // ==========================================
  {
    id: 'math-401',
    group: 'experimental',
    grade: 'twelfth',
    subject: 'ریاضیات تجربی',
    chapter: 'فصل ۵: کاربرد مشتق',
    topic: 'نقاط بحرانی و اکسترمم‌های نسبی',
    difficulty: 'hard',
    source: 'konkur_recent',
    year: 'کنکور سراسری ۱۴۰۲',
    questionText: 'بیشترین مقدار مساحت مستطیلی که دو رأس آن روی محور xها و دو رأس دیگر آن روی سهمی y = 12 - x² قرار دارند، چقدر است؟',
    options: [
      '۳۲',
      '۱۶',
      '۲۴',
      '۴۸'
    ],
    correctOption: 1,
    explanation: 'اگر مختصات رأس روی سهمی (x, 12 - x²) باشد با x > 0، طول مستطیل برابر 2x و ارتفاع آن y = 12 - x² است. مساحت S(x) = 2x(12 - x²) = 24x - 2x³. مشتق: S\'(x) = 24 - 6x² = 0 => x² = 4 => x = 2. مقدار بیشینه مساحت = S(2) = 2(2)(12 - 4) = 4 × 8 = 32.',
    tags: ['کاربرد مشتق', 'بهینه‌سازی']
  },
  {
    id: 'math-402',
    group: 'math',
    grade: 'twelfth',
    subject: 'حسابان و ریاضیات',
    chapter: 'فصل ۳: حد و پیوستگی',
    topic: 'محاسبه حدود مثلثاتی و رفع ابهام',
    difficulty: 'medium',
    source: 'talifi',
    questionText: 'حاصل حد lim (x -> 0) [ (1 - cos 2x) / (x sin 3x) ] برابر با کدام مقدار است؟',
    options: [
      '۲/۳',
      '۴/۳',
      '۱/۳',
      '۲'
    ],
    correctOption: 1,
    explanation: 'می‌دانیم 1 - cos 2x = 2 sin² x. در همسایگی صفر داریم: sin x ~ x و sin 3x ~ 3x. پس صورت ~ 2 x² و مخرج ~ x(3x) = 3 x². حاصل حد = 2x² / 3x² = 2/3.',
    tags: ['حد و پیوستگی', 'مثلثات', 'هم‌ارزی']
  },

  // ==========================================
  // علوم انسانی (Humanities)
  // ==========================================
  {
    id: 'hum-501',
    group: 'humanities',
    grade: 'twelfth',
    subject: 'علوم و فنون ادبی',
    chapter: 'فصل ۱: عروض و قافیه',
    topic: 'اختیارات شاعری و وزن شعر',
    difficulty: 'medium',
    source: 'konkur_recent',
    year: 'کنکور ۱۴۰۳',
    questionText: 'در مصراع «یار مرا غار مرا عشق جگرخوار مرا»، وزن عروضی شعر کدام است؟',
    options: [
      'مفتعلن مفتعلن مفتعلن مفتعلن',
      'فاعلاتن فاعلاتن فاعلاتن فاعلن',
      'مستفعلن مستفعلن مستفعلن مستفعلن',
      'فعولن فعولن فعولن فعول'
    ],
    correctOption: 1,
    explanation: 'تقطیع هجایی: یا-رِ-مَ-را (– U U –) / غا-رِ-مَ-را (– U U –) / عِش-قِ-جِ-گَر (– U U –) / خوا-رِ-مَ-را (– U U –) معادل با مفتعلن مفتعلن مفتعلن مفتعلن در بحر رجز مثمن مطوی مکشوف است.',
    tags: ['عروض', 'علوم و فنون']
  },
  {
    id: 'hum-502',
    group: 'humanities',
    grade: 'eleventh',
    subject: 'روانشناسی و فلسفه',
    chapter: 'فصل ۳: احساس و ادراک',
    topic: 'خطاهای ادراکی و حافظه',
    difficulty: 'medium',
    source: 'sanjesh',
    questionText: 'کدام پدیده در ادراک بینایی نشان‌دهنده خطای بینایی ناشی از تفسیر نادرست نشانه‌های عمق در تصویر دوبعدی است؟',
    options: [
      'خطای مولر-لایر و پونزو',
      'پدیده ثبات رنگ و اندازه',
      'ادراک شکل و زمینه',
      'پدیده انطباق حسی'
    ],
    correctOption: 1,
    explanation: 'خطاهای دیداری مانند خطای مولر-لایر (Müller-Lyer) و پونزو ناشی از تعمیم نشانه‌های فاصله و پرسپکتیو سه‌بعدی روی طرح‌های دوبعدی هستند.',
    tags: ['روانشناسی', 'ادراک']
  },

  // ==========================================
  // سوالات تکمیلی و جامع تمام دروس و پایه‌ها
  // ==========================================
  {
    id: 'bio-106',
    group: 'experimental',
    grade: 'tenth',
    subject: 'زیست‌شناسی',
    chapter: 'فصل ۲: گوارش و جذب مواد',
    topic: 'تنظیم ترشحات معده و آنزیم‌ها',
    difficulty: 'medium',
    source: 'konkur_recent',
    year: 'کنکور سراسری ۱۴۰۲',
    questionText: 'در مورد سلول‌های غدد معده انسان، کدام گزینه صحیح است؟',
    options: [
      'سلول‌های حاشیه‌ای همزمان اسید کلریدریک ($HCl$) و فاکتور داخلی معده را ترشح می‌کنند.',
      'سلول‌های اصلی به طور مستقیم آنزیم پپسین فعال را به فضای معده ترشح می‌نمایند.',
      'هورمون گاسترین توسط سلول‌های موکوزی به درون حفره معده ترشح می‌شود.',
      'فاکتور داخلی معده برای جذب ویتامین $C$ در روده باریک ضروری است.'
    ],
    correctOption: 1,
    explanation: 'سلول‌های حاشیه‌ای (Parietal cells) در غدد معده، هر دو ماده $HCl$ و فاکتور داخلی معده (ضروری برای جذب ویتامین $B_{12}$) را ترشح می‌کنند. پپسینوژن غیرفعال توسط سلول‌های اصلی ترشح می‌شود و گاسترین هورمونی است که وارد خون می‌شود نه حفره معده.',
    tags: ['گوارش', 'دهم', 'معده']
  },
  {
    id: 'bio-107',
    group: 'experimental',
    grade: 'twelfth',
    subject: 'زیست‌شناسی',
    chapter: 'فصل ۵: از ماده به انرژی',
    topic: 'تنفس یاخته‌ای و زنجیره انتقال الکترون',
    difficulty: 'hard',
    source: 'talifi',
    questionText: 'در تنفس یاخته‌ای هوازی در یوکاریوت‌ها، در پی فعالیت زنجیره انتقال الکترون میتوکندری، کدام رخداد رخ می‌دهد؟',
    options: [
      'یون‌های $H^+$ از ماتریکس به فضای بین دو غشا پمپ شده و $pH$ فضای بین دو غشا کاهش می‌یابد.',
      'الکترون‌ها در پایان زنجیره مستقیماً به مولکول کربن دی‌اکسید منتقل می‌شوند.',
      'آنزیم $ATP$ساز پروتون‌ها را از ماتریکس به فضای بین دو غشا منتقل می‌کند.',
      'تولید $NADH$ در بستره میتوکندری متوقف می‌شود.'
    ],
    correctOption: 1,
    explanation: 'پمپ‌های زنجیره انتقال الکترون پروتون‌ها ($H^+$) را از ماتریکس (بستره) به فضای بین دو غشای میتوکندری پمپ می‌کنند که منجر به ایجاد شیب الکتروشیمیایی و اسیدی‌تر شدن (کاهش $pH$) فضای بین دو غشا می‌شود. سپس پروتون‌ها از طریق مجرای آنزیم $ATP$ساز به ماتریکس بازمی‌گردند.',
    tags: ['تنفس یاخته‌ای', 'دوازدهم', 'میتوکندری']
  },
  {
    id: 'chem-204',
    group: 'experimental',
    grade: 'twelfth',
    subject: 'شیمی',
    chapter: 'فصل ۲: آسایش و رفاه در سایه شیمی',
    topic: 'الکتروشیمی و سلول‌های گالوانی',
    difficulty: 'hard',
    source: 'konkur_recent',
    year: 'کنکور ۱۴۰۳',
    questionText: 'با توجه به پتانسیل‌های کاهشی استاندارد: $E^\\circ(Zn^{2+}/Zn) = -0.76\\text{ V}$ و $E^\\circ(Cu^{2+}/Cu) = +0.34\\text{ V}$، نیروی الکتروموتوری استاندارد ($E^\\circ_{cell}$) سلول گالوانی روی-مس چقدر است و جهت حرکت الکترون‌ها در مدار بیرونی چگونه است؟',
    options: [
      '$E^\\circ_{cell} = +1.10\\text{ V}$ ، از آند روی به کاتد مس',
      '$E^\\circ_{cell} = +0.42\\text{ V}$ ، از کاتد مس به آند روی',
      '$E^\\circ_{cell} = +1.10\\text{ V}$ ، از کاتد روی به آند مس',
      '$E^\\circ_{cell} = -1.10\\text{ V}$ ، از آند مس به کاتد روی'
    ],
    correctOption: 1,
    explanation: 'روی با پتانسیل کاهشی منفی‌تر اکسید شده و آند است. مس کاتد است. $E^\\circ_{cell} = E^\\circ_{cathode} - E^\\circ_{anode} = (+0.34) - (-0.76) = +1.10\\text{ V}$. الکترون‌ها در مدار بیرونی همواره از آند (Zn) به کاتد (Cu) جاری می‌شوند.',
    tags: ['الکتروشیمی', 'سلول گالوانی', 'شیمی دوازدهم']
  },
  {
    id: 'chem-205',
    group: 'experimental',
    grade: 'eleventh',
    subject: 'شیمی',
    chapter: 'فصل ۱: قدر هدایای زمینی را بدانیم',
    topic: 'آلکین‌ها، هیدروکربن‌ها و واکنش‌های افزایشی',
    difficulty: 'medium',
    source: 'talifi',
    questionText: 'برای سیر کردن کامل ۱ مول گاز پروپین ($C_3H_4$) به چند مول مولکول گاز هیدروژن ($H_2$) نیاز است و محصول نهایی کدام ترکیب است؟',
    options: [
      '۲ مول $H_2$ - پروپان ($C_3H_8$)',
      '۱ مول $H_2$ - پروپن ($C_3H_6$)',
      '۳ مول $H_2$ - پروپان ($C_3H_8$)',
      '۲ مول $H_2$ - پروپن ($C_3H_6$)'
    ],
    correctOption: 1,
    explanation: 'پروپین یک آلکین با فرمول عمومی $C_nH_{2n-2}$ و دارای یک پیوند سه‌گانه کربن-کربن است. برای سیر شدن کامل به ۲ مول $H_2$ نیاز دارد تا به آلکان متناظر (پروپان $C_3H_8$) تبدیل شود: $C_3H_4 + 2H_2 \\rightarrow C_3H_8$.',
    tags: ['شیمی آلی', 'یازدهم', 'آلکین']
  },
  {
    id: 'phy-303',
    group: 'experimental',
    grade: 'tenth',
    subject: 'فیزیک',
    chapter: 'فصل ۲: ویژگی‌های فیزیکی مواد',
    topic: 'فشار در شاره‌ها و بالابر هیدرولیکی',
    difficulty: 'medium',
    source: 'konkur_recent',
    year: 'کنکور ۱۴۰۲',
    questionText: 'در یک بالابر هیدرولیکی، نسبت مساحت پیستون بزرگ به پیستون کوچک برابر ۵۰ است. برای بالا بردن یک اتومبیل به جرم ۱۰۰۰ کیلوگرم، چه نیرویی باید به پیستون کوچک وارد شود؟ ($g = 10\\text{ m/s}^2$)',
    options: [
      '$200\\text{ N}$',
      '$500\\text{ N}$',
      '$100\\text{ N}$',
      '$2000\\text{ N}$'
    ],
    correctOption: 1,
    explanation: 'طبق اصل پاسکال: $\\frac{F_1}{A_1} = \\frac{F_2}{A_2} \\rightarrow F_1 = F_2 \\times \\frac{A_1}{A_2}$. وزن اتومبیل $F_2 = mg = 1000 \\times 10 = 10000\\text{ N}$. پس: $F_1 = 10000 / 50 = 200\\text{ N}$.',
    tags: ['فشار', 'پاسکال', 'فیزیک دهم']
  },
  {
    id: 'phy-304',
    group: 'experimental',
    grade: 'twelfth',
    subject: 'فیزیک',
    chapter: 'فصل ۲: دینامیک و حرکت دایره‌ای',
    topic: 'قوانین نیوتون و نیروی اصطکاک',
    difficulty: 'hard',
    source: 'talifi',
    questionText: 'جسمی به جرم ۴ کیلوگرم روی یک سطح افقی با ضریب اصطکاک جنبشی $\\mu_k = 0.25$ قرار دارد. اگر نیروی افقی $F = 30\\text{ N}$ به جسم وارد شود، شتاب حرکت جسم چند متر بر مجذور ثانیه خواهد بود؟ ($g = 10\\text{ m/s}^2$)',
    options: [
      '$5\\text{ m/s}^2$',
      '$7.5\\text{ m/s}^2$',
      '$2.5\\text{ m/s}^2$',
      '$4\\text{ m/s}^2$'
    ],
    correctOption: 1,
    explanation: 'نیروی عمودی سطح $F_N = mg = 4 \\times 10 = 40\\text{ N}$. نیروی اصطکاک جنبشی $f_k = \\mu_k F_N = 0.25 \\times 40 = 10\\text{ N}$. قانون دوم نیوتون: $F_{net} = F - f_k = 30 - 10 = 20\\text{ N}$. شتاب $a = \\frac{F_{net}}{m} = \\frac{20}{4} = 5\\text{ m/s}^2$.',
    tags: ['دینامیک', 'نیوتون', 'اصطکاک']
  },
  {
    id: 'math-403',
    group: 'experimental',
    grade: 'eleventh',
    subject: 'ریاضیات تجربی',
    chapter: 'فصل ۳: توابع نمایی و لگاریتمی',
    topic: 'معادلات لگاریتمی و ویژگی‌های لگاریتم',
    difficulty: 'medium',
    source: 'konkur_recent',
    year: 'کنکور ۱۴۰۳',
    questionText: 'جواب معادله لگاریتمی $\\log_2(x+3) + \\log_2(x-3) = 4$ کدام است؟',
    options: [
      '$x = 5$',
      '$x = \\pm 5$',
      '$x = 4$',
      '$x = \\sqrt{7}$'
    ],
    correctOption: 1,
    explanation: 'شرط دامنه: $x > 3$. با ادغام لگاریتم‌ها: $\\log_2((x+3)(x-3)) = 4 \\rightarrow x^2 - 9 = 2^4 = 16 \\rightarrow x^2 = 25 \\rightarrow x = \\pm 5$. چون $x > 3$ است، فقط $x = 5$ قابل قبول است.',
    tags: ['لگاریتم', 'یازدهم', 'معادله']
  },
  {
    id: 'math-404',
    group: 'math',
    grade: 'twelfth',
    subject: 'حسابان و ریاضیات',
    chapter: 'فصل ۴: مشتق و کاربرد',
    topic: 'مشتق‌گیری زنجیره‌ای و خط مماس',
    difficulty: 'hard',
    source: 'talifi',
    questionText: 'معادله خط مماس بر منحنی تابع $f(x) = \\sqrt{2x^2 + 1}$ در نقطه‌ای به طول $x = 2$ کدام است؟',
    options: [
      '$y = \\frac{4}{3}x + \\frac{1}{3}$',
      '$y = \\frac{2}{3}x + \\frac{5}{3}$',
      '$y = 4x - 5$',
      '$y = \\frac{4}{3}x - 1$'
    ],
    correctOption: 1,
    explanation: 'نقطه تماس: $f(2) = \\sqrt{2(4)+1} = \\sqrt{9} = 3 \\rightarrow (2, 3)$. مشتق: $f\'(x) = \\frac{4x}{2\\sqrt{2x^2+1}} = \\frac{2x}{\\sqrt{2x^2+1}}$. شیب خط مماس: $m = f\'(2) = \\frac{2(2)}{3} = \\frac{4}{3}$. معادله خط: $y - 3 = \\frac{4}{3}(x - 2) \\rightarrow y = \\frac{4}{3}x - \\frac{8}{3} + 3 = \\frac{4}{3}x + \\frac{1}{3}$.',
    tags: ['مشتق', 'خط مماس', 'حسابان']
  },
  {
    id: 'hum-503',
    group: 'humanities',
    grade: 'tenth',
    subject: 'منطق و فلسفه',
    chapter: 'فصل ۵: اقسام استدلال',
    topic: 'استدلال تمثیلی، استقرایی و قیاسی',
    difficulty: 'medium',
    source: 'konkur_recent',
    year: 'کنکور ۱۴۰۲',
    questionText: 'استدلالی که در آن بر اساس سرایت دادن حکم یک نمونه جزئی به نمونه جزئی دیگر به دلیل وجود مشابهت ظاهری صورت می‌گیرد، چه نام دارد و چه میزان اعتبار دارد؟',
    options: [
      'استدلال تمثیلی - احتمال صدق دارد ولی یقین‌آور نیست',
      'استدلال قیاسی - کاملاً معتبر و یقین‌آور است',
      'استقراء تعمیمی - نتیجه قطعی به دست می‌دهد',
      'استنتاج بهترین تبیین - کاملاً یقینی است'
    ],
    correctOption: 1,
    explanation: 'استدلال تمثیلی (تَمثیل) سرایت دادن حکم از یک موضوع جزئی به موضوع جزئی دیگر به دلیل شباهت است. این استدلال ضعیف‌ترین نوع استدلال است و هیچ‌گاه نتیجه یقینی تولید نمی‌کند بلکه صرفاً جنبه احتمالی دارد.',
    tags: ['منطق', 'استدلال', 'انسانی']
  }
];

// --- STORAGE HELPERS ---
export const getAllBankQuestions = (): BankQuestion[] => {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY_BANK);
    if (!raw) return INITIAL_QUESTION_BANK;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_QUESTION_BANK;
  } catch (e) {
    return INITIAL_QUESTION_BANK;
  }
};

export const saveAllBankQuestions = (questions: BankQuestion[]) => {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY_BANK, JSON.stringify(questions));
  } catch (e) {
    console.error('Failed to persist bank questions', e);
  }
};

export const addCustomBankQuestion = (q: Omit<BankQuestion, 'id'>): BankQuestion => {
  const current = getAllBankQuestions();
  const newQ: BankQuestion = {
    ...q,
    id: `custom-q-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`
  };
  const updated = [newQ, ...current];
  saveAllBankQuestions(updated);
  return newQ;
};

export const addMultipleBankQuestions = (questions: Omit<BankQuestion, 'id'>[]): BankQuestion[] => {
  const current = getAllBankQuestions();
  const newQuestions: BankQuestion[] = questions.map((q, index) => ({
    ...q,
    id: `ingested-q-${Date.now()}-${index}-${Math.random().toString(36).substr(2, 5)}`
  }));
  const updated = [...newQuestions, ...current];
  saveAllBankQuestions(updated);
  return newQuestions;
};

export const deleteBankQuestion = (id: string): boolean => {
  const current = getAllBankQuestions();
  const updated = current.filter((q) => q.id !== id);
  saveAllBankQuestions(updated);
  return true;
};

export const updateBankQuestion = (updatedQuestion: BankQuestion): boolean => {
  const current = getAllBankQuestions();
  const index = current.findIndex((q) => q.id === updatedQuestion.id);
  if (index === -1) return false;
  current[index] = updatedQuestion;
  saveAllBankQuestions(current);
  return true;
};

// --- TOPIC MASTERY BREAKDOWN ENGINE ---
export const calculateTopicBreakdown = (
  questions: BankQuestion[],
  detailedResults: Array<{ number: number; isCorrect: boolean; isUnanswered: boolean; userAnswer: number | null }>
) => {
  const chapterMap: Record<
    string,
    { total: number; correct: number; wrong: number; unanswered: number; topic: string }
  > = {};

  questions.forEach((q, idx) => {
    const res = detailedResults[idx];
    const key = q.chapter;
    if (!chapterMap[key]) {
      chapterMap[key] = {
        total: 0,
        correct: 0,
        wrong: 0,
        unanswered: 0,
        topic: q.topic || q.chapter
      };
    }
    chapterMap[key].total += 1;
    if (res?.isCorrect) {
      chapterMap[key].correct += 1;
    } else if (!res?.isUnanswered) {
      chapterMap[key].wrong += 1;
    } else {
      chapterMap[key].unanswered += 1;
    }
  });

  const weaknesses: string[] = [];

  const breakdown = Object.entries(chapterMap).map(([chapter, stats]) => {
    const pct =
      stats.total > 0
        ? Math.max(0, Math.round(((stats.correct * 3 - stats.wrong) / (stats.total * 3)) * 100))
        : 0;

    let masteryLevel: 'excellent' | 'good' | 'average' | 'weak' = 'average';
    let recommendation = 'مرور و تست‌های تکمیلی توصیه می‌شود.';

    if (pct >= 75) {
      masteryLevel = 'excellent';
      recommendation = 'تسلط عالی! با تست‌های زمان‌دار و ترکیبی تسلط خود را تثبیت کنید.';
    } else if (pct >= 50) {
      masteryLevel = 'good';
      recommendation = 'تسلط خوب؛ با حل تست‌های چالشی‌تر به درصد بالای ۸۰٪ برسید.';
    } else if (pct >= 30) {
      masteryLevel = 'average';
      recommendation = 'نیاز به مرور درس‌نامه و حل تست‌های خط‌به‌خط آموزشی.';
      weaknesses.push(`مبحث ${chapter} (${pct}٪)`);
    } else {
      masteryLevel = 'weak';
      recommendation = 'نقطه ضعف بحرانی؛ پیشنهاد می‌شود درس‌نامه این مبحث بازخوانی شود.';
      weaknesses.push(`مبحث ${chapter} (ضعف شدید - ${pct}٪)`);
    }

    return {
      chapter,
      topic: stats.topic,
      total: stats.total,
      correct: stats.correct,
      wrong: stats.wrong,
      unanswered: stats.unanswered,
      percentage: pct,
      masteryLevel,
      recommendation
    };
  });

  return { breakdown, weaknesses };
};

// --- USER PROGRESS HELPERS ---
export const getAllUserProgress = (): Record<string, QuestionUserProgress> => {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY_PROGRESS);
    if (!raw) return {};
    return JSON.parse(raw) || {};
  } catch (e) {
    return {};
  }
};

export const recordQuestionAnswer = (
  questionId: string,
  isCorrect: boolean,
  chosenOption?: 1 | 2 | 3 | 4
) => {
  const progressMap = getAllUserProgress();
  const existing = progressMap[questionId] || {
    questionId,
    status: 'unsolved',
    timesCorrect: 0,
    timesWrong: 0
  };

  const updatedItem: QuestionUserProgress = {
    ...existing,
    status: isCorrect ? 'correct' : 'wrong',
    userLastAnswer: chosenOption,
    lastAttemptedAt: new Date().toISOString(),
    timesCorrect: isCorrect ? existing.timesCorrect + 1 : existing.timesCorrect,
    timesWrong: !isCorrect ? existing.timesWrong + 1 : existing.timesWrong
  };

  progressMap[questionId] = updatedItem;
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY_PROGRESS, JSON.stringify(progressMap));
  } catch (e) {
    console.error('Failed to save progress', e);
  }
};

export const toggleStarQuestion = (questionId: string): boolean => {
  const progressMap = getAllUserProgress();
  const existing = progressMap[questionId] || {
    questionId,
    status: 'unsolved',
    timesCorrect: 0,
    timesWrong: 0
  };
  const newState = !existing.isStarred;
  progressMap[questionId] = {
    ...existing,
    isStarred: newState
  };
  localStorage.setItem(LOCAL_STORAGE_KEY_PROGRESS, JSON.stringify(progressMap));
  return newState;
};

// --- GET AVAILABLE CHAPTERS & METADATA ---
export const getAvailableChaptersForSubject = (
  group: KonkurGroup,
  subject: string,
  grade?: GradeLevel | 'all'
): Array<{ chapter: string; count: number }> => {
  const all = getAllBankQuestions();
  const filtered = all.filter((q) => {
    if (q.group !== group) return false;
    if (subject && q.subject !== subject && !subject.includes(q.subject) && !q.subject.includes(subject)) return false;
    if (grade && grade !== 'all' && q.grade !== grade) return false;
    return true;
  });

  const chapterMap: Record<string, number> = {};

  // If experimental group, seed with official curriculum chapters
  if (group === 'experimental') {
    const officialChapters = getExperimentalChapters(subject, grade);
    officialChapters.forEach((chap: any) => {
      const title = typeof chap === 'string' ? chap : chap.title;
      if (title) chapterMap[title] = 0;
    });
  }

  filtered.forEach((q) => {
    chapterMap[q.chapter] = (chapterMap[q.chapter] || 0) + 1;
  });

  return Object.entries(chapterMap).map(([chapter, count]) => ({
    chapter,
    count
  }));
};

export const getAvailableTopicsForSubjectAndChapter = (
  group: KonkurGroup,
  subject: string,
  chapter?: string
): string[] => {
  if (group === 'experimental') {
    return getExperimentalTopics(subject, chapter);
  }
  const all = getAllBankQuestions().filter((q) => q.group === group && (q.subject === subject || subject.includes(q.subject)));
  const topics = all.filter((q) => !chapter || q.chapter === chapter).map((q) => q.topic);
  return Array.from(new Set(topics));
};


// --- GENERATE CUSTOM QUIZ ENGINE ---
export const generateCustomQuizFromBank = (
  config: QuizBuildConfig,
  userRole: 'student' | 'advisor' | 'admin' = 'student',
  creatorName?: string
): GeneratedQuiz => {
  const allQuestions = getAllBankQuestions();
  const progressMap = getAllUserProgress();

  // 1. Filter by Group & Subject
  let candidates = allQuestions.filter((q) => {
    if (q.group !== config.group) return false;
    if (config.subject && config.subject !== 'all' && config.subject !== 'جامع') {
      const matchSub = q.subject === config.subject || q.subject.includes(config.subject) || config.subject.includes(q.subject);
      if (!matchSub) return false;
    }
    if (config.grade && config.grade !== 'all' && q.grade !== config.grade) {
      return false;
    }
    if (config.selectedChapters.length > 0) {
      if (!config.selectedChapters.includes(q.chapter)) return false;
    }
    return true;
  });

  // 2. Filter by Difficulty
  if (config.difficulty !== 'all' && config.difficulty !== 'mixed') {
    candidates = candidates.filter((q) => q.difficulty === config.difficulty);
  }

  // 3. Filter by Source
  if (config.sourceFilter !== 'all') {
    candidates = candidates.filter((q) => q.source === config.sourceFilter);
  }

  // 4. Filter by User History (Smart filter)
  if (config.smartFilter === 'unsolved_only') {
    candidates = candidates.filter((q) => !progressMap[q.id] || progressMap[q.id].status === 'unsolved');
  } else if (config.smartFilter === 'wrong_repeats') {
    candidates = candidates.filter((q) => progressMap[q.id] && progressMap[q.id].status === 'wrong');
  } else if (config.smartFilter === 'starred_only') {
    candidates = candidates.filter((q) => progressMap[q.id]?.isStarred);
  }

  // If not enough questions match strict filters, fallback to broader candidate pool
  if (candidates.length === 0) {
    candidates = allQuestions.filter((q) => q.group === config.group);
  }

  // Shuffle candidates
  const shuffled = [...candidates].sort(() => 0.5 - Math.random());
  const selectedQuestions = shuffled.slice(0, Math.min(config.questionCount, shuffled.length));

  const quiz: GeneratedQuiz = {
    id: `quiz-gen-${Date.now()}`,
    title: config.title || `آزمون مبحثی ${config.subject} (${selectedQuestions.length} تست)`,
    group: config.group,
    subject: config.subject,
    chapters: config.selectedChapters,
    questions: selectedQuestions,
    durationMinutes: config.durationMinutes || Math.max(10, Math.ceil(selectedQuestions.length * 1.5)),
    mode: config.mode,
    createdAt: new Date().toISOString(),
    createdByRole: userRole,
    creatorName: creatorName || (userRole === 'student' ? 'دانش‌آموز' : 'مشاور / مدیر آموزشی')
  };

  return quiz;
};

// Convert GeneratedQuiz to standard ExamModel so it can be added to the Main Exams Hub!
export const convertQuizToExamModel = (quiz: GeneratedQuiz): ExamModel => {
  const keyAnswers: Record<number, number> = {};
  quiz.questions.forEach((q, idx) => {
    keyAnswers[idx + 1] = q.correctOption;
  });

  const newExam: ExamModel = {
    id: quiz.id,
    title: quiz.title,
    subtitle: `آزمون هوشمند تولیدشده از بانک سوالات (${quiz.subject} - ${quiz.questions.length} سوال)`,
    group: quiz.group,
    examType: quiz.subject === 'جامع' ? 'comprehensive' : 'subject',
    subject: quiz.subject,
    durationMinutes: quiz.durationMinutes,
    totalQuestions: quiz.questions.length,
    hasNegativeMarking: true,
    pdfUrl: '',
    pdfFileName: `${quiz.title}.pdf`,
    keyAnswers,
    subjectsBreakdown: [
      {
        name: quiz.subject,
        fromQuestion: 1,
        toQuestion: quiz.questions.length
      }
    ],
    createdAt: quiz.createdAt,
    isCustom: true
  };

  return newExam;
};

// --- AI & INTERNAL TEXT PARSING SERVICES ---

export interface ParseQuestionsOptions {
  subject?: string;
  chapter?: string;
  topic?: string;
  grade?: 'tenth' | 'eleventh' | 'twelfth' | 'comprehensive';
  group?: 'experimental' | 'math' | 'humanities' | 'art' | 'language';
  difficulty?: 'easy' | 'medium' | 'hard' | 'olympiad';
  source?: 'konkur_recent' | 'sanjesh' | 'talifi' | 'none';
  year?: string;
  forceInternalEngine?: boolean;
}

export interface ParseQuestionsResult {
  success: boolean;
  provider: string;
  engineType: 'ai_cloud' | 'native_internal';
  count: number;
  questions: Array<Omit<BankQuestion, 'id'> & { tempId?: string }>;
  message?: string;
}

export const parseQuestionsHeuristically = (
  rawText: string,
  defaults: ParseQuestionsOptions = {}
): Array<Omit<BankQuestion, 'id'>> => {
  if (!rawText || typeof rawText !== 'string') return [];
  const text = rawText.replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim();
  if (!text) return [];

  const faDigits: Record<string, number> = {
    '۱': 1, '۲': 2, '۳': 3, '۴': 4,
    '1': 1, '2': 2, '3': 3, '4': 4,
    'الف': 1, 'ب': 2, 'ج': 3, 'د': 4,
    'A': 1, 'B': 2, 'C': 3, 'D': 4,
    'a': 1, 'b': 2, 'c': 3, 'd': 4
  };

  const gradeMap: Record<string, GradeLevel> = {
    'دهم': 'tenth', '۱۰': 'tenth', '10': 'tenth', 'tenth': 'tenth',
    'یازدهم': 'eleventh', '۱۱': 'eleventh', '11': 'eleventh', 'eleventh': 'eleventh',
    'دوازدهم': 'twelfth', '۱۲': 'twelfth', '12': 'twelfth', 'twelfth': 'twelfth',
    'جامع': 'comprehensive', 'کنکور': 'comprehensive', 'comprehensive': 'comprehensive'
  };

  const groupMap: Record<string, KonkurGroup> = {
    'تجربی': 'experimental', 'علوم تجربی': 'experimental', 'experimental': 'experimental',
    'ریاضی': 'math', 'ریاضی و فیزیک': 'math', 'math': 'math', 'mathematics': 'math',
    'انسانی': 'humanities', 'علوم انسانی': 'humanities', 'humanities': 'humanities',
    'هنر': 'art', 'art': 'art',
    'زبان': 'language', 'language': 'language'
  };

  const diffMap: Record<string, 'easy' | 'medium' | 'hard' | 'expert'> = {
    'آسان': 'easy', 'ساده': 'easy', 'easy': 'easy',
    'متوسط': 'medium', 'عادی': 'medium', 'medium': 'medium',
    'سخت': 'hard', 'دشوار': 'hard', 'hard': 'hard',
    'بسیار سخت': 'expert', 'المپیاد': 'expert', 'expert': 'expert'
  };

  // 1. Direct JSON detection
  if ((text.startsWith('[') && text.endsWith(']')) || (text.startsWith('{') && text.endsWith('}'))) {
    try {
      const parsed = JSON.parse(text);
      const arr = Array.isArray(parsed) ? parsed : [parsed];
      if (arr.length > 0 && (arr[0].questionText || arr[0].question || arr[0].soal || arr[0].text)) {
        return arr.map((q: any) => {
          const qText = (q.questionText || q.question || q.soal || q.text || '').trim();
          const qOpts = Array.isArray(q.options) && q.options.length >= 4
            ? q.options.slice(0, 4).map((o: any) => String(o).trim())
            : [q.option1 || q.opt1 || 'گزینه ۱', q.option2 || q.opt2 || 'گزینه ۲', q.option3 || q.opt3 || 'گزینه ۳', q.option4 || q.opt4 || 'گزینه ۴'];
          const rawKey = q.correctOption ?? q.answer ?? q.key ?? 1;
          const numKey = typeof rawKey === 'string' ? (faDigits[rawKey] || 1) : Number(rawKey);
          const cOpt = (numKey >= 1 && numKey <= 4 ? numKey : 1) as 1 | 2 | 3 | 4;
          const exp = (q.explanation || q.solution || q.tashrihi || '').trim() || 'پاسخ تشریحی وارد نشده است.';
          const fSub = q.subject || defaults.subject || 'زیست‌شناسی';
          const fChap = q.chapter || defaults.chapter || 'فصل ۱';
          const fTop = q.topic || defaults.topic || fChap;
          const fGrd = (q.grade && gradeMap[q.grade]) || defaults.grade || 'twelfth';
          const fGrp = (q.group && groupMap[q.group]) || defaults.group || 'experimental';
          const fDiff = (q.difficulty && diffMap[q.difficulty]) || defaults.difficulty || 'medium';
          const fSrc = q.source || defaults.source || 'talifi';
          const fYr = q.year || defaults.year || '۱۴۰۳';

          return {
            subject: fSub,
            chapter: fChap,
            topic: fTop,
            grade: fGrd,
            group: fGrp,
            difficulty: fDiff,
            source: fSrc,
            year: fYr,
            questionText: qText,
            options: qOpts,
            correctOption: cOpt,
            explanation: exp,
            tags: Array.isArray(q.tags) && q.tags.length > 0 ? q.tags : [fSub, fChap]
          };
        }).filter((q) => q.questionText.length > 3);
      }
    } catch {}
  }

  // 2. Multi-strategy chunking
  let chunks: string[] = [];

  // A. Check for closed box format: [BOX_1] ... [/BOX_1] or [باکس_۱] ... [/باکس_۱]
  const boxClosedRegex = /\[(?:BOX|TEST|باکس|تست)(?:[_:\s]?[0-9۰-۹]+)?\]([\s\S]*?)\[\/(?:BOX|TEST|باکس|تست)(?:[_:\s]?[0-9۰-۹]+)?\]/gi;
  const closedMatches = [...text.matchAll(boxClosedRegex)];

  if (closedMatches.length > 0) {
    chunks = closedMatches.map((m) => m[1].trim());
  } else if (/\[(?:BOX|TEST|باکس|تست)(?:[_:\s]?[0-9۰-۹]+)?\]/i.test(text)) {
    // Open boxes without closing tags
    chunks = text.split(/\[(?:BOX|TEST|باکس|تست)(?:[_:\s]?[0-9۰-۹]+)?\]/i).map((c) => c.trim()).filter((c) => c.length > 12);
  } else if (/(?:^|\n)\s*(?:={3,}|-{3,}|_{3,})\s*(?:تست|سوال|مسئله)?\s*(?:[0-9۰-۹]+)?\s*(?:={3,}|-{3,}|_{3,})?/i.test(text)) {
    // Delimited by === تست ۱ === or --- تست ۱ ---
    chunks = text.split(/(?:^|\n)\s*(?:={3,}|-{3,}|_{3,})\s*(?:تست|سوال|مسئله)?\s*(?:[0-9۰-۹]+)?\s*(?:={3,}|-{3,}|_{3,})?/i)
      .map((c) => c.trim()).filter((c) => c.length > 12);
  } else if (/(?:^|\n)\s*(?:تست|سوال|مسئله|Question)\s*(?:[0-9۰-۹]{1,3})\s*[:.-]/i.test(text)) {
    // Delimited by explicit test label like "تست ۱:" or "سوال ۲-"
    chunks = text.split(/(?:^|\n)(?=\s*(?:تست|سوال|مسئله|Question)\s*(?:[0-9۰-۹]{1,3})\s*[:.-])/i)
      .map((c) => c.trim()).filter((c) => c.length > 12);
  } else {
    // Line-by-line state machine for natural numbered tests (e.g. "۱- ...", "1. ...")
    const lines = text.split('\n');
    const optLineRegex = /^\s*(?:گزینه\s*)?(?:\(|\[)?([1-4]|[۱-۴]|الف|ب|ج|د|[A-Da-d])(?:\)|\]|\.|-)\s+/i;
    const qLineRegex = /^\s*(?:(?:تست|سوال|مسئله|Question)\s*[0-9۰-۹]*\s*[:.-]|(?:[0-9۰-۹]{1,3})\s*[-.:]\s+)/i;

    let currentLines: string[] = [];
    let currentOptCount = 0;

    for (const line of lines) {
      const isOpt = optLineRegex.test(line);
      const isQStart = qLineRegex.test(line);

      if (isOpt) currentOptCount++;

      if (isQStart && currentOptCount >= 2 && currentLines.length > 0) {
        chunks.push(currentLines.join('\n').trim());
        currentLines = [line];
        currentOptCount = 0;
      } else {
        currentLines.push(line);
      }
    }

    if (currentLines.length > 0) {
      chunks.push(currentLines.join('\n').trim());
    }

    chunks = chunks.filter((c) => c.length > 12);
    if (chunks.length === 0) chunks = [text];
  }

  // Helper to extract tag like [TAG]...[/TAG] or [TAG: ...]
  const extractTag = (chunkText: string, tags: string[]): string | null => {
    for (const tag of tags) {
      const closePattern = new RegExp(`\\[${tag}\\]([\\s\\S]*?)\\[\\/${tag}\\]`, 'i');
      const mClose = chunkText.match(closePattern);
      if (mClose && mClose[1].trim()) return mClose[1].trim();

      const colonPattern = new RegExp(`\\[${tag}\\s*:\\s*([^\\]]+)\\]`, 'i');
      const mColon = chunkText.match(colonPattern);
      if (mColon && mColon[1].trim()) return mColon[1].trim();

      const openPattern = new RegExp(`\\[${tag}\\]([\\s\\S]*?)(?=\\[\\/?[a-zA-Z0-9_\\u0600-\\u06FF\\s]+(?:[_:\\s]?[0-9۰-۹]+)?(?::|\\])|$)`, 'i');
      const mOpen = chunkText.match(openPattern);
      if (mOpen && mOpen[1].trim()) return mOpen[1].trim();
    }
    return null;
  };

  // Helper to extract metadata (supporting pipe syntax: درس: X | فصل: Y or separate lines or brackets)
  const extractMeta = (chunkText: string, keys: string[]): string | null => {
    for (const k of keys) {
      const tagged = extractTag(chunkText, [k]);
      if (tagged) return tagged;
      const pat = new RegExp(`(?:^|[\\|\\n])\\s*${k}\\s*[:=]\\s*([^\\|\\n\\r\\]]+)`, 'i');
      const m = chunkText.match(pat);
      if (m && m[1].trim()) return m[1].trim();
    }
    return null;
  };

  return chunks.map((chunk, idx) => {
    // 1. Tag & Pipe Metadata extraction
    const taggedDars = extractMeta(chunk, ['DARS', 'درس', 'subject', 'Subject']);
    const taggedFasl = extractMeta(chunk, ['FASL', 'فصل', 'chapter', 'Chapter']);
    const taggedMabhas = extractMeta(chunk, ['MABHAS', 'مبحث', 'topic', 'Topic', 'گفتار', 'درسنامه']);
    const taggedPayeh = extractMeta(chunk, ['PAYEH', 'پایه', 'grade', 'Grade']);
    const taggedReshteh = extractMeta(chunk, ['RESHTEH', 'رشته', 'group', 'Field', 'field']);
    const taggedSakhti = extractMeta(chunk, ['SAKHTI', 'سختی', 'سطح', 'difficulty', 'Difficulty', 'level']);
    const taggedManba = extractMeta(chunk, ['MANBA', 'منبع', 'source', 'Source']);
    const taggedYear = extractMeta(chunk, ['YEAR', 'SAL', 'سال', 'year']);

    // 2. Hashtags
    const tagMatches = chunk.match(/#([\p{L}\p{N}_]+)/gu);
    const tags = tagMatches ? tagMatches.map((t) => t.replace('#', '').trim()) : [];

    // 3. Correct Option
    let correctOption: 1 | 2 | 3 | 4 = 1;
    const taggedJavab = extractTag(chunk, ['JAVAB', 'پاسخ', 'کلید', 'جواب', 'KEY', 'ANSWER', 'ANS']);
    if (taggedJavab) {
      const matchNum = taggedJavab.match(/([1-4]|[۱-۴]|الف|ب|ج|د|[A-Da-d])/);
      if (matchNum && faDigits[matchNum[1]]) {
        correctOption = faDigits[matchNum[1]] as 1 | 2 | 3 | 4;
      }
    } else {
      const ansMatch = chunk.match(/(?:پاسخ|کلید|جواب|گزینه صحیح|گزینه درست|پاسخنامه|Key|Answer)\s*(?::|=)?\s*(?:گزینه\s*)?([1-4]|[۱-۴]|الف|ب|ج|د|[A-Da-d])/i);
      if (ansMatch && ansMatch[1] && faDigits[ansMatch[1]]) {
        const val = faDigits[ansMatch[1]];
        if (val >= 1 && val <= 4) correctOption = val as 1 | 2 | 3 | 4;
      }
    }

    // 4. Explanation
    let explanation = extractTag(chunk, ['TASHRIHI', 'پاسخ_تشریحی', 'تشریحی', 'راه_حل', 'تحلیل', 'SOLUTION', 'EXPLANATION', 'EXP']);
    if (!explanation) {
      const expMatch = chunk.match(/(?:پاسخ\s*تشریحی|پاسخنامه\s*تشریحی|تشریحی|تحلیل\s*سوال|علت\s*درستی|توضیح(?:ات)?(?:\s*تشریحی)?|راه\s*حل|پاسخنامه|Explanation|Solution|تحلیل)\s*[:=]\s*([\s\S]+?)(?=(?:===|---|\[(?:DARS|FASL|MABHAS|درس|فصل)|درس:|فصل:|\n\s*#|$))/i);
      if (expMatch && expMatch[1].trim()) {
        explanation = expMatch[1].trim();
      }
    }
    if (!explanation) explanation = 'پاسخ تشریحی وارد نشده است.';

    explanation = explanation
      .replace(/\[\/?(?:TASHRIHI|پاسخ_تشریحی|تشریحی|راه_حل|تحلیل|SOLUTION|EXPLANATION|EXP)[^\]]*\]/gi, '')
      .replace(/\[(?:درس|فصل|مبحث|موضوع|پایه|رشته|سختی|سطح|منبع|سال|subject|chapter|topic|grade|group|difficulty|source|year)\s*:\s*[^\]]+\]/gi, '')
      .replace(/#([\p{L}\p{N}_]+)/gu, '')
      .trim();

    // 5. Question Text and Options
    let questionText = '';
    let options = ['گزینه ۱', 'گزینه ۲', 'گزینه ۳', 'گزینه ۴'];

    const taggedSoal = extractTag(chunk, ['SOAL', 'سوال', 'متن', 'متن_سوال', 'QUESTION', 'Q']);
    const taggedGoz1 = extractTag(chunk, ['GOZ1', 'GOZ_1', 'GOZ 1', 'گزینه_۱', 'گزینه۱', 'گزینه 1', 'OPT1']);
    const taggedGoz2 = extractTag(chunk, ['GOZ2', 'GOZ_2', 'GOZ 2', 'گزینه_۲', 'گزینه۲', 'گزینه 2', 'OPT2']);
    const taggedGoz3 = extractTag(chunk, ['GOZ3', 'GOZ_3', 'GOZ 3', 'گزینه_۳', 'گزینه۳', 'گزینه 3', 'OPT3']);
    const taggedGoz4 = extractTag(chunk, ['GOZ4', 'GOZ_4', 'GOZ 4', 'گزینه_۴', 'گزینه۴', 'گزینه 4', 'OPT4']);

    if (taggedGoz1 && taggedGoz2 && taggedGoz3 && taggedGoz4) {
      options = [taggedGoz1, taggedGoz2, taggedGoz3, taggedGoz4];
      questionText = taggedSoal || chunk.split(/\[(?:GOZ[1-4]|GOZ_[1-4]|GOZ\s+[1-4]|گزینه[_\s]?[۱-۴1-4]|OPT[1-4])/i)[0].trim();
    } else {
      // Find option positions using boundary-safe regex (avoids matching numbers inside question body)
      const optFinderRegex = /(?:^|\r?\n|[ \t]{2,})(?:گزینه\s*)?(?:\(|\[)?([1-4]|[۱-۴]|الف|ب|ج|د|[A-Da-d])(?:\)|\]|\.|-)(?:\s*[:=])?\s+/g;
      const matches: Array<{ optIdx: number; index: number }> = [];
      let m: RegExpExecArray | null;

      while ((m = optFinderRegex.exec(chunk)) !== null) {
        const char = m[1];
        const optIdx = faDigits[char];
        if (optIdx >= 1 && optIdx <= 4) {
          const wsPrefix = m[0].match(/^[ \t\r\n]*/)?.[0].length || 0;
          matches.push({
            optIdx,
            index: m.index + wsPrefix
          });
        }
      }

      // Check for sequential 1, 2, 3, 4
      let seq: Array<{ optIdx: number; index: number }> | null = null;
      for (let i = 0; i <= matches.length - 4; i++) {
        if (matches[i].optIdx === 1 && matches[i + 1].optIdx === 2 && matches[i + 2].optIdx === 3 && matches[i + 3].optIdx === 4) {
          seq = [matches[i], matches[i + 1], matches[i + 2], matches[i + 3]];
          break;
        }
      }

      if (seq) {
        questionText = chunk.slice(0, seq[0].index).trim();
        const o1Raw = chunk.slice(seq[0].index, seq[1].index);
        const o2Raw = chunk.slice(seq[1].index, seq[2].index);
        const o3Raw = chunk.slice(seq[2].index, seq[3].index);
        let o4Raw = chunk.slice(seq[3].index);

        const stopPatterns = [
          /(?:پاسخ|کلید|جواب|پاسخنامه|Key|Answer)\s*(?::|=)/i,
          /(?:پاسخ\s*تشریحی|تشریحی|تحلیل|راه\s*حل|Explanation|Solution)\s*(?::|=)/i,
          /(?:درس|فصل|مبحث|پایه|رشته|سختی|منبع|سال)\s*[:=]/i,
          /\[(?:درس|فصل|مبحث|DARS|FASL|MABHAS|JAVAB|TASHRIHI)/i,
          /#[\p{L}\p{N}_]+/u,
          /={3,}|-{3,}/
        ];

        for (const sp of stopPatterns) {
          const sm = o4Raw.search(sp);
          if (sm !== -1 && sm > 2) {
            o4Raw = o4Raw.slice(0, sm);
          }
        }

        const cleanOpt = (s: string) =>
          s
            .replace(/^\s*(?:گزینه\s*)?(?:\(|\[)?([1-4]|[۱-۴]|الف|ب|ج|د|[A-Da-d])(?:\)|\]|\.|-)(?:\s*[:=])?\s*/i, '')
            .replace(/(?:پاسخ|کلید|جواب|گزینه صحیح|گزینه درست|پاسخنامه|Key|Answer)\s*(?::|=)?\s*(?:گزینه\s*)?([1-4]|[۱-۴]|الف|ب|ج|د|[A-Da-d])[\s\S]*/i, '')
            .replace(/\[(?:درس|فصل|مبحث|موضوع|پایه|رشته|سختی|سطح|منبع|سال|subject|chapter|topic|grade|group|difficulty|source|year)\s*:\s*[^\]]+\]/gi, '')
            .replace(/#([\p{L}\p{N}_]+)/gu, '')
            .trim();

        options = [
          cleanOpt(o1Raw) || 'گزینه ۱',
          cleanOpt(o2Raw) || 'گزینه ۲',
          cleanOpt(o3Raw) || 'گزینه ۳',
          cleanOpt(o4Raw) || 'گزینه ۴'
        ];
      } else {
        const lines = chunk.split('\n').map((l) => l.trim()).filter((l) => l.length > 0);
        questionText = taggedSoal || lines[0] || chunk.slice(0, 150);
        if (lines.length >= 5) {
          options = [lines[1], lines[2], lines[3], lines[4]];
        }
      }
    }

    // Clean question text from delimiters and header tags
    questionText = questionText
      .replace(/^\s*(?:={3,}|-{3,})\s*(?:تست|سوال|مسئله)?\s*(?:[0-9۰-۹]+)?\s*(?:={3,}|-{3,})?\s*/i, '')
      .replace(/^(?:(?:سوال|تست|مسئله|Question)\s*(?:[0-9۰-۹]+)?\s*[:.-]\s*)/i, '')
      .replace(/^(?:[0-9۰-۹]{1,3})\s*[-:.)]\s*/i, '')
      .replace(/\[\/?(?:BOX|TEST|باکس|تست)(?:[_:\s]?[0-9۰-۹]+)?\]/gi, '')
      .replace(/\[\/?(?:SOAL|GOZ[1-4]|GOZ_[1-4]|GOZ\s+[1-4]|JAVAB|TASHRIHI|DARS|FASL|MABHAS|PAYEH|RESHTEH|SAKHTI|MANBA|YEAR|SAL|TAGS|سوال|متن|گزینه[_\s]?[۱-۴1-4]|پاسخ|کلید|جواب|تشریحی|پاسخ_تشریحی|درس|فصل|مبحث|پایه|رشته|سختی|سطح|منبع|سال)[^\]]*\]/gi, '')
      .replace(/\[(?:درس|فصل|مبحث|موضوع|پایه|رشته|سختی|سطح|منبع|سال|subject|chapter|topic|grade|group|difficulty|source|year)\s*:\s*[^\]]+\]/gi, '')
      .replace(/#([\p{L}\p{N}_]+)/gu, '')
      .replace(/^(?:سوال|صورت سوال|متن سوال)\s*[:=]\s*/i, '')
      .trim();

    options = options.map((opt) =>
      opt.replace(/\[\/?(?:GOZ[1-4]|GOZ_[1-4]|GOZ\s+[1-4]|گزینه[_\s]?[۱-۴1-4]|OPT[1-4])[^\]]*\]/gi, '').trim()
    );

    const finalSubject = taggedDars || defaults.subject || 'زیست‌شناسی';
    const finalChapter = taggedFasl || defaults.chapter || 'فصل ۱';
    const finalTopic = taggedMabhas || defaults.topic || finalChapter || 'مبحث استاندارد';
    const finalGrade = (taggedPayeh && gradeMap[taggedPayeh]) || defaults.grade || 'twelfth';
    const finalGroup = (taggedReshteh && groupMap[taggedReshteh]) || defaults.group || 'experimental';
    const finalDiff = (taggedSakhti && diffMap[taggedSakhti]) || defaults.difficulty || 'medium';
    const finalSource = (taggedManba as any) || defaults.source || 'talifi';
    const finalYear = taggedYear || defaults.year || '۱۴۰۳';

    return {
      subject: finalSubject,
      chapter: finalChapter,
      topic: finalTopic,
      grade: finalGrade,
      group: finalGroup,
      difficulty: finalDiff,
      source: finalSource,
      year: finalYear,
      questionText: questionText || `صورت سوال شماره ${idx + 1}`,
      options,
      correctOption,
      explanation,
      tags: tags.length > 0 ? tags : [finalSubject, finalChapter]
    };
  }).filter((q) => q.questionText && q.questionText.length > 3);
};

export const parseQuestionsWithAI = async (
  rawText: string,
  defaults: ParseQuestionsOptions = {}
): Promise<ParseQuestionsResult> => {
  try {
    const res = await fetch('/api/v1/ai/parse-questions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        rawText,
        defaultSubject: defaults.subject,
        defaultChapter: defaults.chapter,
        defaultTopic: defaults.topic,
        defaultGrade: defaults.grade,
        defaultGroup: defaults.group,
        defaultSource: defaults.source,
        defaultDifficulty: defaults.difficulty,
        forceInternalEngine: defaults.forceInternalEngine
      })
    });

    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.questions)) {
        return {
          success: true,
          provider: data.provider || 'Gemini 3.8 Flash AI Engine',
          engineType: data.engineType || 'ai_cloud',
          count: data.questions.length,
          questions: data.questions,
          message: data.message
        };
      }
    }
  } catch (err) {
    console.warn('[AIQuestionParseClient] Fallback to client-side heuristic parser:', err);
  }

  // Client-side instant fallback
  const localQuestions = parseQuestionsHeuristically(rawText, defaults);
  return {
    success: true,
    provider: 'موتور پارسر الگوریتمی داخلی (Fast Local Engine)',
    engineType: 'native_internal',
    count: localQuestions.length,
    questions: localQuestions.map((q, i) => ({
      ...q,
      tempId: `local-parsed-${Date.now()}-${i}`
    })),
    message: `تعداد ${localQuestions.length} سوال با موتور پردازشگر داخلی استخراج گردید.`
  };
};



export const getCustomSubjectPrompt = (
  subject: string = 'زیست‌شناسی',
  chapter?: string,
  topic?: string,
  grade?: string,
  extraParams?: {
    field?: string;
    chapters?: string[];
    lessons?: string[];
  }
): string => {
  const chapters = extraParams?.chapters || (chapter ? [chapter] : undefined);
  const lessons = extraParams?.lessons || (topic ? [topic] : undefined);

  try {
    return buildQuestionExtractionPrompt({
      subject,
      grade,
      field: extraParams?.field,
      chapters,
      lessons
    });
  } catch (err: any) {
    // Fallback if custom scope failed validation
    console.warn('Fallback in getCustomSubjectPrompt:', err.message);
    return buildQuestionExtractionPrompt({ subject });
  }
};

export const STANDARD_AI_PROMPT_FOR_PDF = getCustomSubjectPrompt('زیست‌شناسی');

export const SAMPLE_RAW_QUESTIONS_TEXT = `[BOX_1]
[SOAL]
در ساختار یک مولکول دنای دو رشته‌ای خطی با ۳۰۰ پیوند هیدروژنی و ۱۰۰ نوکلئوتید گوانین‌دار، تعداد کل پیوندهای فسفودی‌استر چقدر است؟
[/SOAL]
[GOZ1] ۲۹۸ پیوند فسفودی‌استر [/GOZ1]
[GOZ2] ۲۴۸ پیوند فسفودی‌استر [/GOZ2]
[GOZ3] ۱۹۸ پیوند فسفودی‌استر [/GOZ3]
[GOZ4] ۳۴۸ پیوند فسفودی‌استر [/GOZ4]
[JAVAB] 2 [/JAVAB]
[TASHRIHI]
تعداد نوکلئوتیدهای G برابر ۱۰۰ است، پس بین G و C تعداد ۳۰۰ = ۱۰۰ × ۳ پیوند سه‌گانه هیدروژنی داریم. تعداد پیوندهای فسفودی‌استر در دنای خطی برابر 2n - 2 = (۲ × ۱۲۵) - ۲ = ۲۴۸ می‌باشد.
[/TASHRIHI]
[DARS] زیست‌شناسی [/DARS]
[FASL] فصل ۱ [/FASL]
[MABHAS] مولکول‌های اطلاعاتی [/MABHAS]
[PAYEH] دوازدهم [/PAYEH]
[RESHTEH] تجربی [/RESHTEH]
[SAKHTI] متوسط [/SAKHTI]
[MANBA] کنکور ۱۴۰۳ [/MANBA]
#ژنتیک #دنا #کنکور۱۴۰۳
[/BOX_1]

[BOX_2]
[SOAL]
شتاب گرانش در سطح ماه تقریباً چقدر است؟
[/SOAL]
[GOZ1] ۹.۸ متر بر مجذور ثانیه [/GOZ1]
[GOZ2] ۱.۶ متر بر مجذور ثانیه [/GOZ2]
[GOZ3] ۳.۷ متر بر مجذور ثانیه [/GOZ3]
[GOZ4] ۱۱.۲ متر بر مجذور ثانیه [/GOZ4]
[JAVAB] 2 [/JAVAB]
[TASHRIHI]
شتاب گرانش در نزدیکی سطح ماه تقریباً یک‌ششم شتاب گرانش زمین بوده و برابر ۱.۶ متر بر مجذور ثانیه است.
[/TASHRIHI]
[DARS] فیزیک [/DARS]
[FASL] فصل ۲ [/FASL]
[MABHAS] دینامیک و گرانش [/MABHAS]
[PAYEH] دوازدهم [/PAYEH]
[RESHTEH] ریاضی [/RESHTEH]
[SAKHTI] آسان [/SAKHTI]
[MANBA] تالیفی [/MANBA]
#فیزیک_دوازدهم #گرانش
[/BOX_2]
`;

// ==========================================
// Question Reporting Service
// ==========================================
export const LOCAL_STORAGE_KEY_REPORTS = 'caffeine_reported_questions_v1';

export const getQuestionReportsFromStorage = (): QuestionReport[] => {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY_REPORTS);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error('Failed to load question reports from localStorage', e);
    return [];
  }
};

export const saveQuestionReportsToStorage = (reports: QuestionReport[]) => {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY_REPORTS, JSON.stringify(reports));
  } catch (e) {
    console.error('Failed to persist question reports to localStorage', e);
  }
};

export const submitQuestionReport = async (data: {
  questionId: string;
  studentName?: string;
  studentId?: string;
  reason: QuestionReportReason;
  reasonLabel: string;
  description: string;
  questionSnapshot?: Partial<BankQuestion>;
}): Promise<QuestionReport> => {
  const newReport: QuestionReport = {
    id: `qrep-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    questionId: data.questionId,
    studentId: data.studentId || 'std-current',
    studentName: data.studentName || 'دانش‌آموز',
    reason: data.reason,
    reasonLabel: data.reasonLabel,
    description: data.description.trim(),
    status: 'pending',
    reportedAt: new Date().toISOString(),
    questionSnapshot: data.questionSnapshot
  };

  // 1. Save to localStorage immediately
  const existingReports = getQuestionReportsFromStorage();
  const updatedReports = [newReport, ...existingReports];
  saveQuestionReportsToStorage(updatedReports);

  // 2. Synchronize with backend API in background
  try {
    const res = await fetch('/api/v1/exams/questions/report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (res.ok) {
      const json = await res.json();
      if (json.report) {
        return json.report;
      }
    }
  } catch (err) {
    console.warn('Backend question report sync failed, persisted locally:', err);
  }

  return newReport;
};

export const updateQuestionReportStatus = async (
  reportId: string,
  status: 'pending' | 'resolved' | 'dismissed',
  adminNote?: string
): Promise<boolean> => {
  const reports = getQuestionReportsFromStorage();
  const idx = reports.findIndex(r => r.id === reportId);
  if (idx !== -1) {
    reports[idx] = {
      ...reports[idx],
      status,
      adminNote: adminNote !== undefined ? adminNote : reports[idx].adminNote,
      resolvedAt: status === 'resolved' ? new Date().toISOString() : reports[idx].resolvedAt,
      resolvedBy: 'مدیر سیستم'
    };
    saveQuestionReportsToStorage(reports);
  }

  try {
    await fetch(`/api/v1/exams/questions/reports/${reportId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, adminNote })
    });
    return true;
  } catch (err) {
    console.warn('Failed to sync report update to backend:', err);
    return idx !== -1;
  }
};

export const editQuestionAndResolveReport = async (
  question: BankQuestion,
  resolveReportId?: string
): Promise<boolean> => {
  // 1. Update in local question bank
  const allQuestions = getAllBankQuestions();
  const qIdx = allQuestions.findIndex(q => q.id === question.id);
  if (qIdx !== -1) {
    allQuestions[qIdx] = question;
    saveAllBankQuestions(allQuestions);
  }

  // 2. If reportId is passed, mark report as resolved
  if (resolveReportId) {
    await updateQuestionReportStatus(resolveReportId, 'resolved', 'تست توسط مدیر ویرایش و اصلاح شد.');
  }

  // 3. Sync to backend API
  try {
    await fetch(`/api/v1/exams/questions/${question.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...question, resolveReportId })
    });
    return true;
  } catch (err) {
    console.warn('Failed to sync question edit to backend:', err);
    return qIdx !== -1;
  }
};

