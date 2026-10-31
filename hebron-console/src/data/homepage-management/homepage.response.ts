import type { PageType, SiteType } from '@/utils/enums/common.enum';
import type { SectionType, ShortcutLinkType } from '@/utils/enums/homepage.enum';

export type HeroSlideItemRESP = {
  title: string;
  subtitle?: string | null;
  description?: string | null;
  image_url: string;
  mobile_image_url?: string | null;
  link?: string | null;
  button_label?: string | null;
  sort_order: number;
  is_active: boolean;
};

export type HeroSectionContentRESP = {
  items: HeroSlideItemRESP[];
  autoplay?: boolean;
  autoplay_interval?: number;
  animation?: string;
  media_type?: string;
  keywords?: string[];
};

export type CategoryShortcutItemRESP = {
  type?: ShortcutLinkType;
  link: string;
  slug?: string;
  label: string;
  icon: string | null;
  sort_order?: number;
  is_active?: boolean;
};

export type CategoryShortcutsContentRESP = {
  items: CategoryShortcutItemRESP[];
};

export type ProductPreviewItemRESP = {
  product_id: number;
  product_code: string;
  title: string;
  image_url: string;
  link?: string | null;
  badge?: string | null;
  sale_price: number;
  original_price?: number;
  discount_rate?: number;
};

export type ProductPreviewContentRESP = {
  limit?: number;
  products: ProductPreviewItemRESP[];
  show_badge?: boolean;
  show_price?: boolean;
  show_discount?: boolean;
  show_navigation?: boolean;
  view_all_label?: string;
  catalog_link?: string;
  category_slugs?: string[];
};

export type NoticeAttachmentRESP = {
  key?: string;
  no?: number;
  url: string;
  name?: string;
  size?: number;
};

export type NoticeItemRESP = {
  id: number;
  site_type?: string;
  title: string;
  content: string;
  type: string;
  attachments?: NoticeAttachmentRESP[];
  is_pinned?: boolean;
  is_new?: boolean;
  view_count?: number;
  published_at?: string;
  exposure_start_date?: string;
  created_at: string;
};

export type NoticesPreviewContentRESP = {
  items: NoticeItemRESP[];
  limit?: number;
  view_all_link?: string;
  view_all_label?: string;
};

export type ShowcaseProductItemRESP = {
  product_id: number;
  product_code: string;
  title: string;
  image_url: string;
  link?: string | null;
  price: number;
};

export type ShowcaseCategoryItemRESP = {
  link: string;
  slug: string;
  label: string;
  image_url?: string | null;
};

export type ShowcaseCategorySlugRESP = {
  slug: string;
  image_url?: string | null;
};

export type ShowcaseCategoryRESP = {
  category_slug: string;
  category_name: string;
  subtitle?: string | null;
  image_url?: string | null;
  link?: string;
  products?: ShowcaseProductItemRESP[];
};

export type CategoryProductShowcaseContentRESP = {
  limit?: number;
  category_slug?: string;
  category_slugs?: ShowcaseCategorySlugRESP[];
  background_image_url?: string;
  show_price?: boolean;
  show_navigation?: boolean;
  show_product_name?: boolean;
  items?: ShowcaseCategoryItemRESP[];
  categories?: ShowcaseCategoryRESP[];
  products: ShowcaseProductItemRESP[];
};

export type FaqItemRESP = {
  id: number;
  category: string;
  question: string;
  answer: string;
  sort_order: number;
  is_active: boolean;
  view_count: number;
  site_type: string;
  created_at: string;
  updated_at: string;
};

export type FaqSectionContentRESP = {
  items: FaqItemRESP[];
  view_all_link?: string;
  view_all_label?: string;
};

export type InquiryItemRESP = {
  type: string;
  label: string;
  value: string;
};

export type CustomerCenterContactItem = {
  text: string;
  type: string;
  textarea: string;
};

export type CustomerCenterContentRESP =
  | CustomerCenterContactItem[]
  | {
      phone?: string;
      email?: string;
      fax?: string;
      business_hours?: string;
      lunch_hours?: string;
      closed_days?: string;
      inquiry_items?: InquiryItemRESP[];
      view_all_link?: string;
      view_all_label?: string;
      items?: CustomerCenterContactItem[];
    };

export type PageSectionRESP = {
  id: number;
  section_type: SectionType | string;
  title: string;
  subtitle: string | null;
  description: string | null;
  content: Record<string, any> | any[];
  image: string | null;
  link: string | null;
  craftsmanship_value_ids?: number[] | null;
  sort_order: number;
  is_active: boolean;
  metadata: any | null;
};

export type PageDetailRESP = {
  id: number;
  site_type: SiteType | string;
  page_type: PageType | string;
  slug: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  image: string | null;
  sort_order: number;
  is_active: boolean;
  metadata: any | null;
  sections: PageSectionRESP[];
  created_at: string;
  updated_at: string;
};

export type PagesListRESP = {
  pages: PageDetailRESP[];
};
