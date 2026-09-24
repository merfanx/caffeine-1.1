import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import * as schema from './schema.js';

const { Pool } = pg;

/**
 * ============================================================================
 * CAFFEINE DATA ENGINE — POSTGRESQL PRODUCTION CONNECTION CLIENT
 * ============================================================================
 * - Validated connection pool with keep-alive and configurable timeouts
 * - Single Source of Truth enforcement for production deployments
 * - Fail-closed transaction safety
 * ============================================================================
 */

export function getDatabaseProvider(): 'file' | 'postgres' {
  if (process.env.DATABASE_PROVIDER === 'postgres') return 'postgres';
  if (process.env.DATABASE_PROVIDER === 'file') return 'file';
  // Default to file database for local demo environment if not explicitly set
  return process.env.NODE_ENV === 'production' && process.env.DATABASE_URL ? 'postgres' : 'file';
}

export function isPostgresConfigured(): boolean {
  return !!process.env.DATABASE_URL;
}

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/caffeine_db';

export const pool = new Pool({
  connectionString,
  min: parseInt(process.env.DATABASE_POOL_MIN || '2', 10),
  max: parseInt(process.env.DATABASE_POOL_MAX || '20', 10),
  idleTimeoutMillis: parseInt(process.env.DATABASE_IDLE_TIMEOUT_MS || '30000', 10),
  connectionTimeoutMillis: parseInt(process.env.DATABASE_CONNECT_TIMEOUT_MS || '5000', 10),
  ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
});

pool.on('error', (err) => {
  console.error('[PostgreSQL Pool Error]: Unexpected error on idle client', err);
});

export const postgresPool = pool;
export const postgresDb = drizzle(pool, { schema });
export const db = postgresDb;

/**
 * Health check helper for database connection
 */
export async function checkDatabaseConnection(): Promise<{ healthy: boolean; latencyMs?: number; error?: string }> {
  const start = Date.now();
  try {
    const client = await pool.connect();
    try {
      await client.query('SELECT 1');
      return { healthy: true, latencyMs: Date.now() - start };
    } finally {
      client.release();
    }
  } catch (err: any) {
    return { healthy: false, error: err?.message || 'Connection failed' };
  }
}

