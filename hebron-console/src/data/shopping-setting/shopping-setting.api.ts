import { api } from '@/api';
import type { BaseRESP } from '@/utils/types/response.type';
import type { ShoppingSettingUpdateREQ } from './shopping-setting.request';
import type { ShoppingSettingDetailRESP, ShoppingSettingListRESP } from './shopping-setting.response';

export const getShoppingSettingListAPI = (): Promise<BaseRESP<ShoppingSettingListRESP>> => api.get('/admin/shopping-settings');

export const getShoppingSettingDetailAPI = (id: number): Promise<BaseRESP<ShoppingSettingDetailRESP>> =>
  api.get(`/admin/shopping-settings/${id}`);

export const updateShoppingSettingAPI = ({
  id,
  ...body
}: ShoppingSettingUpdateREQ): Promise<BaseRESP<ShoppingSettingDetailRESP>> => api.put(`/admin/shopping-settings/${id}`, body);
