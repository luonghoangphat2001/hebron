import type { ExportType } from '@/utils/enums/common.enum';
import type { OrderPaymentMethod } from '@/utils/enums/order.enum';
import type { PaginationREQ } from '@/utils/types/request.type';

export type OrderSelectedOptionREQ = {
  group_id: number;
  option_id: number;
};

export type OrderContactREQ = {
  name: string;
  companyName?: string;
  phone: string;
  phone2: string;
  email: string;
  // postcode: string;
  // address: string;
  // address_detail?: string;
};

export type OrderShippingREQ = {
  name: string;
  phone: string;
  postcode: string;
  address: string;
  address_detail?: string;
  customer_note: string;
};

export type OrderCreateREQ = {
  product_id: number;
  quantity: number;
  selected_options: OrderSelectedOptionREQ[];
  payment_method: OrderPaymentMethod | string;
  //company_name?: string;
  //shipping_method: OrderShippingMethod | string;
  contact: OrderContactREQ;
  shipping: OrderShippingREQ;
  //customer_note?: string;
  design_group_id?: number;
  order_design_content_id?: number;
};

export type OrderListREQ = PaginationREQ;

export type MyPageOrderHistoryListREQ = PaginationREQ & {
  order_number_keyword?: string;
};

export type OrderInquiryDetailREQ = {
  order_number: string;
  mobile_phone: string;
};

export type OrderListExportExcelREQ = MyPageOrderHistoryListREQ & {
  export_type: ExportType;
};
