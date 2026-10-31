import type { BrandHomeAboutCtaView } from '@/data/pages/pages.mapper';

export type BrandFaqsPageView = {
  title: string;
  heroTitle?: string;
  heroBackgroundImageUrlPC?: string | null;
  heroBackgroundImageUrlMB?: string | null;
  aboutCta?: BrandHomeAboutCtaView;
};
