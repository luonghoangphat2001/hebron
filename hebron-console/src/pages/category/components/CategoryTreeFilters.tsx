import AppSelect from '@/components/select/AppSelect';
import { Input } from '@/components/ui/input';
import { hasCategoryFilter, type CategoryTreeFilterValues } from '@/data/category/category.service';
import useDebounce from '@/hooks/useDebounce';
import { cn } from '@/lib/utils';
import { CategoryLevels, CategoryStatus } from '@/utils/enums/category.enum';
import { Filter, Hash, RotateCcw, Search } from 'lucide-react';
import { useMemo, useState, type Dispatch, type SetStateAction } from 'react';
import { useTranslation } from 'react-i18next';

type Props = {
  filters: CategoryTreeFilterValues;
  onFiltersChange: Dispatch<SetStateAction<CategoryTreeFilterValues>>;
};

const CategoryTreeFilters = ({ filters, onFiltersChange }: Props) => {
  const { t: tCategory } = useTranslation('category');
  const { t: tEnum } = useTranslation('enum');
  const { t: tCommon } = useTranslation('common');

  const [search, setSearch] = useState(filters.name ?? '');
  const [slugSearch, setSlugSearch] = useState(filters.slug ?? '');

  useDebounce(search, (v) => onFiltersChange((prev) => ({ ...prev, name: v.trim() || undefined })));
  useDebounce(slugSearch, (v) => onFiltersChange((prev) => ({ ...prev, slug: v.trim() || undefined })));

  const levelOptions = useMemo(
    () => [
      { level: CategoryLevels.LARGE, label: tCategory('tree.depth_large') },
      { level: CategoryLevels.MEDIUM, label: tCategory('tree.depth_medium') },
      { level: CategoryLevels.SMALL, label: tCategory('tree.depth_small') },
    ],
    [tCategory],
  );

  const statusOptions = useMemo(
    () => Object.values(CategoryStatus).map((v) => ({ value: v, label: tEnum(`category.${v}`) })),
    [tEnum],
  );

  const toggleLevel = (level: CategoryLevels) => {
    onFiltersChange((prev) => ({ ...prev, level: prev.level === level ? undefined : level }));
  };

  const handleReset = () => {
    setSearch('');
    setSlugSearch('');
    onFiltersChange({});
  };

  return (
    <>
      <div className='space-y-2'>
        <div className='relative'>
          <Search className='text-muted-foreground absolute top-1/2 left-2.5 h-4 w-4 -translate-y-1/2' />
          <Input
            className='h-8 pl-8 text-sm'
            placeholder={tCategory('tree.search')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className='relative'>
          <Hash className='text-muted-foreground absolute top-1/2 left-2.5 h-4 w-4 -translate-y-1/2' />
          <Input
            className='h-8 pl-8 text-sm'
            placeholder={tCategory('tree.search_slug')}
            value={slugSearch}
            onChange={(e) => setSlugSearch(e.target.value)}
          />
        </div>
      </div>

      <div className='space-y-2'>
        <div className='flex items-center justify-between'>
          <div className='text-muted-foreground flex items-center gap-1.5 text-xs font-medium'>
            <Filter className='h-3.5 w-3.5' />
            {tCommon('filter.title')}
          </div>
          {hasCategoryFilter(filters) && (
            <button onClick={handleReset} className='flex items-center gap-1 text-xs text-blue-600 hover:underline'>
              <RotateCcw className='h-3 w-3' />
              {tCommon('filter.reset')}
            </button>
          )}
        </div>

        <AppSelect
          options={statusOptions}
          value={filters.status}
          placeholder={tCategory('tree.filter_status')}
          onChange={(v) => onFiltersChange((prev) => ({ ...prev, status: v as CategoryStatus | undefined }))}
          className='h-8 text-sm'
        />

        <div className='grid w-full grid-cols-3 gap-1.5'>
          {levelOptions.map(({ level, label }) => (
            <button
              key={level}
              aria-pressed={filters.level === level}
              onClick={() => toggleLevel(level)}
              className={cn(
                'rounded-sm border px-2.5 py-1 text-xs transition-colors',
                filters.level === level
                  ? 'border-blue-600 bg-blue-600 text-white'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-gray-400',
              )}>
              {label}
            </button>
          ))}
        </div>
      </div>
    </>
  );
};

export default CategoryTreeFilters;
