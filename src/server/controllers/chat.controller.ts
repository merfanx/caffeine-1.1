import { Request, Response } from 'express';
import { db } from '../storage/dbBridge.js';
import { sanitizeString } from '../security/apiHardening.js';
import { extractSecureClientIp } from '../security/ipSecurity.js';
import { recordSensitiveAudit } from '../storage/auditLogManager.js';
import {
  authorizeChatRoomAccess,
  validateAndSanitizeMessage,
  resolveSenderIdentity,
  checkChatMessageRateLimit,
  checkChatRoomCreateRateLimit,
  generateAnonymousGuestId
} from '../security/chatSecurityService.js';
import { broadcastToRoom } from '../services/websocketService.js';
import { DEFAULT_CHAT_ROOMS, DEFAULT_CHAT_MESSAGES } from '../../lib/defaultChatData.js';

const COL_CHAT_ROOMS = 'internal_chat_rooms';
const COL_CHAT_MESSAGES = 'internal_chat_messages';

export function ensureStudentSupportChatRoom(
  studentId: string,
  studentName: string,
  studentPhone?: string,
  studentGrade = '12th'
) {
  const cleanStudentId = String(studentId).replace(/^usr-/, '');
  const targetRoomId = `direct-support-${cleanStudentId}`;

  const allRooms = db.find<any>(COL_CHAT_ROOMS, undefined, DEFAULT_CHAT_ROOMS);
  const existingRoom = allRooms.find((r) => r.id === targetRoomId || r.id === `dm-support-${cleanStudentId}`);

  if (existingRoom) {
    return existingRoom;
  }

  const newSupportRoom = {
    id: targetRoomId,
    name: 'پشتیبانی و مشاوره تخصصی کافئین',
    topic: `کانال مستقیم گفتگو و هدایت تحصیلی اختصاصی پایه ${studentGrade}`,
    category: 'direct',
    type: 'direct',
    approvalStatus: 'approved',
    directStudentId: cleanStudentId,
    directStudentName: studentName,
    directStudentPhone: studentPhone || '',
    isSupportRoom: true,
    isLocked: false,
    isAdvisorStudentGroup: false,
    advisorId: 'adv-1',
    creatorId: `usr-${cleanStudentId}`,
    creatorName: studentName,
    creatorRole: 'student',
    participantIds: [`usr-${cleanStudentId}`, 'adv-1', 'admin-01'],
    unreadCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  db.insert(COL_CHAT_ROOMS, newSupportRoom);

  const welcomeMessage = {
    id: `msg-welcome-${Date.now()}`,
    roomId: targetRoomId,
    senderId: 'adv-1',
    senderName: 'دکتر علیرضا کاظمی (مشاور ارشد)',
    senderRole: 'advisor',
    senderAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    senderBadge: 'مشاور رتبه برتر',
    text: `سلام داوطلب عزیز! خوش آمدید به کافئین OS ☕️\nاینجا خط ارتباطی مستقیم شما با تیم مشاوران و منتورهای اختصاصی است. هر سوالی در رابطه با برنامه‌ریزی، آزمون‌ها، تحلیل کارنامه و روش‌های مطالعه داشتید، در هر ساعت از شبانه‌روز می‌توانید بپرسید.`,
    createdAt: new Date().toISOString()
  };

  db.insert(COL_CHAT_MESSAGES, welcomeMessage);

  return newSupportRoom;
}

export function ensureGuestSupportChatRoom() {
  const targetRoomId = 'direct-support-guest';
  const allRooms = db.find<any>(COL_CHAT_ROOMS, undefined, DEFAULT_CHAT_ROOMS);
  const existingRoom = allRooms.find((r) => r.id === targetRoomId || r.id === 'dm-support-guest');

  if (existingRoom) {
    return existingRoom;
  }

  const guestRoom = {
    id: targetRoomId,
    name: 'پشتیبانی و مشاوره آنلاین (مهمان)',
    topic: 'کانال ارتباطی رایگان با کارشناسان و پشتیبانان آموزشگاه کافئین',
    category: 'direct',
    type: 'direct',
    approvalStatus: 'approved',
    directStudentId: 'guest',
    directStudentName: 'کاربر مهمان',
    isSupportRoom: true,
    isLocked: false,
    unreadCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  db.insert(COL_CHAT_ROOMS, guestRoom);

  const welcomeMsg = {
    id: `msg-welcome-guest`,
    roomId: targetRoomId,
    senderId: 'adv-1',
    senderName: 'پشتیبانی و مشاوره کافئین',
    senderRole: 'advisor',
    senderAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    senderBadge: 'پشتیبان رسمی',
    text: 'سلام و درود داوطلب گرامی! به سامانه هوشمند کنکور کافئین خوش آمدید ☕️\nشما به عنوان کاربر مهمان می‌توانید در این گفتگوی مستقیم، سوالات خود درباره ثبت‌نام، پکیج‌های مشاوره‌ای و دوره‌ها را با پشتیبانی مطرح فرمایید.',
    createdAt: new Date().toISOString()
  };

  db.insert(COL_CHAT_MESSAGES, welcomeMsg);

  return guestRoom;
}

export const chatController = {
  // 1. Get Chat Rooms
  getRooms(req: Request, res: Response) {
    try {
      const authUser = req.authUser;

      // Ensure support room is automatically ready for whichever user/guest is accessing
      if (authUser && authUser.role === 'student') {
        const studentId = (authUser.studentId || authUser.id).replace(/^usr-/, '');
        ensureStudentSupportChatRoom(studentId, authUser.name || 'دانش‌آموز', authUser.phone || '', '12th');
      } else if (authUser && authUser.role === 'parent') {
        const childId = (authUser.childStudentId || '').replace(/^usr-/, '');
        if (childId) {
          ensureStudentSupportChatRoom(childId, `فرزند ${authUser.name || 'ولی'}`, '', '12th');
        }
      } else if (!authUser || authUser.role === 'guest') {
        ensureGuestSupportChatRoom();
      }

      const rooms = db.find<any>(COL_CHAT_ROOMS, undefined, DEFAULT_CHAT_ROOMS);
      const messages = db.find<any>(COL_CHAT_MESSAGES, undefined, DEFAULT_CHAT_MESSAGES);

      const visibleRooms = rooms.filter((room) => {
        const check = authorizeChatRoomAccess(authUser || null, room, 'read');
        return check.allowed;
      });

      const enrichedRooms = visibleRooms.map((room) => {
        const roomMsgs = messages.filter((m) => m.roomId === room.id);
        const lastMsg = roomMsgs.length > 0 ? roomMsgs[roomMsgs.length - 1] : undefined;
        return {
          ...room,
          lastMessage: lastMsg
            ? {
                id: lastMsg.id,
                senderName: lastMsg.senderName,
                text: lastMsg.text,
                timestamp: lastMsg.createdAt
              }
            : undefined
        };
      });

      res.json({ success: true, rooms: enrichedRooms });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  },

  // 2. Initialize Student Support Room
  initStudentSupport(req: Request, res: Response) {
    try {
      const authUser = req.authUser;
      const { studentId: bodyId, studentName: bodyName, studentPhone, studentGrade } = req.body;

      // If unauthenticated guest: ALWAYS return guest support room (Zero Student PII)
      if (!authUser || authUser.role === 'guest') {
        const guestRoom = ensureGuestSupportChatRoom();
        res.json({ success: true, room: guestRoom });
        return;
      }

      let effectiveStudentId = '';
      let effectiveStudentName = 'دانش‌آموز';

      if (authUser.role === 'student') {
        effectiveStudentId = (authUser.studentId || authUser.id).replace(/^usr-/, '');
        effectiveStudentName = authUser.name || authUser.username || 'دانش‌آموز';
      } else if (authUser.role === 'parent') {
        effectiveStudentId = (authUser.childStudentId || '').replace(/^usr-/, '');
        effectiveStudentName = `فرزند ${authUser.name || 'ولی'}`;
        if (!effectiveStudentId) {
          res.status(400).json({ success: false, error: 'شناسه فرزند دانش‌آموز یافت نشد.' });
          return;
        }
      } else if (authUser.role === 'admin' || authUser.role === 'advisor') {
        effectiveStudentId = String(bodyId || '').replace(/^usr-/, '');
        effectiveStudentName = bodyName ? sanitizeString(String(bodyName)).sanitized : 'دانش‌آموز';
        if (!effectiveStudentId) {
          res.status(400).json({ success: false, error: 'شناسه دانش‌آموز الزامی است.' });
          return;
        }
      }

      const room = ensureStudentSupportChatRoom(
        effectiveStudentId,
        effectiveStudentName,
        studentPhone || (authUser?.phone || ''),
        studentGrade || '12th'
      );

      res.json({ success: true, room });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  },

  // 3. Create Chat Room
  createRoom(req: Request, res: Response) {
    try {
      const authUser = req.authUser;
      const resolved = resolveSenderIdentity(req, req.body);

      // Guests are not allowed to create rooms
      if (resolved.senderRole === 'guest' || !authUser) {
        res.status(401).json({
          success: false,
          error: 'ایجاد تالار گفتگوی جدید نیازمند ورود به حساب کاربری است.'
        });
        return;
      }

      const rateLimitCheck = checkChatRoomCreateRateLimit(req, resolved.senderId);
      if (!rateLimitCheck.allowed) {
        res.status(429).json({
          success: false,
          error: `تعداد درخواست‌های ایجاد تالار بیش از حد مجاز است. لطفاً ${rateLimitCheck.retryAfterSeconds} ثانیه دیگر دوباره تلاش کنید.`
        });
        return;
      }

      const roomData = req.body;
      const isAdvisor = resolved.senderRole === 'advisor';
      const isAdmin = resolved.senderRole === 'admin';

      const newRoom = {
        ...roomData,
        id: roomData.id || `room-${Date.now()}`,
        name: sanitizeString(String(roomData.name || 'تالار گفتگو')).sanitized.substring(0, 100),
        topic: roomData.topic ? sanitizeString(String(roomData.topic)).sanitized.substring(0, 300) : '',
        category: (roomData.category === 'direct' && (isAdmin || isAdvisor)) ? 'direct' : 'public',
        approvalStatus: isAdmin ? 'approved' : (isAdvisor ? 'pending_approval' : 'approved'),
        isLocked: Boolean(roomData.isLocked || false),
        creatorId: resolved.senderId,
        creatorName: resolved.senderName,
        creatorRole: resolved.senderRole,
        advisorId: isAdvisor ? resolved.senderId : roomData.advisorId,
        isAdvisorStudentGroup: isAdvisor ? true : (isAdmin ? Boolean(roomData.isAdvisorStudentGroup) : false),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      db.insert(COL_CHAT_ROOMS, newRoom);

      broadcastToRoom('all', {
        type: 'chat:room_broadcast',
        payload: { action: 'created', room: newRoom }
      });

      res.json({ success: true, room: newRoom });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  },

  // 4. Update Room Approval Status or Lock Status (Admin / Advisor)
  updateRoomStatus(req: Request, res: Response) {
    try {
      const roomId = req.params.id;
      const { status, rejectionReason, approvedBy, isLocked } = req.body;

      const existing = db.findById<any>(COL_CHAT_ROOMS, roomId, DEFAULT_CHAT_ROOMS);
      if (!existing) {
        res.status(404).json({ success: false, error: 'تالار مورد نظر یافت نشد.' });
        return;
      }

      const updated = {
        ...existing,
        approvalStatus: status || existing.approvalStatus || 'approved',
        isLocked: typeof isLocked === 'boolean' ? isLocked : (existing.isLocked || false),
        rejectionReason: rejectionReason ? sanitizeString(String(rejectionReason)).sanitized : '',
        approvedBy: approvedBy ? sanitizeString(String(approvedBy)).sanitized : (req.authUser?.name || 'مدیریت سامانه'),
        updatedAt: new Date().toISOString()
      };

      const inDb = db.findById<any>(COL_CHAT_ROOMS, roomId);
      if (inDb) {
        db.update<any>(COL_CHAT_ROOMS, roomId, updated, DEFAULT_CHAT_ROOMS);
      } else {
        db.insert(COL_CHAT_ROOMS, updated);
      }

      broadcastToRoom('all', {
        type: 'chat:room_broadcast',
        payload: { action: 'status_updated', room: updated }
      });

      res.json({ success: true, room: updated });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  },

  // 4b. Toggle Room Lock (Admin / Advisor)
  toggleRoomLock(req: Request, res: Response) {
    try {
      const roomId = req.params.id;
      const authUser = req.authUser;
      const allRooms = db.find<any>(COL_CHAT_ROOMS, undefined, DEFAULT_CHAT_ROOMS);
      const existing = allRooms.find((r) => r.id === roomId);

      if (!existing) {
        res.status(404).json({ success: false, error: 'تالار مورد نظر یافت نشد.' });
        return;
      }

      const accessCheck = authorizeChatRoomAccess(authUser || null, existing, 'manage');
      if (!accessCheck.allowed) {
        res.status(accessCheck.statusCode || 403).json({ success: false, error: accessCheck.reason });
        return;
      }

      const targetLock = typeof req.body.isLocked === 'boolean' ? req.body.isLocked : !existing.isLocked;

      const updated = {
        ...existing,
        isLocked: targetLock,
        lockedBy: targetLock ? (authUser?.name || 'مدیریت سامانه') : undefined,
        lockedAt: targetLock ? new Date().toISOString() : undefined,
        updatedAt: new Date().toISOString()
      };

      const inDb = db.findById<any>(COL_CHAT_ROOMS, roomId);
      if (inDb) {
        db.update<any>(COL_CHAT_ROOMS, roomId, updated, DEFAULT_CHAT_ROOMS);
      } else {
        db.insert(COL_CHAT_ROOMS, updated);
      }

      broadcastToRoom('all', {
        type: 'chat:room_broadcast',
        payload: { action: 'lock_toggled', room: updated }
      });

      res.json({ success: true, room: updated, isLocked: targetLock });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  },

  // 5. Delete Room (Admin)
  deleteRoom(req: Request, res: Response) {
    try {
      const roomId = req.params.id;
      db.delete(COL_CHAT_ROOMS, roomId);

      broadcastToRoom('all', {
        type: 'chat:room_broadcast',
        payload: { action: 'deleted', roomId }
      });

      res.json({ success: true, message: 'تالار با موفقیت حذف شد.' });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  },

  // 6. Get Room Messages
  getMessages(req: Request, res: Response) {
    try {
      const authUser = req.authUser;
      const roomId = (req.query.roomId as string) || 'room-general';
      const limit = Math.min(parseInt(req.query.limit as string) || 100, 200);

      const allRooms = db.find<any>(COL_CHAT_ROOMS, undefined, DEFAULT_CHAT_ROOMS);
      const targetRoom = allRooms.find((r) => r.id === roomId) || { id: roomId, category: 'public', type: 'channel' };

      const accessCheck = authorizeChatRoomAccess(authUser || null, targetRoom, 'read');
      if (!accessCheck.allowed) {
        res.status(accessCheck.statusCode || 403).json({ success: false, error: accessCheck.reason });
        return;
      }

      const messages = db.find<any>(COL_CHAT_MESSAGES, (m: any) => m.roomId === roomId, DEFAULT_CHAT_MESSAGES);
      const sorted = [...messages].sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
      res.json({ success: true, messages: sorted.slice(-limit) });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  },

  // 7. Send Message
  sendMessage(req: Request, res: Response) {
    try {
      const authUser = req.authUser;
      const resolvedIdentity = resolveSenderIdentity(req, req.body);

      const rateLimitCheck = checkChatMessageRateLimit(req, resolvedIdentity.senderId);
      if (!rateLimitCheck.allowed) {
        res.status(429).json({
          success: false,
          error: `نرخ ارسال پیام بیش از حد مجاز است. لطفاً ${rateLimitCheck.retryAfterSeconds} ثانیه دیگر تلاش کنید.`
        });
        return;
      }

      const roomId = String(req.body.roomId || 'room-general');
      const allRooms = db.find<any>(COL_CHAT_ROOMS, undefined, DEFAULT_CHAT_ROOMS);
      const targetRoom = allRooms.find((r) => r.id === roomId) || { id: roomId, category: 'public', type: 'channel' };

      const accessCheck = authorizeChatRoomAccess(authUser || null, targetRoom, 'write');
      if (!accessCheck.allowed) {
        recordSensitiveAudit({
          category: 'SECURITY_ACCESS',
          action: 'CHAT_UNAUTHORIZED_WRITE_ATTEMPT',
          userId: resolvedIdentity.senderId,
          userName: resolvedIdentity.senderName,
          userRole: resolvedIdentity.senderRole,
          resource: `chat/room/${roomId}`,
          details: `تلاش غیرمجاز برای ارسال پیام در تالار: ${accessCheck.reason}`,
          status: 'denied',
          severity: 'warning',
          ip: extractSecureClientIp(req),
          userAgent: req.headers['user-agent']
        });
        res.status(accessCheck.statusCode || 403).json({ success: false, error: accessCheck.reason });
        return;
      }

      const validation = validateAndSanitizeMessage(req.body);
      if (!validation.valid) {
        res.status(400).json({ success: false, error: validation.error });
        return;
      }

      const newMsg = {
        id: req.body.id || `msg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        roomId,
        senderId: resolvedIdentity.senderId,
        senderName: resolvedIdentity.senderName,
        senderRole: resolvedIdentity.senderRole,
        senderAvatar: resolvedIdentity.senderAvatar,
        senderBadge: resolvedIdentity.senderBadge,
        text: validation.sanitizedText || '',
        attachmentUrl: validation.sanitizedAttachment?.url,
        attachmentName: validation.sanitizedAttachment?.name,
        attachmentType: validation.sanitizedAttachment?.type,
        attachmentSize: validation.sanitizedAttachment?.size,
        replyTo: req.body.replyTo,
        isPinned: Boolean(req.body.isPinned),
        reactions: req.body.reactions || {},
        createdAt: req.body.createdAt || new Date().toISOString()
      };

      db.insert(COL_CHAT_MESSAGES, newMsg);

      broadcastToRoom(roomId, {
        type: 'chat:message_received',
        payload: newMsg
      });

      res.json({ success: true, message: newMsg });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  },

  // 8. Pin Message (Admin / Advisor only)
  pinMessage(req: Request, res: Response) {
    try {
      const authUser = req.authUser;
      if (!authUser || (authUser.role !== 'admin' && authUser.role !== 'advisor' && authUser.role !== 'super_admin')) {
        res.status(403).json({ success: false, error: 'تنها مشاوران و مدیران سیستم مجاز به سنجاق کردن پیام‌ها هستند.' });
        return;
      }

      const { messageId, isPinned, roomId } = req.body;
      const msg = db.findById<any>(COL_CHAT_MESSAGES, messageId, DEFAULT_CHAT_MESSAGES);
      if (!msg) {
        res.status(404).json({ success: false, error: 'پیام یافت نشد.' });
        return;
      }

      const updated = { ...msg, isPinned: Boolean(isPinned) };
      const inDb = db.findById<any>(COL_CHAT_MESSAGES, messageId);
      if (inDb) {
        db.update<any>(COL_CHAT_MESSAGES, messageId, updated, DEFAULT_CHAT_MESSAGES);
      } else {
        db.insert(COL_CHAT_MESSAGES, updated);
      }

      broadcastToRoom(roomId || msg.roomId, {
        type: 'chat:pin_broadcast',
        payload: { messageId, isPinned: Boolean(isPinned), roomId: roomId || msg.roomId }
      });

      res.json({ success: true, message: updated });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  },

  // 9. React to Message
  reactionMessage(req: Request, res: Response) {
    try {
      const { messageId, emoji, userId: bodyUserId, roomId } = req.body;
      const authUser = req.authUser;
      const effectiveUserId = authUser ? (authUser.id || authUser.userId || authUser.username || 'user') : (bodyUserId || 'guest');
      
      if (!emoji || typeof emoji !== 'string' || emoji.length > 8) {
        res.status(400).json({ success: false, error: 'اموجی نامعتبر است.' });
        return;
      }

      const safeEmoji = sanitizeString(emoji).sanitized;

      const msg = db.findById<any>(COL_CHAT_MESSAGES, messageId, DEFAULT_CHAT_MESSAGES);
      if (!msg) {
        res.status(404).json({ success: false, error: 'پیام یافت نشد.' });
        return;
      }

      const reactions: Record<string, string[]> = { ...(msg.reactions || {}) };
      const currentList: string[] = Array.isArray(reactions[safeEmoji]) ? [...reactions[safeEmoji]] : [];
      const isAlreadyIn = currentList.includes(effectiveUserId);

      let updatedList: string[];
      if (isAlreadyIn) {
        updatedList = currentList.filter((id) => id !== effectiveUserId);
      } else {
        updatedList = [...currentList, effectiveUserId];
      }

      if (updatedList.length > 0) {
        reactions[safeEmoji] = updatedList;
      } else {
        delete reactions[safeEmoji];
      }

      const inDb = db.findById<any>(COL_CHAT_MESSAGES, messageId);
      if (inDb) {
        db.update<any>(COL_CHAT_MESSAGES, messageId, { reactions }, DEFAULT_CHAT_MESSAGES);
      } else {
        db.insert(COL_CHAT_MESSAGES, { ...msg, reactions });
      }

      broadcastToRoom(roomId || msg.roomId, {
        type: 'chat:reaction_broadcast',
        payload: { messageId, reactions, roomId: roomId || msg.roomId }
      });

      res.json({ success: true, reactions });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  },

  // 10. Delete Message (Author or Admin/Advisor only)
  deleteMessage(req: Request, res: Response) {
    try {
      const { messageId } = req.params;
      const { roomId } = req.body;
      const authUser = req.authUser;

      const msg = db.findById<any>(COL_CHAT_MESSAGES, messageId, DEFAULT_CHAT_MESSAGES);
      if (!msg) {
        res.status(404).json({ success: false, error: 'پیام مورد نظر یافت نشد.' });
        return;
      }

      const isStaff = authUser && (authUser.role === 'admin' || authUser.role === 'super_admin' || authUser.role === 'advisor');
      const isAuthor = authUser && (msg.senderId === authUser.id || msg.senderId === authUser.userId || msg.senderId === `usr-${authUser.studentId}`);

      if (!isStaff && !isAuthor) {
        res.status(403).json({ success: false, error: 'عدم دسترسی: شما مجاز به حذف این پیام نیستید.' });
        return;
      }

      db.delete(COL_CHAT_MESSAGES, messageId);

      broadcastToRoom(roomId || msg.roomId || 'room-general', {
        type: 'chat:delete_broadcast',
        payload: { messageId, roomId: roomId || msg.roomId || 'room-general' }
      });

      res.json({ success: true, message: 'پیام با موفقیت حذف شد.' });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }
};
