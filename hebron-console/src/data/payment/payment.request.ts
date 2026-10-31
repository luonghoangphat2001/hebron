import type { PaymentMethod, PaymentSortby, PaymentStatus } from '@/utils/enums/payment.enum';
import type { ExportExcelBaseREQ } from '@/utils/types/export.type';
import type { PaginationREQ, SortREQ } from '@/utils/types/request.type';

export type PaymentListREQ = PaginationREQ &
  SortREQ & {
    order_number?: string;
    customer_name?: string;
    payment_method?: PaymentMethod;
    status?: PaymentStatus;
    start_date?: string;
    end_date?: string;
    sort_by?: PaymentSortby;
  };

export type PaymentExportExcelREQ = Omit<ExportExcelBaseREQ, 'selected_ids'> &
  Omit<PaymentListREQ, 'page'> & {
    selected_ids?: string[];
  };

export type SettlementReportListREQ = PaginationREQ & {
  /** YYYY-MM-DD */
  start_date?: string;
  /** YYYY-MM-DD */
  end_date?: string;
};

/** Same export scopes as the payment list; the ids are transaction ids. */
export type SettlementExportExcelREQ = Omit<ExportExcelBaseREQ, 'selected_ids'> &
  Pick<SettlementReportListREQ, 'start_date' | 'end_date'> & {
    selected_ids?: string[];
  };

export type PaymentRefundREQ = {
  transactionId: string;
  reason: string;
  amount?: number;
};

export type PaymentStatusUpdateREQ = {
  transactionId: string;
  status: PaymentStatus;
};
