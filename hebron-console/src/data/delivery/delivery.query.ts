import type { BaseRESP, ErrorRESP, PaginationRESP } from '@/utils/types/response.type';
import { useMutation, useQuery, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import {
  getShipmentByInvoiceAPI,
  getShipmentListAPI,
  getShipmentSearchFiltersAPI,
  getShipmentTrackingEventsAPI,
  updateShipmentAPI,
} from './delivery.api';
import type { ShipmentListREQ, ShipmentUpdateREQ } from './delivery.request';
import type { ShipmentDetailRESP, ShipmentListRESP } from './delivery.response';

export const DELIVERY_QUERY_KEYS = {
  SHIPMENT_LIST: 'SHIPMENT_LIST',
  SHIPMENT_DETAIL: 'SHIPMENT_DETAIL',
  SHIPMENT_SEARCH_FILTERS: 'SHIPMENT_SEARCH_FILTERS',
  SHIPMENT_TRACKING_EVENTS: 'SHIPMENT_TRACKING_EVENTS',
  SHIPMENT_EXPORT_PROGRESS: 'SHIPMENT_EXPORT_PROGRESS',
};

export const useShipmentListQuery = (params: ShipmentListREQ) =>
  useQuery({
    queryKey: [DELIVERY_QUERY_KEYS.SHIPMENT_LIST, params],
    queryFn: () => getShipmentListAPI(params),
    select: (resp: PaginationRESP<ShipmentListRESP>) => ({
      list: resp.data.shipments,
      pagination: resp.pagination,
    }),
  });

export const useShipmentSearchFiltersQuery = () =>
  useQuery({
    queryKey: [DELIVERY_QUERY_KEYS.SHIPMENT_SEARCH_FILTERS],
    queryFn: getShipmentSearchFiltersAPI,
    select: (resp) => resp.data.filters,
    staleTime: Infinity,
  });

export const useShipmentByInvoiceQuery = (invoiceNumber?: string | null) =>
  useQuery({
    queryKey: [DELIVERY_QUERY_KEYS.SHIPMENT_DETAIL, invoiceNumber],
    queryFn: () => getShipmentByInvoiceAPI(invoiceNumber as string),
    enabled: !!invoiceNumber,
    select: (resp) => resp.data.shipment,
  });

export const useShipmentTrackingEventsQuery = (invoiceNumber?: string | null) =>
  useQuery({
    queryKey: [DELIVERY_QUERY_KEYS.SHIPMENT_TRACKING_EVENTS, invoiceNumber],
    queryFn: () => getShipmentTrackingEventsAPI(invoiceNumber as string),
    enabled: !!invoiceNumber,
    // BE shape chưa verify được (bảng còn rỗng) — chốt về mảng để UI không vỡ nếu key khác.
    select: (resp) => (Array.isArray(resp.data?.events) ? resp.data.events : []),
  });

export const useShipmentUpdateMutation = (
  options?: UseMutationOptions<BaseRESP<ShipmentDetailRESP>, AxiosError<ErrorRESP>, ShipmentUpdateREQ>,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: updateShipmentAPI,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: [DELIVERY_QUERY_KEYS.SHIPMENT_LIST] });
      queryClient.invalidateQueries({ queryKey: [DELIVERY_QUERY_KEYS.SHIPMENT_DETAIL] });
      options?.onSuccess?.(...args);
    },
  });
};
