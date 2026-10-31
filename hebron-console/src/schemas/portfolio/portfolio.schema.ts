import { SiteType } from '@/utils/enums/common.enum';
import { z } from 'zod';

export const portfolioUpsertSchema = z.object({
  site_type: z.enum(SiteType, { error: 'Site type is required' }),
  title: z.string().min(1, 'Title is required'),
  client: z.string().min(1, 'Client name is required'),
  category: z.string().min(1, 'Category is required'),
  year: z.number({ error: 'Year is required' }).int().min(2000, 'Year must be 2000 or later').max(2100),
  description: z.string().min(1, 'Description is required'),
  cover_image: z.string().optional().default(''),
  is_featured: z.boolean().default(false),
  is_active: z.boolean().optional(),
  sort_order: z.number().int().min(1).default(1),
});

export type PortfolioInput = z.infer<typeof portfolioUpsertSchema>;

export const portfolioInputDefault: PortfolioInput = {
  site_type: SiteType.BRAND_SITE,
  title: '',
  client: '',
  category: '',
  year: new Date().getFullYear(),
  description: '',
  cover_image: '',
  is_featured: false,
  sort_order: 1,
};
