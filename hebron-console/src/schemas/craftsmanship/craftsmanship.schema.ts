import { ERROR_MESSAGE } from '@/utils/constants/error-message.constant';
import type { DefaultValues } from 'react-hook-form';
import { z } from 'zod';

export const craftsmanshipUpsertSchema = z.object({
  title: z.string().min(1, ERROR_MESSAGE.FIELD_REQUIRED),
  subtitle: z.string().nullish(),
  image_url: z.string().nullish(),
  description: z.string().nullish(),
  sort_order: z.coerce.number().default(0),
  is_active: z.boolean().default(true),
  product_ids: z.array(z.number()).default([]),
});

export type CraftsmanshipInput = z.infer<typeof craftsmanshipUpsertSchema>;

export const craftsmanshipInputDefault: DefaultValues<CraftsmanshipInput> = {
  title: '',
  subtitle: null,
  image_url: null,
  description: null,
  sort_order: 0,
  is_active: true,
  product_ids: [],
};
