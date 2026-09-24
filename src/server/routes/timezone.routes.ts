import { Router, Request, Response } from 'express';
import {
  fetchFastCreatDate,
  fetchFastCreatTime,
  getLiveTimezoneInfo
} from '../services/timezoneService.js';

export const timezoneRouter = Router();

// 1. Universal Timezone Query Endpoint (supports ?action=date|time|all&zone=fa|en)
timezoneRouter.get('/timezone', async (req: Request, res: Response) => {
  try {
    const action = (req.query.action as string || 'all').toLowerCase();
    const zone = ((req.query.zone as string || 'fa').toLowerCase() === 'en') ? 'en' : 'fa';

    if (action === 'date') {
      const dateData = await fetchFastCreatDate(zone);
      return res.json({
        ok: true,
        service: 'Fast-Creat Timezone API',
        result: dateData
      });
    }

    if (action === 'time') {
      const timeData = await fetchFastCreatTime(zone);
      return res.json({
        ok: true,
        service: 'Fast-Creat Timezone API',
        result: timeData
      });
    }

    // Default: Return rich integrated live date + time + animal year + season
    const comprehensive = await getLiveTimezoneInfo(zone);
    return res.json({
      ok: true,
      service: 'Fast-Creat Timezone API & Caffeine OS Synced Clock',
      result: comprehensive
    });
  } catch (error: any) {
    return res.status(500).json({
      ok: false,
      error: 'TIMEZONE_FETCH_FAILED',
      message: error.message || 'خطا در دریافت اطلاعات ساعت و تاریخ'
    });
  }
});

// 2. Direct Date Endpoint
timezoneRouter.get('/timezone/date', async (req: Request, res: Response) => {
  try {
    const zone = ((req.query.zone as string || 'fa').toLowerCase() === 'en') ? 'en' : 'fa';
    const dateData = await fetchFastCreatDate(zone);
    res.json({
      ok: true,
      service: 'Fast-Creat Timezone API',
      result: dateData
    });
  } catch (error: any) {
    res.status(500).json({ ok: false, message: error.message });
  }
});

// 3. Direct Time Endpoint
timezoneRouter.get('/timezone/time', async (req: Request, res: Response) => {
  try {
    const zone = ((req.query.zone as string || 'fa').toLowerCase() === 'en') ? 'en' : 'fa';
    const timeData = await fetchFastCreatTime(zone);
    res.json({
      ok: true,
      service: 'Fast-Creat Timezone API',
      result: timeData
    });
  } catch (error: any) {
    res.status(500).json({ ok: false, message: error.message });
  }
});

// 4. Live Integrated Now Endpoint (Both Iran and World)
timezoneRouter.get('/timezone/now', async (req: Request, res: Response) => {
  try {
    const [iranData, worldData] = await Promise.all([
      getLiveTimezoneInfo('fa'),
      getLiveTimezoneInfo('en')
    ]);

    res.json({
      ok: true,
      service: 'Fast-Creat Timezone API',
      timestamp: Date.now(),
      iran: iranData,
      world: worldData
    });
  } catch (error: any) {
    res.status(500).json({ ok: false, message: error.message });
  }
});
