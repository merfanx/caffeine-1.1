export interface AvatarItem {
  id: string;
  name: string;
  url: string;
  category?: string;
  isPremium?: boolean;
}

export const DEFAULT_ILLUSTRATED_AVATARS: AvatarItem[] = [
  { id: 'av-1', name: 'کافئین کلاسیک', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80', category: 'standard' },
  { id: 'av-2', name: 'باریستای حرفه‌ای', url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&auto=format&fit=crop&q=80', category: 'elite' },
  { id: 'av-3', name: 'پژوهشگر جوان', url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80', category: 'standard' },
  { id: 'av-4', name: 'مشاور ارشد', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80', category: 'advisor' }
];
