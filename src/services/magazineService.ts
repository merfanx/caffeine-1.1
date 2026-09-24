import { CMSArticle } from '../types.js';

export const INITIAL_ARTICLES: CMSArticle[] = [
  {
    id: 'art-01',
    title: 'تکنیک‌های مدیریت زمان در آزمون‌های آزمایشی و کنکور سراسری',
    slug: 'time-management-konkur',
    category: 'strategy',
    author: 'دکتر علیرضا کاظمی',
    authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    publishedDate: '۱۴۰۳/۰۶/۱۵',
    date: '۱۴۰۳/۰۶/۱۵',
    readTimeMinutes: 7,
    summary: 'استراتژی‌های کاربردی زمان‌بندی ضربدر منها، زمان‌های نقصانی و استراتژی بازگشت در دفترچه‌های کنکور سراسری.',
    content: `# تکنیک‌های مدیریت زمان در آزمون‌های آزمایشی\n\nمدیریت زمان یکی از کلیدی‌ترین مهارت‌های داوطلبان موفق کنکور سراسری است...`,
    tags: ['مدیریت زمان', 'استراتژی آزمون', 'کنکور ۱۴۰۴'],
    likesCount: 142,
    viewsCount: 1850,
    isFeatured: true
  },
  {
    id: 'art-02',
    title: 'راهنمای تحلیل کارنامه آزمون‌های آزمایشی قلم‌چی، ماز و سنجش',
    slug: 'exam-analysis-guide',
    category: 'analysis',
    author: 'مهندس رادمنش',
    authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
    publishedDate: '۱۴۰۳/۰۶/۲۰',
    date: '۱۴۰۳/۰۶/۲۰',
    readTimeMinutes: 10,
    summary: 'چگونه تحلیل آزمون را در همان عصر جمعه به یک گنجینه یادگیری تبدیل کنیم و اشتباهات محاسباتی را به صفر برسانیم.',
    content: `# راهنمای جامع تحلیل آزمون\n\nتحلیل آزمون اگر مهم‌تر از خود آزمون دادن نباشد، کمتر از آن نیست...`,
    tags: ['تحلیل آزمون', 'رفع اشکال', 'تراز'],
    likesCount: 98,
    viewsCount: 1240,
    isFeatured: true
  }
];

export const magazineService = {
  getArticles(): CMSArticle[] {
    return INITIAL_ARTICLES;
  }
};
