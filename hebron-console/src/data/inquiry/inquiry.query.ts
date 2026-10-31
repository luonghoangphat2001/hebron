import { useMutation, useQuery, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import {
  assignInquiryAPI,
  createInquiryMemoAPI,
  createInquiryReplyAPI,
  deleteInquiryAPI,
  deleteInquiryMemoAPI,
  deleteInquiryReplyAPI,
  getInquiryAuditLogListAPI,
  getInquiryDetailAPI,
  getInquiryListAPI,
  getInquiryMemoListAPI,
  getInquiryRelatedListAPI,
  getInquiryReplyListAPI,
  getInquiryTimelineListAPI,
  updateInquiryReplyAPI,
} from './inquiry.api';
import type { ErrorRESP } from '@/utils/types/response.type';
import type { InquiryListREQ, InquiryReplyCreateREQ } from './inquiry.request';

export const INQUIRY_QUERY_KEYS = {
  LIST: 'INQUIRY_LIST',
  DETAIL: 'INQUIRY_DETAIL',
  REPLIES: 'INQUIRY_REPLIES',
  MEMOS: 'INQUIRY_MEMOS',
  AUDIT_LOGS: 'INQUIRY_AUDIT_LOGS',
  TIMELINE: 'INQUIRY_TIMELINE',
  RELATED: 'INQUIRY_RELATED',
  EXPORT_PROGRESS: 'INQUIRY_EXPORT_PROGRESS',
};

export const useInquiryListQuery = (params: InquiryListREQ) =>
  useQuery({
    queryKey: [INQUIRY_QUERY_KEYS.LIST, params],
    queryFn: () => getInquiryListAPI(params),
  });

export const useInquiryDetailQuery = (id: string) =>
  useQuery({
    queryKey: [INQUIRY_QUERY_KEYS.DETAIL, id],
    queryFn: () => getInquiryDetailAPI(id),
    select: (resp) => resp.data.inquiry,
    enabled: !!id,
  });

export const useInquiryReplyListQuery = (id: string) =>
  useQuery({
    queryKey: [INQUIRY_QUERY_KEYS.REPLIES, id],
    queryFn: () => getInquiryReplyListAPI(id),
    select: (resp) => resp.data.replies,
    enabled: !!id,
  });

export const useInquiryMemoListQuery = (id: string) =>
  useQuery({
    queryKey: [INQUIRY_QUERY_KEYS.MEMOS, id],
    queryFn: () => getInquiryMemoListAPI(id),
    select: (resp) => resp.data.memos,
    enabled: !!id,
  });

export const useInquiryAuditLogListQuery = (id: string) =>
  useQuery({
    queryKey: [INQUIRY_QUERY_KEYS.AUDIT_LOGS, id],
    queryFn: () => getInquiryAuditLogListAPI(id),
    select: (resp) => resp.data.audit_logs,
    enabled: !!id,
  });

export const useInquiryTimelineListQuery = (id: string) =>
  useQuery({
    queryKey: [INQUIRY_QUERY_KEYS.TIMELINE, id],
    queryFn: () => getInquiryTimelineListAPI(id),
    select: (resp) => resp.data.timeline,
    enabled: !!id,
  });

export const useInquiryRelatedListQuery = (id: string) =>
  useQuery({
    queryKey: [INQUIRY_QUERY_KEYS.RELATED, id],
    queryFn: () => getInquiryRelatedListAPI(id),
    select: (resp) => resp.data.related_inquiries,
    enabled: !!id,
  });

export const useInquiryDeleteMutation = (option?: UseMutationOptions<any, AxiosError<ErrorRESP>, number>) => {
  const queryClient = useQueryClient();

  return useMutation({
    ...option,
    mutationFn: deleteInquiryAPI,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: [INQUIRY_QUERY_KEYS.LIST] });
      option?.onSuccess?.(...args);
    },
  });
};

export type InquiryReplyCreateVariables = {
  id: string;
  body: InquiryReplyCreateREQ;
};

export const useInquiryReplyCreateMutation = (option?: UseMutationOptions<any, AxiosError, InquiryReplyCreateVariables>) => {
  const queryClient = useQueryClient();

  return useMutation({
    ...option,
    mutationFn: ({ id, body }) => createInquiryReplyAPI(id, body),
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: [INQUIRY_QUERY_KEYS.LIST] });
      queryClient.invalidateQueries({ queryKey: [INQUIRY_QUERY_KEYS.DETAIL] });
      queryClient.invalidateQueries({ queryKey: [INQUIRY_QUERY_KEYS.REPLIES] });
      queryClient.invalidateQueries({ queryKey: [INQUIRY_QUERY_KEYS.TIMELINE] });
      queryClient.invalidateQueries({ queryKey: [INQUIRY_QUERY_KEYS.AUDIT_LOGS] });
      option?.onSuccess?.(...args);
    },
  });
};

export type InquiryReplyUpdateVariables = {
  inquiryId: string;
  replyId: string;
  body: InquiryReplyCreateREQ;
};

export const useInquiryReplyUpdateMutation = (option?: UseMutationOptions<any, AxiosError, InquiryReplyUpdateVariables>) => {
  const queryClient = useQueryClient();

  return useMutation({
    ...option,
    mutationFn: ({ inquiryId, replyId, body }) => updateInquiryReplyAPI(inquiryId, replyId, body),
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: [INQUIRY_QUERY_KEYS.LIST] });
      queryClient.invalidateQueries({ queryKey: [INQUIRY_QUERY_KEYS.DETAIL] });
      queryClient.invalidateQueries({ queryKey: [INQUIRY_QUERY_KEYS.REPLIES] });
      queryClient.invalidateQueries({ queryKey: [INQUIRY_QUERY_KEYS.TIMELINE] });
      queryClient.invalidateQueries({ queryKey: [INQUIRY_QUERY_KEYS.AUDIT_LOGS] });
      option?.onSuccess?.(...args);
    },
  });
};

export type InquiryReplyDeleteVariables = {
  inquiryId: string;
  replyId: string;
};

export const useInquiryReplyDeleteMutation = (option?: UseMutationOptions<any, AxiosError, InquiryReplyDeleteVariables>) => {
  const queryClient = useQueryClient();

  return useMutation({
    ...option,
    mutationFn: ({ inquiryId, replyId }) => deleteInquiryReplyAPI(inquiryId, replyId),
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: [INQUIRY_QUERY_KEYS.LIST] });
      queryClient.invalidateQueries({ queryKey: [INQUIRY_QUERY_KEYS.DETAIL] });
      queryClient.invalidateQueries({ queryKey: [INQUIRY_QUERY_KEYS.REPLIES] });
      queryClient.invalidateQueries({ queryKey: [INQUIRY_QUERY_KEYS.TIMELINE] });
      queryClient.invalidateQueries({ queryKey: [INQUIRY_QUERY_KEYS.AUDIT_LOGS] });
      option?.onSuccess?.(...args);
    },
  });
};

export type InquiryMemoCreateVariables = {
  inquiryId: string;
  body: { content: string };
};

export const useInquiryMemoCreateMutation = (option?: UseMutationOptions<any, AxiosError, InquiryMemoCreateVariables>) => {
  const queryClient = useQueryClient();

  return useMutation({
    ...option,
    mutationFn: ({ inquiryId, body }) => createInquiryMemoAPI(inquiryId, body),
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: [INQUIRY_QUERY_KEYS.MEMOS] });
      queryClient.invalidateQueries({ queryKey: [INQUIRY_QUERY_KEYS.DETAIL] });
      queryClient.invalidateQueries({ queryKey: [INQUIRY_QUERY_KEYS.TIMELINE] });
      queryClient.invalidateQueries({ queryKey: [INQUIRY_QUERY_KEYS.AUDIT_LOGS] });
      option?.onSuccess?.(...args);
    },
  });
};

export type InquiryMemoDeleteVariables = {
  inquiryId: string;
  memoId: string;
};

export const useInquiryMemoDeleteMutation = (option?: UseMutationOptions<any, AxiosError, InquiryMemoDeleteVariables>) => {
  const queryClient = useQueryClient();

  return useMutation({
    ...option,
    mutationFn: ({ inquiryId, memoId }) => deleteInquiryMemoAPI(inquiryId, memoId),
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: [INQUIRY_QUERY_KEYS.MEMOS] });
      queryClient.invalidateQueries({ queryKey: [INQUIRY_QUERY_KEYS.DETAIL] });
      queryClient.invalidateQueries({ queryKey: [INQUIRY_QUERY_KEYS.TIMELINE] });
      queryClient.invalidateQueries({ queryKey: [INQUIRY_QUERY_KEYS.AUDIT_LOGS] });
      option?.onSuccess?.(...args);
    },
  });
};

export type InquiryAssignVariables = {
  inquiryId: string;
  personInCharge: string;
};

export const useInquiryAssignMutation = (option?: UseMutationOptions<any, AxiosError, InquiryAssignVariables>) => {
  const queryClient = useQueryClient();

  return useMutation({
    ...option,
    mutationFn: ({ inquiryId, personInCharge }) => assignInquiryAPI(inquiryId, personInCharge),
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: [INQUIRY_QUERY_KEYS.LIST] });
      queryClient.invalidateQueries({ queryKey: [INQUIRY_QUERY_KEYS.DETAIL] });
      queryClient.invalidateQueries({ queryKey: [INQUIRY_QUERY_KEYS.TIMELINE] });
      queryClient.invalidateQueries({ queryKey: [INQUIRY_QUERY_KEYS.AUDIT_LOGS] });
      option?.onSuccess?.(...args);
    },
  });
};
