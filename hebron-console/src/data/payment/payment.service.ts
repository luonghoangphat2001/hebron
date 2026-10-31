import type { PaymentFilterValues } from '@/pages/payment/components/PaymentFilter';
import type { SettlementFilterValues } from '@/pages/payment/components/SettlementFilter';
import { DATE_FORMAT } from '@/utils/constants/date.constant';
import { ExportType } from '@/utils/enums/common.enum';
import dayjs from 'dayjs';
import type { PaymentExportExcelREQ, PaymentListREQ, SettlementExportExcelREQ, SettlementReportListREQ } from './payment.request';

const toSearchParams = (filter: PaymentFilterValues) => ({
  order_number: filter.order_number || undefined,
  customer_name: filter.customer_name || undefined,
  payment_method: filter.payment_method,
  status: filter.status,
  start_date: filter.payment_date?.from ? dayjs(filter.payment_date.from).format(DATE_FORMAT) : undefined,
  end_date: filter.payment_date?.to ? dayjs(filter.payment_date.to).format(DATE_FORMAT) : undefined,
});

export const transformPaymentFilterToREQ = (filter: PaymentFilterValues, page: number, perPage: number): PaymentListREQ => ({
  ...toSearchParams(filter),
  page,
  per_page: perPage,
});

const toSettlementSearchParams = (filter: SettlementFilterValues) => ({
  start_date: filter.settlement_date?.from ? dayjs(filter.settlement_date.from).format(DATE_FORMAT) : undefined,
  end_date: filter.settlement_date?.to ? dayjs(filter.settlement_date.to).format(DATE_FORMAT) : undefined,
});

export const transformSettlementFilterToREQ = (
  filter: SettlementFilterValues,
  page: number,
  perPage: number,
): SettlementReportListREQ => ({
  ...toSettlementSearchParams(filter),
  page,
  per_page: perPage,
});

export const transformSettlementFilterToExportREQ = (
  filter: SettlementFilterValues,
  exportType: ExportType,
  selectedIds: string[] = [],
  currentPage?: number,
  perPage?: number,
  locale = 'en',
): SettlementExportExcelREQ => ({
  ...toSettlementSearchParams(filter),
  export_type: exportType,
  selected_ids: exportType === ExportType.SELECTED ? selectedIds : undefined,
  current_page: exportType === ExportType.CURRENT_PAGE ? currentPage : undefined,
  per_page: perPage,
  locale,
});

export const transformPaymentFilterToExportREQ = (
  filter: PaymentFilterValues,
  exportType: ExportType,
  selectedIds: string[] = [],
  currentPage?: number,
  perPage?: number,
  locale = 'en',
): PaymentExportExcelREQ => ({
  ...toSearchParams(filter),
  export_type: exportType,
  selected_ids: exportType === ExportType.SELECTED ? selectedIds : undefined,
  current_page: exportType === ExportType.CURRENT_PAGE ? currentPage : undefined,
  per_page: perPage,
  locale,
});
