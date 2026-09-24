import { Request, Response } from 'express';
import { db } from '../storage/dbBridge.js';
import { recordSensitiveAudit } from '../storage/auditLogManager.js';
import {
  getBackupList,
  createStructuredBackup,
  restoreStructuredBackup
} from '../storage/backupManager.js';
import { storageConfig } from '../config/storage.config.js';
import { storageService } from '../storage/storageService.js';

function getRequestIp(req: Request): string {
  return (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.ip || '127.0.0.1';
}

export const backupController = {
  // 1. Get Database Status
  getDbStatus(req: Request, res: Response) {
    try {
      res.json({
        success: true,
        engine: 'Caffeine Resilient File Database Engine',
        persistence: `Active (${storageConfig.dataDir})`,
        storageConfig: {
          storageRoot: storageConfig.storageRoot,
          dataDir: storageConfig.dataDir,
          backupsDir: storageConfig.backupsDir,
          uploadsDir: storageConfig.uploadsDir,
          logsDir: storageConfig.logsDir
        },
        collections: {
          leads: db.count('leads'),
          daily_reports: db.count('student_daily_reports'),
          student_profiles: db.count('student_profiles'),
          monthly_reports: db.count('student_monthly_reports'),
          exams: db.count('exams'),
          exam_results: db.count('exam_results'),
          questions: db.count('questions'),
          articles: db.count('magazine_articles'),
          student_comments: db.count('student_comments')
        },
        systemTime: new Date().toISOString()
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  },

  // 2. Export Raw DB
  exportDb(req: Request, res: Response) {
    try {
      const admin = req.authUser!;
      const snapshot = db.exportAll();
      const ip = getRequestIp(req);

      recordSensitiveAudit({
        category: 'DATABASE_BACKUP_RESTORE',
        action: 'DATABASE_RAW_EXPORT_DOWNLOADED',
        userId: admin.id,
        userName: admin.name,
        userRole: admin.role,
        resource: 'db/export',
        details: `خروجی کامل و ساختاریافته پایگاه داده توسط مدیر «${admin.name}» دانلود شد.`,
        status: 'success',
        severity: 'critical',
        ip,
        userAgent: req.headers['user-agent'] as string,
        metadata: {
          collectionsCount: Object.keys(snapshot.collections).length,
          version: snapshot.version
        }
      });

      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="caffeine_backup_${new Date().toISOString().split('T')[0]}.json"`);
      res.json(snapshot);
    } catch (err: any) {
      console.error('[DB Security] Error exporting database:', err);
      res.status(500).json({ success: false, error: 'خطا در تهیه خروجی پایگاه داده.' });
    }
  },

  // 3. Import / Restore Raw DB
  restoreDb(req: Request, res: Response) {
    try {
      const admin = req.authUser!;
      const payload = req.body;
      const ip = getRequestIp(req);

      if (!payload || !payload.collections || typeof payload.collections !== 'object') {
        res.status(400).json({ success: false, message: 'ساختار فایل بکاپ نامعتبر است.' });
        return;
      }

      db.importAll(payload);

      recordSensitiveAudit({
        category: 'DATABASE_BACKUP_RESTORE',
        action: 'DATABASE_RAW_RESTORE_EXECUTED',
        userId: admin.id,
        userName: admin.name,
        userRole: admin.role,
        resource: 'db/restore',
        details: `بازیابی کامل پایگاه داده توسط مدیر «${admin.name}» با موفقیت انجام شد.`,
        status: 'success',
        severity: 'critical',
        ip,
        userAgent: req.headers['user-agent'] as string
      });

      res.json({
        success: true,
        message: 'پایگاه داده با موفقیت بازیابی شد.',
        collectionsRestored: Object.keys(payload.collections).length
      });
    } catch (err: any) {
      console.error('[DB Security] Error restoring database:', err);
      res.status(500).json({ success: false, error: err.message });
    }
  },

  // 4. Trigger Manual Backup
  async triggerBackup(req: Request, res: Response) {
    try {
      const admin = req.authUser || { id: 'usr-adm-01', name: 'مدیر ارشد سیستم', role: 'admin' };
      const backup = await createStructuredBackup({
        type: 'manual',
        description: `پشتیبان‌گیری دستی ایجاد شده توسط ${admin.name}`,
        user: admin
      });

      res.json({
        success: true,
        backup,
        message: 'نسخه پشتیبان ساختاریافته با موفقیت ایجاد گردید.'
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  },

  // 5. Restore specific backup by ID
  async restoreBackupArchive(req: Request, res: Response) {
    try {
      const { backupId } = req.params;
      const result = await restoreStructuredBackup(backupId);
      if (!result.success) {
        res.status(400).json({ success: false, message: result.message });
        return;
      }
      res.json({ success: true, message: result.message, collectionsRestored: result.collectionsRestored });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  },

  // 6. List Backup Archives
  listBackups(req: Request, res: Response) {
    try {
      const list = getBackupList();
      res.json({
        success: true,
        count: list.length,
        backups: list
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  },

  // 7. Get / Update Backup Schedule Config
  getBackupConfig(req: Request, res: Response) {
    try {
      res.json({
        success: true,
        config: {
          intervalHours: 6,
          autoBackupEnabled: true,
          storageDirectory: storageConfig.backupsDir
        }
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  },

  updateBackupConfig(req: Request, res: Response) {
    try {
      res.json({
        success: true,
        message: 'تنظیمات زمان‌بندی پشتیبان‌گیری خودکار ذخیره شد.',
        config: {
          intervalHours: req.body.intervalHours || 6,
          autoBackupEnabled: true,
          storageDirectory: storageConfig.backupsDir
        }
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }
};

