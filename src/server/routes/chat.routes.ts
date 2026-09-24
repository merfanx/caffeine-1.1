import { Router } from 'express';
import { chatController } from '../controllers/chat.controller.js';
import { optionalAuth, requireRole } from '../middleware/auth.middleware.js';

export const chatRouter = Router();

// Chat Rooms
chatRouter.get('/chat/rooms', optionalAuth, chatController.getRooms);
chatRouter.post('/chat/init-student-support', optionalAuth, chatController.initStudentSupport);
chatRouter.post('/chat/rooms', optionalAuth, chatController.createRoom);
chatRouter.patch('/chat/rooms/:id/status', requireRole('admin', 'advisor'), chatController.updateRoomStatus);
chatRouter.patch('/chat/rooms/:id/lock', requireRole('admin', 'advisor'), chatController.toggleRoomLock);
chatRouter.post('/chat/rooms/:id/toggle-lock', requireRole('admin', 'advisor'), chatController.toggleRoomLock);
chatRouter.delete('/chat/rooms/:id', requireRole('admin'), chatController.deleteRoom);

// Messages
chatRouter.get('/chat/messages', optionalAuth, chatController.getMessages);
chatRouter.post('/chat/messages', optionalAuth, chatController.sendMessage);
chatRouter.post('/chat/pin-message', optionalAuth, chatController.pinMessage);
chatRouter.post('/chat/reaction', optionalAuth, chatController.reactionMessage);
chatRouter.delete('/chat/messages/:messageId', optionalAuth, chatController.deleteMessage);
