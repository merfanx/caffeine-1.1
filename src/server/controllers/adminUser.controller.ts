import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { db } from '../storage/dbBridge.js';
import { sanitizeString } from '../security/apiHardening.js';
import {
  seedDefaultCredentials,
  BCRYPT_SALT_ROUNDS,
  COL_USER_CREDENTIALS,
  StoredUserCredential
} from '../auth/passwordSecurity.js';
import { ensureStudentSupportChatRoom } from './chat.controller.js';
import { recordSensitiveAudit } from '../storage/auditLogManager.js';
import { extractSecureClientIp } from '../security/ipSecurity.js';

const COL_STUDENTS = 'student_profiles';
const COL_ADVISORS = 'advisors';

function sanitizeText(str: any): string {
  if (typeof str !== 'string') return '';
  return sanitizeString(str).sanitized;
}

export const adminUserController = {
  // 1. Get All Accounts with Filters and Analytics
  async getUsers(req: Request, res: Response) {
    try {
      const { role, search, status } = req.query;
      const allUsers = db.find<StoredUserCredential>(COL_USER_CREDENTIALS, undefined, seedDefaultCredentials()) || [];

      let filtered = [...allUsers];

      if (role && role !== 'all' && typeof role === 'string') {
        filtered = filtered.filter((u) => u.role === role.toLowerCase());
      }

      if (status && status !== 'all' && typeof status === 'string') {
        if (status === 'locked') {
          filtered = filtered.filter((u) => u.isLocked);
        } else if (status === 'active') {
          filtered = filtered.filter((u) => !u.isLocked);
        }
      }

      if (search && typeof search === 'string') {
        const q = search.trim().toLowerCase();
        filtered = filtered.filter((u) =>
          (u.username && u.username.toLowerCase().includes(q)) ||
          (u.fullName && u.fullName.toLowerCase().includes(q)) ||
          (u.phone && u.phone.includes(q)) ||
          ((u as any).email && (u as any).email.toLowerCase().includes(q)) ||
          (u.studentId && u.studentId.toLowerCase().includes(q))
        );
      }

      // Safe representation - never return password hashes to the client
      const safeUsers = filtered.map((u) => ({
        id: u.id,
        userId: u.userId,
        username: u.username,
        fullName: u.fullName || u.username,
        name: u.fullName || u.username,
        role: u.role,
        phone: u.phone || null,
        email: (u as any).email || null,
        studentId: u.studentId || null,
        advisorId: u.advisorId || null,
        isLocked: Boolean(u.isLocked),
        failedLoginAttempts: u.failedLoginAttempts || 0,
        createdAt: u.createdAt,
        updatedAt: u.updatedAt,
        lastLoginAt: u.lastLoginAt || null
      }));

      const stats = {
        total: allUsers.length,
        students: allUsers.filter((u) => u.role === 'student').length,
        advisors: allUsers.filter((u) => u.role === 'advisor').length,
        parents: allUsers.filter((u) => u.role === 'parent').length,
        admins: allUsers.filter((u) => u.role === 'admin').length,
        locked: allUsers.filter((u) => u.isLocked).length
      };

      res.json({
        success: true,
        stats,
        total: safeUsers.length,
        users: safeUsers
      });
    } catch (err: any) {
      console.error('[AdminUserController] getUsers error:', err);
      res.status(500).json({ success: false, error: err.message });
    }
  },

  // 2. Create Custom Account with Admin-Defined Username & Password
  async createUser(req: Request, res: Response) {
    const clientIp = extractSecureClientIp(req);
    const userAgent = (req.headers['user-agent'] as string) || '';

    try {
      const {
        username: rawUsername,
        password: rawPassword,
        fullName: rawFullName,
        role: rawRole = 'student',
        email: rawEmail,
        phone: rawPhone,
        grade = '12th',
        group = 'experimental',
        pin: rawPin = '1234'
      } = req.body;

      // 1. Validation
      const cleanUsername = sanitizeText(rawUsername).trim().toLowerCase();
      if (!cleanUsername || cleanUsername.length < 3) {
        res.status(400).json({
          success: false,
          message: 'نام کاربری باید حداقل ۳ کاراکتر انگلیسی یا ترکیبی از حروف و اعداد باشد.'
        });
        return;
      }

      const cleanPassword = (rawPassword || '').toString().trim();
      if (!cleanPassword || cleanPassword.length < 4) {
        res.status(400).json({
          success: false,
          message: 'گذرواژه باید حداقل ۴ کاراکتر باشد.'
        });
        return;
      }

      const cleanName = sanitizeText(rawFullName).trim() || cleanUsername;
      const validRoles = ['student', 'advisor', 'parent', 'admin'];
      const role = validRoles.includes(rawRole) ? rawRole : 'student';

      const email = typeof rawEmail === 'string' && rawEmail.includes('@')
        ? rawEmail.trim().toLowerCase()
        : null;

      const phone = typeof rawPhone === 'string' && rawPhone.trim()
        ? rawPhone.trim()
        : null;

      // 2. Uniqueness Check
      const allUsers = db.find<StoredUserCredential>(COL_USER_CREDENTIALS, undefined, seedDefaultCredentials()) || [];
      const duplicate = allUsers.find(
        (u) =>
          u.username.toLowerCase() === cleanUsername ||
          (email && (u as any).email && (u as any).email.toLowerCase() === email) ||
          (phone && u.phone && u.phone === phone)
      );

      if (duplicate) {
        res.status(409).json({
          success: false,
          message: `حساب کاربری با نام کاربری «${cleanUsername}» یا مشخصات تماس واردشده از قبل وجود دارد.`
        });
        return;
      }

      // 3. Cryptographic Password Hashing (Zero Plaintext Security)
      const salt = await bcrypt.genSalt(BCRYPT_SALT_ROUNDS);
      const passwordHash = await bcrypt.hash(cleanPassword, salt);
      const pinHash = await bcrypt.hash(String(rawPin || '1234').trim(), salt);

      const now = new Date().toISOString();
      const hashId = crypto.createHash('md5').update(cleanUsername + now).digest('hex').slice(0, 6);

      const studentId = role === 'student' ? `std-${hashId}` : undefined;
      const advisorId = role === 'advisor' ? `adv-${hashId}` : undefined;
      const userId = `usr-${role.slice(0, 3)}-${hashId}`;

      const newCredential: StoredUserCredential = {
        id: `cred-${hashId}`,
        userId,
        username: cleanUsername,
        fullName: cleanName,
        role: role as any,
        phone: phone || undefined,
        studentId,
        advisorId,
        childStudentId: role === 'parent' ? 'std-101' : undefined,
        passwordHash,
        pinHash,
        isPlaintextPassword: false,
        algorithm: 'bcrypt',
        saltRounds: BCRYPT_SALT_ROUNDS,
        lastPasswordChange: now,
        failedLoginAttempts: 0,
        isLocked: false,
        createdAt: now,
        updatedAt: now
      };

      if (email) {
        (newCredential as any).email = email;
      }

      // 4. Save to Database
      db.insert(COL_USER_CREDENTIALS, newCredential);

      // 5. Synchronize with Domain Profiles
      if (role === 'student' && studentId) {
        db.insert(COL_STUDENTS, {
          id: studentId,
          userId,
          name: cleanName,
          fullName: cleanName,
          username: cleanUsername,
          email: email || undefined,
          phone: phone || undefined,
          role: 'student',
          grade: grade || '12th',
          group: group || 'experimental',
          status: 'active',
          registeredAt: now,
          createdAt: now
        });

        // Initialize Direct Support Chat Room for Student
        try {
          ensureStudentSupportChatRoom(studentId, cleanName, email || phone || cleanUsername, grade);
        } catch (chatErr) {
          console.warn('[AdminUserController] Chat room notice:', chatErr);
        }
      } else if (role === 'advisor' && advisorId) {
        db.insert(COL_ADVISORS, {
          id: advisorId,
          userId,
          name: cleanName,
          fullName: cleanName,
          username: cleanUsername,
          email: email || undefined,
          phone: phone || undefined,
          role: 'advisor',
          status: 'active',
          createdAt: now
        });
      }

      // 6. Security Audit Log
      recordSensitiveAudit({
        category: 'USER_MANAGEMENT',
        action: 'ADMIN_CREATE_USER',
        userId: req.authUser?.id || 'admin',
        userName: req.authUser?.name || 'مدیر سیستم',
        userRole: 'admin',
        resource: `/api/v1/admin/users/${cleanUsername}`,
        details: `اکانت کاربری جدید با نام کاربری ${cleanUsername} و نقش ${role} با موفقیت توسط مدیر ایجاد شد.`,
        status: 'granted',
        severity: 'info',
        ip: clientIp,
        userAgent
      });

      res.status(201).json({
        success: true,
        message: `حساب کاربری جدید برای «${cleanName}» با نام کاربری ${cleanUsername} با موفقیت ایجاد شد ✨`,
        user: {
          id: newCredential.id,
          userId,
          username: cleanUsername,
          fullName: cleanName,
          role,
          email,
          phone,
          studentId,
          advisorId,
          createdAt: now,
          // Return clear credentials for the admin copy card
          issuedCredentials: {
            username: cleanUsername,
            password: cleanPassword,
            role,
            fullName: cleanName
          }
        }
      });
    } catch (err: any) {
      console.error('[AdminUserController] createUser error:', err);
      res.status(500).json({ success: false, error: err.message });
    }
  },

  // 3. Reset / Change User Password Directly
  async resetPassword(req: Request, res: Response) {
    const clientIp = extractSecureClientIp(req);
    const userAgent = (req.headers['user-agent'] as string) || '';

    try {
      const { userId, username, newPassword } = req.body;
      const cleanPass = (newPassword || '').toString().trim();

      if (!cleanPass || cleanPass.length < 4) {
        res.status(400).json({
          success: false,
          message: 'رمز عبور جدید باید حداقل ۴ کاراکتر باشد.'
        });
        return;
      }

      const allUsers = db.find<StoredUserCredential>(COL_USER_CREDENTIALS, undefined, seedDefaultCredentials()) || [];
      const user = allUsers.find(
        (u) =>
          u.id === userId ||
          u.userId === userId ||
          (username && u.username.toLowerCase() === username.trim().toLowerCase())
      );

      if (!user) {
        res.status(404).json({
          success: false,
          message: 'حساب کاربری موردنظر یافت نشد.'
        });
        return;
      }

      const salt = await bcrypt.genSalt(BCRYPT_SALT_ROUNDS);
      const passwordHash = await bcrypt.hash(cleanPass, salt);
      const now = new Date().toISOString();

      const updated = db.update<StoredUserCredential>(
        COL_USER_CREDENTIALS,
        user.id,
        {
          passwordHash,
          lastPasswordChange: now,
          failedLoginAttempts: 0,
          isLocked: false,
          updatedAt: now
        }
      );

      recordSensitiveAudit({
        category: 'USER_MANAGEMENT',
        action: 'ADMIN_RESET_PASSWORD',
        userId: req.authUser?.id || 'admin',
        userName: req.authUser?.name || 'مدیر سیستم',
        userRole: 'admin',
        resource: `/api/v1/admin/users/${user.username}/password`,
        details: `رمز عبور کاربر ${user.username} با موفقیت توسط مدیر بازنشانی شد.`,
        status: 'granted',
        severity: 'warning',
        ip: clientIp,
        userAgent
      });

      res.json({
        success: true,
        message: `گذرواژه حساب «${user.fullName || user.username}» با موفقیت به‌روزرسانی شد.`,
        username: user.username,
        updatedAt: now
      });
    } catch (err: any) {
      console.error('[AdminUserController] resetPassword error:', err);
      res.status(500).json({ success: false, error: err.message });
    }
  },

  // 4. Toggle Account Lock Status
  async toggleLock(req: Request, res: Response) {
    try {
      const { userId, isLocked } = req.body;
      const allUsers = db.find<StoredUserCredential>(COL_USER_CREDENTIALS, undefined, seedDefaultCredentials()) || [];
      const user = allUsers.find((u) => u.id === userId || u.userId === userId);

      if (!user) {
        res.status(404).json({ success: false, message: 'کاربر یافت نشد.' });
        return;
      }

      const newLockState = typeof isLocked === 'boolean' ? isLocked : !user.isLocked;
      const now = new Date().toISOString();

      db.update<StoredUserCredential>(COL_USER_CREDENTIALS, user.id, {
        isLocked: newLockState,
        failedLoginAttempts: newLockState ? user.failedLoginAttempts : 0,
        updatedAt: now
      });

      res.json({
        success: true,
        isLocked: newLockState,
        message: newLockState
          ? `حساب کاربری «${user.username}» مسدود شد.`
          : `حساب کاربری «${user.username}» با موفقیت فعال گردید.`
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  },

  // 5. Delete Account
  async deleteUser(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const allUsers = db.find<StoredUserCredential>(COL_USER_CREDENTIALS, undefined, seedDefaultCredentials()) || [];
      const user = allUsers.find((u) => u.id === id || u.userId === id || u.username === id);

      if (!user) {
        res.status(404).json({ success: false, message: 'کاربر مورد نظر یافت نشد.' });
        return;
      }

      // Prevent self-deletion of super admin
      if (user.username === 'admin') {
        res.status(403).json({
          success: false,
          message: 'حذف حساب مدیر ارشد پیش‌فرض سامانه مجاز نمی‌باشد.'
        });
        return;
      }

      db.delete(COL_USER_CREDENTIALS, user.id);

      if (user.studentId) {
        db.delete(COL_STUDENTS, user.studentId);
      }

      res.json({
        success: true,
        message: `حساب کاربری «${user.username}» با موفقیت حذف گردید.`
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }
};
