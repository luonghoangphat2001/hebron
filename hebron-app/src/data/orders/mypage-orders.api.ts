import { api } from '@/api';
import type { ExportExcelRESP } from '@/utils/types/export.type';
import type { BaseRESP, PaginationRESP } from '@/utils/types/response.type';
import type { MyPageOrderHistoryDetailRESP, MyPageOrderHistoryListRESP } from './mypage-orders.response';
import type { MyPageOrderHistoryListREQ, OrderListExportExcelREQ } from './orders.request';

const ENDPOINTS = {
  LIST: '/mypage-order-delivery-tracking/histories',
  DETAIL: (orderNumber: string) => `/mypage-order-delivery-tracking/histories/${orderNumber}`,
  DOWNLOAD_QUOTATION_PDF: (orderNumber: string) => `/mypage-order-delivery-tracking/histories/${orderNumber}/quotation/pdf`,
  DOWNLOAD_TRANSACTION_PDF: (orderNumber: string) =>
    `/mypage-order-delivery-tracking/histories/${orderNumber}/transaction-statement/pdf`,
  EXPORT_EXCEL: `/mypage-order-delivery-tracking/histories/export-excel`,
  CHECK_EXPORT_PROGRESS: (historyId: number) =>
    `/mypage-order-delivery-tracking/histories/export-excel/${historyId}/check-progress-status`,
} as const;

export const myPageOrdersAPI = {
  getList: (params?: MyPageOrderHistoryListREQ): Promise<PaginationRESP<MyPageOrderHistoryListRESP>> =>
    api.get(ENDPOINTS.LIST, { params }),
  getDetail: (orderNumber: string): Promise<BaseRESP<MyPageOrderHistoryDetailRESP>> => api.get(ENDPOINTS.DETAIL(orderNumber)),
  downloadQuotationPdf: (orderNumber: string): Promise<Blob> =>
    api.get(ENDPOINTS.DOWNLOAD_QUOTATION_PDF(orderNumber), { responseType: 'blob' }),
  downloadTransactionPdf: (orderNumber: string): Promise<Blob> =>
    api.get(ENDPOINTS.DOWNLOAD_TRANSACTION_PDF(orderNumber), { responseType: 'blob' }),

  exportExcel: (body: OrderListExportExcelREQ): Promise<BaseRESP<ExportExcelRESP>> => api.post(ENDPOINTS.EXPORT_EXCEL, body),
  checkExportProgress: (historyId: number): Promise<BaseRESP<ExportExcelRESP>> =>
    api.get(ENDPOINTS.CHECK_EXPORT_PROGRESS(historyId)),
};
