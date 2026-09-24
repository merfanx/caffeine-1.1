import { r as a, j as e } from "./vendor-react-AAJfNG8R.js";
import { c as ds } from "./index-CvuvcUm9.js";

const DEFAULT_SOUNDS = [
  { id: "gamma", name: "امواج گاما ۴۰Hz (اوج تمرکز تست‌زنی)", category: "focus", symbol: "🧠", description: "فرکانس هارمونیک دوگوشی ۴۰ هرتز گاما جهت بیشینه‌سازی پردازش ذهنی و حل تست", defaultVolume: 40, localPath: "/sounds/gamma.wav", isActive: true, isCustom: false },
  { id: "alpha", name: "امواج آلفا ۱۰Hz (آرامش و تمرکز روان)", category: "focus", symbol: "✨", description: "فرکانس آرام‌کننده امواج آلفا برای کاهش استرس مطالعه و افزایش یادگیری عمیق", defaultVolume: 40, localPath: "/sounds/alpha.wav", isActive: true, isCustom: false },
  { id: "brown_noise", name: "نویز قهوه‌ای عمیق (عایق صوتی)", category: "noise", symbol: "📻", description: "فرکانس پیوسته گرم و بم برای حذف کامل صداهای مزاحم اطراف و ایجاد حباب تمرکز", defaultVolume: 55, localPath: "/sounds/brown_noise.wav", isActive: true, isCustom: false },
  { id: "rain", name: "باران ملایم و پنجره", category: "nature", symbol: "🌧️", description: "صدای طبیعی و آرام‌بخش بارش قطرات باران روی شیشه", defaultVolume: 60, localPath: "/sounds/rain.mp3", isActive: true, isCustom: false },
  { id: "cafe", name: "کافی‌شاپ دنج کافئین", category: "cafe", symbol: "☕", description: "فضای گرم کافی‌شاپ، صدای فنجان و فوم‌ساز قهوه باریستا", defaultVolume: 50, localPath: "/sounds/cafe.mp3", isActive: true, isCustom: false },
  { id: "fire", name: "شومینه هیزمی و آتش آرام", category: "nature", symbol: "🔥", description: "صدای دلنشین ترق‌تروق چوب‌های شومینه و گرما", defaultVolume: 50, localPath: "/sounds/fire.mp3", isActive: true, isCustom: false },
  { id: "river", name: "رودخانه زلال کوهستان", category: "nature", symbol: "🏞️", description: "صدای شفاف و زلال جریان آب خروشان کوهستان", defaultVolume: 50, localPath: "/sounds/river.mp3", isActive: true, isCustom: false },
  { id: "waterfall", name: "آبشار طبیعی جنگل", category: "nature", symbol: "🌊", description: "طنین عمیق و یکنواخت ریزش آبشار برای عایق صوتی طبیعی", defaultVolume: 45, localPath: "/sounds/waterfall.mp3", isActive: true, isCustom: false },
  { id: "forest", name: "آواز پرندگان و نسیم جنگل", category: "nature", symbol: "🌲", description: "چهچهه بهاری پرندگان و خش‌خش آرام شاخه‌های درختان", defaultVolume: 45, localPath: "/sounds/forest.mp3", isActive: true, isCustom: false },
  { id: "wind_chimes", name: "زنگ باد و ارتعاش ذن", category: "meditation", symbol: "🎐", description: "صدای ملایم زنگوله‌های بادی و ارتعاش زنگوله‌ای برای آرامش اعصاب", defaultVolume: 35, localPath: "/sounds/wind_chimes.mp3", isActive: true, isCustom: false },
  { id: "singing_bowl", name: "کاسه تبتی مدیتیشن", category: "meditation", symbol: "🥣", description: "پژواک فرکانسی عمیق کاسه تبتی برای ریست ذهن و بازیابی تمرکز", defaultVolume: 35, localPath: "/sounds/singing_bowl.mp3", isActive: true, isCustom: false },
  { id: "underwater", name: "سکوت و آرامش زیر آب", category: "nature", symbol: "🫧", description: "حس غوطه‌وری عمیق و حذف تمام امواج صوتی پیرامون", defaultVolume: 45, localPath: "/sounds/underwater.mp3", isActive: true, isCustom: false },
  { id: "waves", name: "امواج آرام اقیانوس", category: "nature", symbol: "🌊", description: "ریتم متناوب و عمیق جزر و مد امواج ساحل برای آرامش تنفس", defaultVolume: 45, localPath: "/sounds/waves.mp3", isActive: true, isCustom: false },
  { id: "wind", name: "نسیم ملایم پاییزی", category: "nature", symbol: "💨", description: "صدای ملایم وزش باد در میان درختان و پنجره اتاق", defaultVolume: 40, localPath: "/sounds/wind.mp3", isActive: true, isCustom: false },
  { id: "thunder", name: "غرش رعد و باران سنگین", category: "nature", symbol: "⚡", description: "صدای کوبنده و دنج رعد و باران سنگین تابستانی", defaultVolume: 35, localPath: "/sounds/thunder.mp3", isActive: true, isCustom: false },
  { id: "night", name: "شب آرام و جیرجیرک‌ها", category: "nature", symbol: "🌙", description: "آرامش شبانه دلنشین برای پارت‌های مطالعه آخر شب", defaultVolume: 40, localPath: "/sounds/night.mp3", isActive: true, isCustom: false },
  { id: "library", name: "کتابخانه آرام و سکوت", category: "cafe", symbol: "📚", description: "فضای ساکت و آکوستیک کتابخانه مخصوص مطالعه جدی", defaultVolume: 45, localPath: "/sounds/library.mp3", isActive: true, isCustom: false },
  { id: "clock", name: "تیک‌تاک ساعت کلاسیک", category: "focus", symbol: "⏱️", description: "تیک‌تاک منظم ثانیه‌ها برای پایش سرعت تست‌زنی", defaultVolume: 30, localPath: "/sounds/clock.mp3", isActive: true, isCustom: false }
];

const DEFAULT_PRESETS = [
  { id: "deep_gamma_math", name: "اوج تمرکز گاما (Deep Math & Gamma)", icon: "🧠⚡", description: "ترکیب امواج گاما ۴۰Hz، نویز قهوه‌ای بم و تیک‌تاک ثانیه‌ها برای تست‌زنی سرعتی", volumes: { gamma: 55, brown_noise: 60, clock: 25 }, isActive: true, isDefault: true },
  { id: "alpha_zen", name: "آرامش آلفا و رودخانه (Alpha Zen)", icon: "✨🏞️", description: "ترکیب امواج آلفا ۱۰Hz، صدای جریان رودخانه و زنگ باد برای یادگیری عمیق", volumes: { alpha: 50, river: 45, wind_chimes: 35 }, isActive: true, isDefault: true },
  { id: "caffeine_rain", name: "کافی‌شاپ بارانی کافئین", icon: "☕🌧️", description: "ترکیب اصیل باران، کافی‌شاپ آرام و گرمای آتش شومینه", volumes: { cafe: 55, rain: 50, fire: 35 }, isActive: true, isDefault: true },
  { id: "forest_peace", name: "جنگل بارانی و طبیعت", icon: "🌲🌧️", description: "آواز پرندگان جنگلی، باران ملایم و وزش نسیم", volumes: { forest: 60, rain: 45, wind: 35 }, isActive: true, isDefault: true },
  { id: "night_study", name: "شب امتحان و آرامش مطلق", icon: "🌙🔥", description: "سکوت شب، جیرجیرک‌ها و شومینه گرم دوردست", volumes: { night: 55, fire: 40, rain: 30 }, isActive: true, isDefault: true },
  { id: "meditation_retreat", name: "مدیتیشن و بازیابی ذهن", icon: "🥣🫧", description: "کاسه تبتی، سکوت زیر آب و امواج آرام اقیانوس برای رفع خستگی", volumes: { singing_bowl: 50, underwater: 45, waves: 40 }, isActive: true, isDefault: true },
  { id: "silent_library", name: "سالن مطالعه کتابخانه", icon: "📚📻", description: "فضای ساکت کتابخانه همراه با نویز قهوه‌ای عایق صدا", volumes: { library: 55, brown_noise: 45 }, isActive: true, isDefault: true }
];

const CATEGORIES = [
  { id: "all", label: "همه صداها", icon: "🎧" },
  { id: "focus", label: "امواج مغزی و تمرکز", icon: "🧠" },
  { id: "nature", label: "طبیعت و باران", icon: "🌲" },
  { id: "cafe", label: "کافه و کتابخانه", icon: "☕" },
  { id: "meditation", label: "ذن و آرامش", icon: "🎐" },
  { id: "noise", label: "عایق صوتی و نویز", icon: "📻" },
  { id: "custom", label: "آپلود شده / سفارشی", icon: "🎵" }
];

export function AmbientSoundManager({ onShowToast, onNavigate }) {
  const [sounds, setSounds] = a.useState(DEFAULT_SOUNDS);
  const [presets, setPresets] = a.useState(DEFAULT_PRESETS);
  const [activeTab, setActiveTab] = a.useState("sounds"); // 'sounds' | 'presets' | 'upload'
  const [categoryFilter, setCategoryFilter] = a.useState("all");
  const [searchQuery, setSearchQuery] = a.useState("");
  const [isLoading, setIsLoading] = a.useState(!1);

  // Audio preview playback states
  const [playingSoundId, setPlayingSoundId] = a.useState(null);
  const [playingPresetId, setPlayingPresetId] = a.useState(null);
  const [previewVolume, setPreviewVolume] = a.useState(75);
  const activeAudioElements = a.useRef(new Map());

  // Upload Form State
  const [uploadFile, setUploadFile] = a.useState(null);
  const [uploadPreviewUrl, setUploadPreviewUrl] = a.useState("");
  const [uploadMeta, setUploadMeta] = a.useState({
    name: "",
    category: "focus",
    symbol: "🎵",
    defaultVolume: 50,
    description: ""
  });
  const [isUploading, setIsUploading] = a.useState(!1);

  // Edit Sound Modal State
  const [editingSound, setEditingSound] = a.useState(null);

  // Edit/Create Preset Modal State
  const [editingPreset, setEditingPreset] = a.useState(null);

  // Stop all active preview audio playback
  const stopAllPreviewAudio = a.useCallback(() => {
    activeAudioElements.current.forEach(audio => {
      try {
        audio.pause();
        audio.currentTime = 0;
      } catch (_) {}
    });
    activeAudioElements.current.clear();
    setPlayingSoundId(null);
    setPlayingPresetId(null);
  }, []);

  // Fetch catalog from API
  const fetchCatalog = a.useCallback(async () => {
    setIsLoading(true);
    try {
      const [resSounds, resPresets] = await Promise.all([
        fetch("/api/v1/ambient/sounds?all=true").then(r => r.json()).catch(() => null),
        fetch("/api/v1/ambient/presets?all=true").then(r => r.json()).catch(() => null)
      ]);

      if (resSounds && resSounds.success && Array.isArray(resSounds.sounds)) {
        setSounds(resSounds.sounds);
        try {
          const curr = JSON.parse(localStorage.getItem("caffeine_ambient_audio_config_v1") || "{}");
          localStorage.setItem("caffeine_ambient_audio_config_v1", JSON.stringify({ ...curr, sounds: resSounds.sounds }));
        } catch (_) {}
      }

      if (resPresets && resPresets.success && Array.isArray(resPresets.presets)) {
        setPresets(resPresets.presets);
        try {
          const curr = JSON.parse(localStorage.getItem("caffeine_ambient_audio_config_v1") || "{}");
          localStorage.setItem("caffeine_ambient_audio_config_v1", JSON.stringify({ ...curr, presets: resPresets.presets }));
        } catch (_) {}
      }
    } catch (err) {
      console.warn("Could not fetch ambient audio data:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  a.useEffect(() => {
    fetchCatalog();
    return () => stopAllPreviewAudio();
  }, [fetchCatalog, stopAllPreviewAudio]);

  const notifyChange = () => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("caffeine:ambient-audio-updated"));
    }
  };

  // Preview individual sound
  const handleToggleSoundPlay = (sound) => {
    if (playingSoundId === sound.id) {
      stopAllPreviewAudio();
      return;
    }
    stopAllPreviewAudio();

    try {
      const audio = new Audio(sound.localPath);
      audio.loop = true;
      audio.volume = Math.max(0, Math.min(1, (previewVolume / 100)));
      audio.play().then(() => {
        activeAudioElements.current.set(sound.id, audio);
        setPlayingSoundId(sound.id);
      }).catch(err => {
        onShowToast?.("خطا در بارگذاری فایل صوتی. لطفاً مسیر فایل را بررسی کنید.");
      });
    } catch (e) {
      onShowToast?.("مرورگر اجازه پخش خودکار را نداد.");
    }
  };

  // Preview preset combination
  const handleTogglePresetPlay = (preset) => {
    if (playingPresetId === preset.id) {
      stopAllPreviewAudio();
      return;
    }
    stopAllPreviewAudio();

    const activeLayers = Object.entries(preset.volumes || {}).filter(([_, vol]) => Number(vol) > 0);
    if (activeLayers.length === 0) {
      onShowToast?.("این ترکیب هیچ لایه صوتی فعالی ندارد.");
      return;
    }

    let startedCount = 0;
    activeLayers.forEach(([soundId, vol]) => {
      const snd = sounds.find(s => s.id === soundId);
      if (snd && snd.localPath) {
        try {
          const audio = new Audio(snd.localPath);
          audio.loop = true;
          audio.volume = Math.max(0, Math.min(1, (vol / 100) * (previewVolume / 100)));
          audio.play().then(() => {
            activeAudioElements.current.set(soundId, audio);
          }).catch(() => {});
          startedCount++;
        } catch (_) {}
      }
    });

    if (startedCount > 0) {
      setPlayingPresetId(preset.id);
    }
  };

  // Toggle active sound
  const handleToggleSoundActive = async (sound) => {
    const updated = { ...sound, isActive: sound.isActive === false ? true : false };
    try {
      const res = await fetch("/api/v1/ambient/sounds", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated)
      }).then(r => r.json());

      if (res.success) {
        setSounds(prev => prev.map(s => s.id === sound.id ? { ...s, isActive: updated.isActive } : s));
        notifyChange();
        onShowToast?.(updated.isActive ? `صدای «${sound.name}» فعال شد.` : `صدای «${sound.name}» غیرفعال شد.`);
      } else {
        onShowToast?.(res.message || "خطا در ذخیره وضعیت صدا.");
      }
    } catch (_) {
      onShowToast?.("خطای ارتباط با سرور.");
    }
  };

  // Delete sound
  const handleDeleteSound = async (sound) => {
    if (!confirm(`آیا از حذف یا غیرفعال‌سازی صدای «${sound.name}» اطمینان دارید؟`)) return;
    try {
      const res = await fetch(`/api/v1/ambient/sounds/${sound.id}`, { method: "DELETE" }).then(r => r.json());
      if (res.success) {
        if (sound.isCustom) {
          setSounds(prev => prev.filter(s => s.id !== sound.id));
        } else {
          setSounds(prev => prev.map(s => s.id === sound.id ? { ...s, isActive: false } : s));
        }
        stopAllPreviewAudio();
        notifyChange();
        onShowToast?.(res.message || "عملیات با موفقیت انجام شد.");
      } else {
        onShowToast?.(res.message || "خطا در حذف صدا.");
      }
    } catch (_) {
      onShowToast?.("خطای ارتباط با سرور.");
    }
  };

  // Save edited sound
  const handleSaveSound = async () => {
    if (!editingSound || !editingSound.name.trim()) {
      onShowToast?.("عنوان صدا نمی‌تواند خالی باشد.");
      return;
    }
    try {
      const res = await fetch("/api/v1/ambient/sounds", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingSound)
      }).then(r => r.json());

      if (res.success) {
        setSounds(prev => prev.map(s => s.id === editingSound.id ? editingSound : s));
        setEditingSound(null);
        notifyChange();
        onShowToast?.("اطلاعات صدا با موفقیت ذخیره گردید ✨");
      } else {
        onShowToast?.(res.message || "خطا در ذخیره اطلاعات صدا.");
      }
    } catch (_) {
      onShowToast?.("خطای ارتباط با سرور.");
    }
  };

  // Upload Sound File
  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadFile(file);
    const cleanTitle = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
    setUploadMeta(prev => ({
      ...prev,
      name: prev.name || cleanTitle
    }));
    try {
      const url = URL.createObjectURL(file);
      setUploadPreviewUrl(url);
    } catch (_) {}
  };

  const handleExecuteUpload = async () => {
    if (!uploadFile) {
      onShowToast?.("لطفاً یک فایل صوتی انتخاب کنید.");
      return;
    }
    if (!uploadMeta.name.trim()) {
      onShowToast?.("لطفاً عنوان صدا را وارد نمایید.");
      return;
    }

    setIsUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const base64Data = (reader.result || "").toString().split(",")[1];
          const payload = {
            filename: uploadFile.name,
            contentBase64: base64Data,
            name: uploadMeta.name.trim(),
            category: uploadMeta.category,
            symbol: uploadMeta.symbol || "🎵",
            description: uploadMeta.description.trim() || `آپلود شده با حجم ${Math.round(uploadFile.size / 1024)} KB`,
            defaultVolume: Number(uploadMeta.defaultVolume) || 50
          };

          const res = await fetch("/api/v1/ambient/sounds/upload", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
          }).then(r => r.json());

          if (res.success && res.sound) {
            setSounds(prev => [res.sound, ...prev]);
            setUploadFile(null);
            setUploadPreviewUrl("");
            setUploadMeta({
              name: "",
              category: "focus",
              symbol: "🎵",
              defaultVolume: 50,
              description: ""
            });
            setActiveTab("sounds");
            notifyChange();
            onShowToast?.(`صدای «${res.sound.name}» با موفقیت آپلود و به کاتالوگ اضافه شد ✨`);
          } else {
            onShowToast?.(res.message || "خطا در آپلود فایل صوتی.");
          }
        } catch (err) {
          onShowToast?.("خطا در پردازش فایل: " + err.message);
        } finally {
          setIsUploading(false);
        }
      };
      reader.onerror = () => {
        setIsUploading(false);
        onShowToast?.("خطا در خواندن فایل از حافظه دستگاه.");
      };
      reader.readAsDataURL(uploadFile);
    } catch (err) {
      setIsUploading(false);
      onShowToast?.("خطای غیرمنتظره در آپلود: " + err.message);
    }
  };

  // Preset operations
  const handleSavePreset = async () => {
    if (!editingPreset || !editingPreset.name.trim()) {
      onShowToast?.("عنوان ترکیب پیشنهادی الزامی است.");
      return;
    }
    const nonZeroVolumes = {};
    Object.entries(editingPreset.volumes || {}).forEach(([k, v]) => {
      if (Number(v) > 0) nonZeroVolumes[k] = Number(v);
    });
    if (Object.keys(nonZeroVolumes).length === 0) {
      onShowToast?.("حداقل یک صدا باید ولوم بالای صفر داشته باشد.");
      return;
    }

    const payload = {
      ...editingPreset,
      volumes: nonZeroVolumes
    };

    try {
      const res = await fetch("/api/v1/ambient/presets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      }).then(r => r.json());

      if (res.success && res.preset) {
        setPresets(prev => {
          const exists = prev.some(p => p.id === res.preset.id);
          return exists ? prev.map(p => p.id === res.preset.id ? res.preset : p) : [res.preset, ...prev];
        });
        setEditingPreset(null);
        notifyChange();
        onShowToast?.("ترکیب پیشنهادی با موفقیت ذخیره گردید ✨");
      } else {
        onShowToast?.(res.message || "خطا در ذخیره ترکیب.");
      }
    } catch (_) {
      onShowToast?.("خطای ارتباط با سرور.");
    }
  };

  const handleDeletePreset = async (preset) => {
    if (!confirm(`آیا از حذف ترکیب پیشنهادی «${preset.name}» اطمینان دارید؟`)) return;
    try {
      const res = await fetch(`/api/v1/ambient/presets/${preset.id}`, { method: "DELETE" }).then(r => r.json());
      if (res.success) {
        setPresets(prev => prev.filter(p => p.id !== preset.id));
        stopAllPreviewAudio();
        notifyChange();
        onShowToast?.("ترکیب پیشنهادی حذف شد.");
      } else {
        onShowToast?.(res.message || "خطا در حذف ترکیب.");
      }
    } catch (_) {
      onShowToast?.("خطای ارتباط با سرور.");
    }
  };

  const handleResetToDefaults = async () => {
    if (!confirm("آیا از بازنشانی کلیه صداها و ترکیب‌های پیشنهادی به حالت کارخانه مطمئن هستید؟ (صداهای آپلود شده حفظ خواهند شد)")) return;
    try {
      const res = await fetch("/api/v1/ambient/reset", { method: "POST" }).then(r => r.json());
      if (res.success) {
        setSounds(res.sounds);
        setPresets(res.presets);
        stopAllPreviewAudio();
        notifyChange();
        onShowToast?.("کاتالوگ صداها و ترکیب‌ها با موفقیت بازنشانی شد ✨");
      } else {
        onShowToast?.(res.message || "خطا در بازنشانی.");
      }
    } catch (_) {
      onShowToast?.("خطای ارتباط با سرور.");
    }
  };

  // Filtered sounds list
  const filteredSounds = sounds.filter(s => {
    if (categoryFilter !== "all" && s.category !== categoryFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchName = (s.name || "").toLowerCase().includes(q);
      const matchDesc = (s.description || "").toLowerCase().includes(q);
      if (!matchName && !matchDesc) return false;
    }
    return true;
  });

  const activeSoundsCount = sounds.filter(s => s.isActive !== false).length;
  const customSoundsCount = sounds.filter(s => s.isCustom).length;

  return e.jsxs("div", {
    className: "space-y-6 animate-in fade-in duration-200 text-stone-800",
    children: [
      // Top Header Card
      e.jsxs("div", {
        className: "bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/80 shadow-xs relative overflow-hidden",
        children: [
          e.jsxs("div", {
            className: "flex flex-col md:flex-row md:items-center justify-between gap-5",
            children: [
              e.jsxs("div", {
                className: "flex items-start gap-4 min-w-0",
                children: [
                  e.jsx("div", {
                    className: "w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-700 flex items-center justify-center text-3xl shrink-0 shadow-xs",
                    children: "🎧"
                  }),
                  e.jsxs("div", {
                    className: "space-y-1 min-w-0",
                    children: [
                      e.jsx("h2", {
                        className: "text-xl sm:text-2xl font-black text-stone-900 tracking-tight",
                        children: "مدیریت صداها و ترکیب‌های پیشنهادی (Sound & Presets)"
                      }),
                      e.jsx("p", {
                        className: "text-xs sm:text-sm text-stone-600 leading-relaxed max-w-2xl",
                        children: "آپلود فایل‌های صوتی جدید، ویرایش فرکانس‌ها و دسته‌بندی‌ها، و ساخت ترکیب‌های چندلایه پیشنهادی جهت ارائه در داشبورد مطالعه دانش‌آموزان."
                      })
                    ]
                  })
                ]
              }),
              e.jsxs("div", {
                className: "flex items-center flex-wrap gap-2.5 shrink-0",
                children: [
                  e.jsxs("button", {
                    type: "button",
                    onClick: () => setActiveTab("upload"),
                    className: "px-4 py-2.5 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-xs hover:shadow-md cursor-pointer",
                    children: [
                      e.jsx("span", { children: "☁️" }),
                      e.jsx("span", { children: "آپلود صدای جدید" })
                    ]
                  }),
                  e.jsxs("button", {
                    type: "button",
                    onClick: () => {
                      setEditingPreset({
                        id: `preset_${Date.now()}`,
                        name: "ترکیب تمرکز جدید",
                        icon: "🎧✨",
                        description: "شرح ترکیب پیشنهادی جدید برای پارت‌های مطالعه",
                        volumes: { gamma: 50, rain: 40 },
                        isActive: true
                      });
                    },
                    className: "px-4 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs flex items-center gap-2 transition-colors cursor-pointer border border-stone-300",
                    children: [
                      e.jsx("span", { children: "➕" }),
                      e.jsx("span", { children: "افزودن ترکیب پیشنهادی" })
                    ]
                  }),
                  e.jsxs("button", {
                    type: "button",
                    onClick: handleResetToDefaults,
                    className: "px-3 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer border border-rose-200",
                    title: "بازنشانی صداها و ترکیب‌ها به حالت اولیه کارخانه",
                    children: [
                      e.jsx("span", { children: "🔄" }),
                      e.jsx("span", { children: "بازنشانی" })
                    ]
                  })
                ]
              })
            ]
          }),

          // Stats Strip
          e.jsxs("div", {
            className: "grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-stone-100 text-right",
            children: [
              e.jsxs("div", {
                className: "bg-stone-50 p-3.5 rounded-2xl border border-stone-200/60",
                children: [
                  e.jsx("span", { className: "text-xs font-bold text-stone-500 block mb-1", children: "کل صداهای کاتالوگ" }),
                  e.jsxs("span", { className: "text-xl font-black text-stone-900 font-mono", children: [sounds.length, " صوت"] })
                ]
              }),
              e.jsxs("div", {
                className: "bg-emerald-50 p-3.5 rounded-2xl border border-emerald-200/60",
                children: [
                  e.jsx("span", { className: "text-xs font-bold text-emerald-700 block mb-1", children: "صداهای فعال در پنل" }),
                  e.jsxs("span", { className: "text-xl font-black text-emerald-950 font-mono", children: [activeSoundsCount, " فعال"] })
                ]
              }),
              e.jsxs("div", {
                className: "bg-indigo-50 p-3.5 rounded-2xl border border-indigo-200/60",
                children: [
                  e.jsx("span", { className: "text-xs font-bold text-indigo-700 block mb-1", children: "ترکیب‌های پیشنهادی" }),
                  e.jsxs("span", { className: "text-xl font-black text-indigo-950 font-mono", children: [presets.length, " ترکیب"] })
                ]
              }),
              e.jsxs("div", {
                className: "bg-amber-50 p-3.5 rounded-2xl border border-amber-200/60",
                children: [
                  e.jsx("span", { className: "text-xs font-bold text-amber-800 block mb-1", children: "صداهای آپلود شده" }),
                  e.jsxs("span", { className: "text-xl font-black text-amber-950 font-mono", children: [customSoundsCount, " فایل"] })
                ]
              })
            ]
          })
        ]
      }),

      // Navigation Sub-tabs
      e.jsxs("div", {
        className: "flex items-center justify-between flex-wrap gap-3 bg-white p-2 rounded-2xl border border-stone-200/80 shadow-2xs",
        children: [
          e.jsxs("div", {
            className: "flex items-center gap-1.5",
            children: [
              e.jsxs("button", {
                type: "button",
                onClick: () => setActiveTab("sounds"),
                className: `px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
                  activeTab === "sounds" ? "bg-amber-700 text-white shadow-xs" : "text-stone-600 hover:bg-stone-100"
                }`,
                children: [
                  e.jsx("span", { children: "🎵" }),
                  e.jsxs("span", { children: ["کاتالوگ صداها (", sounds.length, ")"] })
                ]
              }),
              e.jsxs("button", {
                type: "button",
                onClick: () => setActiveTab("presets"),
                className: `px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
                  activeTab === "presets" ? "bg-amber-700 text-white shadow-xs" : "text-stone-600 hover:bg-stone-100"
                }`,
                children: [
                  e.jsx("span", { children: "⚡" }),
                  e.jsxs("span", { children: ["ترکیب‌های پیشنهادی (", presets.length, ")"] })
                ]
              }),
              e.jsxs("button", {
                type: "button",
                onClick: () => setActiveTab("upload"),
                className: `px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
                  activeTab === "upload" ? "bg-amber-700 text-white shadow-xs" : "text-stone-600 hover:bg-stone-100"
                }`,
                children: [
                  e.jsx("span", { children: "☁️" }),
                  e.jsx("span", { children: "آپلود ترک جدید" })
                ]
              })
            ]
          }),

          // Preview master volume slider
          e.jsxs("div", {
            className: "flex items-center gap-2 px-3 py-1.5 bg-stone-50 rounded-xl border border-stone-200 text-xs",
            children: [
              e.jsx("span", { className: "text-stone-500 font-bold", children: "ولوم تست:" }),
              e.jsx("input", {
                type: "range",
                min: "0",
                max: "100",
                value: previewVolume,
                onChange: e => {
                  const val = Number(e.target.value);
                  setPreviewVolume(val);
                  activeAudioElements.current.forEach(audio => {
                    audio.volume = val / 100;
                  });
                },
                className: "w-20 sm:w-28 h-1.5 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-amber-700"
              }),
              e.jsxs("span", { className: "font-mono font-bold text-stone-700 w-8 text-left", children: [previewVolume, "%"] }),
              (playingSoundId || playingPresetId) && e.jsx("button", {
                type: "button",
                onClick: stopAllPreviewAudio,
                className: "px-2 py-0.5 bg-rose-100 hover:bg-rose-200 text-rose-700 rounded-lg font-bold text-[11px] cursor-pointer",
                children: "توقف پخش"
              })
            ]
          })
        ]
      }),

      // TAB 1: SOUNDS CATALOG
      activeTab === "sounds" && e.jsxs("div", {
        className: "space-y-4",
        children: [
          // Filter & Search bar
          e.jsxs("div", {
            className: "flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-stone-200/80 shadow-2xs",
            children: [
              // Categories pills
              e.jsx("div", {
                className: "flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 text-xs no-scrollbar",
                children: CATEGORIES.map(cat => {
                  const isSelected = categoryFilter === cat.id;
                  const count = cat.id === "all"
                    ? sounds.length
                    : cat.id === "custom"
                    ? customSoundsCount
                    : sounds.filter(s => s.category === cat.id).length;
                  return e.jsxs("button", {
                    key: cat.id,
                    type: "button",
                    onClick: () => setCategoryFilter(cat.id),
                    className: `px-3 py-1.5 rounded-xl font-bold transition-colors shrink-0 flex items-center gap-1.5 cursor-pointer ${
                      isSelected ? "bg-stone-900 text-white shadow-xs" : "bg-stone-100 hover:bg-stone-200 text-stone-700"
                    }`,
                    children: [
                      e.jsx("span", { children: cat.icon }),
                      e.jsx("span", { children: cat.label }),
                      e.jsxs("span", { className: `text-[10px] px-1.5 py-0.2 rounded-md font-mono ${isSelected ? "bg-white/20 text-white" : "bg-stone-200 text-stone-600"}`, children: [count] })
                    ]
                  });
                })
              }),
              // Search field
              e.jsx("div", {
                className: "relative shrink-0 sm:w-64",
                children: e.jsx("input", {
                  type: "text",
                  value: searchQuery,
                  onChange: e => setSearchQuery(e.target.value),
                  placeholder: "جستجو در عنوان یا توضیحات...",
                  className: "w-full pl-3 pr-8 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                })
              })
            ]
          }),

          // Sounds Cards Grid
          e.jsx("div", {
            className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5",
            children: filteredSounds.map(sound => {
              const isPlaying = playingSoundId === sound.id;
              return e.jsxs("div", {
                key: sound.id,
                className: `bg-white rounded-2xl p-4 border transition-all relative overflow-hidden flex flex-col justify-between group ${
                  sound.isActive === false
                    ? "border-stone-200 bg-stone-50/60 opacity-60"
                    : isPlaying
                    ? "border-amber-400 ring-2 ring-amber-400/30 shadow-md bg-amber-50/20"
                    : "border-stone-200/80 hover:border-amber-300 shadow-2xs"
                }`,
                children: [
                  e.jsxs("div", {
                    className: "space-y-2.5",
                    children: [
                      // Card Top Row
                      e.jsxs("div", {
                        className: "flex items-start justify-between gap-3",
                        children: [
                          e.jsxs("div", {
                            className: "flex items-center gap-3 min-w-0 flex-1",
                            children: [
                              e.jsx("div", {
                                className: `w-11 h-11 rounded-2xl flex items-center justify-center text-xl shrink-0 border transition-all ${
                                  isPlaying
                                    ? "bg-amber-600 text-white border-amber-700 animate-pulse shadow-xs"
                                    : "bg-amber-50 text-amber-900 border-amber-200/70"
                                }`,
                                children: sound.symbol || "🎵"
                              }),
                              e.jsxs("div", {
                                className: "min-w-0 flex-1",
                                children: [
                                  e.jsx("h4", {
                                    className: "text-sm font-black text-stone-900 truncate leading-tight",
                                    children: sound.name
                                  }),
                                  e.jsxs("div", {
                                    className: "flex items-center gap-1.5 mt-0.5 flex-wrap",
                                    children: [
                                      e.jsx("span", {
                                        className: "text-[10px] font-bold px-2 py-0.5 rounded-md bg-stone-100 text-stone-600 border border-stone-200",
                                        children: sound.category === "focus" ? "امواج مغزی" :
                                                  sound.category === "nature" ? "طبیعت" :
                                                  sound.category === "cafe" ? "کافی‌شاپ" :
                                                  sound.category === "meditation" ? "مدیتیشن" :
                                                  sound.category === "noise" ? "عایق صوتی" : "سفارشی"
                                      }),
                                      sound.isCustom && e.jsx("span", {
                                        className: "text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-800 border border-amber-200",
                                        children: "آپلود ادمین"
                                      }),
                                      e.jsxs("span", {
                                        className: "text-[10px] font-mono text-stone-500",
                                        children: ["ولوم پایه: ", sound.defaultVolume, "%"]
                                      })
                                    ]
                                  })
                                ]
                              })
                            ]
                          }),

                          // Active/Inactive Badge
                          e.jsx("button", {
                            type: "button",
                            onClick: () => handleToggleSoundActive(sound),
                            className: `px-2 py-1 rounded-lg text-[10px] font-black cursor-pointer transition-colors shrink-0 ${
                              sound.isActive === false
                                ? "bg-stone-200 text-stone-600 hover:bg-stone-300"
                                : "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                            }`,
                            children: sound.isActive === false ? "غیرفعال" : "فعال ✓"
                          })
                        ]
                      }),

                      // Description
                      e.jsx("p", {
                        className: "text-xs text-stone-600 leading-relaxed line-clamp-2 min-h-[34px]",
                        children: sound.description || "بدون توضیحات تکمیلی"
                      })
                    ]
                  }),

                  // Soundwave visualizer bar when playing
                  isPlaying && e.jsxs("div", {
                    className: "flex items-center justify-center gap-1 my-2 py-1 bg-amber-100/60 rounded-xl border border-amber-300/60 text-amber-800 text-[11px] font-bold",
                    children: [
                      e.jsx("span", { className: "w-1 h-3 bg-amber-600 rounded-full animate-bounce" }),
                      e.jsx("span", { className: "w-1 h-5 bg-amber-700 rounded-full animate-bounce [animation-delay:150ms]" }),
                      e.jsx("span", { className: "w-1 h-4 bg-amber-600 rounded-full animate-bounce [animation-delay:300ms]" }),
                      e.jsx("span", { className: "w-1 h-6 bg-amber-800 rounded-full animate-bounce [animation-delay:75ms]" }),
                      e.jsx("span", { className: "w-1 h-3 bg-amber-600 rounded-full animate-bounce [animation-delay:200ms]" }),
                      e.jsx("span", { className: "mr-2 font-mono", children: "در حال پخش پیش‌نمایش زنده..." })
                    ]
                  }),

                  // Bottom Controls
                  e.jsxs("div", {
                    className: "flex items-center justify-between gap-2 pt-3 mt-2 border-t border-stone-100 text-xs",
                    children: [
                      // Play / Pause test button
                      e.jsxs("button", {
                        type: "button",
                        onClick: () => handleToggleSoundPlay(sound),
                        className: `px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                          isPlaying
                            ? "bg-amber-600 hover:bg-amber-700 text-white shadow-xs"
                            : "bg-stone-100 hover:bg-amber-100 text-stone-800 hover:text-amber-900 border border-stone-200"
                        }`,
                        children: [
                          e.jsx("span", { children: isPlaying ? "⏸️" : "▶️" }),
                          e.jsx("span", { children: isPlaying ? "توقف" : "تست صدا" })
                        ]
                      }),

                      // Action icons
                      e.jsxs("div", {
                        className: "flex items-center gap-1.5",
                        children: [
                          e.jsx("button", {
                            type: "button",
                            onClick: () => setEditingSound({ ...sound }),
                            className: "p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors cursor-pointer",
                            title: "ویرایش جزئیات صدا",
                            children: "✏️"
                          }),
                          e.jsx("button", {
                            type: "button",
                            onClick: () => handleDeleteSound(sound),
                            className: "p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors cursor-pointer",
                            title: sound.isCustom ? "حذف دائم صدا" : "غیرفعال‌سازی صدا",
                            children: "🗑️"
                          })
                        ]
                      })
                    ]
                  })
                ]
              });
            })
          })
        ]
      }),

      // TAB 2: PRESETS MANAGEMENT
      activeTab === "presets" && e.jsxs("div", {
        className: "space-y-4",
        children: [
          e.jsxs("div", {
            className: "flex items-center justify-between bg-white p-4 rounded-2xl border border-stone-200/80 shadow-2xs",
            children: [
              e.jsxs("div", {
                children: [
                  e.jsx("h3", { className: "text-base font-black text-stone-900", children: "ترکیب‌های صوتی پیشنهادی (Smart Focus Presets)" }),
                  e.jsx("p", { className: "text-xs text-stone-600", children: "این ترکیب‌ها به صورت آماده و دستچین در اختیار کلیه دانش‌آموزان قرار می‌گیرند." })
                ]
              }),
              e.jsxs("button", {
                type: "button",
                onClick: () => {
                  setEditingPreset({
                    id: `preset_${Date.now()}`,
                    name: "ترکیب پیشنهادی جدید",
                    icon: "☕✨",
                    description: "ترکیب اختصاصی جهت بالا بردن راندمان تمرکز و کاهش خستگی ذهنی",
                    volumes: { gamma: 50, rain: 45 },
                    isActive: true
                  });
                },
                className: "px-3.5 py-2 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs",
                children: [
                  e.jsx("span", { children: "➕" }),
                  e.jsx("span", { children: "ترکیب جدید" })
                ]
              })
            ]
          }),

          // Presets Grid
          e.jsx("div", {
            className: "grid grid-cols-1 md:grid-cols-2 gap-4",
            children: presets.map(preset => {
              const isPlaying = playingPresetId === preset.id;
              const activeLayers = Object.entries(preset.volumes || {}).filter(([_, v]) => Number(v) > 0);

              return e.jsxs("div", {
                key: preset.id,
                className: `bg-white rounded-3xl p-5 border transition-all flex flex-col justify-between space-y-4 shadow-2xs ${
                  isPlaying ? "border-amber-500 ring-2 ring-amber-400/30 bg-amber-50/20" : "border-stone-200/90 hover:border-amber-300"
                }`,
                children: [
                  e.jsxs("div", {
                    className: "space-y-3",
                    children: [
                      // Header
                      e.jsxs("div", {
                        className: "flex items-start justify-between gap-3",
                        children: [
                          e.jsxs("div", {
                            className: "flex items-center gap-3 min-w-0",
                            children: [
                              e.jsx("div", {
                                className: "w-12 h-12 rounded-2xl bg-amber-100 border border-amber-300 flex items-center justify-center text-2xl shrink-0",
                                children: preset.icon || "🎧⚡"
                              }),
                              e.jsxs("div", {
                                className: "min-w-0",
                                children: [
                                  e.jsx("h4", { className: "text-sm font-black text-stone-900 truncate", children: preset.name }),
                                  e.jsxs("span", { className: "text-[11px] text-stone-500 font-bold block", children: [activeLayers.length, " لایه صوتی همزمان"] })
                                ]
                              })
                            ]
                          }),
                          preset.isDefault && e.jsx("span", {
                            className: "text-[10px] font-black px-2 py-0.5 rounded-md bg-stone-100 text-stone-600 border border-stone-200 shrink-0",
                            children: "پیش‌فرض سیستم"
                          })
                        ]
                      }),

                      // Description
                      e.jsx("p", {
                        className: "text-xs text-stone-600 leading-relaxed min-h-[36px]",
                        children: preset.description || "بدون شرح ترکیب"
                      }),

                      // Active channels volume bars
                      e.jsxs("div", {
                        className: "space-y-1.5 bg-stone-50 p-3 rounded-2xl border border-stone-200/70",
                        children: [
                          e.jsx("span", { className: "text-[11px] font-bold text-stone-500 block mb-1", children: "لایه‌ها و درصد صدای ترکیبی:" }),
                          e.jsx("div", {
                            className: "grid grid-cols-1 sm:grid-cols-2 gap-2",
                            children: activeLayers.map(([sId, vol]) => {
                              const sObj = sounds.find(s => s.id === sId);
                              return e.jsxs("div", {
                                key: sId,
                                className: "flex items-center justify-between gap-2 text-xs bg-white px-2.5 py-1.5 rounded-xl border border-stone-200/80",
                                children: [
                                  e.jsxs("div", {
                                    className: "flex items-center gap-1.5 truncate",
                                    children: [
                                      e.jsx("span", { children: sObj?.symbol || "🎵" }),
                                      e.jsx("span", { className: "font-bold text-stone-800 truncate", children: sObj?.name || sId })
                                    ]
                                  }),
                                  e.jsxs("span", { className: "font-mono font-black text-amber-800 text-[11px] shrink-0", children: [vol, "%"] })
                                ]
                              });
                            })
                          })
                        ]
                      })
                    ]
                  }),

                  // Bottom preset actions
                  e.jsxs("div", {
                    className: "flex items-center justify-between gap-2 pt-3 border-t border-stone-100 text-xs",
                    children: [
                      // Test Mix Button
                      e.jsxs("button", {
                        type: "button",
                        onClick: () => handleTogglePresetPlay(preset),
                        className: `px-4 py-2 rounded-xl font-black flex items-center gap-2 transition-all cursor-pointer ${
                          isPlaying
                            ? "bg-amber-600 hover:bg-amber-700 text-white shadow-xs animate-pulse"
                            : "bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300"
                        }`,
                        children: [
                          e.jsx("span", { children: isPlaying ? "⏹️" : "▶️" }),
                          e.jsx("span", { children: isPlaying ? "توقف تست ترکیب" : "تست زنده ترکیب" })
                        ]
                      }),

                      e.jsxs("div", {
                        className: "flex items-center gap-1.5",
                        children: [
                          e.jsxs("button", {
                            type: "button",
                            onClick: () => setEditingPreset({ ...preset }),
                            className: "px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold transition-colors cursor-pointer flex items-center gap-1",
                            children: [
                              e.jsx("span", { children: "✏️" }),
                              e.jsx("span", { children: "تنظیم لایه‌ها" })
                            ]
                          }),
                          !preset.isDefault && e.jsx("button", {
                            type: "button",
                            onClick: () => handleDeletePreset(preset),
                            className: "p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors cursor-pointer",
                            title: "حذف ترکیب پیشنهادی",
                            children: "🗑️"
                          })
                        ]
                      })
                    ]
                  })
                ]
              });
            })
          })
        ]
      }),

      // TAB 3: UPLOAD SOUND
      activeTab === "upload" && e.jsx("div", {
        className: "bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/80 shadow-2xs space-y-6 max-w-3xl mx-auto",
        children: e.jsxs("div", {
          className: "space-y-5",
          children: [
            e.jsxs("div", {
              className: "pb-4 border-b border-stone-100",
              children: [
                e.jsx("h3", { className: "text-lg font-black text-stone-900", children: "آپلود فایل صوتی جدید برای میکسر کافئین" }),
                e.jsx("p", { className: "text-xs text-stone-600 mt-1", children: "فرمت‌های مجاز: MP3, WAV, OGG, M4A, AAC (حداکثر حجم ۲۵ مگابایت). صدا پس از آپلود در سرور ذخیره شده و فوراً در پنل دانش‌آموزان نمایان می‌گردد." })
              ]
            }),

            // File Drop Area
            e.jsxs("div", {
              className: `border-2 border-dashed rounded-3xl p-6 sm:p-8 text-center transition-all ${
                uploadFile ? "border-amber-500 bg-amber-50/40" : "border-stone-300 hover:border-amber-400 bg-stone-50/50"
              }`,
              children: [
                e.jsx("input", {
                  type: "file",
                  id: "audio-file-input",
                  accept: "audio/*,.mp3,.wav,.ogg,.m4a,.aac",
                  onChange: handleFileSelect,
                  className: "hidden"
                }),
                e.jsxs("label", {
                  htmlFor: "audio-file-input",
                  className: "cursor-pointer flex flex-col items-center justify-center gap-3",
                  children: [
                    e.jsx("div", {
                      className: "w-16 h-16 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center text-3xl shadow-xs",
                      children: uploadFile ? "🎵" : "☁️"
                    }),
                    e.jsxs("div", {
                      children: [
                        e.jsx("span", {
                          className: "text-sm font-black text-stone-900 block",
                          children: uploadFile ? uploadFile.name : "برای انتخاب یا کشیدن فایل صوتی اینجا کلیک کنید"
                        }),
                        e.jsx("span", {
                          className: "text-xs text-stone-500 block mt-1",
                          children: uploadFile
                            ? `حجم فایل: ${(uploadFile.size / (1024 * 1024)).toFixed(2)} مگابایت`
                            : "پشتیبانی از صدای باکیفیت و استریو"
                        })
                      ]
                    })
                  ]
                }),

                // Local Preview Player if file selected
                uploadPreviewUrl && e.jsxs("div", {
                  className: "mt-4 pt-4 border-t border-amber-200/60 flex items-center justify-center gap-3",
                  children: [
                    e.jsx("span", { className: "text-xs font-bold text-amber-900", children: "تست پیش‌نمایش قبل از ذخیره:" }),
                    e.jsx("audio", {
                      controls: true,
                      src: uploadPreviewUrl,
                      className: "h-9 max-w-xs"
                    })
                  ]
                })
              ]
            }),

            // Form inputs
            e.jsxs("div", {
              className: "grid grid-cols-1 sm:grid-cols-2 gap-4 text-right text-xs",
              children: [
                e.jsxs("div", {
                  className: "space-y-1.5",
                  children: [
                    e.jsx("label", { className: "font-bold text-stone-700", children: "عنوان صدا (فارسی):" }),
                    e.jsx("input", {
                      type: "text",
                      value: uploadMeta.name,
                      onChange: e => setUploadMeta(prev => ({ ...prev, name: e.target.value })),
                      placeholder: "مثال: باران ملایم جنگلی و پنجره چوبی",
                      className: "w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 font-bold focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                    })
                  ]
                }),
                e.jsxs("div", {
                  className: "space-y-1.5",
                  children: [
                    e.jsx("label", { className: "font-bold text-stone-700", children: "دسته‌بندی:" }),
                    e.jsxs("select", {
                      value: uploadMeta.category,
                      onChange: e => setUploadMeta(prev => ({ ...prev, category: e.target.value })),
                      className: "w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 font-bold focus:outline-none focus:ring-2 focus:ring-amber-500/30",
                      children: [
                        e.jsx("option", { value: "focus", children: "🧠 امواج مغزی و تمرکز" }),
                        e.jsx("option", { value: "nature", children: "🌲 طبیعت و باران" }),
                        e.jsx("option", { value: "cafe", children: "☕ کافه و مطالعه" }),
                        e.jsx("option", { value: "meditation", children: "🎐 ذن و آرامش" }),
                        e.jsx("option", { value: "noise", children: "📻 عایق صوتی و نویز" }),
                        e.jsx("option", { value: "custom", children: "🎵 سفارشی و متفرقه" })
                      ]
                    })
                  ]
                }),
                e.jsxs("div", {
                  className: "space-y-1.5",
                  children: [
                    e.jsx("label", { className: "font-bold text-stone-700", children: "نماد / ایموجی:" }),
                    e.jsx("input", {
                      type: "text",
                      value: uploadMeta.symbol,
                      onChange: e => setUploadMeta(prev => ({ ...prev, symbol: e.target.value })),
                      placeholder: "🌧️ یا ☕ یا 🧠",
                      className: "w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 text-center text-base focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                    })
                  ]
                }),
                e.jsxs("div", {
                  className: "space-y-1.5",
                  children: [
                    e.jsxs("div", {
                      className: "flex justify-between items-center",
                      children: [
                        e.jsx("label", { className: "font-bold text-stone-700", children: "ولوم پیشنهادی اولیه:" }),
                        e.jsxs("span", { className: "font-mono font-bold text-amber-800", children: [uploadMeta.defaultVolume, "%"] })
                      ]
                    }),
                    e.jsx("input", {
                      type: "range",
                      min: "0",
                      max: "100",
                      value: uploadMeta.defaultVolume,
                      onChange: e => setUploadMeta(prev => ({ ...prev, defaultVolume: Number(e.target.value) })),
                      className: "w-full h-2 mt-2 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-amber-700"
                    })
                  ]
                }),
                e.jsxs("div", {
                  className: "sm:col-span-2 space-y-1.5",
                  children: [
                    e.jsx("label", { className: "font-bold text-stone-700", children: "توضیحات کوتاه برای دانش‌آموز:" }),
                    e.jsx("textarea", {
                      rows: 2,
                      value: uploadMeta.description,
                      onChange: e => setUploadMeta(prev => ({ ...prev, description: e.target.value })),
                      placeholder: "توضیح دهید این صدا چه کاربردی در تمرکز دارد (مثلاً: ریتم آرام‌بخش برای حل تست‌های محاسباتی)...",
                      className: "w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                    })
                  ]
                })
              ]
            }),

            // Submit Button
            e.jsxs("div", {
              className: "flex items-center justify-end gap-3 pt-4 border-t border-stone-100",
              children: [
                e.jsx("button", {
                  type: "button",
                  onClick: () => {
                    setUploadFile(null);
                    setUploadPreviewUrl("");
                    setActiveTab("sounds");
                  },
                  className: "px-4 py-2.5 rounded-xl text-stone-600 hover:bg-stone-100 font-bold text-xs cursor-pointer",
                  children: "انصراف"
                }),
                e.jsxs("button", {
                  type: "button",
                  disabled: !uploadFile || isUploading,
                  onClick: handleExecuteUpload,
                  className: "px-6 py-2.5 rounded-xl bg-amber-700 hover:bg-amber-800 disabled:opacity-50 text-white font-black text-xs flex items-center gap-2 cursor-pointer shadow-xs",
                  children: [
                    isUploading && e.jsx("span", { className: "animate-spin", children: "⏳" }),
                    e.jsx("span", { children: isUploading ? "در حال آپلود و ذخیره‌سازی..." : "تأیید و ذخیره صدا در کاتالوگ" })
                  ]
                })
              ]
            })
          ]
        })
      }),

      // MODAL 1: Edit Sound Details
      editingSound && e.jsx(ds, {
        children: e.jsx("div", {
          onClick: () => setEditingSound(null),
          className: "fixed inset-0 z-[9999] bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto cursor-pointer",
          children: e.jsxs("div", {
            onClick: e => e.stopPropagation(),
            className: "bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-stone-200 cursor-default text-right text-xs",
            children: [
              e.jsxs("div", {
                className: "flex items-center justify-between pb-3 border-b border-stone-100",
                children: [
                  e.jsx("h3", { className: "text-base font-black text-stone-900", children: "ویرایش جزئیات صدای محیطی" }),
                  e.jsx("button", {
                    type: "button",
                    onClick: () => setEditingSound(null),
                    className: "p-1 rounded-lg text-stone-400 hover:text-stone-700",
                    children: "✕"
                  })
                ]
              }),
              e.jsxs("div", {
                className: "space-y-3",
                children: [
                  e.jsxs("div", {
                    className: "space-y-1",
                    children: [
                      e.jsx("label", { className: "font-bold text-stone-700", children: "عنوان صدا:" }),
                      e.jsx("input", {
                        type: "text",
                        value: editingSound.name,
                        onChange: e => setEditingSound(prev => ({ ...prev, name: e.target.value })),
                        className: "w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl font-bold"
                      })
                    ]
                  }),
                  e.jsxs("div", {
                    className: "grid grid-cols-2 gap-3",
                    children: [
                      e.jsxs("div", {
                        className: "space-y-1",
                        children: [
                          e.jsx("label", { className: "font-bold text-stone-700", children: "دسته‌بندی:" }),
                          e.jsxs("select", {
                            value: editingSound.category,
                            onChange: e => setEditingSound(prev => ({ ...prev, category: e.target.value })),
                            className: "w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl font-bold",
                            children: [
                              e.jsx("option", { value: "focus", children: "امواج مغزی" }),
                              e.jsx("option", { value: "nature", children: "طبیعت و باران" }),
                              e.jsx("option", { value: "cafe", children: "کافه و کتابخانه" }),
                              e.jsx("option", { value: "meditation", children: "ذن و آرامش" }),
                              e.jsx("option", { value: "noise", children: "عایق صوتی" }),
                              e.jsx("option", { value: "custom", children: "سفارشی" })
                            ]
                          })
                        ]
                      }),
                      e.jsxs("div", {
                        className: "space-y-1",
                        children: [
                          e.jsx("label", { className: "font-bold text-stone-700", children: "نماد / ایموجی:" }),
                          e.jsx("input", {
                            type: "text",
                            value: editingSound.symbol,
                            onChange: e => setEditingSound(prev => ({ ...prev, symbol: e.target.value })),
                            className: "w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-center text-base"
                          })
                        ]
                      })
                    ]
                  }),
                  e.jsxs("div", {
                    className: "space-y-1",
                    children: [
                      e.jsxs("div", {
                        className: "flex justify-between",
                        children: [
                          e.jsx("label", { className: "font-bold text-stone-700", children: "ولوم پیش‌فرض اولیه:" }),
                          e.jsxs("span", { className: "font-mono font-bold text-amber-800", children: [editingSound.defaultVolume, "%"] })
                        ]
                      }),
                      e.jsx("input", {
                        type: "range",
                        min: "0",
                        max: "100",
                        value: editingSound.defaultVolume,
                        onChange: e => setEditingSound(prev => ({ ...prev, defaultVolume: Number(e.target.value) })),
                        className: "w-full h-2 bg-stone-200 rounded-lg appearance-none accent-amber-700 cursor-pointer"
                      })
                    ]
                  }),
                  e.jsxs("div", {
                    className: "space-y-1",
                    children: [
                      e.jsx("label", { className: "font-bold text-stone-700", children: "توضیحات صدا:" }),
                      e.jsx("textarea", {
                        rows: 3,
                        value: editingSound.description || "",
                        onChange: e => setEditingSound(prev => ({ ...prev, description: e.target.value })),
                        className: "w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-800"
                      })
                    ]
                  })
                ]
              }),
              e.jsxs("div", {
                className: "flex justify-end gap-2 pt-3 border-t border-stone-100",
                children: [
                  e.jsx("button", {
                    type: "button",
                    onClick: () => setEditingSound(null),
                    className: "px-4 py-2 rounded-xl text-stone-600 hover:bg-stone-100 font-bold",
                    children: "انصراف"
                  }),
                  e.jsx("button", {
                    type: "button",
                    onClick: handleSaveSound,
                    className: "px-5 py-2 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-black shadow-xs",
                    children: "ذخیره تغییرات"
                  })
                ]
              })
            ]
          })
        })
      }),

      // MODAL 2: Edit/Create Preset with Multi-Track Volume Sliders
      editingPreset && e.jsx(ds, {
        children: e.jsx("div", {
          onClick: () => setEditingPreset(null),
          className: "fixed inset-0 z-[9999] bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto cursor-pointer",
          children: e.jsxs("div", {
            onClick: e => e.stopPropagation(),
            className: "bg-white rounded-3xl max-w-2xl w-full p-6 space-y-4 shadow-2xl border border-stone-200 cursor-default text-right text-xs max-h-[90vh] overflow-y-auto",
            children: [
              e.jsxs("div", {
                className: "flex items-center justify-between pb-3 border-b border-stone-100",
                children: [
                  e.jsx("h3", { className: "text-base font-black text-stone-900", children: "تنظیم ترکیب پیشنهادی و لایه‌های صوتی" }),
                  e.jsx("button", {
                    type: "button",
                    onClick: () => setEditingPreset(null),
                    className: "p-1 rounded-lg text-stone-400 hover:text-stone-700",
                    children: "✕"
                  })
                ]
              }),
              e.jsxs("div", {
                className: "space-y-4",
                children: [
                  e.jsxs("div", {
                    className: "grid grid-cols-1 sm:grid-cols-3 gap-3",
                    children: [
                      e.jsxs("div", {
                        className: "sm:col-span-2 space-y-1",
                        children: [
                          e.jsx("label", { className: "font-bold text-stone-700", children: "نام ترکیب پیشنهادی:" }),
                          e.jsx("input", {
                            type: "text",
                            value: editingPreset.name,
                            onChange: e => setEditingPreset(prev => ({ ...prev, name: e.target.value })),
                            placeholder: "مثال: اوج تمرکز شب امتحان",
                            className: "w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl font-bold"
                          })
                        ]
                      }),
                      e.jsxs("div", {
                        className: "space-y-1",
                        children: [
                          e.jsx("label", { className: "font-bold text-stone-700", children: "ایموجی / نماد:" }),
                          e.jsx("input", {
                            type: "text",
                            value: editingPreset.icon,
                            onChange: e => setEditingPreset(prev => ({ ...prev, icon: e.target.value })),
                            className: "w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-center text-base"
                          })
                        ]
                      })
                    ]
                  }),
                  e.jsxs("div", {
                    className: "space-y-1",
                    children: [
                      e.jsx("label", { className: "font-bold text-stone-700", children: "توضیحات ترکیب:" }),
                      e.jsx("input", {
                        type: "text",
                        value: editingPreset.description || "",
                        onChange: e => setEditingPreset(prev => ({ ...prev, description: e.target.value })),
                        placeholder: "هدف ترکیب (مثلاً هماهنگی امواج گاما با باران برای رفع حواس‌پرتی)",
                        className: "w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl"
                      })
                    ]
                  }),

                  // Multi-track sliders for every sound
                  e.jsxs("div", {
                    className: "space-y-2 pt-2 border-t border-stone-100",
                    children: [
                      e.jsx("label", { className: "font-black text-stone-800 block", children: "تنظیم لایه‌های صوتی و درصد هر صدا (میکسر چندکاناله):" }),
                      e.jsx("div", {
                        className: "grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-72 overflow-y-auto p-1 bg-stone-50 rounded-2xl border border-stone-200/80",
                        children: sounds.filter(s => s.isActive !== false).map(sound => {
                          const vol = editingPreset.volumes?.[sound.id] || 0;
                          return e.jsxs("div", {
                            key: sound.id,
                            className: `p-2.5 rounded-xl border transition-all ${
                              vol > 0 ? "bg-amber-50/80 border-amber-300 shadow-2xs" : "bg-white border-stone-200/70"
                            }`,
                            children: [
                              e.jsxs("div", {
                                className: "flex items-center justify-between gap-2 mb-1.5",
                                children: [
                                  e.jsxs("div", {
                                    className: "flex items-center gap-1.5 truncate",
                                    children: [
                                      e.jsx("span", { children: sound.symbol || "🎵" }),
                                      e.jsx("span", { className: "font-bold truncate text-stone-800", children: sound.name })
                                    ]
                                  }),
                                  e.jsxs("span", { className: "font-mono font-black text-amber-900 text-[11px] shrink-0", children: [vol, "%"] })
                                ]
                              }),
                              e.jsx("input", {
                                type: "range",
                                min: "0",
                                max: "100",
                                value: vol,
                                onChange: e => {
                                  const val = Number(e.target.value);
                                  setEditingPreset(prev => ({
                                    ...prev,
                                    volumes: {
                                      ...prev.volumes,
                                      [sound.id]: val
                                    }
                                  }));
                                },
                                className: "w-full h-1.5 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-amber-700"
                              })
                            ]
                          });
                        })
                      })
                    ]
                  })
                ]
              }),
              e.jsxs("div", {
                className: "flex justify-end gap-2 pt-3 border-t border-stone-100",
                children: [
                  e.jsx("button", {
                    type: "button",
                    onClick: () => setEditingPreset(null),
                    className: "px-4 py-2 rounded-xl text-stone-600 hover:bg-stone-100 font-bold",
                    children: "انصراف"
                  }),
                  e.jsx("button", {
                    type: "button",
                    onClick: handleSavePreset,
                    className: "px-6 py-2 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-black shadow-xs",
                    children: "ذخیره ترکیب پیشنهادی"
                  })
                ]
              })
            ]
          })
        })
      })
    ]
  });
}
