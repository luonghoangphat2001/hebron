import type { CategoryRESP } from '@/data/categories/categories.response';
import { getLocalizedName } from './product-picker.helper';

const VENDOR_PRODUCT_CATEGORY_NAMES = new Set(['베스트상품', '주문제작', '트로피', '상패', '현판명패', '시계문진', '메달뱃지']);

const normalizeCategoryName = (name: string) => name.replace(/[\s/·]/g, '');

export const getVendorProductCategories = (categories: CategoryRESP[]) =>
  categories
    .filter(
      (category) =>
        category.is_active && VENDOR_PRODUCT_CATEGORY_NAMES.has(normalizeCategoryName(getLocalizedName(category.name))),
    )
    .sort((first, second) => first.sort_order - second.sort_order);

export const getVendorHomeProductCategories = (categories: CategoryRESP[]) => getVendorProductCategories(categories);

export const getVendorCategoryLeafCategories = (category: CategoryRESP | undefined) =>
  (category?.children ?? [])
    .filter((child) => child.is_active && !child.has_children && (child.children?.length ?? 0) === 0)
    .sort((first, second) => first.sort_order - second.sort_order);
