import { api } from '@/api';
import type { BaseRESP } from '@/utils/types/response.type';
import type { CartCheckoutREQ, CartItemCreateREQ, CartItemUpdateREQ, CartQuoteREQ } from './cart.request';
import type { CartCheckoutRESP, CartDetailRESP, CartItemCreateRESP, CartItemUpdateRESP, CartQuoteRESP } from './cart.response';

const ENDPOINTS = {
  ROOT: '/mypage/cart',
  ITEM: (itemId: number | string) => `/mypage/cart/${itemId}`,
  CHECK_QUOTE: '/mypage/cart/checkout/quote',
  CHECK_OUT: '/mypage/cart/checkout',
} as const;

export const cartAPI = {
  getDetail: (): Promise<BaseRESP<CartDetailRESP>> => api.get(ENDPOINTS.ROOT),

  create: (body: CartItemCreateREQ): Promise<BaseRESP<CartItemCreateRESP>> => api.post(ENDPOINTS.ROOT, body),

  update: (itemId: number | string, body: CartItemUpdateREQ): Promise<BaseRESP<CartItemUpdateRESP>> =>
    api.put(ENDPOINTS.ITEM(itemId), body),

  deleteItem: (itemId: number): Promise<BaseRESP<null>> => api.delete(ENDPOINTS.ITEM(itemId)),

  checkQuote: (body: CartQuoteREQ): Promise<BaseRESP<CartQuoteRESP>> => api.post(ENDPOINTS.CHECK_QUOTE, body),

  checkoutOrder: (body: CartCheckoutREQ): Promise<BaseRESP<CartCheckoutRESP>> => api.post(ENDPOINTS.CHECK_OUT, body),
};
