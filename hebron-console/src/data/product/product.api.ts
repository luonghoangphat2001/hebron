import { api } from '@/api';
import type { ExportExcelRESP } from '@/utils/types/export.type';
import type { BaseRESP, PaginationRESP } from '@/utils/types/response.type';
import type {
  ProductBulkDeleteREQ,
  ProductBulkStatusREQ,
  ProductBulkUpdateREQ,
  ProductCopyREQ,
  ProductCreateREQ,
  ProductExportExcelREQ,
  ProductListREQ,
  ProductMesSettingsREQ,
  ProductUpdateREQ,
} from './product.request';
import { PRODUCT_IMAGE_FIELD } from './product.request';
import type {
  ProductBulkDeleteRESP,
  ProductBulkStatusRESP,
  ProductBulkUpdateRESP,
  ProductCopyPreviewRESP,
  ProductDetailRESP,
  ProductListRESP,
  ProductSearchFiltersRESP,
  ProductUploadImagesRESP,
} from './product.response';
import { PRODUCT_IMAGE_MAX_COUNT } from '@/utils/constants/attachment.constant';

const ENDPOINT = {
  ROOT: '/admin/products',
  SEARCH_FILTERS: '/admin/products/search-filters',
  UPLOAD_IMAGES: '/admin/products/upload-images',
  EXPORT_EXCEL: '/admin/products/export-excel',
  BULK: '/admin/products/bulk',
};

export const getProductListAPI = (params: ProductListREQ): Promise<PaginationRESP<ProductListRESP>> =>
  api.get(ENDPOINT.ROOT, { params });

export const getProductDetailAPI = (id: number): Promise<BaseRESP<ProductDetailRESP>> => api.get(`${ENDPOINT.ROOT}/${id}`);

export const createProductAPI = (body: ProductCreateREQ): Promise<BaseRESP<ProductDetailRESP>> => api.post(ENDPOINT.ROOT, body);

export const updateProductAPI = ({ id, ...body }: ProductUpdateREQ): Promise<BaseRESP<ProductDetailRESP>> =>
  api.put(`${ENDPOINT.ROOT}/${id}`, body);

export const deleteProductAPI = (id: number): Promise<BaseRESP<Record<string, never>>> => api.delete(`${ENDPOINT.ROOT}/${id}`);

export const getProductSearchFiltersAPI = (): Promise<BaseRESP<ProductSearchFiltersRESP>> => api.get(ENDPOINT.SEARCH_FILTERS);

export const uploadProductImagesAPI = (files: File[]): Promise<BaseRESP<ProductUploadImagesRESP>> => {
  if (files.length > PRODUCT_IMAGE_MAX_COUNT) throw new Error(`Maximum ${PRODUCT_IMAGE_MAX_COUNT} images`);

  const formData = new FormData();
  files.forEach((file) => formData.append(PRODUCT_IMAGE_FIELD, file));

  return api.post(ENDPOINT.UPLOAD_IMAGES, formData);
};

export const exportProductExcelAPI = (body: ProductExportExcelREQ): Promise<BaseRESP<ExportExcelRESP>> =>
  api.post(ENDPOINT.EXPORT_EXCEL, body);

export const getProductExportProgressAPI = (historyId: number): Promise<BaseRESP<ExportExcelRESP>> =>
  api.get(`${ENDPOINT.EXPORT_EXCEL}/${historyId}/check-progress-status`);

export const downloadProductExcelAPI = (historyId: number): Promise<Blob> =>
  api.get(`${ENDPOINT.EXPORT_EXCEL}/${historyId}/download`, { responseType: 'blob' });

export const getProductCopyPreviewAPI = (id: number): Promise<BaseRESP<ProductCopyPreviewRESP>> =>
  api.get(`${ENDPOINT.ROOT}/${id}/copy-preview`);

export const copyProductAPI = ({ id, ...body }: ProductCopyREQ): Promise<BaseRESP<ProductDetailRESP>> =>
  api.post(`${ENDPOINT.ROOT}/${id}/copy`, body);

export const bulkUpdateProductStatusAPI = (body: ProductBulkStatusREQ): Promise<BaseRESP<ProductBulkStatusRESP>> =>
  api.patch(`${ENDPOINT.BULK}/status`, body);

export const bulkDeleteProductsAPI = (body: ProductBulkDeleteREQ): Promise<BaseRESP<ProductBulkDeleteRESP>> =>
  api.delete(ENDPOINT.BULK, { data: body });

export const updateProductMesSettingsAPI = ({ id, ...body }: ProductMesSettingsREQ): Promise<BaseRESP<ProductDetailRESP>> =>
  api.patch(`${ENDPOINT.ROOT}/${id}/mes-settings`, body);

export const bulkUpdateProductsAPI = (body: ProductBulkUpdateREQ): Promise<BaseRESP<ProductBulkUpdateRESP>> =>
  api.patch(ENDPOINT.BULK, body);
