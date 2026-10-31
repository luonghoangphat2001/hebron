import { SiteType } from '@/utils/enums/homepage.enum';

export enum NoticeType {
  IMPORTANT = 'important',
  GENERAL = 'general',
  MAINTENANCE = 'maintenance',
}

export enum ExposureLocation {
  MAIN = 'main',
  LOGIN = 'login',
  DASHBOARD = 'dashboard',
}

export enum GuideType {
  PRODUCTION_GUIDE = 'production_guide',
  PRECAUTION = 'precaution',
  SHIPPING = 'shipping',
  USAGE_GUIDE = 'usage_guide',
}

export enum ImageCategory {
  PRODUCT = 'Product',
  BRAND = 'Brand',
  BANNER = 'Banners',
  ETC = 'Etc',
}

export enum FAQCategory {
  //Mall
  ORDER_PAYMENT = 'order_payment',
  CANCELLATION_REFUND = 'cancellation_refund',
  RETURNS_EXCHANGES = 'returns_exchanges',
  SHIPPING = 'shipping',
  MEMBER_INFORMATION = 'member_information',

  //Brand
  PRODUCT_INFORMATION = 'product_information',
  ORDER_PRODUCTION = 'order_production',
  PAYMENT_DELIVERY = 'payment_delivery',
  DRAFT_DESIGN = 'draft_design',

  ETC = 'etc',
}

export enum ExposureTarget {
  ALL = 'all',
  USER = 'user',
}

// Categories available per site. Vendor (PLAIN_SITE) has no FAQ.
export const FAQ_SITE_CATEGORY_MAP: Partial<Record<SiteType, FAQCategory[]>> = {
  [SiteType.SHOPPING_MALL]: [
    FAQCategory.ORDER_PAYMENT,
    FAQCategory.CANCELLATION_REFUND,
    FAQCategory.RETURNS_EXCHANGES,
    FAQCategory.SHIPPING,
    FAQCategory.MEMBER_INFORMATION,
    FAQCategory.ETC,
  ],
  [SiteType.BRAND_SITE]: [
    FAQCategory.PRODUCT_INFORMATION,
    FAQCategory.ORDER_PRODUCTION,
    FAQCategory.PAYMENT_DELIVERY,
    FAQCategory.DRAFT_DESIGN,
    FAQCategory.ETC,
  ],
};

export const FAQ_SITE_TYPES = Object.keys(FAQ_SITE_CATEGORY_MAP) as SiteType[];

export const getFAQCategoriesBySite = (siteType?: SiteType): FAQCategory[] =>
  siteType ? (FAQ_SITE_CATEGORY_MAP[siteType] ?? []) : [];
