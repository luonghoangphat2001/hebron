export type BaseNotificationCategory = 'ALL' | 'ORDER' | 'INQUIRY' | 'SYSTEM' | (string & {});

export type NotificationCategory = BaseNotificationCategory;

export type NotificationItem<TMetadata = unknown> = {
  id: string;
  category: NotificationCategory;
  title: string;
  message: string;
  createdAt: string;
  isRead: boolean;
  link?: string;
  metadata?: TMetadata;
};

export type CategoryBadgeConfig = {
  label: string;
  icon: React.ReactNode;
  badgeClass: string;
  circleClass: string;
};
