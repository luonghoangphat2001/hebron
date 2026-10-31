import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { backgroundApi } from './background.api';
import type { BackgroundListParams, BackgroundWrite } from './background.types';

export const backgroundKeys = {
  all: ['admin-backgrounds'] as const,
  list: (params: BackgroundListParams) => [...backgroundKeys.all, 'list', params] as const,
};

const invalidate = (client: ReturnType<typeof useQueryClient>) => client.invalidateQueries({ queryKey: backgroundKeys.all });

export const useBackgroundsQuery = (params: BackgroundListParams) =>
  useQuery({ queryKey: backgroundKeys.list(params), queryFn: () => backgroundApi.list(params) });

export const useBackgroundCreateMutation = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (payload: BackgroundWrite) => backgroundApi.create(payload),
    onSuccess: () => invalidate(client),
  });
};

export const useBackgroundBulkDeleteMutation = () => {
  const client = useQueryClient();
  return useMutation({ mutationFn: (ids: number[]) => backgroundApi.bulkDelete(ids), onSuccess: () => invalidate(client) });
};
