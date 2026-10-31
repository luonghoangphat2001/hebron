import { api } from '@/api';
import type { ExportExcelRESP } from '@/utils/types/export.type';
import type { BaseRESP, PaginationRESP } from '@/utils/types/response.type';
import type { InquiryExportExcelREQ, InquiryListREQ, InquiryReplyCreateREQ } from './inquiry.request';
import type {
  InquiryAuditLogListRESP,
  InquiryDetailRESP,
  InquiryListItemRESP,
  InquiryMemoListRESP,
  InquiryRelatedListRESP,
  InquiryReplyListRESP,
  InquiryTimelineListRESP,
} from './inquiry.response';

const END_POINT = {
  ROOT: '/admin/inquiries',
};

export const getInquiryListAPI = (params: InquiryListREQ): Promise<PaginationRESP<InquiryListItemRESP>> =>
  api.get(END_POINT.ROOT, { params });

export const getInquiryDetailAPI = (id: string): Promise<BaseRESP<InquiryDetailRESP>> => api.get(`${END_POINT.ROOT}/${id}`);

export const deleteInquiryAPI = (id: number) => api.delete(`${END_POINT.ROOT}/${id}`);

export const getInquiryReplyListAPI = (id: string): Promise<BaseRESP<InquiryReplyListRESP>> =>
  api.get(`${END_POINT.ROOT}/${id}/replies`);

export const createInquiryReplyAPI = (id: string, body: InquiryReplyCreateREQ) =>
  api.post(`${END_POINT.ROOT}/${id}/replies`, body);

export const updateInquiryReplyAPI = (inquiryId: string, replyId: string, body: InquiryReplyCreateREQ) =>
  api.put(`${END_POINT.ROOT}/${inquiryId}/replies/${replyId}`, body);

export const deleteInquiryReplyAPI = (inquiryId: string, replyId: string) =>
  api.delete(`${END_POINT.ROOT}/${inquiryId}/replies/${replyId}`);

export const getInquiryMemoListAPI = (id: string): Promise<BaseRESP<InquiryMemoListRESP>> =>
  api.get(`${END_POINT.ROOT}/${id}/memo`);

export const createInquiryMemoAPI = (inquiryId: string, body: { content: string }) =>
  api.post(`${END_POINT.ROOT}/${inquiryId}/memo`, body);

export const deleteInquiryMemoAPI = (inquiryId: string, memoId: string) =>
  api.delete(`${END_POINT.ROOT}/${inquiryId}/memos/${memoId}`);

export const getInquiryAuditLogListAPI = (id: string): Promise<BaseRESP<InquiryAuditLogListRESP>> =>
  api.get(`${END_POINT.ROOT}/${id}/audit-logs`);

export const getInquiryTimelineListAPI = (id: string): Promise<BaseRESP<InquiryTimelineListRESP>> =>
  api.get(`${END_POINT.ROOT}/${id}/timeline`);

export const getInquiryRelatedListAPI = (id: string): Promise<BaseRESP<InquiryRelatedListRESP>> =>
  api.get(`${END_POINT.ROOT}/${id}/related`);

export const assignInquiryAPI = (inquiryId: string, personInCharge: string) =>
  api.patch(`${END_POINT.ROOT}/${inquiryId}/assign`, {
    inquiry_id: Number(inquiryId),
    person_in_charge: personInCharge,
  });

export const exportInquiryExcelAPI = (body: InquiryExportExcelREQ): Promise<BaseRESP<ExportExcelRESP>> =>
  api.post(`${END_POINT.ROOT}/export-excel`, body);

export const getInquiryExportProgressAPI = (historyId: number): Promise<BaseRESP<ExportExcelRESP>> =>
  api.get(`${END_POINT.ROOT}/export-excel/${historyId}/check-progress-status`);

export const downloadInquiryExcelAPI = (historyId: number): Promise<Blob> =>
  api.get(`${END_POINT.ROOT}/export-excel/${historyId}/download`, { responseType: 'blob' });
