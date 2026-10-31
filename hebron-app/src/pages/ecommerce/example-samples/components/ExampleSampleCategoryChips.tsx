import { Button } from '@/components/ui/button';
import type { ExampleSentenceSampleCategoryItemRESP } from '@/data/example-sentence-samples/example-sentence-samples.response';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

type ExampleSampleCategoryChipsProps = {
  categories: ExampleSentenceSampleCategoryItemRESP[];
  activeCategoryId?: number;
  onChange: (categoryId?: number) => void;
  className?: string;
};

const ExampleSampleCategoryChips = ({ categories, activeCategoryId, onChange, className }: ExampleSampleCategoryChipsProps) => {
  const { t } = useTranslation('common');
  const isAllActive = activeCategoryId === undefined;

  return (
    <div
      className={cn('scrollbar-hide flex min-w-0 flex-nowrap items-center gap-2 overflow-x-auto overscroll-x-contain', className)}
      role='tablist'
      aria-label={t('example_samples.categories_aria')}>
      <Button
        type='button'
        role='tab'
        aria-selected={isAllActive}
        variant='outline'
        size='xs'
        onClick={() => onChange(undefined)}
        className={cn(
          'h-8 shrink-0 rounded-full px-4',
          isAllActive
            ? 'border-transparent bg-neutral-100 font-medium text-neutral-950 hover:bg-neutral-100'
            : 'border-neutral-200 bg-white font-normal text-neutral-400 hover:bg-neutral-50',
        )}>
        {t('example_samples.all')}
      </Button>
      {categories.map((category) => {
        const isActive = category.id === activeCategoryId;

        return (
          <Button
            key={category.id}
            type='button'
            role='tab'
            aria-selected={isActive}
            variant='outline'
            size='xs'
            onClick={() => onChange(category.id)}
            className={cn(
              'h-8 shrink-0 rounded-full px-4',
              isActive
                ? 'border-transparent bg-neutral-100 font-medium text-neutral-950 hover:bg-neutral-100'
                : 'border-neutral-200 bg-white font-normal text-neutral-400 hover:bg-neutral-50',
            )}>
            {category.name}
          </Button>
        );
      })}
    </div>
  );
};

export default ExampleSampleCategoryChips;
