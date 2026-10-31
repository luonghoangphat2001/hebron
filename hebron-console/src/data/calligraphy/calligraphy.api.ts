import { api } from '@/api';
import type {
  Calligraphy,
  CalligraphyListParams,
  CalligraphyListResult,
  CalligraphyType,
  CalligraphyWrite,
} from './calligraphy.types';

type AnyRecord = Record<string, any>;
const record = (value: unknown): AnyRecord => (value && typeof value === 'object' ? (value as AnyRecord) : {});
const data = (value: unknown) => record(record(value).data ?? value);

const normalizeCalligraphy = (value: unknown): Calligraphy => {
  const item = record(value);
  return {
    id: Number(item.id),
    image_path: String(item.image_path || ''),
    image_url: String(item.image_url || ''),
    type: item.type as CalligraphyType,
    type_label: String(item.type_label || item.type || ''),
    text: item.text == null ? null : String(item.text),
    created_by: item.created_by == null ? null : Number(item.created_by),
    created_at: item.created_at ? String(item.created_at) : null,
    updated_at: item.updated_at ? String(item.updated_at) : null,
  };
};

export const calligraphyApi = {
  list: async (params: CalligraphyListParams): Promise<CalligraphyListResult> => {
    const response = record(await api.get('/admin/calligraphies', { params }));
    const payload = data(response);
    const pagination = record(response.pagination ?? payload.pagination);
    const items = Array.isArray(payload.calligraphies) ? payload.calligraphies.map(normalizeCalligraphy) : [];
    return {
      items,
      page: Number(pagination.current_page || params.page),
      perPage: Number(pagination.per_page || params.per_page),
      total: Number(pagination.total_item || items.length),
      totalPages: Number(pagination.total_page || 1),
    };
  },
  create: async (payload: CalligraphyWrite) =>
    normalizeCalligraphy(data(await api.post('/admin/calligraphies', payload)).calligraphy),
  update: async (id: number, payload: Partial<CalligraphyWrite>) =>
    normalizeCalligraphy(data(await api.patch(`/admin/calligraphies/${id}`, payload)).calligraphy),
  bulkUpdateType: async (ids: number[], value: CalligraphyType) =>
    api.patch('/admin/calligraphies/bulk', { calligraphy_ids: ids, field: 'type', value }),
  bulkDelete: async (ids: number[]) => api.delete('/admin/calligraphies/bulk', { data: { calligraphy_ids: ids } }),
};
