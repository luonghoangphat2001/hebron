import { Skeleton } from '@/components/ui/skeleton';
import type { CategoryRESP } from '@/data/categories/categories.response';
import { cn } from '@/lib/utils';
import { getLocalizedName } from '@/utils/helper/product-picker.helper';

type BrandProductCategoryTabsProps = {
  parentCategories: CategoryRESP[];
  selectedParentSlug: string;
  onParentCategoryChange: (parentSlug: string) => void;
  leafCategories: CategoryRESP[];
  selectedLeafCategoryId: string | number;
  onLeafCategorySelect: (id: string | number) => void;
  isLoading?: boolean;
};

const BrandProductCategoryTabsSkeleton = () => (
  <div className='flex flex-col gap-3' aria-busy='true'>
    <div className='flex gap-2 overflow-hidden'>
      {Array.from({ length: 4 }, (_, index) => (
        <Skeleton key={index} className='h-10 w-24 shrink-0 rounded-full bg-neutral-900' />
      ))}
    </div>
    <div className='flex gap-2 overflow-hidden'>
      {Array.from({ length: 5 }, (_, index) => (
        <Skeleton key={index} className='h-9 w-20 shrink-0 rounded-full bg-neutral-900' />
      ))}
    </div>
  </div>
);

const BrandProductCategoryTabs = ({
  parentCategories,
  selectedParentSlug,
  onParentCategoryChange,
  leafCategories,
  selectedLeafCategoryId,
  onLeafCategorySelect,
  isLoading = false,
}: BrandProductCategoryTabsProps) => {
  if (isLoading) return <BrandProductCategoryTabsSkeleton />;

  return (
    <div className='flex flex-col gap-3'>
      <nav className='no-scrollbar flex w-full items-center gap-2 overflow-x-auto pb-0.5' aria-label='제품 대분류'>
        {parentCategories.map((category) => {
          const isSelected = category.slug === selectedParentSlug;

          return (
            <button
              key={category.id}
              type='button'
              aria-pressed={isSelected}
              onClick={() => onParentCategoryChange(category.slug)}
              className={cn(
                'inline-flex h-10 shrink-0 cursor-pointer items-center justify-center rounded-full border px-5 text-sm font-medium whitespace-nowrap transition-colors',
                isSelected
                  ? 'border-brand bg-brand text-white'
                  : 'border-neutral-700 bg-neutral-900 text-neutral-300 hover:border-neutral-500 hover:text-white',
              )}>
              {getLocalizedName(category.name)}
            </button>
          );
        })}
      </nav>

      {leafCategories.length > 0 && (
        <nav className='no-scrollbar flex w-full items-center gap-2 overflow-x-auto pb-0.5' aria-label='제품 카테고리 필터'>
          <button
            type='button'
            aria-pressed={selectedLeafCategoryId === 'all'}
            onClick={() => onLeafCategorySelect('all')}
            className={cn(
              'inline-flex h-9 shrink-0 cursor-pointer items-center justify-center rounded-full border px-4 text-sm whitespace-nowrap transition-colors',
              selectedLeafCategoryId === 'all'
                ? 'border-white bg-white font-semibold text-neutral-950'
                : 'border-neutral-700 bg-neutral-900 text-neutral-400 hover:border-neutral-500 hover:text-white',
            )}>
            전체
          </button>
          {leafCategories.map((category) => {
            const isSelected = String(selectedLeafCategoryId) === String(category.id);

            return (
              <button
                key={category.id}
                type='button'
                aria-pressed={isSelected}
                onClick={() => onLeafCategorySelect(category.id)}
                className={cn(
                  'inline-flex h-9 shrink-0 cursor-pointer items-center justify-center rounded-full border px-4 text-sm whitespace-nowrap transition-colors',
                  isSelected
                    ? 'border-white bg-white font-semibold text-neutral-950'
                    : 'border-neutral-700 bg-neutral-900 text-neutral-400 hover:border-neutral-500 hover:text-white',
                )}>
                {getLocalizedName(category.name)}
              </button>
            );
          })}
        </nav>
      )}
    </div>
  );
};

export default BrandProductCategoryTabs;
