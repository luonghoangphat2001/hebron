import FilterContainer from '@/components/FilterContainer';
import FormItem from '@/components/form/FormItem';
import AppSelect from '@/components/select/AppSelect';
import { Input } from '@/components/ui/input';
import useDebounce from '@/hooks/useDebounce';
import { usePortfolioCategoryListQuery } from '@/data/portfolio/portfolio.query';
import { SortOrder } from '@/utils/enums/common.enum';
import { PortfolioSort } from '@/utils/enums/portfolio.enum';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

export type PortfolioFilterValues = {
  title: string;
  category: string | undefined;
  is_featured: boolean | undefined;
  is_active: boolean | undefined;
  year: number | undefined;
  sort_by: PortfolioSort | undefined;
  sort_order: SortOrder | undefined;
  page: number;
  per_page: number;
};

export const DEFAULT_PORTFOLIO_FILTER: PortfolioFilterValues = {
  title: '',
  category: undefined,
  is_featured: undefined,
  is_active: undefined,
  year: undefined,
  sort_by: PortfolioSort.SORT_ORDER,
  sort_order: SortOrder.ASC,
  page: 1,
  per_page: 10,
};

type Props = {
  filter: PortfolioFilterValues;
  handleFilterChange: (filter: Partial<PortfolioFilterValues>) => void;
};

const PortfolioFilter = ({ filter, handleFilterChange }: Props) => {
  const { t: tContent } = useTranslation('content');
  const { t: tEnum } = useTranslation('enum');

  const [titleInput, setTitleInput] = useState(filter.title || '');

  const handleTitleChange = useCallback((value: string) => handleFilterChange({ title: value }), [handleFilterChange]);
  useDebounce(titleInput, handleTitleChange);

  const { data: categories = [] } = usePortfolioCategoryListQuery();
  const categoryOptions = useMemo(
    () =>
      categories.map(({ slug, name }) => ({
        value: slug || name,
        label: name,
      })),
    [categories],
  );

  const featuredOptions = useMemo(
    () => [
      { value: 'true', label: tContent('portfolio.filter.featured_only') },
      { value: 'false', label: tContent('portfolio.filter.not_featured') },
    ],
    [tContent],
  );

  const activeOptions = useMemo(
    () => [
      { value: 'true', label: tEnum('common.ACTIVE') },
      { value: 'false', label: tEnum('common.INACTIVE') },
    ],
    [tEnum],
  );

  const handleReset = () => {
    setTitleInput('');
    handleFilterChange({
      title: '',
      category: undefined,
      is_featured: undefined,
      is_active: undefined,
      year: undefined,
    });
  };

  return (
    <FilterContainer onResetFilter={handleReset}>
      <div className='grid grid-cols-3 gap-x-4 gap-y-4'>
        <FormItem label={tContent('portfolio.filter.title')}>
          <Input
            placeholder={tContent('portfolio.filter.ph_title')}
            value={titleInput}
            onChange={(e) => setTitleInput(e.target.value)}
          />
        </FormItem>
        <FormItem label={tContent('portfolio.filter.category')}>
          <AppSelect
            options={categoryOptions}
            value={filter.category}
            onChange={(category) => handleFilterChange({ category })}
            placeholder={tContent('filter.ph_all_categories')}
          />
        </FormItem>
        <FormItem label={tContent('portfolio.filter.featured')}>
          <AppSelect
            options={featuredOptions}
            value={filter.is_featured !== undefined ? String(filter.is_featured) : undefined}
            onChange={(v) => handleFilterChange({ is_featured: v === undefined ? undefined : v === 'true' })}
            placeholder={tContent('filter.ph_all_statuses')}
          />
        </FormItem>
        <FormItem label={tContent('portfolio.filter.year')}>
          <Input
            type='number'
            placeholder={tContent('portfolio.filter.ph_year')}
            value={filter.year ?? ''}
            onChange={(e) => handleFilterChange({ year: e.target.value ? Number(e.target.value) : undefined })}
          />
        </FormItem>
        <FormItem label={tContent('portfolio.filter.active')}>
          <AppSelect
            options={activeOptions}
            value={filter.is_active !== undefined ? String(filter.is_active) : undefined}
            onChange={(v) => handleFilterChange({ is_active: v === undefined ? undefined : v === 'true' })}
            placeholder={tContent('filter.ph_all_statuses')}
          />
        </FormItem>
      </div>
    </FilterContainer>
  );
};

export default PortfolioFilter;
