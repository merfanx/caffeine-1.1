import { Router } from 'express';
import { authController } from '../controllers/auth.controller.js';
import { requireAuth, requireAdminAuth } from '../middleware/auth.middleware.js';
import {
  otpRateLimiter,
  otpVerifyRateLimiter,
  passwordResetRateLimiter,
  loginRateLimitMiddleware
} from '../middleware/rateLimit.middleware.js';

export const authRouter = Router();

// OTP & Password Reset Endpoints
authRouter.post('/auth/send-otp', otpRateLimiter, authController.sendOtp);
authRouter.post('/auth/verify-otp', otpVerifyRateLimiter, authController.verifyOtp);
authRouter.post('/auth/reset-password', passwordResetRateLimiter, authController.resetPassword);

// Credential & Login Endpoints
authRouter.post('/auth/register', loginRateLimitMiddleware, authController.register);
authRouter.get('/auth/credentials-audit', requireAdminAuth, authController.getCredentialsAudit);
authRouter.post('/auth/hash-credential', requireAdminAuth, authController.hashCredential);
authRouter.post('/auth/verify-credential', requireAdminAuth, authController.verifyCredential);
authRouter.post('/auth/login', loginRateLimitMiddleware, authController.login);
authRouter.post('/auth/logout', authController.logout);
authRouter.post('/auth/refresh', authController.refresh);
authRouter.get('/auth/me', requireAuth, authController.getMe);
authRouter.get('/auth/session', requireAuth, authController.getSession);
authRouter.post('/auth/update-pin', requireAuth, authController.updatePin);

// Settings - SMS.ir
authRouter.get('/settings/sms', requireAdminAuth, authController.getSmsSettings);
authRouter.post('/settings/sms', requireAdminAuth, authController.updateSmsSettings);
authRouter.post('/settings/sms/test-otp', otpRateLimiter, requireAdminAuth, authController.testOtpSms);
authRouter.get('/settings/sms/credit', requireAdminAuth, authController.getSmsCredit);
authRouter.get('/settings/sms/lines', requireAdminAuth, authController.getSmsLines);

// Settings - AI Configuration
authRouter.get('/settings/ai-config', authController.getAiConfig);
authRouter.post('/settings/ai-config', requireAdminAuth, authController.updateAiConfig);
authRouter.post('/settings/ai-config/test', requireAdminAuth, authController.testAiConfig);
authRouter.delete('/settings/ai-config', requireAdminAuth, authController.deleteAiConfig);
