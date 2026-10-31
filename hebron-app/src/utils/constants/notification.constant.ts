import type { NotificationCategory } from '@/utils/types/notification.type';

export const NOTIFICATION_CATEGORY_FILTERS: Array<{ key: NotificationCategory; label: string }> = [
  { key: 'ALL', label: '전체' },
  { key: 'ORDER', label: '주문' },
  { key: 'INQUIRY', label: '문의 답변' },
];
