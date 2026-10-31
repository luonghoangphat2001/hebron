import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useProductInfiniteQuery } from '@/data/product/product.query';
import type { Product } from '@/data/product/product.response';
import useInfiniteScroll from '@/hooks/useInfiniteScroll';
import { Loader2, Package, Search, X } from 'lucide-react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedProductIds: number[];
  onConfirm: (selectedProducts: Product[]) => void;
};

export const CraftsmanshipProductPickerModal: React.FC<Props> = ({ open, onOpenChange, selectedProductIds = [], onConfirm }) => {
  const { t: tCommon } = useTranslation('common');
  const { t: tContent } = useTranslation('content');
  const { i18n } = useTranslation();
  const isKo = i18n.language === 'kr';

  const [keyword, setKeyword] = useState('');
  const [debouncedKeyword, setDebouncedKeyword] = useState('');
  const [tempSelected, setTempSelected] = useState<Map<number, Product>>(new Map());

  const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } = useProductInfiniteQuery({
    search_term: debouncedKeyword.trim() || undefined,
  });

  const { sentinelRef } = useInfiniteScroll({
    searchValue: keyword,
    debounceDelay: 350,
    onSearchChange: (val) => setDebouncedKeyword(val),
    onLoadMore: () => {
      fetchNextPage();
    },
    hasMore: Boolean(hasNextPage),
    isLoading: isFetchingNextPage,
    rootMargin: '200px',
  });

  const products = data?.products || [];

  const handleToggle = (product: Product) => {
    setTempSelected((prev) => {
      const next = new Map(prev);
      if (next.has(product.id)) {
        next.delete(product.id);
      } else {
        next.set(product.id, product);
      }
      return next;
    });
  };

  const handleSave = () => {
    onConfirm(Array.from(tempSelected.values()));
    setTempSelected(new Map());
    onOpenChange(false);
  };

  const getProductName = (product: Product) => {
    if (typeof product.name === 'string') return product.name;
    return isKo ? product.name?.ko || product.name?.en || '-' : product.name?.en || product.name?.ko || '-';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='flex max-h-[85vh] flex-col overflow-hidden p-6 sm:max-w-2xl'>
        <DialogHeader className='shrink-0 pb-2'>
          <DialogTitle className='flex items-center gap-2 text-base font-bold'>
            <Package className='text-primary h-4 w-4' />
            <span>{tContent('craftsmanship.select_products_title')}</span>
          </DialogTitle>
        </DialogHeader>

        {/* Search input */}
        <div className='relative shrink-0'>
          <Search className='text-muted-foreground absolute top-2.5 left-3 h-4 w-4' />
          <Input
            placeholder={tContent('craftsmanship.search_products')}
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className='h-9 pr-8 pl-9 text-xs'
          />
          {keyword && (
            <button
              type='button'
              onClick={() => setKeyword('')}
              className='text-muted-foreground hover:text-foreground absolute top-2.5 right-2.5'>
              <X className='h-4 w-4' />
            </button>
          )}
        </div>

        {/* Products list with Infinite Scroll */}
        <div className='flex-1 overflow-y-auto pr-1'>
          {isLoading ? (
            <div className='space-y-2 py-4'>
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className='flex items-center gap-3 rounded-lg border p-2.5'>
                  <Skeleton className='h-12 w-12 shrink-0 rounded-md' />
                  <div className='flex-1 space-y-1.5'>
                    <Skeleton className='h-4 w-1/3' />
                    <Skeleton className='h-3 w-1/4' />
                  </div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className='text-muted-foreground flex flex-col items-center justify-center py-12 text-center'>
              <Package className='mb-2 h-8 w-8 opacity-40' />
              <p className='text-xs'>{tContent('homepage.no_items_available')}</p>
            </div>
          ) : (
            <div className='space-y-2 py-2'>
              {products.map((product) => {
                const isAlreadyLinked = selectedProductIds.includes(product.id);
                const isChecked = tempSelected.has(product.id) || isAlreadyLinked;
                const price = product.selling_price || product.supply_price || 0;

                return (
                  <div
                    key={product.id}
                    onClick={() => {
                      if (!isAlreadyLinked) handleToggle(product);
                    }}
                    className={`flex items-center justify-between rounded-lg border p-2.5 transition-all ${
                      isAlreadyLinked
                        ? 'border-border/40 bg-muted/30 cursor-not-allowed opacity-60'
                        : isChecked
                          ? 'border-primary/50 bg-primary/5 cursor-pointer'
                          : 'border-border hover:bg-muted/50 cursor-pointer'
                    }`}>
                    <div className='flex min-w-0 items-center gap-3'>
                      <Checkbox
                        checked={isChecked}
                        disabled={isAlreadyLinked}
                        onCheckedChange={() => {
                          if (!isAlreadyLinked) handleToggle(product);
                        }}
                        className='shrink-0'
                      />
                      <div className='bg-muted relative h-11 w-11 shrink-0 overflow-hidden rounded-md border'>
                        {product.first_image ? (
                          <img src={product.first_image} alt={getProductName(product)} className='h-full w-full object-cover' />
                        ) : (
                          <div className='text-muted-foreground flex h-full w-full items-center justify-center'>
                            <Package className='h-4 w-4' />
                          </div>
                        )}
                      </div>
                      <div className='min-w-0 flex-1'>
                        <div className='flex items-center gap-1.5'>
                          {product.sku && (
                            <span className='bg-muted text-muted-foreground rounded px-1.5 py-0.5 font-mono text-[10px]'>
                              {product.sku}
                            </span>
                          )}
                          <p className='truncate text-xs font-semibold'>{getProductName(product)}</p>
                        </div>
                        <p className='text-muted-foreground text-[11px] font-medium'>₩{Number(price).toLocaleString()}</p>
                      </div>
                    </div>

                    {isAlreadyLinked && (
                      <Badge variant='secondary' className='shrink-0 text-[10px]'>
                        {tContent('homepage.badge_added')}
                      </Badge>
                    )}
                  </div>
                );
              })}

              {/* Infinite scroll sentinel trigger element */}
              <div ref={sentinelRef} className='flex items-center justify-center py-2'>
                {isFetchingNextPage && (
                  <div className='text-muted-foreground flex items-center gap-2 py-2 text-xs'>
                    <Loader2 className='text-primary h-4 w-4 animate-spin' />
                    <span>{tContent('homepage.loading_items')}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className='flex shrink-0 items-center justify-between border-t pt-3'>
          <span className='text-muted-foreground text-xs'>{tempSelected.size > 0 ? `${tempSelected.size} selected` : ''}</span>
          <div className='flex items-center gap-2'>
            <Button type='button' variant='outline' size='sm' onClick={() => onOpenChange(false)}>
              {tCommon('button.cancel')}
            </Button>
            <Button type='button' size='sm' disabled={tempSelected.size === 0} onClick={handleSave}>
              {tCommon('button.save')}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
