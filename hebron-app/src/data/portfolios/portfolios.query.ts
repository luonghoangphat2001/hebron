import type { BaseRESP, ErrorRESP, PaginationRESP } from '@/utils/types/response.type';
import { keepPreviousData, useQuery, type UseQueryOptions } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { portfoliosAPI } from './portfolios.api';
import type { PortfolioListREQ } from './portfolios.request';
import type { BrandPortfolioBannerListRESP, PortfolioDetailRESP, PortfolioListRESP } from './portfolios.response';

export const PORTFOLIO_QUERY_KEYS = {
  all: ['portfolios'] as const,
  lists: () => [...PORTFOLIO_QUERY_KEYS.all, 'list'] as const,
  list: (params?: PortfolioListREQ) => [...PORTFOLIO_QUERY_KEYS.lists(), params] as const,
  details: () => [...PORTFOLIO_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: number | string) => [...PORTFOLIO_QUERY_KEYS.details(), id] as const,
  banners: () => [...PORTFOLIO_QUERY_KEYS.all, 'banners'] as const,
};

export const usePortfoliosQuery = (
  params?: PortfolioListREQ,
  options?: Omit<UseQueryOptions<PaginationRESP<PortfolioListRESP>, AxiosError<ErrorRESP>>, 'queryKey' | 'queryFn'>,
) =>
  useQuery({
    queryKey: PORTFOLIO_QUERY_KEYS.list(params),
    queryFn: () => portfoliosAPI.getList(params),
    placeholderData: keepPreviousData,
    ...options,
  });

export const usePortfolioDetailQuery = (
  id: number | string,
  options?: Omit<UseQueryOptions<BaseRESP<PortfolioDetailRESP>, AxiosError<ErrorRESP>>, 'queryKey' | 'queryFn'>,
) =>
  useQuery({
    queryKey: PORTFOLIO_QUERY_KEYS.detail(id),
    queryFn: () => portfoliosAPI.getDetail(id),
    enabled: Boolean(id),
    ...options,
  });

export const useBrandPortfolioBannersQuery = (
  options?: Omit<UseQueryOptions<BaseRESP<BrandPortfolioBannerListRESP>, AxiosError<ErrorRESP>>, 'queryKey' | 'queryFn'>,
) =>
  useQuery({
    queryKey: PORTFOLIO_QUERY_KEYS.banners(),
    queryFn: portfoliosAPI.getBanners,
    ...options,
  });
