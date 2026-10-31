import { INITIAL_PAGING, PAGE_PARAM_KEY, PER_PAGE_PARAM_KEY } from '@/utils/constants/common.constant';
import type { ShipmentStatus } from '@/utils/enums/delivery.enum';
import { orUndefined } from '@/utils/helper/string.helper';
import type { ShipmentListREQ } from './delivery.request';

export const getShipmentListInitFilter = (searchParams: URLSearchParams): ShipmentListREQ => ({
  page: Number(searchParams.get(PAGE_PARAM_KEY)) || INITIAL_PAGING.page,
  per_page: Number(searchParams.get(PER_PAGE_PARAM_KEY)) || INITIAL_PAGING.per_page,
  search_term: orUndefined(searchParams.get('search_term')),
  order_number: orUndefined(searchParams.get('order_number')),
  customer_name: orUndefined(searchParams.get('customer_name')),
  product_name: orUndefined(searchParams.get('product_name')),
  shipping_manager_id: Number(searchParams.get('shipping_manager_id')) || undefined,
  tracking_number: orUndefined(searchParams.get('tracking_number')),
  invoice_number: orUndefined(searchParams.get('invoice_number')),
  status: orUndefined(searchParams.get('status')) as ShipmentStatus | undefined,
  shipment_date_from: orUndefined(searchParams.get('shipment_date_from')),
  shipment_date_to: orUndefined(searchParams.get('shipment_date_to')),
  sort_by: orUndefined(searchParams.get('sort_by')),
  sort_order: orUndefined(searchParams.get('sort_order')) as 'asc' | 'desc' | undefined,
});
