import { ERROR_MESSAGE } from '@/utils/constants/error-message.constant';
import type { DefaultValues } from 'react-hook-form';
import { z } from 'zod';

export const optionCreateSchema = z.object({
  name: z.string().trim().min(1, ERROR_MESSAGE.FIELD_REQUIRED),
  additional_price: z.number().int().min(0, ERROR_MESSAGE.FIELD_REQUIRED),
  additional_brand_site_price: z.number().int().min(0, ERROR_MESSAGE.FIELD_REQUIRED),
  sort_order: z.number().int().min(0, ERROR_MESSAGE.FIELD_REQUIRED),
  is_active: z.boolean(),
});

export type OptionCreateInput = z.infer<typeof optionCreateSchema>;

export const optionCreateInputDefault: DefaultValues<OptionCreateInput> = {
  name: '',
  additional_price: 0,
  additional_brand_site_price: 0,
  sort_order: 0,
  is_active: true,
};
