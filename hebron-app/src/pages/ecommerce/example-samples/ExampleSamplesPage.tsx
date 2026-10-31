import DebouncedSearchInput from '@/components/search/DebouncedSearchInput';
import CustomTablePagination from '@/components/table/CustomTablePagination';
import { Typography } from '@/components/typography/Typography';
import { Spinner } from '@/components/ui/spinner';
import {
  useExampleSentenceSampleCategoriesQuery,
  useExampleSentenceSamplesQuery,
} from '@/data/example-sentence-samples/example-sentence-samples.query';
import { getSearchPositiveInteger } from '@/data/products/product.service';
import { useIsMobile } from '@/hooks/useIsMobile';
import { cn } from '@/lib/utils';
import { EXAMPLE_SAMPLE_SEARCH_PARAMS } from '@/utils/constants/example-samples.constant';
import { MY_PAGE_LIST_PAGE_SIZE_OPTIONS } from '@/utils/constants/pagination.constant';
import { SearchParams } from '@/utils/enums/common.enum';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import ExampleSampleCard from './components/ExampleSampleCard';
import ExampleSampleCategoryChips from './components/ExampleSampleCategoryChips';

const ExampleSamplesPage = () => {
  const { t } = useTranslation('common');
  const isMobile = useIsMobile();
  const [searchParams, setSearchParams] = useSearchParams();

  const title = searchParams.get(EXAMPLE_SAMPLE_SEARCH_PARAMS.TITLE)?.trim() ?? '';
  const categoryIdParam = Number(searchParams.get(EXAMPLE_SAMPLE_SEARCH_PARAMS.CATEGORY_ID));
  const activeCategoryId = Number.isInteger(categoryIdParam) && categoryIdParam > 0 ? categoryIdParam : undefined;
  const queryPage = getSearchPositiveInteger(searchParams, SearchParams.PAGE) ?? 1;
  const queryPageSize = getSearchPositiveInteger(searchParams, SearchParams.PER_PAGE);
  const pageIndex = queryPage - 1;
  const pageSize =
    queryPageSize && MY_PAGE_LIST_PAGE_SIZE_OPTIONS.some((size) => size === queryPageSize)
      ? queryPageSize
      : MY_PAGE_LIST_PAGE_SIZE_OPTIONS[0];

  const listParams = useMemo(
    () => ({
      page: queryPage,
      per_page: pageSize,
      ...(title ? { title } : {}),
      ...(activeCategoryId ? { category_id: activeCategoryId } : {}),
    }),
    [queryPage, pageSize, title, activeCategoryId],
  );

  const { data, isLoading, isFetching } = useExampleSentenceSamplesQuery(listParams);
  const { data: categoriesData } = useExampleSentenceSampleCategoriesQuery();

  const samples = data?.data.example_sentence_samples ?? [];
  const categories = categoriesData?.data.categories ?? [];
  const totalRows = data?.pagination.total_item ?? 0;
  const pageCount = Math.max(1, data?.pagination.total_page ?? 1);
  const safePageIndex = Math.min(pageIndex, pageCount - 1);

  const updateSearchParams = (updater: (params: URLSearchParams) => void) => {
    setSearchParams((params) => {
      updater(params);
      return params;
    });
  };

  const handleSearchChange = (value: string) => {
    updateSearchParams((params) => {
      const nextSearch = value.trim();
      if (nextSearch) params.set(EXAMPLE_SAMPLE_SEARCH_PARAMS.TITLE, nextSearch);
      else params.delete(EXAMPLE_SAMPLE_SEARCH_PARAMS.TITLE);
      params.set(SearchParams.PAGE, '1');
    });
  };

  const handleCategoryChange = (categoryId?: number) => {
    updateSearchParams((params) => {
      if (categoryId) params.set(EXAMPLE_SAMPLE_SEARCH_PARAMS.CATEGORY_ID, String(categoryId));
      else params.delete(EXAMPLE_SAMPLE_SEARCH_PARAMS.CATEGORY_ID);
      params.set(SearchParams.PAGE, '1');
    });
  };

  const handlePageChange = (nextPageIndex: number) => {
    updateSearchParams((params) => params.set(SearchParams.PAGE, String(nextPageIndex + 1)));
  };

  const handlePageSizeChange = (nextPageSize: number) => {
    updateSearchParams((params) => {
      params.set(SearchParams.PER_PAGE, String(nextPageSize));
      params.set(SearchParams.PAGE, '1');
    });
  };

  const paginationProps = {
    pageIndex: safePageIndex,
    pageCount,
    totalRows,
    pageSize,
    pageSizeOptions: MY_PAGE_LIST_PAGE_SIZE_OPTIONS,
    onPageChange: handlePageChange,
    onPageSizeChange: handlePageSizeChange,
  };

  return (
    <section className='flex flex-col gap-6 py-6 md:gap-8 md:py-10'>
      <header className='flex flex-col gap-2'>
        <Typography as='h1' variant='display-sm' weight='bold' className='text-display-xs md:text-display-sm'>
          {t('example_samples.title')}
        </Typography>
        <Typography variant='body-sm' className='text-neutral-500'>
          {t('example_samples.description')}
        </Typography>
      </header>

      <div className='flex flex-col gap-4 md:flex-row md:items-center md:justify-between md:gap-0'>
        <DebouncedSearchInput
          defaultValue={title}
          placeholder={t('example_samples.search_placeholder')}
          aria-label={t('example_samples.search_aria')}
          className='w-full shrink-0 md:w-80'
          onDebouncedChange={handleSearchChange}
        />
        <ExampleSampleCategoryChips
          categories={categories}
          activeCategoryId={activeCategoryId}
          onChange={handleCategoryChange}
          className='w-full min-w-0 md:max-w-160'
        />
      </div>

      <div className='grid grid-cols-1 gap-2 md:grid-cols-4 md:gap-4' aria-busy={isFetching}>
        {isLoading ? (
          <div className='col-span-full flex min-h-64 items-center justify-center'>
            <Spinner className='size-8 text-neutral-500' />
          </div>
        ) : samples.length > 0 ? (
          samples.map((sample) => <ExampleSampleCard key={sample.id} sample={sample} />)
        ) : (
          <p className='col-span-full py-16 text-center text-sm text-neutral-500' role='status'>
            {t('example_samples.empty')}
          </p>
        )}
      </div>

      <div className={cn('flex justify-center md:block', isMobile && 'pt-2')}>
        <CustomTablePagination {...paginationProps} compact={isMobile} />
      </div>
    </section>
  );
};

export default ExampleSamplesPage;
