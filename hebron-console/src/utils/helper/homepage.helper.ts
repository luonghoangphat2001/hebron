import type { CategorynNode } from '@/data/category/category.response';
import type {
  CategoryShortcutItemRESP,
  FaqItemRESP,
  ShowcaseCategoryRESP,
  ShowcaseProductItemRESP,
} from '@/data/homepage-management/homepage.response';
import type { DialogListDataItem, ProductItemData } from '@/data/homepage-management/homepage.type';
import { CategoryStatus } from '@/utils/enums/category.enum';
import { PostingStatus } from '@/utils/enums/common.enum';
import { ProductBadge } from '@/utils/enums/product.enum';
import { stripHtml } from '@/utils/helper/string.helper';

export const isCategoryActive = (node?: CategorynNode | null): boolean => {
  if (!node) return false;
  const statusValue = (typeof node.status === 'object' && node.status !== null ? node.status.value : node.status) as any;
  return statusValue === CategoryStatus.ACTTIVE || statusValue === 'active' || statusValue === 'ACTIVE';
};

export const flattenCategoryNodes = (nodes: CategorynNode[] = []): CategorynNode[] =>
  nodes.flatMap((node) => [node, ...flattenCategoryNodes(node.children ?? [])]);

export const extractCategorySlugs = (
  rawContent?: any,
  fallbackItems: (CategoryShortcutItemRESP | ShowcaseCategoryRESP)[] = [],
): string[] => {
  if (Array.isArray(rawContent)) {
    return rawContent.map((item: any) => item.category_slug || item.slug || item.category_name || item.label).filter(Boolean);
  }
  if (Array.isArray(rawContent?.category_slugs) && rawContent.category_slugs.length > 0) {
    return rawContent.category_slugs.map((s: any) => (typeof s === 'string' ? s : s?.slug)).filter(Boolean);
  }
  if (Array.isArray(rawContent?.categories) && rawContent.categories.length > 0) {
    return rawContent.categories.map((c: any) => c.category_slug || c.slug || c.category_name || c.label).filter(Boolean);
  }
  if (Array.isArray(rawContent?.items) && rawContent.items.length > 0) {
    return rawContent.items.map((i: any) => i.slug || i.label).filter(Boolean);
  }
  return fallbackItems.map((item: any) => item.category_slug || item.slug || item.category_name || item.label).filter(Boolean);
};

export const transformCategoriesToDialogItems = (categories: CategorynNode[] = []): DialogListDataItem[] =>
  categories.filter(isCategoryActive).map((cat) => ({
    key: cat.slug || cat.name,
    title: cat.name,
    subtitle: cat.slug,
    image: cat.icon || cat.image || cat.banner_image || null,
    rawItem: cat,
  }));

export const getProductDisplayName = (
  name?: { ko?: string; en?: string } | string | null,
  fallbackId?: number | string,
): string => {
  if (typeof name === 'object' && name !== null) {
    return name.ko || name.en || `Product #${fallbackId}`;
  }
  return String(name || `Product #${fallbackId}`);
};

export const PRODUCT_FLAG_TO_BADGE_MAP: Record<string, ProductBadge> = {
  is_best: ProductBadge.BEST,
  is_new: ProductBadge.NEW,
  is_hot: ProductBadge.HOT,
};

export const resolveProductBadge = (prod?: any, fallbackBadge?: string): string | undefined => {
  if (!prod) return fallbackBadge;
  if (prod.badge) return prod.badge;

  const matchedKey = (Object.keys(PRODUCT_FLAG_TO_BADGE_MAP) as (keyof typeof PRODUCT_FLAG_TO_BADGE_MAP)[]).find(
    (key) => prod[key],
  );
  return matchedKey ? PRODUCT_FLAG_TO_BADGE_MAP[matchedKey] : fallbackBadge;
};

export const transformShowcaseProductToCardItem = (item: ShowcaseProductItemRESP): ProductItemData => ({
  id: item.product_id,
  title: item.title,
  image: item.image_url,
  price: item.price,
  badge: (item as any).badge || undefined,
  tag: item.product_code,
});

export const extractMediaItems = (rawContent?: any): any[] =>
  Array.isArray(rawContent?.items) ? rawContent.items : Array.isArray(rawContent?.media) ? rawContent.media : [];

export const extractMediaIds = (rawContent?: any, idsKey = 'media_ids'): number[] => {
  if (Array.isArray(rawContent?.[idsKey]) && rawContent[idsKey].length > 0) {
    return rawContent[idsKey].map(Number).filter((id: number) => !isNaN(id) && id > 0);
  }
  return extractMediaItems(rawContent)
    .map((m) => Number(m.id))
    .filter((id) => !isNaN(id) && id > 0);
};

export const getMediaThumbnail = (m?: any): string | undefined => {
  if (!m) return undefined;
  return m.image_url || m.url || m.file_path || m.thumbnail_path;
};

export const transformMediaToDialogItems = (mediaList: any[] = []): DialogListDataItem[] =>
  mediaList
    .filter((m) => m && m.is_active !== false)
    .map((m: any) => ({
      key: Number(m.id),
      title: m.title || `Media #${m.id}`,
      subtitle: m.category?.name || (typeof m.category === 'string' ? m.category : m.description) || undefined,
      badge: m.category?.name || (typeof m.category === 'string' ? m.category : undefined),
      image: getMediaThumbnail(m) || null,
      rawItem: m,
    }));

// snapshot of a media row stored in section content.items
export const toMediaSectionItem = (m: any) => ({
  id: Number(m.id),
  title: m.title,
  category:
    typeof m.category === 'object' && m.category !== null
      ? m.category.name
      : typeof m.category === 'string'
        ? m.category
        : '언론보도',
  subtitle: m.description || m.subtitle || '',
  image_url: m.image_url || m.url || '',
  image_alt: m.title,
  link: m.link_url || m.link || m.url || '',
});

export const extractFaqItems = (rawContent?: any): FaqItemRESP[] =>
  Array.isArray(rawContent?.items) ? (rawContent.items as FaqItemRESP[]) : [];

export const extractFaqIds = (rawContent?: any): number[] =>
  extractFaqItems(rawContent)
    .map((f) => Number(f.id))
    .filter((id) => !isNaN(id) && id > 0);

export const getCleanFaqAnswer = (answer?: string): string => stripHtml(answer);

export const isFaqExposed = (f?: any): boolean => {
  if (!f) return false;
  const statusValue =
    typeof f.posting_status === 'object' && f.posting_status !== null ? f.posting_status.value : (f.posting_status ?? f.status);
  return statusValue === PostingStatus.EXPOSED || statusValue === 'exposed' || f.is_active === true;
};

export const transformFaqsToDialogItems = (faqs: any[] = []): DialogListDataItem[] =>
  faqs.filter(isFaqExposed).map((f: any) => ({
    key: Number(f.id),
    title: f.question,
    subtitle: f.answer ? getCleanFaqAnswer(f.answer) : undefined,
    badge: f.category || 'FAQ',
    rawItem: f,
  }));

export type CustomerCenterContactItem = {
  text: string;
  type: string;
  textarea: string;
};

export type NormalizedCustomerCenter = {
  items: CustomerCenterContactItem[];
  phone: string;
  email: string;
  business_hours: string;
};

export const DEFAULT_CUSTOMER_CENTER_ITEMS: CustomerCenterContactItem[] = [
  {
    text: '02-2264-7911',
    type: 'phone',
    textarea: '월-금: 9:00 ~ 18:00\n※ 토·일·공휴일 휴무입니다\n급한 용무 시: 010-8887-3726',
  },
  {
    text: '123@naver.com',
    type: 'email',
    textarea: '이메일 문의',
  },
];

export const normalizeCustomerCenter = (rawContent?: any): NormalizedCustomerCenter => {
  let items: CustomerCenterContactItem[] = [];

  if (Array.isArray(rawContent) && rawContent.length > 0) {
    items = rawContent.map((item) => ({
      text: item.text || '',
      type: item.type || 'phone',
      textarea: item.textarea || '',
    }));
  } else if (rawContent && Array.isArray(rawContent.items) && rawContent.items.length > 0) {
    items = rawContent.items.map((item: any) => ({
      text: item.text || '',
      type: item.type || 'phone',
      textarea: item.textarea || '',
    }));
  } else if (rawContent && typeof rawContent === 'object' && Object.keys(rawContent).length > 0) {
    const phone = rawContent.phone || '02-2264-7911';
    const email = rawContent.email || '123@naver.com';
    const hours = rawContent.business_hours || '월-금: 9:00 ~ 18:00\n※ 토·일·공휴일 휴무입니다';
    items = [
      { text: phone, type: 'phone', textarea: hours },
      { text: email, type: 'email', textarea: '이메일 문의' },
    ];
  } else {
    items = [...DEFAULT_CUSTOMER_CENTER_ITEMS];
  }

  const phoneItem = items.find((i) => i.type === 'phone');
  const emailItem = items.find((i) => i.type === 'email');

  return {
    items,
    phone: phoneItem?.text || '02-2264-7911',
    email: emailItem?.text || '123@naver.com',
    business_hours: phoneItem?.textarea || '월-금: 9:00 ~ 18:00',
  };
};

export const normalizeShowcaseCategories = (rawContent?: any): ShowcaseCategoryRESP[] => {
  if (!rawContent) return [];
  if (Array.isArray(rawContent) && rawContent.length > 0) return rawContent;
  if (Array.isArray(rawContent.categories) && rawContent.categories.length > 0) return rawContent.categories;
  return [];
};
