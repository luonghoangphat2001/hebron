import FilterContainer from '@/components/FilterContainer';
import FormItem from '@/components/form/FormItem';
import AppSelect from '@/components/select/AppSelect';
import { Input } from '@/components/ui/input';
import { useExampleSentenceSampleCategoryInfiniteQuery } from '@/data/example-sentence-sample/example-sentence-sample.query';
import type { ExampleSentenceSampleListREQ } from '@/data/example-sentence-sample/example-sentence-sample.request';
import useDebounce from '@/hooks/useDebounce';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

type Props = {
  filter: ExampleSentenceSampleListREQ;
  handleFilterChange: (filter: Partial<ExampleSentenceSampleListREQ>) => void;
};

const booleanOptions = (active: string, inactive: string) => [
  { value: 'true', label: active },
  { value: 'false', label: inactive },
];

const ExampleSentenceSampleFilter = ({ filter, handleFilterChange }: Props) => {
  const { t: tContent } = useTranslation('content');
  const [keyword, setKeyword] = useState(filter.keyword || '');
  const [categoryKeyword, setCategoryKeyword] = useState('');
  const [debouncedCategoryKeyword, setDebouncedCategoryKeyword] = useState('');
  const {
    data: categoryData,
    isLoading: isCategoryLoading,
    isFetching: isCategoryFetching,
    hasNextPage: hasMoreCategories,
    fetchNextPage: fetchNextCategoryPage,
    isFetchingNextPage: isFetchingMoreCategories,
  } = useExampleSentenceSampleCategoryInfiniteQuery({
    keyword: debouncedCategoryKeyword || undefined,
  });

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setKeyword(filter.keyword || ''), [filter.keyword]);

  const categoryOptions = useMemo(
    () =>
      (categoryData?.categories || []).map((category) => ({
        value: category.board_category_no ?? category.id,
        label: category.name,
      })),
    [categoryData?.categories],
  );
  const handleKeywordChange = useCallback(
    (value: string) => handleFilterChange({ keyword: value || undefined }),
    [handleFilterChange],
  );
  const handleCategorySearch = useCallback((value: string) => setDebouncedCategoryKeyword(value.trim()), []);
  useDebounce(keyword, handleKeywordChange);
  useDebounce(categoryKeyword, handleCategorySearch);

  const handleReset = () => {
    setKeyword('');
    setCategoryKeyword('');
    setDebouncedCategoryKeyword('');
    handleFilterChange({ keyword: undefined, board_category_no: undefined, is_active: undefined });
  };

  return (
    <FilterContainer onResetFilter={handleReset}>
      <div className='grid grid-cols-4 gap-4'>
        <FormItem label={tContent('filter.search')}>
          <Input
            placeholder={tContent('sample.ph_search')}
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
          />
        </FormItem>
        <FormItem label={tContent('filter.category')}>
          <AppSelect
            options={categoryOptions}
            value={filter.board_category_no}
            placeholder={tContent('filter.ph_all_categories')}
            onChange={(value) => handleFilterChange({ board_category_no: value })}
            showSearch
            onSearch={setCategoryKeyword}
            onLoadMore={() => fetchNextCategoryPage()}
            hasMore={hasMoreCategories}
            isLoading={isCategoryLoading || (isCategoryFetching && !isFetchingMoreCategories)}
            isLoadingMore={isFetchingMoreCategories}
          />
        </FormItem>
        <FormItem label={tContent('sample.field_active')}>
          <AppSelect
            options={booleanOptions(tContent('sample.active'), tContent('sample.inactive'))}
            value={filter.is_active === undefined ? undefined : String(filter.is_active)}
            placeholder={tContent('filter.ph_all_statuses')}
            onChange={(value) => handleFilterChange({ is_active: value === undefined ? undefined : value === 'true' })}
          />
        </FormItem>
        {/* Featured filter is intentionally disabled until the backend feature is enabled.
        <FormItem label={tContent('sample.field_featured')}>
          <AppSelect
            options={booleanOptions(tContent('sample.featured'), tContent('sample.not_featured'))}
            value={filter.is_featured === undefined ? undefined : String(filter.is_featured)}
            placeholder={tContent('filter.ph_all_statuses')}
            onChange={(value) => handleFilterChange({ is_featured: value === undefined ? undefined : value === 'true' })}
          />
        </FormItem> */}
      </div>
    </FilterContainer>
  );
};

export default ExampleSentenceSampleFilter;
