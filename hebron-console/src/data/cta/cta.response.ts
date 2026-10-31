import type { SiteType } from '@/utils/enums/common.enum';

export type AboutCtaButtonRESP = {
  link?: string;
  label?: string;
  variant?: string;
};

export type AboutCtaItem = {
  image: string;
  product_id: number;
};

export type AboutCtaContentRESP = {
  label?: string;
  heading: string;
  description?: string;
  button_label?: string;
  button_variant?: string;
  primary_button?: AboutCtaButtonRESP;
  secondary_button?: AboutCtaButtonRESP;
  third_button?: AboutCtaButtonRESP;
  item?: AboutCtaItem[];
  product_images?: string[];
};

export type AboutCTA = {
  id: number;
  site_type: SiteType;
  title: string;
  subtitle?: string | null;
  content: AboutCtaContentRESP;
  image?: string | null;
  link?: string | null;
  metadata?: Record<string, any> | null;
  created_at?: string;
  updated_at?: string;
};

export type AboutCtaDetailRESP = {
  about_cta: AboutCTA;
};
