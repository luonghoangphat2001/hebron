import type { BaseRESP, ErrorRESP, PaginationRESP } from '@/utils/types/response.type';
import { keepPreviousData, useQuery, type UseQueryOptions } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { noticesAPI } from './notices.api';
import type { NoticeListREQ } from './notices.request';
import type { NoticeDetailRESP, NoticeListRESP } from './notices.response';

export const NOTICE_QUERY_KEYS = {
  all: ['notices'] as const,
  lists: () => [...NOTICE_QUERY_KEYS.all, 'list'] as const,
  list: (params?: NoticeListREQ) => [...NOTICE_QUERY_KEYS.lists(), params] as const,
  details: () => [...NOTICE_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: number | string) => [...NOTICE_QUERY_KEYS.details(), id] as const,
};

export const useNoticesQuery = (
  params?: NoticeListREQ,
  options?: Omit<UseQueryOptions<PaginationRESP<NoticeListRESP>, AxiosError<ErrorRESP>>, 'queryKey' | 'queryFn'>,
) =>
  useQuery({
    queryKey: NOTICE_QUERY_KEYS.list(params),
    queryFn: () => noticesAPI.getList(params),
    placeholderData: keepPreviousData,
    ...options,
  });

export const useNoticeDetailQuery = (
  id: number | string,
  options?: Omit<UseQueryOptions<BaseRESP<NoticeDetailRESP>, AxiosError<ErrorRESP>>, 'queryKey' | 'queryFn'>,
) =>
  useQuery({
    queryKey: NOTICE_QUERY_KEYS.detail(id),
    queryFn: () => noticesAPI.getDetail(id),
    enabled: Boolean(id),
    ...options,
  });
