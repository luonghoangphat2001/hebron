/**
 * Brand Home View Models
 */
export type BrandHomeHeroView = {
  heading: string;
  description: string;
  ctaLabel: string;
  ctaLink: string;
  imageUrlPC: string | null;
  imageUrlMB: string | null;
  overlayOpacity: number;
};

export type BrandHomeStatView = {
  value: string;
  label: string;
};

export type BrandHomePartnerLogoView = {
  id: string;
  name: string;
  logoUrl: string;
  link: string | null;
};

export type BrandHomeIntroductionView = {
  heading: string;
  description: string;
  imageUrl: string | null;
  mediaType: 'image' | 'video';
  imageAlt: string;
};

export type BrandHomeValueCardView = {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  imageAlt: string;
  buttonLabel: string;
  link: string;
  description: string;
  products?: Array<{
    id: string;
    title: string;
    price: string;
    image: string;
    slug?: string;
  }>;
};

export type BrandHomeValuesView = {
  heading: string;
  description: string;
  cards: BrandHomeValueCardView[];
};

export type BrandHomeCustomStepView = {
  id: string;
  title: string;
  description: string;
  image: string;
  imageAlt: string;
};

export type BrandHomeCustomProcessView = {
  heading: string;
  description: string;
  steps: BrandHomeCustomStepView[];
};

export type BrandHomePressItemView = {
  id: string;
  category: string;
  title: string;
  subtitle: string;
  image: string;
  link: string | null;
};

export type BrandHomePressView = {
  title: string;
  subtitle: string;
  items: BrandHomePressItemView[];
};

export type BrandHomeManufacturingSlideView = {
  id: string;
  title: string;
  description?: string;
  poster: string;
  videoUrl: string;
};

export type BrandHomeManufacturingView = {
  title: string;
  subtitle: string;
  slides: BrandHomeManufacturingSlideView[];
};

export type BrandHomePortfolioItemView = {
  id: string;
  title: string;
  image: string;
  imageMobile: string;
  linkUrl: string | null;
};

export type BrandHomePortfolioView = {
  heading: string;
  description: string;
  viewAllLabel: string;
  viewAllLink: string;
  items: BrandHomePortfolioItemView[];
};

export type BrandHomeAboutCtaProductItemView = {
  slug?: string;
  image: string;
};

export type BrandHomeAboutCtaView = {
  heading: string;
  description: string;
  primaryLabel: string;
  primaryLink: string;
  secondaryLabel: string;
  secondaryLink: string;
  thirdLabel?: string;
  thirdLink?: string;
  productImages: string[];
  items?: BrandHomeAboutCtaProductItemView[];
};

export type BrandHomeViewModel = {
  hero: BrandHomeHeroView;
  stats: BrandHomeStatView[];
  partners: BrandHomePartnerLogoView[];
  introduction: BrandHomeIntroductionView;
  values: BrandHomeValuesView;
  customProcess: BrandHomeCustomProcessView;
  press: BrandHomePressView;
  manufacturing: BrandHomeManufacturingView;
  portfolio: BrandHomePortfolioView;
  aboutCta: BrandHomeAboutCtaView;
};

/**
 * Brand Story Page View Models
 */
export type BrandStoryTimelineItemView = {
  year: number;
  title?: string;
  description: string;
  images?: string[];
};

export type CompanyInfoView = {
  heading: string;
  description?: string;
  imageUrl?: string | null;
  companyInfo: Array<{ label: string; value: string }>;
};

export type BrandStoryHeroView = {
  heading: string;
  description: string;
  imageUrl?: string | null;
  backgroundImageUrlPC: string | null;
  backgroundImageUrlMB: string | null;
  stats?: Array<{ value: string; label: string }>;
};

export type BrandStoryIdentityView = {
  title: string;
  heading?: string;
  image?: string | null;
  philosophy?: string;
  centerTitle?: string;
  centerDescription?: string;
  values: Array<{ key?: string; title: string; description: string }>;
};

export type BrandStoryHistoryView = {
  title: string;
  heading?: string;
  description?: string;
  intro?: string;
  timeline: BrandStoryTimelineItemView[];
};

export type BrandStoryPageView = {
  title: string;
  hero?: BrandStoryHeroView;
  companyIntro?: CompanyInfoView;
  identity?: BrandStoryIdentityView;
  history?: BrandStoryHistoryView;
  certificates?: {
    title: string;
    items: Array<{
      type: string;
      year: string;
      title: string;
      issuer: string;
      image?: string | null;
    }>;
  };
  clientLogos?: {
    title: string;
    items: { key: string; name: string; logo: string }[];
  };
  brandStatement?: {
    title: string;
    statement: string;
    author: string;
    authorRole: string;
  };
  aboutCta?: BrandHomeAboutCtaView;
};

/**
 * Brand Process Page View Models
 */
export type BrandProcessStepView = {
  id: string;
  key: string;
  name: string;
  title: string;
  subtitle?: string;
  description: string;
  image: string;
};

export type BrandProcessPageView = {
  title: string;
  heroTitle?: string;
  heroBackgroundImageUrlPC?: string | null;
  heroBackgroundImageUrlMB?: string | null;
  stepsSectionTitle: string;
  steps: BrandProcessStepView[];
  productionVideo?: {
    title: string;
    url: string | null;
  };
  equipmentGallery?: {
    title: string;
    items: { key: string; name: string; title: string; image: string; description: string }[];
  };
  qualityControl?: {
    title: string;
    description: string;
    visual: string | null;
  };
  aboutCta?: BrandHomeAboutCtaView;
};

/**
 * Brand Media Page View Models
 */
export type BrandMediaListItemView = {
  id: string;
  date: string;
  link: string;
  image: string;
  media: string;
  title: string;
  categoryId?: number;
};

export type BrandMediaPageView = {
  title: string;
  heroTitle?: string;
  heroBackgroundImageUrlPC?: string | null;
  heroBackgroundImageUrlMB?: string | null;
  imageUrl?: string;
  aboutCta?: BrandHomeAboutCtaView;
};
