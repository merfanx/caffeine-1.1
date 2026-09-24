import fs from 'fs';
import path from 'path';
import { FileDatabase } from './fileDatabase.js';

export interface AmbientSoundItem {
  id: string;
  name: string;
  category: 'focus' | 'nature' | 'cafe' | 'meditation' | 'noise' | 'custom' | string;
  iconName: string;
  symbol: string;
  description: string;
  defaultVolume: number;
  localPath: string;
  isActive?: boolean;
  isCustom?: boolean;
  createdAt?: string;
  fileSizeBytes?: number;
}

export interface AmbientPresetItem {
  id: string;
  name: string;
  icon: string;
  description: string;
  volumes: Record<string, number>;
  isActive?: boolean;
  isDefault?: boolean;
  createdAt?: string;
}

export const DEFAULT_AMBIENT_SOUNDS: AmbientSoundItem[] = [
  {
    id: "gamma",
    name: "امواج گاما ۴۰Hz (اوج تمرکز تست‌زنی)",
    category: "focus",
    iconName: "Brain",
    symbol: "🧠",
    description: "فرکانس هارمونیک دوگوشی ۴۰ هرتز گاما جهت بیشینه‌سازی پردازش ذهنی و حل تست",
    defaultVolume: 40,
    localPath: "/sounds/gamma.mp3",
    isActive: true,
    isCustom: false
  },
  {
    id: "alpha",
    name: "امواج آلفا ۱۰Hz (آرامش و تمرکز روان)",
    category: "focus",
    iconName: "Sparkles",
    symbol: "✨",
    description: "فرکانس آرام‌کننده امواج آلفا برای کاهش استرس مطالعه و افزایش یادگیری عمیق",
    defaultVolume: 40,
    localPath: "/sounds/alpha.mp3",
    isActive: true,
    isCustom: false
  },
  {
    id: "brown_noise",
    name: "نویز قهوه‌ای عمیق (عایق صوتی)",
    category: "noise",
    iconName: "Radio",
    symbol: "📻",
    description: "فرکانس پیوسته گرم و بم برای حذف کامل صداهای مزاحم اطراف و ایجاد حباب تمرکز",
    defaultVolume: 55,
    localPath: "/sounds/brown_noise.mp3",
    isActive: true,
    isCustom: false
  },
  {
    id: "rain",
    name: "باران ملایم و پنجره",
    category: "nature",
    iconName: "CloudRain",
    symbol: "🌧️",
    description: "صدای طبیعی و آرام‌بخش بارش قطرات باران روی شیشه",
    defaultVolume: 60,
    localPath: "/sounds/rain.mp3",
    isActive: true,
    isCustom: false
  },
  {
    id: "cafe",
    name: "کافی‌شاپ دنج کافئین",
    category: "cafe",
    iconName: "Coffee",
    symbol: "☕",
    description: "فضای گرم کافی‌شاپ، صدای فنجان و فوم‌ساز قهوه باریستا",
    defaultVolume: 50,
    localPath: "/sounds/cafe.mp3",
    isActive: true,
    isCustom: false
  },
  {
    id: "fire",
    name: "شومینه هیزمی و آتش آرام",
    category: "nature",
    iconName: "Flame",
    symbol: "🔥",
    description: "صدای دلنشین ترق‌تروق چوب‌های شومینه و گرما",
    defaultVolume: 50,
    localPath: "/sounds/fire.mp3",
    isActive: true,
    isCustom: false
  },
  {
    id: "river",
    name: "رودخانه زلال کوهستان",
    category: "nature",
    iconName: "Waves",
    symbol: "🏞️",
    description: "صدای شفاف و زلال جریان آب خروشان کوهستان",
    defaultVolume: 50,
    localPath: "/sounds/river.mp3",
    isActive: true,
    isCustom: false
  },
  {
    id: "waterfall",
    name: "آبشار طبیعی جنگل",
    category: "nature",
    iconName: "Waves",
    symbol: "🌊",
    description: "طنین عمیق و یکنواخت ریزش آبشار برای عایق صوتی طبیعی",
    defaultVolume: 45,
    localPath: "/sounds/waterfall.mp3",
    isActive: true,
    isCustom: false
  },
  {
    id: "forest",
    name: "آواز پرندگان و نسیم جنگل",
    category: "nature",
    iconName: "Sparkles",
    symbol: "🌲",
    description: "چهچهه بهاری پرندگان و خش‌خش آرام شاخه‌های درختان",
    defaultVolume: 45,
    localPath: "/sounds/forest.mp3",
    isActive: true,
    isCustom: false
  },
  {
    id: "wind_chimes",
    name: "زنگ باد و ارتعاش ذن",
    category: "meditation",
    iconName: "Bell",
    symbol: "🎐",
    description: "صدای ملایم زنگوله‌های بادی و ارتعاش زنگوله‌ای برای آرامش اعصاب",
    defaultVolume: 35,
    localPath: "/sounds/wind_chimes.mp3",
    isActive: true,
    isCustom: false
  },
  {
    id: "singing_bowl",
    name: "کاسه تبتی مدیتیشن",
    category: "meditation",
    iconName: "Disc",
    symbol: "🥣",
    description: "پژواک فرکانسی عمیق کاسه تبتی برای ریست ذهن و بازیابی تمرکز",
    defaultVolume: 35,
    localPath: "/sounds/singing_bowl.mp3",
    isActive: true,
    isCustom: false
  },
  {
    id: "underwater",
    name: "سکوت و آرامش زیر آب",
    category: "nature",
    iconName: "Waves",
    symbol: "🫧",
    description: "حس غوطه‌وری عمیق و حذف تمام امواج صوتی پیرامون",
    defaultVolume: 45,
    localPath: "/sounds/underwater.mp3",
    isActive: true,
    isCustom: false
  },
  {
    id: "waves",
    name: "امواج آرام اقیانوس",
    category: "nature",
    iconName: "Waves",
    symbol: "🌊",
    description: "ریتم متناوب و عمیق جزر و مد امواج ساحل برای آرامش تنفس",
    defaultVolume: 45,
    localPath: "/sounds/waves.mp3",
    isActive: true,
    isCustom: false
  },
  {
    id: "wind",
    name: "نسیم ملایم پاییزی",
    category: "nature",
    iconName: "Wind",
    symbol: "💨",
    description: "صدای ملایم وزش باد در میان درختان و پنجره اتاق",
    defaultVolume: 40,
    localPath: "/sounds/wind.mp3",
    isActive: true,
    isCustom: false
  },
  {
    id: "thunder",
    name: "غرش رعد و باران سنگین",
    category: "nature",
    iconName: "CloudRain",
    symbol: "⚡",
    description: "صدای کوبنده و دنج رعد و باران سنگین تابستانی",
    defaultVolume: 35,
    localPath: "/sounds/thunder.mp3",
    isActive: true,
    isCustom: false
  },
  {
    id: "night",
    name: "شب آرام و جیرجیرک‌ها",
    category: "nature",
    iconName: "Clock",
    symbol: "🌙",
    description: "آرامش شبانه دلنشین برای پارت‌های مطالعه آخر شب",
    defaultVolume: 40,
    localPath: "/sounds/night.mp3",
    isActive: true,
    isCustom: false
  },
  {
    id: "library",
    name: "کتابخانه آرام و سکوت",
    category: "cafe",
    iconName: "BookOpen",
    symbol: "📚",
    description: "فضای ساکت و آکوستیک کتابخانه مخصوص مطالعه جدی",
    defaultVolume: 45,
    localPath: "/sounds/library.mp3",
    isActive: true,
    isCustom: false
  },
  {
    id: "clock",
    name: "تیک‌تاک ساعت کلاسیک",
    category: "focus",
    iconName: "Clock",
    symbol: "⏱️",
    description: "تیک‌تاک منظم ثانیه‌ها برای پایش سرعت تست‌زنی",
    defaultVolume: 30,
    localPath: "/sounds/clock.mp3",
    isActive: true,
    isCustom: false
  }
];

export const DEFAULT_AMBIENT_PRESETS: AmbientPresetItem[] = [
  {
    id: "deep_gamma_math",
    name: "اوج تمرکز گاما (Deep Math & Gamma)",
    icon: "🧠⚡",
    description: "ترکیب امواج گاما ۴۰Hz، نویز قهوه‌ای بم و تیک‌تاک ثانیه‌ها برای تست‌زنی سرعتی",
    volumes: { gamma: 55, brown_noise: 60, clock: 25 },
    isActive: true,
    isDefault: true
  },
  {
    id: "alpha_zen",
    name: "آرامش آلفا و رودخانه (Alpha Zen)",
    icon: "✨🏞️",
    description: "ترکیب امواج آلفا ۱۰Hz، صدای جریان رودخانه و زنگ باد برای یادگیری عمیق",
    volumes: { alpha: 50, river: 45, wind_chimes: 35 },
    isActive: true,
    isDefault: true
  },
  {
    id: "caffeine_rain",
    name: "کافی‌شاپ بارانی کافئین",
    icon: "☕🌧️",
    description: "ترکیب اصیل باران، کافی‌شاپ آرام و گرمای آتش شومینه",
    volumes: { cafe: 55, rain: 50, fire: 35 },
    isActive: true,
    isDefault: true
  },
  {
    id: "forest_peace",
    name: "جنگل بارانی و طبیعت",
    icon: "🌲🌧️",
    description: "آواز پرندگان جنگلی، باران ملایم و وزش نسیم",
    volumes: { forest: 60, rain: 45, wind: 35 },
    isActive: true,
    isDefault: true
  },
  {
    id: "night_study",
    name: "شب امتحان و آرامش مطلق",
    icon: "🌙🔥",
    description: "سکوت شب، جیرجیرک‌ها و شومینه گرم دوردست",
    volumes: { night: 55, fire: 40, rain: 30 },
    isActive: true,
    isDefault: true
  },
  {
    id: "meditation_retreat",
    name: "مدیتیشن و بازیابی ذهن",
    icon: "🥣🫧",
    description: "کاسه تبتی، سکوت زیر آب و امواج آرام اقیانوس برای رفع خستگی",
    volumes: { singing_bowl: 50, underwater: 45, waves: 40 },
    isActive: true,
    isDefault: true
  },
  {
    id: "silent_library",
    name: "سالن مطالعه کتابخانه",
    icon: "📚📻",
    description: "فضای ساکت کتابخانه همراه با نویز قهوه‌ای عایق صدا",
    volumes: { library: 55, brown_noise: 45 },
    isActive: true,
    isDefault: true
  }
];

class AmbientAudioManager {
  private fileDb: FileDatabase;
  private readonly SOUNDS_COLLECTION = 'ambient_sounds';
  private readonly PRESETS_COLLECTION = 'ambient_presets';

  constructor() {
    this.fileDb = new FileDatabase();
    this.initializeDefaults();
  }

  private initializeDefaults() {
    const existingSounds = this.fileDb.find<AmbientSoundItem>(this.SOUNDS_COLLECTION);
    if (!existingSounds || existingSounds.length === 0) {
      DEFAULT_AMBIENT_SOUNDS.forEach((s) => {
        this.fileDb.insert<AmbientSoundItem>(this.SOUNDS_COLLECTION, { ...s });
      });
    }

    const existingPresets = this.fileDb.find<AmbientPresetItem>(this.PRESETS_COLLECTION);
    if (!existingPresets || existingPresets.length === 0) {
      DEFAULT_AMBIENT_PRESETS.forEach((p) => {
        this.fileDb.insert<AmbientPresetItem>(this.PRESETS_COLLECTION, { ...p });
      });
    }
  }

  public getAllSounds(includeInactive = true): AmbientSoundItem[] {
    const sounds = this.fileDb.find<AmbientSoundItem>(this.SOUNDS_COLLECTION);
    if (includeInactive) return sounds;
    return sounds.filter((s) => s.isActive !== false);
  }

  public getSoundById(id: string): AmbientSoundItem | undefined {
    return this.fileDb.findById<AmbientSoundItem>(this.SOUNDS_COLLECTION, id) || undefined;
  }

  public saveSound(sound: AmbientSoundItem): AmbientSoundItem {
    const existing = this.getSoundById(sound.id);
    if (existing) {
      const updated = this.fileDb.update<AmbientSoundItem>(this.SOUNDS_COLLECTION, sound.id, {
        ...sound,
        isActive: sound.isActive !== undefined ? sound.isActive : true
      });
      return updated || sound;
    } else {
      return this.fileDb.insert<AmbientSoundItem>(this.SOUNDS_COLLECTION, {
        ...sound,
        isActive: sound.isActive !== undefined ? sound.isActive : true,
        createdAt: new Date().toISOString()
      });
    }
  }

  public deleteSound(id: string): boolean {
    const sound = this.getSoundById(id);
    if (!sound) return false;

    // If it is custom, we can remove the file and delete the document
    if (sound.isCustom) {
      if (sound.localPath && sound.localPath.startsWith('/sounds/')) {
        const filename = path.basename(sound.localPath);
        const publicFile = path.join(process.cwd(), 'public', 'sounds', filename);
        if (fs.existsSync(publicFile)) {
          try {
            fs.unlinkSync(publicFile);
          } catch (_) {}
        }
        const distFile = path.join(process.cwd(), 'dist', 'sounds', filename);
        if (fs.existsSync(distFile)) {
          try {
            fs.unlinkSync(distFile);
          } catch (_) {}
        }
      }
      return this.fileDb.delete(this.SOUNDS_COLLECTION, id);
    } else {
      // If built-in, simply toggle isActive to false so it won't break sound assets
      this.fileDb.update<AmbientSoundItem>(this.SOUNDS_COLLECTION, id, { isActive: false });
      return true;
    }
  }

  public saveAudioFile(originalFilename: string, buffer: Buffer): { localPath: string; sizeBytes: number; filename: string } {
    const ext = (path.extname(originalFilename) || '.mp3').toLowerCase();
    const baseClean = path.basename(originalFilename, ext).replace(/[^a-zA-Z0-9_\u0600-\u06FF-]/g, '_');
    const safeFilename = `custom_${baseClean}_${Date.now()}${ext}`;

    const soundsDir = path.join(process.cwd(), 'public', 'sounds');
    if (!fs.existsSync(soundsDir)) {
      fs.mkdirSync(soundsDir, { recursive: true });
    }
    const targetPath = path.join(soundsDir, safeFilename);
    fs.writeFileSync(targetPath, buffer);

    // Also mirror to dist/sounds if it exists
    const distSoundsDir = path.join(process.cwd(), 'dist', 'sounds');
    if (fs.existsSync(distSoundsDir)) {
      try {
        fs.writeFileSync(path.join(distSoundsDir, safeFilename), buffer);
      } catch (_) {}
    }

    return {
      localPath: `/sounds/${safeFilename}`,
      sizeBytes: buffer.length,
      filename: safeFilename
    };
  }

  public getAllPresets(includeInactive = true): AmbientPresetItem[] {
    const presets = this.fileDb.find<AmbientPresetItem>(this.PRESETS_COLLECTION);
    if (includeInactive) return presets;
    return presets.filter((p) => p.isActive !== false);
  }

  public getPresetById(id: string): AmbientPresetItem | undefined {
    return this.fileDb.findById<AmbientPresetItem>(this.PRESETS_COLLECTION, id) || undefined;
  }

  public savePreset(preset: AmbientPresetItem): AmbientPresetItem {
    const existing = this.getPresetById(preset.id);
    if (existing) {
      const updated = this.fileDb.update<AmbientPresetItem>(this.PRESETS_COLLECTION, preset.id, {
        ...preset,
        isActive: preset.isActive !== undefined ? preset.isActive : true
      });
      return updated || preset;
    } else {
      return this.fileDb.insert<AmbientPresetItem>(this.PRESETS_COLLECTION, {
        ...preset,
        isActive: preset.isActive !== undefined ? preset.isActive : true,
        createdAt: new Date().toISOString()
      });
    }
  }

  public deletePreset(id: string): boolean {
    return this.fileDb.delete(this.PRESETS_COLLECTION, id);
  }

  public resetToDefaults(): { sounds: AmbientSoundItem[]; presets: AmbientPresetItem[] } {
    // Clear and re-populate
    const currentSounds = this.fileDb.find<AmbientSoundItem>(this.SOUNDS_COLLECTION);
    currentSounds.forEach((s) => this.fileDb.delete(this.SOUNDS_COLLECTION, s.id));
    DEFAULT_AMBIENT_SOUNDS.forEach((s) => this.fileDb.insert<AmbientSoundItem>(this.SOUNDS_COLLECTION, { ...s }));

    const currentPresets = this.fileDb.find<AmbientPresetItem>(this.PRESETS_COLLECTION);
    currentPresets.forEach((p) => this.fileDb.delete(this.PRESETS_COLLECTION, p.id));
    DEFAULT_AMBIENT_PRESETS.forEach((p) => this.fileDb.insert<AmbientPresetItem>(this.PRESETS_COLLECTION, { ...p }));

    return {
      sounds: DEFAULT_AMBIENT_SOUNDS,
      presets: DEFAULT_AMBIENT_PRESETS
    };
  }
}

export const ambientAudioManager = new AmbientAudioManager();
