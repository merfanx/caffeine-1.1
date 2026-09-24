import { KonkurGroup } from '../types';

export interface SubjectBreakdown {
  name: string;
  fromQuestion: number;
  toQuestion: number;
}

export interface ExamModel {
  id: string;
  title: string;
  subtitle?: string;
  group: KonkurGroup;
  examType: 'comprehensive' | 'subject' | 'custom';
  subject?: string;
  durationMinutes: number;
  totalQuestions: number;
  hasNegativeMarking: boolean;
  pdfFileName?: string;
  pdfUrl?: string;
  keyAnswers: Record<number, number>; // 1..4
  subjectsBreakdown: SubjectBreakdown[];
  createdAt: string;
  isCustom?: boolean;
}

export interface DetailedQuestionResult {
  number: number;
  subject?: string;
  subjectName?: string;
  correctAnswer: number;
  userAnswer: number | null;
  isCorrect: boolean;
  isWrong?: boolean;
  isUnanswered: boolean;
  flag?: 'doubt' | 'time_consuming' | 'crossed' | any;
  topic?: string;
  trapType?: string;
}

export interface SubjectExamResult {
  name?: string;
  subjectName?: string;
  total?: number;
  totalQuestions?: number;
  correct?: number;
  correctCount?: number;
  wrong?: number;
  wrongCount?: number;
  unanswered?: number;
  unansweredCount?: number;
  blankCount?: number;
  percentage: number;
  rawPercentageWithoutNegative?: number;
  percentageWithoutNegativeMark?: number;
  estimatedTaraz?: number;
  estimatedPercentile?: number;
}

export interface TopicBreakdownItem {
  topic: string;
  subject: string;
  total: number;
  correct: number;
  wrong: number;
  unanswered: number;
  percentage: number;
  status: 'mastered' | 'acceptable' | 'critical_weakness';
}

export interface TestTrapItem {
  trapType: 'calculation' | 'concept' | 'misreading' | 'time_pressure' | 'doubt';
  title: string;
  count: number;
  impactPercentageLoss: number;
  description: string;
  recommendation: string;
}

export interface RemedialPlanItem {
  subject: string;
  topic: string;
  priority: 'high' | 'urgent' | 'medium';
  recommendedResource: string;
  recommendedTestCount: number;
  daysToTarget: number;
  actionableStep: string;
}

export interface EnhancedAnalyticsResult {
  topicBreakdown: TopicBreakdownItem[];
  weaknessesSummary: string[];
  testTrapAnalysis: TestTrapItem[];
  remedialPlan: RemedialPlanItem[];
}

export interface StudentExamSession {
  examId: string;
  studentId?: string;
  studentName?: string;
  group: KonkurGroup;
  answers: Record<number, any>;
  questionTimes?: Record<number, number>;
  questionFlags?: Record<number, any>;
  startedAt: string;
  completedAt?: string;
  durationSecondsUsed: number;
  isFinished: boolean;
}

export interface ExamAnalysisResult {
  id: string;
  studentId: string;
  studentName: string;
  studentGroup: KonkurGroup;
  studentPhone?: string;
  examId: string;
  examTitle: string;
  completedAt: string;
  totalQuestions: number;
  totalCorrect: number;
  totalWrong: number;
  totalUnanswered: number;
  overallPercentage: number;
  timeSpentSeconds: number;
  subjectsResults: SubjectExamResult[];
  topicBreakdown?: TopicBreakdownItem[];
  weaknessesSummary?: string[];
  testTrapAnalysis?: TestTrapItem[];
  remedialPlan?: RemedialPlanItem[];
  detailedQuestions: DetailedQuestionResult[];
}
