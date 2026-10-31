export type LocalizedNameRESP = {
  ko?: string;
  en?: string;
  ja?: string;
};

export type CategoryRESP = {
  id: number;
  name: LocalizedNameRESP;
  slug: string;
  parent_id: number | null;
  description: string | null;
  subtitle: string | null;
  image: string | null;
  icon: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  children: CategoryRESP[];
  has_children?: boolean;
  products_count: number;
};

export type CategoryListRESP = {
  categories: CategoryRESP[];
};
