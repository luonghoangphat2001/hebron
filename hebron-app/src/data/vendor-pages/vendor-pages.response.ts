export const VENDOR_PAGE_SECTION_TYPE = {
  HERO_SECTION: 'hero_section',
  PRODUCT_CATALOG: 'product_catalog',
} as const;

export type VendorPageSectionType = (typeof VENDOR_PAGE_SECTION_TYPE)[keyof typeof VENDOR_PAGE_SECTION_TYPE] | string;

export type VendorHeroItemRESP = {
  alt: string;
  link: string | null;
  image_url: string;
  mobile_image_url: string | null;
  sort_order: number;
  title: string;
  is_active: boolean;
};

export type VendorHeroSectionContentRESP = {
  items: VendorHeroItemRESP[];
  autoplay: boolean;
  media_type: string;
  pagination: boolean;
};

export type VendorProductCatalogItemRESP = {
  link: string;
  title: string;
  image_url: string;
  product_id: number;
  product_code: string;
  badge: string | null;
  sale_price: number;
  original_price: number;
  discount_rate: number;
};

export type VendorProductSortOptionRESP = {
  label: string;
  value: 'popular' | 'latest' | 'price_desc' | 'name' | string;
  endpoint?: string;
  query?: {
    sort_by: string;
    sort_order: 'asc' | 'desc';
  };
};

export type VendorProductCatalogPaginationRESP = {
  current_page: number;
  per_page: number;
  total_page: number;
  total_item: number;
};

export type VendorProductCatalogFiltersRESP = {
  q: string | null;
  category_id: number | null;
  category_ids: number[];
  sort: string | null;
  sort_by: string | null;
  sort_order: 'asc' | 'desc' | null;
};

export type VendorProductCatalogContentRESP = {
  card: {
    show_sku: boolean;
    show_tags: boolean;
    show_badge: boolean;
    badge_label: string;
    inquiry_label: string;
    fallback_image_url: string;
    image_aspect_ratio: string;
    show_inquiry_button: boolean;
  };
  layout: string;
  columns: number;
  endpoints: {
    list: string;
    detail: string;
    popular: string;
    reviews: string;
    templates: string;
  };
  page_size: number;
  total_label: string;
  sort_options: VendorProductSortOptionRESP[];
};

export type VendorPageSectionRESP = {
  id: number;
  section_type: VendorPageSectionType;
  title: string | null;
  subtitle: string | null;
  content: VendorHeroSectionContentRESP | VendorProductCatalogContentRESP | Record<string, unknown> | null;
  image: string | null;
  link: string | null;
  sort_order: number;
  is_active: boolean;
  metadata: Record<string, unknown> | null;
};

export type VendorPageRESP = {
  id: number;
  site_type: 'PLAIN_SITE' | string;
  page_type: string;
  slug: string;
  title: string | null;
  subtitle: string | null;
  description: string | null;
  image: string | null;
  sort_order: number;
  is_active: boolean;
  metadata: Record<string, unknown> | null;
  sections: VendorPageSectionRESP[];
  created_at: string;
  updated_at: string;
};

export type VendorPageDetailRESP = {
  page: VendorPageRESP;
};
