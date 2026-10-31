import { appToast } from '@/components/toast/AppToast';
import {
  NOTIFICATION_QUERY_KEYS,
  useMarkAllNotificationsAsReadMutation,
  useMarkNotificationAsReadMutation,
  useNotificationsQuery,
} from '@/data/notifications/notifications.query';
import type { NotificationListREQ } from '@/data/notifications/notifications.request';
import { mapNotificationItemRESPToItem } from '@/data/notifications/notifications.service';
import { useWebSocket } from '@/hooks/useWebSocket';
import { readToken, readUserInfo } from '@/utils/helper/local-storagte.helper';
import type { NotificationCategory, NotificationItem } from '@/utils/types/notification.type';
import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

export type UseNotificationOptions<T extends NotificationItem = NotificationItem> = {
  initialNotifications?: T[];
  params?: NotificationListREQ;
  enabled?: boolean;
  enableRealtime?: boolean;
  channelName?: string;
  isPrivate?: boolean;
  showToastOnReceive?: boolean;
  onNotificationReceive?: (item: NotificationItem) => void;
};

const formatIncomingNotification = (raw: any): NotificationItem => {
  const data = raw?.data || raw;

  return {
    id: String(raw?.id || `noti-${Date.now()}`),
    category: (data?.category || 'SYSTEM').toUpperCase() as NotificationCategory,
    title: String(data?.title || '알림'),
    message: String(data?.message || ''),
    createdAt: '방금 전',
    isRead: false,
    link: data?.link,
    metadata: data?.payload,
  };
};

export const useNotification = <T extends NotificationItem = NotificationItem>(options?: UseNotificationOptions<T>) => {
  const {
    initialNotifications,
    params,
    enabled = true,
    enableRealtime = true,
    channelName,
    isPrivate = true,
    showToastOnReceive = true,
    onNotificationReceive,
  } = options || {};

  const queryClient = useQueryClient();
  const token = readToken();
  const userInfo = readUserInfo();

  const channel = channelName || (userInfo?.id ? `member.notifications.${userInfo.id}` : undefined);

  const {
    data: queryData,
    isLoading,
    isFetching,
    refetch,
  } = useNotificationsQuery(params, {
    enabled: enabled && Boolean(token),
  });

  const markAsReadMutation = useMarkNotificationAsReadMutation();
  const markAllAsReadMutation = useMarkAllNotificationsAsReadMutation();

  const [realtimeList, setRealtimeList] = useState<T[]>([]);

  const serverNotifications = useMemo(() => {
    const list = queryData?.data?.notifications;
    return list ? (list.map(mapNotificationItemRESPToItem) as unknown as T[]) : (initialNotifications ?? []);
  }, [queryData?.data?.notifications, initialNotifications]);

  const notifications = useMemo(() => {
    const serverIds = new Set(serverNotifications.map((n) => n.id));
    return [...realtimeList.filter((n) => !serverIds.has(n.id)), ...serverNotifications];
  }, [realtimeList, serverNotifications]);

  const unreadCount = queryData?.data?.unread_count ?? 0;

  const addNotification = useCallback((newNotification: T) => {
    setRealtimeList((prev) => [newNotification, ...prev]);
  }, []);

  const markAsRead = useCallback(
    async (id: string) => {
      setRealtimeList((prev) => prev.map((item) => (item.id === id ? { ...item, isRead: true } : item)));
      try {
        await markAsReadMutation.mutateAsync(id);
      } catch (error) {
        console.error('Failed to mark notification as read:', error);
      }
    },
    [markAsReadMutation],
  );

  const markAllAsRead = useCallback(() => {
    setRealtimeList((prev) => prev.map((item) => ({ ...item, isRead: true })));
    markAllAsReadMutation.mutate();
  }, [markAllAsReadMutation]);

  const toggleReadStatus = useCallback(
    (id: string) => {
      const target = notifications.find((item) => item.id === id);
      if (target && !target.isRead) {
        void markAsRead(id);
      }
    },
    [notifications, markAsRead],
  );

  const { status, isConnected, socketId, listenNotification, listenToAll } = useWebSocket({
    channel,
    isPrivate,
    autoConnect: enableRealtime && Boolean(channel),
  });

  const onReceiveRef = useRef(onNotificationReceive);
  useEffect(() => {
    onReceiveRef.current = onNotificationReceive;
  }, [onNotificationReceive]);

  const handleIncomingNotification = useCallback(
    (raw: any) => {
      const formatted = formatIncomingNotification(raw);
      addNotification(formatted as unknown as T);
      onReceiveRef.current?.(formatted);

      if (showToastOnReceive) {
        appToast.info(formatted.title, {
          description: formatted.message,
          action: formatted.link
            ? {
                label: '확인',
                onClick: async () => {
                  await markAsRead(formatted.id);
                  if (window.location.pathname === formatted.link) {
                    window.location.reload();
                  } else {
                    window.location.href = formatted.link!;
                  }
                },
              }
            : undefined,
        });
      }

      void queryClient.invalidateQueries({ queryKey: NOTIFICATION_QUERY_KEYS.all });
    },
    [addNotification, showToastOnReceive, queryClient, markAsRead],
  );

  const handleIncomingRef = useRef(handleIncomingNotification);
  useEffect(() => {
    handleIncomingRef.current = handleIncomingNotification;
  }, [handleIncomingNotification]);

  useEffect(() => {
    if (!enableRealtime || !channel) return;

    const unlistenNotification = listenNotification(
      (data) => {
        handleIncomingRef.current(data);
      },
      channel,
      isPrivate,
    );

    const unlistenAll = listenToAll(
      (_, data) => {
        handleIncomingRef.current(data);
      },
      channel,
      isPrivate,
    );

    return () => {
      unlistenNotification();
      unlistenAll();
    };
  }, [enableRealtime, channel, isPrivate, listenNotification, listenToAll]);

  return {
    notifications,
    unreadCount,
    isLoading,
    isFetching,
    refetch,
    setNotifications: setRealtimeList,
    addNotification,
    markAsRead,
    markAllAsRead,
    toggleReadStatus,
    isRealtimeConnected: isConnected,
    connectionStatus: status,
    socketId,
    targetChannel: channel,
  };
};
