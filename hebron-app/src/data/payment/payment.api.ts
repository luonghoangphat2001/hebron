import { api } from '@/api';
import type { BaseRESP } from '@/utils/types/response.type';
import type { PaymentConfirmREQ, PaymentInitREQ } from './payment.request';
import type { PaymentConfirmRESP, PaymentInitRESP } from './payment.response';

export const ENDPOINTS = {
  PAYMENT_INIT: '/payments',
  PAYMENT_CONFIRM: '/payments/toss/confirm',
};

export const PaymentAPI = {
  initPayment: (body: PaymentInitREQ): Promise<BaseRESP<PaymentInitRESP>> => api.post(ENDPOINTS.PAYMENT_INIT, body),

  confirmPayment: (body: PaymentConfirmREQ): Promise<BaseRESP<PaymentConfirmRESP>> => api.post(ENDPOINTS.PAYMENT_CONFIRM, body),
};
