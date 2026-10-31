import type { BaseRESP, ErrorRESP } from '@/utils/types/response.type';
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationOptions,
  type UseQueryOptions,
} from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { notificationsAPI } from './notifications.api';
import type { NotificationListREQ } from './notifications.request';
import type { NotificationItemRESP, NotificationListRESP } from './notifications.response';

export const NOTIFICATION_QUERY_KEYS = {
  all: ['notifications'] as const,
  lists: () => [...NOTIFICATION_QUERY_KEYS.all, 'list'] as const,
  list: (params?: NotificationListREQ) => [...NOTIFICATION_QUERY_KEYS.lists(), params] as const,
};

export const useNotificationsQuery = (
  params?: NotificationListREQ,
  options?: Omit<UseQueryOptions<BaseRESP<NotificationListRESP>, AxiosError<ErrorRESP>>, 'queryKey' | 'queryFn'>,
) =>
  useQuery({
    queryKey: NOTIFICATION_QUERY_KEYS.list(params),
    queryFn: () => notificationsAPI.getList(params),
    placeholderData: keepPreviousData,
    ...options,
  });

export const useMarkNotificationAsReadMutation = (
  options?: UseMutationOptions<BaseRESP<NotificationItemRESP | null>, AxiosError<ErrorRESP>, string>,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: (id: string) => notificationsAPI.markAsRead(id),
    onSuccess: (...args) => {
      void queryClient.invalidateQueries({ queryKey: NOTIFICATION_QUERY_KEYS.all });
      options?.onSuccess?.(...args);
    },
  });
};

export const useMarkAllNotificationsAsReadMutation = (
  options?: UseMutationOptions<BaseRESP<null>, AxiosError<ErrorRESP>, void>,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: () => notificationsAPI.markAllAsRead(),
    onSuccess: (...args) => {
      void queryClient.invalidateQueries({ queryKey: NOTIFICATION_QUERY_KEYS.all });
      options?.onSuccess?.(...args);
    },
  });
};
