export type KonkurGroup = 'experimental' | 'math' | 'humanities' | 'art' | 'language';
export type UserRole = 'student' | 'advisor' | 'admin' | 'parent' | 'guest';

export interface UserSession {
  id: string;
  name: string;
  role: UserRole;
  phone?: string;
  avatar?: string;
  group?: KonkurGroup;
  advisorId?: string;
  studentId?: string;
  token?: string;
}

export interface University {
  id: string;
  name: string;
  slug: string;
  city: string;
  type: any;
  ranking: number;
  establishedYear: number;
  studentPopulation: number;
  hasDormitory: boolean;
  satisfactionScore: number;
  popularMajors: string[];
  description: string;
  image: string;
  admissionAverageRank?: Record<string, string>;
}

export interface Major {
  id: string;
  title: string;
  slug?: string;
  group: KonkurGroup;
  category?: string;
  degreeType?: string;
  durationYears: number;
  jobMarketRating?: number;
  migrationRating?: number;
  difficultyRating?: number;
  description: string;
  requiredSubRanks?: Record<string, string>;
  careerOpportunities?: string[];
  careerProspects?: string[] | string;
  approxMonthlyIncomeMinMillion?: number;
  approxMonthlyIncomeMaxMillion?: number;
  topUniversities?: string[];
  minRankRegion1?: number;
  minRankRegion2?: number;
  minRankRegion3?: number;
  keySkills?: string[];
}

export interface AdmissionRecord {
  id: string;
  year: number;
  group: KonkurGroup;
  quota?: any;
  rankInQuota?: number;
  rankCountry?: number;
  taraz?: number;
  admittedUniversity?: string;
  admittedMajor?: string;
  courseType?: any;
  gender?: string;
  gpa: number;
  majorTitle?: string;
  universityName?: string;
  rankInRegion?: number;
  region?: any;
  rankNational?: number;
}

export interface Advisor {
  id: string;
  name: string;
  title: string;
  avatar: string;
  specialty?: string;
  specialtyGroup?: KonkurGroup[];
  specialties?: string[];
  group?: any;
  rating?: number;
  experienceYears?: number;
  satisfactionScore?: number;
  activeStudentsCount: number;
  studentCount?: number;
  capacity?: number;
  acceptanceRate?: number | string;
  hourlyRate?: number;
  isAvailable?: boolean;
  totalAlumniCount?: number;
  bio?: string;
  education?: string;
  achievements?: string[];
  contactPhone?: string;
  phone?: string;
  rankInKonkur?: string;
}

export interface StudentProfile {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  avatar?: string;
  group: KonkurGroup;
  gradeLevel?: any;
  grade?: any;
  healthScore?: number;
  healthStatus?: string;
  targetUniversity?: string;
  targetMajor?: string;
  targetTaraz?: number;
  currentAverageTaraz?: number;
  averageStudyHoursPerDay?: number;
  advisorId?: string;
  advisorName?: string;
  parentPhone?: string;
  parentName?: string;
  status?: any;
  enrolledDate?: string;
  dailyStreak?: number;
  weeklyGoalHours?: number;
  weeklyTargetHours?: number;
  weeklyTargetTests?: number;
  completedHoursThisWeek?: number;
  completedTestsThisWeek?: number;
  planAdherenceRate?: number;
  studyConsistencyRate?: number;
  lastExamScore?: number;
  examTrend?: string;
  weakTopics?: any[];
  notesCount?: number;
  unreadAdvisorMessages?: number;
  totalStudyHours?: number;
  totalTestsSolved?: number;
}

export interface StudySessionItem {
  id: string;
  subject: string;
  topic: string;
  durationMinutes: number;
  testCount: number;
  correctTestCount: number;
  wrongTestCount: number;
  sessionType: any;
  qualityScore: any;
}

export interface DailyReport {
  id: string;
  studentId: string;
  date: string;
  jalaliDate?: string;
  studySessions?: StudySessionItem[];
  sessions?: any;
  totalStudyMinutes: number;
  totalTests: number;
  totalCorrectTests?: number;
  totalCorrect?: number;
  totalWrongTests?: number;
  totalWrong?: number;
  sleepHours?: number;
  wakeUpTime?: string;
  bedTime?: string;
  moodRating?: any;
  mood?: any;
  energyLevel?: any;
  screenTimeMinutes?: number;
  studentNotes?: string;
  studentNote?: string;
  advisorFeedback?: any;
  adherencePercentage?: number;
  advisorReviewed?: boolean;
  aiDiagnostic?: any;
  submittedAt?: string;
}

export interface ExamResult {
  id: string;
  studentId: string;
  studentName?: string;
  examInstitute?: any;
  examTitle?: string;
  examDate?: string;
  date?: string;
  jalaliDate?: string;
  group?: KonkurGroup;
  overallTaraz?: number;
  overallScore?: number;
  overallRankQuota?: number;
  overallRankCountry?: number;
  estimatedRank?: number | string;
  subjectsPercentages?: Record<string, number>;
  subjects?: any;
  analysisSummary?: string;
  recommendations?: string[];
  reportCardPdfUrl?: string;
  aiAnalysis?: any;
}

export interface Lead {
  id: string;
  fullName: string;
  phone: string;
  group?: any;
  major?: string;
  gradeLevel?: string;
  grade?: string;
  goalUniversity?: string;
  goalMajor?: string;
  landingPage?: string;
  score?: number;
  city?: string;
  source: string;
  status: any;
  notes?: any;
  contactAttempts?: number;
  registeredAt?: string;
  createdAt?: string;
  assignedAdvisorId?: string;
  assignedAdvisorName?: string;
}

export interface CMSArticle {
  id: string;
  title: string;
  slug: string;
  category: any;
  author: string;
  authorAvatar?: string;
  publishedDate?: string;
  date?: string;
  readTimeMinutes: number;
  summary: string;
  content: string;
  coverImage?: string;
  tags: string[];
  likesCount?: number;
  viewsCount?: number;
  views?: number;
  targetToolSlug?: string;
  isFeatured?: boolean;
}

export interface StudentComment {
  id: string;
  authorName: string;
  authorRole?: any;
  authorAvatar?: string;
  avatarUrl?: string;
  konkurRank?: string;
  admittedMajor?: string;
  targetMajor?: string;
  admittedUniversity?: string;
  rating: number;
  text?: string;
  commentText?: string;
  date?: string;
  createdAt?: string;
  isVerified?: boolean;
  isVerifiedStudent?: boolean;
  advisorName?: string;
  studentId?: string;
  group?: string;
  grade?: string;
  city?: string;
  videoUrl?: string;
  videoThumbnail?: string;
  videoTitle?: string;
  videoDuration?: string;
  status?: any;
  isPinned?: boolean;
  likesCount?: number;
  keyHighlight?: string;
  adminReply?: any;
}

export interface FeatureFlag {
  id: string;
  key: string;
  name: string;
  description: string;
  isEnabled: boolean;
  category: any;
}

export interface AILogEntry {
  id: string;
  service?: string;
  promptSnippet?: string;
  responseSnippet?: string;
  durationMs?: number;
  latencyMs?: number;
  costTomans?: number;
  status: 'success' | 'failed';
  tokensUsed?: number;
  timestamp: string;
  agentName?: string;
  model?: string;
  task?: string;
  toolsCalled?: string[];
}

export interface AtRiskStudentInsight {
  studentId: string;
  studentName: string;
  avatar?: string;
  group?: any;
  riskFactor?: any;
  riskLevel?: any;
  droppedMetric?: string;
  primaryIssue?: string;
  healthScore?: number;
  severity?: any;
  details?: string;
  recommendedAction?: string;
  aiSuggestedIntervention?: string;
  lastReportDate?: string;
  lastContactDaysAgo?: number;
}

export interface DailyTrendPoint {
  date: string;
  dayName: string;
  studyHours: number;
  testsCount?: number;
  testCount?: number;
  focusScore: number;
  dayStatus?: string;
}

export interface WeeklyAverageMetric {
  weekNumber?: number;
  weekTitle?: string;
  weekLabel?: string;
  avgDailyHours?: number;
  avgStudyHours?: number;
  totalStudyHours?: number;
  totalTests: number;
  completionRate?: number;
  targetStudyHours?: number;
  testsSolved?: number;
  avgTestsCount?: number;
}

export interface SleepCircadianAnalytics {
  avgSleepHours: number;
  avgBedTime: string;
  avgWakeTime: string;
  sleepQualityScore: number;
  optimalSleepDaysCount: number;
  circadianCorrelation: {
    earlyWakeEfficiencyBoost: number; // e.g. +24.2%
    sleepUnder6HoursImpact: number; // e.g. -18.5%
    insightSummary: string;
    correlationLevel: 'strong_positive' | 'moderate' | 'neutral';
    earlyWakeGroup: { daysCount: number; avgTests: number; accuracy: number };
    lateWakeGroup: { daysCount: number; avgTests: number; accuracy: number };
  };
  weeklySleepTrend: {
    weekNumber: number;
    weekTitle: string;
    avgSleepHours: number;
    avgWakeTime: string;
    efficiencyRatio: number;
  }[];
}

export interface SpecialChecklistFocusAnalytics {
  averageFocusScore: number;
  growthRatePercentage: number;
  completedChecklistsCount: number;
  totalPrescribedDays: number;
  activePrescriptions: string[];
  mentalStabilityIndex: number;
  topMasteredHabits: {
    habitTitle: string;
    category: string;
    complianceRate: number;
  }[];
  growthAreas: {
    habitTitle: string;
    category: string;
    complianceRate: number;
    advisorRecommendation: string;
  }[];
  aiFocusVerdict: string;
}

export interface NeglectedTopicInfo {
  topicTitle: string;
  subject: string;
  actualHours: number;
  recommendedHours: number;
  actualTests: number;
  recommendedTests: number;
  deficitPercentage: number;
  riskLevel: 'high' | 'medium' | 'low';
  consequenceWarning: string;
  remedyActionPlan: string;
}

export interface SubjectBalanceRadarData {
  radarData: {
    subject: string;
    actualHours: number;
    targetHours: number;
    sharePercentage: number;
    recommendedShare: number;
    testsCount: number;
    accuracyPercentage: number;
    fullMark: number;
  }[];
  balanceScore: number; // 0 - 100
  balanceStatus: 'balanced' | 'moderately_skewed' | 'severe_imbalance';
  balanceVerdict: string;
  neglectedTopics: NeglectedTopicInfo[];
}

export interface MonthlyReportCardData {
  id?: string;
  advisorId?: string;
  advisorName?: string;
  academicYear?: string;
  startDate?: string;
  endDate?: string;
  maxStudyHoursInDay?: number;
  maxTestsInDay?: number;
  absentOrZeroDaysCount?: number;
  totalStudyHoursMonth?: number;
  totalTestsMonth?: number;
  avgDailyTests?: number;
  grade?: string;
  group?: any;
  status?: any;
  publishedAt?: string;
  createdAt?: string;
  monthName: string;
  year: number;
  studentId: string;
  studentName: string;
  totalMonthlyStudyHours?: number;
  avgDailyStudyHours?: number;
  totalMonthlyTests?: number;
  testsAccuracyPercentage?: number;
  streakDays?: number;
  dailyTrends?: DailyTrendPoint[];
  dailyTrend?: any;
  weeklyAverages?: WeeklyAverageMetric[];
  topMasteredSubjects?: { subject: string; hours: number; percentage: number }[];
  weaknessAreas?: { subject: string; reason: string; advice: string }[];
  trioScores?: any;
  subjectBreakdown?: any;
  advisorNotes?: any;
  sleepAnalytics?: SleepCircadianAnalytics;
  specialChecklistAnalytics?: SpecialChecklistFocusAnalytics;
  subjectBalanceRadar?: SubjectBalanceRadarData;
  advisorMonthlyVerdict?: {
    advisorName: string;
    grade: any;
    summary: string;
    keyDirectivesForNextMonth: string[];
  };
}


export interface TargetPlanComparison {
  plannedTotalHours: number;
  actualTotalHours: number;
  deltaHours: string;
  plannedTotalTests: number;
  actualTotalTests: number;
  deltaTests: string;
  adherenceRate: number;
  subjectsComparison: {
    subject: string;
    plannedHours: number;
    actualHours: number;
    plannedTests: number;
    actualTests: number;
    delta: string;
    status: "ahead" | "behind" | "match";
  }[];
}

export interface ChronoTimelineItem {
  timeSlot: string;
  type: "study" | "sleep" | "rest" | "routine" | "time_leak" | "review" | "lunch_rest" | "wind_down";
  label: string;
  color: string;
  duration: string;
}

export interface RemedialTaskAttachment {
  id: string;
  title: string;
  subject: string;
  questionsCount: number;
  durationMin: number;
  difficulty: string;
}

export interface StudentJournalReflection {
  studentGeneralNote: string;
  mostImportantLearned: string;
  challengesAndObstacles: string;
  proudAchievement: string;
  biggestDistraction: string;
  questionForAdvisor?: string;
}
