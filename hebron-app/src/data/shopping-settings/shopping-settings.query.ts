import { useQuery } from '@tanstack/react-query';
import { shoppingSettingsAPI } from './shopping-settings.api';

const SHOPPING_SETTING_ORDER = [
  'General Precautions',
  'General Production Guide',
  'Shipment & Delivery Information',
  'User Guide',
];

export const useShoppingSettingsQuery = () =>
  useQuery({
    queryKey: ['shopping-settings'],
    queryFn: shoppingSettingsAPI.list,
    select: (response) =>
      [...response.data.shopping_settings].sort(
        (left, right) => SHOPPING_SETTING_ORDER.indexOf(left.type) - SHOPPING_SETTING_ORDER.indexOf(right.type),
      ),
  });
