import { Request, Response } from 'express';
import { storageConfig, getStorageHealthReport } from '../config/storage.config.js';
import { storageService, StorageCategory } from '../storage/storageService.js';
import { isPostgresConfigured, checkDatabaseConnection } from '../db/client.js';
import { recordSensitiveAudit } from '../storage/auditLogManager.js';
import { createStructuredBackup, getBackupList, restoreStructuredBackup } from '../storage/backupManager.js';
import path from 'path';
import fs from 'fs';

export const storageController = {
  /**
   * 1. Storage Health & Architecture Diagnostic
   */
  async getHealth(req: Request, res: Response) {
    try {
      const storageReport = getStorageHealthReport();
      const pgHealth = isPostgresConfigured()
        ? await checkDatabaseConnection()
        : { healthy: false, info: 'Not configured / Using file-based storage engine' };

      res.json({
        success: true,
        architecture: {
          principle: 'APPLICATION CODE != USER DATA',
          isolationStatus: 'STRICTLY_SEPARATED',
          storageRoot: storageConfig.storageRoot,
          isReplaceableCodebase: true
        },
        storage: storageReport,
        databases: {
          postgres: {
            configured: isPostgresConfigured(),
            ...pgHealth
          },
          fileDatabase: {
            active: true,
            directory: storageConfig.dataDir
          }
        },
        timestamp: new Date().toISOString()
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  },

  /**
   * 2. Upload file (avatars, attachments, homework, documents)
   */
  async uploadFile(req: Request, res: Response) {
    try {
      const user = req.authUser || { id: 'anonymous', name: 'کاربر ناشناس', role: 'guest' };
      const { category = 'uploads', filename, contentBase64, textContent } = req.body;

      if (!filename || (!contentBase64 && typeof textContent !== 'string')) {
        res.status(400).json({
          success: false,
          message: 'نام فایل و محتوای آن (contentBase64 یا textContent) الزامی است.'
        });
        return;
      }

      const validCategories: StorageCategory[] = ['uploads', 'data', 'logs', 'backups', 'tmp'];
      const targetCategory: StorageCategory = validCategories.includes(category) ? category : 'uploads';

      // Disallow non-admin writing to data/secrets directly via upload
      if ((targetCategory === 'data' || targetCategory === 'secrets') && user.role !== 'admin' && user.role !== 'super_admin') {
        res.status(403).json({ success: false, message: 'دسترسی غیرمجاز به این دسته‌بندی حافظه.' });
        return;
      }

      // Generate sanitized unique filename
      const ext = path.extname(filename).toLowerCase();
      const baseName = path.basename(filename, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
      const safeFilename = `${baseName}_${Date.now()}${ext}`;

      let dataBuffer: Buffer;
      if (contentBase64) {
        dataBuffer = Buffer.from(contentBase64, 'base64');
      } else {
        dataBuffer = Buffer.from(textContent, 'utf8');
      }

      // Size cap: 2MB (2 * 1024 * 1024 bytes)
      const MAX_STORAGE_SIZE = 2 * 1024 * 1024;
      if (dataBuffer.length > MAX_STORAGE_SIZE) {
        res.status(400).json({ success: false, message: 'حجم فایل بیش از حد مجاز است (حداکثر ۲ مگابایت).' });
        return;
      }

      const fileInfo = await storageService.saveFile(targetCategory, safeFilename, dataBuffer);

      recordSensitiveAudit({
        category: 'SECURITY_ACCESS',
        action: 'STORAGE_FILE_UPLOADED',
        userId: user.id,
        userName: user.name,
        userRole: user.role,
        resource: `storage/${targetCategory}/${safeFilename}`,
        details: `آپلود فایل «${safeFilename}» با حجم ${Math.round(fileInfo.sizeBytes / (1024 * 1024))}MB در دسته‌بندی ${targetCategory}`,
        status: 'success',
        severity: 'info'
      });

      res.json({
        success: true,
        message: 'فایل با موفقیت در فضای ذخیره‌سازی ایزوله ذخیره گردید.',
        file: {
          ...fileInfo,
          downloadUrl: `/api/v1/storage/files/${targetCategory}/${safeFilename}`
        }
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  },

  /**
   * 2.1 Direct Binary Stream Upload (Supports up to 2GB images and attachments)
   */
  async uploadStream(req: Request, res: Response) {
    try {
      const user = req.authUser || { id: 'anonymous', name: 'کاربر ناشناس', role: 'guest' };
      const categoryHeader = (req.headers['x-storage-category'] as string) || (req.query.category as string) || 'uploads';
      const rawFilename = (req.headers['x-filename'] as string) || (req.query.filename as string) || `image_${Date.now()}.png`;
      const filename = decodeURIComponent(rawFilename);

      const validCategories: StorageCategory[] = ['uploads', 'data', 'logs', 'backups', 'tmp'];
      const targetCategory: StorageCategory = validCategories.includes(categoryHeader as StorageCategory) ? (categoryHeader as StorageCategory) : 'uploads';

      if ((targetCategory === 'data' || targetCategory === 'secrets') && user.role !== 'admin' && user.role !== 'super_admin') {
        res.status(403).json({ success: false, message: 'دسترسی غیرمجاز به این دسته‌بندی حافظه.' });
        return;
      }

      const ext = path.extname(filename).toLowerCase() || '.png';
      const baseName = path.basename(filename, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
      const safeFilename = `${baseName}_${Date.now()}${ext}`;

      const MAX_2MB = 2 * 1024 * 1024; // 2MB
      const fileInfo = await storageService.saveStream(targetCategory, safeFilename, req, MAX_2MB);

      recordSensitiveAudit({
        category: 'SECURITY_ACCESS',
        action: 'STORAGE_FILE_UPLOADED',
        userId: user.id,
        userName: user.name,
        userRole: user.role,
        resource: `storage/${targetCategory}/${safeFilename}`,
        details: `آپلود تصویر / فایل «${safeFilename}» با حجم ${Math.round(fileInfo.sizeBytes / (1024 * 1024))}MB در دسته‌بندی ${targetCategory}`,
        status: 'success',
        severity: 'info'
      });

      res.json({
        success: true,
        message: 'تصویر با موفقیت در فضای ذخیره‌سازی ذخیره گردید.',
        file: {
          ...fileInfo,
          downloadUrl: `/api/v1/storage/files/${targetCategory}/${safeFilename}`
        }
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  },

  /**
   * 3. Download / Stream File
   */
  async getFile(req: Request, res: Response) {
    try {
      const { category, filename } = req.params;
      const validCategories: StorageCategory[] = ['uploads', 'data', 'logs', 'backups', 'tmp'];

      if (!validCategories.includes(category as StorageCategory)) {
        res.status(400).json({ success: false, message: 'دسته‌بندی نامعتبر است.' });
        return;
      }

      const targetCategory = category as StorageCategory;

      // Access control for sensitive categories
      const user = req.authUser;
      if (targetCategory === 'logs' || targetCategory === 'backups' || targetCategory === 'data') {
        if (!user || (user.role !== 'admin' && user.role !== 'super_admin')) {
          res.status(403).json({ success: false, message: 'دسترسی فقط برای مدیران سیستم مجاز است.' });
          return;
        }
      }

      const fullPath = storageService.resolvePath(targetCategory, filename);
      if (!fs.existsSync(fullPath)) {
        res.status(404).json({ success: false, message: 'فایل مورد نظر یافت نشد.' });
        return;
      }

      res.sendFile(fullPath);
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  },

  /**
   * 4. List Files in Category
   */
  async listCategoryFiles(req: Request, res: Response) {
    try {
      const { category } = req.params;
      const validCategories: StorageCategory[] = ['uploads', 'data', 'logs', 'backups', 'tmp'];

      if (!validCategories.includes(category as StorageCategory)) {
        res.status(400).json({ success: false, message: 'دسته‌بندی نامعتبر است.' });
        return;
      }

      const files = storageService.listFiles(category as StorageCategory);
      res.json({
        success: true,
        category,
        count: files.length,
        files: files.map((f) => ({
          ...f,
          downloadUrl: `/api/v1/storage/files/${category}/${f.filename}`
        }))
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  },

  /**
   * 5. Delete File
   */
  async deleteFile(req: Request, res: Response) {
    try {
      const { category, filename } = req.params;
      const user = req.authUser;

      if (!user || (user.role !== 'admin' && user.role !== 'super_admin')) {
        res.status(403).json({ success: false, message: 'دسترسی حذف فقط برای مدیران سیستم مجاز است.' });
        return;
      }

      const deleted = await storageService.deleteFile(category as StorageCategory, filename);
      if (!deleted) {
        res.status(404).json({ success: false, message: 'فایل یافت نشد.' });
        return;
      }

      res.json({ success: true, message: 'فایل با موفقیت حذف شد.' });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  },

  /**
   * 6. Storage Backups (List, Create, Restore)
   */
  async listBackups(req: Request, res: Response) {
    try {
      const backups = getBackupList();
      res.json({ success: true, count: backups.length, backups });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  },

  async createBackup(req: Request, res: Response) {
    try {
      const user = req.authUser || { id: 'admin', name: 'مدیر سیستم', role: 'admin' };
      const backup = await createStructuredBackup({
        type: 'manual',
        description: req.body.description || 'پشتیبان‌گیری دستی ذخیره‌سازی',
        user
      });
      res.json({ success: true, message: 'پشتیبان با موفقیت ذخیره شد.', backup });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  },

  async restoreBackup(req: Request, res: Response) {
    try {
      const { backupId } = req.params;
      const result = await restoreStructuredBackup(backupId);
      if (!result.success) {
        res.status(400).json({ success: false, message: result.message });
        return;
      }
      res.json({ success: true, message: result.message, count: result.collectionsRestored });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }
};
