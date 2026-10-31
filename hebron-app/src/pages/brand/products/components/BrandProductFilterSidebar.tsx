import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import type { CategoryRESP } from '@/data/categories/categories.response';
import { cn } from '@/lib/utils';
import { getLocalizedName } from '@/utils/helper/product-picker.helper';
import { CaretDownIcon, CaretUpIcon, MagnifyingGlassIcon } from '@phosphor-icons/react';
import { useState } from 'react';

type BrandProductFilterSidebarProps = {
  search: string;
  onSearchChange: (value: string) => void;
  categories: CategoryRESP[];
  selectedCategoryIds: number[];
  onCategoryCheckedChange: (categoryId: number, checked: boolean) => void;
  isLoading?: boolean;
  className?: string;
};

const BrandProductFilterSidebarSkeleton = ({ className }: Pick<BrandProductFilterSidebarProps, 'className'>) => (
  <aside className={cn('flex w-full flex-col gap-2.5 md:w-[270px] md:shrink-0', className)} aria-busy='true'>
    <Skeleton className='h-12 w-full rounded-md bg-neutral-900' />
    <Skeleton className='h-12 w-full rounded-[14px] bg-neutral-900' />
    {Array.from({ length: 6 }, (_, index) => (
      <Skeleton key={index} className='h-14 w-full rounded-[14px] bg-neutral-900' />
    ))}
  </aside>
);

export const BrandProductFilterSidebar = ({
  search,
  onSearchChange,
  categories,
  selectedCategoryIds,
  onCategoryCheckedChange,
  isLoading = false,
  className,
}: BrandProductFilterSidebarProps) => {
  const [expandedCategoryIds, setExpandedCategoryIds] = useState<Record<number, boolean>>(() => {
    const initial: Record<number, boolean> = {};
    categories.forEach((cat) => {
      initial[cat.id] = true;
    });
    return initial;
  });

  const toggleAccordion = (categoryId: number) => {
    setExpandedCategoryIds((prev) => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }));
  };

  const filterCategories = categories.filter((category) =>
    Boolean(category.has_children ?? (category.children && category.children.length > 0)),
  );

  if (isLoading) return <BrandProductFilterSidebarSkeleton className={className} />;

  return (
    <aside className={cn('flex w-full flex-col gap-2.5 md:w-[270px] md:shrink-0', className)}>
      {/* Search Input Field */}
      <div className='group flex h-12 w-full items-center gap-3 rounded-md border-2 border-neutral-600 bg-neutral-900 px-4 shadow-sm transition-colors focus-within:border-white focus-within:ring-2 focus-within:ring-white/20'>
        <MagnifyingGlassIcon className='size-6 shrink-0 text-neutral-200 transition-colors group-focus-within:text-white' />
        <input
          type='text'
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder='검색어 입력하세요'
          aria-label='제품 검색'
          className='w-full bg-transparent text-base text-neutral-50 placeholder:text-neutral-400 focus:outline-none'
        />
      </div>

      {/* Categories Filter List */}
      <div className='flex flex-col gap-2.5'>
        {filterCategories.map((category) => {
          const categoryName = getLocalizedName(category.name);
          const isExpanded = expandedCategoryIds[category.id] ?? true;
          const hasChildren = Boolean(category.children && category.children.length > 0);
          const isParentChecked = selectedCategoryIds.includes(category.id);

          return (
            <div
              key={category.id}
              className='overflow-hidden rounded-[14px] border border-neutral-800 bg-neutral-900 transition-colors'>
              {/* Accordion Header or Flat Category */}
              {hasChildren ? (
                <button
                  type='button'
                  onClick={() => toggleAccordion(category.id)}
                  className='flex w-full cursor-pointer items-center justify-between p-3 text-left transition hover:bg-neutral-800/40'>
                  <span className='text-sm font-normal text-neutral-50'>{categoryName}</span>
                  {isExpanded ? (
                    <CaretUpIcon className='size-3.5 text-neutral-400' weight='bold' />
                  ) : (
                    <CaretDownIcon className='size-3.5 text-neutral-400' weight='bold' />
                  )}
                </button>
              ) : (
                <label
                  htmlFor={`cat-${category.id}`}
                  className={cn(
                    'flex w-full cursor-pointer items-center justify-between p-3 text-left transition hover:bg-neutral-800/40',
                    isParentChecked && 'bg-neutral-800/40',
                  )}>
                  <div className='flex items-center gap-2.5'>
                    <Checkbox
                      id={`cat-${category.id}`}
                      checked={isParentChecked}
                      onCheckedChange={(checked) => onCategoryCheckedChange(category.id, checked === true)}
                      className='data-[state=checked]:border-brand data-[state=checked]:bg-brand border-neutral-600 bg-neutral-950 data-[state=checked]:text-white'
                    />
                    <span className={cn('text-sm font-normal text-neutral-50', isParentChecked && 'font-medium text-white')}>
                      {categoryName}
                    </span>
                  </div>
                  {category.products_count !== undefined && (
                    <span className='text-xs text-neutral-500'>({category.products_count})</span>
                  )}
                </label>
              )}

              {/* Accordion Content (Subcategories with Checkbox items) */}
              {hasChildren && isExpanded && (
                <div className='flex flex-col gap-1 border-t border-neutral-800 px-2 py-2'>
                  {category.children.map((child) => {
                    const childName = getLocalizedName(child.name);
                    const isChildChecked = selectedCategoryIds.includes(child.id);

                    return (
                      <label
                        key={child.id}
                        htmlFor={`cat-${child.id}`}
                        className={cn(
                          'flex cursor-pointer items-center justify-between rounded px-2 py-1.5 transition hover:bg-neutral-800/50',
                          isChildChecked && 'bg-neutral-800/40',
                        )}>
                        <div className='flex min-w-0 items-center gap-2.5'>
                          <Checkbox
                            id={`cat-${child.id}`}
                            checked={isChildChecked}
                            onCheckedChange={(checked) => onCategoryCheckedChange(child.id, checked === true)}
                            className='data-[state=checked]:border-brand data-[state=checked]:bg-brand border-neutral-600 bg-neutral-950 data-[state=checked]:text-white'
                          />
                          <span
                            className={cn(
                              'truncate text-sm text-neutral-400 transition-colors',
                              isChildChecked && 'font-medium text-white',
                            )}>
                            {childName}
                          </span>
                        </div>
                        {child.products_count !== undefined && (
                          <span className='shrink-0 text-xs text-neutral-500'>({child.products_count})</span>
                        )}
                      </label>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </aside>
  );
};

export default BrandProductFilterSidebar;
