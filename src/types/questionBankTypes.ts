import { KonkurGroup } from '../types';

export type GradeLevel = 'tenth' | 'eleventh' | 'twelfth' | 'comprehensive' | 'all';
export type QuestionDifficulty = 'easy' | 'medium' | 'hard' | 'olympiad' | 'mixed' | string;

export interface BankQuestion {
  id: string;
  group: KonkurGroup;
  grade: GradeLevel;
  subject: string;
  chapter: string;
  topic: string;
  difficulty: QuestionDifficulty;
  source: string;
  year?: string;
  questionText: string;
  options: string[];
  correctOption: 1 | 2 | 3 | 4 | number;
  solutionText?: string;
  explanation?: string;
  mathExpressionFormula?: string;
  trapType?: string;
  tags?: string[];
  imageUrl?: string;
  imageCaption?: string;
  explanationImageUrl?: string;
  explanationImageCaption?: string;
  createdAt?: string;
}

export interface QuizBuildConfig {
  title: string;
  group: KonkurGroup;
  subject: string;
  grade?: GradeLevel | string;
  chapters?: string[];
  selectedChapters?: string[];
  topics?: string[];
  difficulty?: QuestionDifficulty;
  sourceFilter?: string;
  smartFilter?: string;
  questionCount: number;
  durationMinutes: number;
  hasNegativeMarking: boolean;
  mode?: string;
}

export interface GeneratedQuiz {
  id: string;
  title: string;
  subject: string;
  group: KonkurGroup;
  durationMinutes: number;
  config?: QuizBuildConfig;
  questions: BankQuestion[];
  chapters?: string[];
  mode?: string;
  createdByRole?: string;
  creatorName?: string;
  createdAt: string;
}

export interface QuestionUserProgress {
  questionId: string;
  status?: string;
  userLastAnswer?: 1 | 2 | 3 | 4;
  lastAttemptedAt?: string;
  timesCorrect?: number;
  timesWrong?: number;
  isStarred?: boolean;
  timesAnswered?: number;
  correctAnswersCount?: number;
  wrongAnswersCount?: number;
  isBookmarked?: boolean;
  notes?: string;
  lastAnsweredAt?: string;
}

export type QuestionReportReason =
  | 'text_error'
  | 'options_error'
  | 'wrong_answer_key'
  | 'explanation_error'
  | 'typo_error'
  | 'other';

export interface QuestionReport {
  id: string;
  questionId: string;
  studentId?: string;
  studentName: string;
  reason: QuestionReportReason;
  reasonLabel: string;
  description: string;
  status: 'pending' | 'resolved' | 'dismissed';
  reportedAt: string;
  adminNote?: string;
  resolvedAt?: string;
  resolvedBy?: string;
  questionSnapshot?: Partial<BankQuestion>;
  attachmentImageUrl?: string;
  attachmentImageName?: string;
  attachmentImageSize?: number;
}

