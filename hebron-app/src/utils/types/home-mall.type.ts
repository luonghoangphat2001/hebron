import type { SiteType } from '@/utils/enums/common.enum';
import type { CategoryShortcutType } from '@/data/pages/pages.response';
import type { ProductItemRESP } from '../../data/products/products.response';

export type BannerCarouselItem = {
  id?: number | string;
  name?: string;
  title?: string;
  subtitle?: string;
  description?: string;
  button_label?: string;
  buttonLabel?: string;
  media_type?: 'image' | 'video' | string;
  mediaType?: 'image' | 'video' | string;
  image?: string;
  image_url?: string;
  image_url_mobile?: string;
  video_url?: string;
  video_url_mobile?: string;
  link_url?: string;
  linkUrl?: string;
  site_type?: SiteType;
  siteType?: SiteType;
  alt?: string;
  sort_order?: number;
  sortOrder?: number;
};

export type Banner = {
  id: number | string;
  title?: string;
  subtitle?: string;
  description?: string;
  buttonLabel?: string;
  mediaType: string;
  imageUrl: string;
  imageUrlMobile?: string;
  videoUrl?: string;
  videoUrlMobile?: string;
  linkUrl?: string;
  siteType?: SiteType;
  alt: string;
  sortOrder?: number;
};

export type HeroBannerSectionView = {
  banners: BannerCarouselItem[];
  autoplay: boolean;
  autoplayInterval: number;
};

export type CategoryShortcutView = {
  type: CategoryShortcutType;
  label: string;
  icon?: string;
  link: string;
};

export type RecommendCategoryView = {
  id: string;
  slug: string;
  label: string;
  imageUrl?: string | null;
  icon?: string | null;
  link?: string | null;
  products: ProductItemRESP[];
};

export type RecommendSectionView = {
  title: string;
  categories: RecommendCategoryView[];
  categorySlugs: string[];
  defaultCategorySlug?: string;
  products: ProductItemRESP[];
  viewAllLink?: string;
  viewAllLabel?: string;
};

export type SteadySellerCategoryView = RecommendCategoryView;
export type SteadySellerSectionView = RecommendSectionView;

export type HomeBannerItem = {
  id: string | number;
  imageUrl: string;
  linkUrl?: string;
  alt?: string;
};

export type SecondaryBannerSectionView = {
  title?: string;
  banners: HomeBannerItem[];
};

export type MallInPressItemView = {
  id: string;
  title: string;
  category: string;
  subtitle: string;
  imageUrl: string;
  link: string;
  date?: string;
};

export type MallInPressSectionView = {
  title: string;
  viewAllLink?: string;
  viewAllLabel?: string;
  items: MallInPressItemView[];
};

export type InPressCardItem = {
  id: number | string;
  image: string;
  category: string;
  title: string;
  subtitle: string;
  date?: string;
  link?: string;
};

export type ShowcaseProductView = {
  id: string;
  title: string;
  sellingPrice: number;
  supplyPrice?: number;
  priceContent?: string;
  imageUrl: string;
  link: string;
  productCode?: string;
};

export type PopularCategoryView = {
  id: string;
  slug: string;
  label: string;
  imageUrl: string;
  link: string;
  subtitle?: string;
  products: ShowcaseProductView[];
};

export type PopularSectionView = {
  title: string;
  categories: PopularCategoryView[];
  showcaseTitle: string;
  showcaseBackground: string;
  showcaseProducts: ShowcaseProductView[];
  defaultCategorySlug?: string;
};

export type PopularGroupItem = {
  id: string;
  name: string;
  image: string;
  slug: string;
};

export type PopularCardItem = {
  id: string;
  name: string;
  sellingPrice: number;
  supplyPrice?: number;
  priceContent?: string;
  image: string;
  link?: string;
};

export type CustomerCenterInquiryView = {
  type: string;
  label: string;
  value: string;
  textarea?: string;
};

export type CustomerCenterView = {
  title: string;
  phone: string;
  email: string;
  fax: string;
  businessHours: string;
  closedDays: string;
  lunchHours: string;
  emailDescription?: string;
  inquiryItems: CustomerCenterInquiryView[];
};

export type MallFaqItemView = {
  id: number | string;
  category: string;
  question: string;
  answer: string;
  cleanAnswer: string;
  date: string;
  sortOrder?: number;
};

export type MallFaqSectionView = {
  title: string;
  viewAllLabel?: string;
  items: MallFaqItemView[];
};
