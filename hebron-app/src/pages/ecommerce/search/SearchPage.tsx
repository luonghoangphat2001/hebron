import { AppInput } from '@/components/input/AppInput';
import CustomTablePagination from '@/components/table/CustomTablePagination';
import { Spinner } from '@/components/ui/spinner';
import { getSearchPositiveInteger } from '@/data/products/product.service';
import { useProductSearchQuery } from '@/data/products/products.query';
import type { ProductSearchSortBy } from '@/data/products/products.request';
import { useIsMobile } from '@/hooks/useIsMobile';
import { cn } from '@/lib/utils';
import { MY_PAGE_LIST_PAGE_SIZE_OPTIONS } from '@/utils/constants/pagination.constant';
import { PRODUCT_VIEW_OPTIONS } from '@/utils/constants/product.constant';
import { SearchParams } from '@/utils/enums/common.enum';
import { ProductColumnView } from '@/utils/enums/product.enum';
import { formatNumber } from '@/utils/helper/common.helper';
import { MagnifyingGlassIcon } from '@phosphor-icons/react';
import { type SubmitEvent, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../product/components/ProductCard';
import ProductSortOption from '../product/components/ProductSortOption';

const SearchPage = () => {
  const isMobile = useIsMobile();
  const [searchParams, setSearchParams] = useSearchParams();
  const { t: tCommon } = useTranslation('common');
  const searchKeyword = searchParams.get('q')?.trim() ?? '';
  const [inputValue, setInputValue] = useState(searchKeyword);
  const sortOptions: { label: string; value: ProductSearchSortBy }[] = [
    { label: tCommon('title.popular_order'), value: 'popular' },
    { label: tCommon('title.newest_order'), value: 'latest' },
    { label: tCommon('title.price_high_order'), value: 'price_desc' },
    { label: tCommon('title.product_name_order'), value: 'view_count' },
  ];
  const [selectedSortBy, setSelectedSortBy] = useState<ProductSearchSortBy>('popular');
  const [selectedViewOption, setSelectedViewOption] = useState(PRODUCT_VIEW_OPTIONS[PRODUCT_VIEW_OPTIONS.length - 1].value);
  const queryPage = getSearchPositiveInteger(searchParams, SearchParams.PAGE) ?? 1;
  const queryPageSize = getSearchPositiveInteger(searchParams, SearchParams.PER_PAGE);
  const pageIndex = queryPage - 1;
  const pageSize =
    queryPageSize && MY_PAGE_LIST_PAGE_SIZE_OPTIONS.some((size) => size === queryPageSize)
      ? queryPageSize
      : MY_PAGE_LIST_PAGE_SIZE_OPTIONS[1];
  const productGridColumns =
    selectedViewOption === ProductColumnView.TWO_COLUMNS
      ? 'lg:grid-cols-2'
      : selectedViewOption === ProductColumnView.THREE_COLUMNS
        ? 'lg:grid-cols-3'
        : selectedViewOption === ProductColumnView.FOUR_COLUMNS
          ? 'lg:grid-cols-4'
          : 'lg:grid-cols-5';

  const {
    data: productsResponse,
    isLoading,
    isFetching,
  } = useProductSearchQuery(
    {
      q: searchKeyword,
      sort_by: selectedSortBy,
      page: queryPage,
      per_page: pageSize,
    },
    { enabled: Boolean(searchKeyword) },
  );
  const products = productsResponse?.data.products ?? [];
  const totalProducts = productsResponse?.pagination.total_item ?? 0;

  useEffect(() => {
    setInputValue(searchKeyword);
  }, [searchKeyword]);

  const updateSearchParams = (updater: (params: URLSearchParams) => void) => {
    setSearchParams((params) => {
      updater(params);
      return params;
    });
  };

  const scrollToResults = () => {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  };

  const handleSearch = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextKeyword = inputValue.trim();

    updateSearchParams((params) => {
      params.set(SearchParams.PAGE, '1');
      if (nextKeyword) params.set('q', nextKeyword);
      else params.delete('q');
    });
    scrollToResults();
  };

  const handlePageChange = (nextPageIndex: number) => {
    updateSearchParams((params) => params.set(SearchParams.PAGE, String(nextPageIndex + 1)));
    scrollToResults();
  };

  const handlePageSizeChange = (nextPageSize: number) => {
    updateSearchParams((params) => {
      params.set(SearchParams.PER_PAGE, String(nextPageSize));
      params.set(SearchParams.PAGE, '1');
    });
    scrollToResults();
  };

  return (
    <div className='pb-15'>
      <h2 className='text-display-sm mt-2 text-center font-bold'>상품검색</h2>
      <form className='mx-auto mt-12 mb-15 max-w-171.5' onSubmit={handleSearch}>
        <AppInput
          value={inputValue}
          onChange={(event) => setInputValue(event.target.value)}
          placeholder='상품명 또는 키워드를 입력해 주세요.'
          aria-label='상품 검색'
          rightIcon={
            <button
              type='submit'
              aria-label='검색'
              className='grid size-4 cursor-pointer place-items-center p-0 leading-none text-neutral-700'
              title='검색'>
              <MagnifyingGlassIcon className='block' />
            </button>
          }
        />
      </form>

      <div className='h-px bg-gray-200' />
      <section className='mt-10'>
        <div className='flex flex-wrap items-center justify-between gap-3'>
          <p className='text-sm'>
            <span>상품 검색 결과</span> <span className='ml-1 font-bold'>{formatNumber(totalProducts)}</span>
          </p>
          <div className='flex flex-wrap gap-1 md:gap-x-6 md:gap-y-3'>
            <div className='hidden gap-2 md:flex'>
              {sortOptions.map((option) => (
                <ProductSortOption
                  key={option.value}
                  label={option.label}
                  selected={selectedSortBy === option.value}
                  onClick={() => setSelectedSortBy(option.value)}
                />
              ))}
            </div>
            <div className='hidden rounded-md bg-neutral-100 p-0.5 lg:flex'>
              {PRODUCT_VIEW_OPTIONS.map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  type='button'
                  aria-label={label}
                  className={cn(
                    'grid cursor-pointer place-items-center rounded-[6px] p-1 text-[#343330] transition-all',
                    selectedViewOption === value && 'bg-white shadow-sm',
                  )}
                  onClick={() => setSelectedViewOption(value)}>
                  <Icon className='size-6' strokeWidth={2.5} />
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className={cn('mt-4 grid grid-cols-2 gap-4 md:grid-cols-3', productGridColumns)} aria-busy={isFetching}>
          {isLoading ? (
            <div className='col-span-full flex min-h-64 items-center justify-center'>
              <Spinner className='size-8 text-neutral-500' />
            </div>
          ) : searchKeyword && products.length > 0 ? (
            products.map((product) => <ProductCard key={product.id} product={product} />)
          ) : (
            <p className='col-span-full py-16 text-center text-sm text-neutral-500'>
              {searchKeyword ? '검색 결과가 없습니다.' : '검색어를 입력해 주세요.'}
            </p>
          )}
        </div>

        {searchKeyword && (
          <div className='mt-4 flex justify-center md:block md:p-6'>
            <CustomTablePagination
              pageIndex={pageIndex}
              pageCount={productsResponse?.pagination.total_page ?? 0}
              totalRows={totalProducts}
              pageSize={pageSize}
              pageSizeOptions={MY_PAGE_LIST_PAGE_SIZE_OPTIONS}
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
              compact={isMobile}
            />
          </div>
        )}
      </section>
    </div>
  );
};

export default SearchPage;
