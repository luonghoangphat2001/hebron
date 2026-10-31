import { api } from '@/api';
import type { Background, BackgroundListParams, BackgroundListResult, BackgroundWrite } from './background.types';

type AnyRecord = Record<string, any>;
const record = (value: unknown): AnyRecord => (value && typeof value === 'object' ? (value as AnyRecord) : {});
const data = (value: unknown) => record(record(value).data ?? value);

const normalizeBackground = (value: unknown): Background => {
  const item = record(value);
  return {
    id: Number(item.id),
    image_path: String(item.image_path || ''),
    image_url: String(item.image_url || ''),
    template_count: Number(item.template_count || 0),
    created_by: item.created_by == null ? null : Number(item.created_by),
    created_at: item.created_at ? String(item.created_at) : null,
    updated_at: item.updated_at ? String(item.updated_at) : null,
  };
};

export const backgroundApi = {
  list: async (params: BackgroundListParams): Promise<BackgroundListResult> => {
    const response = record(await api.get('/admin/backgrounds', { params }));
    const payload = data(response);
    const pagination = record(response.pagination ?? payload.pagination);
    const items = Array.isArray(payload.backgrounds) ? payload.backgrounds.map(normalizeBackground) : [];
    return {
      items,
      page: Number(pagination.current_page || params.page),
      perPage: Number(pagination.per_page || params.per_page),
      total: Number(pagination.total_item || items.length),
      totalPages: Number(pagination.total_page || 1),
    };
  },
  create: async (payload: BackgroundWrite) => normalizeBackground(data(await api.post('/admin/backgrounds', payload)).background),
  update: async (id: number, payload: Partial<BackgroundWrite>) =>
    normalizeBackground(data(await api.patch(`/admin/backgrounds/${id}`, payload)).background),
  delete: async (id: number) => api.delete(`/admin/backgrounds/${id}`),
  bulkDelete: async (backgroundIds: number[]) =>
    api.delete('/admin/backgrounds/bulk', { data: { background_ids: backgroundIds } }),
};
