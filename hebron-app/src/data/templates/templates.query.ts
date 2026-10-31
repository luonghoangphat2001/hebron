import type { ErrorRESP, BaseRESP } from '@/utils/types/response.type';
import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { templatesAPI } from './templates.api';
import type { GetTemplatesREQ } from './templates.request';
import type { GetTemplateDetailRESP, GetTemplatesRESP } from './templates.response';

export const TEMPLATE_QUERY_KEYS = {
  all: ['templates'] as const,
  lists: () => [...TEMPLATE_QUERY_KEYS.all, 'list'] as const,
  list: (params?: GetTemplatesREQ) => [...TEMPLATE_QUERY_KEYS.lists(), params] as const,
  details: () => [...TEMPLATE_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: number) => [...TEMPLATE_QUERY_KEYS.details(), id] as const,
};

export const useTemplatesQuery = (
  params?: GetTemplatesREQ,
  options?: Omit<UseQueryOptions<BaseRESP<GetTemplatesRESP>, AxiosError<ErrorRESP>>, 'queryKey' | 'queryFn'>,
) =>
  useQuery({
    queryKey: TEMPLATE_QUERY_KEYS.list(params),
    queryFn: () => templatesAPI.getList(params),
    ...options,
  });

export const useTemplateDetailQuery = (
  id: number,
  options?: Omit<UseQueryOptions<BaseRESP<GetTemplateDetailRESP>, AxiosError<ErrorRESP>>, 'queryKey' | 'queryFn'>,
) =>
  useQuery({
    queryKey: TEMPLATE_QUERY_KEYS.detail(id),
    queryFn: () => templatesAPI.getDetail(id),
    enabled: Boolean(id),
    ...options,
  });
