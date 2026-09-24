import https from 'https';

export interface FastCreatTimeResult {
  timezone: string;
  action: 'time';
  zone: 'fa' | 'en';
  time: string;
  houre: string;
  minute: string;
  second: string;
}

export interface FastCreatDateResult {
  timezone: string;
  action: 'date';
  zone: 'fa' | 'en';
  date: string;
  year: string;
  month: string;
  day: string;
  year_name?: string;
  month_name?: string;
  day_name?: string;
  season_name?: string;
}

export interface ComprehensiveTimezoneResponse {
  ok: boolean;
  source: 'fast-creat.ir' | 'local_fallback';
  timezone: string;
  zone: 'fa' | 'en';
  time: string;
  houre: string;
  minute: string;
  second: string;
  date: string;
  year: string;
  month: string;
  day: string;
  year_name: string;
  month_name: string;
  day_name: string;
  season_name: string;
  formattedPersian: string;
  formattedFull: string;
  timestamp: number;
}

const DEFAULT_API_KEY = '6186174516:XMZDrWcJyNHVGxT@Api_ManagerRoBot';

function getApiKey(): string {
  return process.env.FAST_CREAT_API_KEY || DEFAULT_API_KEY;
}

// In-memory cache with short TTL (5 seconds for time, 60 seconds for date)
const cache: {
  dateFa?: { data: FastCreatDateResult; expiresAt: number };
  timeFa?: { data: FastCreatTimeResult; expiresAt: number };
  dateEn?: { data: FastCreatDateResult; expiresAt: number };
  timeEn?: { data: FastCreatTimeResult; expiresAt: number };
} = {};

function fetchJson(url: string, timeoutMs: number = 3500): Promise<any> {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { timeout: timeoutMs }, (res) => {
      let raw = '';
      res.on('data', chunk => raw += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(raw);
          resolve(parsed);
        } catch (e) {
          reject(new Error(`Invalid JSON response: ${raw.slice(0, 100)}`));
        }
      });
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('FastCreat API request timed out'));
    });

    req.on('error', (err) => {
      reject(err);
    });
  });
}

// Persian Animal Year Calculation
const PERSIAN_ANIMAL_YEARS = [
  'مار', 'اسب', 'گوسفند', 'میمون', 'مرغ', 'سگ', 'خوک', 'موش', 'گاو', 'پلنگ', 'خرگوش', 'نهنگ'
];

function getAnimalYear(shamsiYear: number): string {
  const mod = (shamsiYear - 1392) % 12;
  const index = (mod + 12) % 12;
  return PERSIAN_ANIMAL_YEARS[index] || 'نهنگ';
}

// Persian Season & Months Calculation Fallback
const PERSIAN_MONTHS = [
  'فروردین', 'اردیبهشت', 'خرداد',
  'تیر', 'مرداد', 'شهریور',
  'مهر', 'آبان', 'آذر',
  'دی', 'بهمن', 'اسفند'
];

const PERSIAN_DAYS = [
  'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنج‌شنبه', 'جمعه', 'شنبه'
];

function getLocalFallback(zone: 'fa' | 'en'): ComprehensiveTimezoneResponse {
  const now = new Date();
  const tehranTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Tehran' }));
  
  const h = String(tehranTime.getHours()).padStart(2, '0');
  const m = String(tehranTime.getMinutes()).padStart(2, '0');
  const s = String(tehranTime.getSeconds()).padStart(2, '0');

  // Jalali formatting using Intl
  const faDateParts = new Intl.DateTimeFormat('fa-IR-u-nu-latn', {
    timeZone: 'Asia/Tehran',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    weekday: 'long'
  }).formatToParts(now);

  const year = faDateParts.find(p => p.type === 'year')?.value || '1405';
  const month = faDateParts.find(p => p.type === 'month')?.value || '06';
  const day = faDateParts.find(p => p.type === 'day')?.value || '27';
  const day_name = faDateParts.find(p => p.type === 'weekday')?.value || PERSIAN_DAYS[tehranTime.getDay()];
  
  const mNum = parseInt(month, 10);
  const month_name = PERSIAN_MONTHS[mNum - 1] || 'شهریور';
  const season_name = mNum <= 3 ? 'بهار' : mNum <= 6 ? 'تابستان' : mNum <= 9 ? 'پاییز' : 'زمستان';
  const year_name = getAnimalYear(parseInt(year, 10));

  if (zone === 'en') {
    const enDayName = now.toLocaleDateString('en-US', { weekday: 'long', timeZone: 'UTC' });
    const enMonthName = now.toLocaleDateString('en-US', { month: 'long', timeZone: 'UTC' });
    const enYear = String(now.getUTCFullYear());
    const enMonth = String(now.getUTCMonth() + 1).padStart(2, '0');
    const enDay = String(now.getUTCDate()).padStart(2, '0');
    const utcH = String(now.getUTCHours()).padStart(2, '0');
    const utcM = String(now.getUTCMinutes()).padStart(2, '0');
    const utcS = String(now.getUTCSeconds()).padStart(2, '0');

    return {
      ok: true,
      source: 'local_fallback',
      timezone: 'UTC',
      zone: 'en',
      time: `${utcH}:${utcM}:${utcS}`,
      houre: utcH,
      minute: utcM,
      second: utcS,
      date: `${enYear}/${enMonth}/${enDay}`,
      year: enYear,
      month: enMonth,
      day: enDay,
      year_name: '',
      month_name: enMonthName,
      day_name: enDayName,
      season_name: '',
      formattedPersian: `${enDayName}, ${enDay} ${enMonthName} ${enYear}`,
      formattedFull: `${enDayName}, ${enDay} ${enMonthName} ${enYear} ${utcH}:${utcM}:${utcS} UTC`,
      timestamp: now.getTime()
    };
  }

  return {
    ok: true,
    source: 'local_fallback',
    timezone: 'Asia/Tehran',
    zone: 'fa',
    time: `${h}:${m}:${s}`,
    houre: h,
    minute: m,
    second: s,
    date: `${year}/${month}/${day}`,
    year,
    month,
    day,
    year_name,
    month_name,
    day_name,
    season_name,
    formattedPersian: `${day_name} ${day} ${month_name} ${year} (سال ${year_name})`,
    formattedFull: `${day_name} ${day} ${month_name} ${year} ساعت ${h}:${m}:${s}`,
    timestamp: now.getTime()
  };
}

export async function fetchFastCreatDate(zone: 'fa' | 'en' = 'fa'): Promise<FastCreatDateResult> {
  const cacheKey = zone === 'fa' ? 'dateFa' : 'dateEn';
  const cached = cache[cacheKey];
  const now = Date.now();
  if (cached && cached.expiresAt > now) {
    return cached.data;
  }

  const apiKey = getApiKey();
  const url = `https://api.fast-creat.ir/timezone?apikey=${encodeURIComponent(apiKey)}&action=date&zone=${zone}`;

  try {
    const res = await fetchJson(url);
    if (res && res.ok && res.result) {
      cache[cacheKey] = { data: res.result, expiresAt: now + 60000 }; // 1 min cache
      return res.result;
    }
    throw new Error('API returned non-ok status');
  } catch (err) {
    // Fallback to local
    const fallback = getLocalFallback(zone);
    return {
      timezone: fallback.timezone,
      action: 'date',
      zone,
      date: fallback.date,
      year: fallback.year,
      month: fallback.month,
      day: fallback.day,
      year_name: fallback.year_name,
      month_name: fallback.month_name,
      day_name: fallback.day_name,
      season_name: fallback.season_name
    };
  }
}

export async function fetchFastCreatTime(zone: 'fa' | 'en' = 'fa'): Promise<FastCreatTimeResult> {
  const cacheKey = zone === 'fa' ? 'timeFa' : 'timeEn';
  const cached = cache[cacheKey];
  const now = Date.now();
  if (cached && cached.expiresAt > now) {
    return cached.data;
  }

  const apiKey = getApiKey();
  const url = `https://api.fast-creat.ir/timezone?apikey=${encodeURIComponent(apiKey)}&action=time&zone=${zone}`;

  try {
    const res = await fetchJson(url);
    if (res && res.ok && res.result) {
      cache[cacheKey] = { data: res.result, expiresAt: now + 5000 }; // 5 sec cache
      return res.result;
    }
    throw new Error('API returned non-ok status');
  } catch (err) {
    const fallback = getLocalFallback(zone);
    return {
      timezone: fallback.timezone,
      action: 'time',
      zone,
      time: fallback.time,
      houre: fallback.houre,
      minute: fallback.minute,
      second: fallback.second
    };
  }
}

export async function getLiveTimezoneInfo(zone: 'fa' | 'en' = 'fa'): Promise<ComprehensiveTimezoneResponse> {
  try {
    const [dateRes, timeRes] = await Promise.all([
      fetchFastCreatDate(zone),
      fetchFastCreatTime(zone)
    ]);

    const yearName = dateRes.year_name || getAnimalYear(parseInt(dateRes.year, 10) || 1405);
    const dayName = dateRes.day_name || 'امروز';
    const monthName = dateRes.month_name || '';
    const seasonName = dateRes.season_name || '';

    const formattedPersian = zone === 'fa'
      ? `${dayName} ${dateRes.day} ${monthName} ${dateRes.year}${yearName ? ` (سال ${yearName})` : ''}`
      : `${dayName}, ${dateRes.day} ${monthName} ${dateRes.year}`;

    const formattedFull = zone === 'fa'
      ? `${dayName} ${dateRes.day} ${monthName} ${dateRes.year} - ساعت ${timeRes.time}`
      : `${dayName}, ${dateRes.day} ${monthName} ${dateRes.year} - ${timeRes.time} ${timeRes.timezone}`;

    return {
      ok: true,
      source: 'fast-creat.ir',
      timezone: timeRes.timezone || (zone === 'fa' ? 'Asia/Tehran' : 'UTC'),
      zone,
      time: timeRes.time,
      houre: timeRes.houre,
      minute: timeRes.minute,
      second: timeRes.second,
      date: dateRes.date,
      year: dateRes.year,
      month: dateRes.month,
      day: dateRes.day,
      year_name: yearName,
      month_name: monthName,
      day_name: dayName,
      season_name: seasonName,
      formattedPersian,
      formattedFull,
      timestamp: Date.now()
    };
  } catch (err) {
    return getLocalFallback(zone);
  }
}
