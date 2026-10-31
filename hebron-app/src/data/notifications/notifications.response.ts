export type NotificationType = 'inquiry_reply' | 'order_status_changed' | 'payment_succeeded' | (string & {});

export type NotificationInquiryPayload = {
  inquiry_id?: number;
  reply_id?: number;
  [key: string]: unknown;
};

export type NotificationOrderPayload = {
  order_id?: number | string;
  order_number?: string;
  orderNumber?: string;
  status?: string;
  [key: string]: unknown;
};

export type NotificationPaymentPayload = {
  order_id?: number | string;
  order_number?: string;
  orderNumber?: string;
  payment_id?: number | string;
  amount?: number;
  [key: string]: unknown;
};

export type NotificationDataRESP = {
  title: string;
  message: string;
  payload?: NotificationInquiryPayload | NotificationOrderPayload | NotificationPaymentPayload | Record<string, unknown>;
  link?: string;
};

export type NotificationItemRESP = {
  id: string;
  type: NotificationType;
  data: NotificationDataRESP;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
};

export type NotificationListRESP = {
  notifications: NotificationItemRESP[];
  unread_count: number;
};
