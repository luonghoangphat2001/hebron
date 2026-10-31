import type { BrandHomeAboutCtaView } from '@/data/pages/pages.mapper';

export type BrandContactPageView = {
  title: string;
  subtitle?: string;
  description?: string;
  hero?: {
    title?: string;
    backgroundImageUrlPC?: string | null;
    backgroundImageUrlMB?: string | null;
  };
  information?: {
    title: string;
    address: string;
    latitude?: number;
    longitude?: number;
    zoom?: number;
    mapImageUrl: string | null;
    company: {
      name: string;
      representative: string;
      phone: string;
      fax: string;
      email: string;
    };
  };
  form?: {
    title: string;
    submitLabel: string;
    submitEndpoint: string;
    successMessage: string;
    inquiryTypeOptions: string[];
  };
  aboutCta?: BrandHomeAboutCtaView;
};
