import { ERROR_MESSAGE } from '@/utils/constants/error-message.constant';
import { SiteType } from '@/utils/enums/common.enum';
import type { DefaultValues } from 'react-hook-form';
import { z } from 'zod';

export const mediaCreateSchema = z.object({
  site_type: z.nativeEnum(SiteType, { error: ERROR_MESSAGE.FIELD_REQUIRED }),
  category_id: z.coerce.number().min(1, ERROR_MESSAGE.FIELD_REQUIRED),
  title: z.string().trim().min(1, ERROR_MESSAGE.FIELD_REQUIRED),
  description: z.string().nullish(),
  thumbnail_path: z.string().nullish(),
  link_url: z.string().nullish(),
  sort_order: z.coerce.number().default(0),
  is_active: z.boolean().default(true),
});

export type MediaInput = z.infer<typeof mediaCreateSchema>;

export const mediaInputDefault: DefaultValues<MediaInput> = {
  site_type: SiteType.BRAND_SITE,
  category_id: 0,
  title: '',
  description: null,
  thumbnail_path: null,
  link_url: null,
  sort_order: 0,
  is_active: true,
};
