import type { BrandHomeAboutCtaView } from '@/data/pages/pages.mapper';

export type BrandProductInquiryStepView = {
  key: string;
  title: string;
  description: string;
};

export type BrandProductInquiryImageUploadView = {
  label: string;
  accept: string[];
  maxSizeMb: number;
};

export type BrandProductInquiryPageView = {
  title?: string;
  subtitle?: string;
  description?: string;
  heroTitle?: string;
  heroBackgroundImageUrlPC?: string | null;
  heroBackgroundImageUrlMB?: string | null;
  processTitle?: string;
  processSubtitle?: string;
  processSteps: BrandProductInquiryStepView[];
  formTitle?: string;
  formSubtitle?: string;
  formDescription?: string;
  formImageUrl?: string | null;
  submitLabel: string;
  imageUpload?: BrandProductInquiryImageUploadView;
  aboutCta?: BrandHomeAboutCtaView;
};
