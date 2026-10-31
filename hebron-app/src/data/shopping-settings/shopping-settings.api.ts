import { api } from '@/api';
import type { BaseRESP } from '@/utils/types/response.type';

export type ShoppingSetting = {
  id: number;
  title: string;
  content: string;
  type: string;
  created_at: string;
  updated_at: string;
};

type ShoppingSettingsRESP = {
  shopping_settings: ShoppingSetting[];
};

export const shoppingSettingsAPI = {
  list: (): Promise<BaseRESP<ShoppingSettingsRESP>> => api.get('/shopping-settings'),
};
