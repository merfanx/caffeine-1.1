import { eq, or, and } from 'drizzle-orm';
import { db } from '../db/client.js';
import { parents, parentStudents, students } from '../db/schema.js';
import crypto from 'crypto';

export interface ParentStudentLink {
  parentId: string;
  studentId: string;
  relationship: string;
  isPrimary: boolean;
}

export const parentRepository = {
  async findById(id: string) {
    const rows = await db
      .select()
      .from(parents)
      .where(or(eq(parents.id, id), eq(parents.legacyId, id)))
      .limit(1);
    return rows[0] || null;
  },

  async findByUserId(userId: string) {
    const rows = await db
      .select()
      .from(parents)
      .where(eq(parents.userId, userId))
      .limit(1);
    return rows[0] || null;
  },

  async findByPhone(phone: string) {
    const clean = phone.trim();
    const rows = await db
      .select()
      .from(parents)
      .where(eq(parents.phone, clean))
      .limit(1);
    return rows[0] || null;
  },

  /**
   * Verified database check whether a parent user is authorized to access a given student.
   * Performs direct relational verification in PostgreSQL schema with fallback to phone match.
   */
  async isParentLinkedToStudent(
    parentUser: { id: string; phone?: string; childStudentId?: string },
    targetStudentId: string
  ): Promise<boolean> {
    if (!parentUser || !targetStudentId) return false;

    const cleanTargetId = targetStudentId.trim();

    // 1. Direct parent record check by userId
    const parentRow = await this.findByUserId(parentUser.id);
    if (parentRow) {
      // Check primary child link
      if (parentRow.studentId && (parentRow.studentId === cleanTargetId || parentRow.studentId.includes(cleanTargetId))) {
        return true;
      }

      // Check multi-child junction table
      const junctionLinks = await db
        .select()
        .from(parentStudents)
        .where(
          and(
            eq(parentStudents.parentId, parentRow.id),
            eq(parentStudents.studentId, cleanTargetId)
          )
        )
        .limit(1);

      if (junctionLinks.length > 0) {
        return true;
      }
    }

    // 2. Check if parent phone matches student's registered parent_phone in database
    if (parentUser.phone) {
      const studentRows = await db
        .select()
        .from(students)
        .where(
          and(
            or(eq(students.id, cleanTargetId), eq(students.legacyId, cleanTargetId)),
            eq(students.parentPhone, parentUser.phone.trim())
          )
        )
        .limit(1);

      if (studentRows.length > 0) {
        return true;
      }
    }

    // 3. Match verified token childStudentId claim
    if (parentUser.childStudentId) {
      const normChild = parentUser.childStudentId.trim().replace(/^(usr-|std-)/i, '').toLowerCase();
      const normTarget = cleanTargetId.replace(/^(usr-|std-)/i, '').toLowerCase();
      if (normChild && normChild === normTarget) {
        return true;
      }
    }

    return false;
  }
};
