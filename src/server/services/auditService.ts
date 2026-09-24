import {
  recordSensitiveAudit,
  queryAuditLogs,
  getAuditStats,
  redactSecretsFromMetadata,
  SensitiveAuditEntry,
  AuditLogEntry,
  AuditSeverity
} from '../storage/auditLogManager.js';
import { db } from '../storage/dbBridge.js';

export function sanitizeAuditMetadata(meta: any): any {
  return redactSecretsFromMetadata(meta);
}

export const auditService = {
  recordAudit(entry: Parameters<typeof recordSensitiveAudit>[0]) {
    return recordSensitiveAudit(entry);
  },
  record(actor: any, details: any) {
    return recordSensitiveAudit({
      ...details,
      userId: actor?.id || actor?.userId || 'anonymous_user',
      userRole: actor?.role || 'anonymous',
      userName: actor?.name || 'کاربر ناشناس',
      ip: details?.ip || actor?.ip || '127.0.0.1'
    });
  },
  recordSecurityEvent(actor: any, details: any) {
    return recordSensitiveAudit({
      category: 'FAILED_LOGIN',
      status: 'denied',
      severity: details?.severity || 'warning',
      action: details?.action || 'SECURITY_EVENT',
      resource: details?.resource || 'system/security',
      details: details?.details || '',
      userId: actor?.id || actor?.userId || 'anonymous_user',
      userRole: actor?.role || 'anonymous',
      userName: actor?.name || 'کاربر ناشناس',
      ip: details?.ip || actor?.ip || '127.0.0.1',
      metadata: details?.metadata
    });
  },
  recordBusinessEvent(actor: any, details: any) {
    return recordSensitiveAudit({
      category: details?.category || 'DATA_EXPORT',
      status: 'success',
      severity: details?.severity || 'info',
      action: details?.action || 'BUSINESS_EVENT',
      resource: details?.resource || 'system/business',
      details: details?.details || '',
      userId: actor?.id || actor?.userId || 'system',
      userRole: actor?.role || 'admin',
      userName: actor?.name || 'مدیر سیستم',
      ip: details?.ip || actor?.ip || '127.0.0.1',
      metadata: details?.metadata
    });
  },
  getRecentLogs(limit = 100): SensitiveAuditEntry[] {
    const res = queryAuditLogs({ limit });
    return (res as any).logs || res;
  },
  queryLogs(filter?: { category?: string; userId?: string; limit?: number }): SensitiveAuditEntry[] {
    const res = queryAuditLogs(filter);
    return (res as any).logs || res;
  },
  getStats() {
    return getAuditStats();
  },
  sanitizeAuditMetadata
};
