import { api } from '@/api';
import type { ExportExcelRESP } from '@/utils/types/export.type';
import type { BaseRESP, PaginationRESP } from '@/utils/types/response.type';
import type {
  PaymentExportExcelREQ,
  PaymentListREQ,
  PaymentRefundREQ,
  PaymentStatusUpdateREQ,
  SettlementExportExcelREQ,
  SettlementReportListREQ,
} from './payment.request';
import type {
  PaymentDataRESP,
  PaymentDetailDataRESP,
  PaymentReceiptRESP,
  PaymentRefundRESP,
  SettlementReportDataRESP,
} from './payment.response';

const ENDPOINT = {
  ROOT: '/admin/payments',
  SETTLEMENT: '/admin/settlement-report',
};

export const getPaymentListAPI = (params: PaymentListREQ): Promise<PaginationRESP<PaymentDataRESP>> =>
  api.get(ENDPOINT.ROOT, { params });

export const getPaymentDetailAPI = (transactionId: string): Promise<BaseRESP<PaymentDetailDataRESP>> =>
  api.get(`${ENDPOINT.ROOT}/${transactionId}`);

export const getPaymentReceiptAPI = (transactionId: string): Promise<BaseRESP<PaymentReceiptRESP>> =>
  api.get(`${ENDPOINT.ROOT}/${transactionId}/receipt`);

export const refundPaymentAPI = ({ transactionId, ...body }: PaymentRefundREQ): Promise<BaseRESP<PaymentRefundRESP>> =>
  api.post(`${ENDPOINT.ROOT}/${transactionId}/refund`, body);

export const updatePaymentStatusAPI = ({
  transactionId,
  ...body
}: PaymentStatusUpdateREQ): Promise<BaseRESP<PaymentDetailDataRESP>> => api.put(`${ENDPOINT.ROOT}/${transactionId}/status`, body);

export const exportPaymentExcelAPI = (body: PaymentExportExcelREQ): Promise<BaseRESP<ExportExcelRESP>> =>
  api.post(`${ENDPOINT.ROOT}/export-excel`, body);

export const getPaymentExportProgressAPI = (historyId: number): Promise<BaseRESP<ExportExcelRESP>> =>
  api.get(`${ENDPOINT.ROOT}/export-excel/${historyId}/check-progress-status`);

export const downloadPaymentExportAPI = (historyId: number): Promise<Blob> =>
  api.get(`${ENDPOINT.ROOT}/export-excel/${historyId}/download`, { responseType: 'blob' });

export const getSettlementReportListAPI = (params: SettlementReportListREQ): Promise<PaginationRESP<SettlementReportDataRESP>> =>
  api.get(ENDPOINT.SETTLEMENT, { params });

export const exportSettlementExcelAPI = (body: SettlementExportExcelREQ): Promise<BaseRESP<ExportExcelRESP>> =>
  api.post(`${ENDPOINT.SETTLEMENT}/export-excel`, body);

export const getSettlementExportProgressAPI = (historyId: number): Promise<BaseRESP<ExportExcelRESP>> =>
  api.get(`${ENDPOINT.SETTLEMENT}/export-excel/${historyId}/check-progress-status`);

export const downloadSettlementExportAPI = (historyId: number): Promise<Blob> =>
  api.get(`${ENDPOINT.SETTLEMENT}/export-excel/${historyId}/download`, { responseType: 'blob' });
