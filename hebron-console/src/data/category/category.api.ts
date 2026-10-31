import { api } from '@/api';
import type { ExportExcelRESP } from '@/utils/types/export.type';
import type { BaseRESP, PaginationRESP } from '@/utils/types/response.type';
import type {
  CategoryCreateREQ,
  CategoryExportExcelREQ,
  CategoryExposureInfoREQ,
  CategoryListREQ,
  CategoryProductListREQ,
  CategoryProductPositionREQ,
  CategoryUpdateInfoREQ,
  CategoryUpdateSortOrderREQ,
  CategoryUploadExposureImage,
} from './category.request';
import type { CateGoryDetailRESP, CateGoryListRESP, CategoryProductListRESP } from './category.response';

const ENDPOINT = {
  ROOT: '/admin/categories',
};

export const getCategoryListAPI = (params: CategoryListREQ): Promise<PaginationRESP<CateGoryListRESP>> =>
  api.get(ENDPOINT.ROOT, { params });

export const getCategoryDetailAPI = (id: number): Promise<BaseRESP<CateGoryDetailRESP>> => api.get(`${ENDPOINT.ROOT}/${id}`);

export const createCategoryAPI = (body: CategoryCreateREQ): Promise<BaseRESP<CateGoryDetailRESP>> =>
  api.post(ENDPOINT.ROOT, body);

export const updateCategoryAPI = (body: CategoryUpdateInfoREQ): Promise<BaseRESP<CateGoryDetailRESP>> =>
  api.put(`${ENDPOINT.ROOT}/${body.id}`, body);

export const updateCategoryExposureAPI = (id: number, body: CategoryExposureInfoREQ): Promise<BaseRESP<CateGoryDetailRESP>> =>
  api.put(`${ENDPOINT.ROOT}/${id}/exposure`, body);

export const updateCategoryParentAPI = (id: number, parent_id: number | null): Promise<BaseRESP<CateGoryDetailRESP>> =>
  api.put(`${ENDPOINT.ROOT}/${id}`, { parent_id });

export const updateCategorySortOrderAPI = (body: CategoryUpdateSortOrderREQ) => api.put(`${ENDPOINT.ROOT}/sort-order`, body);

export const deleteCategoryAPI = (id: number): Promise<BaseRESP<null>> => api.delete(`${ENDPOINT.ROOT}/${id}`);

export const getCategoryProductsAPI = (
  id: number,
  params: CategoryProductListREQ,
): Promise<PaginationRESP<CategoryProductListRESP>> => api.get(`${ENDPOINT.ROOT}/${id}/products`, { params });

export const updateCategoryProductPositionAPI = ({
  categoryId,
  productId,
  position,
}: CategoryProductPositionREQ): Promise<BaseRESP<unknown>> =>
  api.patch(`${ENDPOINT.ROOT}/${categoryId}/products/${productId}/position`, { position });

export const uploadCategoryExposureImageAPI = (
  body: CategoryUploadExposureImage,
): Promise<BaseRESP<{ path: string; url: string }>> => {
  const formData = new FormData();
  formData.append('file', body.file);
  formData.append('type', body.type);

  return api.post(`${ENDPOINT.ROOT}/upload-exposure-image`, formData);
};

export const exportCategoryExcelAPI = (body: CategoryExportExcelREQ): Promise<BaseRESP<ExportExcelRESP>> =>
  api.post(`${ENDPOINT.ROOT}/export-excel`, body);

export const getCategoryExportProgressAPI = (historyId: number): Promise<BaseRESP<ExportExcelRESP>> =>
  api.get(`${ENDPOINT.ROOT}/export-excel/${historyId}/check-progress-status`);

export const downloadCategoryExportAPI = (historyId: number): Promise<Blob> =>
  api.get(`${ENDPOINT.ROOT}/export-excel/${historyId}/download`, { responseType: 'blob' });
