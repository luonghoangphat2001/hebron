import { Draft, InfoProduct, Order, Other, Payment } from '@/assets/svgs';
import { BRAND_FAQ_CATEGORY } from '@/data/faqs/faqs.response';

export const BRAND_FAQ_PAGE_LABELS = {
  title: 'FAQs',
  searchPlaceholder: 'Search keyword',
  searchAriaLabel: 'FAQ 검색',
  empty: '등록된 FAQ가 없습니다.',
  loading: '불러오는 중...',
} as const;

export const BRAND_FAQ_FILTERS = [
  { key: BRAND_FAQ_CATEGORY.DRAFT_DESIGN, icon: Draft },
  { key: BRAND_FAQ_CATEGORY.PAYMENT_DELIVERY, icon: Payment },
  { key: BRAND_FAQ_CATEGORY.ORDER_PRODUCTION, icon: Order },
  { key: BRAND_FAQ_CATEGORY.PRODUCT_INFORMATION, icon: InfoProduct },
  { key: BRAND_FAQ_CATEGORY.ETC, icon: Other },
] as const;

export type BrandFAQFilterKey = (typeof BRAND_FAQ_FILTERS)[number]['key'];

export const DEFAULT_BRAND_FAQ_FILTER_KEY: BrandFAQFilterKey = BRAND_FAQ_FILTERS[0].key;

export const BRAND_FAQ_LIST_PAGE_SIZE = 50;
