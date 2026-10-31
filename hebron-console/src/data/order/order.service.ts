import type { OrderBasicInfoInput, OrderFilterInput } from '@/schemas/order/order.schema';
import { INITIAL_PAGING, PAGE_PARAM_KEY, PER_PAGE_PARAM_KEY } from '@/utils/constants/common.constant';
import { DATE_FORMAT } from '@/utils/constants/date.constant';
import { ORDER_STATUS_BADGE } from '@/utils/constants/order.constant';
import { ExportType, SortOrder } from '@/utils/enums/common.enum';
import { DraftStatus, OrderSortby, OrderStatus } from '@/utils/enums/order.enum';
import dayjs from 'dayjs';
import type { OrderExportExcelREQ, OrderListREQ, UploadOrderDraftFileREQ } from './order.request';
import type { OrderDetailRESP, OrderItemRESP } from './order.response';

export type OrderFilterValues = OrderFilterInput;

export const DEFAULT_ORDER_FILTER: OrderFilterValues = {
  order_number: undefined,
  customer_name: undefined,
  orderer_name: undefined,
  status: undefined,
  date_period: undefined,
  sort_by: undefined,
  sort_order: undefined,
  page: 1,
  per_page: 10,
};

export const getOrderListInitFilter = (searchParams: URLSearchParams): OrderFilterValues => ({
  order_number: searchParams.get('order_number') || undefined,
  customer_name: searchParams.get('customer_name') || undefined,
  orderer_name: searchParams.get('orderer_name') || undefined,
  status: (searchParams.get('status') as OrderStatus) || undefined,
  date_period: undefined,
  sort_by: (searchParams.get('sort_by') as OrderSortby) || undefined,
  sort_order: (searchParams.get('sort_order') as SortOrder) || undefined,
  page: Number(searchParams.get(PAGE_PARAM_KEY)) || INITIAL_PAGING.page || 1,
  per_page: Number(searchParams.get(PER_PAGE_PARAM_KEY)) || INITIAL_PAGING.per_page || 10,
});

export const transformOrderFilterToREQ = (filter: OrderFilterValues): OrderListREQ => ({
  page: filter.page,
  per_page: filter.per_page,
  order_number: filter.order_number || undefined,
  customer_name: filter.customer_name || undefined,
  orderer_name: filter.orderer_name || undefined,
  status: (filter.status as OrderStatus) || undefined,
  order_date_from: filter.date_period?.from ? dayjs(filter.date_period.from).format(DATE_FORMAT) : undefined,
  order_date_to: filter.date_period?.to ? dayjs(filter.date_period.to).format(DATE_FORMAT) : undefined,
  sort_by: (filter.sort_by as OrderSortby) || undefined,
  sort_order: filter.sort_order,
});

export const transformOrderFilterToExportREQ = (
  filter: OrderFilterValues,
  exportType: ExportType,
  selectedIds: number[] = [],
  currentPage?: number,
  locale = 'en',
): OrderExportExcelREQ => ({
  export_type: exportType,
  selected_ids: exportType === ExportType.SELECTED ? selectedIds : undefined,
  current_page: exportType === ExportType.CURRENT_PAGE ? (currentPage ?? filter.page) : undefined,
  per_page: filter.per_page,
  locale,
  order_number: filter.order_number || undefined,
  customer_name: filter.customer_name || undefined,
  orderer_name: filter.orderer_name || undefined,
  status: (filter.status as OrderStatus) || undefined,
  order_date_from: filter.date_period?.from ? dayjs(filter.date_period.from).format(DATE_FORMAT) : undefined,
  order_date_to: filter.date_period?.to ? dayjs(filter.date_period.to).format(DATE_FORMAT) : undefined,
  sort_by: (filter.sort_by as OrderSortby) || undefined,
  sort_order: filter.sort_order,
});

export const getOrderMemberName = (order?: OrderDetailRESP | null): string => {
  if (!order) return '-';
  return order.user?.name || order.user?.username || order.contact?.name || order.company_name || '-';
};

export const getOrderRecipientName = (order?: OrderDetailRESP | null): string => {
  if (!order) return '-';
  return order.shipping?.name || order.contact?.name || '-';
};

export const getOrderRecipientPhone = (order?: OrderDetailRESP | null): string => {
  if (!order) return '-';
  return order.shipping?.phone || order.contact?.phone || '-';
};

export const getOrderShippingAddress = (order?: OrderDetailRESP | null): string => {
  if (!order) return '-';
  return [order.shipping?.address, order.shipping?.address_detail].filter(Boolean).join(' ') || '-';
};

export const getOrderPaymentAmount = (order?: OrderDetailRESP | null): number => {
  if (!order) return 0;
  return Number(order.payment_details?.payment_amount || order.totals?.total || 0);
};

export const getOrderDisplayStatusLabel = (status?: OrderStatus | string | null, tEnum?: any): string => {
  if (!status) return '-';
  return tEnum ? tEnum(`order.${status}`, status) : status;
};

export type OrderStatusBadgeInfo = {
  label: string;
  badgeClass: string;
};

export const getOrderStatusBadgeInfo = (status?: OrderStatus | string | null, tEnum?: any): OrderStatusBadgeInfo | null => {
  if (!status) return null;
  const label = tEnum ? tEnum(`order.${status}`, status) : status;
  const badgeClass = ORDER_STATUS_BADGE[status] || 'bg-gray-100 text-gray-600';
  return { label, badgeClass };
};

export type NormalizedOrderDetail = {
  memberName: string;
  recipientName: string;
  recipientPhone: string;
  shippingAddress: string;
  paymentAmount: number;
  statusKey: string;
  statusLabel: string;
  items: OrderItemRESP[];
  draftStatus?: DraftStatus;
  draftFiles: any[];
};

export const normalizeOrderDetail = (order?: OrderDetailRESP | null, tEnum?: any): NormalizedOrderDetail => {
  if (!order) {
    return {
      memberName: '-',
      recipientName: '-',
      recipientPhone: '-',
      shippingAddress: '-',
      paymentAmount: 0,
      statusKey: '',
      statusLabel: '-',
      items: [],
      draftStatus: undefined,
      draftFiles: [],
    };
  }

  const statusKey = order.status || '';

  return {
    memberName: getOrderMemberName(order),
    recipientName: getOrderRecipientName(order),
    recipientPhone: getOrderRecipientPhone(order),
    shippingAddress: getOrderShippingAddress(order),
    paymentAmount: getOrderPaymentAmount(order),
    statusKey,
    statusLabel: getOrderDisplayStatusLabel(statusKey, tEnum),
    items: order.items || [],
    draftStatus: (order.proof?.status as DraftStatus) || undefined,
    draftFiles: order.proof?.file_resubmissions || [],
  };
};

export const DEFAULT_ORDER_BASIC_INFO_INPUT: OrderBasicInfoInput = {
  member_name: '',
  recipient_name: '',
  recipient_phone: '',
  ordered_at: '',
  payment_amount: '0',
  shipping_address: '',
  payment_method: '',
};

export const transformOrderDetailToBasicInput = (order?: OrderDetailRESP | null): OrderBasicInfoInput => {
  if (!order) return DEFAULT_ORDER_BASIC_INFO_INPUT;

  const memberName = getOrderMemberName(order);
  const recipientName = getOrderRecipientName(order);
  const recipientPhone = getOrderRecipientPhone(order);
  const shippingAddress = getOrderShippingAddress(order);

  return {
    member_name: memberName === '-' ? '' : memberName,
    recipient_name: recipientName === '-' ? '' : recipientName,
    recipient_phone: recipientPhone === '-' ? '' : recipientPhone,
    ordered_at: order.created_at || order.metadata?.placed_at || '',
    payment_amount: String(getOrderPaymentAmount(order)),
    shipping_address: shippingAddress === '-' ? '' : shippingAddress,
    payment_method: order.payment_method || '',
  };
};

export const ALLOWED_DRAFT_FILE_EXTENSIONS = ['pdf', 'ai', 'jpg', 'jpeg', 'png'];
export const MAX_DRAFT_FILE_SIZE_BYTES = 50 * 1024 * 1024; // 50MB

export type OrderDraftUploadValidationResult = {
  valid: boolean;
  data?: UploadOrderDraftFileREQ;
  errorMessage?: string;
};

export const validateOrderDraftUpload = (orderNumber?: string, file?: File | null): OrderDraftUploadValidationResult => {
  if (!orderNumber || !orderNumber.trim()) {
    return { valid: false, errorMessage: 'FIELD_REQUIRED' };
  }

  if (!file || !(file instanceof File)) {
    return { valid: false, errorMessage: 'FILE_REQUIRED' };
  }

  if (file.size > MAX_DRAFT_FILE_SIZE_BYTES) {
    return { valid: false, errorMessage: 'FILE_SIZE_EXCEEDED' };
  }

  const ext = file.name.split('.').pop()?.toLowerCase() || '';
  if (!ALLOWED_DRAFT_FILE_EXTENSIONS.includes(ext)) {
    return {
      valid: false,
      errorMessage: 'The file field must be a file of type: pdf, ai, jpg, jpeg, png.',
    };
  }

  return {
    valid: true,
    data: {
      orderNumber: orderNumber.trim(),
      file,
    },
  };
};
