import { appToast } from '@/components/toast/AppToast';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Skeleton } from '@/components/ui/skeleton';
import { useCategoryProductInfiniteQuery, useCategoryProductPositionMutation } from '@/data/category/category.query';
import type { CategoryProduct } from '@/data/category/category.response';
import useInfiniteScroll from '@/hooks/useInfiniteScroll';
import { useCan } from '@/hooks/useMenuAccess';
import { cn } from '@/lib/utils';
import { MY_ROUTE } from '@/utils/constants/route.constant';
import { getErrorMessage } from '@/utils/helper/noti-error.helper';
import {
  closestCenter,
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  defaultAnimateLayoutChanges,
  rectSortingStrategy,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  type AnimateLayoutChanges,
} from '@dnd-kit/sortable';
import { Columns2, Grid2x2, Grip, LayoutGrid, Loader2, Package } from 'lucide-react';
import { ToggleGroup } from 'radix-ui';
import { useEffect, useId, useState, type ComponentProps, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';

const GRID_COLUMNS = [
  { value: '2', icon: Columns2, className: 'grid-cols-2' },
  { value: '3', icon: LayoutGrid, className: 'grid-cols-3' },
  { value: '4', icon: Grid2x2, className: 'grid-cols-4' },
  { value: '5', icon: Grip, className: 'grid-cols-5' },
];
const DEFAULT_COLUMNS = GRID_COLUMNS[3];

type Props = {
  categoryId: number;
};

const CategoryProductGrid = ({ categoryId }: Props) => {
  const { t: tCategory } = useTranslation('category');
  const { t: tCommon } = useTranslation('common');
  const can = useCan();

  const { data, isLoading, isError, hasNextPage, isFetchingNextPage, fetchNextPage } =
    useCategoryProductInfiniteQuery(categoryId);
  const positionMutation = useCategoryProductPositionMutation();
  const products = data?.products ?? [];

  // in the URL next to ?tab=, so it survives a refresh and switching category (this grid remounts per category)
  const [searchParams, setSearchParams] = useSearchParams();
  const columns = GRID_COLUMNS.find((option) => option.value === searchParams.get('cols')) ?? DEFAULT_COLUMNS;

  const handleColumnsChange = (value: string) => {
    if (!value) return;
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.set('cols', value);
        return next;
      },
      { replace: true },
    );
  };

  const [activeId, setActiveId] = useState<number | null>(null);

  /**
   * The order as dropped, painted in the same render as the drop — the optimistic cache only reaches
   * React a tick later, and without this the card would snap back to its old slot for a frame.
   * Tied to the list it was built from, so any newer data (optimistic, refetch, rollback) wins.
   */
  const [dropped, setDropped] = useState<{ base: CategoryProduct[]; items: CategoryProduct[] } | null>(null);
  const items = dropped?.base === products ? dropped.items : products;
  const activeProduct = activeId === null ? null : items.find((product) => product.id === activeId);

  const canEdit = can('edit');
  const isDragDisabled = !canEdit || positionMutation.isPending;

  const { sentinelRef } = useInfiniteScroll({
    onLoadMore: fetchNextPage,
    hasMore: Boolean(hasNextPage),
    isLoading: isFetchingNextPage || activeId !== null || positionMutation.isPending,
    rootMargin: '200px',
  });

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
      // Space picks a card up; Enter is left free to open the product (dnd-kit starts on both by default)
      keyboardCodes: { start: ['Space'], cancel: ['Escape'], end: ['Space', 'Enter', 'Tab'] },
    }),
  );

  // cards stay `cursor-pointer` (a click opens the product); only an actual drag grabs — same as the category tree
  useEffect(() => {
    if (activeId === null) return;
    document.body.classList.add('is-dragging');
    return () => document.body.classList.remove('is-dragging');
  }, [activeId]);

  const handleDragStart = ({ active }: DragStartEvent) => setActiveId(Number(active.id));

  const moveProduct = async (productId: number, position: number): Promise<boolean> => {
    if (isDragDisabled || !Number.isInteger(position) || position < 1 || position > (data?.total ?? 0)) return false;
    const from = items.findIndex((product) => product.id === productId);
    if (from < 0) return false;
    if (items[from].position === position) return true;

    const to = items.findIndex((product) => product.position === position);
    // Only animate a move when the destination is loaded. Otherwise the server refetch supplies the new order.
    if (to >= 0) {
      const reordered = arrayMove(items, from, to).map((product, i) => ({ ...product, position: items[i].position }));
      setDropped({ base: products, items: reordered });
    }

    try {
      await positionMutation.mutateAsync({ categoryId, productId, position });
      appToast.success(tCommon('notify.success_update'));
      return true;
    } catch (error) {
      setDropped(null);
      appToast.error(getErrorMessage(error, tCommon('notify.fail_update')));
      return false;
    }
  };

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    setActiveId(null);
    if (!over || active.id === over.id) return;
    const target = items.find((product) => product.id === over.id);
    if (target) void moveProduct(Number(active.id), target.position);
  };

  if (isLoading) return <ProductGridSkeleton className={columns.className} />;

  // a failed background refetch keeps the cached grid on screen; only an empty result says so
  if (items.length === 0) {
    return (
      <div className='text-muted-foreground flex flex-col items-center justify-center gap-3 py-16'>
        <Package className='h-10 w-10' />
        <p className='text-sm'>{tCategory(isError ? 'product.load_fail' : 'product.empty')}</p>
      </div>
    );
  }

  return (
    <div className='space-y-4'>
      <div className='text-muted-foreground flex items-center justify-between gap-3 text-xs'>
        <span>{tCategory('product.total', { count: data?.total ?? 0 })}</span>
        <div className='flex items-center gap-3'>
          {canEdit && <span>{tCategory('product.drag_hint')}</span>}
          <ToggleGroup.Root
            type='single'
            value={columns.value}
            onValueChange={handleColumnsChange}
            className='bg-muted inline-flex items-center gap-0.5 rounded-lg p-0.75'>
            {GRID_COLUMNS.map(({ value, icon: Icon }) => {
              const label = tCategory('product.columns', { count: Number(value) });
              return (
                <ToggleGroup.Item
                  key={value}
                  value={value}
                  aria-label={label}
                  title={label}
                  className='hover:text-foreground data-[state=on]:bg-background data-[state=on]:text-foreground focus-visible:ring-ring/50 rounded-md p-1.5 transition-colors outline-none focus-visible:ring-[3px] data-[state=on]:shadow-sm'>
                  <Icon className='h-4 w-4' />
                </ToggleGroup.Item>
              );
            })}
          </ToggleGroup.Root>
        </div>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={() => setActiveId(null)}>
        <SortableContext items={items.map((product) => product.id)} strategy={rectSortingStrategy} disabled={isDragDisabled}>
          <div className={cn('grid gap-4', columns.className)}>
            {items.map((product) => (
              <SortableProductCard
                key={product.id}
                product={product}
                positionEditor={
                  canEdit ? (
                    <ProductPositionEditor
                      product={product}
                      total={data?.total ?? 0}
                      disabled={positionMutation.isPending || activeId !== null}
                      onMove={moveProduct}
                    />
                  ) : undefined
                }
              />
            ))}
          </div>
        </SortableContext>

        <DragOverlay>{activeProduct && <ProductCard product={activeProduct} className='shadow-lg' />}</DragOverlay>
      </DndContext>

      <div ref={sentinelRef} className='flex justify-center py-2'>
        {isFetchingNextPage && <Loader2 className='text-muted-foreground h-5 w-5 animate-spin' />}
      </div>
    </div>
  );
};

// grid glides the cards into place instead of making them jump — a refetch or rollback that reorders the
const animateLayoutChanges: AnimateLayoutChanges = (args) => defaultAnimateLayoutChanges({ ...args, wasDragging: true });

const SortableProductCard = ({ product, positionEditor }: { product: CategoryProduct; positionEditor?: ReactNode }) => {
  const { setNodeRef, attributes, listeners, transform, transition, isDragging } = useSortable({
    id: product.id,
    animateLayoutChanges,
  });

  // no guard against a drag ending in a click needed: once a drag activates, dnd-kit swallows the click
  const openDetail = () => window.open(MY_ROUTE.PRODUCT.DETAIL(product.id), '_blank', 'noopener,noreferrer');

  return (
    <ProductCard
      ref={setNodeRef}
      product={product}
      positionEditor={positionEditor}
      style={{ transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined, transition }}
      className={cn(isDragging && 'opacity-40')}
      {...attributes}
      {...listeners}
      onClick={openDetail}
      onKeyDown={(event) => {
        listeners?.onKeyDown?.(event);
        // Enter opens the product; mid keyboard-drag it drops the card instead (the sensor's end key)
        if (event.key === 'Enter' && !isDragging) openDetail();
      }}
    />
  );
};

const ProductPositionEditor = ({
  product,
  total,
  disabled,
  onMove,
}: {
  product: CategoryProduct;
  total: number;
  disabled: boolean;
  onMove: (productId: number, position: number) => Promise<boolean>;
}) => {
  const { t } = useTranslation('category');
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(String(product.position));
  const inputId = useId();
  const position = Number(value);
  const valid = value.trim() !== '' && Number.isInteger(position) && position >= 1 && position <= total;

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        if (next) setValue(String(product.position));
        setOpen(next);
      }}>
      <PopoverTrigger asChild>
        <button
          type='button'
          disabled={disabled}
          aria-label={t('product.edit_position', { position: product.position })}
          title={t('product.edit_position', { position: product.position })}
          className='bg-secondary text-secondary-foreground absolute top-2 left-2 h-5 cursor-pointer rounded-sm px-1.5 text-xs font-medium hover:underline focus-visible:ring-2 disabled:cursor-default disabled:opacity-50'
          onPointerDown={(event) => event.stopPropagation()}
          onClick={(event) => event.stopPropagation()}
          onKeyDown={(event) => event.stopPropagation()}>
          #{product.position}
        </button>
      </PopoverTrigger>
      <PopoverContent
        align='start'
        onPointerDown={(event) => event.stopPropagation()}
        onClick={(event) => event.stopPropagation()}
        onKeyDown={(event) => event.stopPropagation()}>
        <form
          className='space-y-3'
          onSubmit={async (event) => {
            event.preventDefault();
            event.stopPropagation();
            if (disabled || !valid) return;
            if (await onMove(product.id, position)) setOpen(false);
          }}>
          <label htmlFor={inputId} className='text-sm font-medium'>
            {t('product.position')}
          </label>
          <Input
            id={inputId}
            type='number'
            min={1}
            max={total}
            step={1}
            required
            value={value}
            disabled={disabled}
            aria-invalid={!valid}
            aria-describedby={`${inputId}-hint`}
            onChange={(event) => setValue(event.target.value)}
          />
          <p id={`${inputId}-hint`} className={cn('text-xs', valid ? 'text-muted-foreground' : 'text-destructive')}>
            {t('product.position_range', { total })}
          </p>
          <div className='flex justify-end gap-2'>
            <Button size='sm' variant='outline' onClick={() => setOpen(false)}>
              {t('detail.cancel')}
            </Button>
            <Button type='submit' size='sm' disabled={disabled || !valid}>
              {t('detail.save')}
            </Button>
          </div>
        </form>
      </PopoverContent>
    </Popover>
  );
};

const ProductCard = ({
  product,
  positionEditor,
  className,
  ...props
}: { product: CategoryProduct; positionEditor?: ReactNode } & ComponentProps<'div'>) => {
  const { ko, en } = product.name;
  const name = en && en !== ko ? `${ko} (${en})` : ko || en;

  return (
    <div
      className={cn(
        'flex cursor-pointer flex-col overflow-hidden rounded-lg border bg-white select-none hover:border-gray-300 hover:shadow-sm',
        className,
      )}
      {...props}>
      <div className='relative aspect-square bg-gray-50'>
        <ProductImage key={product.images[0]} src={product.images[0]} alt={name} />
        {positionEditor ?? (
          <Badge variant='secondary' className='absolute top-2 left-2 h-5 rounded-sm px-1.5 text-xs'>
            #{product.position}
          </Badge>
        )}
      </div>
      <div className='space-y-1 p-3'>
        <p title={name} className='line-clamp-2 text-sm font-medium text-gray-900'>
          {name}
        </p>
        <p className='text-muted-foreground font-mono text-xs'>{product.sku}</p>
      </div>
    </div>
  );
};

// some product images are plain http:// links that the browser may block or that are simply gone
const ProductImage = ({ src, alt }: { src?: string; alt: string }) => {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div className='text-muted-foreground flex h-full items-center justify-center'>
        <Package className='h-8 w-8 opacity-40' />
      </div>
    );
  }

  // draggable={false}: the browser's native image drag would steal the pointer from dnd-kit
  return (
    <img
      src={src}
      alt={alt}
      loading='lazy'
      draggable={false}
      onError={() => setFailed(true)}
      className='h-full w-full object-cover'
    />
  );
};

const ProductGridSkeleton = ({ className }: { className: string }) => (
  <div className={cn('grid gap-4', className)}>
    {Array.from({ length: 8 }, (_, i) => (
      <div key={i} className='overflow-hidden rounded-lg border'>
        <Skeleton className='aspect-square rounded-none' />
        <div className='space-y-2 p-3'>
          <Skeleton className='h-4 w-3/4' />
          <Skeleton className='h-3 w-1/3' />
        </div>
      </div>
    ))}
  </div>
);

export default CategoryProductGrid;
