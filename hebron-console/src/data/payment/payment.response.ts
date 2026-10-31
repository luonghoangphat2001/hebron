import type { PaymentMethod, PaymentStatus } from '@/utils/enums/payment.enum';
import type { Pagination } from '@/utils/types/response.type';

export type PaymentOrderRESP = {
  order_number: string;
  company_name?: string | null;
  contact_name?: string | null;
  total_amount?: number;
};

export type PaymentListItemRESP = {
  transaction_id: string;
  order: PaymentOrderRESP | null;
  payment_method: PaymentMethod;
  status: PaymentStatus;
  amount: number;
  currency: string;
  pg_name: string | null;
  pg_request?: Record<string, unknown> | null;
  pg_response?: Record<string, unknown> | null;
  card_name: string | null;
  card_number: string | null;
  virtual_account_number: string | null;
  virtual_account_bank: string | null;
  virtual_account_expires_at: string | null;
  paid_at: string | null;
  failed_at: string | null;
  meta_data?: Record<string, unknown> | any[] | null;
  created_at: string;
  updated_at: string;
};

export type PaymentDataRESP = {
  payments: PaymentListItemRESP[];
  pagination: Pagination;
};

export type PaymentDetailRESP = PaymentListItemRESP;

export type PaymentDetailDataRESP = {
  payment: PaymentDetailRESP;
};

export type PaymentReceiptRESP = {
  pdf_url: string;
};

export type PaymentRefundRESP = {
  transaction_id: string;
  status: PaymentStatus;
  refunded_at: string | null;
};

export type SettlementReportItemRESP = {
  transaction_id: string;
  order_number: string;
  status: PaymentStatus;
  payment_method: PaymentMethod;
  paid_at: string | null;
  failed_at: string | null;
  created_at: string;
  customer_id: string;
  customer_name: string;
  product_id: string;
  product_name: string;
  category_id: string;
  category_name: string;
  payment_amount: number;
  supply_price: number;
  vat: number;
  commission: number;
};

export type SettlementReportDataRESP = {
  reports: SettlementReportItemRESP[];
  pagination: Pagination;
};
