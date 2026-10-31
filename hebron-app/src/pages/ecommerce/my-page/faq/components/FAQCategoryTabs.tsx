import FAQCategoryTabsSkeleton from '@/pages/ecommerce/my-page/faq/components/FAQCategoryTabsSkeleton';
import { cn } from '@/lib/utils';
import type { FAQCategory } from '@/utils/types/faq.type';

type FAQCategoryTabsProps = {
  categories: FAQCategory[];
  activeKey: string;
  onChange: (key: string) => void;
  className?: string;
  isLoading?: boolean;
};

const FAQCategoryTabs = ({ categories, activeKey, onChange, className, isLoading = false }: FAQCategoryTabsProps) => {
  if (isLoading) {
    return <FAQCategoryTabsSkeleton className={className} />;
  }
  return (
    <div className={cn('border-b border-neutral-200', className)}>
      <div className='scrollbar-hide -mx-4 overflow-x-auto px-4 lg:mx-0 lg:overflow-visible lg:px-0'>
        <div className='flex w-max lg:w-full' role='tablist' aria-label='FAQ categories'>
          {categories.map((category) => {
            const isActive = category.key === activeKey;
            const count = category.count ?? 0;
            const isDisabled = count === 0;

            return (
              <button
                key={category.key}
                type='button'
                role='tab'
                aria-selected={isActive}
                disabled={isDisabled}
                onClick={() => onChange(category.key)}
                className={cn(
                  'text-md flex h-14 shrink-0 items-center justify-center border-b-2 px-4 leading-(--text-md--line-height) whitespace-nowrap transition-colors lg:min-w-0 lg:flex-1 lg:px-1',
                  isDisabled
                    ? 'cursor-default border-transparent font-normal text-neutral-300'
                    : cn(
                        'cursor-pointer',
                        isActive
                          ? 'border-blue-brand text-blue-brand -mb-px font-bold'
                          : 'border-transparent font-normal text-neutral-500 hover:text-neutral-700',
                      ),
                )}>
                {category.label}({count})
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default FAQCategoryTabs;
