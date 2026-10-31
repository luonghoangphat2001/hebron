import type { OrderPaymentMethod } from '@/utils/enums/order.enum';
import type { OrderContactREQ, OrderShippingREQ } from '../orders/orders.request';

export type CartSelectedOptionREQ = {
  group_id: number;
  option_id: number;
};

export type CartItemCreateREQ = {
  product_id: number;
  quantity: number;
  design_group_id?: number;
  order_design_content_id?: number;
  selected_options?: CartSelectedOptionREQ[];
};

export type CartItemUpdateREQ = {
  quantity: number;
};

export type CartQuoteREQ = {
  item_ids: number[];
};

export type CartCheckoutREQ = {
  item_ids: number[];
  payment_method: OrderPaymentMethod;
  contact: OrderContactREQ;
  shipping: OrderShippingREQ;
};
