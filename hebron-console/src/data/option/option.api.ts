import { api } from '@/api';
import type { BaseRESP } from '@/utils/types/response.type';
import type { OptionCreateREQ, OptionListREQ, OptionUpdateREQ } from './option.request';
import type { ProductOptionsDetailRESP, ProductOptionsListRESP } from './option.response';

const ENDPOINT = {
  ROOT: '/admin/product-options',
};

export const getOptionListAPI = (params: OptionListREQ): Promise<BaseRESP<ProductOptionsListRESP>> =>
  api.get(ENDPOINT.ROOT, { params });

export const getOptionDetailAPI = (id: number): Promise<BaseRESP<ProductOptionsDetailRESP>> => api.get(`${ENDPOINT.ROOT}/${id}`);

export const createOptionAPI = (body: OptionCreateREQ): Promise<BaseRESP<ProductOptionsDetailRESP>> =>
  api.post(ENDPOINT.ROOT, body);

export const updateOptionAPI = ({ id, ...body }: OptionUpdateREQ): Promise<BaseRESP<ProductOptionsDetailRESP>> =>
  api.put(`${ENDPOINT.ROOT}/${id}`, body);

export const deleteOptionAPI = (id: number): Promise<BaseRESP<Record<string, never>>> => api.delete(`${ENDPOINT.ROOT}/${id}`);
