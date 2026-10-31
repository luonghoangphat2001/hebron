import AppDialog from '@/components/dialog/AppDialog';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useProductInfiniteQuery } from '@/data/product/product.query';
import type { Product } from '@/data/product/product.response';
import { Check, Loader2, PackageOpen, Search, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState, type UIEvent } from 'react';
import { useTranslation } from 'react-i18next';

export type ProductPickerItem = {
  id: number | string;
  name: string;
  slug: string;
};

type Props = {
  open: boolean;
  setOpen: (open: boolean) => void;
  initialProducts: ProductPickerItem[];
  onConfirm: (productIds: number[]) => void;
  isSaving?: boolean;
};

const toSelectedMap = (products: ProductPickerItem[]) =>
  new Map<number, ProductPickerItem>(
    products.map((product) => [Number(product.id), { ...product, id: Number(product.id) }] as const),
  );

const ProductPicker = ({ open, setOpen, initialProducts, onConfirm, isSaving = false }: Props) => {
  const { t: tCommon, i18n } = useTranslation('common');
  const { t } = useTranslation('option');
  const [keyword, setKeyword] = useState('');
  const [debouncedKeyword, setDebouncedKeyword] = useState('');
  const [selectedProducts, setSelectedProducts] = useState<Map<number, ProductPickerItem>>(new Map());
  const wasOpen = useRef(false);

  useEffect(() => {
    if (!open) {
      wasOpen.current = false;
      return;
    }
    if (wasOpen.current) return;

    wasOpen.current = true;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setKeyword('');
    setDebouncedKeyword('');
    setSelectedProducts(toSelectedMap(initialProducts));
  }, [open, initialProducts]);

  useEffect(() => {
    if (!open) return;

    const timer = setTimeout(() => setDebouncedKeyword(keyword.trim()), 350);
    return () => clearTimeout(timer);
  }, [keyword, open]);

  const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } = useProductInfiniteQuery(
    { search_term: debouncedKeyword || undefined },
    open,
  );

  const products = data?.products ?? [];
  const selectedCount = selectedProducts.size;
  const selectedItems = useMemo(() => Array.from(selectedProducts.values()), [selectedProducts]);

  const getProductName = (product: Product) => {
    const isKorean = i18n.language === 'kr';
    return isKorean ? product.name.ko || product.name.en || '-' : product.name.en || product.name.ko || '-';
  };

  const toggleProduct = (product: Product) => {
    setSelectedProducts((previous) => {
      const next = new Map(previous);

      if (next.has(product.id)) {
        next.delete(product.id);
      } else {
        next.set(product.id, {
          id: product.id,
          name: getProductName(product),
          slug: product.slug,
        });
      }

      return next;
    });
  };

  const removeProduct = (id: number) =>
    setSelectedProducts((previous) => {
      const next = new Map(previous);
      next.delete(id);
      return next;
    });

  const handleListScroll = (event: UIEvent<HTMLDivElement>) => {
    if (!hasNextPage || isFetchingNextPage) return;

    const { scrollHeight, scrollTop, clientHeight } = event.currentTarget;
    if (scrollHeight - scrollTop - clientHeight < 120) fetchNextPage();
  };

  return (
    <AppDialog
      open={open}
      onOpenChange={setOpen}
      title={t('assign_products.title')}
      onOk={() => onConfirm(Array.from(selectedProducts.keys()))}
      loading={isSaving}
      className='sm:max-w-2xl'>
      <div className='space-y-4'>
        <div className='relative'>
          <Search className='text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2' />
          <Input
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            placeholder={t('assign_products.search_placeholder')}
            className='pl-9'
          />
          {keyword && (
            <button
              type='button'
              onClick={() => setKeyword('')}
              className='text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2'
              aria-label={tCommon('button.reset')}>
              <X className='size-4' />
            </button>
          )}
        </div>

        {selectedCount > 0 && (
          <div className='bg-muted/40 rounded-md border p-2.5'>
            <p className='mb-2 text-xs font-medium'>{t('assign_products.selected_count', { count: selectedCount })}</p>
            <div className='flex max-h-24 flex-wrap gap-1 overflow-y-auto'>
              {selectedItems.map((product) => (
                <Badge
                  key={product.id}
                  variant='secondary'
                  className='max-w-full gap-1 rounded-sm border border-gray-300 font-normal'>
                  <span className='truncate'>{product.name}</span>
                  <button
                    type='button'
                    onClick={() => removeProduct(Number(product.id))}
                    className='cursor-pointer'
                    aria-label={t('assign_products.remove_product', { name: product.name })}>
                    <X className='size-3' />
                  </button>
                </Badge>
              ))}
            </div>
          </div>
        )}

        <div className='divide-border min-h-80 overflow-hidden rounded-md border'>
          {isLoading ? (
            <div className='space-y-3 p-4'>
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className='flex items-center gap-3'>
                  <Skeleton className='size-4 rounded' />
                  <Skeleton className='size-11 rounded-md' />
                  <div className='flex-1 space-y-2'>
                    <Skeleton className='h-4 w-2/5' />
                    <Skeleton className='h-3 w-1/4' />
                  </div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className='text-muted-foreground flex min-h-80 flex-col items-center justify-center text-center'>
              <PackageOpen className='mb-2 size-9 opacity-40' />
              <p className='text-sm'>{tCommon('empty.no_result')}</p>
            </div>
          ) : (
            <div className='max-h-80 overflow-y-auto' onScroll={handleListScroll}>
              {products.map((product) => {
                const isSelected = selectedProducts.has(product.id);
                const name = getProductName(product);
                const imageUrl = product.first_image || product.images?.[0];

                return (
                  <div
                    key={product.id}
                    onClick={() => toggleProduct(product)}
                    className={`hover:bg-muted/50 flex w-full cursor-pointer items-center gap-3 p-3 text-left transition-colors ${
                      isSelected ? 'bg-primary/5' : ''
                    }`}>
                    <span
                      aria-hidden='true'
                      className={`flex size-4 shrink-0 items-center justify-center rounded-[4px] border ${
                        isSelected ? 'border-primary bg-primary text-primary-foreground' : 'border-input bg-background'
                      }`}>
                      {isSelected && <Check className='size-3' />}
                    </span>
                    <div className='bg-muted relative size-11 shrink-0 overflow-hidden rounded-md border'>
                      <PackageOpen className='text-muted-foreground absolute inset-0 m-auto size-4' />
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt=''
                          className='absolute inset-0 size-full object-cover'
                          onError={(event) => {
                            event.currentTarget.style.display = 'none';
                          }}
                        />
                      ) : null}
                    </div>
                    <div className='min-w-0 flex-1'>
                      <p className='truncate text-sm font-medium'>{name}</p>
                      <p className='text-muted-foreground truncate text-xs'>
                        {product.sku ? `SKU: ${product.sku}` : product.slug}
                      </p>
                    </div>
                    {/* <Badge variant='outline' className='shrink-0 font-mono text-xs'>
                      #{product.id}
                    </Badge> */}
                  </div>
                );
              })}
              <div className='flex min-h-10 items-center justify-center'>
                {isFetchingNextPage && <Loader2 className='text-muted-foreground size-4 animate-spin' />}
              </div>
            </div>
          )}
        </div>
      </div>
    </AppDialog>
  );
};

export default ProductPicker;
