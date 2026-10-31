import { Product1 } from '@/assets/images';
import type { ProductItemRESP } from '@/data/products/products.response';
import { ColumnsIcon, DotsNineIcon, GridFourIcon, SquaresFourIcon } from '@phosphor-icons/react';
import { ProductBadge, ProductColumnView, ProductType } from '../enums/product.enum';

export const PRODUCT_TYPE_LABELS: Record<ProductType, string> = {
  [ProductType.TROPHIES]: '트로피',
  [ProductType.PLAQUES]: '상패',
  [ProductType.MEDALS_BADGES]: '메달·뱃지',
  [ProductType.SIGNBOARDS_NAMEPLATES]: '현판·명패',
  [ProductType.OTHERS]: '기타',
};

export const PRODUCT_TYPE_OPTIONS = Object.values(ProductType).map((value) => ({
  value,
  label: PRODUCT_TYPE_LABELS[value],
}));

export const PRODUCT_BADGE_STYLE: Record<ProductBadge, string> = {
  [ProductBadge.Sale]: 'bg-red-500 text-white',
  [ProductBadge.Best]: 'bg-neutral-50 text-neutral-950',
  [ProductBadge.New]: 'bg-blue-brand-700 text-white',
};

export const PRODUCT_VIEW_OPTIONS = [
  { value: ProductColumnView.TWO_COLUMNS, label: 'two-column-view', icon: ColumnsIcon },
  { value: ProductColumnView.THREE_COLUMNS, label: 'small-grid-view', icon: SquaresFourIcon },
  { value: ProductColumnView.FOUR_COLUMNS, label: 'large-grid-view', icon: GridFourIcon },
  { value: ProductColumnView.FIVE_COLUMNS, label: 'dense-grid-view', icon: DotsNineIcon },
];

//mocks

const badges: (ProductBadge | undefined)[] = [
  ProductBadge.New,
  ProductBadge.Best,
  ProductBadge.Sale,
  undefined,
  ProductBadge.New,
  ProductBadge.Best,
  undefined,
  ProductBadge.Sale,
];

export const PRODUCT_MOCKS: ProductItemRESP[] = Array.from({ length: 20 }, (_, index) => {
  const badge = badges[index % badges.length];

  return {
    id: index + 1,
    category_id: null,
    category_ids: [],
    name: { ko: '제품 제목' },
    slug: `product-${index + 1}`,
    short_description: null,
    price: 175000,
    compare_price: badge === ProductBadge.Sale ? 273000 : null,
    first_image: Product1,
    is_popular: badge === ProductBadge.Best,
    is_featured: badge === ProductBadge.New,
    is_active: true,
    sort_order: index,
    has_discount: badge === ProductBadge.Sale,
    discount_percentage: badge === ProductBadge.Sale ? 36 : null,
    average_rating: null,
    total_reviews: null,
    view_count: 0,
    stock_quantity: 0,
    min_quantity: 1,
    max_quantity: 0,
    has_option: false,
    visible_roles: null,
    created_at: '',
    updated_at: '',
    deleted_at: null,
    categories: [],
  };
});
