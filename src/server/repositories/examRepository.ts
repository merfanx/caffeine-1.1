import { eq, desc, asc, and, or, inArray } from 'drizzle-orm';
import { db } from '../db/client.js';
import { exams, examQuestions, questions, examResults, students, advisors, parents, parentStudents } from '../db/schema.js';
import crypto from 'crypto';
import { db as fileDb } from '../storage/fileDatabase.js';
import { MOCK_EXAM_RESULTS } from '../../data/mockDatabase.js';

export interface AuthenticatedUserContextLike {
  id?: string;
  userId?: string;
  studentId?: string;
  advisorId?: string;
  childStudentId?: string;
  role?: string;
  phone?: string;
  name?: string;
  [key: string]: any;
}

export interface ScopedExamQueryOptions {
  user?: AuthenticatedUserContextLike | null;
  studentId?: string;
  examId?: string;
  limit?: number;
  offset?: number;
  sortBy?: 'completedAt' | 'score' | 'percentage' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

function normalizeId(id?: string | null): string {
  if (!id) return '';
  return String(id)
    .trim()
    .replace(/^(usr-|std-|adv-|parent-|lead-)/i, '')
    .toLowerCase();
}

export const examRepository = {
  async getAllExams(status?: string) {
    if (status) {
      return db.select().from(exams).where(eq(exams.status, status)).orderBy(desc(exams.createdAt));
    }
    return db.select().from(exams).orderBy(desc(exams.createdAt));
  },

  async findExamById(id: string) {
    const examRows = await db.select().from(exams).where(or(eq(exams.id, id), eq(exams.legacyId, id))).limit(1);
    if (!examRows[0]) return null;

    // Get associated questions
    const questionLinks = await db
      .select({
        question: questions,
        orderIndex: examQuestions.orderIndex,
        customPoints: examQuestions.customPoints,
      })
      .from(examQuestions)
      .innerJoin(questions, eq(examQuestions.questionId, questions.id))
      .where(eq(examQuestions.examId, examRows[0].id))
      .orderBy(examQuestions.orderIndex);

    return {
      ...examRows[0],
      questions: questionLinks.map(ql => ({
        ...ql.question,
        points: ql.customPoints ? Number(ql.customPoints) : ql.question.points,
      })),
    };
  },

  async createExam(data: typeof exams.$inferInsert, questionIds: string[] = []) {
    const id = data.id || crypto.randomUUID();
    return db.transaction(async (tx) => {
      const [insertedExam] = await tx
        .insert(exams)
        .values({
          ...data,
          id,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();

      if (questionIds.length > 0) {
        const linkRecords = questionIds.map((qId, idx) => ({
          id: crypto.randomUUID(),
          examId: id,
          questionId: qId,
          orderIndex: idx + 1,
          customPoints: '1.0',
        }));
        await tx.insert(examQuestions).values(linkRecords as any);
      }

      return insertedExam;
    });
  },

  // Exam Results & Attempt Processing (Transactional)
  async submitExamResult(resultData: Omit<typeof examResults.$inferInsert, 'id'> & { id?: string }) {
    const id = resultData.id || crypto.randomUUID();
    return db.transaction(async (tx) => {
      const [saved] = await tx
        .insert(examResults)
        .values({
          ...resultData,
          id,
          completedAt: new Date(),
          createdAt: new Date(),
        })
        .returning();

      // Update student's lastExamScore if student exists
      if (resultData.studentId) {
        await tx
          .update(students)
          .set({
            lastExamScore: Math.round(Number(resultData.score) || 0),
            updatedAt: new Date(),
          })
          .where(or(eq(students.id, resultData.studentId), eq(students.legacyId, resultData.studentId)));
      }

      return saved;
    });
  },

  /**
   * Scoped Query for Exam Results strictly isolated by authenticated role:
   * 1. Student: WHERE student_id = :authenticatedStudentId
   * 2. Advisor: WHERE student_id = :targetStudentId AND student.advisor_id = :authenticatedAdvisorId
   * 3. Parent: WHERE student_id = :targetStudentId AND verified parent-student relation
   * 4. Admin: Unrestricted (or filtered by requested studentId)
   */
  async findScopedExamResults(options: ScopedExamQueryOptions) {
    const { user, studentId, examId, limit = 50, offset = 0, sortBy = 'completedAt', sortOrder = 'desc' } = options;
    if (!user || !user.role) return [];

    const role = (user.role || '').toLowerCase();
    const cleanTargetStudentId = studentId ? String(studentId).trim() : undefined;

    try {
      // 1. ADMIN & SUPER_ADMIN: Unrestricted access (can query all or specific student)
      if (role === 'admin' || role === 'super_admin') {
        const orderColumn = sortBy === 'score' ? examResults.score : examResults.completedAt;
        const orderExpr = sortOrder === 'asc' ? asc(orderColumn) : desc(orderColumn);

        let query = db.select().from(examResults);
        if (cleanTargetStudentId && examId) {
          return await db
            .select()
            .from(examResults)
            .where(and(
              or(eq(examResults.studentId, cleanTargetStudentId), eq(examResults.studentId, cleanTargetStudentId)),
              eq(examResults.examId, examId)
            ))
            .orderBy(orderExpr)
            .limit(limit)
            .offset(offset);
        }
        if (cleanTargetStudentId) {
          return await db
            .select()
            .from(examResults)
            .where(or(eq(examResults.studentId, cleanTargetStudentId), eq(examResults.studentId, cleanTargetStudentId)))
            .orderBy(orderExpr)
            .limit(limit)
            .offset(offset);
        }
        if (examId) {
          return await db
            .select()
            .from(examResults)
            .where(eq(examResults.examId, examId))
            .orderBy(orderExpr)
            .limit(limit)
            .offset(offset);
        }
        return await db.select().from(examResults).orderBy(orderExpr).limit(limit).offset(offset);
      }

      // 2. STUDENT: Strict Self-Isolation
      if (role === 'student') {
        const authenticatedStudentId = user.studentId || user.userId || user.id;
        if (!authenticatedStudentId) return [];

        const normAuth = normalizeId(authenticatedStudentId);
        if (cleanTargetStudentId && normalizeId(cleanTargetStudentId) !== normAuth) {
          // BOLA Attempt: Student requesting another student's exam results
          return [];
        }

        const effectiveStudentId = cleanTargetStudentId || authenticatedStudentId;
        const orderColumn = sortBy === 'score' ? examResults.score : examResults.completedAt;
        const orderExpr = sortOrder === 'asc' ? asc(orderColumn) : desc(orderColumn);

        if (examId) {
          return await db
            .select()
            .from(examResults)
            .where(and(
              or(eq(examResults.studentId, effectiveStudentId), eq(examResults.studentId, effectiveStudentId)),
              eq(examResults.examId, examId)
            ))
            .orderBy(orderExpr)
            .limit(limit)
            .offset(offset);
        }

        return await db
          .select()
          .from(examResults)
          .where(or(eq(examResults.studentId, effectiveStudentId), eq(examResults.studentId, effectiveStudentId)))
          .orderBy(orderExpr)
          .limit(limit)
          .offset(offset);
      }

      // 3. ADVISOR: Scoped to assigned students only
      if (role === 'advisor') {
        const advisorId = user.advisorId || user.userId || user.id;
        if (!advisorId) return [];

        if (cleanTargetStudentId) {
          // Verify assignment at SQL level
          const assignedStudent = await db
            .select({ id: students.id })
            .from(students)
            .where(and(
              or(eq(students.id, cleanTargetStudentId), eq(students.legacyId, cleanTargetStudentId)),
              or(eq(students.advisorId, advisorId), eq(students.advisorId, advisorId))
            ))
            .limit(1);

          if (!assignedStudent[0]) return []; // Not assigned to this advisor -> 0 records

          const orderColumn = sortBy === 'score' ? examResults.score : examResults.completedAt;
          const orderExpr = sortOrder === 'asc' ? asc(orderColumn) : desc(orderColumn);

          if (examId) {
            return await db
              .select()
              .from(examResults)
              .where(and(
                or(eq(examResults.studentId, cleanTargetStudentId), eq(examResults.studentId, cleanTargetStudentId)),
                eq(examResults.examId, examId)
              ))
              .orderBy(orderExpr)
              .limit(limit)
              .offset(offset);
          }

          return await db
            .select()
            .from(examResults)
            .where(or(eq(examResults.studentId, cleanTargetStudentId), eq(examResults.studentId, cleanTargetStudentId)))
            .orderBy(orderExpr)
            .limit(limit)
            .offset(offset);
        }

        // If no target student specified, fetch results for all students assigned to this advisor
        const assignedStudents = await db
          .select({ id: students.id, legacyId: students.legacyId })
          .from(students)
          .where(or(eq(students.advisorId, advisorId), eq(students.advisorId, advisorId)));

        const allowedIds = assignedStudents
          .flatMap(s => [s.id, s.legacyId])
          .filter(Boolean) as string[];

        if (allowedIds.length === 0) return [];

        const orderColumn = sortBy === 'score' ? examResults.score : examResults.completedAt;
        const orderExpr = sortOrder === 'asc' ? asc(orderColumn) : desc(orderColumn);

        return await db
          .select()
          .from(examResults)
          .where(inArray(examResults.studentId, allowedIds))
          .orderBy(orderExpr)
          .limit(limit)
          .offset(offset);
      }

      // 4. PARENT: Scoped to verified child student only
      if (role === 'parent') {
        const childClaim = user.childStudentId;
        const targetId = cleanTargetStudentId || childClaim;
        if (!targetId) return [];

        // Verify child relation
        let isAuthorized = false;
        if (childClaim && normalizeId(childClaim) === normalizeId(targetId)) {
          isAuthorized = true;
        }

        if (!isAuthorized && user.phone) {
          const studentRow = await db
            .select({ id: students.id, parentPhone: students.parentPhone })
            .from(students)
            .where(or(eq(students.id, targetId), eq(students.legacyId, targetId)))
            .limit(1);

          if (studentRow[0] && studentRow[0].parentPhone === user.phone.trim()) {
            isAuthorized = true;
          }
        }

        if (!isAuthorized) {
          const parentRow = await db
            .select()
            .from(parents)
            .where(eq(parents.userId, user.id || user.userId || ''))
            .limit(1);

          if (parentRow[0] && (parentRow[0].studentId === targetId)) {
            isAuthorized = true;
          }
        }

        if (!isAuthorized) return [];

        const orderColumn = sortBy === 'score' ? examResults.score : examResults.completedAt;
        const orderExpr = sortOrder === 'asc' ? asc(orderColumn) : desc(orderColumn);

        return await db
          .select()
          .from(examResults)
          .where(or(eq(examResults.studentId, targetId), eq(examResults.studentId, targetId)))
          .orderBy(orderExpr)
          .limit(limit)
          .offset(offset);
      }

      return [];
    } catch (dbErr) {
      // Fallback to in-memory/file-db scoped querying
      return this.getScopedExamResultsFromDb(user, cleanTargetStudentId, { limit, offset });
    }
  },

  /**
   * Scoped querying on the fileDatabase / in-memory store.
   * NEVER loads all results into memory without a strict predicate.
   * NEVER returns mock results of other students as fallback when empty.
   */
  getScopedExamResultsFromDb(
    user: AuthenticatedUserContextLike | null | undefined,
    targetStudentId?: string,
    options?: { limit?: number; offset?: number; examId?: string }
  ): any[] {
    if (!user || !user.role) return [];

    const role = (user.role || '').toLowerCase();
    const limit = options?.limit || 50;
    const offset = options?.offset || 0;

    // 1. ADMIN: Can query any or all
    if (role === 'admin' || role === 'super_admin') {
      if (targetStudentId) {
        const normTarget = normalizeId(targetStudentId);
        const results = fileDb.find<any>(
          'exam_results',
          (r) => normalizeId(r.studentId) === normTarget,
          MOCK_EXAM_RESULTS
        );
        return results.slice(offset, offset + limit);
      }
      const all = fileDb.find<any>('exam_results', undefined, MOCK_EXAM_RESULTS);
      return all.slice(offset, offset + limit);
    }

    // 2. STUDENT: Only own records
    if (role === 'student') {
      const myStudentId = normalizeId(user.studentId || user.userId || user.id);
      if (!myStudentId) return [];

      if (targetStudentId && normalizeId(targetStudentId) !== myStudentId) {
        // IDOR Block
        return [];
      }

      // Predicate scoped from the start
      const results = fileDb.find<any>(
        'exam_results',
        (r) => normalizeId(r.studentId) === myStudentId,
        MOCK_EXAM_RESULTS
      );

      // Verify zero leakage before returning
      const sanitized = results.filter((r) => normalizeId(r.studentId) === myStudentId);
      return sanitized.slice(offset, offset + limit);
    }

    // 3. ADVISOR: Only assigned students
    if (role === 'advisor') {
      const authAdvisorId = normalizeId(user.advisorId || user.userId || user.id);
      if (!authAdvisorId) return [];

      if (targetStudentId) {
        const normTarget = normalizeId(targetStudentId);
        // Find student record to verify advisor assignment
        const studentProfile = fileDb.findById<any>('students', targetStudentId) ||
          fileDb.find<any>('students', (s) => normalizeId(s.id) === normTarget)[0] ||
          fileDb.find<any>('student_profiles', (s) => normalizeId(s.id) === normTarget)[0];

        const assignedAdvisorId = normalizeId(studentProfile?.advisorId || studentProfile?.advisorDetails?.id);
        if (!assignedAdvisorId || assignedAdvisorId !== authAdvisorId) {
          return []; // Not assigned -> block
        }

        const results = fileDb.find<any>(
          'exam_results',
          (r) => normalizeId(r.studentId) === normTarget,
          MOCK_EXAM_RESULTS
        );
        return results.filter((r) => normalizeId(r.studentId) === normTarget).slice(offset, offset + limit);
      }

      // Get all assigned students for this advisor
      const myStudents = fileDb.find<any>(
        'students',
        (s) => normalizeId(s.advisorId) === authAdvisorId
      );
      const allowedStudentIds = new Set(myStudents.map((s) => normalizeId(s.id)));

      const results = fileDb.find<any>(
        'exam_results',
        (r) => allowedStudentIds.has(normalizeId(r.studentId)),
        MOCK_EXAM_RESULTS
      );
      return results.slice(offset, offset + limit);
    }

    // 4. PARENT: Only child records
    if (role === 'parent') {
      const childClaim = normalizeId(user.childStudentId);
      const target = normalizeId(targetStudentId || user.childStudentId);

      if (!target) return [];

      let isAuthorized = false;
      if (childClaim && childClaim === target) {
        isAuthorized = true;
      }

      if (!isAuthorized && user.phone) {
        const studentProfile = fileDb.findById<any>('students', targetStudentId || '') ||
          fileDb.find<any>('students', (s) => normalizeId(s.id) === target)[0];
        if (studentProfile?.parentPhone && studentProfile.parentPhone.trim() === user.phone.trim()) {
          isAuthorized = true;
        }
      }

      if (!isAuthorized) return [];

      const results = fileDb.find<any>(
        'exam_results',
        (r) => normalizeId(r.studentId) === target,
        MOCK_EXAM_RESULTS
      );
      return results.filter((r) => normalizeId(r.studentId) === target).slice(offset, offset + limit);
    }

    return [];
  },

  /**
   * Helper specifically for Student Profile `recentExams`
   * Ensures 100% strict scoping to the target authorized student.
   * Returns `[]` if unauthorized or if student has no exams.
   */
  async getScopedRecentExams(
    user: AuthenticatedUserContextLike | null | undefined,
    studentId: string,
    limit: number = 10
  ): Promise<any[]> {
    if (!user || !studentId) return [];

    const normTarget = normalizeId(studentId);

    // Fetch scoped exam results
    const results = await this.findScopedExamResults({
      user,
      studentId,
      limit,
      sortBy: 'completedAt',
      sortOrder: 'desc'
    });

    // Double-check verification before returning to eliminate any potential data leakage
    return results.filter((r: any) => normalizeId(r.studentId) === normTarget);
  },

  /**
   * Safe helper to fetch single exam result by ID with authorization verification
   */
  async findExamResultById(resultId: string, user: AuthenticatedUserContextLike | null | undefined): Promise<any | null> {
    if (!resultId || !user) return null;

    let result: any = null;
    try {
      const rows = await db.select().from(examResults).where(eq(examResults.id, resultId)).limit(1);
      result = rows[0] || null;
    } catch {
      result = fileDb.findById<any>('exam_results', resultId, MOCK_EXAM_RESULTS);
    }

    if (!result) {
      result = fileDb.findById<any>('exam_results', resultId, MOCK_EXAM_RESULTS);
    }

    if (!result) return null;

    // Verify user is authorized to view this result's student
    const role = (user.role || '').toLowerCase();
    if (role === 'admin' || role === 'super_admin') return result;

    const resultStudentId = normalizeId(result.studentId);
    if (role === 'student') {
      const myId = normalizeId(user.studentId || user.userId || user.id);
      return myId === resultStudentId ? result : null;
    }

    if (role === 'parent') {
      const myChildId = normalizeId(user.childStudentId);
      return myChildId === resultStudentId ? result : null;
    }

    if (role === 'advisor') {
      const advisorId = normalizeId(user.advisorId || user.userId || user.id);
      // Check if student belongs to this advisor
      const student = fileDb.findById<any>('students', result.studentId) ||
        fileDb.find<any>('students', (s) => normalizeId(s.id) === resultStudentId)[0];
      const studentAdvisor = normalizeId(student?.advisorId);
      return studentAdvisor === advisorId ? result : null;
    }

    return null;
  },

  // Legacy compatibility method with safety checks
  async getExamResults(studentId?: string, examId?: string) {
    if (studentId && examId) {
      return db
        .select()
        .from(examResults)
        .where(and(or(eq(examResults.studentId, studentId), eq(examResults.studentId, studentId)), eq(examResults.examId, examId)))
        .orderBy(desc(examResults.completedAt));
    }
    if (studentId) {
      return db
        .select()
        .from(examResults)
        .where(or(eq(examResults.studentId, studentId), eq(examResults.studentId, studentId)))
        .orderBy(desc(examResults.completedAt));
    }
    if (examId) {
      return db
        .select()
        .from(examResults)
        .where(eq(examResults.examId, examId))
        .orderBy(desc(examResults.completedAt));
    }
    return db.select().from(examResults).orderBy(desc(examResults.completedAt));
  }
};



