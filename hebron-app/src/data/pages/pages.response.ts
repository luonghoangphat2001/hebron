import type { PortfolioItemRESP } from '@/data/portfolios/portfolios.response';
import type { SiteType } from '@/utils/enums/common.enum';

export const PAGE_TYPE = {
  HOME_PAGE: 'home_page',
  STANDARD_PRODUCTS: 'standard_products',
} as const;

export type PageType = (typeof PAGE_TYPE)[keyof typeof PAGE_TYPE] | string;

export const PAGE_SECTION_TYPE = {
  HERO_SECTION: 'hero_section',
  PRODUCT_LIST: 'product_list',
  CLIENT_LOGOS: 'client_logos',
  BRAND_STATEMENT: 'brand_statement',
  CRAFTSMANSHIP_VALUES: 'craftsmanship_values',
  PRODUCT_PREVIEW: 'product_preview',
  STEADY_SELLER: 'steady_seller',
  SECONDARY_BANNER: 'secondary_banner',
  FOOTER_QUICK_LINKS: 'footer_quick_links',
  CUSTOM_PROCESS: 'custom_process',
  PRESS_PREVIEW: 'press_preview',
  MANUFACTURING_PROCESS: 'manufacturing_process',
  PORTFOLIO_PREVIEW: 'portfolio_preview',
  PORTFOLIO_FEATURED: 'portfolio_featured',
  ABOUT_CTA: 'about_cta',
  CATEGORY_SHORTCUTS: 'category_shortcuts',
  POPULAR_CATEGORIES: 'popular_categories',
  CATEGORY_PRODUCT_SHOWCASE: 'category_product_showcase',
  NOTICES_PREVIEW: 'notices_preview',
  FAQ_SECTION: 'faq_section',
  CUSTOMER_CENTER: 'customer_center',
  COMPANY_HISTORY: 'company_history',
  BRAND_IDENTITY: 'brand_identity',
  CERTIFICATES: 'certificates',
  PROCESS_STEPS: 'process_steps',
  PRODUCTION_VIDEO: 'production_video',
  EQUIPMENT_GALLERY: 'equipment_gallery',
  QUALITY_CONTROL: 'quality_control',
  MEDIA_LIST: 'media_list',
  BRAND_VIDEOS: 'brand_videos',
  SNS_LINKS: 'sns_links',
  CONTACT_HERO: 'contact_hero',
  CONTACT_INFORMATION: 'contact_information',
  CONTACT_FORM: 'contact_form',
  ACHIEVEMENT_CTA: 'achievement_cta',
  INQUIRY_FORM: 'inquiry_form',
} as const;

export type PageSectionType = (typeof PAGE_SECTION_TYPE)[keyof typeof PAGE_SECTION_TYPE] | string;

export type PageCtaRESP = {
  link: string;
  label: string;
  variant?: string;
};

export type HeroSectionItemRESP = {
  key?: string;
  link?: string | null;
  title?: string;
  subtitle?: string;
  overlay?: boolean;
  image_alt?: string;
  image_url?: string;
  mobile_image_url?: string;
  video_url?: string;
  media_type?: string;
  is_active?: boolean;
  sort_order?: number;
  description?: string;
  button_label?: string;
  overlay_opacity?: number;
};

export type HeroStatRESP = {
  label?: string;
  lines?: string[];
  value: string;
};

export type HeroSectionContentRESP = {
  items?: HeroSectionItemRESP[];
  stats?: HeroStatRESP[];
  heading?: string;
  description?: string;
  keywords?: string[];
  autoplay?: boolean;
  autoplay_interval?: number;
  animation?: string;
  media_type?: string;
  primary_cta?: PageCtaRESP;
};

export type ClientLogoRESP = {
  link?: string | null;
  name?: string;
  logo_url?: string;
};

export type ClientLogosContentRESP = {
  logos?: ClientLogoRESP[];
  marquee?: boolean;
  grayscale?: boolean;
};

export type BrandStatementVisualRESP = {
  alt?: string;
  position?: string;
  image_url?: string;
  media_type?: string;
};

export type BrandStatementContentRESP = {
  visual?: BrandStatementVisualRESP;
  heading?: string;
  description?: string;
};

export type CraftsmanshipValuesProductRESP = {
  supply_price?: number;
  product_id?: number;
  product_code?: string;
  name?:
    | {
        ko?: string;
        en?: string;
      }
    | string;
  slug?: string;
  selling_price?: number;
  original_price?: number;
  first_image?: string;
  is_popular?: boolean;
  is_featured?: boolean;
  is_active?: boolean;
  sort_order?: number;
  has_discount?: boolean;
  discount_percentage?: number;
  category_ids?: number[];
};

export type CraftsmanshipValuesItemRESP = {
  id?: number | string;
  title?: string;
  subtitle?: string;
  image_url?: string;
  description?: string;
  button_label?: string;
  products?: CraftsmanshipValuesProductRESP[];
  sort_order?: number;
  is_active?: boolean;
};

export type CraftsmanshipValuesContentRESP = {
  items?: CraftsmanshipValuesItemRESP[];
};

export type ProductPreviewCardRESP = {
  key?: string;
  link?: string | null;
  title?: string;
  subtitle?: string;
  image_alt?: string;
  image_url?: string;
  button_label?: string;
  description?: string;
};

export type ProductPreviewContentRESP = {
  cards?: ProductPreviewCardRESP[];
  heading?: string;
  description?: string;
  catalog_link?: string | null;
  category_slugs?: string[];
};

export type CustomProcessStepRESP = {
  key?: string;
  title?: string;
  number?: string;
  image_alt?: string;
  image_url?: string;
  description?: string;
};

export type CustomProcessContentRESP = {
  steps?: CustomProcessStepRESP[];
  layout?: string;
  heading?: string;
  description?: string;
};

export type PressPreviewItemRESP = {
  id?: number | string;
  category_id?: number;
  category?: { id: number; name: string; slug: string } | string | null;
  title?: string;
  description?: string | null;
  url?: string | null;
  image_url?: string | null;
  link_url?: string | null;
  link?: string | null;
  subtitle?: string | null;
  sort_order?: number;
  is_active?: boolean;
  image_alt?: string;
  created_at?: string;
  published_at?: string;
};

export type PressPreviewContentRESP = {
  limit?: number;
  media_ids?: number[];
  items?: PressPreviewItemRESP[];
  layout?: string;
  heading?: string;
  description?: string;
  view_all_link?: string;
  view_all_label?: string;
};

export type ManufacturingProcessItemRESP = {
  key?: string;
  title?: string;
  autoplay?: boolean;
  image_alt?: string;
  image_url?: string;
  video_url?: string | null;
  thumbnail_url?: string;
  media_type?: string;
  description?: string;
};

export type ManufacturingProcessContentRESP = {
  items?: ManufacturingProcessItemRESP[];
  heading?: string;
  media_type?: string;
  description?: string;
};

export type PortfolioPreviewContentRESP = {
  items?: PortfolioItemRESP[];
  limit?: number;
  layout?: string;
  heading?: string;
  description?: string;
  view_all_link?: string | null;
  view_all_label?: string;
};

export type PortfolioFeaturedContentRESP = {
  items?: PortfolioItemRESP[];
};

export type AboutCtaProductItemRESP = {
  slug?: string;
  image?: string;
};

export type AboutCtaContentRESP = {
  label?: string;
  heading?: string;
  description?: string;
  button_label?: string;
  button_variant?: string;
  primary_button?: PageCtaRESP;
  secondary_button?: PageCtaRESP;
  third_button?: PageCtaRESP;
  item?: (AboutCtaProductItemRESP | string)[];
  items?: (AboutCtaProductItemRESP | string)[];
  product_images?: string[];
};

export const CATEGORY_SHORTCUT_TYPE = {
  NAVIGATE: 'navigate',
  DOWNLOAD: 'download',
} as const;

export type CategoryShortcutType = (typeof CATEGORY_SHORTCUT_TYPE)[keyof typeof CATEGORY_SHORTCUT_TYPE];

export type CategoryShortcutRESP = {
  type?: CategoryShortcutType;
  link?: string;
  slug?: string;
  label?: string;
  image_url?: string;
  icon?: string;
  category_slug?: string;
  category_name?: string;
};

export type CategoryShortcutsContentRESP = {
  items?: CategoryShortcutRESP[];
};

export type MallProductPreviewItemRESP = {
  link?: string;
  badge?: string;
  title?: string;
  category?: string;
  image_url?: string;
  product_id?: number | string | null;
  product_code?: string;
  is_popular?: boolean;
  is_featured?: boolean;
  has_discount?: boolean;
  supply_price?: number;
  selling_price?: number;
  price_content?: string;
  price?: number;
  sale_price?: number;
  original_price?: number;
  discount_rate?: number;
};

export type MallProductPreviewContentRESP = {
  limit?: number;
  category_slugs?: string[];
  items?: CategoryShortcutRESP[];
  categories?: CategoryShowcaseCategoryItemRESP[];
  category_slug?: string;
  products?: MallProductPreviewItemRESP[];
  show_badge?: boolean;
  show_price?: boolean;
  show_discount?: boolean;
  show_navigation?: boolean;
  catalog_link?: string;
  view_all_label?: string;
  view_all_link?: string;
};

export type PopularCategoryRESP = {
  link?: string;
  slug?: string;
  label?: string;
  image_url?: string;
};

export type PopularCategoriesContentRESP = {
  items?: PopularCategoryRESP[];
};

export type CategoryShowcaseProductRESP = {
  link?: string;
  title?: string;
  supply_price?: number;
  selling_price?: number;
  price_content?: string;
  price?: number;
  sale_price?: number;
  original_price?: number;
  discount_rate?: number;
  image_url?: string;
  product_id?: number | string | null;
  product_code?: string;
  is_popular?: boolean;
  is_featured?: boolean;
  has_discount?: boolean;
};

export type CategoryShowcaseCategoryItemRESP = {
  category_slug?: string;
  category_name?: string;
  subtitle?: string | null;
  image_url?: string | null;
  icon?: string | null;
  link?: string | null;
  products?: CategoryShowcaseProductRESP[];
};

export type CategoryShowcaseSlugRESP = {
  slug: string;
  image_url?: string | null;
};

export type CategoryProductShowcaseContentRESP = {
  limit?: number;
  items?: PopularCategoryRESP[];
  category_slugs?: CategoryShowcaseSlugRESP[];
  categories?: CategoryShowcaseCategoryItemRESP[];
  category_slug?: string;
  products?: CategoryShowcaseProductRESP[];
  show_price?: boolean;
  show_product_name?: boolean;
  show_navigation?: boolean;
  background_image_url?: string;
};

export type NoticesPreviewContentRESP = {
  items?: PressPreviewItemRESP[];
  limit?: number;
  notice_ids?: number[];
  view_all_link?: string;
  view_all_label?: string;
};

export type MallFaqItemRESP = {
  id?: number | string;
  category?: string;
  question?: string;
  answer?: string;
  is_active?: boolean;
  sort_order?: number;
  view_count?: number;
  site_type?: string;
  created_at?: string;
  updated_at?: string;
};

export type MallFaqSectionContentRESP = {
  limit?: number;
  faq_ids?: number[];
  items?: MallFaqItemRESP[];
  view_all_link?: string;
  view_all_label?: string;
};

export type CustomerCenterInquiryItemRESP = {
  type?: string;
  label?: string;
  value?: string;
};

export type CustomerCenterItemRESP = {
  text?: string;
  type?: string;
  textarea?: string;
};

export type CustomerCenterObjectContentRESP = {
  phone?: string;
  email?: string;
  fax?: string;
  business_hours?: string;
  closed_days?: string;
  lunch_hours?: string;
  inquiry_items?: CustomerCenterInquiryItemRESP[];
  view_all_link?: string;
  view_all_label?: string;
};

export type CustomerCenterContentRESP = CustomerCenterObjectContentRESP | CustomerCenterItemRESP[];

export type MediaListItemRESP = {
  date?: string;
  link?: string;
  image?: string;
  media?: string;
  title?: string;
};

export type MediaListContentRESP = {
  items?: MediaListItemRESP[];
  fields?: string[];
  display?: string;
  description?: string;
};

export type BrandVideoItemRESP = {
  url?: string;
  title?: string;
  thumbnail?: string;
};

export type BrandVideosContentRESP = {
  items?: BrandVideoItemRESP[];
  display?: string;
  description?: string;
};

export type SnsLinkItemRESP = {
  url?: string;
  platform?: string;
};

export type SnsLinksContentRESP = {
  items?: SnsLinkItemRESP[];
  display?: string;
  description?: string;
};

export type ContactHeroContentRESP = {
  overlay?: string;
  alignment?: string;
  background_image?: string;
};

export type ContactInformationCompanyRESP = {
  fax?: string;
  name?: string;
  email?: string;
  phone?: string;
  representative?: string;
};

export type ContactInformationMapRESP = {
  zoom?: number;
  address?: string;
  provider?: string;
  image_url?: string;
  latitude?: number;
  longitude?: number;
};

export type ContactInformationContentRESP = {
  map?: ContactInformationMapRESP;
  company?: ContactInformationCompanyRESP;
};

export type ContactFormFieldRESP = {
  key?: string;
  type?: string;
  label?: string;
  required?: boolean;
  placeholder?: string;
  max_length?: number;
  accept?: string[];
  multiple?: boolean;
  max_size_mb?: number;
  upload_type?: string;
  upload_endpoint?: string;
};

export type ContactFormContentRESP = {
  fields?: ContactFormFieldRESP[];
  submit_label?: string;
  submit_endpoint?: string;
  success_message?: string;
  inquiry_type_options?: string[];
};

export type AchievementCtaButtonRESP = {
  href?: string;
  label?: string;
  variant?: string;
};

export type AchievementCtaContentRESP = {
  buttons?: AchievementCtaButtonRESP[];
  description?: string;
  trophy_images?: string[];
};

export type InquiryFormProcessStepRESP = {
  key?: string;
  title?: string;
  description?: string;
};

export type InquiryFormImageUploadRESP = {
  label?: string;
  accept?: string[];
  max_size_mb?: number;
};

export type InquiryFormContentRESP = {
  title?: string;
  subtitle?: string;
  description?: string;
  image_url?: string;
  image_upload?: InquiryFormImageUploadRESP;
  submit_label?: string;
  process_title?: string;
  process_steps?: InquiryFormProcessStepRESP[];
};

export type ProcessStepItemRESP = {
  key?: string;
  image?: string;
  title?: string;
  subtitle?: string;
  description?: string;
};

export type ProcessStepsContentRESP = {
  steps?: ProcessStepItemRESP[];
  interaction?: string;
};

export type ProductionVideoContentRESP = {
  url?: string | null;
  provider?: string;
};

export type EquipmentGalleryItemRESP = {
  key?: string;
  name?: string;
  title?: string;
  image_url?: string;
  description?: string;
};

export type EquipmentGalleryContentRESP = {
  items?: EquipmentGalleryItemRESP[];
};

export type QualityControlContentRESP = {
  visual?: string | null;
  description?: string;
};

export type CompanyHistoryImageRESP = {
  image_alt?: string;
  image_url?: string;
};

export type CompanyHistoryItemRESP = {
  year?: string | number;
  title?: string;
  images?: CompanyHistoryImageRESP[];
  image_url?: string | null;
  image_alt?: string;
  description?: string;
};

export type CompanyHistoryDecadeGroupRESP = {
  title?: string;
  period?: string;
  items?: CompanyHistoryItemRESP[];
};

export type CompanyHistoryContentRESP = {
  heading?: string;
  description?: string;
  intro?: string;
  layout?: string;
  scroll_animation?: string;
  timeline?: CompanyHistoryDecadeGroupRESP[];
};

export type BrandIdentityValueRESP = {
  key?: string;
  title?: string;
  position?: string;
  description?: string;
};

export type BrandIdentityContentRESP = {
  heading?: string;
  philosophy?: string;
  center_title?: string;
  center_description?: string;
  background_image?: string | null;
  values?: BrandIdentityValueRESP[];
  animation?: string;
  image?: string | null;
  ci_bi_intro?: string;
};

export type CompanyInfoItemRESP = {
  label?: string;
  value?: string;
};

export type CertificateItemRESP = {
  type?: string;
  year?: string | number;
  image?: string | null;
  title?: string;
  issuer?: string;
};

export type CertificatesContentRESP = {
  layout?: string;
  heading?: string;
  image_alt?: string;
  image_url?: string | null;
  description?: string;
  company_info?: CompanyInfoItemRESP[];
  info_position?: string;
  image_position?: string;
  items?: CertificateItemRESP[];
};

export type SecondaryBannerItemRESP = {
  name?: string | null;
  image?: string | null;
  link?: string | null;
  image_url?: string | null;
  link_url?: string | null;
  title?: string | null;
  alt?: string | null;
};

export type SecondaryBannerContentRESP = {
  items?: SecondaryBannerItemRESP[];
};

export type FooterQuickLinkItemRESP = {
  image?: string | null;
  field_name?: string | null;
};

export type FooterQuickLinksContentRESP = {
  items?: FooterQuickLinkItemRESP[];
};

export type PageSectionContentRESP =
  | HeroSectionContentRESP
  | ClientLogosContentRESP
  | BrandStatementContentRESP
  | ProductPreviewContentRESP
  | CustomProcessContentRESP
  | PressPreviewContentRESP
  | ManufacturingProcessContentRESP
  | PortfolioPreviewContentRESP
  | PortfolioFeaturedContentRESP
  | AboutCtaContentRESP
  | CategoryShortcutsContentRESP
  | MallProductPreviewContentRESP
  | PopularCategoriesContentRESP
  | CategoryProductShowcaseContentRESP
  | NoticesPreviewContentRESP
  | MallFaqSectionContentRESP
  | CustomerCenterContentRESP
  | CompanyHistoryContentRESP
  | BrandIdentityContentRESP
  | CertificatesContentRESP
  | ContactHeroContentRESP
  | ContactInformationContentRESP
  | ContactFormContentRESP
  | InquiryFormContentRESP
  | AchievementCtaContentRESP
  | ProcessStepsContentRESP
  | ProductionVideoContentRESP
  | EquipmentGalleryContentRESP
  | QualityControlContentRESP
  | MediaListContentRESP
  | BrandVideosContentRESP
  | SnsLinksContentRESP
  | SecondaryBannerContentRESP
  | FooterQuickLinksContentRESP
  | Record<string, unknown>;

export type PageMetadataRESP = {
  theme?: string;
  layout?: string;
  language?: string;
  accent_color?: string;
} & Record<string, unknown>;

export type PageSectionRESP = {
  id: number;
  section_type: PageSectionType;
  title: string | null;
  subtitle: string | null;
  description: string | null;
  content: PageSectionContentRESP | null;
  image: string | null;
  link: string | null;
  sort_order: number;
  is_active: boolean;
  metadata: Record<string, unknown> | null;
};

export type PageRESP = {
  id: number;
  site_type: Extract<SiteType, 'BRAND_SITE'> | SiteType | string;
  page_type: PageType;
  slug: string;
  title: string | null;
  subtitle: string | null;
  description: string | null;
  image: string | null;
  sort_order: number;
  is_active: boolean;
  metadata: PageMetadataRESP | null;
  sections: PageSectionRESP[];
  created_at: string;
  updated_at: string;
};

export type PageDetailRESP = {
  page: PageRESP;
};
