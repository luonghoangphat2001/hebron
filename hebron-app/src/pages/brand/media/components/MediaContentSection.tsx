import { Spinner } from '@/components/ui/spinner';
import { useMediaCategoriesQuery, useMediaQuery } from '@/data/media/media.query';
import { filterMediaItems, normalizeMediaCategoryOptions, normalizeMediaList } from '@/data/media/media.service';
import type { BrandMediaListItemView } from '@/data/pages/pages.mapper';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import PortfolioSearchBar from '@/pages/brand/portfolio/components/PortfolioSearchBar';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';

import MediaCategoryFilter from './MediaCategoryFilter';
import MediaMasonryGrid from './MediaMasonryGrid';

const MediaContentSection = () => {
  const { t: tCommon } = useTranslation('common');
  const [search, setSearch] = useState('');
  const [searchParams, setSearchParams] = useSearchParams();

  const categoryParam = searchParams.get('category_id');
  const selectedCategoryId = categoryParam && !isNaN(Number(categoryParam)) ? Number(categoryParam) : undefined;

  const handleSelectCategory = (categoryId?: number) => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (categoryId !== undefined) {
          next.set('category_id', String(categoryId));
        } else {
          next.delete('category_id');
        }
        return next;
      },
      { replace: true },
    );
  };

  const { data: categoryList = [] } = useMediaCategoriesQuery();

  const {
    data: infiniteData,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useMediaQuery({ category_id: selectedCategoryId, per_page: 20 });

  const allMediaItems = useMemo<BrandMediaListItemView[]>(
    () => normalizeMediaList(infiniteData?.pages.flatMap((page) => page.data?.media ?? [])),
    [infiniteData?.pages],
  );

  const { sentinelRef, debouncedSearch } = useInfiniteScroll({
    onLoadMore: fetchNextPage,
    hasMore: hasNextPage,
    isLoading: isFetchingNextPage,
    searchValue: search,
    debounceDelay: 300,
    rootMargin: '600px',
  });

  const categoryOptions = useMemo(() => normalizeMediaCategoryOptions(categoryList), [categoryList]);

  const filteredItems = useMemo(() => filterMediaItems(allMediaItems, debouncedSearch), [allMediaItems, debouncedSearch]);

  return (
    <div className='flex flex-col gap-16 py-10 md:py-16'>
      <div className='mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 lg:flex-row lg:items-start lg:gap-10'>
        <aside className='flex w-full shrink-0 flex-col gap-6 lg:w-72'>
          <PortfolioSearchBar
            value={search}
            onChange={setSearch}
            placeholder='검색어 입력하세요'
            ariaLabel='언론 검색'
            variant='prominent'
          />
          {categoryOptions.length > 0 && (
            <MediaCategoryFilter
              options={categoryOptions}
              selectedCategoryId={selectedCategoryId}
              onSelectCategory={handleSelectCategory}
            />
          )}
        </aside>

        <div className='min-w-0 flex-1'>
          {isLoading ? (
            <div
              role='status'
              className='flex min-h-60 items-center justify-center rounded-2xl border border-neutral-800 bg-neutral-900/50 p-8 text-neutral-500'>
              {tCommon('title.loading')}
            </div>
          ) : (
            <>
              <MediaMasonryGrid items={filteredItems} />
              <div ref={sentinelRef} aria-hidden className='h-px' />
              {isFetchingNextPage && (
                <div className='flex items-center justify-center py-6' role='status'>
                  <Spinner className='size-6 text-neutral-500' />
                </div>
              )}

              {!hasNextPage && !isFetchingNextPage && filteredItems.length > 0 && (
                <div className='flex flex-col items-center justify-center gap-3 pt-12 pb-6 text-neutral-500'>
                  <div className='h-px w-12 bg-neutral-800' />
                  <p className='text-xs font-medium tracking-wide'>모든 기사를 불러왔습니다 ({filteredItems.length}개)</p>
                  <button
                    type='button'
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    className='mt-0.5 inline-flex cursor-pointer items-center gap-1.5 text-xs text-neutral-400 transition-colors hover:text-white'>
                    <span>맨 위로 이동</span>
                    <span aria-hidden>↑</span>
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default MediaContentSection;
