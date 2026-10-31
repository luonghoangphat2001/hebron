import type { BaseRESP } from '@/utils/types/response.type';
import { useMutation, useQuery, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import {
  createMemberAPI,
  getMemberActivityLogsAPI,
  getMemberDetailAPI,
  getMemberListAPI,
  getMemberExportProgressAPI,
  getMemberPermissionsAPI,
  updateMemberAPI,
  updateMemberPasswordAPI,
} from './member.api';
import type {
  MemberActivityLogsREQ,
  MemberBasicInfoUpdateREQ,
  MemberCreateREQ,
  MemberListREQ,
  MemberPasswordUpdateREQ,
} from './member.request';
import type { MemberCreatedDataRESP } from './member.respsonse';

export const MEMBER_QUERY_KEYS = {
  LIST: 'MEMBER_LIST',
  DETAIL: 'MEMBER_DETAIL',
  PERMISSIONS: 'MEMBER_PERMISSIONS',
  ACTIVITY_LOGS: 'MEMBER_ACTIVITY_LOGS',
  EXPORT_PROGRESS: 'MEMBER_EXPORT_PROGRESS',
};

export const useMemberListQuery = (params: MemberListREQ) =>
  useQuery({
    queryKey: [MEMBER_QUERY_KEYS.LIST, params],
    queryFn: () => getMemberListAPI(params),
  });

export const useMemberDetailQuery = (id?: number) =>
  useQuery({
    queryKey: [MEMBER_QUERY_KEYS.DETAIL, id],
    queryFn: () => getMemberDetailAPI(id as number),
    select: (resp) => resp.data,
    enabled: !!id,
  });

export const useMemberPermissionsQuery = (id?: number) =>
  useQuery({
    queryKey: [MEMBER_QUERY_KEYS.PERMISSIONS, id],
    queryFn: () => getMemberPermissionsAPI(id as number),
    select: (resp) => resp.data,
    enabled: !!id,
  });

export const useMemberActivityLogsQuery = (id?: number, params?: MemberActivityLogsREQ) =>
  useQuery({
    queryKey: [MEMBER_QUERY_KEYS.ACTIVITY_LOGS, id, params],
    queryFn: () => getMemberActivityLogsAPI(id as number, params),
    select: (resp) => resp.data,
    enabled: !!id,
  });

export const useMemberExportProgressQuery = (historyId?: number) =>
  useQuery({
    queryKey: [MEMBER_QUERY_KEYS.EXPORT_PROGRESS, historyId],
    queryFn: () => getMemberExportProgressAPI(historyId as number),
    enabled: !!historyId,
  });

export const useMemberCreateMutation = (
  option?: UseMutationOptions<BaseRESP<MemberCreatedDataRESP>, AxiosError, MemberCreateREQ>,
) => {
  const queryClient = useQueryClient();

  return useMutation<BaseRESP<MemberCreatedDataRESP>, AxiosError, MemberCreateREQ>({
    ...option,
    mutationFn: createMemberAPI,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: [MEMBER_QUERY_KEYS.LIST] });
      option?.onSuccess?.(...args);
    },
  });
};

export const useMemberBasicInfoUpdateMutation = (option?: UseMutationOptions<any, AxiosError, MemberBasicInfoUpdateREQ>) => {
  const queryClient = useQueryClient();

  return useMutation<any, AxiosError, MemberBasicInfoUpdateREQ>({
    ...option,
    mutationFn: updateMemberAPI,
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: [MEMBER_QUERY_KEYS.LIST] });
      if (vars.member_id) {
        queryClient.invalidateQueries({ queryKey: [MEMBER_QUERY_KEYS.DETAIL, vars.member_id] });
      }
    },
  });
};

export const useMemberPasswordUpdateMutation = (option?: UseMutationOptions<any, AxiosError, MemberPasswordUpdateREQ>) => {
  const queryClient = useQueryClient();

  return useMutation<any, AxiosError, MemberPasswordUpdateREQ>({
    ...option,
    mutationFn: updateMemberPasswordAPI,
    onSuccess: (_, vars) => {
      if (vars.member_id) {
        queryClient.invalidateQueries({ queryKey: [MEMBER_QUERY_KEYS.DETAIL, vars.member_id] });
      }
    },
  });
};

export const useMemberMaliciousUpdateMutation = (option?: UseMutationOptions<unknown, AxiosError, any>) =>
  useMutation({ mutationFn: async () => {}, ...option });

export const useMemberSpamReportMutation = (option?: UseMutationOptions<unknown, AxiosError, any>) =>
  useMutation({ mutationFn: async () => {}, ...option });
