import { api } from '@/api';
import type { BaseRESP, PaginationRESP } from '@/utils/types/response.type';
import type { PortfolioListREQ } from './portfolios.request';
import type { BrandPortfolioBannerListRESP, PortfolioDetailRESP, PortfolioListRESP } from './portfolios.response';

const ENDPOINTS = {
  LIST: '/brand/portfolios',
  DETAIL: (id: number | string) => `/brand/portfolios/${id}`,
  BANNERS: '/brand/portfolios/banners',
} as const;

export const portfoliosAPI = {
  getList: (params?: PortfolioListREQ): Promise<PaginationRESP<PortfolioListRESP>> => api.get(ENDPOINTS.LIST, { params }),

  getDetail: (id: number | string): Promise<BaseRESP<PortfolioDetailRESP>> => api.get(ENDPOINTS.DETAIL(id)),

  getBanners: (): Promise<BaseRESP<BrandPortfolioBannerListRESP>> => api.get(ENDPOINTS.BANNERS),
};
