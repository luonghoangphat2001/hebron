import { api } from '@/api';
import type { ExportExcelRESP } from '@/utils/types/export.type';
import type { BaseRESP, PaginationRESP } from '@/utils/types/response.type';
import type {
  BatchWorkInstructionPrintREQ,
  OrderBasicInfoUpdateREQ,
  OrderDesignRevisionREQ,
  OrderDraftStatusUpdateREQ,
  OrderExportExcelREQ,
  OrderListREQ,
  OrderStatusUpdateREQ,
  UploadOrderDraftFileREQ,
} from './order.request';
import type {
  OrderDataRESP,
  OrderDesignFilesDataRESP,
  OrderDetailDataRESP,
  OrderPrintPdfManifestRESP,
  OrderStatusHistoryDataRESP,
  UploadOrderDraftFileDataRESP,
  WorkInstructionPrintRESP,
} from './order.response';

const END_POINT = {
  ROOT: '/admin/orders',
  DESIGN_REVISIONS: (orderNumber: string) => `/admin/orders/${orderNumber}/design-revisions`,
  PRINT_PDF: (orderNumber: string) => `/admin/orders/${encodeURIComponent(orderNumber)}/print-pdf`,
};

export const getOrderListAPI = (params: OrderListREQ): Promise<PaginationRESP<OrderDataRESP>> =>
  api.get(END_POINT.ROOT, { params });

export const getOrderDetailAPI = (id: string): Promise<BaseRESP<OrderDetailDataRESP>> => api.get(`${END_POINT.ROOT}/${id}`);

export const getOrderDesignFilesAPI = (orderNumber: string): Promise<BaseRESP<OrderDesignFilesDataRESP>> =>
  api.get(`${END_POINT.ROOT}/${orderNumber}/design-files`);

export const getOrderStatusHistoryAPI = (id: string): Promise<PaginationRESP<OrderStatusHistoryDataRESP>> =>
  api.get(`${END_POINT.ROOT}/${id}/status-history`);

export const updateOrderBasicInfoAPI = (body: OrderBasicInfoUpdateREQ) => api.put(`/orders/${body.order_id}/basic-info`, body);

export const updateOrderStatusAPI = (body: OrderStatusUpdateREQ): Promise<BaseRESP<OrderDetailDataRESP>> =>
  api.put(`${END_POINT.ROOT}/${body.orderNumber}/status`, { status: body.status });

export const uploadOrderDraftFileAPI = (params: UploadOrderDraftFileREQ): Promise<BaseRESP<UploadOrderDraftFileDataRESP>> => {
  const formData = new FormData();
  formData.append('file', params.file);
  if (params.design_group_id !== undefined && params.design_group_id !== null) {
    formData.append('design_group_id', String(params.design_group_id));
  }
  return api.post(`${END_POINT.ROOT}/${params.orderNumber}/design-files/upload`, formData);
};

export const updateOrderDraftStatusAPI = (body: OrderDraftStatusUpdateREQ) =>
  api.patch(`/orders/${body.order_id}/draft-status`, body);

export const getWorkOrderPdfAPI = (orderId: number): Promise<BaseRESP<WorkInstructionPrintRESP>> =>
  api.get(`/admin/work-instructions/${orderId}/print`);

export const getBatchWorkOrderPdfAPI = (body: BatchWorkInstructionPrintREQ): Promise<BaseRESP<WorkInstructionPrintRESP>> =>
  api.post('/admin/work-instructions/batch-print', body);

export const exportOrderExcelAPI = (body: OrderExportExcelREQ): Promise<BaseRESP<ExportExcelRESP>> =>
  api.post(`${END_POINT.ROOT}/export-excel`, body);

export const getOrderExportProgressAPI = (historyId: number): Promise<BaseRESP<ExportExcelRESP>> =>
  api.get(`${END_POINT.ROOT}/export-excel/${historyId}/check-progress-status`);

export const downloadOrderExportAPI = (historyId: number): Promise<Blob> =>
  api.get(`${END_POINT.ROOT}/export-excel/${historyId}/download`, { responseType: 'blob' });

export const getOrderPrintPdfManifestAPI = (orderNumber: string): Promise<BaseRESP<OrderPrintPdfManifestRESP>> =>
  api.get(END_POINT.PRINT_PDF(orderNumber), { responseType: 'json', timeout: 120_000 });

export const getOrderItemPrintPdfUrl = (orderNumber: string, orderItemId: number) =>
  `${END_POINT.ROOT}/${encodeURIComponent(orderNumber)}/items/${orderItemId}/print-pdf`;

export const downloadOrderItemPrintPdfAPI = (downloadUrl: string): Promise<Blob> =>
  api.get(downloadUrl, { responseType: 'blob', timeout: 120_000 });

export const uploadDesignRevisionAPI = (body: OrderDesignRevisionREQ) =>
  api.post(END_POINT.DESIGN_REVISIONS(body.orderNumber), body);
