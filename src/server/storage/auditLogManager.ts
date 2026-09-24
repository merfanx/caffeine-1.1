import { db } from './dbBridge.js';
import { storageService } from './storageService.js';

export type AuditCategory =
  | 'AUTH_LOGIN'
  | 'FAILED_LOGIN'
  | 'SECURITY_ACCESS'
  | 'STUDENT_ACCESS'
  | 'DATABASE_BACKUP_RESTORE'
  | 'SETTINGS_CHANGE'
  | 'API_REQUEST'
  | 'REPORT_CARD_STATUS'
  | 'DATA_EXPORT';

export type AuditSeverity = 'info' | 'warning' | 'critical';

export interface SensitiveAuditEntry {
  id: string;
  category: string;
  action: string;
  userId?: string;
  userName?: string;
  userRole?: string;
  resource?: string;
  details?: string;
  status?: 'success' | 'failed' | 'denied';
  severity?: AuditSeverity;
  ip?: string;
  userAgent?: string;
  metadata?: any;
  timestamp: string;
  isoDate: string;
}

export type AuditLogEntry = SensitiveAuditEntry;

const COL_AUDIT_LOGS = 'audit_logs';

const DISALLOWED_METADATA_KEYS = new Set([
  'actorid',
  'actorrole',
  'isadmin',
  'privilege',
  'userid',
  'userrole',
  'role'
]);

export function redactSecretsFromString(text: string): string {
  if (!text || typeof text !== 'string') return '';
  return text
    .replace(/Bearer\s+[A-Za-z0-9-_.]+/gi, 'Bearer [REDACTED_JWT_TOKEN]')
    .replace(/(password|passwd|pwd)\s*[:=]\s*["']?([^"',\s]+)["']?/gi, 'password="***REDACTED***"')
    .replace(/(pin|pincode)\s*[:=]\s*["']?([^"',\s]+)["']?/gi, 'pin=***REDACTED***')
    .replace(/(?:secret|token|apiKey|api_key|auth_token)\s*[:=]\s*["']?([^"',\s]+)["']?/gi, '$1: ***REDACTED***')
    .replace(/\b(09\d{9})\b/g, (m) => m.slice(0, 4) + '***' + m.slice(-4));
}

export function redactSecretsFromMetadata(meta: any): any {
  if (!meta || typeof meta !== 'object') return meta;
  if (Array.isArray(meta)) {
    return meta.map((item) => redactSecretsFromMetadata(item));
  }
  const cloned: Record<string, any> = {};
  for (const [key, value] of Object.entries(meta)) {
    const lowerKey = key.toLowerCase();
    if (DISALLOWED_METADATA_KEYS.has(lowerKey)) {
      // Disallowed privilege / spoofed keys dropped
      continue;
    }
    if (
      lowerKey.includes('password') ||
      lowerKey.includes('secret') ||
      lowerKey.includes('pin') ||
      lowerKey.includes('token') ||
      lowerKey.includes('apikey') ||
      lowerKey.includes('credential')
    ) {
      cloned[key] = '***REDACTED***';
    } else if (typeof value === 'string') {
      cloned[key] = redactSecretsFromString(value);
    } else if (typeof value === 'object' && value !== null) {
      cloned[key] = redactSecretsFromMetadata(value);
    } else {
      cloned[key] = value;
    }
  }
  return cloned;
}

export function recordSensitiveAudit(
  entry: Omit<SensitiveAuditEntry, 'id' | 'timestamp' | 'isoDate'> & { id?: string; timestamp?: string; isoDate?: string }
): SensitiveAuditEntry {
  const now = new Date();
  const isoString = now.toISOString();

  const record: SensitiveAuditEntry = {
    id: entry.id || `audit-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
    category: entry.category,
    action: entry.action,
    userId: entry.userId || 'anonymous_user',
    userName: entry.userName || 'کاربر سیستم',
    userRole: entry.userRole || 'anonymous',
    resource: entry.resource,
    details: entry.details ? redactSecretsFromString(entry.details) : undefined,
    status: entry.status || 'success',
    severity: entry.severity || 'info',
    ip: entry.ip || '127.0.0.1',
    userAgent: entry.userAgent,
    metadata: entry.metadata ? redactSecretsFromMetadata(entry.metadata) : undefined,
    timestamp: isoString,
    isoDate: isoString
  };

  try {
    db.insert(COL_AUDIT_LOGS, record);
    storageService.appendLog('audit', record);
  } catch (err) {
    console.warn('[AuditLogManager] Failed persisting audit record:', err);
  }

  return record;
}

export interface QueryAuditResult {
  logs: SensitiveAuditEntry[];
  total: number;
  filtered: number;
}

export function queryAuditLogs(filter?: { category?: string; userId?: string; limit?: number }): QueryAuditResult & SensitiveAuditEntry[] {
  const allLogs = db.find<SensitiveAuditEntry>(COL_AUDIT_LOGS) || [];
  let filtered = allLogs;
  if (filter?.category) {
    filtered = filtered.filter((l) => l.category === filter.category);
  }
  if (filter?.userId) {
    filtered = filtered.filter((l) => l.userId === filter.userId);
  }
  const limit = filter?.limit || 100;
  const sliced = filtered.slice(-limit).reverse();

  const result: any = [...sliced];
  result.logs = sliced;
  result.total = allLogs.length;
  result.filtered = filtered.length;

  return result;
}

export function getAuditStats() {
  const logs = db.find<SensitiveAuditEntry>(COL_AUDIT_LOGS) || [];
  const criticalCount = logs.filter((l) => l.severity === 'critical').length;
  const warningCount = logs.filter((l) => l.severity === 'warning').length;
  const infoCount = logs.filter((l) => l.severity === 'info' || !l.severity).length;
  return {
    total: logs.length,
    totalEvents: logs.length,
    criticalCount,
    warningCount,
    infoCount
  };
}

export const auditLogManager = {
  record: recordSensitiveAudit,
  queryAuditLogs,
  getAuditStats,
  getLogs(limit = 100): SensitiveAuditEntry[] {
    return queryAuditLogs({ limit });
  }
};
