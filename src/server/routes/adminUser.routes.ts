import { Router } from 'express';
import { adminUserController } from '../controllers/adminUser.controller.js';
import { requireAdminAuth } from '../middleware/auth.middleware.js';

export const adminUserRouter = Router();

// Admin User Management Endpoints
adminUserRouter.get('/admin/users', requireAdminAuth, adminUserController.getUsers);
adminUserRouter.post('/admin/users', requireAdminAuth, adminUserController.createUser);
adminUserRouter.post('/admin/users/create', requireAdminAuth, adminUserController.createUser);
adminUserRouter.post('/admin/users/reset-password', requireAdminAuth, adminUserController.resetPassword);
adminUserRouter.post('/admin/users/toggle-lock', requireAdminAuth, adminUserController.toggleLock);
adminUserRouter.delete('/admin/users/:id', requireAdminAuth, adminUserController.deleteUser);
