/** Mirrors backend `FaqCategory` enum string values. */
export const FAQ_CATEGORY = {
  RETURNS_EXCHANGES: 'returns_exchanges',
  SHIPPING: 'shipping',
  MEMBER_INFORMATION: 'member_information',
  ETC: 'etc',
  CANCELLATION_REFUND: 'cancellation_refund',
  ORDER_PAYMENT: 'order_payment',
} as const;

export type FAQCategoryKey = (typeof FAQ_CATEGORY)[keyof typeof FAQ_CATEGORY];

/** Mirrors backend brand FAQ category enum string values (`GET /brand/faqs`). */
export const BRAND_FAQ_CATEGORY = {
  PRODUCT_INFORMATION: 'product_information',
  ORDER_PRODUCTION: 'order_production',
  PAYMENT_DELIVERY: 'payment_delivery',
  DRAFT_DESIGN: 'draft_design',
  ETC: 'etc',
} as const;

export type BrandFAQCategoryKey = (typeof BRAND_FAQ_CATEGORY)[keyof typeof BRAND_FAQ_CATEGORY];

export type FAQItemRESP = {
  id: number;
  category: FAQCategoryKey | string;
  question: string;
  answer: string;
  sort_order: number;
  is_active: boolean;
  view_count: number;
  site_type?: string;
  created_at: string;
  updated_at: string;
};

export type FAQListRESP = {
  faqs: FAQItemRESP[];
};

export type FAQCategoryItemRESP = {
  id: number;
  name: string;
  page_type: string;
  is_active: boolean;
  total_post: number;
};

export type FAQCategoryListRESP = {
  categories: FAQCategoryItemRESP[];
};
