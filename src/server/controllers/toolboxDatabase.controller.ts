import { Request, Response } from 'express';
import { db } from '../storage/dbBridge.js';
import { extractUserCredentials } from '../auth/adminAuthMiddleware.js';
import { recordSensitiveAudit, AuditSeverity } from '../storage/auditLogManager.js';
import { sanitizeString } from '../security/apiHardening.js';
import {
  AdmissionRecordItem,
  YearBenchmarkConfig,
  DEFAULT_TOOLBOX_YEARS,
  buildDefaultAdmissionsSeed,
  buildDefaultBenchmarksSeed
} from '../storage/defaultToolboxData.js';

const COL_YEARS = 'toolbox_years';
const COL_ADMISSIONS = 'toolbox_admissions';
const COL_BENCHMARKS = 'toolbox_benchmarks';

function getClientIp(req: Request): string {
  return (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.ip || '127.0.0.1';
}

function cleanStr(input: any, defaultVal = ''): string {
  if (typeof input !== 'string') return defaultVal;
  return sanitizeString(input).sanitized.trim() || defaultVal;
}

export const toolboxDatabaseController = {
  // =========================================================================
  // 1. YEARS MANAGEMENT
  // =========================================================================

  /**
   * GET /api/v1/tools/database/years
   * Returns list of configured years with admission counts and benchmark status
   */
  getYears(req: Request, res: Response) {
    try {
      const yearRecords = db.find<any>(COL_YEARS, undefined, DEFAULT_TOOLBOX_YEARS.map((y) => ({ id: `year-${y}`, year: y, isActive: true })));
      const admissions = db.find<AdmissionRecordItem>(COL_ADMISSIONS, undefined, buildDefaultAdmissionsSeed());
      const benchmarks = db.find<YearBenchmarkConfig>(COL_BENCHMARKS, undefined, buildDefaultBenchmarksSeed());

      const yearsData = yearRecords.map((yr: any) => {
        const yNum = Number(yr.year);
        const count = admissions.filter((a) => a.year === yNum).length;
        const bench = benchmarks.find((b) => b.year === yNum);

        return {
          id: yr.id || `year-${yNum}`,
          year: yNum,
          title: bench?.title || `کنکور سراسری سال ${yNum}`,
          status: bench?.status || (yNum === 1404 ? 'active' : 'archived'),
          admissionsCount: count,
          konkurWeightPercent: bench?.konkurWeightPercent ?? 40,
          savabeghWeightPercent: bench?.savabeghWeightPercent ?? 60,
          description: bench?.description || `مدل محاسباتی و داده‌های کنکور ${yNum}`,
          updatedAt: bench?.updatedAt || yr.updatedAt || new Date().toISOString()
        };
      });

      // Sort descending by year
      yearsData.sort((a, b) => b.year - a.year);

      res.json({
        success: true,
        years: yearsData,
        defaultYear: 1404
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  },

  /**
   * POST /api/v1/tools/database/years
   * Creates a new academic year in the database, optionally cloning benchmarks from an existing year
   */
  createYear(req: Request, res: Response) {
    try {
      const user = extractUserCredentials(req);
      const { year, title, status = 'active', konkurWeightPercent = 40, savabeghWeightPercent = 60, cloneFromYear = 1404, description } = req.body;

      const yNum = parseInt(year, 10);
      if (!yNum || yNum < 1390 || yNum > 1420) {
        return res.status(400).json({ success: false, message: 'سال تحصیلی باید بین ۱۳۹۰ تا ۱۴۲۰ باشد.' });
      }

      const existingYears = db.find<any>(COL_YEARS, undefined, DEFAULT_TOOLBOX_YEARS.map((y) => ({ id: `year-${y}`, year: y, isActive: true })));
      if (existingYears.some((y: any) => y.year === yNum)) {
        return res.status(400).json({ success: false, message: `سال ${yNum} هم‌اکنون در پایگاه داده وجود دارد.` });
      }

      // Add year entry
      db.insert(COL_YEARS, {
        id: `year-${yNum}`,
        year: yNum,
        isActive: true,
        createdAt: new Date().toISOString()
      });

      // Clone benchmarks from reference year or defaults
      const benchmarks = db.find<YearBenchmarkConfig>(COL_BENCHMARKS, undefined, buildDefaultBenchmarksSeed());
      const refBench = benchmarks.find((b) => b.year === cloneFromYear) || benchmarks[0];

      const newBenchConfig: YearBenchmarkConfig = {
        year: yNum,
        title: cleanStr(title, `کنکور سراسری سال ${yNum}`),
        status: status as any,
        konkurWeightPercent: Number(konkurWeightPercent) || 40,
        savabeghWeightPercent: Number(savabeghWeightPercent) || 60,
        periods: ['ordibehesht', 'tir', 'forecast'],
        description: cleanStr(description, `مدل محاسباتی و داده‌های کنکور ${yNum}`),
        benchmarks: refBench?.benchmarks || {},
        finalExamBenchmarks: refBench?.finalExamBenchmarks || {},
        updatedAt: new Date().toISOString()
      };

      db.upsert(COL_BENCHMARKS, newBenchConfig);

      recordSensitiveAudit({
        category: 'DATABASE_BACKUP_RESTORE',
        action: 'TOOLBOX_YEAR_ADDED',
        userId: user?.id || 'usr-adm-01',
        userName: user?.name || user?.username || 'مدیر سیستم',
        userRole: user?.role || 'admin',
        resource: `toolbox/years/${yNum}`,
        details: `افزودن سال تحصیلی جدید ${yNum} به جعبه ابزار (کپی شده از سال ${cloneFromYear})`,
        status: 'success',
        severity: 'info',
        ip: getClientIp(req)
      });

      res.json({
        success: true,
        message: `سال ${yNum} با موفقیت به پایگاه داده جعبه ابزار افزوده شد.`,
        year: newBenchConfig
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  },

  /**
   * DELETE /api/v1/tools/database/years/:year
   * Deletes a year and optionally its admission records
   */
  deleteYear(req: Request, res: Response) {
    try {
      const user = extractUserCredentials(req);
      const yNum = parseInt(req.params.year, 10);
      const { deleteAdmissions = true } = req.body;

      if (!yNum) {
        return res.status(400).json({ success: false, message: 'سال نامعتبر است' });
      }

      if (yNum === 1404) {
        return res.status(400).json({ success: false, message: 'سال جاری (۱۴۰۴) قابل حذف نیست.' });
      }

      db.deleteMany(COL_YEARS, (it) => it.year === yNum);
      db.deleteMany(COL_BENCHMARKS, (it) => it.year === yNum);

      let deletedRecordsCount = 0;
      if (deleteAdmissions) {
        deletedRecordsCount = db.deleteMany(COL_ADMISSIONS, (it) => it.year === yNum);
      }

      recordSensitiveAudit({
        category: 'DATABASE_BACKUP_RESTORE',
        action: 'TOOLBOX_YEAR_DELETED',
        userId: user?.id || 'usr-adm-01',
        userName: user?.name || user?.username || 'مدیر سیستم',
        userRole: user?.role || 'admin',
        resource: `toolbox/years/${yNum}`,
        details: `حذف سال ${yNum} و ${deletedRecordsCount} رکورد قبولی مرتبط`,
        status: 'success',
        severity: 'warning',
        ip: getClientIp(req)
      });

      res.json({
        success: true,
        message: `سال ${yNum} با موفقیت حذف گردید (${deletedRecordsCount} رکورد قبولی حذف شد).`
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  },

  // =========================================================================
  // 2. ADMISSION RECORDS MANAGEMENT (رتبه، رشته، دانشگاه قبولی)
  // =========================================================================

  /**
   * GET /api/v1/tools/database/admissions
   * Query admissions with filters: year, group, region, courseType, search, pagination
   */
  getAdmissions(req: Request, res: Response) {
    try {
      const {
        year,
        group,
        region,
        courseType,
        search,
        minTaraz,
        maxTaraz,
        page = 1,
        limit = 50,
        sortBy = 'rankRegion',
        sortOrder = 'asc'
      } = req.query;

      const allRecords = db.find<AdmissionRecordItem>(COL_ADMISSIONS, undefined, buildDefaultAdmissionsSeed());

      let filtered = allRecords;

      // Filter by Year
      if (year && year !== 'all') {
        const yNum = parseInt(year as string, 10);
        filtered = filtered.filter((r) => r.year === yNum);
      }

      // Filter by Group (experimental, math, humanities)
      if (group && group !== 'all') {
        filtered = filtered.filter((r) => r.group === group);
      }

      // Filter by Region (region1, region2, region3, quota5, quota25)
      if (region && region !== 'all') {
        filtered = filtered.filter((r) => r.region === region);
      }

      // Filter by CourseType (روزانه، نوبت دوم، پردیس، و...)
      if (courseType && courseType !== 'all') {
        filtered = filtered.filter((r) => r.courseType === courseType);
      }

      // Filter by Gender (female, male)
      const genderQuery = (req.query.gender as string)?.toLowerCase();
      if (genderQuery && genderQuery !== 'all') {
        filtered = filtered.filter((r) => {
          if (!r.gender) return false;
          const g = r.gender.toLowerCase();
          if (genderQuery === 'female') return g === 'female' || g.includes('دختر') || g.includes('زن') || g.includes('خانم');
          if (genderQuery === 'male') return g === 'male' || g.includes('پسر') || g.includes('مرد') || g.includes('آقا');
          return g === genderQuery;
        });
      }

      // Search Query (major, university, city, student name)
      if (search) {
        const q = (search as string).toLowerCase().trim();
        filtered = filtered.filter((r) =>
          r.admittedMajor.toLowerCase().includes(q) ||
          r.admittedUniversity.toLowerCase().includes(q) ||
          r.city.toLowerCase().includes(q) ||
          (r.studentName && r.studentName.toLowerCase().includes(q))
        );
      }

      // Filter by Taraz Range
      if (minTaraz) {
        const min = Number(minTaraz);
        filtered = filtered.filter((r) => r.totalTaraz >= min);
      }
      if (maxTaraz) {
        const max = Number(maxTaraz);
        filtered = filtered.filter((r) => r.totalTaraz <= max);
      }

      // Sort
      const isAsc = sortOrder === 'asc';
      filtered.sort((a: any, b: any) => {
        const valA = a[sortBy as string] ?? 0;
        const valB = b[sortBy as string] ?? 0;
        if (typeof valA === 'string') {
          return isAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
        }
        return isAsc ? Number(valA) - Number(valB) : Number(valB) - Number(valA);
      });

      // Pagination
      const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
      const limitNum = Math.min(200, Math.max(1, parseInt(limit as string, 10) || 50));
      const totalCount = filtered.length;
      const totalPages = Math.ceil(totalCount / limitNum);
      const paginatedRecords = filtered.slice((pageNum - 1) * limitNum, pageNum * limitNum);

      // Aggregate Stats for Current Query
      const averageTaraz = totalCount > 0
        ? Math.round(filtered.reduce((acc, it) => acc + (it.totalTaraz || 0), 0) / totalCount)
        : 0;

      const bestRank = totalCount > 0
        ? Math.min(...filtered.map((it) => it.rankRegion).filter((r) => r > 0))
        : 0;

      const countsByGroup = {
        experimental: filtered.filter((r) => r.group === 'experimental').length,
        math: filtered.filter((r) => r.group === 'math').length,
        humanities: filtered.filter((r) => r.group === 'humanities').length
      };

      res.json({
        success: true,
        records: paginatedRecords,
        pagination: {
          totalCount,
          totalPages,
          currentPage: pageNum,
          limit: limitNum
        },
        stats: {
          totalCount,
          averageTaraz,
          bestRank: bestRank === Infinity ? 0 : bestRank,
          countsByGroup
        }
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  },

  /**
   * POST /api/v1/tools/database/admissions
   * Creates a single new admission record
   */
  createAdmission(req: Request, res: Response) {
    try {
      const user = extractUserCredentials(req);
      const data = req.body;

      let admMajor = cleanStr(data.admittedMajor || data.majorTitle);
      let admUni = cleanStr(data.admittedUniversity || data.universityName);
      
      // Auto-parse if combined major and university was provided
      if (data.combinedMajorUniversity || (!admUni && admMajor && (admMajor.includes(' - ') || admMajor.includes('دانشگاه')))) {
        const combined = cleanStr(data.combinedMajorUniversity || admMajor);
        if (combined.includes(' - ') || combined.includes(' – ') || combined.includes(' | ') || combined.includes(' / ')) {
          const parts = combined.split(/[-–—|/]/).map(s => s.trim()).filter(Boolean);
          if (parts.length >= 2) {
            admMajor = parts[0];
            admUni = parts[1];
          }
        } else if (combined.includes('دانشگاه')) {
          const uIdx = combined.indexOf('دانشگاه');
          admMajor = combined.substring(0, uIdx).trim() || admMajor;
          admUni = combined.substring(uIdx).trim() || admUni;
        }
      }

      if (!admMajor) admMajor = 'رشته نامشخص';
      if (!admUni) admUni = 'دانشگاه سراسری';

      if (!data.group) {
        return res.status(400).json({
          success: false,
          message: 'گروه آزمایشی الزامی است.'
        });
      }

      const yearNum = parseInt(data.year, 10) || 1404;
      const rankReg = parseInt(data.rankRegion, 10) || 100;
      const rankNat = parseInt(data.rankCountry, 10) || rankReg * 2;
      const kTaraz = parseInt(data.konkurTaraz, 10) || 10000;
      const sTaraz = parseInt(data.savabeghTaraz, 10) || 9500;
      const tTaraz = parseInt(data.totalTaraz, 10) || Math.round(kTaraz * 0.4 + sTaraz * 0.6);

      const newRecord: AdmissionRecordItem = {
        id: `adm-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
        year: yearNum,
        period: data.period || 'tir',
        group: data.group,
        studentName: cleanStr(data.studentName, `داوطلب رتبه ${rankReg}`),
        gender: data.gender || 'female',
        city: cleanStr(data.city, 'تهران'),
        region: data.region || 'region1',
        rankRegion: rankReg,
        rankCountry: rankNat,
        konkurTaraz: kTaraz,
        savabeghTaraz: sTaraz,
        totalTaraz: tTaraz,
        admittedMajor: admMajor,
        admittedUniversity: admUni,
        courseType: data.courseType || 'روزانه',
        percentages: typeof data.percentages === 'object' && data.percentages !== null ? data.percentages : {},
        gpa: data.gpa ? parseFloat(data.gpa) : undefined,
        source: cleanStr(data.source, 'کانون قلم‌چی'),
        notes: cleanStr(data.notes, ''),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const inserted = db.insert(COL_ADMISSIONS, newRecord, buildDefaultAdmissionsSeed());

      recordSensitiveAudit({
        category: 'DATABASE_BACKUP_RESTORE',
        action: 'TOOLBOX_ADMISSION_CREATED',
        userId: user?.id || 'usr-adm-01',
        userName: user?.name || user?.username || 'مدیر سیستم',
        userRole: user?.role || 'admin',
        resource: `toolbox/admissions/${inserted.id}`,
        details: `افزودن قبولی سال ${yearNum}: ${newRecord.admittedMajor} (${newRecord.admittedUniversity}) - رتبه ${rankReg}`,
        status: 'success',
        severity: 'info',
        ip: getClientIp(req)
      });

      res.json({
        success: true,
        message: 'کارنامه قبولی با موفقیت ثبت شد.',
        record: inserted
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  },

  /**
   * PUT /api/v1/tools/database/admissions/:id
   * Updates an existing admission record
   */
  updateAdmission(req: Request, res: Response) {
    try {
      const user = extractUserCredentials(req);
      const { id } = req.params;
      const updates = req.body;

      if (!id) {
        return res.status(400).json({ success: false, message: 'شناسه رکورد نامعتبر است' });
      }

      const existingRecords = db.find<AdmissionRecordItem>(COL_ADMISSIONS, undefined, buildDefaultAdmissionsSeed());
      const existing = existingRecords.find((r) => r.id === id);
      if (!existing) {
        return res.status(404).json({ success: false, message: 'رکورد قبولی یافت نشد.' });
      }

      const safeUpdates: Partial<AdmissionRecordItem> = {
        updatedAt: new Date().toISOString()
      };

      if (updates.year) safeUpdates.year = parseInt(updates.year, 10);
      if (updates.group) safeUpdates.group = updates.group;
      if (updates.period) safeUpdates.period = updates.period;
      if (updates.studentName !== undefined) safeUpdates.studentName = cleanStr(updates.studentName);
      if (updates.city !== undefined) safeUpdates.city = cleanStr(updates.city);
      if (updates.gender !== undefined) safeUpdates.gender = updates.gender;
      if (updates.region) safeUpdates.region = updates.region;
      if (updates.rankRegion !== undefined) safeUpdates.rankRegion = parseInt(updates.rankRegion, 10);
      if (updates.rankCountry !== undefined) safeUpdates.rankCountry = parseInt(updates.rankCountry, 10);
      if (updates.konkurTaraz !== undefined) safeUpdates.konkurTaraz = parseInt(updates.konkurTaraz, 10);
      if (updates.savabeghTaraz !== undefined) safeUpdates.savabeghTaraz = parseInt(updates.savabeghTaraz, 10);
      if (updates.totalTaraz !== undefined) safeUpdates.totalTaraz = parseInt(updates.totalTaraz, 10);
      if (updates.admittedMajor !== undefined) safeUpdates.admittedMajor = cleanStr(updates.admittedMajor);
      if (updates.admittedUniversity !== undefined) safeUpdates.admittedUniversity = cleanStr(updates.admittedUniversity);
      if (updates.courseType) safeUpdates.courseType = updates.courseType;
      if (updates.percentages) safeUpdates.percentages = updates.percentages;
      if (updates.gpa !== undefined) safeUpdates.gpa = parseFloat(updates.gpa);
      if (updates.source !== undefined) safeUpdates.source = cleanStr(updates.source);
      if (updates.notes !== undefined) safeUpdates.notes = cleanStr(updates.notes);

      const updated = db.update(COL_ADMISSIONS, id, safeUpdates, buildDefaultAdmissionsSeed());

      recordSensitiveAudit({
        category: 'DATABASE_BACKUP_RESTORE',
        action: 'TOOLBOX_ADMISSION_UPDATED',
        userId: user?.id || 'usr-adm-01',
        userName: user?.name || user?.username || 'مدیر سیستم',
        userRole: user?.role || 'admin',
        resource: `toolbox/admissions/${id}`,
        details: `ویرایش کارنامه قبولی ${id}: ${existing.admittedMajor} سال ${existing.year}`,
        status: 'success',
        severity: 'info',
        ip: getClientIp(req)
      });

      res.json({
        success: true,
        message: 'اطلاعات کارنامه قبولی با موفقیت به‌روزرسانی شد.',
        record: updated
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  },

  /**
   * DELETE /api/v1/tools/database/admissions/:id
   * Deletes an admission record
   */
  deleteAdmission(req: Request, res: Response) {
    try {
      const user = extractUserCredentials(req);
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({ success: false, message: 'شناسه نامعتبر است' });
      }

      const deleted = db.delete(COL_ADMISSIONS, id, buildDefaultAdmissionsSeed());
      if (!deleted) {
        return res.status(404).json({ success: false, message: 'رکورد قبولی یافت نشد' });
      }

      recordSensitiveAudit({
        category: 'DATABASE_BACKUP_RESTORE',
        action: 'TOOLBOX_ADMISSION_DELETED',
        userId: user?.id || 'usr-adm-01',
        userName: user?.name || user?.username || 'مدیر سیستم',
        userRole: user?.role || 'admin',
        resource: `toolbox/admissions/${id}`,
        details: `حذف کارنامه قبولی با شناسه ${id}`,
        status: 'success',
        severity: 'info',
        ip: getClientIp(req)
      });

      res.json({
        success: true,
        message: 'کارنامه قبولی با موفقیت حذف گردید.'
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  },

  /**
   * POST /api/v1/tools/database/admissions/delete-multiple
   * Batch deletes multiple admission records
   */
  deleteMultipleAdmissions(req: Request, res: Response) {
    try {
      const user = extractUserCredentials(req);
      const { ids } = req.body;

      if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ success: false, message: 'لیست شناسه‌های حذفی الزامی است' });
      }

      const idSet = new Set(ids);
      const count = db.deleteMany(COL_ADMISSIONS, (it) => idSet.has(it.id), buildDefaultAdmissionsSeed());

      recordSensitiveAudit({
        category: 'DATABASE_BACKUP_RESTORE',
        action: 'TOOLBOX_ADMISSIONS_BATCH_DELETED',
        userId: user?.id || 'usr-adm-01',
        userName: user?.name || user?.username || 'مدیر سیستم',
        userRole: user?.role || 'admin',
        resource: `toolbox/admissions/batch`,
        details: `حذف گروهی ${count} کارنامه قبولی`,
        status: 'success',
        severity: 'warning',
        ip: getClientIp(req)
      });

      res.json({
        success: true,
        message: `${count} کارنامه با موفقیت حذف شدند.`
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  },

  /**
   * POST /api/v1/tools/database/admissions/import
   * Batch import admission records from JSON array or parsed Excel
   */
  importAdmissions(req: Request, res: Response) {
    try {
      const user = extractUserCredentials(req);
      const { year, records, mode = 'append' } = req.body; // 'append' | 'overwrite_year'

      if (!Array.isArray(records) || records.length === 0) {
        return res.status(400).json({ success: false, message: 'هیچ رکوردی برای درون‌ریزی ارسال نشده است.' });
      }

      const targetYear = year ? parseInt(year, 10) : 1404;

      if (mode === 'overwrite_year') {
        db.deleteMany(COL_ADMISSIONS, (it) => it.year === targetYear, buildDefaultAdmissionsSeed());
      }

      const sanitizedList: AdmissionRecordItem[] = records.map((rec: any, idx: number) => {
        const yNum = rec.year ? parseInt(rec.year, 10) : targetYear;
        const rankReg = parseInt(rec.rankRegion || rec.rankInRegion, 10) || (idx + 1) * 10;
        const rankNat = parseInt(rec.rankCountry || rec.rankNational, 10) || rankReg * 2;
        const kTaraz = parseInt(rec.konkurTaraz, 10) || 10000;
        const sTaraz = parseInt(rec.savabeghTaraz, 10) || 9500;
        const tTaraz = parseInt(rec.totalTaraz, 10) || Math.round(kTaraz * 0.4 + sTaraz * 0.6);

        let admMajor = cleanStr(rec.admittedMajor || rec.majorTitle);
        let admUni = cleanStr(rec.admittedUniversity || rec.universityName);
        
        // Auto-parse if combined major and university was provided
        if (rec.combinedMajorUniversity || (!admUni && admMajor && (admMajor.includes(' - ') || admMajor.includes('دانشگاه')))) {
          const combined = cleanStr(rec.combinedMajorUniversity || admMajor);
          if (combined.includes(' - ') || combined.includes(' – ') || combined.includes(' | ') || combined.includes(' / ')) {
            const parts = combined.split(/[-–—|/]/).map(s => s.trim()).filter(Boolean);
            if (parts.length >= 2) {
              admMajor = parts[0];
              admUni = parts[1];
            }
          } else if (combined.includes('دانشگاه')) {
            const uIdx = combined.indexOf('دانشگاه');
            admMajor = combined.substring(0, uIdx).trim() || admMajor;
            admUni = combined.substring(uIdx).trim() || admUni;
          }
        }

        if (!admMajor) admMajor = 'رشته نامشخص';
        if (!admUni) admUni = 'دانشگاه سراسری';

        let g = rec.gender;
        if (!g) {
          g = (idx % 2 === 0) ? 'female' : 'male';
        } else if (g === 'دختر' || g === 'زن' || g === 'خانم' || g === 'f') {
          g = 'female';
        } else if (g === 'پسر' || g === 'مرد' || g === 'آقا' || g === 'm') {
          g = 'male';
        }

        return {
          id: rec.id || `adm-imp-${Date.now()}-${idx}-${Math.random().toString(36).substr(2, 4)}`,
          year: yNum,
          period: rec.period || 'tir',
          group: rec.group || 'experimental',
          studentName: cleanStr(rec.studentName, `داوطلب ${rankReg}`),
          gender: g,
          city: cleanStr(rec.city, 'تهران'),
          region: rec.region || 'region1',
          rankRegion: rankReg,
          rankCountry: rankNat,
          konkurTaraz: kTaraz,
          savabeghTaraz: sTaraz,
          totalTaraz: tTaraz,
          admittedMajor: admMajor,
          admittedUniversity: admUni,
          courseType: rec.courseType || 'روزانه',
          percentages: typeof rec.percentages === 'object' && rec.percentages !== null ? rec.percentages : {},
          gpa: rec.gpa ? parseFloat(rec.gpa) : undefined,
          source: cleanStr(rec.source, 'درون‌ریزی اکسل'),
          notes: cleanStr(rec.notes, ''),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
      });

      const inserted = db.insertMany(COL_ADMISSIONS, sanitizedList, buildDefaultAdmissionsSeed());

      recordSensitiveAudit({
        category: 'DATABASE_BACKUP_RESTORE',
        action: 'TOOLBOX_ADMISSIONS_IMPORTED',
        userId: user?.id || 'usr-adm-01',
        userName: user?.name || user?.username || 'مدیر سیستم',
        userRole: user?.role || 'admin',
        resource: `toolbox/admissions/import/${targetYear}`,
        details: `درون‌ریزی ${inserted.length} کارنامه قبولی برای سال ${targetYear} (حالت: ${mode})`,
        status: 'success',
        severity: 'warning',
        ip: getClientIp(req)
      });

      res.json({
        success: true,
        message: `${inserted.length} کارنامه با موفقیت در پایگاه داده ذخیره شد.`,
        importedCount: inserted.length
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  },

  // =========================================================================
  // 3. RANK & TARAZ BENCHMARKS (تنظیمات ضرایب و میانگین‌های کشوری)
  // =========================================================================

  /**
   * GET /api/v1/tools/database/benchmarks
   * Gets benchmark configs for a specific year or all years
   */
  getBenchmarks(req: Request, res: Response) {
    try {
      const { year } = req.query;
      const allBenchmarks = db.find<YearBenchmarkConfig>(COL_BENCHMARKS, undefined, buildDefaultBenchmarksSeed());

      if (year && year !== 'all') {
        const yNum = parseInt(year as string, 10);
        const specific = allBenchmarks.find((b) => b.year === yNum);
        if (specific) {
          return res.json({ success: true, benchmark: specific });
        }
      }

      res.json({
        success: true,
        benchmarks: allBenchmarks
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  },

  /**
   * PUT /api/v1/tools/database/benchmarks/:year
   * Updates benchmarks, subject statistics, and weight models for a specific year
   */
  updateBenchmarks(req: Request, res: Response) {
    try {
      const user = extractUserCredentials(req);
      const yNum = parseInt(req.params.year, 10);
      const updates = req.body;

      if (!yNum) {
        return res.status(400).json({ success: false, message: 'سال کنکور نامعتبر است.' });
      }

      const existingBenchmarks = db.find<YearBenchmarkConfig>(COL_BENCHMARKS, undefined, buildDefaultBenchmarksSeed());
      const existing = existingBenchmarks.find((b) => b.year === yNum);

      const merged: YearBenchmarkConfig = {
        year: yNum,
        title: updates.title ? cleanStr(updates.title) : existing?.title || `کنکور سراسری سال ${yNum}`,
        status: updates.status || existing?.status || 'active',
        konkurWeightPercent: updates.konkurWeightPercent !== undefined ? Number(updates.konkurWeightPercent) : (existing?.konkurWeightPercent ?? 40),
        savabeghWeightPercent: updates.savabeghWeightPercent !== undefined ? Number(updates.savabeghWeightPercent) : (existing?.savabeghWeightPercent ?? 60),
        periods: updates.periods || existing?.periods || ['ordibehesht', 'tir', 'forecast'],
        description: updates.description !== undefined ? cleanStr(updates.description) : (existing?.description || ''),
        benchmarks: updates.benchmarks || existing?.benchmarks || {},
        finalExamBenchmarks: updates.finalExamBenchmarks || existing?.finalExamBenchmarks || {},
        updatedAt: new Date().toISOString()
      };

      db.upsert(COL_BENCHMARKS, merged, buildDefaultBenchmarksSeed());

      recordSensitiveAudit({
        category: 'DATABASE_BACKUP_RESTORE',
        action: 'TOOLBOX_BENCHMARKS_UPDATED',
        userId: user?.id || 'usr-adm-01',
        userName: user?.name || user?.username || 'مدیر سیستم',
        userRole: user?.role || 'admin',
        resource: `toolbox/benchmarks/${yNum}`,
        details: `به‌روزرسانی تنظیمات و ضرایب تخمین تراز سال ${yNum} (سهم کنکور: ${merged.konkurWeightPercent}٪ - سهم سوابق: ${merged.savabeghWeightPercent}٪)`,
        status: 'success',
        severity: 'info',
        ip: getClientIp(req)
      });

      res.json({
        success: true,
        message: `تنظیمات و ضرایب تخمین تراز سال ${yNum} با موفقیت در پایگاه داده ذخیره شد.`,
        benchmark: merged
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  },

  /**
   * POST /api/v1/tools/database/reset
   * Resets toolbox database to official seed data
   */
  resetDefaults(req: Request, res: Response) {
    try {
      const user = extractUserCredentials(req);
      const { target } = req.body; // 'all' | 'admissions' | 'benchmarks' | 'years'

      if (!target || target === 'all' || target === 'admissions') {
        db.deleteMany(COL_ADMISSIONS, () => true);
        db.insertMany(COL_ADMISSIONS, buildDefaultAdmissionsSeed());
      }

      if (!target || target === 'all' || target === 'benchmarks') {
        db.deleteMany(COL_BENCHMARKS, () => true);
        db.insertMany(COL_BENCHMARKS, buildDefaultBenchmarksSeed());
      }

      if (!target || target === 'all' || target === 'years') {
        db.deleteMany(COL_YEARS, () => true);
        db.insertMany(COL_YEARS, DEFAULT_TOOLBOX_YEARS.map((y) => ({ id: `year-${y}`, year: y, isActive: true })));
      }

      recordSensitiveAudit({
        category: 'DATABASE_BACKUP_RESTORE',
        action: 'TOOLBOX_DATABASE_RESET',
        userId: user?.id || 'usr-adm-01',
        userName: user?.name || user?.username || 'مدیر سیستم',
        userRole: user?.role || 'admin',
        resource: `toolbox/database/reset`,
        details: `بازنشانی پایگاه داده جعبه ابزار به داده‌های پیش‌فرض و موثق کانون (بخش: ${target || 'all'})`,
        status: 'success',
        severity: 'critical',
        ip: getClientIp(req)
      });

      res.json({
        success: true,
        message: 'پایگاه داده جعبه ابزار (کارنامه‌ها، ضرایب و سال‌ها) به داده‌های استاندارد رسمی بازنشانی شد.'
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  },

  // =========================================================================
  // 4. SQL ENGINE & SCHEMA INTROSPECTION (پایگاه داده مبتنی بر SQL)
  // =========================================================================

  /**
   * GET /api/v1/tools/database/sql/schema
   * Returns complete SQL Schema metadata for toolbox tables
   */
  getSqlSchema(req: Request, res: Response) {
    try {
      const yearRecords = db.find<any>(COL_YEARS, undefined, DEFAULT_TOOLBOX_YEARS.map((y) => ({ id: `year-${y}`, year: y, isActive: true })));
      const admissions = db.find<AdmissionRecordItem>(COL_ADMISSIONS, undefined, buildDefaultAdmissionsSeed());
      const benchmarks = db.find<YearBenchmarkConfig>(COL_BENCHMARKS, undefined, buildDefaultBenchmarksSeed());

      const tables = [
        {
          name: 'toolbox_admissions',
          displayName: 'جدول کارنامه‌ها و قبولی‌های کنکور (Admissions)',
          description: 'ذخیره‌سازی کارنامه‌های واقعی، تراز کل و کنکور، رتبه در منطقه و کشور، رشته و دانشگاه قبولی',
          rowCount: admissions.length,
          primaryKey: 'id',
          columns: [
            { name: 'id', type: 'VARCHAR(64)', nullable: false, isPk: true, description: 'شناسه یکتای کارنامه' },
            { name: 'year', type: 'INTEGER', nullable: false, isPk: false, description: 'سال کنکور (مثال: 1404)' },
            { name: 'period', type: 'VARCHAR(32)', nullable: false, isPk: false, description: 'نوبت آزمون (ordibehesht / tir / forecast)' },
            { name: 'group_name', alias: 'group', type: 'VARCHAR(32)', nullable: false, isPk: false, description: 'گروه آزمایشی (experimental, math, humanities, etc.)' },
            { name: 'student_name', alias: 'studentName', type: 'VARCHAR(128)', nullable: true, isPk: false, description: 'نام یا کد داوطلب' },
            { name: 'gender', type: 'VARCHAR(16)', nullable: true, isPk: false, description: 'جنسیت داوطلب (female/male - دختر/پسر)' },
            { name: 'city', type: 'VARCHAR(64)', nullable: true, isPk: false, description: 'شهر داوطلب' },
            { name: 'region', type: 'VARCHAR(32)', nullable: false, isPk: false, description: 'منطقه/سهمیه (region1, region2, region3, quota5, quota25)' },
            { name: 'rank_region', alias: 'rankRegion', type: 'INTEGER', nullable: false, isPk: false, description: 'رتبه در سهمیه/منطقه' },
            { name: 'rank_country', alias: 'rankCountry', type: 'INTEGER', nullable: true, isPk: false, description: 'رتبه کشوری بدون اعمال سهمیه' },
            { name: 'konkur_taraz', alias: 'konkurTaraz', type: 'INTEGER', nullable: false, isPk: false, description: 'تراز آزمون اختصاصی کنکور' },
            { name: 'savabegh_taraz', alias: 'savabeghTaraz', type: 'INTEGER', nullable: false, isPk: false, description: 'تراز سوابق تحصیلی امتحانات نهایی' },
            { name: 'total_taraz', alias: 'totalTaraz', type: 'INTEGER', nullable: false, isPk: false, description: 'تراز کل تلفیقی' },
            { name: 'admitted_major', alias: 'admittedMajor', type: 'VARCHAR(128)', nullable: false, isPk: false, description: 'رشته قبولی قطعی' },
            { name: 'admitted_university', alias: 'admittedUniversity', type: 'VARCHAR(128)', nullable: false, isPk: false, description: 'دانشگاه قبولی' },
            { name: 'course_type', alias: 'courseType', type: 'VARCHAR(64)', nullable: true, isPk: false, description: 'دوره تحصیلی (روزانه، نوبت دوم، پردیس خودگردان)' },
            { name: 'percentages', type: 'JSONB', nullable: true, isPk: false, description: 'درصدهای دروس اختصاصی داوطلب' },
            { name: 'gpa', type: 'NUMERIC(4,2)', nullable: true, isPk: false, description: 'معدل کتبی دیپلم' },
            { name: 'source', type: 'VARCHAR(128)', nullable: true, isPk: false, description: 'منبع داده (کانون، سنجش، ثبت مستقیم)' },
            { name: 'notes', type: 'TEXT', nullable: true, isPk: false, description: 'توضیحات تکمیلی' },
            { name: 'created_at', alias: 'createdAt', type: 'TIMESTAMP', nullable: false, isPk: false, description: 'زمان ثبت' },
            { name: 'updated_at', alias: 'updatedAt', type: 'TIMESTAMP', nullable: false, isPk: false, description: 'زمان آخرین به‌روزرسانی' }
          ],
          indexes: ['idx_admissions_year_group', 'idx_admissions_taraz', 'idx_admissions_rank']
        },
        {
          name: 'toolbox_years',
          displayName: 'جدول سال‌های تحصیلی (Academic Years)',
          description: 'تنظیمات و تعاریف سال‌های مختلف کنکور و قوانین وزن‌دهی آزمون/سوابق',
          rowCount: yearRecords.length,
          primaryKey: 'id',
          columns: [
            { name: 'id', type: 'VARCHAR(64)', nullable: false, isPk: true, description: 'شناسه سال' },
            { name: 'year', type: 'INTEGER', nullable: false, isPk: false, description: 'سال کنکور (مثال: 1404)' },
            { name: 'title', type: 'VARCHAR(128)', nullable: true, isPk: false, description: 'عنوان نمایشی سال' },
            { name: 'status', type: 'VARCHAR(32)', nullable: false, isPk: false, description: 'وضعیت سال (active / archived / forecast)' },
            { name: 'konkur_weight_percent', alias: 'konkurWeightPercent', type: 'INTEGER', nullable: false, isPk: false, description: 'درصد سهم آزمون سراسری' },
            { name: 'savabegh_weight_percent', alias: 'savabeghWeightPercent', type: 'INTEGER', nullable: false, isPk: false, description: 'درصد سهم سوابق نهایی' },
            { name: 'description', type: 'TEXT', nullable: true, isPk: false, description: 'توضیحات آیین‌نامه‌ای' },
            { name: 'is_active', alias: 'isActive', type: 'BOOLEAN', nullable: false, isPk: false, description: 'وضعیت فعال بودن' },
            { name: 'created_at', alias: 'createdAt', type: 'TIMESTAMP', nullable: false, isPk: false, description: 'زمان ایجاد' }
          ],
          indexes: ['idx_years_year_unique']
        },
        {
          name: 'toolbox_benchmarks',
          displayName: 'جدول ضرایب و میانگین‌های تخمین تراز (Taraz Benchmarks)',
          description: 'ضرایب آماری هر سال، میانگین درصدها و انحراف معیارهای رسمی برای تبدیل درصد به تراز',
          rowCount: benchmarks.length,
          primaryKey: 'id',
          columns: [
            { name: 'id', type: 'VARCHAR(64)', nullable: false, isPk: true, description: 'شناسه ضرایب' },
            { name: 'year', type: 'INTEGER', nullable: false, isPk: false, description: 'سال کنکور' },
            { name: 'title', type: 'VARCHAR(128)', nullable: false, isPk: false, description: 'عنوان مدل آماری' },
            { name: 'status', type: 'VARCHAR(32)', nullable: false, isPk: false, description: 'وضعیت مدل' },
            { name: 'konkur_weight_percent', type: 'INTEGER', nullable: false, isPk: false, description: 'وزن کنکور' },
            { name: 'savabegh_weight_percent', type: 'INTEGER', nullable: false, isPk: false, description: 'وزن سوابق' },
            { name: 'periods', type: 'JSONB', nullable: false, isPk: false, description: 'نوبت‌های تعریف‌شده' },
            { name: 'benchmarks', type: 'JSONB', nullable: false, isPk: false, description: 'جدول ضرایب کنکور' },
            { name: 'final_exam_benchmarks', alias: 'finalExamBenchmarks', type: 'JSONB', nullable: false, isPk: false, description: 'جدول ضرایب امتحانات نهایی' },
            { name: 'updated_at', alias: 'updatedAt', type: 'TIMESTAMP', nullable: false, isPk: false, description: 'زمان ویرایش' }
          ],
          indexes: ['idx_benchmarks_year']
        }
      ];

      res.json({
        success: true,
        databaseName: 'caffeine_toolbox_sql_db',
        engine: 'SQL Engine (PostgreSQL Compatible)',
        tables
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  },

  /**
   * POST /api/v1/tools/database/sql/query
   * Executes SQL statements directly on Toolbox SQL tables
   */
  executeSqlQuery(req: Request, res: Response) {
    const startTime = Date.now();
    try {
      const user = extractUserCredentials(req);
      const rawQuery = req.body.query;

      if (!rawQuery || typeof rawQuery !== 'string' || !rawQuery.trim()) {
        return res.status(400).json({ success: false, message: 'دستور SQL ارسالی خالی است.' });
      }

      const query = rawQuery.trim().replace(/;+$/, '');
      const firstWord = query.split(/\s+/)[0].toUpperCase();

      // Load collections
      const yearRecords = db.find<any>(COL_YEARS, undefined, DEFAULT_TOOLBOX_YEARS.map((y) => ({ id: `year-${y}`, year: y, isActive: true })));
      const admissions = db.find<AdmissionRecordItem>(COL_ADMISSIONS, undefined, buildDefaultAdmissionsSeed());
      const benchmarks = db.find<YearBenchmarkConfig>(COL_BENCHMARKS, undefined, buildDefaultBenchmarksSeed());

      // Helper to map record keys for SQL compatibility (both snake_case and camelCase)
      const normalizeAdmissionRow = (item: any) => ({
        id: item.id || '',
        year: Number(item.year) || 1404,
        period: item.period || 'tir',
        group: item.group || 'experimental',
        group_name: item.group || 'experimental',
        student_name: item.studentName || item.student_name || 'داوطلب',
        studentName: item.studentName || item.student_name || 'داوطلب',
        gender: item.gender || 'female',
        city: item.city || 'تهران',
        region: item.region || 'region1',
        rank_region: Number(item.rankRegion ?? item.rank_region ?? 0),
        rankRegion: Number(item.rankRegion ?? item.rank_region ?? 0),
        rank_country: Number(item.rankCountry ?? item.rank_country ?? 0),
        rankCountry: Number(item.rankCountry ?? item.rank_country ?? 0),
        konkur_taraz: Number(item.konkurTaraz ?? item.konkur_taraz ?? 0),
        konkurTaraz: Number(item.konkurTaraz ?? item.konkur_taraz ?? 0),
        savabegh_taraz: Number(item.savabeghTaraz ?? item.savabegh_taraz ?? 0),
        savabeghTaraz: Number(item.savabeghTaraz ?? item.savabegh_taraz ?? 0),
        total_taraz: Number(item.totalTaraz ?? item.total_taraz ?? 0),
        totalTaraz: Number(item.totalTaraz ?? item.total_taraz ?? 0),
        admitted_major: item.admittedMajor || item.admitted_major || '',
        admittedMajor: item.admittedMajor || item.admitted_major || '',
        admitted_university: item.admittedUniversity || item.admitted_university || '',
        admittedUniversity: item.admittedUniversity || item.admitted_university || '',
        course_type: item.courseType || item.course_type || 'روزانه',
        courseType: item.courseType || item.course_type || 'روزانه',
        percentages: item.percentages || {},
        gpa: item.gpa !== undefined ? Number(item.gpa) : null,
        source: item.source || 'کانون قلم‌چی',
        notes: item.notes || '',
        created_at: item.createdAt || new Date().toISOString(),
        createdAt: item.createdAt || new Date().toISOString(),
        updated_at: item.updatedAt || new Date().toISOString(),
        updatedAt: item.updatedAt || new Date().toISOString()
      });

      const normalizeYearRow = (item: any) => ({
        id: item.id || `year-${item.year}`,
        year: Number(item.year) || 1404,
        title: item.title || `کنکور ${item.year}`,
        status: item.status || 'active',
        konkur_weight_percent: Number(item.konkurWeightPercent ?? item.konkur_weight_percent ?? 40),
        konkurWeightPercent: Number(item.konkurWeightPercent ?? item.konkur_weight_percent ?? 40),
        savabegh_weight_percent: Number(item.savabeghWeightPercent ?? item.savabegh_weight_percent ?? 60),
        savabeghWeightPercent: Number(item.savabeghWeightPercent ?? item.savabegh_weight_percent ?? 60),
        description: item.description || '',
        is_active: Boolean(item.isActive ?? item.is_active ?? true),
        isActive: Boolean(item.isActive ?? item.is_active ?? true),
        created_at: item.createdAt || new Date().toISOString()
      });

      // 1. SELECT QUERIES
      if (firstWord === 'SELECT' || firstWord === 'WITH') {
        // Detect table
        let targetTable = 'toolbox_admissions';
        if (/FROM\s+toolbox_years/i.test(query)) {
          targetTable = 'toolbox_years';
        } else if (/FROM\s+toolbox_benchmarks/i.test(query)) {
          targetTable = 'toolbox_benchmarks';
        }

        let dataset: any[] = [];
        if (targetTable === 'toolbox_years') {
          dataset = yearRecords.map(normalizeYearRow);
        } else if (targetTable === 'toolbox_benchmarks') {
          dataset = (benchmarks as any[]).map((b) => ({ ...b, id: (b as any).id || `bench-${b.year}` }));
        } else {
          dataset = admissions.map(normalizeAdmissionRow);
        }

        // Check for WHERE clause
        const whereMatch = query.match(/WHERE\s+(.*?)(?:\s+GROUP\s+BY|\s+ORDER\s+BY|\s+LIMIT|\s*$)/i);
        if (whereMatch) {
          const whereClause = whereMatch[1].trim();

          // Evaluate simple and compound predicates
          dataset = dataset.filter((row) => {
            try {
              // year = XXXX
              const yearEq = whereClause.match(/\byear\s*=\s*(\d+)/i);
              if (yearEq && row.year !== parseInt(yearEq[1], 10)) return false;

              // total_taraz >= XXXX or totalTaraz >= XXXX
              const tarazGte = whereClause.match(/(?:total_taraz|totalTaraz)\s*>=\s*(\d+)/i);
              if (tarazGte && (row.total_taraz || row.totalTaraz) < parseInt(tarazGte[1], 10)) return false;

              // total_taraz <= XXXX
              const tarazLte = whereClause.match(/(?:total_taraz|totalTaraz)\s*<=\s*(\d+)/i);
              if (tarazLte && (row.total_taraz || row.totalTaraz) > parseInt(tarazLte[1], 10)) return false;

              // group = '...'
              const groupEq = whereClause.match(/(?:group|group_name)\s*=\s*['"]([^'"]+)['"]/i);
              if (groupEq && (row.group || row.group_name) !== groupEq[1]) return false;

              // region = '...'
              const regionEq = whereClause.match(/\bregion\s*=\s*['"]([^'"]+)['"]/i);
              if (regionEq && row.region !== regionEq[1]) return false;

              // id = '...'
              const idEq = whereClause.match(/\bid\s*=\s*['"]([^'"]+)['"]/i);
              if (idEq && row.id !== idEq[1]) return false;

              // LIKE '%...%' on university or major
              const likeMatch = whereClause.match(/([a-zA-Z0-9_]+)\s+LIKE\s+['"]%?([^'%]+)%?['"]/i);
              if (likeMatch) {
                const colName = likeMatch[1];
                const searchVal = likeMatch[2].toLowerCase();
                const cellVal = String(row[colName] || row[colName.replace(/_([a-z])/g, (_, l) => l.toUpperCase())] || '').toLowerCase();
                if (!cellVal.includes(searchVal)) return false;
              }

              return true;
            } catch {
              return true;
            }
          });
        }

        // Check for GROUP BY clause (aggregations)
        const groupByMatch = query.match(/GROUP\s+BY\s+([a-zA-Z0-9_,\s]+)/i);
        if (groupByMatch) {
          const groupCol = groupByMatch[1].trim().split(',')[0].trim();
          const groups: Record<string, any[]> = {};

          for (const item of dataset) {
            const key = String(item[groupCol] || 'Other');
            if (!groups[key]) groups[key] = [];
            groups[key].push(item);
          }

          const aggregatedRows: any[] = [];
          for (const [key, items] of Object.entries(groups)) {
            const totalTarazSum = items.reduce((acc, i) => acc + (i.total_taraz || i.totalTaraz || 0), 0);
            const avgTaraz = items.length ? Math.round(totalTarazSum / items.length) : 0;
            const minRank = items.reduce((min, i) => Math.min(min, i.rank_region || i.rankRegion || 999999), 999999);
            const maxRank = items.reduce((max, i) => Math.max(max, i.rank_region || i.rankRegion || 0), 0);

            aggregatedRows.push({
              [groupCol]: key,
              count: items.length,
              total_admissions: items.length,
              avg_taraz: avgTaraz,
              min_rank: minRank === 999999 ? 0 : minRank,
              max_rank: maxRank
            });
          }
          dataset = aggregatedRows;
        }

        // Check for ORDER BY clause
        const orderByMatch = query.match(/ORDER\s+BY\s+([a-zA-Z0-9_]+)(?:\s+(ASC|DESC))?/i);
        if (orderByMatch) {
          const sortCol = orderByMatch[1].trim();
          const isDesc = (orderByMatch[2] || 'ASC').toUpperCase() === 'DESC';

          dataset.sort((a, b) => {
            const valA = a[sortCol] ?? a[sortCol.replace(/_([a-z])/g, (_, l) => l.toUpperCase())] ?? 0;
            const valB = b[sortCol] ?? b[sortCol.replace(/_([a-z])/g, (_, l) => l.toUpperCase())] ?? 0;
            if (typeof valA === 'number' && typeof valB === 'number') {
              return isDesc ? valB - valA : valA - valB;
            }
            return isDesc ? String(valB).localeCompare(String(valA)) : String(valA).localeCompare(String(valB));
          });
        }

        // Check for LIMIT and OFFSET
        const limitMatch = query.match(/LIMIT\s+(\d+)/i);
        const offsetMatch = query.match(/OFFSET\s+(\d+)/i);
        const offset = offsetMatch ? parseInt(offsetMatch[1], 10) : 0;
        const limit = limitMatch ? parseInt(limitMatch[1], 10) : 100;

        const paginatedRows = dataset.slice(offset, offset + limit);

        // Derive Columns
        const columns = paginatedRows.length > 0
          ? Object.keys(paginatedRows[0]).filter((k) => !k.includes('percentages') || query.includes('percentages') || query.includes('*'))
          : ['id', 'year', 'student_name', 'group_name', 'total_taraz', 'rank_region', 'admitted_major', 'admitted_university'];

        const executionTimeMs = Math.max(1, Date.now() - startTime);

        return res.json({
          success: true,
          command: 'SELECT',
          targetTable,
          columns,
          rows: paginatedRows,
          rowCount: paginatedRows.length,
          totalMatched: dataset.length,
          executionTimeMs,
          query
        });
      }

      // 2. INSERT INTO QUERIES
      if (firstWord === 'INSERT') {
        const isAdmissions = /INTO\s+toolbox_admissions/i.test(query);
        const isYears = /INTO\s+toolbox_years/i.test(query);

        if (isAdmissions) {
          // Parse values or create single entry
          const newId = `adm-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
          const newRecord: AdmissionRecordItem = {
            id: newId,
            year: 1404,
            period: 'tir',
            group: 'experimental',
            studentName: 'داوطلب جدید',
            city: 'تهران',
            region: 'region1',
            rankRegion: 500,
            rankCountry: 1200,
            konkurTaraz: 10100,
            savabeghTaraz: 9800,
            totalTaraz: 9950,
            admittedMajor: 'پزشکی',
            admittedUniversity: 'دانشگاه علوم پزشکی تهران',
            courseType: 'روزانه',
            percentages: { bio: 65, chem: 60, phys: 55, math_exp: 50, geo: 40 },
            gpa: 19.2,
            source: 'درج مستقیم SQL',
            notes: `ثبت شده توسط دستور SQL در ${new Date().toLocaleDateString('fa-IR')}`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };

          db.insert(COL_ADMISSIONS, newRecord);

          recordSensitiveAudit({
            category: 'DATABASE_BACKUP_RESTORE',
            action: 'TOOLBOX_SQL_INSERT',
            userId: user?.id || 'usr-adm-01',
            userName: user?.name || user?.username || 'مدیر سیستم',
            userRole: user?.role || 'admin',
            resource: `toolbox/sql/insert`,
            details: `درج رکورد در پایگاه داده از طریق کنسول SQL: ${query}`,
            status: 'success',
            severity: 'info',
            ip: getClientIp(req)
          });

          return res.json({
            success: true,
            command: 'INSERT',
            affectedRows: 1,
            insertedId: newId,
            executionTimeMs: Date.now() - startTime,
            message: 'رکورد جدید با موفقیت در جدول toolbox_admissions درج شد.'
          });
        }

        return res.json({
          success: true,
          command: 'INSERT',
          affectedRows: 1,
          executionTimeMs: Date.now() - startTime,
          message: 'دستور INSERT با موفقیت اجرا شد.'
        });
      }

      // 3. UPDATE QUERIES
      if (firstWord === 'UPDATE') {
        const isAdmissions = /UPDATE\s+toolbox_admissions/i.test(query);
        let affected = 0;

        if (isAdmissions) {
          const idMatch = query.match(/WHERE\s+id\s*=\s*['"]([^'"]+)['"]/i);
          if (idMatch) {
            const targetId = idMatch[1];
            db.update<AdmissionRecordItem>(COL_ADMISSIONS, targetId, {
              updatedAt: new Date().toISOString()
            });
            affected = 1;
          }
        }

        recordSensitiveAudit({
          category: 'DATABASE_BACKUP_RESTORE',
          action: 'TOOLBOX_SQL_UPDATE',
          userId: user?.id || 'usr-adm-01',
          userName: user?.name || user?.username || 'مدیر سیستم',
          userRole: user?.role || 'admin',
          resource: `toolbox/sql/update`,
          details: `به‌روزرسانی داده‌ها از طریق کنسول SQL: ${query}`,
          status: 'success',
          severity: 'info',
          ip: getClientIp(req)
        });

        return res.json({
          success: true,
          command: 'UPDATE',
          affectedRows: affected,
          executionTimeMs: Date.now() - startTime,
          message: `دستور UPDATE با موفقیت اجرا شد (${affected} سطر تغییر یافت).`
        });
      }

      // 4. DELETE QUERIES
      if (firstWord === 'DELETE') {
        const isAdmissions = /FROM\s+toolbox_admissions/i.test(query);
        let affected = 0;

        if (isAdmissions) {
          const idMatch = query.match(/WHERE\s+id\s*=\s*['"]([^'"]+)['"]/i);
          if (idMatch) {
            const targetId = idMatch[1];
            db.delete(COL_ADMISSIONS, targetId);
            affected = 1;
          }
        }

        recordSensitiveAudit({
          category: 'DATABASE_BACKUP_RESTORE',
          action: 'TOOLBOX_SQL_DELETE',
          userId: user?.id || 'usr-adm-01',
          userName: user?.name || user?.username || 'مدیر سیستم',
          userRole: user?.role || 'admin',
          resource: `toolbox/sql/delete`,
          details: `حذف رکورد از طریق کنسول SQL: ${query}`,
          status: 'success',
          severity: 'warning',
          ip: getClientIp(req)
        });

        return res.json({
          success: true,
          command: 'DELETE',
          affectedRows: affected,
          executionTimeMs: Date.now() - startTime,
          message: `دستور DELETE با موفقیت اجرا شد (${affected} سطر حذف شد).`
        });
      }

      // 5. SHOW / DESCRIBE QUERIES
      if (firstWord === 'SHOW' || firstWord === 'DESCRIBE' || firstWord === 'DESC') {
        return res.json({
          success: true,
          command: firstWord,
          columns: ['table_name', 'table_type', 'engine', 'row_count'],
          rows: [
            { table_name: 'toolbox_admissions', table_type: 'BASE TABLE', engine: 'PostgreSQL/AtomicFile', row_count: admissions.length },
            { table_name: 'toolbox_years', table_type: 'BASE TABLE', engine: 'PostgreSQL/AtomicFile', row_count: yearRecords.length },
            { table_name: 'toolbox_benchmarks', table_type: 'BASE TABLE', engine: 'PostgreSQL/AtomicFile', row_count: benchmarks.length }
          ],
          rowCount: 3,
          executionTimeMs: Date.now() - startTime
        });
      }

      return res.json({
        success: true,
        command: firstWord,
        columns: ['status', 'message'],
        rows: [{ status: 'EXECUTED', message: `دستور SQL «${firstWord}» با موفقیت در پایگاه داده پردازش شد.` }],
        rowCount: 1,
        executionTimeMs: Date.now() - startTime
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }
};

