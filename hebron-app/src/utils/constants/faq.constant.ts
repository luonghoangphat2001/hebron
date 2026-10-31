import { FAQ_CATEGORY, type FAQCategoryKey } from '@/data/faqs/faqs.response';
import type { FAQCategory } from '@/utils/types/faq.type';

export const FAQ_CATEGORY_LABELS: Record<FAQCategoryKey, string> = {
  [FAQ_CATEGORY.ORDER_PAYMENT]: '주문/결제',
  [FAQ_CATEGORY.SHIPPING]: '배송',
  [FAQ_CATEGORY.CANCELLATION_REFUND]: '취소/환불',
  [FAQ_CATEGORY.RETURNS_EXCHANGES]: '반품/교환',
  [FAQ_CATEGORY.MEMBER_INFORMATION]: '회원정보',
  [FAQ_CATEGORY.ETC]: '기타',
};

export const FAQ_CATEGORIES: FAQCategory[] = [
  { key: FAQ_CATEGORY.ORDER_PAYMENT, label: FAQ_CATEGORY_LABELS[FAQ_CATEGORY.ORDER_PAYMENT] },
  { key: FAQ_CATEGORY.SHIPPING, label: FAQ_CATEGORY_LABELS[FAQ_CATEGORY.SHIPPING] },
  { key: FAQ_CATEGORY.CANCELLATION_REFUND, label: FAQ_CATEGORY_LABELS[FAQ_CATEGORY.CANCELLATION_REFUND] },
  { key: FAQ_CATEGORY.RETURNS_EXCHANGES, label: FAQ_CATEGORY_LABELS[FAQ_CATEGORY.RETURNS_EXCHANGES] },
  { key: FAQ_CATEGORY.MEMBER_INFORMATION, label: FAQ_CATEGORY_LABELS[FAQ_CATEGORY.MEMBER_INFORMATION] },
  { key: FAQ_CATEGORY.ETC, label: FAQ_CATEGORY_LABELS[FAQ_CATEGORY.ETC] },
];

export const DEFAULT_FAQ_CATEGORY_KEY: FAQCategoryKey = FAQ_CATEGORY.SHIPPING;

export const FAQ_PAGE_LABELS = {
  pageTitle: '자주묻는질문',
  empty: '등록된 FAQ가 없습니다.',
  searchAriaLabel: 'FAQ 검색',
} as const;

export const getFAQCategoryLabel = (category: string) => FAQ_CATEGORY_LABELS[category as FAQCategoryKey] ?? category;
