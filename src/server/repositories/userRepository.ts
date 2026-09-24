import { eq, or, sql } from 'drizzle-orm';
import { db } from '../db/client.js';
import { users } from '../db/schema.js';
import crypto from 'crypto';

export interface CreateUserInput {
  id?: string;
  legacyId?: string;
  username: string;
  fullName: string;
  role: string;
  phone?: string;
  email?: string;
  passwordHash?: string;
  pinHash?: string;
}

export const userRepository = {
  async findById(id: string) {
    const result = await db.select().from(users).where(or(eq(users.id, id), eq(users.legacyId, id))).limit(1);
    return result[0] || null;
  },

  async findByUsername(username: string) {
    const clean = username.trim();
    const result = await db.select().from(users).where(eq(users.username, clean)).limit(1);
    return result[0] || null;
  },

  async findByLegacyId(legacyId: string) {
    const result = await db.select().from(users).where(eq(users.legacyId, legacyId)).limit(1);
    return result[0] || null;
  },

  async findByUsernameOrPhone(identifier: string) {
    const clean = identifier.trim();
    const result = await db
      .select()
      .from(users)
      .where(or(eq(users.username, clean), eq(users.phone, clean)))
      .limit(1);
    return result[0] || null;
  },

  async getAll(role?: string) {
    if (role) {
      return db.select().from(users).where(eq(users.role, role));
    }
    return db.select().from(users);
  },

  async create(input: CreateUserInput) {
    const id = input.id || crypto.randomUUID();
    const [inserted] = await db
      .insert(users)
      .values({
        id,
        legacyId: input.legacyId,
        username: input.username,
        fullName: input.fullName,
        role: input.role,
        phone: input.phone,
        email: input.email,
        passwordHash: input.passwordHash,
        pinHash: input.pinHash,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();
    return inserted;
  },

  async updatePin(id: string, pinHash: string) {
    const [updated] = await db
      .update(users)
      .set({
        pinHash,
        updatedAt: new Date(),
      })
      .where(or(eq(users.id, id), eq(users.legacyId, id)))
      .returning();
    return updated || null;
  },

  async updatePassword(id: string, passwordHash: string) {
    const [updated] = await db
      .update(users)
      .set({
        passwordHash,
        lastPasswordChange: new Date(),
        updatedAt: new Date(),
      })
      .where(or(eq(users.id, id), eq(users.legacyId, id)))
      .returning();
    return updated || null;
  },

  async recordFailedLogin(id: string) {
    await db
      .update(users)
      .set({
        failedLoginAttempts: sql`${users.failedLoginAttempts} + 1`,
        updatedAt: new Date(),
      })
      .where(or(eq(users.id, id), eq(users.legacyId, id)));
  },

  async resetFailedLogins(id: string) {
    await db
      .update(users)
      .set({
        failedLoginAttempts: 0,
        updatedAt: new Date(),
      })
      .where(or(eq(users.id, id), eq(users.legacyId, id)));
  },

  async updateLockout(id: string, isLocked: boolean, lockoutExpiresAt?: Date) {
    await db
      .update(users)
      .set({
        failedLoginAttempts: isLocked ? sql`${users.failedLoginAttempts}` : 0,
        updatedAt: new Date(),
      })
      .where(or(eq(users.id, id), eq(users.legacyId, id)));
  },

  async updateLastLogin(id: string) {
    await db
      .update(users)
      .set({
        updatedAt: new Date(),
      })
      .where(or(eq(users.id, id), eq(users.legacyId, id)));
  }
};


