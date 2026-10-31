import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { calligraphyApi } from './calligraphy.api';
import type { CalligraphyListParams, CalligraphyType, CalligraphyWrite } from './calligraphy.types';

export const calligraphyKeys = {
  all: ['admin-calligraphies'] as const,
  list: (params: CalligraphyListParams) => [...calligraphyKeys.all, 'list', params] as const,
};

const invalidate = (client: ReturnType<typeof useQueryClient>) => client.invalidateQueries({ queryKey: calligraphyKeys.all });

export const useCalligraphiesQuery = (params: CalligraphyListParams) =>
  useQuery({ queryKey: calligraphyKeys.list(params), queryFn: () => calligraphyApi.list(params) });

export const useCalligraphyCreateMutation = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (payload: CalligraphyWrite) => calligraphyApi.create(payload),
    onSuccess: () => invalidate(client),
  });
};

export const useCalligraphyUpdateMutation = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Partial<CalligraphyWrite> }) => calligraphyApi.update(id, payload),
    onSuccess: () => invalidate(client),
  });
};

export const useCalligraphyBulkUpdateMutation = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ ids, value }: { ids: number[]; value: CalligraphyType }) => calligraphyApi.bulkUpdateType(ids, value),
    onSuccess: () => invalidate(client),
  });
};

export const useCalligraphyBulkDeleteMutation = () => {
  const client = useQueryClient();
  return useMutation({ mutationFn: (ids: number[]) => calligraphyApi.bulkDelete(ids), onSuccess: () => invalidate(client) });
};
