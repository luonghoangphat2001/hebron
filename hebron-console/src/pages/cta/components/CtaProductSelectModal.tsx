import AppDialog from '@/components/dialog/AppDialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useProductListQuery } from '@/data/product/product.query';
import type { Product } from '@/data/product/product.response';
import { formatCurrency } from '@/utils/helper/common.helper';
import { appToast } from '@/components/toast/AppToast';
import { ChevronLeft, ChevronRight, PackageOpen, Search } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

type Props = {
  open: boolean;
  setOpen: (open: boolean) => void;
  selectedProductIds?: number[];
  onConfirm: (selectedProducts: Product[]) => void;
  mode?: 'single' | 'multiple';
  title?: string;
  maxSelectable?: number;
};

export const CtaProductSelectModal: React.FC<Props> = ({
  open,
  setOpen,
  selectedProductIds = [],
  onConfirm,
  mode = 'multiple',
  title,
  maxSelectable,
}) => {
  const { t: tCommon } = useTranslation('common');
  const { t: tContent } = useTranslation('content');

  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedMap, setSelectedMap] = useState<Map<number, Product>>(new Map());

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const { data, isLoading } = useProductListQuery({
    search_term: debouncedSearch || undefined,
    page,
    per_page: 8,
    is_public: true,
  });

  const products = (data?.list || []).filter((p) => p.is_public !== false);
  const pagination = data?.pagination;
  const totalPages = pagination?.total_page || 1;
  const totalItems = pagination?.total_item || 0;

  const toggleSelect = (product: Product) => {
    if (mode === 'single') {
      onConfirm([product]);
      setSearchTerm('');
      setDebouncedSearch('');
      setPage(1);
      setSelectedMap(new Map());
      setOpen(false);
      return;
    }
    setSelectedMap((prev) => {
      const next = new Map(prev);
      if (next.has(product.id)) {
        next.delete(product.id);
      } else {
        if (maxSelectable !== undefined && next.size >= maxSelectable) {
          appToast.warning(
            tContent('cta.max_limit_reached', {
              max: maxSelectable,
              defaultValue: `최대 ${maxSelectable}개까지만 선택 가능합니다.`,
            }),
          );
          return prev;
        }
        next.set(product.id, product);
      }
      return next;
    });
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setSearchTerm('');
      setDebouncedSearch('');
      setPage(1);
      setSelectedMap(new Map());
    }
    setOpen(nextOpen);
  };

  const handleConfirm = () => {
    onConfirm(Array.from(selectedMap.values()));
    setSearchTerm('');
    setDebouncedSearch('');
    setPage(1);
    setSelectedMap(new Map());
    setOpen(false);
  };

  return (
    <AppDialog
      open={open}
      onOpenChange={handleOpenChange}
      title={title || tContent('cta.select_products', '상품 선택')}
      onOk={mode === 'single' ? undefined : handleConfirm}
      okDisabled={selectedMap.size === 0}
      textOk={mode === 'single' ? undefined : tCommon('button.ok')}
      className='sm:max-w-2xl'>
      <div className='space-y-4'>
        {/* Search Bar */}
        <div className='relative'>
          <Search className='text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2' />
          <Input
            placeholder={tContent('cta.product_search_placeholder', '상품명 또는 상품코드로 검색')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className='pl-9'
          />
        </div>

        {/* Product List */}
        <div className='border-border divide-border min-h-[360px] divide-y overflow-hidden rounded-lg border'>
          {isLoading ? (
            <div className='space-y-3 p-4'>
              {Array.from({ length: 5 }).map((_, idx) => (
                <div key={idx} className='flex items-center gap-3'>
                  <Skeleton className='h-5 w-5 rounded' />
                  <Skeleton className='h-12 w-12 rounded-md' />
                  <div className='flex-1 space-y-2'>
                    <Skeleton className='h-4 w-1/2' />
                    <Skeleton className='h-3 w-1/4' />
                  </div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className='text-muted-foreground flex flex-col items-center justify-center py-16 text-center'>
              <PackageOpen className='mb-2 h-10 w-10 opacity-40' />
              <p className='text-sm font-medium'>{tCommon('message.no_data', '검색 결과가 없습니다.')}</p>
            </div>
          ) : (
            <div className='max-h-[380px] overflow-y-auto'>
              {products.map((product) => {
                const isAlreadyAdded = selectedProductIds.includes(product.id);
                const isSelected = selectedMap.has(product.id);
                const isLimitReached =
                  mode === 'multiple' && maxSelectable !== undefined && !isSelected && selectedMap.size >= maxSelectable;
                const name = product.name?.ko || product.name?.en || '-';
                const imageUrl = product.first_image || product.images?.[0];

                return (
                  <div
                    key={product.id}
                    onClick={() => {
                      if (isAlreadyAdded || isLimitReached) return;
                      toggleSelect(product);
                    }}
                    className={`flex items-center gap-3.5 p-3 transition-colors ${
                      isAlreadyAdded || isLimitReached ? 'cursor-not-allowed opacity-50' : 'hover:bg-muted/50 cursor-pointer'
                    } ${isSelected ? 'bg-primary/5' : ''}`}>
                    <Checkbox
                      checked={isSelected || isAlreadyAdded}
                      disabled={isAlreadyAdded || isLimitReached}
                      onCheckedChange={() => {
                        if (!isAlreadyAdded && !isLimitReached) {
                          toggleSelect(product);
                        }
                      }}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <div className='bg-muted/40 border-border relative h-12 w-12 shrink-0 overflow-hidden rounded-md border'>
                      {imageUrl ? (
                        <img src={imageUrl} alt={name} className='h-full w-full object-cover' />
                      ) : (
                        <div className='text-muted-foreground flex h-full w-full items-center justify-center text-[10px]'>
                          No img
                        </div>
                      )}
                    </div>
                    <div className='min-w-0 flex-1'>
                      <div className='flex items-center gap-2'>
                        <p className='text-foreground truncate text-sm font-medium'>{name}</p>
                        {isAlreadyAdded && (
                          <Badge variant='outline' className='text-[10px]'>
                            {tContent('cta.already_added', '이미 추가됨')}
                          </Badge>
                        )}
                      </div>
                      <div className='text-muted-foreground mt-0.5 flex items-center gap-3 text-xs'>
                        {product.sku && <span>SKU: {product.sku}</span>}
                        {product.selling_price != null && (
                          <span className='font-semibold text-neutral-700 dark:text-neutral-300'>
                            ₩{formatCurrency(product.selling_price)}
                          </span>
                        )}
                      </div>
                    </div>
                    <Badge variant='secondary' className='font-mono text-xs'>
                      #{product.id}
                    </Badge>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer info & Pagination */}
        <div className='flex items-center justify-between pt-1'>
          <div className='flex items-center gap-2'>
            <span className='text-muted-foreground text-xs'>
              {tContent('cta.total_products_count', { count: totalItems, defaultValue: `총 ${totalItems}개 상품` })}
            </span>
            {selectedMap.size > 0 && (
              <Badge variant='default' className='text-xs'>
                {tContent('cta.selected_count', {
                  count: selectedMap.size,
                  defaultValue: `${selectedMap.size}개 선택됨`,
                })}
                {maxSelectable !== undefined && ` (최대 ${maxSelectable}개)`}
              </Badge>
            )}
          </div>

          {totalPages > 1 && (
            <div className='flex items-center gap-1.5'>
              <Button
                type='button'
                variant='outline'
                size='icon-sm'
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1 || isLoading}>
                <ChevronLeft className='h-4 w-4' />
              </Button>
              <span className='text-muted-foreground px-2 text-xs'>
                {page} / {totalPages}
              </span>
              <Button
                type='button'
                variant='outline'
                size='icon-sm'
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages || isLoading}>
                <ChevronRight className='h-4 w-4' />
              </Button>
            </div>
          )}
        </div>
      </div>
    </AppDialog>
  );
};

export default CtaProductSelectModal;
