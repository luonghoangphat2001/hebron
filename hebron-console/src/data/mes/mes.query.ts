import { useQuery } from '@tanstack/react-query';
import { getMesIntegrationStatusAPI, getMesLogDetailAPI, getMesLogListAPI } from './mes.api';
import type { MesLogListREQ } from './mes.request';
import type { PaginationRESP } from '@/utils/types/response.type';
import type { MesLogListRESP } from './mes.response';

export const MES_QUERY_KEYS = {
  LOG_LIST: 'MES_LOG_LIST',
  LOG_DETAIL: 'MES_LOG_DETAIL',
  STATUS: 'MES_STATUS',
};

export const useMesLogListQuery = (params: MesLogListREQ) =>
  useQuery({
    queryKey: [MES_QUERY_KEYS.LOG_LIST, params],
    queryFn: () => getMesLogListAPI(params),
    select: (resp: PaginationRESP<MesLogListRESP>) => ({
      list: resp.data.mes_integration_logs,
      pagination: resp.pagination,
    }),
  });

export const useMesLogDetailQuery = (id?: number | string) =>
  useQuery({
    queryKey: [MES_QUERY_KEYS.LOG_DETAIL, id],
    queryFn: () => getMesLogDetailAPI(id as number | string),
    select: (resp) => resp.data.mes_integration_log,
    enabled: !!id,
  });

export const useMesIntegrationStatusQuery = () =>
  useQuery({
    queryKey: [MES_QUERY_KEYS.STATUS],
    queryFn: () => getMesIntegrationStatusAPI(),
    select: (resp) => resp.data.dashboard,
  });
