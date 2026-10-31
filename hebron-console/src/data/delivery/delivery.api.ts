import { api } from '@/api';
import type { BaseRESP, PaginationRESP } from '@/utils/types/response.type';
import type { ShipmentExportExcelREQ, ShipmentListREQ, ShipmentUpdateREQ } from './delivery.request';
import type {
  ShipmentDetailRESP,
  ShipmentExportExcelRESP,
  ShipmentListRESP,
  ShipmentSearchFiltersRESP,
  ShipmentTrackingEventsRESP,
} from './delivery.response';

const END_POINT = '/admin/shipments';

export const getShipmentListAPI = (params: ShipmentListREQ): Promise<PaginationRESP<ShipmentListRESP>> =>
  api.get(END_POINT, { params });

export const getShipmentSearchFiltersAPI = (): Promise<BaseRESP<ShipmentSearchFiltersRESP>> =>
  api.get(`${END_POINT}/search-filters`);

export const getShipmentByInvoiceAPI = (invoiceNumber: string): Promise<BaseRESP<ShipmentDetailRESP>> =>
  api.get(`${END_POINT}/invoice/${invoiceNumber}`);

export const getShipmentTrackingEventsAPI = (invoiceNumber: string): Promise<BaseRESP<ShipmentTrackingEventsRESP>> =>
  api.get(`${END_POINT}/${invoiceNumber}/tracking/events`);

export const updateShipmentAPI = ({ orderNumber, ...body }: ShipmentUpdateREQ): Promise<BaseRESP<ShipmentDetailRESP>> =>
  api.put(`${END_POINT}/${orderNumber}`, body);

export const exportShipmentExcelAPI = (body: ShipmentExportExcelREQ): Promise<BaseRESP<ShipmentExportExcelRESP>> =>
  api.post(`${END_POINT}/export-excel`, body);

export const getShipmentExportProgressAPI = (historyId: number): Promise<BaseRESP<ShipmentExportExcelRESP>> =>
  api.get(`${END_POINT}/export-excel/${historyId}/check-progress-status`);
