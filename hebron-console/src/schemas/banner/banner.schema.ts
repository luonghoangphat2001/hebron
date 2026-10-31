import { ERROR_MESSAGE } from '@/utils/constants/error-message.constant';
import { BannerLocation } from '@/utils/enums/banner.enum';
import { ExposureStatus, PageType, SiteType } from '@/utils/enums/common.enum';
import type { DefaultValues } from 'react-hook-form';
import { z } from 'zod';

export const bannerUpsertSchema = z.object({
  name: z.string().min(1, ERROR_MESSAGE.FIELD_REQUIRED),
  image_path: z.string({ error: ERROR_MESSAGE.FIELD_REQUIRED }).min(1, ERROR_MESSAGE.FIELD_REQUIRED),
  image_path_mobile: z.string().nullish(),
  link_url: z.string().optional().default(''),
  exposure_location: z.nativeEnum(BannerLocation).optional(),
  site_type: z.nativeEnum(SiteType, { error: ERROR_MESSAGE.FIELD_REQUIRED }),
  page_type: z.nativeEnum(PageType, { error: ERROR_MESSAGE.FIELD_REQUIRED }),
  status: z.nativeEnum(ExposureStatus, { error: ERROR_MESSAGE.FIELD_REQUIRED }),
  sort_order: z.number({ error: ERROR_MESSAGE.FIELD_REQUIRED }).min(1, ERROR_MESSAGE.FIELD_REQUIRED),
  exposure_start_date: z.string().min(1, ERROR_MESSAGE.FIELD_REQUIRED),
  exposure_end_date: z.string().min(1, ERROR_MESSAGE.FIELD_REQUIRED),
});

export type BannerInput = z.infer<typeof bannerUpsertSchema>;

export const bannerInputDefault: DefaultValues<BannerInput> = {
  name: '',
  image_path: '',
  image_path_mobile: null,
  link_url: '',
  exposure_location: undefined,
  site_type: SiteType.SHOPPING_MALL,
  page_type: PageType.HOME_PAGE,
  status: ExposureStatus.EXPOSED,
  sort_order: 1,
  exposure_start_date: '',
  exposure_end_date: '',
};
