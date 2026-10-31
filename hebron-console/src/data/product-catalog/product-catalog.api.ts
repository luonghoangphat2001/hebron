import { api } from '@/api';
import type { ExportExcelRESP } from '@/utils/types/export.type';
import type { BaseRESP } from '@/utils/types/response.type';
import { getLocalizedText } from '@/utils/helper/localized-text.helper';

import type {
  ErpOptionGroup,
  ExportHistory,
  ExportRequest,
  ProductCategory,
  ProductDetail,
  ProductListParams,
  ProductRow,
  ProductWrite,
  SizeOption,
  Template,
  TemplateBulkDelete,
  TemplateBulkResult,
  TemplateBulkUpdate,
  TemplateListParams,
  TemplatePreviewResult,
  TemplatePreviewSide,
  TemplateWrite,
} from './product-catalog.types';

type AnyRecord = Record<string, any>;

const asRecord = (value: unknown): AnyRecord => (value && typeof value === 'object' ? (value as AnyRecord) : {});
const body = (value: unknown): AnyRecord => {
  const root = asRecord(value);
  return asRecord(root.data ?? root);
};
const entity = <T>(value: unknown, keys: string[]): T => {
  const current: any = body(value);
  for (const key of keys) {
    if (current?.[key] !== undefined) return current[key] as T;
  }
  return current as T;
};

const normalizeList = <T>(value: unknown, itemKeys: string[]) => {
  const root = asRecord(value);
  const data = body(value);
  const nested = asRecord(data.data);
  const sources = [data, nested, root];
  let items: T[] = [];
  for (const source of sources) {
    for (const key of itemKeys) {
      if (Array.isArray(source[key])) {
        items = source[key] as T[];
        break;
      }
    }
    if (items.length) break;
  }
  const pagination = asRecord(data.pagination ?? nested.pagination ?? root.pagination);
  return {
    items,
    total: Number(pagination.total_item ?? pagination.total ?? pagination.total_count ?? items.length),
    page: Number(pagination.current_page ?? pagination.page ?? 1),
    perPage: Number(pagination.per_page ?? pagination.page_size ?? (items.length || 10)),
  };
};

const normalizeProduct = (value: AnyRecord): ProductDetail => {
  const rawStatus = asRecord(value.status).value ?? value.status;
  const status: ProductRow['status'] =
    rawStatus === 'sold' || rawStatus === 'hidden' ? rawStatus : value.is_active ? 'sold' : 'hidden';
  const categorySources = Array.isArray(value.categories)
    ? value.categories
    : value.category
      ? [value.category]
      : value.category_id !== undefined || value.category_name
        ? [{ id: value.category_id, name: value.category_name }]
        : [];
  const categories = categorySources.map<ProductCategory>((source) => {
    const category = asRecord(source);
    return {
      id: category.id === undefined || category.id === null ? undefined : Number(category.id),
      name: getLocalizedText(category.name, 'ko'),
      name_en: getLocalizedText(category.name, 'en'),
      slug: category.slug ? String(category.slug) : undefined,
    };
  });
  const categoryIds = Array.isArray(value.category_ids)
    ? value.category_ids.map(Number)
    : categories.flatMap((category) => (category.id === undefined ? [] : [category.id]));
  const primaryCategory = categories[0];
  return {
    ...value,
    id: Number(value.id),
    sku: String(value.sku || value.product_code || ''),
    name: getLocalizedText(value.name ?? value.product_name, 'ko'),
    name_en: getLocalizedText(value.name ?? value.product_name, 'en'),
    category_id: value.category_id ?? categoryIds[0],
    category_ids: categoryIds,
    category: primaryCategory,
    categories,
    images:
      Array.isArray(value.images) && value.images.length
        ? value.images.filter(Boolean).map(String)
        : value.first_image || value.thumbnail_url
          ? [String(value.first_image || value.thumbnail_url)]
          : [],
    is_active: value.is_active === undefined || value.is_active === null ? status === 'sold' : Boolean(value.is_active),
    status,
    created_at: String(value.created_at || ''),
    updated_at: value.updated_at ? String(value.updated_at) : undefined,
  } as ProductDetail;
};

const optionalNumber = (value: unknown) =>
  value === undefined || value === null || value === '' || Number.isNaN(Number(value)) ? undefined : Number(value);

const normalizeTemplate = (value: AnyRecord): Template => {
  const rawStatus = asRecord(value.status);
  const statusValue =
    rawStatus.value === 'active' || rawStatus.value === 'inactive' ? rawStatus.value : value.is_active ? 'active' : 'inactive';
  const product = asRecord(value.product);
  const productSources = Array.isArray(value.products) ? value.products : product.id === undefined ? [] : [product];
  const sizeOption = asRecord(value.size_option);
  const registrant = asRecord(value.registrant);
  const background = asRecord(value.background);
  const productId = optionalNumber(value.product_id);
  const products = productSources.map((source) => {
    const item = asRecord(source);
    return {
      id: Number(item.id),
      name: getLocalizedText(item.name, 'ko'),
      sku: item.sku === undefined || item.sku === null ? null : String(item.sku),
    };
  });
  const productIds = Array.isArray(value.product_ids)
    ? value.product_ids.map(Number)
    : products.map((item) => item.id).filter(Number.isFinite);
  const sizeOptionId = optionalNumber(value.size_option_id);

  return {
    ...value,
    id: Number(value.id),
    name: String(value.name || ''),
    product_id: productId ?? productIds[0] ?? null,
    product: products[0] ?? null,
    background_id: optionalNumber(value.background_id) ?? null,
    background:
      background.id === undefined
        ? null
        : {
            id: Number(background.id),
            image_path: String(background.image_path || ''),
            image_url: String(background.image_url || ''),
          },
    product_ids: productIds.length ? productIds : productId === undefined ? [] : [productId],
    products,
    ...(sizeOptionId === undefined ? {} : { size_option_id: sizeOptionId }),
    size_option:
      sizeOption.id === undefined
        ? undefined
        : {
            id: Number(sizeOption.id),
            name: String(sizeOption.name || ''),
            cutting_width: Number(sizeOption.cutting_width || 0),
            cutting_height: Number(sizeOption.cutting_height || 0),
            working_width: optionalNumber(sizeOption.working_width),
            working_height: optionalNumber(sizeOption.working_height),
            size_ratio: optionalNumber(sizeOption.size_ratio),
          },
    status: {
      value: statusValue,
      label: rawStatus.label === undefined || rawStatus.label === null ? undefined : String(rawStatus.label),
    },
    is_active: value.is_active === undefined || value.is_active === null ? statusValue === 'active' : Boolean(value.is_active),
    registrant:
      value.registrant === undefined || value.registrant === null
        ? undefined
        : typeof value.registrant === 'string'
          ? value.registrant
          : {
              id: optionalNumber(registrant.id),
              username: registrant.username === undefined ? undefined : String(registrant.username),
              name: registrant.name === undefined ? undefined : String(registrant.name),
            },
    preview_images: Array.isArray(value.preview_images) ? value.preview_images.filter(Boolean).map(String) : [],
    created_at: value.created_at ? String(value.created_at) : undefined,
    updated_at: value.updated_at ? String(value.updated_at) : undefined,
  } as Template;
};

const normalizeErpGroups = (groups: unknown): ErpOptionGroup[] =>
  (Array.isArray(groups) ? groups : []).map((value) => {
    const group = asRecord(value);
    const options = Array.isArray(group.options) ? group.options : Array.isArray(group.erp_options) ? group.erp_options : [];
    return {
      ...group,
      id: Number(group.id),
      code: String(group.code || ''),
      label: String(group.label || group.name || group.code || ''),
      display_type: String(group.display_type || 'select'),
      is_required: !!group.is_required,
      sort_order: Number(group.sort_order || 0),
      options: options.map((option) => {
        const record = asRecord(option);
        return {
          ...record,
          id: Number(record.id),
          additional_price: Number(record.additional_price ?? record.price ?? 0),
          sort_order: Number(record.sort_order || 0),
          is_active: record.is_active ?? true,
        };
      }),
    };
  });

export const productCatalogApi = {
  products: {
    list: async (params: ProductListParams) => {
      const list = normalizeList<AnyRecord>(await api.get('/admin/products', { params }), ['products', 'items', 'data']);
      return { ...list, items: list.items.map(normalizeProduct) as ProductRow[] };
    },
    detail: async (id: number) => normalizeProduct(entity<AnyRecord>(await api.get(`/admin/products/${id}`), ['product'])),
    create: async (payload: ProductWrite) =>
      normalizeProduct(entity<AnyRecord>(await api.post('/admin/products', payload), ['product'])),
    update: async (id: number, payload: ProductWrite) =>
      normalizeProduct(entity<AnyRecord>(await api.patch(`/admin/products/${id}`, payload), ['product'])),
    erpGroups: async () =>
      normalizeErpGroups(
        entity<unknown>(await api.get('/admin/products/erp-option-groups'), ['option_groups', 'erp_option_groups']),
      ),
    startExport: async (payload: ExportRequest) =>
      entity<ExportHistory>(await api.post('/admin/products/export-excel', payload), ['history']),
    exportProgress: async (historyId: number) =>
      entity<ExportHistory>(await api.get(`/admin/products/export-excel/${historyId}/check-progress-status`), ['history']),
  },
  templates: {
    list: async (params: TemplateListParams) => {
      const list = normalizeList<AnyRecord>(await api.get('/admin/templates', { params }), ['templates', 'items', 'data']);
      return { ...list, items: list.items.map(normalizeTemplate) };
    },
    detail: async (id: number) => normalizeTemplate(entity<AnyRecord>(await api.get(`/admin/templates/${id}`), ['template'])),
    create: async (payload: TemplateWrite) =>
      normalizeTemplate(entity<AnyRecord>(await api.post('/admin/templates', payload), ['template'])),
    update: async (id: number, payload: TemplateWrite) =>
      normalizeTemplate(entity<AnyRecord>(await api.patch(`/admin/templates/${id}`, payload), ['template'])),
    upsertPreview: async (id: number, side: TemplatePreviewSide, file: File) => {
      const form = new FormData();
      form.append('side', side);
      form.append('file', file);
      return body(await api.post(`/admin/templates/${id}/preview`, form)) as TemplatePreviewResult;
    },
    delete: async (id: number) => api.delete(`/admin/templates/${id}`),
    bulkUpdate: async (payload: TemplateBulkUpdate) =>
      entity<TemplateBulkResult>(await api.patch('/admin/templates/bulk', payload), ['result', 'bulk', 'data']),
    bulkDelete: async (payload: TemplateBulkDelete) =>
      entity<TemplateBulkResult>(await api.delete('/admin/templates/bulk', { data: payload }), ['result', 'bulk', 'data']),
    copyPreview: async (id: number) => body(await api.get(`/admin/templates/${id}/copy-preview`)),
    copy: async (id: number, payload: { copy_title: string; copy_layers: boolean }) =>
      normalizeTemplate(entity<AnyRecord>(await api.post(`/admin/templates/${id}/copy`, payload), ['template'])),
    startExport: async (payload: ExportRequest) =>
      entity<ExportHistory>(await api.post('/admin/templates/export-excel', payload), ['history']),
    exportProgress: async (historyId: number) =>
      entity<ExportHistory>(await api.get(`/admin/templates/export-excel/${historyId}/check-progress-status`), ['history']),
    startExportResponse: async (payload: ExportRequest): Promise<BaseRESP<ExportExcelRESP>> =>
      api.post('/admin/templates/export-excel', payload),
    exportProgressResponse: async (historyId: number): Promise<BaseRESP<ExportExcelRESP>> =>
      api.get(`/admin/templates/export-excel/${historyId}/check-progress-status`),
    downloadExport: async (historyId: number) =>
      api.get(`/admin/templates/export-excel/${historyId}/download`, { responseType: 'blob' }) as Promise<Blob>,
  },
  sizeOptions: {
    list: async () =>
      normalizeList<SizeOption>(await api.get('/admin/size-options', { params: { page: 1, per_page: 100 } }), [
        'size_options',
        'items',
        'data',
      ]).items,
    detail: async (id: number) => entity<SizeOption>(await api.get(`/admin/size-options/${id}`), ['size_option']),
  },
};
