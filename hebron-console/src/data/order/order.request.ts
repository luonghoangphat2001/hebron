import type { DraftStatus, OrderSortby, OrderStatus } from '@/utils/enums/order.enum';
import type { ExportExcelBaseREQ } from '@/utils/types/export.type';
import type { PaginationREQ, SortREQ } from '@/utils/types/request.type';

export type OrderListREQ = PaginationREQ &
  SortREQ & {
    order_number?: string;
    customer_name?: string;
    orderer_name?: string;
    status?: OrderStatus;
    order_date_from?: string;
    order_date_to?: string;
    sort_by?: OrderSortby;
  };

export type OrderExportExcelREQ = ExportExcelBaseREQ & Omit<OrderListREQ, 'page'>;

export type OrderBasicInfoUpdateREQ = {
  order_id: number;
  member_name: string;
  recipient_name: string;
  recipient_phone: string;
  payment_amount: number;
  shipping_address: string;
  payment_method: string;
};

export type UploadOrderDraftFileREQ = {
  orderNumber: string;
  file: File;
  design_group_id?: number;
};

export type OrderDraftStatusUpdateREQ = {
  order_id: number;
  draft_status: DraftStatus;
  rework_reason?: string;
};

export type OrderStatusUpdateREQ = {
  orderNumber: string;
  status: string;
};

export type BatchWorkInstructionPrintREQ = {
  order_ids: number[];
};

export type OrderDesignRevisionREQ = {
  orderNumber: string;
  files: {
    url: string;
    name: string;
    size: number;
  }[];
};
