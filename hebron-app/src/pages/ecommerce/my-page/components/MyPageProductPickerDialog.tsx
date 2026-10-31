import DebouncedSearchInput from '@/components/search/DebouncedSearchInput';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useCategoriesQuery } from '@/data/categories/categories.query';
import { useProductSearchInfiniteQuery } from '@/data/products/products.query';
import type { I18nLanguage } from '@/i18n';
import { cn } from '@/lib/utils';
import MyPageProductPickerCategoryTree from '@/pages/ecommerce/my-page/components/MyPageProductPickerCategoryTree';
import type { QuoteProductOption } from '@/utils/constants/quote-product.constant';
import { getRootCategories, mapProductListItemToOption } from '@/utils/helper/product-picker.helper';
import { ImageIcon, XIcon } from '@phosphor-icons/react';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

const PRODUCT_PICKER_PER_PAGE = 30;

const CATEGORIES_LIST_PARAMS = {
  with_children: true,
  root_only: false,
} as const;

export type MyPageProductPickerLabels = {
  title: string;
  searchPlaceholder: string;
  categoryLabel: string;
  cancel: string;
  confirm: string;
};

type MyPageProductPickerBodyProps = {
  selectedProductId?: string;
  showCategory?: boolean;
  labels: MyPageProductPickerLabels;
  onConfirm: (product: QuoteProductOption) => void;
  onClose: () => void;
};

type MyPageProductPickerDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sessionKey: number;
  selectedProductId?: string;
  showCategory?: boolean;
  labels: MyPageProductPickerLabels;
  onConfirm: (product: QuoteProductOption) => void;
};

const ProductThumbnail = ({ src, alt }: { src: string; alt: string }) => {
  if (!src) {
    return (
      <div className='flex size-14 shrink-0 items-center justify-center rounded-lg border border-neutral-100 bg-neutral-50'>
        <ImageIcon className='size-5 text-neutral-300' aria-hidden />
      </div>
    );
  }

  return <img src={src} alt={alt} className='size-14 shrink-0 rounded-lg border border-neutral-100 object-cover' />;
};

const MyPageProductPickerBody = ({
  selectedProductId,
  showCategory = true,
  labels,
  onConfirm,
  onClose,
}: MyPageProductPickerBodyProps) => {
  const { i18n } = useTranslation();
  const lang = (i18n.language === 'en' ? 'en' : 'kr') as I18nLanguage;

  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [expandedCategoryIds, setExpandedCategoryIds] = useState<Set<number>>(() => new Set());
  const [draftProductId, setDraftProductId] = useState(selectedProductId ?? '');
  const [search, setSearch] = useState('');

  const productListRef = useRef<HTMLDivElement>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const { data: categoriesData, isLoading: isCategoriesLoading } = useCategoriesQuery(CATEGORIES_LIST_PARAMS, {
    enabled: showCategory,
  });

  const rootCategories = getRootCategories(categoriesData?.data.categories ?? []);
  const activeCategoryId = selectedCategoryId ?? rootCategories[0]?.id ?? null;
  const categoryIds = showCategory && activeCategoryId != null ? [activeCategoryId] : undefined;

  const {
    data: productsData,
    isLoading: isProductsLoading,
    isFetching: isProductsFetching,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useProductSearchInfiniteQuery(
    {
      q: search.trim() || undefined,
      category_ids: categoryIds,
      per_page: PRODUCT_PICKER_PER_PAGE,
      sort_by: 'latest',
    },
    {
      enabled: !showCategory || categoryIds != null,
    },
  );

  const products = (productsData?.pages ?? []).flatMap((page) =>
    (page.data.products ?? []).map((product) => mapProductListItemToOption(product, lang)),
  );
  const draftProduct = products.find((product) => product.id === draftProductId);

  useEffect(() => {
    const root = productListRef.current;
    const target = loadMoreRef.current;
    if (!root || !target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasNextPage && !isFetchingNextPage) {
          void fetchNextPage();
        }
      },
      { root, rootMargin: '120px' },
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage, products.length]);

  const handleToggleExpand = (categoryId: number) => {
    setExpandedCategoryIds((prev) => {
      const next = new Set(prev);
      if (next.has(categoryId)) {
        next.delete(categoryId);
      } else {
        next.add(categoryId);
      }
      return next;
    });
  };

  const handleConfirm = () => {
    if (!draftProduct) return;
    onConfirm(draftProduct);
    onClose();
  };

  const isInitialProductLoading =
    (showCategory && isCategoriesLoading) || isProductsLoading || (isProductsFetching && products.length === 0);
  const showProductEmpty = !isInitialProductLoading && products.length === 0;

  return (
    <>
      <DialogHeader className='flex flex-row items-center justify-between border-b border-neutral-200 px-4 py-4 md:px-6'>
        <DialogTitle className='text-lg font-bold text-neutral-950 md:text-xl'>{labels.title}</DialogTitle>
        <button
          type='button'
          onClick={onClose}
          className='flex size-9 cursor-pointer items-center justify-center rounded-full bg-neutral-100'
          aria-label='닫기'>
          <XIcon className='size-5 text-neutral-950' weight='bold' />
        </button>
      </DialogHeader>

      <div className='border-b border-neutral-200 px-4 py-3 md:px-6'>
        <DebouncedSearchInput
          defaultValue={search}
          onDebouncedChange={setSearch}
          placeholder={labels.searchPlaceholder}
          aria-label={labels.searchPlaceholder}
        />
      </div>

      <div className='flex min-h-0 flex-1 overflow-hidden px-4 md:px-6'>
        {showCategory ? (
          <aside className='flex w-32 shrink-0 flex-col gap-1 overflow-y-auto border-r border-neutral-200 py-3 pr-3 md:w-44'>
            <p className='text-xs font-semibold text-neutral-400'>{labels.categoryLabel}</p>
            {isCategoriesLoading ? (
              <p className='px-2 py-2 text-sm text-neutral-400'>불러오는 중...</p>
            ) : (
              <MyPageProductPickerCategoryTree
                categories={rootCategories}
                activeCategoryId={activeCategoryId}
                expandedIds={expandedCategoryIds}
                lang={lang}
                onSelect={setSelectedCategoryId}
                onToggleExpand={handleToggleExpand}
              />
            )}
          </aside>
        ) : null}

        <div ref={productListRef} className={cn('min-w-0 flex-1 overflow-y-auto py-3', showCategory && 'pl-3')}>
          {isInitialProductLoading ? (
            <p className='px-3 py-6 text-center text-sm text-neutral-400'>불러오는 중...</p>
          ) : showProductEmpty ? (
            <p className='px-3 py-6 text-center text-sm text-neutral-400'>상품이 없습니다.</p>
          ) : (
            <ul className='flex flex-col gap-2'>
              {products.map((product) => {
                const isSelected = product.id === draftProductId;

                return (
                  <li key={product.id}>
                    <button
                      type='button'
                      onClick={() => setDraftProductId(product.id)}
                      className={cn(
                        'flex w-full cursor-pointer gap-3 rounded-lg p-3 text-left transition-colors',
                        isSelected ? 'bg-blue-brand-25' : 'hover:bg-neutral-50',
                      )}>
                      <ProductThumbnail src={product.thumbnail} alt={product.name} />
                      <div className='min-w-0 flex-1'>
                        <p className={cn('text-sm font-semibold', isSelected ? 'text-blue-brand-700' : 'text-neutral-950')}>
                          {product.name}
                        </p>
                        {product.specs ? (
                          <p className={cn('line-clamp-2 text-xs', isSelected ? 'text-blue-brand-700' : 'text-neutral-500')}>
                            {product.specs}
                          </p>
                        ) : null}
                      </div>
                    </button>
                  </li>
                );
              })}
              <li aria-hidden>
                <div ref={loadMoreRef} className='h-1' />
              </li>
              {isFetchingNextPage ? (
                <li>
                  <p className='px-3 py-3 text-center text-sm text-neutral-400'>불러오는 중...</p>
                </li>
              ) : null}
            </ul>
          )}
        </div>
      </div>

      <div className='flex shrink-0 gap-2 border-t border-neutral-200 p-4 md:justify-end md:gap-3 md:px-6'>
        <Button type='button' variant='outline' className='flex-1 cursor-pointer md:w-37 md:flex-none' onClick={onClose}>
          {labels.cancel}
        </Button>
        <Button type='button' className='flex-1 md:w-37 md:flex-none' onClick={handleConfirm} disabled={!draftProduct}>
          {labels.confirm}
        </Button>
      </div>
    </>
  );
};

const MyPageProductPickerDialog = ({
  open,
  onOpenChange,
  sessionKey,
  selectedProductId,
  showCategory = true,
  labels,
  onConfirm,
}: MyPageProductPickerDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        aria-describedby={undefined}
        className={cn(
          'flex h-[calc(100dvh-2rem)] w-full flex-col gap-0 overflow-hidden bg-white p-0',
          'sm:max-w-[min(48rem,calc(100%-2rem))]',
          'max-sm:top-auto max-sm:right-2 max-sm:bottom-2 max-sm:left-2 max-sm:w-auto max-sm:max-w-none max-sm:translate-x-0 max-sm:translate-y-0',
          'max-sm:rounded-2xl',
        )}>
        {open ? (
          <MyPageProductPickerBody
            key={sessionKey}
            selectedProductId={selectedProductId}
            showCategory={showCategory}
            labels={labels}
            onConfirm={onConfirm}
            onClose={() => onOpenChange(false)}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
};

export default MyPageProductPickerDialog;
