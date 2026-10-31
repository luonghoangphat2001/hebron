import { api } from '@/api';
import type { BaseRESP, PaginationRESP } from '@/utils/types/response.type';
import type {
  PortfolioCategoryListREQ,
  PortfolioCategoryUpsertREQ,
  PortfolioCreateREQ,
  PortfolioListREQ,
  PortfolioUpdateREQ,
} from './portfolio.request';
import type { PortfolioCategoryDetailRESP, PortfolioCategoryListRESP, PortfolioList, PortfolioRESP } from './portfolio.response';

const ENDPOINTS = {
  ROOT: '/admin/portfolios',
  CATEGORY: '/admin/portfolios/category',
};

export const getPortfolioListAPI = (params: PortfolioListREQ): Promise<PaginationRESP<PortfolioList>> =>
  api.get(ENDPOINTS.ROOT, { params });

export const getPortfolioDetailAPI = (id: number): Promise<BaseRESP<PortfolioRESP>> => api.get(`${ENDPOINTS.ROOT}/${id}`);

export const createPortfolioAPI = (body: PortfolioCreateREQ): Promise<BaseRESP<PortfolioRESP>> => api.post(ENDPOINTS.ROOT, body);

export const updatePortfolioAPI = (body: PortfolioUpdateREQ): Promise<BaseRESP<PortfolioRESP>> =>
  api.put(`${ENDPOINTS.ROOT}/${body.id}`, body);

export const deletePortfolioAPI = (id: number): Promise<BaseRESP<null>> => api.delete(`${ENDPOINTS.ROOT}/${id}`);

export const getPortfolioCategoryListAPI = (params?: PortfolioCategoryListREQ): Promise<BaseRESP<PortfolioCategoryListRESP>> =>
  api.get(ENDPOINTS.CATEGORY, { params });

export const createPortfolioCategoryAPI = (body: PortfolioCategoryUpsertREQ): Promise<BaseRESP<PortfolioCategoryDetailRESP>> =>
  api.post(ENDPOINTS.CATEGORY, body);

export const updatePortfolioCategoryAPI = (
  id: number | string,
  body: PortfolioCategoryUpsertREQ,
): Promise<BaseRESP<PortfolioCategoryDetailRESP>> => api.put(`${ENDPOINTS.CATEGORY}/${id}`, body);

export const deletePortfolioCategoryAPI = (id: number | string): Promise<BaseRESP<null>> =>
  api.delete(`${ENDPOINTS.CATEGORY}/${id}`);
