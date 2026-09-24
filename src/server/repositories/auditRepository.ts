import { eq, desc, and, count } from 'drizzle-orm';
import { db, isPostgresConfigured, getDatabaseProvider } from '../db/client.js';
import { auditLogs, systemSettings } from '../db/schema.js';
import crypto from 'crypto';

export interface AuditLogInsertEntry {
  actorUserId?: string;
  actorRole?: string;
  actorName?: string;
  action: string;
  entityType?: string;
  entityId?: string;
  ipAddress?: string;
  userAgent?: string;
  sensitiveCategory?: string;
  status?: string;
  details?: any;
}

export const auditRepository = {
  /**
   * Log an audit event asynchronously into PostgreSQL (Append-Only)
   */
  async log(entry: AuditLogInsertEntry) {
    if (!isPostgresConfigured() || getDatabaseProvider() !== 'postgres') {
      return null;
    }
    try {
      const id = crypto.randomUUID();
      const [saved] = await db
        .insert(auditLogs)
        .values({
          ...entry,
          id,
          createdAt: new Date(),
        })
        .returning();
      return saved;
    } catch (err: any) {
      console.warn('[AuditLog Engine] Non-blocking Postgres audit notice:', err?.message || err);
      return null;
    }
  },

  /**
   * Log an audit event inside a specific active database transaction
   * Ensures business operation and corresponding audit event commit or rollback together
   */
  async logTransactional(tx: any, entry: AuditLogInsertEntry) {
    if (!tx || !isPostgresConfigured() || getDatabaseProvider() !== 'postgres') {
      return null;
    }
    try {
      const id = crypto.randomUUID();
      const [saved] = await tx
        .insert(auditLogs)
        .values({
          ...entry,
          id,
          createdAt: new Date(),
        })
        .returning();
      return saved;
    } catch (err) {
      console.error('[AuditLog Engine] Transactional audit log error:', err);
      throw err; // Re-throw in transaction to ensure integrity
    }
  },

  /**
   * Retrieve audit logs with strict filtering, pagination, and sorting (DESC)
   */
  async getLogs(options: {
    actorRole?: string;
    actorUserId?: string;
    sensitiveCategory?: string;
    action?: string;
    limit?: number;
    offset?: number;
  } = {}) {
    if (!isPostgresConfigured() || getDatabaseProvider() !== 'postgres') {
      return [];
    }
    try {
      const { actorRole, actorUserId, sensitiveCategory, action, limit = 50, offset = 0 } = options;
      const conditions = [];

      if (actorRole) conditions.push(eq(auditLogs.actorRole, actorRole));
      if (actorUserId) conditions.push(eq(auditLogs.actorUserId, actorUserId));
      if (sensitiveCategory) conditions.push(eq(auditLogs.sensitiveCategory, sensitiveCategory));
      if (action) conditions.push(eq(auditLogs.action, action));

      if (conditions.length > 0) {
        return await db
          .select()
          .from(auditLogs)
          .where(and(...conditions))
          .orderBy(desc(auditLogs.createdAt))
          .limit(limit)
          .offset(offset);
      }

      return await db
        .select()
        .from(auditLogs)
        .orderBy(desc(auditLogs.createdAt))
        .limit(limit)
        .offset(offset);
    } catch (err: any) {
      console.warn('[AuditLog Engine] Postgres getLogs notice:', err?.message || err);
      return [];
    }
  },

  /**
   * Count total logs matching filters
   */
  async countLogs(options: { actorRole?: string; sensitiveCategory?: string } = {}) {
    if (!isPostgresConfigured() || getDatabaseProvider() !== 'postgres') {
      return 0;
    }
    try {
      const { actorRole, sensitiveCategory } = options;
      const conditions = [];
      if (actorRole) conditions.push(eq(auditLogs.actorRole, actorRole));
      if (sensitiveCategory) conditions.push(eq(auditLogs.sensitiveCategory, sensitiveCategory));

      const query = conditions.length > 0
        ? db.select({ value: count() }).from(auditLogs).where(and(...conditions))
        : db.select({ value: count() }).from(auditLogs);

      const res = await query;
      return Number(res[0]?.value || 0);
    } catch (err: any) {
      console.warn('[AuditLog Engine] Postgres countLogs notice:', err?.message || err);
      return 0;
    }
  }
};

export const settingsRepository = {
  async getSetting<T = any>(key: string): Promise<T | null> {
    const rows = await db.select().from(systemSettings).where(eq(systemSettings.key, key)).limit(1);
    if (!rows[0]) return null;
    return rows[0].value as T;
  },

  async setSetting(key: string, value: any, description?: string) {
    const rows = await db.select().from(systemSettings).where(eq(systemSettings.key, key)).limit(1);
    if (rows[0]) {
      const [updated] = await db
        .update(systemSettings)
        .set({
          value,
          description: description || rows[0].description,
          updatedAt: new Date(),
        })
        .where(eq(systemSettings.key, key))
        .returning();
      return updated;
    }

    const [inserted] = await db
      .insert(systemSettings)
      .values({
        id: crypto.randomUUID(),
        key,
        value,
        description,
        updatedAt: new Date(),
      })
      .returning();
    return inserted;
  },

  async getAllSettings() {
    return db.select().from(systemSettings);
  }
};


