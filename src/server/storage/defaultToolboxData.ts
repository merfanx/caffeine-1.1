export interface AdmissionRecordItem {
  id: string;
  year: number;
  group: 'experimental' | 'math' | 'humanities' | 'art' | 'language';
  quotaRegion: 'region1' | 'region2' | 'region3' | 'shahed' | 'isargaran_5' | 'isargaran_25';
  rankQuota: number;
  rankCountry?: number;
  taraz: number;
  admittedMajor: string;
  admittedUniversity: string;
  admissionType: 'daily' | 'nightly' | 'pardis' | 'azad' | 'payame_noor' | 'non_profit';
  city?: string;
  gender?: 'male' | 'female';
  konkurPeriod?: 'ordibehesht' | 'tir' | 'both';
  averageKonkurPercent?: number;
  finalExamGpa?: number;
  notes?: string;
  updatedAt?: string;
}

export interface YearBenchmarkConfig {
  year: number;
  title: string;
  status: 'active' | 'archived' | 'draft';
  konkurWeightPercent: number;
  savabeghWeightPercent: number;
  periods: string[];
  description: string;
  benchmarks: Record<string, any>;
  finalExamBenchmarks: Record<string, any>;
  updatedAt: string;
}

export const DEFAULT_TOOLBOX_YEARS = [1404, 1403, 1402, 1401, 1400];

export function buildDefaultAdmissionsSeed(): AdmissionRecordItem[] {
  return [
    {
      id: 'adm-1403-001',
      year: 1403,
      group: 'experimental',
      quotaRegion: 'region1',
      rankQuota: 45,
      rankCountry: 72,
      taraz: 11850,
      admittedMajor: 'پزشکی',
      admittedUniversity: 'دانشگاه علوم پزشکی تهران',
      admissionType: 'daily',
      city: 'تهران',
      gender: 'male',
      konkurPeriod: 'tir',
      averageKonkurPercent: 82.4,
      finalExamGpa: 19.82,
      updatedAt: '2026-09-01T00:00:00.000Z'
    },
    {
      id: 'adm-1403-002',
      year: 1403,
      group: 'experimental',
      quotaRegion: 'region2',
      rankQuota: 120,
      rankCountry: 310,
      taraz: 11200,
      admittedMajor: 'دندان‌پزشکی',
      admittedUniversity: 'دانشگاه علوم پزشکی شهید بهشتی',
      admissionType: 'daily',
      city: 'اصفهان',
      gender: 'female',
      konkurPeriod: 'ordibehesht',
      averageKonkurPercent: 76.8,
      finalExamGpa: 19.65,
      updatedAt: '2026-09-01T00:00:00.000Z'
    },
    {
      id: 'adm-1403-003',
      year: 1403,
      group: 'math',
      quotaRegion: 'region1',
      rankQuota: 35,
      rankCountry: 48,
      taraz: 12100,
      admittedMajor: 'مهندسی کامپیوتر',
      admittedUniversity: 'دانشگاه صنعتی شریف',
      admissionType: 'daily',
      city: 'تهران',
      gender: 'male',
      konkurPeriod: 'tir',
      averageKonkurPercent: 88.5,
      finalExamGpa: 19.95,
      updatedAt: '2026-09-01T00:00:00.000Z'
    },
    {
      id: 'adm-1403-004',
      year: 1403,
      group: 'humanities',
      quotaRegion: 'region1',
      rankQuota: 18,
      rankCountry: 25,
      taraz: 11950,
      admittedMajor: 'حقوق',
      admittedUniversity: 'دانشگاه تهران',
      admissionType: 'daily',
      city: 'تهران',
      gender: 'female',
      konkurPeriod: 'tir',
      averageKonkurPercent: 84.0,
      finalExamGpa: 19.9,
      updatedAt: '2026-09-01T00:00:00.000Z'
    },
    {
      id: 'adm-1404-001',
      year: 1404,
      group: 'experimental',
      quotaRegion: 'region1',
      rankQuota: 55,
      rankCountry: 88,
      taraz: 11780,
      admittedMajor: 'پزشکی',
      admittedUniversity: 'دانشگاه علوم پزشکی تهران',
      admissionType: 'daily',
      city: 'تهران',
      gender: 'male',
      konkurPeriod: 'ordibehesht',
      averageKonkurPercent: 81.0,
      finalExamGpa: 19.75,
      updatedAt: '2026-09-10T00:00:00.000Z'
    }
  ];
}

export function buildDefaultBenchmarksSeed(): YearBenchmarkConfig[] {
  return [
    {
      year: 1404,
      title: 'کنکور سراسری سال ۱۴۰۴',
      status: 'active',
      konkurWeightPercent: 40,
      savabeghWeightPercent: 60,
      periods: ['ordibehesht', 'tir', 'forecast'],
      description: 'مدل محاسباتی مصوبه جدید شورای عالی انقلاب فرهنگی با تاثیر قطعی ۶۰ درصدی سوابق تحصیلی',
      benchmarks: {
        experimental: { topTaraz: 12500, medTaraz: 7500, stdDev: 1200 },
        math: { topTaraz: 12400, medTaraz: 7200, stdDev: 1150 },
        humanities: { topTaraz: 12300, medTaraz: 7100, stdDev: 1100 }
      },
      finalExamBenchmarks: {
        twelfthGpaMultiplier: 10000 / 20,
        eleventhGpaMultiplier: 10000 / 20
      },
      updatedAt: '2026-09-10T00:00:00.000Z'
    },
    {
      year: 1403,
      title: 'کنکور سراسری سال ۱۴۰۳',
      status: 'archived',
      konkurWeightPercent: 50,
      savabeghWeightPercent: 50,
      periods: ['ordibehesht', 'tir'],
      description: 'داده‌ها و قبولی‌های واقعی کنکور دو نوبته اردیبهشت و تیر ۱۴۰۳',
      benchmarks: {
        experimental: { topTaraz: 12200, medTaraz: 7400, stdDev: 1180 },
        math: { topTaraz: 12100, medTaraz: 7100, stdDev: 1130 },
        humanities: { topTaraz: 12000, medTaraz: 7000, stdDev: 1080 }
      },
      finalExamBenchmarks: {
        twelfthGpaMultiplier: 10000 / 20
      },
      updatedAt: '2026-09-01T00:00:00.000Z'
    }
  ];
}
