import type { BaseRESP } from '@/utils/types/response.type';
import { useMutation, useQuery, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import {
  getPaymentDetailAPI,
  getPaymentListAPI,
  getPaymentReceiptAPI,
  getSettlementReportListAPI,
  refundPaymentAPI,
  updatePaymentStatusAPI,
} from './payment.api';
import type { PaymentRefundREQ, PaymentListREQ, PaymentStatusUpdateREQ, SettlementReportListREQ } from './payment.request';
import type { PaymentDetailDataRESP, PaymentReceiptRESP, PaymentRefundRESP } from './payment.response';

export const PAYMENT_QUERY_KEYS = {
  LIST: 'PAYMENT_LIST',
  DETAIL: 'PAYMENT_DETAIL',
  EXPORT_PROGRESS: 'PAYMENT_EXPORT_PROGRESS',
  SETTLEMENT_LIST: 'SETTLEMENT_REPORT_LIST',
  SETTLEMENT_EXPORT_PROGRESS: 'SETTLEMENT_EXPORT_PROGRESS',
};

export const useSettlementReportListQuery = (params: SettlementReportListREQ) =>
  useQuery({
    queryKey: [PAYMENT_QUERY_KEYS.SETTLEMENT_LIST, params],
    queryFn: () => getSettlementReportListAPI(params),
  });

export const usePaymentListQuery = (params: PaymentListREQ) =>
  useQuery({
    queryKey: [PAYMENT_QUERY_KEYS.LIST, params],
    queryFn: () => getPaymentListAPI(params),
  });

export const usePaymentDetailQuery = (transactionId?: string) =>
  useQuery({
    queryKey: [PAYMENT_QUERY_KEYS.DETAIL, transactionId],
    queryFn: () => getPaymentDetailAPI(transactionId as string),
    select: (resp) => resp.data.payment,
    enabled: !!transactionId,
  });

export const usePaymentReceiptMutation = (option?: UseMutationOptions<BaseRESP<PaymentReceiptRESP>, AxiosError, string>) =>
  useMutation<BaseRESP<PaymentReceiptRESP>, AxiosError, string>({ mutationFn: getPaymentReceiptAPI, ...option });

export const useRefundPaymentMutation = (
  option?: UseMutationOptions<BaseRESP<PaymentRefundRESP>, AxiosError, PaymentRefundREQ>,
) => {
  const queryClient = useQueryClient();

  return useMutation<BaseRESP<PaymentRefundRESP>, AxiosError, PaymentRefundREQ>({
    ...option,
    mutationFn: refundPaymentAPI,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: [PAYMENT_QUERY_KEYS.LIST] });
      queryClient.invalidateQueries({ queryKey: [PAYMENT_QUERY_KEYS.DETAIL] });
      option?.onSuccess?.(...args);
    },
  });
};

export const useUpdatePaymentStatusMutation = (
  option?: UseMutationOptions<BaseRESP<PaymentDetailDataRESP>, AxiosError, PaymentStatusUpdateREQ>,
) => {
  const queryClient = useQueryClient();

  return useMutation<BaseRESP<PaymentDetailDataRESP>, AxiosError, PaymentStatusUpdateREQ>({
    ...option,
    mutationFn: updatePaymentStatusAPI,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: [PAYMENT_QUERY_KEYS.LIST] });
      queryClient.invalidateQueries({ queryKey: [PAYMENT_QUERY_KEYS.DETAIL] });
      option?.onSuccess?.(...args);
    },
  });
};
