import { eq, sql, or } from 'drizzle-orm';
import { db } from '../db/client.js';
import { advisors } from '../db/schema.js';
import crypto from 'crypto';

export const advisorRepository = {
  async findById(id: string) {
    const result = await db.select().from(advisors).where(or(eq(advisors.id, id), eq(advisors.legacyId, id))).limit(1);
    return result[0] || null;
  },

  async findByLegacyId(legacyId: string) {
    const result = await db.select().from(advisors).where(eq(advisors.legacyId, legacyId)).limit(1);
    return result[0] || null;
  },

  async getAll() {
    return db.select().from(advisors);
  },

  async create(data: typeof advisors.$inferInsert) {
    const id = data.id || crypto.randomUUID();
    const [inserted] = await db
      .insert(advisors)
      .values({ ...data, id, createdAt: new Date(), updatedAt: new Date() })
      .returning();
    return inserted;
  },

  async update(id: string, data: Partial<typeof advisors.$inferInsert>) {
    const [updated] = await db
      .update(advisors)
      .set({ ...data, updatedAt: new Date() })
      .where(or(eq(advisors.id, id), eq(advisors.legacyId, id)))
      .returning();
    return updated || null;
  },

  async incrementStudentCount(id: string) {
    await db
      .update(advisors)
      .set({ activeStudentsCount: sql`${advisors.activeStudentsCount} + 1`, updatedAt: new Date() })
      .where(or(eq(advisors.id, id), eq(advisors.legacyId, id)));
  }
};


