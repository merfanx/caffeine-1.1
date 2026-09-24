import { eq, or, and, desc } from 'drizzle-orm';
import { db } from '../db/client.js';
import { students, advisors, parents, parentStudents } from '../db/schema.js';
import crypto from 'crypto';

export interface ScopedStudentQueryOptions {
  studentId: string;
  userRole: string;
  userId: string;
  studentIdClaim?: string;
  advisorIdClaim?: string;
  childStudentIdClaim?: string;
  userPhone?: string;
}

export const studentRepository = {
  async findById(id: string) {
    if (!id) return null;
    const cleanId = String(id).trim();
    const result = await db
      .select({
        student: students,
        advisor: advisors,
      })
      .from(students)
      .leftJoin(advisors, eq(students.advisorId, advisors.id))
      .where(or(
        eq(students.id, cleanId),
        eq(students.legacyId, cleanId),
        eq(students.userId, cleanId)
      ))
      .limit(1);

    if (!result[0]) return null;
    const { student, advisor } = result[0];
    return {
      ...student,
      advisorName: advisor?.name || student.advisorNameSnapshot || 'مشاور کافئین',
      advisorDetails: advisor,
    };
  },

  /**
   * Scoped Query for BOLA / IDOR Defense
   * Directly applies SQL-level filters based on user role and identity:
   * - Admin: WHERE id = :studentId
   * - Student: WHERE id = :studentId AND (userId = :authUserId OR id = :authStudentId)
   * - Advisor: WHERE id = :studentId AND (advisorId = :authAdvisorId OR advisor.userId = :authUserId)
   * - Parent: WHERE id = :studentId AND parent_student relation matches
   */
  async findScopedStudent(options: ScopedStudentQueryOptions) {
    const { studentId, userRole, userId, studentIdClaim, advisorIdClaim, childStudentIdClaim, userPhone } = options;
    const cleanTargetId = String(studentId).trim();
    const role = (userRole || '').toLowerCase();

    // 1. Admin & Super Admin: Global Unrestricted Access
    if (role === 'admin' || role === 'super_admin') {
      return this.findById(cleanTargetId);
    }

    // 2. Student: Scoped strictly to own student account
    if (role === 'student') {
      const allowedId = studentIdClaim || userId;
      const result = await db
        .select({
          student: students,
          advisor: advisors,
        })
        .from(students)
        .leftJoin(advisors, eq(students.advisorId, advisors.id))
        .where(
          and(
            or(eq(students.id, cleanTargetId), eq(students.legacyId, cleanTargetId)),
            or(
              eq(students.id, allowedId),
              eq(students.legacyId, allowedId),
              eq(students.userId, userId)
            )
          )
        )
        .limit(1);

      if (!result[0]) return null;
      return {
        ...result[0].student,
        advisorName: result[0].advisor?.name || result[0].student.advisorNameSnapshot || 'مشاور کافئین',
        advisorDetails: result[0].advisor,
      };
    }

    // 3. Advisor: Scoped strictly to assigned students
    if (role === 'advisor') {
      const effectiveAdvisorId = advisorIdClaim || userId;
      const result = await db
        .select({
          student: students,
          advisor: advisors,
        })
        .from(students)
        .leftJoin(advisors, eq(students.advisorId, advisors.id))
        .where(
          and(
            or(eq(students.id, cleanTargetId), eq(students.legacyId, cleanTargetId)),
            or(
              eq(students.advisorId, effectiveAdvisorId),
              eq(advisors.id, effectiveAdvisorId),
              eq(advisors.legacyId, effectiveAdvisorId),
              eq(advisors.userId, userId)
            )
          )
        )
        .limit(1);

      if (!result[0]) return null;
      return {
        ...result[0].student,
        advisorName: result[0].advisor?.name || result[0].student.advisorNameSnapshot || 'مشاور کافئین',
        advisorDetails: result[0].advisor,
      };
    }

    // 4. Parent: Scoped strictly to verified child students
    if (role === 'parent') {
      // Direct query with parent validation
      const result = await db
        .select({
          student: students,
          advisor: advisors,
        })
        .from(students)
        .leftJoin(advisors, eq(students.advisorId, advisors.id))
        .where(or(eq(students.id, cleanTargetId), eq(students.legacyId, cleanTargetId)))
        .limit(1);

      if (!result[0]) return null;

      // Verify parent relationship
      const targetStudent = result[0].student;
      let isAuthorized = false;

      if (childStudentIdClaim) {
        const normChild = childStudentIdClaim.replace(/^(usr-|std-)/i, '').toLowerCase();
        const normTarget = cleanTargetId.replace(/^(usr-|std-)/i, '').toLowerCase();
        if (normChild === normTarget) isAuthorized = true;
      }

      if (!isAuthorized && userPhone && targetStudent.parentPhone === userPhone.trim()) {
        isAuthorized = true;
      }

      if (!isAuthorized) {
        const parentRecords = await db
          .select()
          .from(parents)
          .where(eq(parents.userId, userId))
          .limit(1);

        if (parentRecords[0]) {
          if (parentRecords[0].studentId === targetStudent.id || parentRecords[0].studentId === targetStudent.legacyId) {
            isAuthorized = true;
          } else {
            const junction = await db
              .select()
              .from(parentStudents)
              .where(
                and(
                  eq(parentStudents.parentId, parentRecords[0].id),
                  eq(parentStudents.studentId, targetStudent.id)
                )
              )
              .limit(1);
            if (junction.length > 0) isAuthorized = true;
          }
        }
      }

      if (!isAuthorized) return null;

      return {
        ...targetStudent,
        advisorName: result[0].advisor?.name || targetStudent.advisorNameSnapshot || 'مشاور کافئین',
        advisorDetails: result[0].advisor,
      };
    }

    return null;
  },

  async findByPhone(phone: string) {
    const clean = phone.trim();
    const result = await db
      .select()
      .from(students)
      .where(or(eq(students.phone, clean), eq(students.parentPhone, clean)))
      .limit(1);
    return result[0] || null;
  },

  async getAll(options?: { advisorId?: string; limit?: number; offset?: number }) {
    let query = db
      .select({
        student: students,
        advisor: advisors,
      })
      .from(students)
      .leftJoin(advisors, eq(students.advisorId, advisors.id))
      .orderBy(desc(students.createdAt));

    if (options?.advisorId) {
      const rows = await db
        .select({
          student: students,
          advisor: advisors,
        })
        .from(students)
        .leftJoin(advisors, eq(students.advisorId, advisors.id))
        .where(or(eq(students.advisorId, options.advisorId), eq(advisors.legacyId, options.advisorId)))
        .orderBy(desc(students.createdAt));

      return rows.map(({ student, advisor }) => ({
        ...student,
        advisorName: advisor?.name || student.advisorNameSnapshot || 'مشاور کافئین',
        advisorDetails: advisor,
      }));
    }

    const rows = await query;
    return rows.map(({ student, advisor }) => ({
      ...student,
      advisorName: advisor?.name || student.advisorNameSnapshot || 'مشاور کافئین',
      advisorDetails: advisor,
    }));
  },

  async getAtRiskStudents() {
    const rows = await db
      .select({
        student: students,
        advisor: advisors,
      })
      .from(students)
      .leftJoin(advisors, eq(students.advisorId, advisors.id))
      .where(or(eq(students.healthStatus, 'red'), eq(students.healthStatus, 'yellow')));

    return rows.map(({ student, advisor }) => ({
      ...student,
      advisorName: advisor?.name || student.advisorNameSnapshot || 'مشاور کافئین',
    }));
  },

  async create(data: typeof students.$inferInsert) {
    const id = data.id || crypto.randomUUID();
    const [inserted] = await db
      .insert(students)
      .values({ ...data, id, createdAt: new Date(), updatedAt: new Date() })
      .returning();
    return inserted;
  },

  async update(id: string, data: Partial<typeof students.$inferInsert>) {
    const [updated] = await db
      .update(students)
      .set({ ...data, updatedAt: new Date() })
      .where(or(eq(students.id, id), eq(students.legacyId, id)))
      .returning();
    return updated || null;
  }
};


