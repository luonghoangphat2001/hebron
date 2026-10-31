import type { ShipmentStatus } from '@/utils/enums/delivery.enum';
import type { ExportExcelBaseREQ } from '@/utils/types/export.type';
import type { PaginationREQ } from '@/utils/types/request.type';

export type ShipmentListREQ = PaginationREQ & {
  search_term?: string;
  order_number?: string;
  customer_name?: string;
  product_name?: string;
  shipping_manager_id?: number;
  tracking_number?: string;
  invoice_number?: string;
  status?: ShipmentStatus;
  shipment_date_from?: string;
  shipment_date_to?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
};

export type ShipmentUpdateREQ = {
  orderNumber: string;
  invoice_number: string;
  tracking_number: string;
  carrier_name: string;
};

export type ShipmentExportExcelREQ = Omit<ShipmentListREQ, 'page'> & ExportExcelBaseREQ;
