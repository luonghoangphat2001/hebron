import type { CategoryRESP } from '@/data/categories/categories.response';
import { cn } from '@/lib/utils';
import { getLeafCategories, getLocalizedName } from '@/utils/helper/product-picker.helper';
import { useMemo } from 'react';

type CategoryBadgeItem = {
  id: string | number;
  label: string;
  category?: CategoryRESP;
};

type ProductCategoryBadgesProps = {
  categories: CategoryRESP[];
  selectedId: string | number;
  onSelect: (id: string | number, category?: CategoryRESP) => void;
};

const ProductCategoryBadges = ({ categories, selectedId, onSelect }: ProductCategoryBadgesProps) => {
  const items = useMemo<CategoryBadgeItem[]>(() => {
    const nonChildrenCategories = getLeafCategories(categories);

    if (nonChildrenCategories.length === 0) return [];

    return [
      { id: 'all', label: '전체' },
      ...nonChildrenCategories.map((cat) => ({
        id: cat.id,
        label: getLocalizedName(cat.name),
        category: cat,
      })),
    ];
  }, [categories]);

  if (items.length === 0) {
    return null;
  }

  const handleSelect = (item: CategoryBadgeItem) => {
    onSelect(item.id, item.category);
  };

  return (
    <div className='no-scrollbar flex w-full items-center gap-2 overflow-x-auto' role='tablist' aria-label='상품 카테고리 필터'>
      {items.map((item) => {
        const isSelected = String(selectedId) === String(item.id);

        return (
          <div
            key={item.id}
            role='tab'
            tabIndex={0}
            aria-selected={isSelected}
            onClick={() => handleSelect(item)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                handleSelect(item);
              }
            }}
            className={cn(
              'inline-flex h-8 shrink-0 cursor-pointer items-center justify-center rounded-full border border-neutral-200 bg-white px-4 text-base font-normal whitespace-nowrap text-neutral-500 transition-all outline-none select-none hover:border-neutral-300 hover:text-neutral-700',
              isSelected ? 'bg-neutral-100 font-semibold text-neutral-950' : '',
            )}>
            {item.label}
          </div>
        );
      })}
    </div>
  );
};

export default ProductCategoryBadges;
