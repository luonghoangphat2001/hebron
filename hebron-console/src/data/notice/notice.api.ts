import { api } from '@/api';
import type { BaseRESP, PaginationRESP } from '@/utils/types/response.type';
import type {
  NoticeCategoryListREQ,
  NoticeCategoryUpsertREQ,
  NoticeCreateREQ,
  NoticeListREQ,
  NoticeUpdateREQ,
} from './notice.request';
import type {
  NoticeCategoryDetailRESP,
  NoticeCategoryListRESP,
  NoticeCreateRESP,
  NoticeDetailRESP,
  NoticeListRESP,
} from './notice.response';

const CATEGORY_ENDPOINT = '/admin/notices/category';

export const getNoticeListAPI = (params: NoticeListREQ): Promise<PaginationRESP<NoticeListRESP>> =>
  api.get('/admin/notices', { params });

export const getNoticeDetailAPI = (id: number): Promise<BaseRESP<NoticeDetailRESP>> => api.get(`/admin/notices/${id}`);

export const createNoticeAPI = (body: NoticeCreateREQ): Promise<BaseRESP<NoticeCreateRESP>> => api.post('/admin/notices', body);

export const updateNoticeAPI = ({ id, ...body }: NoticeUpdateREQ): Promise<BaseRESP<NoticeCreateRESP>> =>
  api.put(`/admin/notices/${id}`, body);

export const deleteNoticeAPI = (id: number): Promise<BaseRESP<Record<string, never>>> => api.delete(`/admin/notices/${id}`);

export const getNoticeCategoryListAPI = (params?: NoticeCategoryListREQ): Promise<BaseRESP<NoticeCategoryListRESP>> =>
  api.get(CATEGORY_ENDPOINT, { params });

export const createNoticeCategoryAPI = (body: NoticeCategoryUpsertREQ): Promise<BaseRESP<NoticeCategoryDetailRESP>> =>
  api.post(CATEGORY_ENDPOINT, body);

export const updateNoticeCategoryAPI = (
  id: number | string,
  body: NoticeCategoryUpsertREQ,
): Promise<BaseRESP<NoticeCategoryDetailRESP>> => api.put(`${CATEGORY_ENDPOINT}/${id}`, body);

export const deleteNoticeCategoryAPI = (id: number | string): Promise<BaseRESP<null>> => api.delete(`${CATEGORY_ENDPOINT}/${id}`);
