import type { BaseRESP, ErrorRESP } from '@/utils/types/response.type';
import { useMutation, useQuery, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import {
  copyPermissionAPI,
  createPermissionAPI,
  deletePermissionAPI,
  downloadPermissionExportAPI,
  exportPermissionExcelAPI,
  getPermissionDetailAPI,
  getPermissionExportProgressAPI,
  getPermissionListAPI,
  getPermissionMenuStructureAPI,
  updatePermissionAPI,
  updatePermissionSettingsAPI,
} from './permission.api';
import type {
  PermissionCopyREQ,
  PermissionCreateREQ,
  PermissionExportExcelREQ,
  PermissionListREQ,
  PermissionSettignREQ,
  PermissionUpdateREQ,
} from './permission.request';
import type { PermissionDetailRESP } from './permission.response';

export const PERMISSION_QUERY_KEYS = {
  LIST: 'PERMISSION_LIST',
  DETAIL: 'PERMISSION_DETAIL',
  MENU_STRUCTURE: 'PERMISSION_MENU_STRUCTURE',
  EXPORT_PROGRESS: 'PERMISSION_EXPORT_PROGRESS',
};

export const usePermissionListQuery = (params: PermissionListREQ) =>
  useQuery({
    queryKey: [PERMISSION_QUERY_KEYS.LIST, params],
    queryFn: () => getPermissionListAPI(params),
    select: (resp) => ({ list: resp.data.permissions, pagination: resp.pagination }),
  });

export const usePermissionDetailQuery = (id?: number) =>
  useQuery({
    queryKey: [PERMISSION_QUERY_KEYS.DETAIL, id],
    queryFn: () => getPermissionDetailAPI(id as number),
    select: (resp) => resp.data.permission,
    enabled: !!id,
  });

export const usePermissionMenuStructureQuery = (id?: number) =>
  useQuery({
    queryKey: [PERMISSION_QUERY_KEYS.MENU_STRUCTURE, id],
    queryFn: () => getPermissionMenuStructureAPI(id as number),
    select: (resp) => resp.data,
    enabled: !!id,
  });

export const usePermissionCreateMutation = (
  option?: UseMutationOptions<BaseRESP<PermissionDetailRESP>, AxiosError<ErrorRESP>, PermissionCreateREQ>,
) => {
  const queryClient = useQueryClient();

  return useMutation<BaseRESP<PermissionDetailRESP>, AxiosError<ErrorRESP>, PermissionCreateREQ>({
    ...option,
    mutationFn: createPermissionAPI,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: [PERMISSION_QUERY_KEYS.LIST] });
      option?.onSuccess?.(...args);
    },
  });
};

export const usePermissionUpdateMutation = (
  option?: UseMutationOptions<BaseRESP<PermissionDetailRESP>, AxiosError<ErrorRESP>, PermissionUpdateREQ>,
) => {
  const queryClient = useQueryClient();

  return useMutation<BaseRESP<PermissionDetailRESP>, AxiosError<ErrorRESP>, PermissionUpdateREQ>({
    ...option,
    mutationFn: updatePermissionAPI,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: [PERMISSION_QUERY_KEYS.LIST] });
      queryClient.invalidateQueries({ queryKey: [PERMISSION_QUERY_KEYS.DETAIL, args[1].id] });
      option?.onSuccess?.(...args);
    },
  });
};

export const usePermissionDeleteMutation = (option?: UseMutationOptions<BaseRESP<null>, AxiosError<ErrorRESP>, number>) => {
  const queryClient = useQueryClient();

  return useMutation<BaseRESP<null>, AxiosError<ErrorRESP>, number>({
    ...option,
    mutationFn: deletePermissionAPI,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: [PERMISSION_QUERY_KEYS.LIST] });
      option?.onSuccess?.(...args);
    },
  });
};

export const usePermissionCopyMutation = (
  option?: UseMutationOptions<BaseRESP<PermissionDetailRESP>, AxiosError<ErrorRESP>, PermissionCopyREQ>,
) => {
  const queryClient = useQueryClient();

  return useMutation<BaseRESP<PermissionDetailRESP>, AxiosError<ErrorRESP>, PermissionCopyREQ>({
    ...option,
    mutationFn: copyPermissionAPI,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: [PERMISSION_QUERY_KEYS.LIST] });
      option?.onSuccess?.(...args);
    },
  });
};

export const usePermissionSettingsUpdateMutation = (
  option?: UseMutationOptions<BaseRESP<PermissionDetailRESP>, AxiosError<ErrorRESP>, PermissionSettignREQ>,
) => {
  const queryClient = useQueryClient();

  return useMutation<BaseRESP<PermissionDetailRESP>, AxiosError<ErrorRESP>, PermissionSettignREQ>({
    ...option,
    mutationFn: updatePermissionSettingsAPI,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: [PERMISSION_QUERY_KEYS.DETAIL, args[1].id] });
      option?.onSuccess?.(...args);
    },
  });
};

export const usePermissionExportExcelMutation = (
  option?: UseMutationOptions<any, AxiosError<ErrorRESP>, PermissionExportExcelREQ>,
) =>
  useMutation<any, AxiosError<ErrorRESP>, PermissionExportExcelREQ>({
    mutationFn: exportPermissionExcelAPI,
    ...option,
  });

export const usePermissionExportProgressQuery = (historyId?: number) =>
  useQuery({
    queryKey: [PERMISSION_QUERY_KEYS.EXPORT_PROGRESS, historyId],
    queryFn: () => getPermissionExportProgressAPI(historyId as number),
    enabled: !!historyId,
  });

export const usePermissionExportDownloadMutation = (option?: UseMutationOptions<Blob, AxiosError<ErrorRESP>, number>) =>
  useMutation<Blob, AxiosError<ErrorRESP>, number>({
    mutationFn: downloadPermissionExportAPI,
    ...option,
  });
