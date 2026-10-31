import { api } from '@/api';
import type { BaseRESP, PaginationRESP } from '@/utils/types/response.type';
import type {
  ExampleSentenceSampleCategoryUpdateREQ,
  ExampleSentenceSampleCategoryUpsertREQ,
  ExampleSentenceSampleCategoryListREQ,
  ExampleSentenceSampleListREQ,
  ExampleSentenceSampleUpdateREQ,
  ExampleSentenceSampleUpsertREQ,
} from './example-sentence-sample.request';
import type {
  ExampleSentenceSampleCategoryDetailRESP,
  ExampleSentenceSampleCategoryListRESP,
  ExampleSentenceSampleDetailRESP,
  ExampleSentenceSampleListRESP,
} from './example-sentence-sample.response';

const ENDPOINT = '/admin/example-sentence-samples';

export const getExampleSentenceSampleListAPI = (
  params: ExampleSentenceSampleListREQ,
): Promise<PaginationRESP<ExampleSentenceSampleListRESP>> => api.get(ENDPOINT, { params });

export const getExampleSentenceSampleDetailAPI = (id: number): Promise<BaseRESP<ExampleSentenceSampleDetailRESP>> =>
  api.get(`${ENDPOINT}/${id}`);

export const createExampleSentenceSampleAPI = (
  body: ExampleSentenceSampleUpsertREQ,
): Promise<BaseRESP<ExampleSentenceSampleDetailRESP>> => api.post(ENDPOINT, body);

export const updateExampleSentenceSampleAPI = ({
  id,
  ...body
}: ExampleSentenceSampleUpdateREQ): Promise<BaseRESP<ExampleSentenceSampleDetailRESP>> => api.put(`${ENDPOINT}/${id}`, body);

export const deleteExampleSentenceSampleAPI = (id: number): Promise<BaseRESP<Record<string, never>>> =>
  api.delete(`${ENDPOINT}/${id}`);

export const getExampleSentenceSampleCategoryListAPI = (
  params: ExampleSentenceSampleCategoryListREQ,
): Promise<PaginationRESP<ExampleSentenceSampleCategoryListRESP>> => api.get(`${ENDPOINT}/category`, { params });

export const getExampleSentenceSampleCategoryDetailAPI = (
  id: number,
): Promise<BaseRESP<ExampleSentenceSampleCategoryDetailRESP>> => api.get(`${ENDPOINT}/category/${id}`);

export const createExampleSentenceSampleCategoryAPI = (
  body: ExampleSentenceSampleCategoryUpsertREQ,
): Promise<BaseRESP<ExampleSentenceSampleCategoryDetailRESP>> => api.post(`${ENDPOINT}/category`, body);

export const updateExampleSentenceSampleCategoryAPI = ({
  id,
  ...body
}: ExampleSentenceSampleCategoryUpdateREQ): Promise<BaseRESP<ExampleSentenceSampleCategoryDetailRESP>> =>
  api.put(`${ENDPOINT}/category/${id}`, body);

export const deleteExampleSentenceSampleCategoryAPI = (id: number): Promise<BaseRESP<Record<string, never>>> =>
  api.delete(`${ENDPOINT}/category/${id}`);
