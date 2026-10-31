import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import useInfiniteScroll from '@/hooks/useInfiniteScroll';
import { cn } from '@/lib/utils';
import { Loader2, Plus, Search, X } from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { DialogListDataItem } from '@/data/homepage-management/homepage.type';

export type { DialogListDataItem };

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  searchPlaceholder?: string;
  icon?: React.ReactNode;
  items: DialogListDataItem[];
  isLoading?: boolean;
  hasMore?: boolean;
  isLoadingMore?: boolean;
  onLoadMore?: () => void;
  existingKeys?: (string | number)[];
  onConfirm: (selectedKeys: any[], selectedItems: any[]) => void;
};

export const DialogListData: React.FC<Props> = ({
  open,
  onOpenChange,
  title,
  description,
  searchPlaceholder,
  icon,
  items = [],
  isLoading = false,
  hasMore = false,
  isLoadingMore = false,
  onLoadMore,
  existingKeys = [],
  onConfirm,
}) => {
  const { t: tCommon } = useTranslation('common');
  const { t: tContent } = useTranslation('content');
  const [searchKeyword, setSearchKeyword] = useState('');

  const { sentinelRef, debouncedSearch } = useInfiniteScroll({
    searchValue: searchKeyword,
    debounceDelay: 700,
    onLoadMore: onLoadMore || (() => {}),
    hasMore: Boolean(hasMore),
    isLoading: isLoadingMore,
    rootMargin: '150px',
  });

  const filteredItems = useMemo(() => {
    if (!debouncedSearch.trim()) return items;
    const kw = debouncedSearch.toLowerCase();
    return items.filter(
      (item) =>
        item.title.toLowerCase().includes(kw) ||
        (item.subtitle && item.subtitle.toLowerCase().includes(kw)) ||
        (item.badge && item.badge.toLowerCase().includes(kw)) ||
        (item.extraInfo && item.extraInfo.toLowerCase().includes(kw)),
    );
  }, [items, debouncedSearch]);

  const handleSelectItem = (item: DialogListDataItem) => {
    if (existingKeys.includes(item.key)) return;
    onConfirm([item.key], [item.rawItem ?? item]);
    setSearchKeyword('');
    onOpenChange(false);
  };

  if (!open) return null;

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) setSearchKeyword('');
        onOpenChange(v);
      }}>
      <DialogContent className='flex max-h-[90vh] flex-col overflow-hidden p-6 sm:max-w-2xl'>
        <div className='flex h-full flex-col space-y-4'>
          <DialogHeader className='shrink-0 pb-1'>
            <DialogTitle className='flex items-center gap-2 text-base font-bold'>
              {icon}
              <span>{title}</span>
            </DialogTitle>
            {description && <DialogDescription className='text-xs'>{description}</DialogDescription>}
          </DialogHeader>

          {/* Search Input */}
          <div className='relative shrink-0'>
            <Search className='text-muted-foreground absolute top-2.5 left-3 h-4 w-4' />
            <Input
              placeholder={searchPlaceholder || tContent('homepage.search_items_placeholder')}
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              className='h-9 pr-8 pl-9 text-xs'
            />
            {searchKeyword && (
              <button
                type='button'
                onClick={() => setSearchKeyword('')}
                className='text-muted-foreground hover:text-foreground absolute top-2.5 right-2.5'>
                <X className='h-4 w-4' />
              </button>
            )}
          </div>

          {/* Items List Container */}
          <div className='max-h-[50vh] min-h-[160px] flex-1 space-y-2 overflow-y-auto pr-1.5'>
            {isLoading ? (
              <div className='text-muted-foreground flex flex-col items-center justify-center py-12 text-xs'>
                <Loader2 className='text-primary mb-2 h-6 w-6 animate-spin' />
                <span>{tContent('homepage.loading_items')}</span>
              </div>
            ) : filteredItems.length > 0 ? (
              <>
                {filteredItems.map((item) => {
                  const isAlreadyAdded = existingKeys.includes(item.key);

                  return (
                    <div
                      key={item.key}
                      onClick={() => handleSelectItem(item)}
                      className={cn(
                        'flex items-center justify-between gap-3.5 rounded-xl border p-3 transition-all select-none',
                        isAlreadyAdded
                          ? 'bg-muted/40 border-border/70 cursor-not-allowed opacity-60'
                          : 'bg-card hover:bg-accent/40 hover:border-primary/40 border-border cursor-pointer shadow-2xs',
                      )}>
                      <div className='flex min-w-0 flex-1 items-start gap-3'>
                        {/* Optional Thumbnail */}
                        {/* {item.image !== undefined && (
                          <div className='bg-muted flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-lg border text-[10px] font-bold'>
                            {item.image ? (
                              <img src={item.image} alt={item.title} className='h-full w-full object-cover' />
                            ) : (
                              <span className='text-muted-foreground font-mono'>#{item.key}</span>
                            )}
                          </div>
                        )} */}

                        {/* Text Content */}
                        <div className='min-w-0 flex-1 space-y-1'>
                          <div className='flex flex-wrap items-center gap-2'>
                            {item.badge && (
                              <Badge
                                variant='outline'
                                className='bg-primary/5 text-primary border-primary/20 px-2 py-0.5 text-[10px] font-semibold'>
                                {item.badge}
                              </Badge>
                            )}
                            <p className='text-foreground line-clamp-1 text-sm leading-snug font-bold'>{item.title}</p>
                          </div>

                          {/* {item.subtitle && (
                            <p className='text-muted-foreground line-clamp-2 text-[11px] leading-relaxed'>{item.subtitle}</p>
                          )} */}

                          {item.extraInfo && (
                            <div className='pt-0.5'>
                              <span className='text-primary text-xs font-bold'>{item.extraInfo}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Action / Status Badge */}
                      <div className='shrink-0 pl-2'>
                        {isAlreadyAdded ? (
                          <Badge variant='secondary' className='px-2 text-[10px] font-normal'>
                            {tContent('homepage.badge_added')}
                          </Badge>
                        ) : (
                          <Button
                            size='sm'
                            variant='outline'
                            className='hover:border-primary hover:bg-primary hover:text-primary-foreground h-7 gap-1 text-xs font-semibold'>
                            <Plus className='h-3 w-3' /> {tCommon('button.select')}
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}

                {/* Infinite scroll sentinel trigger element */}
                {onLoadMore && (
                  <div ref={sentinelRef} className='flex items-center justify-center py-2'>
                    {isLoadingMore && (
                      <div className='text-muted-foreground flex items-center gap-2 py-2 text-xs'>
                        <Loader2 className='text-primary h-4 w-4 animate-spin' />
                        <span>{tContent('homepage.loading_items')}</span>
                      </div>
                    )}
                  </div>
                )}
              </>
            ) : (
              <div className='text-muted-foreground py-12 text-center text-xs'>
                {searchKeyword ? tContent('homepage.no_matching_items') : tContent('homepage.no_items_available')}
              </div>
            )}
          </div>

          {/* Footer */}
          <DialogFooter className='border-border/60 flex shrink-0 items-center justify-end gap-2 border-t pt-3'>
            <Button
              type='button'
              variant='outline'
              size='sm'
              onClick={() => {
                setSearchKeyword('');
                onOpenChange(false);
              }}>
              {tCommon('button.close')}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DialogListData;
