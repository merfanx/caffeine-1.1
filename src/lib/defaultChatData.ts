export interface ChatRoom {
  id: string;
  name: string;
  topic?: string;
  category?: 'public' | 'study' | 'support' | 'advisor' | 'announcement' | 'direct';
  type?: string;
  requiresAuth?: boolean;
  unreadCount?: number;
  isOfficial?: boolean;
}

export interface ChatMessage {
  id: string;
  roomId: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  content: string;
  timestamp: string;
  isPinned?: boolean;
}

export const DEFAULT_CHAT_ROOMS: ChatRoom[] = [
  {
    id: 'room-announcements',
    name: 'تابلوی اعلانات و اخبار کنکور',
    topic: 'اطلاعیه‌های رسمی موسسه و سازمان سنجش آموزش کشور',
    category: 'announcement',
    type: 'announcement',
    isOfficial: true,
    requiresAuth: false,
    unreadCount: 0
  },
  {
    id: 'room-general',
    name: 'تالار عمومی داوطلبان کنکور',
    topic: 'تبادل تجربیات، انگیزه و استراتژی‌های کلی آزمون سراسری',
    category: 'public',
    type: 'public',
    requiresAuth: false,
    unreadCount: 0
  },
  {
    id: 'room-math',
    name: 'رفع اشکال ریاضی و فیزیک',
    topic: 'پرسش و پاسخ محاسباتی و تحلیل تست‌های چالشی',
    category: 'study',
    type: 'study',
    requiresAuth: true,
    unreadCount: 0
  },
  {
    id: 'room-biology',
    name: 'رفع اشکال زیست‌شناسی و شیمی',
    topic: 'تحلیل مفهومی و ترکیبی خط‌به‌خط کتب درسی',
    category: 'study',
    type: 'study',
    requiresAuth: true,
    unreadCount: 0
  },
  {
    id: 'room-support',
    name: 'پشتیبانی آنلاین و راهنمای سامانه',
    topic: 'پاسخگویی فنی و راهنمایی پرتال هوشمند کافئین',
    category: 'support',
    type: 'support',
    requiresAuth: false,
    unreadCount: 0
  },
  {
    id: 'room-advisor',
    name: 'ارتباط مستقیم با مشاوران ارشد',
    topic: 'کانال اختصاصی ارتباط داوطلبان با دپارتمان مشاوره VIP',
    category: 'advisor',
    type: 'advisor',
    requiresAuth: true,
    unreadCount: 0
  }
];

export const DEFAULT_CHAT_MESSAGES: ChatMessage[] = [];
