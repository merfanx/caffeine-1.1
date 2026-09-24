import { db } from '../storage/dbBridge.js';
import { recordSensitiveAudit } from '../storage/auditLogManager.js';
import { storageService } from './storageService.js';

export interface BackupArchiveEntry {
  id: string;
  type: 'manual' | 'automated';
  description: string;
  createdAt: string;
  sizeBytes?: number;
  collectionsCount: number;
  user?: { id?: string; name?: string; role?: string };
}

const COL_BACKUPS = 'backup_history';

export function getBackupList(): BackupArchiveEntry[] {
  return db.find<BackupArchiveEntry>(COL_BACKUPS) || [];
}

export async function createStructuredBackup(options: {
  type: 'manual' | 'automated';
  description?: string;
  user?: { id?: string; name?: string; role?: string };
}): Promise<BackupArchiveEntry> {
  const snapshot = db.exportAll();
  const collectionsCount = Object.keys(snapshot.collections).length;
  const snapshotPayload = JSON.stringify(snapshot, null, 2);
  const sizeBytes = Buffer.byteLength(snapshotPayload, 'utf8');

  const entry: BackupArchiveEntry = {
    id: `backup-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
    type: options.type,
    description: options.description || 'پشتیبان‌گیری ساختاریافته پایگاه داده',
    createdAt: new Date().toISOString(),
    sizeBytes,
    collectionsCount,
    user: options.user
  };

  // 1. Save dump file into isolated backups storage
  try {
    await storageService.saveFile('backups', `${entry.id}.json`, snapshotPayload);
  } catch (err) {
    console.warn('[BackupManager] Could not save snapshot file to storage:', err);
  }

  // 2. Index in database history
  db.insert(COL_BACKUPS, entry);

  recordSensitiveAudit({
    category: 'DATABASE_BACKUP_RESTORE',
    action: 'BACKUP_STRUCTURED_CREATED',
    userId: options.user?.id || 'system',
    userName: options.user?.name || 'موتور پشتیبان‌گیری',
    userRole: options.user?.role || 'system',
    resource: 'backup/create',
    details: `ایجاد نسخه پشتیبان ساختاریافته «${entry.id}» با حجم تقریبی ${Math.round(sizeBytes / 1024)} کیلوبایت.`,
    status: 'success',
    severity: 'info'
  });

  return entry;
}

export async function restoreStructuredBackup(backupId: string): Promise<{ success: boolean; message: string; collectionsRestored?: number }> {
  try {
    const raw = await storageService.readFile('backups', `${backupId}.json`, 'utf8');
    const parsed = JSON.parse(raw as string);

    if (!parsed || !parsed.collections) {
      return { success: false, message: 'فایل پشتیبان نامعتبر است.' };
    }

    const imported = db.importAll(parsed);
    if (!imported) {
      return { success: false, message: 'خطا در بازیابی اطلاعات در پایگاه داده.' };
    }

    const count = Object.keys(parsed.collections).length;
    return {
      success: true,
      message: `نسخه پشتیبان با موفقیت بازیابی شد (${count} مجموعه داده).`,
      collectionsRestored: count
    };
  } catch (err: any) {
    return { success: false, message: `خطا در بازگردانی نسخه پشتیبان: ${err.message}` };
  }
}
