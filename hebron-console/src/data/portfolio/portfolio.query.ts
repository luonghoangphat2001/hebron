import type { BaseRESP, ErrorRESP } from '@/utils/types/response.type';
import { useMutation, useQuery, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import {
  createPortfolioAPI,
  createPortfolioCategoryAPI,
  deletePortfolioAPI,
  deletePortfolioCategoryAPI,
  getPortfolioCategoryListAPI,
  getPortfolioDetailAPI,
  getPortfolioListAPI,
  updatePortfolioAPI,
  updatePortfolioCategoryAPI,
} from './portfolio.api';
import type {
  PortfolioCategoryListREQ,
  PortfolioCategoryUpsertREQ,
  PortfolioCreateREQ,
  PortfolioListREQ,
  PortfolioUpdateREQ,
} from './portfolio.request';
import type { PortfolioCategoryDetailRESP, PortfolioCategoryItem, PortfolioRESP } from './portfolio.response';

export const PORTFOLIO_QUERY_KEYS = {
  LIST: 'portfolio-list',
  DETAIL: 'portfolio-detail',
  CATEGORY_LIST: 'portfolio-category-list',
} as const;

export const usePortfolioListQuery = (params: PortfolioListREQ) =>
  useQuery({
    queryKey: [PORTFOLIO_QUERY_KEYS.LIST, params],
    queryFn: () => getPortfolioListAPI(params),
  });

export const usePortfolioDetailQuery = (id?: number) =>
  useQuery({
    queryKey: [PORTFOLIO_QUERY_KEYS.DETAIL, id],
    queryFn: () => getPortfolioDetailAPI(id as number),
    select: (resp) => resp.data,
    enabled: !!id,
  });

export const usePortfolioCreateMutation = (
  options?: UseMutationOptions<BaseRESP<PortfolioRESP>, AxiosError<ErrorRESP>, PortfolioCreateREQ>,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: createPortfolioAPI,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: [PORTFOLIO_QUERY_KEYS.LIST] });
      options?.onSuccess?.(...args);
    },
  });
};

export const usePortfolioUpdateMutation = (
  options?: UseMutationOptions<BaseRESP<PortfolioRESP>, AxiosError<ErrorRESP>, PortfolioUpdateREQ>,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: updatePortfolioAPI,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: [PORTFOLIO_QUERY_KEYS.LIST] });
      queryClient.invalidateQueries({ queryKey: [PORTFOLIO_QUERY_KEYS.DETAIL] });
      options?.onSuccess?.(...args);
    },
  });
};

export const usePortfolioDeleteMutation = (options?: UseMutationOptions<BaseRESP<null>, AxiosError<ErrorRESP>, number>) => {
  const queryClient = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: deletePortfolioAPI,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: [PORTFOLIO_QUERY_KEYS.LIST] });
      options?.onSuccess?.(...args);
    },
  });
};

export const usePortfolioCategoryListQuery = (params?: PortfolioCategoryListREQ) =>
  useQuery({
    queryKey: [PORTFOLIO_QUERY_KEYS.CATEGORY_LIST, params],
    queryFn: () => getPortfolioCategoryListAPI(params),
    select: (resp): PortfolioCategoryItem[] =>
      Array.isArray(resp.data) ? (resp.data as PortfolioCategoryItem[]) : resp.data?.categories || [],
  });

export const usePortfolioCategoryCreateMutation = (
  options?: UseMutationOptions<BaseRESP<PortfolioCategoryDetailRESP>, AxiosError<ErrorRESP>, PortfolioCategoryUpsertREQ>,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: createPortfolioCategoryAPI,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: [PORTFOLIO_QUERY_KEYS.CATEGORY_LIST] });
      options?.onSuccess?.(...args);
    },
  });
};

export const usePortfolioCategoryUpdateMutation = (
  options?: UseMutationOptions<
    BaseRESP<PortfolioCategoryDetailRESP>,
    AxiosError<ErrorRESP>,
    { id: number | string; body: PortfolioCategoryUpsertREQ }
  >,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: ({ id, body }) => updatePortfolioCategoryAPI(id, body),
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: [PORTFOLIO_QUERY_KEYS.CATEGORY_LIST] });
      options?.onSuccess?.(...args);
    },
  });
};

export const usePortfolioCategoryDeleteMutation = (
  options?: UseMutationOptions<BaseRESP<null>, AxiosError<ErrorRESP>, number | string>,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: deletePortfolioCategoryAPI,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: [PORTFOLIO_QUERY_KEYS.CATEGORY_LIST] });
      options?.onSuccess?.(...args);
    },
  });
};
