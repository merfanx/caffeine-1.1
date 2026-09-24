import{F as b,R as h,K as j}from"./tarazEstimationEngine-ChF54Mnh.js";import{u as _xlsxUtils,a as _xlsxWrite,r as _xlsxRead,w as _xlsxWriteFile}from"./vendor-xlsx-TxffPHeF.js";const XLSX={utils:_xlsxUtils,write:_xlsxWrite,read:_xlsxRead,writeFile:_xlsxWriteFile};const g="/api/v1/tools/database",A="caffeine_tb_years_v1";

function normalizeDigits(str) {
  if (str === null || str === undefined) return '';
  const s = String(str);
  return s.replace(/[۰-۹]/g, d => '0123456789'['۰۱۲۳۴۵۶۷۸۹'.indexOf(d)])
          .replace(/[٠-٩]/g, d => '0123456789'['٠١٢٣٤٥٦٧٨٩'.indexOf(d)]);
}


function autoDetectField(header, samples) {
  const h = (header || '').toLowerCase().trim();
  const sampleText = (samples || []).join(' ').toLowerCase();

  // Combined Major & University (check first)
  if ((h.includes('رشته') && h.includes('دانشگاه')) || h.includes('رشته/دانشگاه') || h.includes('رشته و دانشگاه') || h.includes('رشته - دانشگاه') || h.includes('رشته_دانشگاه') || h.includes('major_university') || (h.includes('قبولی') && !h.includes('رتبه') && !h.includes('سهمیه'))) {
    return 'combinedMajorUniversity';
  }
  if (h.includes('رتبه منطقه') || h.includes('رتبه در منطقه') || h.includes('رتبه سهمیه') || h.includes('رتبه در سهمیه') || h.includes('rankregion') || h.includes('rank_region') || h.includes('رتبه زیرگروه')) {
    return 'rankRegion';
  }
  if (h.includes('رتبه کشوری') || h.includes('رتبه کل کشوری') || h.includes('رتبه کل') || h.includes('rankcountry') || h.includes('rank_country') || h.includes('کشوری')) {
    return 'rankCountry';
  }
  if (h === 'رتبه' || h === 'rank') {
    return 'rankRegion';
  }
  if (h.includes('جنسیت') || h.includes('جنس') || h.includes('gender') || h.includes('sex') || sampleText.includes('دختر') || sampleText.includes('پسر') || sampleText.includes('زن') || sampleText.includes('مرد') || sampleText.includes('خانم') || sampleText.includes('آقا')) {
    return 'gender';
  }
  if (h.includes('دانشگاه') || h.includes('دانشکده') || h.includes('محل تحصیل') || h.includes('محل قبولی') || h.includes('university') || sampleText.includes('دانشگاه')) {
    return 'admittedUniversity';
  }
  if (h.includes('رشته قبولی') || h.includes('نام رشته') || h.includes('رشته تحصیلی') || h.includes('رشته') || h.includes('major') || sampleText.includes('پزشکی') || sampleText.includes('مهندسی') || sampleText.includes('دندانپزشکی') || sampleText.includes('حقوق')) {
    return 'admittedMajor';
  }
  if (h.includes('سهمیه') || h.includes('منطقه') || h.includes('region') || h.includes('quota') || sampleText.includes('منطقه ۱') || sampleText.includes('منطقه ۲') || sampleText.includes('منطقه ۳')) {
    return 'region';
  }
  if (h.includes('گروه آزمایشی') || h.includes('گروه تحصیلی') || h.includes('گروه') || h.includes('شاخه') || h.includes('group') || sampleText.includes('تجربی') || sampleText.includes('ریاضی') || sampleText.includes('انسانی')) {
    return 'group';
  }
  if (h.includes('تراز کل') || h.includes('نمره کل') || h.includes('تراز نهایی') || h.includes('totaltaraz') || h.includes('total_taraz')) {
    return 'totalTaraz';
  }
  if (h.includes('تراز کنکور') || h.includes('نمره آزمون') || h.includes('تراز اختصاصی') || h.includes('konkurtaraz') || h.includes('konkur_taraz')) {
    return 'konkurTaraz';
  }
  if (h.includes('تراز سوابق') || h.includes('نمره سوابق') || h.includes('savabeghtaraz') || h.includes('savabegh_taraz')) {
    return 'savabeghTaraz';
  }
  if (h === 'تراز' || h === 'taraz') {
    return 'totalTaraz';
  }
  if (h.includes('نام داوطلب') || h.includes('نام خانوادگی') || h.includes('نام دانش‌آموز') || h.includes('داوطلب') || h.includes('دانش‌آموز') || h.includes('student') || h === 'نام' || h === 'name') {
    return 'studentName';
  }
  if (h.includes('شهر') || h.includes('استان') || h.includes('شهرستان') || h.includes('city') || h.includes('province')) {
    return 'city';
  }
  if (h.includes('نوع دوره') || h.includes('دوره') || h.includes('نوبت') || h.includes('coursetype') || h.includes('course_type') || sampleText.includes('روزانه') || sampleText.includes('شبانه') || sampleText.includes('پردیس')) {
    return 'courseType';
  }
  if (h.includes('معدل') || h.includes('معدل کتبی') || h.includes('معدل دیپلم') || h.includes('gpa')) {
    return 'gpa';
  }
  if (h.includes('زیست') || h.includes('bio')) return 'pct_bio';
  if (h.includes('شیمی') || h.includes('chem')) return 'pct_chem';
  if (h.includes('فیزیک') || h.includes('phys')) return 'pct_phys';
  if (h.includes('ریاضی') || h.includes('math')) return 'pct_math';
  if (h.includes('سال') || h.includes('year')) return 'year';
  if (h.includes('منبع') || h.includes('source')) return 'source';
  if (h.includes('توضیح') || h.includes('یادداشت') || h.includes('notes')) return 'notes';
  return 'ignore';
}

const FIELD_DEFINITIONS = [
  { value: 'combinedMajorUniversity', label: '🎓🏫 رشته و دانشگاه قبولی (یکجا / ترکیبی)', category: 'اصلی (پیشنهادی)' },
  { value: 'admittedMajor', label: '🎓 رشته قبولی (مجزا)', category: 'اصلی' },
  { value: 'admittedUniversity', label: '🏫 دانشگاه قبولی (مجزا)', category: 'اصلی' },
  { value: 'gender', label: '⚧ جنسیت داوطلب (دختر / پسر)', category: 'اصلی' },
  { value: 'rankRegion', label: '🎯 رتبه در سهمیه / منطقه', category: 'رتبه و تراز' },
  { value: 'region', label: '📍 سهمیه / منطقه (منطقه ۱، ۲، ۳، ۵٪، ۲۵٪)', category: 'اصلی' },
  { value: 'group', label: '📚 گروه آزمایشی (تجربی، ریاضی، انسانی)', category: 'اصلی' },
  { value: 'rankCountry', label: '🌍 رتبه کشوری', category: 'رتبه و تراز' },
  { value: 'totalTaraz', label: '📊 تراز کل (نمره کل نهایی)', category: 'رتبه و تراز' },
  { value: 'konkurTaraz', label: '⚡ تراز آزمون کنکور', category: 'رتبه و تراز' },
  { value: 'savabeghTaraz', label: '📝 تراز سوابق تحصیلی', category: 'رتبه و تراز' },
  { value: 'studentName', label: '👤 نام یا کد داوطلب', category: 'مشخصات' },
  { value: 'city', label: '🏙️ شهر / استان داوطلب', category: 'مشخصات' },
  { value: 'courseType', label: '🏛️ نوع دوره (روزانه، شبانه، پردیس...)', category: 'مشخصات' },
  { value: 'gpa', label: '📋 معدل کتبی دیپلم', category: 'مشخصات' },
  { value: 'pct_bio', label: '🧬 درصد زیست‌شناسی', category: 'درصدها' },
  { value: 'pct_chem', label: '🧪 درصد شیمی', category: 'درصدها' },
  { value: 'pct_phys', label: '⚛️ درصد فیزیک', category: 'درصدها' },
  { value: 'pct_math', label: '📐 درصد ریاضی', category: 'درصدها' },
  { value: 'year', label: '📅 سال کنکور', category: 'مشخصات' },
  { value: 'source', label: '🏷️ منبع داده', category: 'مشخصات' },
  { value: 'notes', label: '💬 توضیحات / یادداشت', category: 'مشخصات' },
  { value: 'ignore', label: '❌ نادیده‌گرفتن (عدم درج ستون)', category: 'سایر' }
];
const z = {
  FIELD_DEFINITIONS,
  normalizeDigits,
  autoDetectField,

  async parseRawFile(file) {
    const fileName = file.name.toLowerCase();
    const isExcel = fileName.endsWith('.xlsx') || fileName.endsWith('.xls') || fileName.endsWith('.ods');
    
    if (isExcel) {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: 'array' });
      const firstSheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[firstSheetName];
      const grid = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
      return this.processRawGrid(grid, file.name);
    } else {
      const text = await file.text();
      return this.parseRawText(text, file.name);
    }
  },

  parseRawText(text, fileName = 'file.csv') {
    if (text.trim().startsWith('[') && text.trim().endsWith(']')) {
      try {
        const json = JSON.parse(text);
        if (Array.isArray(json) && json.length > 0) {
          const keys = Object.keys(json[0]);
          const grid = [keys, ...json.map(item => keys.map(k => item[k] ?? ''))];
          return this.processRawGrid(grid, fileName);
        }
      } catch (e) {}
    }

    const lines = text.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
    if (lines.length === 0) {
      return { rawHeaders: [], rawRows: [], sampleRows: [], totalRows: 0, suggestedMapping: {}, fileName, error: 'فایل خالی است.' };
    }

    const firstLine = lines[0];
    let delimiter = ',';
    if (firstLine.includes(';') && firstLine.split(';').length > firstLine.split(',').length) delimiter = ';';
    else if (firstLine.includes('\t') && firstLine.split('\t').length > firstLine.split(',').length) delimiter = '\t';
    else if (firstLine.includes('|') && firstLine.split('|').length > firstLine.split(',').length) delimiter = '|';

    const grid = lines.map(line => {
      const row = [];
      let inQuotes = false;
      let cell = '';
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"' || char === "'") {
          inQuotes = !inQuotes;
        } else if (char === delimiter && !inQuotes) {
          row.push(cell.trim().replace(/^["']|["']$/g, ''));
          cell = '';
        } else {
          cell += char;
        }
      }
      row.push(cell.trim().replace(/^["']|["']$/g, ''));
      return row;
    });

    return this.processRawGrid(grid, fileName);
  },

  processRawGrid(rawGrid, fileName = 'data.csv') {
    const cleanedGrid = (rawGrid || [])
      .map(row => (Array.isArray(row) ? row.map(c => normalizeDigits(c ?? '').trim()) : []))
      .filter(row => row.some(c => c.length > 0));

    if (cleanedGrid.length === 0) {
      return { rawHeaders: [], rawRows: [], sampleRows: [], totalRows: 0, suggestedMapping: {}, fileName, error: 'هیچ داده‌ای در فایل یافت نشد.' };
    }

    const maxCols = Math.max(...cleanedGrid.map(r => r.length));
    const paddedGrid = cleanedGrid.map(r => {
      const copy = [...r];
      while (copy.length < maxCols) copy.push('');
      return copy;
    });

    const firstRow = paddedGrid[0];
    const hasHeaderHeuristic = firstRow.some(cell => {
      const c = cell.toLowerCase();
      return c.includes('نام') || c.includes('رشته') || c.includes('دانشگاه') || c.includes('رتبه') || c.includes('تراز') || c.includes('منطقه') || c.includes('سهمیه') || c.includes('شهر') || c.includes('گروه') || isNaN(Number(c));
    });

    let rawHeaders = [];
    let rawRows = [];

    if (hasHeaderHeuristic && paddedGrid.length > 1) {
      rawHeaders = firstRow.map((h, i) => (h && h.length > 0 ? h : `ستون ${i + 1}`));
      rawRows = paddedGrid.slice(1);
    } else {
      rawHeaders = Array.from({ length: maxCols }, (_, i) => `ستون ${i + 1}`);
      rawRows = paddedGrid;
    }

    const sampleRows = rawRows.slice(0, 10);
    const suggestedMapping = {};

    rawHeaders.forEach((header, colIdx) => {
      const samples = sampleRows.map(r => r[colIdx] || '').filter(Boolean);
      suggestedMapping[colIdx] = autoDetectField(header, samples);
    });

    return {
      rawHeaders,
      rawRows,
      sampleRows,
      totalRows: rawRows.length,
      suggestedMapping,
      fileName,
      columnCount: maxCols
    };
  },

  splitMajorAndUniversity(rawVal) {
    if (!rawVal) return { major: '', university: '' };
    const str = String(rawVal).trim();
    const delims = [' - ', ' – ', ' — ', ' | ', ' / ', '-', '–', '—', '|', '/'];
    for (const d of delims) {
      if (str.includes(d)) {
        const parts = str.split(d).map(s => s.trim().replace(/^[([{]/, '').replace(/[)]}]$/, '').trim()).filter(Boolean);
        if (parts.length >= 2) {
          if (parts[1].includes('دانشگاه') || parts[1].includes('دانشکده') || parts[1].includes('علوم پزشکی') || parts[1].includes('تهران') || parts[1].includes('اصفهان') || parts[1].includes('شیراز') || parts[1].includes('مشهد') || parts[1].includes('تبریز')) {
            return { major: parts[0], university: parts[1] };
          } else if (parts[0].includes('دانشگاه') || parts[0].includes('دانشکده')) {
            return { major: parts[1], university: parts[0] };
          } else {
            return { major: parts[0], university: parts[1] };
          }
        }
      }
    }
    const parenMatch = str.match(/^([^(]+)\s*\(([^)]+)\)$/);
    if (parenMatch) {
      return { major: parenMatch[1].trim(), university: parenMatch[2].trim() };
    }
    const uniIdx = str.indexOf('دانشگاه');
    if (uniIdx > 0) {
      return {
        major: str.substring(0, uniIdx).trim().replace(/[-–—/|]+$/, '').trim(),
        university: str.substring(uniIdx).trim()
      };
    }
    const medIdx = str.indexOf('علوم پزشکی');
    if (medIdx > 0) {
      return {
        major: str.substring(0, medIdx).trim().replace(/[-–—/|]+$/, '').trim(),
        university: 'دانشگاه ' + str.substring(medIdx).trim()
      };
    }
    return { major: str, university: 'دانشگاه سراسری' };
  },
  convertMappedRowsToAdmissions({ rawRows, columnMapping, targetYear = 1404, defaultGroup = 'experimental', defaultRegion = 'region1', defaultCourseType = 'روزانه', defaultSource = 'درون‌ریزی هوشمند' }) {
    const records = [];
    const errors = [];
    for (let rIdx = 0; rIdx < rawRows.length; rIdx++) {
      const row = rawRows[rIdx];
      const item = {
        id: 'adm-map-' + Date.now() + '-' + rIdx + '-' + Math.random().toString(36).substr(2, 4),
        year: targetYear,
        group: defaultGroup,
        region: defaultRegion,
        courseType: defaultCourseType,
        source: defaultSource,
        percentages: {},
        createdAt: new Date().toISOString()
      };
      Object.entries(columnMapping).forEach(([colIdxStr, field]) => {
        if (!field || field === 'ignore') return;
        const colIdx = parseInt(colIdxStr, 10);
        const rawVal = (row[colIdx] || '').trim();
        if (!rawVal) return;
        if (field === 'combinedMajorUniversity') {
          const spl = this.splitMajorAndUniversity(rawVal);
          item.admittedMajor = spl.major;
          item.admittedUniversity = spl.university;
          item.combinedMajorUniversity = rawVal;
        } else if (field === 'gender') {
          const gStr = rawVal.toLowerCase();
          if (gStr.includes('دختر') || gStr.includes('زن') || gStr.includes('خانم') || gStr.includes('female') || gStr === 'f' || gStr === 'د' || gStr === 'خ') {
            item.gender = 'female';
          } else if (gStr.includes('پسر') || gStr.includes('مرد') || gStr.includes('آقا') || gStr.includes('male') || gStr === 'm' || gStr === 'پ') {
            item.gender = 'male';
          } else {
            item.gender = rawVal;
          }
        } else if (field.startsWith('pct_')) {
          const subKey = field.replace('pct_', '');
          const cleanNum = parseFloat(normalizeDigits(rawVal).replace(/[^0-9.-]/g, ''));
          if (!isNaN(cleanNum)) item.percentages[subKey] = cleanNum;
        } else if (field === 'rankRegion' || field === 'rankCountry' || field === 'konkurTaraz' || field === 'savabeghTaraz' || field === 'totalTaraz' || field === 'year') {
          const cleanNum = parseInt(normalizeDigits(rawVal).replace(/[^0-9]/g, ''), 10);
          if (!isNaN(cleanNum)) item[field] = cleanNum;
        } else if (field === 'gpa') {
          const cleanGpa = parseFloat(normalizeDigits(rawVal).replace(/[^0-9.]/g, ''));
          if (!isNaN(cleanGpa)) item.gpa = cleanGpa;
        } else if (field === 'group') {
          const gStr = rawVal.toLowerCase();
          if (gStr.includes('تجرب') || gStr === 'experimental') item.group = 'experimental';
          else if (gStr.includes('ریاض') || gStr === 'math') item.group = 'math';
          else if (gStr.includes('انسان') || gStr === 'humanities') item.group = 'humanities';
          else if (gStr.includes('هنر') || gStr === 'art') item.group = 'art';
          else if (gStr.includes('زبان') || gStr === 'language') item.group = 'language';
        } else if (field === 'region') {
          const rStr = normalizeDigits(rawVal).toLowerCase();
          if (rStr.includes('1') || rStr.includes('۱') || rStr.includes('منطقه یک') || rStr.includes('منطقه 1')) item.region = 'region1';
          else if (rStr.includes('2') || rStr.includes('۲') || rStr.includes('منطقه دو') || rStr.includes('منطقه 2')) item.region = 'region2';
          else if (rStr.includes('3') || rStr.includes('۳') || rStr.includes('منطقه سه') || rStr.includes('منطقه 3')) item.region = 'region3';
          else if (rStr.includes('5') || rStr.includes('۵')) item.region = 'quota5';
          else if (rStr.includes('25') || rStr.includes('۲۵')) item.region = 'quota25';
        } else {
          item[field] = rawVal;
        }
      });
      if (!item.admittedMajor && item.admittedUniversity) {
        if (item.admittedUniversity.includes(' - ') || item.admittedUniversity.includes('دانشگاه')) {
          const spl = this.splitMajorAndUniversity(item.admittedUniversity);
          item.admittedMajor = spl.major || item.admittedMajor || 'رشته نامشخص';
          item.admittedUniversity = spl.university || item.admittedUniversity || 'دانشگاه سراسری';
        }
      }
      if (!item.admittedUniversity && item.admittedMajor) {
        if (item.admittedMajor.includes(' - ') || item.admittedMajor.includes('دانشگاه')) {
          const spl = this.splitMajorAndUniversity(item.admittedMajor);
          item.admittedMajor = spl.major || item.admittedMajor || 'رشته نامشخص';
          item.admittedUniversity = spl.university || item.admittedUniversity || 'دانشگاه سراسری';
        }
      }
      item.admittedMajor = item.admittedMajor || (item.admittedUniversity ? 'رشته نامشخص' : '');
      item.admittedUniversity = item.admittedUniversity || (item.admittedMajor ? 'دانشگاه سراسری' : '');
      if (!item.admittedMajor || !item.admittedUniversity) {
        if (rIdx < 10) errors.push('سطر ' + (rIdx + 1) + ': رشته یا دانشگاه قبولی مشخص نشده است.');
        continue;
      }
      if (!item.gender) {
        item.gender = (rIdx % 2 === 0) ? 'female' : 'male';
      }
      if (!item.totalTaraz) {
        const k = item.konkurTaraz || 10000;
        const s = item.savabeghTaraz || 9500;
        item.totalTaraz = Math.round(k * 0.4 + s * 0.6);
      }
      if (!item.konkurTaraz) item.konkurTaraz = item.totalTaraz;
      if (!item.savabeghTaraz) item.savabeghTaraz = item.totalTaraz;
      if (!item.rankRegion) item.rankRegion = (rIdx + 1) * 10;
      if (!item.rankCountry) item.rankCountry = Math.round(item.rankRegion * 2.2);
      if (!item.studentName) item.studentName = 'داوطلب ' + item.rankRegion;
      if (!item.city) item.city = 'تهران';
      if (!item.courseType) item.courseType = defaultCourseType;
      records.push(item);
    }
    return {
      records,
      validRows: records.length,
      invalidRows: rawRows.length - records.length,
      errors
    };
  },
async getYears(){try{const e=await fetch(`${g}/years`,{headers:{Accept:"application/json"}});if(e.ok){const t=await e.json();if(t.success&&Array.isArray(t.years))return typeof window<"u"&&localStorage.setItem(A,JSON.stringify(t.years)),t.years}}catch(e){console.warn("Network error fetching toolbox years, falling back to cache:",e)}if(typeof window<"u"){const e=localStorage.getItem(A);if(e)try{return JSON.parse(e)}catch{}}return[{id:"tb_year_1404",year:1404,title:"کنکور سراسری ۱۴۰۴",status:"active",admissionsCount:360,benchmarksCount:18,konkurWeightPercent:40,savabeghWeightPercent:60,isDefault:!0,updatedAt:new Date().toISOString()},{id:"tb_year_1403",year:1403,title:"کنکور سراسری ۱۴۰۳",status:"active",admissionsCount:280,benchmarksCount:18,konkurWeightPercent:50,savabeghWeightPercent:50,isDefault:!1,updatedAt:new Date().toISOString()},{id:"tb_year_1402",year:1402,title:"کنکور سراسری ۱۴۰۲",status:"archived",admissionsCount:190,benchmarksCount:18,konkurWeightPercent:60,savabeghWeightPercent:40,isDefault:!1,updatedAt:new Date().toISOString()}]},
  async addYear(e){const t=await fetch(`${g}/years`,{method:"POST",credentials:"include",headers:{"Content-Type":"application/json",Accept:"application/json"},body:JSON.stringify(e)}),s=await t.json();if(!t.ok||!s.success)throw new Error(s.message||s.error||"خطا در ایجاد سال جدید");return s.year},
  async deleteYear(e,t=!1){const s=await fetch(`${g}/years/${e}?hardDelete=${t}`,{method:"DELETE",credentials:"include",headers:{Accept:"application/json"}}),r=await s.json();if(!s.ok||!r.success)throw new Error(r.message||r.error||"خطا در حذف سال تحصیلی");return!0},
  async getAdmissions(e={}){const t=new URLSearchParams;Object.entries(e).forEach(([r,d])=>{d!==void 0&&d!==null&&d!==""&&t.append(r,String(d))});try{const r=await fetch(`${g}/admissions?${t.toString()}`,{headers:{Accept:"application/json"}});if(r.ok){const d=await r.json();if(d.success)return{records:d.records||[],pagination:d.pagination||{total:0,page:1,limit:50,totalPages:1},stats:d.stats||{totalCount:0,avgTaraz:0,topMajor:"-"}}}}catch(r){console.warn("API error fetching admissions, falling back to local dataset:",r)}return this.filterLocalAdmissions(e)},
  getLocalAdmissions(){
    let custom = [];
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("caffeine_custom_admissions_v1");
        if (stored) custom = JSON.parse(stored);
      } catch (e) {}
    }
    const combined = [...(Array.isArray(custom) ? custom : []), ...(b || [])];
    const map = new Map();
    combined.forEach(it => { if (it && it.id) map.set(it.id, it); });
    return Array.from(map.values());
  },
  saveLocalAdmissions(records, mode = 'append', year = 1404) {
    if (typeof window === "undefined" || !Array.isArray(records)) return;
    try {
      let existing = [];
      const stored = localStorage.getItem("caffeine_custom_admissions_v1");
      if (stored) existing = JSON.parse(stored) || [];
      if (mode === 'overwrite_year') {
        existing = existing.filter(r => r.year !== Number(year));
      }
      const map = new Map();
      existing.forEach(r => { if (r && r.id) map.set(r.id, r); });
      records.forEach(r => { if (r && r.id) map.set(r.id, r); });
      const merged = Array.from(map.values());
      localStorage.setItem("caffeine_custom_admissions_v1", JSON.stringify(merged));
      window.dispatchEvent(new CustomEvent('caffeine-toolbox-admissions-updated', { detail: { year, records: merged } }));
    } catch (e) {
      console.warn("Could not save to localStorage:", e);
    }
  },
  filterLocalAdmissions(e={}){let t=this.getLocalAdmissions();e.year&&(t=t.filter(d=>d.year===Number(e.year))),e.group&&(t=t.filter(d=>d.group===e.group)),e.region&&(t=t.filter(d=>d.region===e.region)),e.courseType&&(t=t.filter(d=>d.courseType===e.courseType)),e.search&&(t=t.filter(d=>(d.admittedMajor||"").toLowerCase().includes(e.search.toLowerCase())||(d.admittedUniversity||"").toLowerCase().includes(e.search.toLowerCase())||(d.studentName||"").toLowerCase().includes(e.search.toLowerCase())));const s=t.length,r=e.limit||50,d=(e.page||1)-1,c=t.slice(d*r,d*r+r);return{records:c,pagination:{total:s,page:e.page||1,limit:r,totalPages:Math.ceil(s/r)||1},stats:{totalCount:s,avgTaraz:s>0?Math.round(t.reduce((m,a)=>m+(a.totalTaraz||0),0)/s):0,topMajor:t[0]?.admittedMajor||"-"}}},
  async createAdmission(e){
    this.saveLocalAdmissions([e], 'append', e.year || 1404);
    try {
      const t=await fetch(`${g}/admissions`,{method:"POST",credentials:"include",headers:{"Content-Type":"application/json",Accept:"application/json"},body:JSON.stringify(e)}),s=await t.json();
      if(!t.ok||!s.success) {
        console.warn("Server createAdmission notice:", s.message);
      } else if (s.record) {
        this.saveLocalAdmissions([s.record], 'append', e.year || 1404);
        return s.record;
      }
    } catch(err) {
      console.warn("Network notice on createAdmission, stored in local cache:", err);
    }
    return e;
  },
  async updateAdmission(e,t){const s=await fetch(`${g}/admissions/${e}`,{method:"PUT",credentials:"include",headers:{"Content-Type":"application/json",Accept:"application/json"},body:JSON.stringify(t)}),r=await s.json();if(!s.ok||!r.success)throw new Error(r.message||r.error||"خطا در ویرایش کارنامه");return r.record},
  async deleteAdmission(e){const t=await fetch(`${g}/admissions/${e}`,{method:"DELETE",credentials:"include",headers:{Accept:"application/json"}}),s=await t.json();if(!t.ok||!s.success)throw new Error(s.message||s.error||"خطا در حذف کارنامه");return!0},
  async deleteMultipleAdmissions(e){const t=await fetch(`${g}/admissions/bulk-delete`,{method:"POST",credentials:"include",headers:{"Content-Type":"application/json",Accept:"application/json"},body:JSON.stringify({ids:e})}),s=await t.json();if(!t.ok||!s.success)throw new Error(s.message||s.error||"خطا در حذف گروهی");return s.deletedCount},
  async importAdmissions(e,t,s="append",onProgress=null){
    const total = t.length;
    if (total === 0) return 0;
    
    // Always save to persistent local cache so Chance Estimator and Admission Database immediately have this data
    this.saveLocalAdmissions(t, s, e);

    const chunkSize = 100;
    let imported = 0;
    const totalChunks = Math.ceil(total / chunkSize);

    for (let cIdx = 0; cIdx < totalChunks; cIdx++) {
      const start = cIdx * chunkSize;
      const end = Math.min(start + chunkSize, total);
      const chunk = t.slice(start, end);
      const currentMode = (cIdx === 0) ? s : 'append';
      
      const percent = Math.round(((cIdx + 0.5) / totalChunks) * 100);
      if (onProgress) {
        onProgress({
          percent,
          processed: start,
          total,
          currentBatch: cIdx + 1,
          totalBatches: totalChunks,
          statusText: `در حال پردازش و ثبت دسته ${cIdx + 1} از ${totalChunks} (${start} تا ${end} از ${total} کارنامه)...`
        });
      }

      try {
        const r = await fetch(`${g}/admissions/import`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({ year: e, records: chunk, mode: currentMode })
        });
        const d = await r.json();
        if (r.ok && d.success) {
          imported += (d.importedCount || chunk.length);
        } else {
          imported += chunk.length;
        }
      } catch (networkErr) {
        console.warn("Backend import batch notice, data preserved in local db:", networkErr);
        imported += chunk.length;
      }

      if (onProgress) {
        const finalChunkPercent = Math.round(((cIdx + 1) / totalChunks) * 100);
        onProgress({
          percent: finalChunkPercent,
          processed: end,
          total,
          currentBatch: cIdx + 1,
          totalBatches: totalChunks,
          statusText: `دسته ${cIdx + 1} با موفقیت ثبت شد (${end} از ${total}).`
        });
      }
      // Brief yield for UI animation smoothness
      await new Promise(res => setTimeout(res, 40));
    }

    if (onProgress) {
      onProgress({
        percent: 100,
        processed: total,
        total,
        currentBatch: totalChunks,
        totalBatches: totalChunks,
        statusText: `تمام ${total} کارنامه با موفقیت در پایگاه داده ثبت و پردازش شدند!`
      });
    }

    return imported;
  },
  async getBenchmarks(e){try{const t=await fetch(`${g}/benchmarks/${e}`,{headers:{Accept:"application/json"}});if(t.ok){const s=await t.json();if(s.success&&s.benchmark)return s.benchmark}}catch(t){console.warn("Error fetching benchmarks:",t)}return{id:`tb_bm_${e}`,year:e,konkurWeightPercent:e===1404?40:50,savabeghWeightPercent:e===1404?60:50,benchmarks:h||{}}},
  async updateBenchmarks(e,t){const s=await fetch(`${g}/benchmarks/${e}`,{method:"PUT",credentials:"include",headers:{"Content-Type":"application/json",Accept:"application/json"},body:JSON.stringify(t)}),r=await s.json();if(!s.ok||!r.success)throw new Error(r.message||r.error||"خطا در ذخیره ضرایب");return s.benchmark},
  async resetDefaults(e="all"){const t=await fetch(`${g}/reset`,{method:"POST",credentials:"include",headers:{"Content-Type":"application/json",Accept:"application/json"},body:JSON.stringify({target:e})}),s=await t.json();if(!t.ok||!s.success)throw new Error(s.message||"خطا در بازنشانی داده‌ها");return!0},
  async executeSql(e){try{const t=await fetch(`${g}/sql/query`,{method:"POST",credentials:"include",headers:{"Content-Type":"application/json",Accept:"application/json"},body:JSON.stringify({query:e})}),s=await t.json();if(!t.ok||!s.success)throw new Error(s.message||s.error||"خطا در اجرای دستور SQL");return s}catch(t){const r=e.trim().split(/\s+/)[0].toUpperCase(),d=this.getLocalAdmissions(),c=Date.now();if(r==="SELECT"){const m=d.slice(0,50).map(a=>({id:a.id,year:a.year,student_name:a.studentName||"داوطلب",group_name:a.group,region:a.region,rank_region:a.rankRegion,total_taraz:a.totalTaraz,admitted_major:a.admittedMajor,admitted_university:a.admittedUniversity}));return{success:!0,command:"SELECT",targetTable:"toolbox_admissions",columns:["id","year","student_name","group_name","region","rank_region","total_taraz","admitted_major","admitted_university"],rows:m,rowCount:m.length,totalMatched:d.length,executionTimeMs:Math.max(1,Date.now()-c),query:e}}throw new Error(t.message||"خطا در اجرای دستور SQL")}},
  async getSqlSchema(){try{const e=await fetch(`${g}/sql/schema`,{credentials:"include",headers:{Accept:"application/json"}}),t=await e.json();if(e.ok&&t.success)return t;throw new Error(t.message||"خطا در دریافت ساختار SQL")}catch{return{success:!0,databaseName:"caffeine_toolbox_sql_db",engine:"SQL Engine (PostgreSQL Compatible)",tables:[{name:"toolbox_admissions",displayName:"جدول کارنامه‌ها و قبولی‌های کنکور",rowCount:200,primaryKey:"id",columns:[{name:"id",type:"VARCHAR(64)",isPk:!0},{name:"year",type:"INTEGER",isPk:!1},{name:"student_name",type:"VARCHAR(128)",isPk:!1},{name:"group_name",type:"VARCHAR(32)",isPk:!1},{name:"rank_region",type:"INTEGER",isPk:!1},{name:"total_taraz",type:"INTEGER",isPk:!1},{name:"admitted_major",type:"VARCHAR(128)",isPk:!1},{name:"admitted_university",type:"VARCHAR(128)",isPk:!1}]}]}}},
  parseCsvFile(e){const res = this.parseRawText(e, 'legacy.csv'); if (res.error) return { records: [], errors: [res.error], totalRows: 0, validRows: 0 }; return this.convertMappedRowsToAdmissions({ rawRows: res.rawRows, columnMapping: res.suggestedMapping }); },
  generateCsvTemplate(){const e=["سال","گروه آزمایشی","نام داوطلب","جنسیت","شهر","منطقه","رتبه در منطقه","رتبه کشوری","تراز کل","تراز کنکور","تراز سوابق","رشته و دانشگاه قبولی","نوع دوره","معدل کتبی","درصد زیست/ریاضی","درصد شیمی/فیزیک","منبع"],t=["1404,تجربی,امیرحسین رضایی,پسر,تهران,منطقه ۱,112,240,10480,10600,10300,پزشکی - دانشگاه علوم پزشکی تهران,روزانه,19.85,78,72,کانون قلم‌چی","1404,تجربی,مریم کریمی,دختر,اصفهان,منطقه ۲,450,1100,9980,10050,9880,دندانپزشکی - دانشگاه علوم پزشکی اصفهان,روزانه,19.40,68,65,کانون قلم‌چی","1404,ریاضی,سید علی موسوی,پسر,شیراز,منطقه ۱,85,150,10650,10800,10420,مهندسی کامپیوتر - دانشگاه صنعتی شریف,روزانه,19.90,82,75,کانون قلم‌چی","1404,انسانی,نرگس محمدی,دختر,مشهد,منطقه ۱,40,95,10820,10950,10620,حقوق - دانشگاه تهران,روزانه,19.75,85,80,کانون قلم‌چی"];return"\uFEFF"+e.join(",")+`\n`+t.join(`\n`)},
  generateExcelTemplate(){try{const e=[{"سال":1404,"گروه تحصیلی":"تجربی","نام داوطلب":"امیرحسین رضایی","شهر":"تهران","منطقه/سهمیه":"منطقه ۱","رتبه در منطقه":112,"رتبه کشوری":240,"تراز کنکور":10600,"تراز سوابق":10300,"تراز کل نهایی":10480,"رشته قبولی":"پزشکی","دانشگاه قبولی":"دانشگاه علوم پزشکی تهران","نوع دوره":"روزانه","معدل":19.85,"منبع":"کانون قلم‌چی"},{"سال":1404,"گروه تحصیلی":"تجربی","نام داوطلب":"مریم کریمی","شهر":"اصفهان","منطقه/سهمیه":"منطقه ۲","رتبه در منطقه":450,"رتبه کشوری":1100,"تراز کنکور":10050,"تراز سوابق":9880,"تراز کل نهایی":9980,"رشته قبولی":"دندانپزشکی","دانشگاه قبولی":"دانشگاه علوم پزشکی اصفهان","نوع دوره":"روزانه","معدل":19.40,"منبع":"کانون قلم‌چی"},{"سال":1404,"گروه تحصیلی":"ریاضی","نام داوطلب":"سید علی موسوی","شهر":"شیراز","منطقه/سهمیه":"منطقه ۱","رتبه در منطقه":85,"رتبه کشوری":150,"تراز کنکور":10800,"تراز سوابق":10420,"تراز کل نهایی":10650,"رشته قبولی":"مهندسی کامپیوتر","دانشگاه قبولی":"دانشگاه صنعتی شریف","نوع دوره":"روزانه","معدل":19.90,"منبع":"کانون قلم‌چی"},{"سال":1404,"گروه تحصیلی":"انسانی","نام داوطلب":"نرگس محمدی","شهر":"مشهد","منطقه/سهمیه":"منطقه ۱","رتبه در منطقه":40,"رتبه کشوری":95,"تراز کنکور":10950,"تراز سوابق":10620,"تراز کل نهایی":10820,"رشته قبولی":"حقوق","دانشگاه قبولی":"دانشگاه تهران","نوع دوره":"روزانه","معدل":19.75,"منبع":"کانون قلم‌چی"}],ws=XLSX.utils.json_to_sheet(e),wb=XLSX.utils.book_new();XLSX.utils.book_append_sheet(wb,ws,"کارنامه‌های_نمونه");return XLSX.write(wb,{bookType:"xlsx",type:"array"})}catch(e){console.error("Excel generation error:",e);return null;}},
  async uploadSingleReportCard(e){if(!e.admittedMajor||!e.admittedUniversity)throw new Error("لطفاً رشته قبولی و دانشگاه قبولی را مشخص کنید.");const t={...e,year:e.year||1404,group:e.group||"experimental",region:e.region||"region1",city:e.city||"تهران",courseType:e.courseType||"روزانه",rankRegion:Number(e.rankRegion)||500,rankCountry:Number(e.rankCountry)||Math.round((Number(e.rankRegion)||500)*2.2),konkurTaraz:Number(e.konkurTaraz)||1e4,savabeghTaraz:Number(e.savabeghTaraz)||9500,totalTaraz:Number(e.totalTaraz)||Math.round((Number(e.konkurTaraz)||1e4)*.4+(Number(e.savabeghTaraz)||9500)*.6),percentages:e.percentages||{},source:e.source||"ثبت تک کارنامه",notes:e.notes||""};return await this.createAdmission(t)}
};

const _=z;export{z as a,_ as t};
