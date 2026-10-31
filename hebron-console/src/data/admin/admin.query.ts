import type { ErrorRESP } from '@/utils/types/response.type';
import { useMutation, useQuery, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { adminAPI } from './admin.api';
import type { AdminChangePasswordREQ, AdminCreateREQ, AdminListREQ, AdminUpdateREQ } from './admin.request';

export const ADMIN_QUERY_KEYS = {
  LIST: 'ADMIN_LIST',
  DETAIL: 'ADMIN_DETAIL',
  ME_PERMISSIONS: 'ADMIN_ME_PERMISSIONS',
};

export const useMyPermissionsQuery = () =>
  useQuery({
    queryKey: [ADMIN_QUERY_KEYS.ME_PERMISSIONS],
    queryFn: adminAPI.myPermissions,
    select: (resp) => resp.data,
    staleTime: Infinity,
  });

export const useAdminListQuery = (params?: AdminListREQ) =>
  useQuery({
    queryKey: [ADMIN_QUERY_KEYS.LIST, params],
    queryFn: () => adminAPI.list(params),
    select: (resp) => ({
      list: resp.data.users,
      pagination: resp.pagination,
    }),
  });

export const useAdminDetailQuery = (adminId?: number) =>
  useQuery({
    queryKey: [ADMIN_QUERY_KEYS.DETAIL, adminId],
    queryFn: () => adminAPI.detail(adminId as number),
    select: (resp) => resp.data.user,
    enabled: !!adminId,
  });

export const useAdminCreateMutation = (options?: UseMutationOptions<any, AxiosError<ErrorRESP>, AdminCreateREQ>) => {
  const queryClient = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: adminAPI.create,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: [ADMIN_QUERY_KEYS.LIST] });
      options?.onSuccess?.(...args);
    },
  });
};

export const useAdminUpdateMutation = (options?: UseMutationOptions<any, AxiosError<ErrorRESP>, AdminUpdateREQ>) => {
  const queryClient = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: adminAPI.update,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: [ADMIN_QUERY_KEYS.LIST] });
      queryClient.invalidateQueries({ queryKey: [ADMIN_QUERY_KEYS.DETAIL] });
      options?.onSuccess?.(...args);
    },
  });
};

export const useAdminChangePasswordMutation = (
  options?: UseMutationOptions<any, AxiosError<ErrorRESP>, AdminChangePasswordREQ>,
) => {
  return useMutation({
    mutationFn: adminAPI.changePassword,
    ...options,
  });
};

export const useAdminDeleteMutation = (options?: UseMutationOptions<any, AxiosError<ErrorRESP>, number>) => {
  const queryClient = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: adminAPI.delete,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: [ADMIN_QUERY_KEYS.LIST] });
      options?.onSuccess?.(...args);
    },
  });
};
