import {
  getMyPageOrderDetailPath,
  getMyPageOrdersPath,
  getMyPageShippingInquiryDetailPath,
  getMyPageShippingInquiryPath,
} from '@/utils/constants/route.constant';
import type { NotificationCategory, NotificationItem } from '@/utils/types/notification.type';
import dayjs from 'dayjs';
import type {
  NotificationInquiryPayload,
  NotificationItemRESP,
  NotificationOrderPayload,
  NotificationPaymentPayload,
} from './notifications.response';

export const formatRelativeTime = (dateString?: string): string => {
  if (!dateString) return '방금 전';
  const now = dayjs();
  const date = dayjs(dateString);
  if (!date.isValid()) return dateString;

  const diffMinutes = now.diff(date, 'minute');
  if (diffMinutes < 1) return '방금 전';
  if (diffMinutes < 60) return `${diffMinutes}분 전`;

  const diffHours = now.diff(date, 'hour');
  if (diffHours < 24) return `${diffHours}시간 전`;

  const diffDays = now.diff(date, 'day');
  if (diffDays < 7) return `${diffDays}일 전`;

  return date.format('YYYY.MM.DD');
};

export const mapNotificationItemRESPToItem = (item: NotificationItemRESP): NotificationItem => {
  let category: NotificationCategory = 'SYSTEM';
  let link = item.data?.link;
  const rawType = (item.type || '').toLowerCase();

  if (rawType.includes('inquiry')) {
    category = 'INQUIRY';
    const payload = item.data?.payload as NotificationInquiryPayload | undefined;
    if (!link) {
      link = payload?.inquiry_id
        ? getMyPageShippingInquiryDetailPath(String(payload.inquiry_id))
        : getMyPageShippingInquiryPath();
    }
  } else if (rawType.includes('order') || rawType.includes('payment')) {
    category = 'ORDER';
    const payload = item.data?.payload as (NotificationOrderPayload & NotificationPaymentPayload) | undefined;
    const orderNumber = payload?.order_number || payload?.orderNumber;

    if (orderNumber) {
      link = getMyPageOrderDetailPath(String(orderNumber));
    } else if (!link) {
      link = getMyPageOrdersPath();
    }
  } else {
    category = 'SYSTEM';
  }

  return {
    id: String(item.id),
    category,
    title: item.data?.title || '알림',
    message: item.data?.message || '',
    createdAt: formatRelativeTime(item.created_at),
    isRead: Boolean(item.is_read),
    link,
    metadata: item.data?.payload,
  };
};
