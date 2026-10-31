import type {
  BrandIdentityInput,
  BrandIdentityValueItem,
  CertificatesInput,
  CompanyHistoryImage,
  CompanyHistoryInput,
  CompanyHistoryItem,
  CompanyHistoryPeriod,
  CompanyInfoItem,
  ContactMapInput,
  InquiryFormInput,
  InquiryProcessStep,
} from '@/schemas/homepage/homepage.schema';
import { SectionType } from '@/utils/enums/homepage.enum';
import type { PageSectionRESP } from './homepage.response';

export type {
  BrandIdentityInput,
  BrandIdentityValueItem,
  CertificatesInput,
  CompanyHistoryImage,
  CompanyHistoryInput,
  CompanyHistoryItem,
  CompanyHistoryPeriod,
  CompanyInfoItem,
  ContactMapInput,
  InquiryFormInput,
  InquiryProcessStep,
};

export type SectionItems = {
  id: string;
  name: string;
  type: SectionType;
  enabled: boolean;
  order?: number;
  itemCount?: number;
  description?: string;
  rawSection?: PageSectionRESP;
};

export type MallSection = SectionItems;
export type BrandSection = SectionItems;

export type ProductItemData = {
  id: string | number;
  title: string;
  category?: string;
  image: string;
  price: number;
  originalPrice?: number;
  discountRate?: number;
  badge?: 'HOT' | 'BEST' | 'NEW' | 'MD PICK' | string;
  rating?: number;
  reviewCount?: number;
  description?: string;
  tag?: string;
};

export type DialogListDataItem = {
  key: string | number;
  title: string;
  subtitle?: string;
  extraInfo?: string;
  image?: string | null;
  badge?: string;
  rawItem?: any;
};

export type HeroStatItem = {
  value: string;
  label?: string;
  lines?: string[];
};

export type HeroPrimaryCta = {
  link: string;
  label: string;
};

export type BrandHeroContent = {
  items: any[];
  stats?: HeroStatItem[];
  media_type?: string;
  primary_cta?: HeroPrimaryCta;
};

export type ClientLogoItem = {
  name: string;
  logo_url: string;
  link?: string | null;
};

export type ClientLogosContent = {
  logos: ClientLogoItem[];
  marquee?: boolean;
  grayscale?: boolean;
};

export type SecondaryBannerItem = {
  name: string;
  image: string;
  link?: string | null;
};

export type SecondaryBannerContent = {
  items: SecondaryBannerItem[];
};

export type FooterQuickLinkItem = {
  image: string;
  field_name: string;
};

export type FooterQuickLinksContent = {
  items: FooterQuickLinkItem[];
};

export type BrandStatementContent = {
  visual: {
    alt?: string;
    position?: string;
    image_url: string;
    media_type?: 'image' | 'video';
  };
};

export type BrandIdentityContent = {
  values?: BrandIdentityValueItem[];
  philosophy?: string;
  center_title?: string;
  center_description?: string;
  background_image?: string;
};

export type CertificatesContent = {
  layout?: string;
  image_alt?: string;
  image_url?: string;
  company_info?: CompanyInfoItem[];
  info_position?: string;
  image_position?: string;
};

export type CompanyHistoryContent = {
  timeline?: CompanyHistoryPeriod[];
};

export type CraftsmanshipValueMedia = {
  type: string;
  url: string;
  thumbnail?: string | null;
  alt?: string;
  sort_order?: number;
};

export type CraftsmanshipValueItem = {
  id?: number | string;
  key: string;
  title: string;
  subtitle?: string;
  image_url?: string;
  media?: CraftsmanshipValueMedia[];
  description?: string | null;
  button_label?: string;
  products?: any[];
  sort_order?: number;
  is_active?: boolean;
  link?: string | null;
};

export type CraftsmanshipValuesContent = {
  items: CraftsmanshipValueItem[];
};

export type CustomProcessStep = {
  key?: string;
  number: string;
  title: string;
  image_alt?: string;
  image_url: string;
  description: string;
};

export type CustomProcessContent = {
  steps: CustomProcessStep[];
  layout?: string;
};

export type PressPreviewItem = {
  link?: string | null;
  title: string;
  category?: string;
  subtitle?: string;
  image_alt?: string;
  image_url: string;
};

export type PressPreviewContent = {
  items: PressPreviewItem[];
  layout?: string;
};

export type ManufacturingProcessItem = {
  key?: string;
  title: string;
  subtitle?: string;
  image_url?: string;
  image?: string;
  video_url?: string | null;
  media_type?: string;
  description?: string;
};

export type ProcessStepItem = ManufacturingProcessItem;
export type ManufacturingVideoItem = ManufacturingProcessItem;

export type ManufacturingProcessContent = {
  items?: ManufacturingProcessItem[];
  steps?: ManufacturingProcessItem[];
  media_type?: string;
};

export type AboutCtaButton = {
  link: string;
  label: string;
  variant?: string;
};

export type AboutCtaContent = {
  label?: string;
  button_label?: string;
  button_variant?: string;
  primary_button?: AboutCtaButton;
  secondary_button?: AboutCtaButton;
  product_images?: string[];
};

export type InquiryFormContent = {
  title?: string;
  subtitle?: string;
  description?: string;
  image_url?: string;
  images?: string[];
  process_title?: string;
  process_steps?: InquiryProcessStep[];
};

export type ContactMapContent = {
  place_name?: string;
  company_name?: string;
  address?: string;
  address_detail?: string;
  address_en?: string;
  map_link?: string;
  kakao_map_url?: string;
  latitude?: number;
  longitude?: number;
  image_url?: string;
  images?: string[];
  map?: {
    zoom?: number;
    address?: string;
    provider?: string;
    image_url?: string;
    latitude?: number;
    longitude?: number;
  };
  company?: {
    fax?: string;
    name?: string;
    email?: string;
    phone?: string;
    representative?: string;
  };
};
