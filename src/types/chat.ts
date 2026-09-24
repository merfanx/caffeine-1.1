export interface ChatMessage {
  id: string;
  roomId: string;
  senderId: string;
  senderName: string;
  senderRole: 'student' | 'advisor' | 'admin' | 'parent' | 'guest';
  senderAvatar?: string;
  senderBadge?: string;
  content?: string;
  text?: string;
  timestamp?: string;
  createdAt?: string;
  mediaType?: 'text' | 'image' | 'file' | 'audio' | 'voice' | 'system';
  mediaUrl?: string;
  fileName?: string;
  fileSize?: string;
  audioDuration?: number;
  isPinned?: boolean;
  replyToId?: string;
  replyTo?: any;
  replyToSnippet?: string;
  reactions?: Record<string, string[]>;
  approvalStatus?: 'approved' | 'pending' | 'rejected';
}

export interface ChatRoom {
  id: string;
  name: string;
  description?: string;
  type: any;
  icon?: string;
  topic?: string;
  category: any;
  membersCount: number;
  participants?: any;
  isPinned?: boolean;
  isMainPublicChannel?: boolean;
  approvalStatus: any;
  approvedBy?: string;
  createdAt: string;
  updatedAt: string;
  targetGroup?: any;
  creatorId?: string;
  creatorName?: string;
  creatorRole?: string;
  advisorId?: string;
  studentId?: string;
  studentName?: string;
  studentPhone?: string;
  studentGrade?: string;
  isAdvisorStudentGroup?: boolean;
  isDirectSupport?: boolean;
  isSupportRoom?: boolean;
  isLocked?: boolean;
  lockedBy?: string;
  lockedAt?: string;
  unreadCount?: number;
  lastMessage?: ChatMessage;
}
