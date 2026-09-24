import { Request, Response } from 'express';
import {
  ambientAudioManager,
  AmbientSoundItem,
  AmbientPresetItem,
  DEFAULT_AMBIENT_SOUNDS,
  DEFAULT_AMBIENT_PRESETS
} from '../storage/ambientAudioManager.js';
import { recordSensitiveAudit } from '../storage/auditLogManager.js';

export const ambientController = {
  /**
   * 1. Get All Sounds (Available to both students and admins)
   */
  async getSounds(req: Request, res: Response) {
    try {
      const includeInactive = req.query.all === 'true' || (req.authUser && (req.authUser.role === 'admin' || req.authUser.role === 'super_admin'));
      const sounds = ambientAudioManager.getAllSounds(Boolean(includeInactive));
      res.json({
        success: true,
        count: sounds.length,
        sounds
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  },

  /**
   * 2. Save / Update Sound Metadata (Admin only)
   */
  async saveSound(req: Request, res: Response) {
    try {
      const user = req.authUser || { id: 'admin', name: 'مدیر سیستم', role: 'admin' };
      const { id, name, category, iconName, symbol, description, defaultVolume, localPath, isActive, isCustom } = req.body;

      if (!name || !localPath) {
        res.status(400).json({
          success: false,
          message: 'عنوان صدا و مسیر فایل صوتی الزامی است.'
        });
        return;
      }

      const soundId = id || `sound_${Date.now()}`;
      const soundData: AmbientSoundItem = {
        id: soundId,
        name: String(name).trim(),
        category: category || 'custom',
        iconName: iconName || 'Sparkles',
        symbol: symbol || '🎵',
        description: description ? String(description).trim() : '',
        defaultVolume: typeof defaultVolume === 'number' ? Math.max(0, Math.min(100, defaultVolume)) : 50,
        localPath: String(localPath).trim(),
        isActive: isActive !== undefined ? Boolean(isActive) : true,
        isCustom: isCustom !== undefined ? Boolean(isCustom) : true
      };

      const saved = ambientAudioManager.saveSound(soundData);

      recordSensitiveAudit({
        category: 'SYSTEM_CONFIG',
        action: 'AMBIENT_SOUND_SAVED',
        userId: user.id,
        userName: user.name,
        userRole: user.role,
        resource: `ambient/sound/${soundId}`,
        details: `ذخیره متادیتای صدای محیطی «${soundData.name}» (${soundData.category})`,
        status: 'success',
        severity: 'info'
      });

      res.json({
        success: true,
        message: 'صدای محیطی با موفقیت ذخیره گردید.',
        sound: saved
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  },

  /**
   * 3. Upload Audio File (Admin only)
   * Accepts JSON body with base64 content or direct upload
   */
  async uploadSound(req: Request, res: Response) {
    try {
      const user = req.authUser || { id: 'admin', name: 'مدیر سیستم', role: 'admin' };
      const {
        filename,
        contentBase64,
        name,
        category = 'focus',
        iconName = 'Sparkles',
        symbol = '🎵',
        description = '',
        defaultVolume = 50
      } = req.body;

      if (!filename || !contentBase64) {
        res.status(400).json({
          success: false,
          message: 'فایل صوتی و نام فایل الزامی است.'
        });
        return;
      }

      // Validate allowed extensions
      const lower = filename.toLowerCase();
      const validExtensions = ['.mp3', '.wav', '.ogg', '.m4a', '.aac', '.webm', '.flac'];
      const hasValidExt = validExtensions.some((ext) => lower.endsWith(ext));
      if (!hasValidExt) {
        res.status(400).json({
          success: false,
          message: 'فرمت فایل معتبر نیست. لطفاً فایلی با پسوند mp3, wav, ogg, m4a یا aac انتخاب کنید.'
        });
        return;
      }

      const buffer = Buffer.from(contentBase64, 'base64');
      const MAX_SIZE = 25 * 1024 * 1024; // 25MB max audio file
      if (buffer.length > MAX_SIZE) {
        res.status(400).json({
          success: false,
          message: 'حجم فایل صوتی بیش از حد مجاز است (حداکثر ۲۵ مگابایت).'
        });
        return;
      }

      const { localPath, sizeBytes } = ambientAudioManager.saveAudioFile(filename, buffer);

      const soundId = `snd_${Date.now()}`;
      const title = name ? String(name).trim() : filename.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');

      const newSound: AmbientSoundItem = {
        id: soundId,
        name: title,
        category,
        iconName,
        symbol,
        description: description || `فایل صوتی آپلود شده توسط مدیر (${Math.round(sizeBytes / 1024)} KB)`,
        defaultVolume: Number(defaultVolume) || 50,
        localPath,
        isActive: true,
        isCustom: true,
        fileSizeBytes: sizeBytes,
        createdAt: new Date().toISOString()
      };

      const saved = ambientAudioManager.saveSound(newSound);

      recordSensitiveAudit({
        category: 'STORAGE_FILE_UPLOADED',
        action: 'AMBIENT_SOUND_UPLOADED',
        userId: user.id,
        userName: user.name,
        userRole: user.role,
        resource: localPath,
        details: `آپلود صدای جدید «${title}» با حجم ${Math.round(sizeBytes / 1024)} کیلوبایت`,
        status: 'success',
        severity: 'info'
      });

      res.json({
        success: true,
        message: 'فایل صوتی با موفقیت در سرور آپلود و در کاتالوگ ثبت گردید.',
        sound: saved
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  },

  /**
   * 4. Delete Sound (Admin only)
   */
  async deleteSound(req: Request, res: Response) {
    try {
      const user = req.authUser || { id: 'admin', name: 'مدیر سیستم', role: 'admin' };
      const { id } = req.params;

      const sound = ambientAudioManager.getSoundById(id);
      if (!sound) {
        res.status(404).json({ success: false, message: 'صدای مورد نظر یافت نشد.' });
        return;
      }

      const deleted = ambientAudioManager.deleteSound(id);

      recordSensitiveAudit({
        category: 'SYSTEM_CONFIG',
        action: 'AMBIENT_SOUND_DELETED',
        userId: user.id,
        userName: user.name,
        userRole: user.role,
        resource: `ambient/sound/${id}`,
        details: `حذف / غیرفعال‌سازی صدای «${sound.name}»`,
        status: 'success',
        severity: 'info'
      });

      res.json({
        success: true,
        message: sound.isCustom ? 'صدای سفارشی با موفقیت حذف گردید.' : 'صدای سیستمی غیرفعال گردید.'
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  },

  /**
   * 5. Get All Presets (Available to both students and admins)
   */
  async getPresets(req: Request, res: Response) {
    try {
      const includeInactive = req.query.all === 'true' || (req.authUser && (req.authUser.role === 'admin' || req.authUser.role === 'super_admin'));
      const presets = ambientAudioManager.getAllPresets(Boolean(includeInactive));
      res.json({
        success: true,
        count: presets.length,
        presets
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  },

  /**
   * 6. Save / Update Preset (Admin only)
   */
  async savePreset(req: Request, res: Response) {
    try {
      const user = req.authUser || { id: 'admin', name: 'مدیر سیستم', role: 'admin' };
      const { id, name, icon, description, volumes, isActive, isDefault } = req.body;

      if (!name || !volumes || typeof volumes !== 'object') {
        res.status(400).json({
          success: false,
          message: 'عنوان ترکیب و مقادیر لایه‌های صوتی (volumes) الزامی است.'
        });
        return;
      }

      const presetId = id || `preset_${Date.now()}`;
      const presetData: AmbientPresetItem = {
        id: presetId,
        name: String(name).trim(),
        icon: icon || '🎧⚡',
        description: description ? String(description).trim() : '',
        volumes,
        isActive: isActive !== undefined ? Boolean(isActive) : true,
        isDefault: isDefault !== undefined ? Boolean(isDefault) : false
      };

      const saved = ambientAudioManager.savePreset(presetData);

      recordSensitiveAudit({
        category: 'SYSTEM_CONFIG',
        action: 'AMBIENT_PRESET_SAVED',
        userId: user.id,
        userName: user.name,
        userRole: user.role,
        resource: `ambient/preset/${presetId}`,
        details: `ذخیره ترکیب پیشنهادی «${presetData.name}» با ${Object.keys(volumes).length} لایه صوتی`,
        status: 'success',
        severity: 'info'
      });

      res.json({
        success: true,
        message: 'ترکیب پیشنهادی با موفقیت ذخیره گردید.',
        preset: saved
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  },

  /**
   * 7. Delete Preset (Admin only)
   */
  async deletePreset(req: Request, res: Response) {
    try {
      const user = req.authUser || { id: 'admin', name: 'مدیر سیستم', role: 'admin' };
      const { id } = req.params;

      const preset = ambientAudioManager.getPresetById(id);
      if (!preset) {
        res.status(404).json({ success: false, message: 'ترکیب مورد نظر یافت نشد.' });
        return;
      }

      ambientAudioManager.deletePreset(id);

      recordSensitiveAudit({
        category: 'SYSTEM_CONFIG',
        action: 'AMBIENT_PRESET_DELETED',
        userId: user.id,
        userName: user.name,
        userRole: user.role,
        resource: `ambient/preset/${id}`,
        details: `حذف ترکیب پیشنهادی «${preset.name}»`,
        status: 'success',
        severity: 'info'
      });

      res.json({
        success: true,
        message: 'ترکیب پیشنهادی با موفقیت حذف گردید.'
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  },

  /**
   * 8. Reset to Factory Defaults
   */
  async resetDefaults(req: Request, res: Response) {
    try {
      const user = req.authUser || { id: 'admin', name: 'مدیر سیستم', role: 'admin' };
      const result = ambientAudioManager.resetToDefaults();

      recordSensitiveAudit({
        category: 'SYSTEM_CONFIG',
        action: 'AMBIENT_AUDIO_RESET',
        userId: user.id,
        userName: user.name,
        userRole: user.role,
        resource: 'ambient/all',
        details: 'بازنشانی کاتالوگ صداها و ترکیب‌های پیشنهادی به حالت کارخانه',
        status: 'success',
        severity: 'warn'
      });

      res.json({
        success: true,
        message: 'کاتالوگ صداها و ترکیب‌های پیشنهادی با موفقیت به مقادیر پیش‌فرض کارخانه بازنشانی شد.',
        sounds: result.sounds,
        presets: result.presets
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }
};
