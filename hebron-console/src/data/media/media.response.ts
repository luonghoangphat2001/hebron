import type { SiteType } from '@/utils/enums/common.enum';

export type MediaCategory = {
  id: number;
  name: string;
  slug?: string | null;
  site_type: SiteType;
  sort_order: number;
  is_active: boolean;
};

export type Media = {
  id: number;
  site_type: SiteType;
  category_id: number;
  category?: MediaCategory | null;
  title: string;
  description: string | null;
  url: string | null;
  image_url: string | null;
  link_url: string | null;
  sort_order: number;
  is_active: boolean;
};

export type MediaListRESP = {
  media: Media[];
};

export type MediaDetailRESP = {
  media: Media;
};

export type MediaCategoryListRESP = {
  categories: MediaCategory[];
};

export type MediaCategoryDetailRESP = {
  category: MediaCategory;
};
