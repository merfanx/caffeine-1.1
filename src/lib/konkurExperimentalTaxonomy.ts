import { SUBJECT_TAXONOMIES, SubjectTaxonomy, ChapterTaxonomy, getSubjectTaxonomy } from './subjectTaxonomies.js';

export const EXPERIMENTAL_SUBJECTS = ['زیست‌شناسی', 'شیمی', 'فیزیک', 'ریاضیات', 'زمین‌شناسی'];

export const EXPERIMENTAL_TAXONOMY = SUBJECT_TAXONOMIES;

export function getTaxonomyMap(): Record<string, SubjectTaxonomy> {
  const map: Record<string, SubjectTaxonomy> = {};
  SUBJECT_TAXONOMIES.forEach((s) => {
    map[s.name] = s;
    map[s.id] = s;
  });
  return map;
}

export function getChaptersForSubject(subject: string, grade?: string): ChapterTaxonomy[] {
  const tax = getSubjectTaxonomy(subject);
  if (!tax) return [];
  const chapters: ChapterTaxonomy[] = [];
  tax.grades.forEach((g) => {
    if (!grade || g.grade === grade || g.gradeTitle.includes(grade)) {
      chapters.push(...g.chapters);
    }
  });
  return chapters;
}

export function getExperimentalChapters(subject: string, grade?: string): string[] {
  const chapters = getChaptersForSubject(subject, grade);
  return chapters.map((c) => c.title);
}

export function getExperimentalTopics(subject: string, chapterTitle?: string): string[] {
  const tax = getSubjectTaxonomy(subject);
  if (!tax) return [];
  const topics: string[] = [];
  tax.grades.forEach((g) => {
    g.chapters.forEach((c) => {
      if (!chapterTitle || c.title === chapterTitle || c.title.includes(chapterTitle)) {
        topics.push(...c.lessons);
      }
    });
  });
  return topics;
}

export function getSubjectAIPrompt(subject: string): string {
  const tax = getSubjectTaxonomy(subject);
  if (!tax) return `تولید سوالات استاندارد آزمون سراسری برای درس ${subject}`;
  return `تولید سوالات استاندارد چهارگزینه‌ای کنکور سراسری با تطابق ۱۰۰٪ با سرفصل‌های رسمی درس ${tax.name} بر پایه بودجه‌بندی رسمی سازمان سنجش آموزش کشور.`;
}
