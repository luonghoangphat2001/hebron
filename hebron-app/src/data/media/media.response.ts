export type MediaCategoryRESP = {
  id: number;
  name: string;
  slug: string;
};

export type MediaCategoryItemRESP = {
  id: number;
  name: string;
  page_type?: string;
  total_post?: number;
  is_active?: boolean;
};

export type MediaCategoryListRESP = {
  categories: MediaCategoryItemRESP[];
};

export type MediaItemRESP = {
  id: number;
  category_id: number;
  category?: MediaCategoryRESP | null;
  title: string;
  description: string | null;
  url: string;
  image_url: string | null;
  link_url: string | null;
  sort_order: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
};

export type MediaListRESP = {
  media: MediaItemRESP[];
};

export type MediaDetailRESP = {
  media: MediaItemRESP;
};
