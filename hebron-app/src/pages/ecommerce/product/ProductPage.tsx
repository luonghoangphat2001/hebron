import { InPressSample } from '@/assets/images';
import CustomTablePagination from '@/components/table/CustomTablePagination';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useCategoryChildrenQuery } from '@/data/categories/categories.query';
import type { CategoryRESP } from '@/data/categories/categories.response';
import {
  getPriceFromInput,
  getSearchPositiveInteger,
  getSearchPrice,
  getSelectedCategoryIds,
} from '@/data/products/product.service';
import { useProductSearchByCategoryQuery } from '@/data/products/products.query';
import type { ProductSearchSortBy } from '@/data/products/products.request';
import { useIsMobile } from '@/hooks/useIsMobile';
import { cn } from '@/lib/utils';
import { PRODUCT_VIEW_OPTIONS } from '@/utils/constants/product.constant';
import { SearchParams } from '@/utils/enums/common.enum';
import { ProductColumnView, ProductSearchParams } from '@/utils/enums/product.enum';
import { formatNumber } from '@/utils/helper/common.helper';
import { getLeafCategories, getLocalizedName } from '@/utils/helper/product-picker.helper';
import { SlidersIcon } from '@phosphor-icons/react';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useSearchParams } from 'react-router-dom';
import ProductCard from './components/ProductCard';
import ProductCardSkeleton from './components/ProductCardSkeleton';
import ProductCategoryBadges from './components/ProductCategoryBadges';
import ProductFilterPanel, { type PriceRangeOption } from './components/ProductFilterPanel';
import ProductMobileFilter from './components/ProductMobileFilter';
import ProductSortOption from './components/ProductSortOption';

const PRODUCT_GRID_DEFAULT_PAGE_SIZES: Record<ProductColumnView, number> = {
  [ProductColumnView.TWO_COLUMNS]: 20,
  [ProductColumnView.THREE_COLUMNS]: 21,
  [ProductColumnView.FOUR_COLUMNS]: 24,
  [ProductColumnView.FIVE_COLUMNS]: 25,
};

const PRODUCT_GRID_PAGE_SIZE_OPTIONS = [10, 20, 21, 24, 25, 50] as const;

const ProductPage = () => {
  const { categorySlug } = useParams<{ categorySlug: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const { t: tCommon } = useTranslation('common');
  const sortOptions: { label: string; value: ProductSearchSortBy }[] = [
    { label: tCommon('title.default_order'), value: 'position' },
    { label: tCommon('title.popular_order'), value: 'popular' },
    { label: tCommon('title.newest_order'), value: 'latest' },
    { label: tCommon('title.price_high_order'), value: 'price_desc' },
    { label: tCommon('title.price_low_order'), value: 'price_asc' },
  ];
  const isMobile = useIsMobile();
  const [selectedSortBy, setSelectedSortBy] = useState<ProductSearchSortBy>('position');
  const [selectedViewOption, setSelectedViewOption] = useState(PRODUCT_VIEW_OPTIONS[1].value);
  const [selectedBadgeBannerCategory, setSelectedBadgeBannerCategory] = useState<CategoryRESP>();
  const selectedCategoryIds = getSelectedCategoryIds(searchParams);
  const selectedPriceRangeValues = searchParams.getAll(ProductSearchParams.PRICE_RANGES);
  const customPriceFrom = getSearchPrice(searchParams, ProductSearchParams.SELLING_PRICE_FROM);
  const customPriceTo = getSearchPrice(searchParams, ProductSearchParams.SELLING_PRICE_TO);
  const pageIndex = (getSearchPositiveInteger(searchParams, SearchParams.PAGE) ?? 1) - 1;
  const queryPageSize = getSearchPositiveInteger(searchParams, SearchParams.PER_PAGE);
  const defaultPageSize = PRODUCT_GRID_DEFAULT_PAGE_SIZES[selectedViewOption];
  const pageSize =
    queryPageSize && PRODUCT_GRID_PAGE_SIZE_OPTIONS.some((size) => size === queryPageSize) ? queryPageSize : defaultPageSize;
  const productGridColumns =
    selectedViewOption === ProductColumnView.TWO_COLUMNS
      ? 'lg:grid-cols-2'
      : selectedViewOption === ProductColumnView.THREE_COLUMNS
        ? 'lg:grid-cols-3'
        : selectedViewOption === ProductColumnView.FOUR_COLUMNS
          ? 'lg:grid-cols-4'
          : 'lg:grid-cols-5';

  const { data: categoryChildren = [] } = useCategoryChildrenQuery(categorySlug);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSelectedBadgeBannerCategory(undefined);
  }, [categorySlug]);

  const topBadgeCategories = useMemo(() => getLeafCategories(categoryChildren), [categoryChildren]);

  const selectedBadgeId = useMemo(
    () => topBadgeCategories.find((category) => selectedCategoryIds.includes(category.id))?.id ?? 'all',
    [selectedCategoryIds, topBadgeCategories],
  );

  const { data: dataProduct, isLoading: isProductsLoading } = useProductSearchByCategoryQuery({
    slug: categorySlug ?? '',
    category_ids: selectedCategoryIds.length ? selectedCategoryIds : undefined,
    selling_price_from: customPriceFrom,
    selling_price_to: customPriceTo,
    sort_by: selectedSortBy,
    page: pageIndex + 1,
    per_page: pageSize,
  });

  const handleBadgeSelect = (id: string | number, category?: CategoryRESP) => {
    setSelectedBadgeBannerCategory(category);
    setSearchParams((params) => {
      const leafCategoryIds = new Set(topBadgeCategories.map((category) => category.id));
      const nextIds = getSelectedCategoryIds(params).filter((categoryId) => !leafCategoryIds.has(categoryId));
      const selectedCategory = topBadgeCategories.find((category) => String(category.id) === String(id));

      if (selectedCategory) nextIds.push(selectedCategory.id);

      params.delete(ProductSearchParams.CATEGORY_IDS);
      nextIds.forEach((categoryId) => params.append(ProductSearchParams.CATEGORY_IDS, String(categoryId)));
      params.set('page', '1');
      return params;
    });
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  };

  const handleCategoryCheckedChange = (categoryId: number, checked: boolean) => {
    setSearchParams((params) => {
      const currentIds = getSelectedCategoryIds(params);
      const nextIds = checked ? [...new Set([...currentIds, categoryId])] : currentIds.filter((id) => id !== categoryId);

      params.delete(ProductSearchParams.CATEGORY_IDS);
      nextIds.forEach((id) => params.append(ProductSearchParams.CATEGORY_IDS, String(id)));
      params.set('page', '1');
      return params;
    });
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  };

  const handlePriceRangeChange = (priceRanges: PriceRangeOption[]) => {
    const sellingPriceFrom =
      priceRanges.length > 0 && priceRanges.every((priceRange) => priceRange.from !== undefined)
        ? Math.min(...priceRanges.map((priceRange) => priceRange.from!))
        : undefined;
    const sellingPriceTo =
      priceRanges.length > 0 && priceRanges.every((priceRange) => priceRange.to !== undefined)
        ? Math.max(...priceRanges.map((priceRange) => priceRange.to!))
        : undefined;

    setSearchParams((params) => {
      params.delete(ProductSearchParams.PRICE_RANGES);
      priceRanges.forEach((priceRange) => params.append(ProductSearchParams.PRICE_RANGES, priceRange.value));
      params.delete(ProductSearchParams.SELLING_PRICE_FROM);
      params.delete(ProductSearchParams.SELLING_PRICE_TO);
      if (sellingPriceFrom !== undefined) params.set(ProductSearchParams.SELLING_PRICE_FROM, String(sellingPriceFrom));
      if (sellingPriceTo !== undefined) params.set(ProductSearchParams.SELLING_PRICE_TO, String(sellingPriceTo));
      params.set(SearchParams.PAGE, '1');
      return params;
    });
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  };

  const handleCustomPriceRangeApply = (priceFrom: string, priceTo: string) => {
    const sellingPriceFrom = getPriceFromInput(priceFrom);
    const sellingPriceTo = getPriceFromInput(priceTo);

    setSearchParams((params) => {
      params.delete(ProductSearchParams.PRICE_RANGES);
      params.delete(ProductSearchParams.SELLING_PRICE_FROM);
      params.delete(ProductSearchParams.SELLING_PRICE_TO);
      if (sellingPriceFrom !== undefined) params.set(ProductSearchParams.SELLING_PRICE_FROM, String(sellingPriceFrom));
      if (sellingPriceTo !== undefined) params.set(ProductSearchParams.SELLING_PRICE_TO, String(sellingPriceTo));
      params.set('page', '1');
      return params;
    });
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  };

  const handleResetFilters = () => {
    setSearchParams((params) => {
      params.delete('category_ids');
      params.delete(ProductSearchParams.PRICE_RANGES);
      params.delete(ProductSearchParams.SELLING_PRICE_FROM);
      params.delete(ProductSearchParams.SELLING_PRICE_TO);
      params.set('page', '1');
      return params;
    });
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  };

  const handlePageChange = (nextPageIndex: number) => {
    setSearchParams((params) => {
      params.set('page', String(nextPageIndex + 1));
      return params;
    });
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  };

  const handlePageSizeChange = (nextPageSize: number) => {
    setSearchParams((params) => {
      params.set('per_page', String(nextPageSize));
      params.set('page', '1');
      return params;
    });
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  };

  const handleViewChange = (nextViewOption: ProductColumnView) => {
    setSelectedViewOption(nextViewOption);
    setSearchParams((params) => {
      params.set(SearchParams.PER_PAGE, String(PRODUCT_GRID_DEFAULT_PAGE_SIZES[nextViewOption]));
      params.set(SearchParams.PAGE, '1');
      return params;
    });
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  };

  const paginationProps = {
    pageIndex,
    pageCount: dataProduct?.pagination.total_page ?? 0,
    totalRows: dataProduct?.pagination.total_item ?? 0,
    pageSize,
    pageSizeOptions: PRODUCT_GRID_PAGE_SIZE_OPTIONS,
    onPageChange: handlePageChange,
    onPageSizeChange: handlePageSizeChange,
  };

  const bannerCategory = selectedBadgeBannerCategory ?? dataProduct?.category;

  return (
    <section className='mb-16'>
      <div className='flex flex-col gap-4'>
        <ProductCategoryBadges categories={categoryChildren} selectedId={selectedBadgeId} onSelect={handleBadgeSelect} />

        <div className='flex items-start gap-10'>
          <div className='hidden md:block'>
            <ProductFilterPanel
              categories={categoryChildren}
              selectedCategoryIds={selectedCategoryIds}
              selectedPriceRangeValues={selectedPriceRangeValues}
              customPriceFrom={customPriceFrom}
              customPriceTo={customPriceTo}
              onCategoryCheckedChange={handleCategoryCheckedChange}
              onPriceRangeChange={handlePriceRangeChange}
              onCustomPriceRangeApply={handleCustomPriceRangeApply}
              onResetFilters={handleResetFilters}
            />
          </div>

          {/**Product Section */}
          <section className='w-full space-y-4 md:flex-1 md:space-y-8'>
            {isProductsLoading ? (
              <Skeleton className='h-31 w-full rounded-xl' />
            ) : (
              <div
                className='relative flex h-31 w-full items-end overflow-hidden p-4 md:p-6'
                style={{
                  borderRadius: '12px',
                  background: `url(${bannerCategory?.image ?? dataProduct?.category.image ?? InPressSample}) lightgray 50% / cover no-repeat`,
                  backdropFilter: 'blur(180px)',
                }}>
                <div className='absolute inset-0 bg-black/50' />
                <p className='text-display-sm relative font-bold text-white'>{getLocalizedName(bannerCategory?.name)}</p>
              </div>
            )}
            {/**Sort - Layout */}
            <div className='flex flex-wrap items-center justify-between gap-x-6 gap-y-3'>
              <p>
                <span className='text-lg font-bold'>{formatNumber(dataProduct?.pagination.total_item)}</span>{' '}
                <span className='text-md text-neutral-500'>{tCommon('title.item')}</span>
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
                      onClick={() => handleViewChange(value)}>
                      <Icon className='size-6' strokeWidth={2.5} />
                    </button>
                  ))}
                </div>
                <Button variant='outline' className='md:hidden'>
                  <SlidersIcon className='size-5' />
                  {tCommon('title.array')}
                </Button>
                <ProductMobileFilter
                  categories={categoryChildren}
                  selectedCategoryIds={selectedCategoryIds}
                  selectedPriceRangeValues={selectedPriceRangeValues}
                  customPriceFrom={customPriceFrom}
                  customPriceTo={customPriceTo}
                  onCategoryCheckedChange={handleCategoryCheckedChange}
                  onPriceRangeChange={handlePriceRangeChange}
                  onCustomPriceRangeApply={handleCustomPriceRangeApply}
                  onResetFilters={handleResetFilters}
                />
              </div>
            </div>

            {/**Product List */}
            <div className={cn('grid grid-cols-2 gap-4 md:grid-cols-3', productGridColumns)}>
              {isProductsLoading
                ? Array.from({ length: 10 }, (_, index) => <ProductCardSkeleton key={index} />)
                : (dataProduct?.list ?? []).map((product) => <ProductCard key={product.id} product={product} />)}
            </div>

            <div className='mt-4 flex justify-center md:-mt-8 md:block md:p-6'>
              <CustomTablePagination {...paginationProps} compact={isMobile} />
            </div>
          </section>
        </div>
      </div>
    </section>
  );
};

export default ProductPage;
