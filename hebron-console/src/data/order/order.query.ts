import { useMutation, useQuery, type UseMutationOptions } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import type { BaseRESP } from '@/utils/types/response.type';
import {
  getBatchWorkOrderPdfAPI,
  getOrderDetailAPI,
  getOrderDesignFilesAPI,
  getOrderListAPI,
  getOrderStatusHistoryAPI,
  getWorkOrderPdfAPI,
  updateOrderStatusAPI,
  uploadDesignRevisionAPI,
  uploadOrderDraftFileAPI,
} from './order.api';
import type {
  BatchWorkInstructionPrintREQ,
  OrderDesignRevisionREQ,
  OrderListREQ,
  OrderStatusUpdateREQ,
  UploadOrderDraftFileREQ,
} from './order.request';
import type { OrderDetailDataRESP, UploadOrderDraftFileDataRESP, WorkInstructionPrintRESP } from './order.response';

export const ORDER_QUERY_KEYS = {
  LIST: 'ORDER_LIST',
  DETAIL: 'ORDER_DETAIL',
  DESIGN_FILES: 'ORDER_DESIGN_FILES',
  STATUS_HISTORY: 'ORDER_STATUS_HISTORY',
  EXPORT_PROGRESS: 'ORDER_EXPORT_PROGRESS',
};

export const useOrderListQuery = (params: OrderListREQ) =>
  useQuery({
    queryKey: [ORDER_QUERY_KEYS.LIST, params],
    queryFn: () => getOrderListAPI(params),
  });

export const useOrderDetailQuery = (id?: string) =>
  useQuery({
    queryKey: [ORDER_QUERY_KEYS.DETAIL, id],
    queryFn: () => getOrderDetailAPI(id || ''),
    select: (resp) => resp.data.order,
    enabled: !!id,
  });

export const useOrderDesignFilesQuery = (orderNumber?: string) =>
  useQuery({
    queryKey: [ORDER_QUERY_KEYS.DESIGN_FILES, orderNumber],
    queryFn: () => getOrderDesignFilesAPI(orderNumber || ''),
    select: (resp) => resp.data,
    enabled: !!orderNumber,
  });

export const useOrderStatusHistoryQuery = (id?: string) =>
  useQuery({
    queryKey: [ORDER_QUERY_KEYS.STATUS_HISTORY, id],
    queryFn: () => getOrderStatusHistoryAPI(id || ''),
    select: (resp) => ({
      history: resp.data?.history || [],
      pagination: resp.pagination,
    }),
    enabled: !!id,
  });

export const useWorkOrderPdfMutation = (option?: UseMutationOptions<BaseRESP<WorkInstructionPrintRESP>, AxiosError, number>) =>
  useMutation<BaseRESP<WorkInstructionPrintRESP>, AxiosError, number>({ mutationFn: getWorkOrderPdfAPI, ...option });

export const useBatchWorkOrderPdfMutation = (
  option?: UseMutationOptions<BaseRESP<WorkInstructionPrintRESP>, AxiosError, BatchWorkInstructionPrintREQ>,
) =>
  useMutation<BaseRESP<WorkInstructionPrintRESP>, AxiosError, BatchWorkInstructionPrintREQ>({
    mutationFn: getBatchWorkOrderPdfAPI,
    ...option,
  });

export const useUpdateOrderStatusMutation = (
  option?: UseMutationOptions<BaseRESP<OrderDetailDataRESP>, AxiosError, OrderStatusUpdateREQ>,
) =>
  useMutation<BaseRESP<OrderDetailDataRESP>, AxiosError, OrderStatusUpdateREQ>({
    mutationFn: updateOrderStatusAPI,
    ...option,
  });

export const useUploadOrderDraftFileMutation = (
  option?: UseMutationOptions<BaseRESP<UploadOrderDraftFileDataRESP>, AxiosError, UploadOrderDraftFileREQ>,
) =>
  useMutation<BaseRESP<UploadOrderDraftFileDataRESP>, AxiosError, UploadOrderDraftFileREQ>({
    mutationFn: uploadOrderDraftFileAPI,
    ...option,
  });

export const useUploadDesignRevisionMutation = (
  option?: UseMutationOptions<Awaited<ReturnType<typeof uploadDesignRevisionAPI>>, AxiosError, OrderDesignRevisionREQ>,
) =>
  useMutation<Awaited<ReturnType<typeof uploadDesignRevisionAPI>>, AxiosError, OrderDesignRevisionREQ>({
    mutationFn: uploadDesignRevisionAPI,
    ...option,
  });
