import { api } from '@/api';
import type { ExportExcelRESP } from '@/utils/types/export.type';
import type { BaseRESP } from '@/utils/types/response.type';
import type {
  OptionGroupAssignProductsREQ,
  OptionGroupCreateREQ,
  OptionGroupExportExcelREQ,
  OptionGroupListREQ,
  OptionGroupUpdateREQ,
} from './option-group.request';
import type { ProductOptionGroupsDetailRESP, ProductOptionGroupsListRESP } from './option-group.response';

const ENDPOINT = {
  ROOT: '/admin/product-option-groups',
};

export const getOptionGroupListAPI = (params: OptionGroupListREQ): Promise<BaseRESP<ProductOptionGroupsListRESP>> =>
  api.get(ENDPOINT.ROOT, { params });

export const getOptionGroupDetailAPI = (id: number): Promise<BaseRESP<ProductOptionGroupsDetailRESP>> =>
  api.get(`${ENDPOINT.ROOT}/${id}`);

export const createOptionGroupAPI = (body: OptionGroupCreateREQ): Promise<BaseRESP<ProductOptionGroupsDetailRESP>> =>
  api.post(ENDPOINT.ROOT, body);

export const updateOptionGroupAPI = ({ id, ...body }: OptionGroupUpdateREQ): Promise<BaseRESP<ProductOptionGroupsDetailRESP>> =>
  api.put(`${ENDPOINT.ROOT}/${id}`, body);

export const deleteOptionGroupAPI = (id: number): Promise<BaseRESP<Record<string, never>>> =>
  api.delete(`${ENDPOINT.ROOT}/${id}`);

export const assignOptionGroupProductsAPI = ({
  id,
  ...body
}: OptionGroupAssignProductsREQ): Promise<BaseRESP<ProductOptionGroupsDetailRESP>> =>
  api.post(`${ENDPOINT.ROOT}/${id}/assign-products`, body);

export const exportOptionGroupExcelAPI = (body: OptionGroupExportExcelREQ): Promise<BaseRESP<ExportExcelRESP>> =>
  api.post(`${ENDPOINT.ROOT}/export-excel`, body);

export const getOptionGroupExportProgressAPI = (historyId: number): Promise<BaseRESP<ExportExcelRESP>> =>
  api.get(`${ENDPOINT.ROOT}/export-excel/${historyId}/check-progress-status`);

export const downloadOptionGroupExcelAPI = (historyId: number): Promise<Blob> =>
  api.get(`${ENDPOINT.ROOT}/export-excel/${historyId}/download`, { responseType: 'blob' });
