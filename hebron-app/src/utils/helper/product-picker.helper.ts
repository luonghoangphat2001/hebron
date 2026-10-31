import type { CategoryRESP, LocalizedNameRESP } from '@/data/categories/categories.response';
import type { ProductItemRESP } from '@/data/products/products.response';
import type { I18nLanguage } from '@/i18n';
import type { QuoteProductOption } from '@/utils/constants/quote-product.constant';

export const getLocalizedName = (name: LocalizedNameRESP | null | undefined, lang: I18nLanguage = 'kr'): string => {
  if (!name) return '';
  if (lang === 'en') return name.en || name.ko || '';
  return name.ko || name.en || '';
};

/** Root categories only — use nested `children` from each root (API may also flatten descendants at top level). */
export const getRootCategories = (categories: CategoryRESP[]): CategoryRESP[] =>
  categories.filter((category) => category.parent_id === null && category.is_active);

export const getLeafCategories = (categories: CategoryRESP[]): CategoryRESP[] =>
  categories.filter((category) => !category.has_children && (!category.children || category.children.length === 0));

export const mapProductListItemToOption = (product: ProductItemRESP, lang: I18nLanguage = 'kr'): QuoteProductOption => ({
  id: String(product.id),
  categoryId: product.category_id != null ? String(product.category_id) : '',
  name: getLocalizedName(product.name, lang),
  specs: product.short_description?.trim() || '',
  thumbnail: product.first_image ?? '',
});
