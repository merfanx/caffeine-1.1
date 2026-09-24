import { Router } from 'express';
import { crmController } from '../controllers/crm.controller.js';
import { requireRole, requireAdminAuth } from '../middleware/auth.middleware.js';
import { formSubmissionRateLimiter } from '../middleware/rateLimit.middleware.js';

export const crmRouter = Router();

// CRM Leads
crmRouter.get('/crm/leads', requireRole('admin', 'advisor'), crmController.getLeads);
crmRouter.post('/crm/leads', formSubmissionRateLimiter, crmController.createLead);
crmRouter.patch('/crm/leads/:id', requireRole('admin', 'advisor'), crmController.updateLead);

// SMS Broadcast Campaigns
crmRouter.get('/sms/broadcast/recipients-summary', requireAdminAuth, crmController.getRecipientsSummary);
crmRouter.post('/sms/broadcast/send', requireAdminAuth, crmController.sendBroadcast);
