import type { OrderLineItemRESP } from '../orders/orders.response';
import type { ProductDesignContent, ProductSelectedOption, ProductSpecification } from '../products/products.response';

export type CartProductRESP = {
  id: number;
  name: string | { ko?: string; en?: string };
  name_en?: string | null;
  slug: string;
  sku?: string;
  selling_price?: number | null;
  images: string[];
  is_active: boolean;
  stock_quantity: number;
  specification: ProductSpecification | null;
};

export type CartItemRESP = {
  id: number;
  product_id: number;
  design_group?: { id: number } | null;
  order_design_content?: ProductDesignContent;
  quantity: number;
  sale_price?: number | null;
  option_price?: number | null;
  selected_options: ProductSelectedOption[];
  product: CartProductRESP;
  created_at: string;
};

export type CartDetailRESP = {
  cart: {
    id: number;
    items: CartItemRESP[];
  };
};

export type CartItemCreateRESP = {
  cart_item: CartItemRESP;
};

export type CartItemUpdateRESP = {
  cart_item: CartItemRESP;
};

export type CartQuoteItemRESP = {
  cart_item_id: number;
  product_id: number;
  product_name: string;
  thumbnail: string | null;
  price: number;
  supply_price: number;
  selling_price: number;
  option_price: number;
  selected_options: ProductSelectedOption[];
  quantity: number;
  sub_total: number;
  estimated_production_days: number;
};

export type CartQuoteRESP = {
  items: CartQuoteItemRESP[];
  summary: {
    supply_price: number;
    selling_price: number;
    option_price: number;
    sub_total: number;
    vat: number;
    total: number;
    estimated_production_days: number;
  };
};

export type CartCheckoutOrderRESP = {
  id: number;
  order_number: string;
  user_id: number | null;
  status: string;
  payment_status: string;
  currency: string;
  subtotal_amount: number;
  discount_amount: number;
  tax_amount: number;
  shipping_fee: number;
  total_amount: number;
  payment_method: string;
  contact_name: string;
  contact_phone: string;
  contact_phone2: string | null;
  company_name: string | null;
  contact_email: string | null;
  shipping_name: string;
  shipping_phone: string;
  shipping_postcode: string;
  shipping_address: string;
  shipping_address_detail: string | null;
  shipping_method: string;
  estimated_production_days: number;
  placed_at: string;
  customer_note: string | null;
  metadata: unknown | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  items: OrderLineItemRESP[];
};

export type CartCheckoutRESP = {
  order: CartCheckoutOrderRESP;
};
