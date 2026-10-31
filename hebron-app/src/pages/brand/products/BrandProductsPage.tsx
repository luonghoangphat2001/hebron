import { BrandScrollReveal } from '@/components/brand/BrandScrollReveal';
import { Skeleton } from '@/components/ui/skeleton';
import { useCategoriesQuery, useCategoryChildrenQuery } from '@/data/categories/categories.query';
import { mapBrandProductsPage } from '@/data/pages/pages.mapper';
import { usePageBySlugQuery } from '@/data/pages/pages.query';
import { BRAND_PRODUCTS_PAGE_SLUG } from '@/data/pages/pages.request';
import { getSearchPositiveInteger, getSelectedCategoryIds } from '@/data/products/product.service';
import { useProductSearchByCategoryQuery } from '@/data/products/products.query';
import BrandHeroSection from '@/pages/brand/components/BrandHeroSection';
import BrandMomentSection from '@/pages/brand/components/BrandMomentSection';
import BrandNav from '@/pages/brand/components/BrandNav';
import BrandPagination from '@/pages/brand/components/BrandPagination';
import { SearchParams, SiteType } from '@/utils/enums/common.enum';
import { ProductSearchParams } from '@/utils/enums/product.enum';
import { getLeafCategories, getRootCategories } from '@/utils/helper/product-picker.helper';
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import BrandProductCard, { BrandProductCardSkeleton } from './components/BrandProductCard';
import BrandProductCategoryTabs from './components/BrandProductCategoryTabs';
import BrandProductFilterSidebar from './components/BrandProductFilterSidebar';

const PAGE_SIZE_OPTIONS = [12, 24, 36] as const;
const ROOT_CATEGORY_QUERY_PARAMS = { root_only: true, with_children: true } as const;
const DEFAULT_PARENT_CATEGORY_SLUG = '주문제작';

const BrandProductsHeroSkeleton = () => (
  <section
    className='relative flex h-80 min-h-80 w-full min-w-0 flex-col overflow-x-hidden bg-neutral-950 md:h-[320px]'
    aria-busy='true'>
    <Skeleton className='absolute inset-0 rounded-none bg-neutral-900' />
    <div className='relative z-10 flex min-h-full flex-1 flex-col'>
      <BrandNav />
      <div className='flex flex-1 items-end justify-center px-4 pb-16'>
        <Skeleton className='h-12 w-36 bg-neutral-800 md:h-15 md:w-52' />
      </div>
    </div>
    <div className='pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-[linear-gradient(180deg,rgba(0,0,0,0)_0%,rgba(10,10,10,0)_50%,#0A0A0A_100%)]' />
  </section>
);

const BrandProductsPage = () => {
  const { data: pageData, isLoading: isPageLoading } = usePageBySlugQuery(BRAND_PRODUCTS_PAGE_SLUG, {
    site_type: SiteType.BRAND_SITE,
  });
  const page = pageData?.data?.page;
  const view = useMemo(() => (page ? mapBrandProductsPage(page) : null), [page]);

  const [searchParams, setSearchParams] = useSearchParams();

  const { data: parentCategoriesData, isLoading: isParentCategoriesLoading } = useCategoriesQuery(ROOT_CATEGORY_QUERY_PARAMS);
  const parentCategories = useMemo(
    () => getRootCategories(parentCategoriesData?.data.categories ?? []),
    [parentCategoriesData?.data.categories],
  );
  const requestedParentSlug = searchParams.get(SearchParams.PARENT_CATEGORY) || '';
  const selectedParentCategory = parentCategories.find((category) => category.slug === requestedParentSlug);
  const selectedParentSlug = selectedParentCategory?.slug || '';
  const selectedCategoryIds = getSelectedCategoryIds(searchParams);
  const searchParam = searchParams.get(SearchParams.SEARCH)?.trim() || '';
  const pageIndex = (getSearchPositiveInteger(searchParams, SearchParams.PAGE) ?? 1) - 1;
  const queryPageSize = getSearchPositiveInteger(searchParams, SearchParams.PER_PAGE);
  const pageSize =
    queryPageSize && PAGE_SIZE_OPTIONS.some((size) => size === queryPageSize) ? queryPageSize : PAGE_SIZE_OPTIONS[0];

  const [search, setSearch] = useState(searchParam);

  useEffect(() => {
    const fallbackParentCategory =
      selectedParentCategory ??
      parentCategories.find((category) => category.slug === DEFAULT_PARENT_CATEGORY_SLUG) ??
      parentCategories[0];
    if (!fallbackParentCategory || fallbackParentCategory.slug === requestedParentSlug) return;

    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.set(SearchParams.PARENT_CATEGORY, fallbackParentCategory.slug);
        next.delete(ProductSearchParams.CATEGORY_IDS);
        next.set(SearchParams.PAGE, '1');
        return next;
      },
      { replace: true },
    );
  }, [parentCategories, requestedParentSlug, selectedParentCategory, setSearchParams]);

  useEffect(() => {
    setSearch(searchParam);
  }, [searchParam]);

  useEffect(() => {
    const timer = setTimeout(() => {
      const nextSearch = search.trim();
      if (nextSearch === searchParam) return;

      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          if (nextSearch) {
            next.set(SearchParams.SEARCH, nextSearch);
          } else {
            next.delete(SearchParams.SEARCH);
          }
          next.set(SearchParams.PAGE, '1');
          return next;
        },
        { replace: true },
      );
    }, 400);
    return () => clearTimeout(timer);
  }, [search, searchParam, setSearchParams]);

  const { data: categoryGroups = [], isLoading: isCategoryGroupsLoading } = useCategoryChildrenQuery(selectedParentSlug);
  const leafCategories = useMemo(() => getLeafCategories(categoryGroups), [categoryGroups]);
  const selectedLeafCategoryId = useMemo(
    () => leafCategories.find((category) => selectedCategoryIds.includes(category.id))?.id ?? 'all',
    [leafCategories, selectedCategoryIds],
  );

  const {
    data: categoryProductsData,
    isLoading,
    isFetching,
    isError,
  } = useProductSearchByCategoryQuery({
    slug: selectedParentSlug,
    page: pageIndex + 1,
    per_page: pageSize,
    ...(selectedCategoryIds.length > 0 && { category_ids: selectedCategoryIds }),
    ...(searchParam && { search: searchParam }),
  });

  const products = categoryProductsData?.list ?? [];

  const totalPage = categoryProductsData?.pagination?.total_page ?? 1;
  const safePageIndex = Math.min(pageIndex, Math.max(0, totalPage - 1));
  const isProductListLoading = isParentCategoriesLoading || !selectedParentSlug || isLoading || isFetching;

  const updateParams = (fn: (params: URLSearchParams) => void, scroll = true) => {
    setSearchParams((prev) => {
      fn(prev);
      return prev;
    });
    if (scroll) window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCategoryCheckedChange = (categoryId: number, checked: boolean) =>
    updateParams((params) => {
      const nextIds = checked
        ? [...new Set([...selectedCategoryIds, categoryId])]
        : selectedCategoryIds.filter((id) => id !== categoryId);

      params.delete(ProductSearchParams.CATEGORY_IDS);
      nextIds.forEach((id) => params.append(ProductSearchParams.CATEGORY_IDS, String(id)));
      params.set(SearchParams.PAGE, '1');
    });

  const handleParentCategoryChange = (parentSlug: string) =>
    updateParams((params) => {
      params.set(SearchParams.PARENT_CATEGORY, parentSlug);
      params.delete(ProductSearchParams.CATEGORY_IDS);
      params.set(SearchParams.PAGE, '1');
    });

  const handleLeafCategorySelect = (id: string | number) =>
    updateParams((params) => {
      const leafCategoryIds = new Set(leafCategories.map((category) => category.id));
      const nextIds = getSelectedCategoryIds(params).filter((categoryId) => !leafCategoryIds.has(categoryId));
      const selectedCategory = leafCategories.find((category) => String(category.id) === String(id));

      if (selectedCategory) nextIds.push(selectedCategory.id);

      params.delete(ProductSearchParams.CATEGORY_IDS);
      nextIds.forEach((categoryId) => params.append(ProductSearchParams.CATEGORY_IDS, String(categoryId)));
      params.set(SearchParams.PAGE, '1');
    });

  const handlePageChange = (nextPageIndex: number) =>
    updateParams((params) => params.set(SearchParams.PAGE, String(nextPageIndex + 1)));

  const handlePageSizeChange = (nextPageSize: number) =>
    updateParams((params) => {
      params.set(SearchParams.PAGE, '1');
      params.set(SearchParams.PER_PAGE, String(nextPageSize));
    }, false);

  const renderProductList = () => {
    if (!isProductListLoading && products.length === 0) {
      return (
        <div className='flex min-h-75 flex-col items-center justify-center py-16 text-center'>
          <p className='text-base text-neutral-400'>
            {isError ? '제품 목록을 불러오는 중 오류가 발생했습니다.' : '등록된 제품이 없습니다.'}
          </p>
        </div>
      );
    }

    return (
      <div className='grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3'>
        {isProductListLoading ? (
          <BrandProductCardSkeleton count={pageSize} />
        ) : (
          products.map((product) => <BrandProductCard key={product.id} product={product} />)
        )}
      </div>
    );
  };

  return (
    <main className='min-w-0 overflow-x-hidden bg-neutral-950'>
      {isPageLoading ? (
        <BrandProductsHeroSkeleton />
      ) : (
        <BrandHeroSection
          className='h-80 min-h-80 md:h-[320px]'
          bottomFadeClassName='h-24'
          backgroundImageUrl={view?.heroBackgroundImageUrl}>
          <div className='flex flex-1 flex-col items-center justify-end px-4 pb-16'>
            <BrandScrollReveal variant='fadeUp'>
              <h1 className='text-3xl font-semibold text-white md:text-[48px] md:leading-[60px]'>
                {view?.heroTitle || '기성품'}
              </h1>
            </BrandScrollReveal>
          </div>
        </BrandHeroSection>
      )}

      <section className='mx-auto flex w-full max-w-[1440px] flex-col gap-6 px-4 py-8 md:px-20 md:py-12'>
        <BrandProductCategoryTabs
          parentCategories={parentCategories}
          selectedParentSlug={selectedParentSlug}
          onParentCategoryChange={handleParentCategoryChange}
          leafCategories={leafCategories}
          selectedLeafCategoryId={selectedLeafCategoryId}
          onLeafCategorySelect={handleLeafCategorySelect}
          isLoading={isParentCategoriesLoading || !selectedParentSlug || isCategoryGroupsLoading}
        />

        <div className='flex flex-col gap-6 md:flex-row md:items-start'>
          <BrandProductFilterSidebar
            search={search}
            onSearchChange={setSearch}
            categories={categoryGroups}
            selectedCategoryIds={selectedCategoryIds}
            onCategoryCheckedChange={handleCategoryCheckedChange}
            isLoading={isParentCategoriesLoading || !selectedParentSlug || isCategoryGroupsLoading}
          />

          <div className='flex min-w-0 flex-1 flex-col gap-8'>
            {renderProductList()}

            <BrandPagination
              pageIndex={safePageIndex}
              pageCount={totalPage}
              onPageChange={handlePageChange}
              pageSize={pageSize}
              pageSizeOptions={PAGE_SIZE_OPTIONS}
              onPageSizeChange={handlePageSizeChange}
              className='mt-4'
            />
          </div>
        </div>
      </section>

      <BrandMomentSection data={view?.aboutCta} />
    </main>
  );
};

export default BrandProductsPage;
