import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { getAccessLogListAPI, getTaskLogListAPI } from './system.api';
import type { AccessLogListREQ, TaskLogListREQ } from './system.request';

export const SYSTEM_QUERY_KEYS = {
  ALL: ['system'] as const,
  TASK_LOG_LIST: (params?: TaskLogListREQ) => [...SYSTEM_QUERY_KEYS.ALL, 'task-logs', params] as const,
  ACCESS_LOG_LIST: (params?: AccessLogListREQ) => [...SYSTEM_QUERY_KEYS.ALL, 'access-logs', params] as const,
  EXPORT_PROGRESS: 'SYSTEM_TASK_LOG_EXPORT_PROGRESS',
};

export const useTaskLogListQuery = (params?: TaskLogListREQ) => {
  return useQuery({
    queryKey: SYSTEM_QUERY_KEYS.TASK_LOG_LIST(params),
    queryFn: () => getTaskLogListAPI(params),
    placeholderData: keepPreviousData,
  });
};

export const useAccessLogListQuery = (params?: AccessLogListREQ) => {
  return useQuery({
    queryKey: SYSTEM_QUERY_KEYS.ACCESS_LOG_LIST(params),
    queryFn: () => getAccessLogListAPI(params),
    placeholderData: keepPreviousData,
  });
};
