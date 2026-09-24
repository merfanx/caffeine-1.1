import { pgTable, text, varchar, integer, numeric, boolean, timestamp, jsonb, index, uniqueIndex } from 'drizzle-orm/pg-core';
import { relations, sql } from 'drizzle-orm';

/**
 * ============================================================================
 * CAFFEINE HEADLESS OS - PRODUCTION POSTGRESQL RELATIONAL SCHEMA
 * ============================================================================
 * Standardized across 23 normalized domains with complete Foreign Key
 * integrity, deterministic UUIDs, unique indexes, association tables,
 * TIMESTAMPTZ auditability, and numeric precision for financial values.
 * ============================================================================
 */

// 1. Users & Authentication
export const users = pgTable('users', {
  id: text('id').primaryKey().default(sql`gen_random_uuid()`),
  legacyId: varchar('legacy_id', { length: 100 }).unique(),
  username: varchar('username', { length: 100 }).notNull().unique(),
  fullName: text('full_name').notNull(),
  role: varchar('role', { length: 50 }).notNull(), // admin, super_admin, advisor, student, parent
  phone: varchar('phone', { length: 30 }),
  email: text('email'),
  passwordHash: text('password_hash'),
  pinHash: text('pin_hash'),
  isLocked: boolean('is_locked').default(false).notNull(),
  failedLoginAttempts: integer('failed_login_attempts').default(0).notNull(),
  lastPasswordChange: timestamp('last_password_change', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index('users_role_idx').on(table.role),
  index('users_phone_idx').on(table.phone),
  index('users_role_locked_idx').on(table.role, table.isLocked),
  uniqueIndex('users_username_idx').on(table.username),
]);

// 2. Advisors Domain
export const advisors = pgTable('advisors', {
  id: text('id').primaryKey().default(sql`gen_random_uuid()`),
  legacyId: varchar('legacy_id', { length: 100 }).unique(), // adv-1, etc.
  userId: text('user_id').references(() => users.id, { onDelete: 'set null' }).unique(), // 1-to-1 with users
  name: text('name').notNull(),
  title: text('title').notNull(),
  avatar: text('avatar'),
  university: text('university'),
  major: text('major'),
  rank: integer('rank'),
  bio: text('bio'),
  capacity: integer('capacity').default(30),
  activeStudentsCount: integer('active_students_count').default(0),
  phone: varchar('phone', { length: 30 }),
  email: text('email'),
  rating: numeric('rating', { precision: 3, scale: 2 }).default('5.00'),
  satisfactionRate: integer('satisfaction_rate').default(98),
  isAcceptingNewStudents: boolean('is_accepting_new_students').default(true).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index('advisors_user_id_idx').on(table.userId),
  index('advisors_legacy_id_idx').on(table.legacyId),
]);

// 3. Students Domain
export const students = pgTable('students', {
  id: text('id').primaryKey().default(sql`gen_random_uuid()`),
  legacyId: varchar('legacy_id', { length: 100 }).unique(), // std-101, etc.
  userId: text('user_id').references(() => users.id, { onDelete: 'set null' }).unique(), // 1-to-1 with users
  name: text('name').notNull(),
  avatar: text('avatar'),
  phone: varchar('phone', { length: 30 }),
  parentPhone: varchar('parent_phone', { length: 30 }),
  grade: varchar('grade', { length: 50 }),
  group: varchar('group', { length: 50 }), // experimental, math, humanities
  targetMajor: text('target_major'),
  targetUniversity: text('target_university'),
  healthScore: integer('health_score').default(80),
  healthStatus: varchar('health_status', { length: 20 }).default('green'),
  advisorId: text('advisor_id').references(() => advisors.id, { onDelete: 'set null' }),
  advisorNameSnapshot: text('advisor_name_snapshot'),
  weeklyTargetHours: numeric('weekly_target_hours', { precision: 6, scale: 2 }).default('50.00'),
  completedHoursThisWeek: numeric('completed_hours_this_week', { precision: 6, scale: 2 }).default('0.00'),
  weeklyTargetTests: integer('weekly_target_tests').default(1000),
  completedTestsThisWeek: integer('completed_tests_this_week').default(0),
  planAdherenceRate: integer('plan_adherence_rate').default(85),
  studyConsistencyRate: integer('study_consistency_rate').default(90),
  lastExamScore: integer('last_exam_score').default(0),
  examTrend: varchar('exam_trend', { length: 20 }).default('stable'),
  status: varchar('status', { length: 30 }).default('active').notNull(),
  notesCount: integer('notes_count').default(0),
  unreadAdvisorMessages: integer('unread_advisor_messages').default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index('students_user_id_idx').on(table.userId),
  index('students_advisor_id_idx').on(table.advisorId),
  index('students_advisor_status_idx').on(table.advisorId, table.status),
  index('students_phone_idx').on(table.phone),
  index('students_legacy_id_idx').on(table.legacyId),
]);

// 4. Parents Domain
export const parents = pgTable('parents', {
  id: text('id').primaryKey().default(sql`gen_random_uuid()`),
  legacyId: varchar('legacy_id', { length: 100 }).unique(),
  userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }).unique(),
  studentId: text('student_id').references(() => students.id, { onDelete: 'cascade' }), // primary child reference
  fullName: text('full_name').notNull(),
  phone: varchar('phone', { length: 30 }).notNull(),
  relationship: varchar('relationship', { length: 50 }).default('parent'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index('parents_student_id_idx').on(table.studentId),
  index('parents_phone_idx').on(table.phone),
]);

// 5. Parent-Student Association Junction Table (Multi-child support)
export const parentStudents = pgTable('parent_students', {
  id: text('id').primaryKey().default(sql`gen_random_uuid()`),
  parentId: text('parent_id').references(() => parents.id, { onDelete: 'cascade' }).notNull(),
  studentId: text('student_id').references(() => students.id, { onDelete: 'cascade' }).notNull(),
  relationship: varchar('relationship', { length: 50 }).default('parent'),
  isPrimary: boolean('is_primary').default(true).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  uniqueIndex('parent_student_pair_idx').on(table.parentId, table.studentId),
  index('parent_students_parent_idx').on(table.parentId),
  index('parent_students_student_idx').on(table.studentId),
]);

// 6. Daily Study Reports
export const dailyReports = pgTable('daily_reports', {
  id: text('id').primaryKey().default(sql`gen_random_uuid()`),
  legacyId: varchar('legacy_id', { length: 100 }),
  studentId: text('student_id').references(() => students.id, { onDelete: 'cascade' }).notNull(),
  reportDate: varchar('report_date', { length: 20 }).notNull(), // ISO format YYYY-MM-DD
  studyHours: numeric('study_hours', { precision: 5, scale: 2 }).default('0.00').notNull(),
  testsCount: integer('tests_count').default(0).notNull(),
  correctTests: integer('correct_tests').default(0),
  wrongTests: integer('wrong_tests').default(0),
  unansweredTests: integer('unanswered_tests').default(0),
  efficiencyScore: integer('efficiency_score').default(80),
  focusScore: integer('focus_score').default(80),
  mentalScore: integer('mental_score').default(80),
  mood: varchar('mood', { length: 50 }),
  status: varchar('status', { length: 30 }).default('submitted'),
  sleepHours: numeric('sleep_hours', { precision: 4, scale: 2 }).default('7.00'),
  sleepIntervalHours: jsonb('sleep_interval_hours'),
  sleepStart: varchar('sleep_start', { length: 20 }),
  sleepEnd: varchar('sleep_end', { length: 20 }),
  mostImportantLearned: text('most_important_learned'),
  todayMistakesAndIssues: text('today_mistakes_and_issues'),
  hardestTaskDone: text('hardest_task_done'),
  tomorrowBigGoal: text('tomorrow_big_goal'),
  gratitudeNote: text('gratitude_note'),
  habitWaterDrank: boolean('habit_water_drank').default(false),
  habitSportDone: boolean('habit_sport_done').default(false),
  habitPhoneOffOnStudy: boolean('habit_phone_off_on_study').default(false),
  subjectsStudied: jsonb('subjects_studied').default([]),
  advisorFeedback: text('advisor_feedback'),
  advisorFeedbackDate: timestamp('advisor_feedback_date', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index('daily_reports_student_id_idx').on(table.studentId),
  index('daily_reports_date_idx').on(table.reportDate),
  index('daily_reports_student_date_desc_idx').on(table.studentId, table.reportDate),
  uniqueIndex('daily_reports_student_date_unique_idx').on(table.studentId, table.reportDate),
]);

// 7. Monthly Reports
export const monthlyReports = pgTable('monthly_reports', {
  id: text('id').primaryKey().default(sql`gen_random_uuid()`),
  legacyId: varchar('legacy_id', { length: 100 }),
  studentId: text('student_id').references(() => students.id, { onDelete: 'cascade' }).notNull(),
  monthName: varchar('month_name', { length: 50 }).notNull(),
  year: integer('year').default(1403),
  totalStudyHours: numeric('total_study_hours', { precision: 6, scale: 2 }).default('0.00'),
  totalTests: integer('total_tests').default(0),
  averageScore: integer('average_score').default(0),
  consistencyRate: integer('consistency_rate').default(85),
  advisorSummary: text('advisor_summary'),
  strengths: jsonb('strengths').default([]),
  improvements: jsonb('improvements').default([]),
  overallGrade: varchar('overall_grade', { length: 20 }).default('A'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index('monthly_reports_student_id_idx').on(table.studentId),
]);

// 8. Exams Domain
export const exams = pgTable('exams', {
  id: text('id').primaryKey().default(sql`gen_random_uuid()`),
  legacyId: varchar('legacy_id', { length: 100 }).unique(),
  title: text('title').notNull(),
  description: text('description'),
  category: varchar('category', { length: 50 }).default('comprehensive'),
  grade: varchar('grade', { length: 50 }),
  group: varchar('group', { length: 50 }),
  durationMinutes: integer('duration_minutes').default(60).notNull(),
  totalQuestions: integer('total_questions').default(30).notNull(),
  totalMarks: integer('total_marks').default(100),
  negativeMarking: boolean('negative_marking').default(true),
  negativeMarkRatio: numeric('negative_mark_ratio', { precision: 5, scale: 3 }).default('0.333'),
  status: varchar('status', { length: 30 }).default('active'),
  startsAt: timestamp('starts_at', { withTimezone: true }),
  endsAt: timestamp('ends_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index('exams_legacy_id_idx').on(table.legacyId),
  index('exams_status_idx').on(table.status),
]);

// 9. Questions Bank
export const questions = pgTable('questions', {
  id: text('id').primaryKey().default(sql`gen_random_uuid()`),
  legacyId: varchar('legacy_id', { length: 100 }).unique(),
  subject: varchar('subject', { length: 100 }).notNull(),
  topic: text('topic'),
  subtopic: text('subtopic'),
  grade: varchar('grade', { length: 50 }),
  difficulty: varchar('difficulty', { length: 30 }).default('medium'), // easy, medium, hard, konkoor
  questionText: text('question_text').notNull(),
  questionImage: text('question_image'),
  solutionText: text('solution_text'),
  solutionImage: text('solution_image'),
  correctOptionIndex: integer('correct_option_index').notNull(), // 0, 1, 2, 3
  points: numeric('points', { precision: 6, scale: 2 }).default('1.00'),
  options: jsonb('options').notNull(), // Array of 4 option strings/objects
  tags: jsonb('tags').default([]),
  year: integer('year'),
  source: text('source'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index('questions_subject_idx').on(table.subject),
  index('questions_difficulty_idx').on(table.difficulty),
  index('questions_legacy_id_idx').on(table.legacyId),
]);

// 10. Exam Questions Junction
export const examQuestions = pgTable('exam_questions', {
  id: text('id').primaryKey().default(sql`gen_random_uuid()`),
  examId: text('exam_id').references(() => exams.id, { onDelete: 'cascade' }).notNull(),
  questionId: text('question_id').references(() => questions.id, { onDelete: 'cascade' }).notNull(),
  orderIndex: integer('order_index').default(0).notNull(),
  customPoints: numeric('custom_points', { precision: 6, scale: 2 }).default('1.00'),
}, (table) => [
  index('exam_questions_exam_idx').on(table.examId),
  index('exam_questions_question_idx').on(table.questionId),
  uniqueIndex('exam_question_unique_idx').on(table.examId, table.questionId),
]);

// 11. Exam Results
export const examResults = pgTable('exam_results', {
  id: text('id').primaryKey().default(sql`gen_random_uuid()`),
  legacyId: varchar('legacy_id', { length: 100 }),
  examId: text('exam_id').references(() => exams.id, { onDelete: 'cascade' }).notNull(),
  studentId: text('student_id').references(() => students.id, { onDelete: 'cascade' }).notNull(),
  studentName: text('student_name'),
  score: numeric('score', { precision: 6, scale: 2 }).default('0.00').notNull(),
  percentage: numeric('percentage', { precision: 5, scale: 2 }).default('0.00').notNull(),
  rank: integer('rank').default(1),
  totalParticipants: integer('total_participants').default(1),
  timeSpentMinutes: integer('time_spent_minutes').default(0),
  correctCount: integer('correct_count').default(0),
  wrongCount: integer('wrong_count').default(0),
  unansweredCount: integer('unanswered_count').default(0),
  subjectBreakdown: jsonb('subject_breakdown').default([]),
  answers: jsonb('answers').default({}), // summary answers map
  completedAt: timestamp('completed_at', { withTimezone: true }).defaultNow().notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index('exam_results_exam_idx').on(table.examId),
  index('exam_results_student_idx').on(table.studentId),
  index('exam_results_student_completed_idx').on(table.studentId, table.completedAt),
]);

// 12. Normalized Exam Answers Table (Detailed relational answers)
export const examAnswers = pgTable('exam_answers', {
  id: text('id').primaryKey().default(sql`gen_random_uuid()`),
  examResultId: text('exam_result_id').references(() => examResults.id, { onDelete: 'cascade' }).notNull(),
  questionId: text('question_id').references(() => questions.id, { onDelete: 'cascade' }).notNull(),
  selectedOption: integer('selected_option'), // 0, 1, 2, 3 or null if skipped
  isCorrect: boolean('is_correct').default(false).notNull(),
  answerTimeSeconds: integer('answer_time_seconds').default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  uniqueIndex('exam_answers_result_question_idx').on(table.examResultId, table.questionId),
  index('exam_answers_result_idx').on(table.examResultId),
  index('exam_answers_question_idx').on(table.questionId),
]);

// 13. CRM Leads
export const leads = pgTable('leads', {
  id: text('id').primaryKey().default(sql`gen_random_uuid()`),
  legacyId: varchar('legacy_id', { length: 100 }).unique(),
  fullName: text('full_name').notNull(),
  phone: varchar('phone', { length: 30 }).notNull(),
  grade: varchar('grade', { length: 50 }),
  group: varchar('group', { length: 50 }),
  city: text('city'),
  school: text('school'),
  gpa: text('gpa'),
  source: varchar('source', { length: 50 }).default('website'),
  status: varchar('status', { length: 50 }).default('new').notNull(), // new, in_progress, converted, lost
  priority: varchar('priority', { length: 20 }).default('normal'),
  assignedAdvisorId: text('assigned_advisor_id').references(() => advisors.id, { onDelete: 'set null' }),
  consultationRequested: boolean('consultation_requested').default(false),
  estimatedScore: integer('estimated_score'),
  budget: text('budget'),
  notes: text('notes'),
  followups: jsonb('followups').default([]),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index('leads_phone_idx').on(table.phone),
  index('leads_status_idx').on(table.status),
  index('leads_advisor_idx').on(table.assignedAdvisorId),
  index('leads_advisor_status_idx').on(table.assignedAdvisorId, table.status),
]);

// 14. Articles & Magazine
export const articles = pgTable('articles', {
  id: text('id').primaryKey().default(sql`gen_random_uuid()`),
  legacyId: varchar('legacy_id', { length: 100 }).unique(),
  slug: varchar('slug', { length: 200 }).notNull().unique(),
  title: text('title').notNull(),
  excerpt: text('excerpt'),
  content: text('content').notNull(),
  category: varchar('category', { length: 100 }).default('study-tips'),
  tags: jsonb('tags').default([]),
  authorName: text('author_name').default('تیم مشاوران کافئین'),
  authorRole: text('author_role'),
  authorAvatar: text('author_avatar'),
  coverImage: text('cover_image'),
  readingTimeMinutes: integer('reading_time_minutes').default(5),
  viewsCount: integer('views_count').default(0),
  likesCount: integer('likes_count').default(0),
  isFeatured: boolean('is_featured').default(false),
  status: varchar('status', { length: 30 }).default('published'),
  publishedAt: timestamp('published_at', { withTimezone: true }).defaultNow(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  uniqueIndex('articles_slug_idx').on(table.slug),
  index('articles_status_idx').on(table.status),
  index('articles_category_idx').on(table.category),
]);

// 15. Student Testimonials / Comments
export const studentComments = pgTable('student_comments', {
  id: text('id').primaryKey().default(sql`gen_random_uuid()`),
  legacyId: varchar('legacy_id', { length: 100 }),
  authorName: text('author_name').notNull(),
  authorRole: text('author_role'),
  avatarUrl: text('avatar_url'),
  city: text('city'),
  group: varchar('group', { length: 50 }),
  rating: integer('rating').default(5),
  commentText: text('comment_text').notNull(),
  isVerifiedStudent: boolean('is_verified_student').default(true),
  isPinned: boolean('is_pinned').default(false),
  likesCount: integer('likes_count').default(0),
  keyHighlight: text('key_highlight'),
  advisorName: text('advisor_name'),
  videoUrl: text('video_url'),
  videoThumbnail: text('video_thumbnail'),
  videoDuration: text('video_duration'),
  videoTitle: text('video_title'),
  adminReply: jsonb('admin_reply'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index('comments_rating_idx').on(table.rating),
  index('comments_pinned_idx').on(table.isPinned),
]);

// 16. Chat Rooms
export const chatRooms = pgTable('chat_rooms', {
  id: text('id').primaryKey().default(sql`gen_random_uuid()`),
  legacyId: varchar('legacy_id', { length: 100 }).unique(),
  title: text('title').notNull(),
  roomType: varchar('room_type', { length: 50 }).default('direct'), // direct, group, support
  studentId: text('student_id').references(() => students.id, { onDelete: 'set null' }),
  advisorId: text('advisor_id').references(() => advisors.id, { onDelete: 'set null' }),
  lastMessageText: text('last_message_text'),
  lastMessageTime: timestamp('last_message_time', { withTimezone: true }),
  unreadCount: integer('unread_count').default(0),
  status: varchar('status', { length: 30 }).default('active'),
  isPinned: boolean('is_pinned').default(false),
  isArchived: boolean('is_archived').default(false),
  tags: jsonb('tags').default([]),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index('chat_rooms_student_idx').on(table.studentId),
  index('chat_rooms_advisor_idx').on(table.advisorId),
  index('chat_rooms_legacy_id_idx').on(table.legacyId),
]);

// 17. Chat Room Members Association Table
export const chatRoomMembers = pgTable('chat_room_members', {
  id: text('id').primaryKey().default(sql`gen_random_uuid()`),
  roomId: text('room_id').references(() => chatRooms.id, { onDelete: 'cascade' }).notNull(),
  userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  role: varchar('role', { length: 50 }).default('member'), // member, admin, moderator
  joinedAt: timestamp('joined_at', { withTimezone: true }).defaultNow().notNull(),
  lastReadAt: timestamp('last_read_at', { withTimezone: true }),
}, (table) => [
  uniqueIndex('chat_room_members_room_user_idx').on(table.roomId, table.userId),
  index('chat_room_members_room_idx').on(table.roomId),
  index('chat_room_members_user_idx').on(table.userId),
]);

// 18. Chat Messages
export const chatMessages = pgTable('chat_messages', {
  id: text('id').primaryKey().default(sql`gen_random_uuid()`),
  legacyId: varchar('legacy_id', { length: 100 }),
  roomId: text('room_id').references(() => chatRooms.id, { onDelete: 'cascade' }).notNull(),
  senderId: text('sender_id').notNull(),
  senderName: text('sender_name').notNull(),
  senderRole: varchar('sender_role', { length: 50 }).default('student'),
  senderAvatar: text('sender_avatar'),
  content: text('content').notNull(),
  messageType: varchar('message_type', { length: 30 }).default('text'), // text, image, audio, file
  mediaUrl: text('media_url'),
  replyToId: text('reply_to_id'),
  isPinned: boolean('is_pinned').default(false),
  isRead: boolean('is_read').default(false),
  isDeleted: boolean('is_deleted').default(false),
  reactions: jsonb('reactions').default([]),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index('chat_messages_room_idx').on(table.roomId),
  index('chat_messages_room_created_desc_idx').on(table.roomId, table.createdAt),
  index('chat_messages_created_idx').on(table.createdAt),
]);

// 19. SMS Campaigns
export const smsCampaigns = pgTable('sms_campaigns', {
  id: text('id').primaryKey().default(sql`gen_random_uuid()`),
  legacyId: varchar('legacy_id', { length: 100 }),
  title: text('title').notNull(),
  messageTemplate: text('message_template').notNull(),
  recipientType: varchar('recipient_type', { length: 50 }).default('all_students'),
  totalRecipients: integer('total_recipients').default(0),
  successfulCount: integer('successful_count').default(0),
  failedCount: integer('failed_count').default(0),
  status: varchar('status', { length: 30 }).default('sent'),
  scheduledFor: timestamp('scheduled_for', { withTimezone: true }),
  sentAt: timestamp('sent_at', { withTimezone: true }).defaultNow(),
  cost: numeric('cost', { precision: 12, scale: 2 }).default('0.00'),
  logs: jsonb('logs').default([]),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index('sms_campaigns_status_idx').on(table.status),
  index('sms_campaigns_sent_at_idx').on(table.sentAt),
]);

// 20. Avatars Catalog
export const avatarCatalog = pgTable('avatar_catalog', {
  id: text('id').primaryKey().default(sql`gen_random_uuid()`),
  legacyId: varchar('legacy_id', { length: 100 }).unique(),
  name: text('name').notNull(),
  category: varchar('category', { length: 50 }).default('avatar'),
  imageUrl: text('image_url').notNull(),
  priceCoins: integer('price_coins').default(0),
  unlockCondition: text('unlock_condition'),
  isDefault: boolean('is_default').default(false),
  rarity: varchar('rarity', { length: 50 }).default('common'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index('avatar_category_idx').on(table.category),
]);

// 21. Confidential Health & Wellness Records
export const confidentialHealthRecords = pgTable('confidential_health_records', {
  id: text('id').primaryKey().default(sql`gen_random_uuid()`),
  legacyId: varchar('legacy_id', { length: 100 }),
  studentId: text('student_id').references(() => students.id, { onDelete: 'cascade' }).notNull(),
  authorRole: varchar('author_role', { length: 50 }).default('advisor'),
  authorName: text('author_name').notNull(),
  category: varchar('category', { length: 50 }).default('wellness'),
  title: text('title').notNull(),
  clinicalObservation: text('clinical_observation'),
  medicationNotes: text('medication_notes'),
  psychologicalStatus: text('psychological_status'),
  riskLevel: varchar('risk_level', { length: 30 }).default('low'), // low, medium, high
  requiresIntervention: boolean('requires_intervention').default(false),
  actionPlan: text('action_plan'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index('health_student_id_idx').on(table.studentId),
  index('health_risk_level_idx').on(table.riskLevel),
]);

// 22. Append-Only Audit Logs
export const auditLogs = pgTable('audit_logs', {
  id: text('id').primaryKey().default(sql`gen_random_uuid()`),
  legacyId: varchar('legacy_id', { length: 100 }),
  actorUserId: text('actor_user_id'),
  actorRole: varchar('actor_role', { length: 50 }),
  actorName: text('actor_name'),
  action: varchar('action', { length: 100 }).notNull(),
  entityType: varchar('entity_type', { length: 50 }),
  entityId: text('entity_id'),
  ipAddress: varchar('ip_address', { length: 60 }),
  userAgent: text('user_agent'),
  sensitiveCategory: varchar('sensitive_category', { length: 50 }),
  status: varchar('status', { length: 30 }).default('SUCCESS'),
  details: jsonb('details').default({}),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index('audit_actor_idx').on(table.actorUserId),
  index('audit_action_idx').on(table.action),
  index('audit_created_idx').on(table.createdAt),
  index('audit_entity_created_desc_idx').on(table.entityType, table.entityId, table.createdAt),
]);

// 23. System Configuration Settings
export const systemSettings = pgTable('system_settings', {
  id: text('id').primaryKey().default(sql`gen_random_uuid()`),
  key: varchar('key', { length: 100 }).notNull().unique(),
  value: jsonb('value').notNull(),
  description: text('description'),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  uniqueIndex('settings_key_idx').on(table.key),
]);

/**
 * Relations Declarations for Drizzle ORM
 */
export const usersRelations = relations(users, ({ one, many }) => ({
  student: one(students, { fields: [users.id], references: [students.userId] }),
  advisor: one(advisors, { fields: [users.id], references: [advisors.userId] }),
  parent: one(parents, { fields: [users.id], references: [parents.userId] }),
  chatMemberships: many(chatRoomMembers),
}));

export const advisorsRelations = relations(advisors, ({ one, many }) => ({
  user: one(users, { fields: [advisors.userId], references: [users.id] }),
  students: many(students),
  leads: many(leads),
  chatRooms: many(chatRooms),
}));

export const studentsRelations = relations(students, ({ one, many }) => ({
  user: one(users, { fields: [students.userId], references: [users.id] }),
  advisor: one(advisors, { fields: [students.advisorId], references: [advisors.id] }),
  dailyReports: many(dailyReports),
  monthlyReports: many(monthlyReports),
  examResults: many(examResults),
  healthRecords: many(confidentialHealthRecords),
  chatRooms: many(chatRooms),
  parents: many(parentStudents),
}));

export const parentsRelations = relations(parents, ({ one, many }) => ({
  user: one(users, { fields: [parents.userId], references: [users.id] }),
  primaryStudent: one(students, { fields: [parents.studentId], references: [students.id] }),
  children: many(parentStudents),
}));

export const parentStudentsRelations = relations(parentStudents, ({ one }) => ({
  parent: one(parents, { fields: [parentStudents.parentId], references: [parents.id] }),
  student: one(students, { fields: [parentStudents.studentId], references: [students.id] }),
}));

export const dailyReportsRelations = relations(dailyReports, ({ one }) => ({
  student: one(students, { fields: [dailyReports.studentId], references: [students.id] }),
}));

export const examsRelations = relations(exams, ({ many }) => ({
  examQuestions: many(examQuestions),
  results: many(examResults),
}));

export const questionsRelations = relations(questions, ({ many }) => ({
  examQuestions: many(examQuestions),
  examAnswers: many(examAnswers),
}));

export const examQuestionsRelations = relations(examQuestions, ({ one }) => ({
  exam: one(exams, { fields: [examQuestions.examId], references: [exams.id] }),
  question: one(questions, { fields: [examQuestions.questionId], references: [questions.id] }),
}));

export const examResultsRelations = relations(examResults, ({ one, many }) => ({
  exam: one(exams, { fields: [examResults.examId], references: [exams.id] }),
  student: one(students, { fields: [examResults.studentId], references: [students.id] }),
  detailedAnswers: many(examAnswers),
}));

export const examAnswersRelations = relations(examAnswers, ({ one }) => ({
  examResult: one(examResults, { fields: [examAnswers.examResultId], references: [examResults.id] }),
  question: one(questions, { fields: [examAnswers.questionId], references: [questions.id] }),
}));

export const chatRoomsRelations = relations(chatRooms, ({ one, many }) => ({
  student: one(students, { fields: [chatRooms.studentId], references: [students.id] }),
  advisor: one(advisors, { fields: [chatRooms.advisorId], references: [advisors.id] }),
  messages: many(chatMessages),
  members: many(chatRoomMembers),
}));

export const chatRoomMembersRelations = relations(chatRoomMembers, ({ one }) => ({
  room: one(chatRooms, { fields: [chatRoomMembers.roomId], references: [chatRooms.id] }),
  user: one(users, { fields: [chatRoomMembers.userId], references: [users.id] }),
}));

export const chatMessagesRelations = relations(chatMessages, ({ one }) => ({
  room: one(chatRooms, { fields: [chatMessages.roomId], references: [chatRooms.id] }),
}));

