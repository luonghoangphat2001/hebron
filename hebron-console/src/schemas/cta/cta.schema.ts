import { SiteType } from '@/utils/enums/common.enum';
import type { DefaultValues } from 'react-hook-form';
import { z } from 'zod';

export const aboutCtaItemSchema = z.object({
  product_id: z.number(),
  image: z.string(),
  name: z.string().optional(),
  sku: z.string().optional(),
});

export const aboutCtaUpsertSchema = z.object({
  site_type: z.nativeEnum(SiteType),
  item: z.array(aboutCtaItemSchema).max(20).default([]),
});

export type AboutCtaItemInput = z.infer<typeof aboutCtaItemSchema>;
export type AboutCtaInput = z.infer<typeof aboutCtaUpsertSchema>;

export const aboutCtaInputDefault: DefaultValues<AboutCtaInput> = {
  site_type: SiteType.BRAND_SITE,
  item: [],
};
