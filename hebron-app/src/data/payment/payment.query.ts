import type { BaseRESP, ErrorRESP } from '@/utils/types/response.type';
import { useMutation, type UseMutationOptions } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { PaymentAPI } from './payment.api';
import type { PaymentConfirmREQ, PaymentInitREQ } from './payment.request';
import type { PaymentConfirmRESP, PaymentInitRESP } from './payment.response';

export const useInitPaymentMutation = (
  options?: UseMutationOptions<BaseRESP<PaymentInitRESP>, AxiosError<ErrorRESP>, PaymentInitREQ>,
) =>
  useMutation({
    ...options,
    mutationFn: PaymentAPI.initPayment,
  });

export const useConfirmPaymentMutation = (
  options?: UseMutationOptions<BaseRESP<PaymentConfirmRESP>, AxiosError<ErrorRESP>, PaymentConfirmREQ>,
) =>
  useMutation({
    ...options,
    mutationFn: PaymentAPI.confirmPayment,
  });
