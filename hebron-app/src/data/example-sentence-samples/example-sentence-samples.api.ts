import { api } from '@/api';
import type { BaseRESP, PaginationRESP } from '@/utils/types/response.type';
import type { ExampleSentenceSampleListREQ } from './example-sentence-samples.request';
import type {
  ExampleSentenceSampleCategoryListRESP,
  ExampleSentenceSampleDetailRESP,
  ExampleSentenceSampleListRESP,
} from './example-sentence-samples.response';

const ENDPOINTS = {
  LIST: '/example-sentence-samples',
  CATEGORIES: '/example-sentence-samples/category',
  DETAIL: (id: number | string) => `/example-sentence-samples/${id}`,
} as const;

export const exampleSentenceSamplesAPI = {
  getList: (params?: ExampleSentenceSampleListREQ): Promise<PaginationRESP<ExampleSentenceSampleListRESP>> =>
    api.get(ENDPOINTS.LIST, { params }),
  getCategories: (): Promise<BaseRESP<ExampleSentenceSampleCategoryListRESP>> => api.get(ENDPOINTS.CATEGORIES),
  getDetail: (id: number | string): Promise<BaseRESP<ExampleSentenceSampleDetailRESP>> => api.get(ENDPOINTS.DETAIL(id)),
};
