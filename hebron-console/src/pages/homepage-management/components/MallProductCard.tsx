import { Badge } from '@/components/ui/badge';
import type { ProductItemData } from '@/data/homepage-management/homepage.type';
import { cn } from '@/lib/utils';
import { ProductBadge } from '@/utils/enums/product.enum';
import React, { memo, useState } from 'react';

export type { ProductItemData };

type Props = {
  product: ProductItemData;
  className?: string;
  viewMode?: 'desktop' | 'mobile';
  variant?: 'default' | 'compact' | 'horizontal';
  onClick?: () => void;
};

const PRODUCT_BADGE_STYLE_MAP: Record<string, string> = {
  [ProductBadge.BEST]: 'bg-amber-500 text-slate-950',
  [ProductBadge.HOT]: 'bg-rose-500 text-white',
  [ProductBadge.NEW]: 'bg-emerald-500 text-white',
  [ProductBadge.MD_PICK]: 'bg-purple-500 text-white',
};

const ProductBadges = memo(({ badge }: { badge?: string }) => {
  if (!badge) return null;

  const badgeColorClass = PRODUCT_BADGE_STYLE_MAP[badge] || 'bg-primary text-primary-foreground';

  return (
    <div className='pointer-events-none absolute top-2 left-2 z-10 flex items-center gap-1'>
      <Badge className={cn('border-0 px-1.5 py-0.5 text-[9px] font-bold tracking-wider uppercase shadow-xs', badgeColorClass)}>
        {badge}
      </Badge>
    </div>
  );
});
ProductBadges.displayName = 'ProductBadges';

const ProductPricing = memo(
  ({ price, originalPrice, isSmall = false }: { price: number; originalPrice?: number; isSmall?: boolean }) => {
    return (
      <div className='flex flex-wrap items-baseline gap-1.5'>
        {originalPrice && originalPrice > price && (
          <span className={cn('text-muted-foreground line-through', isSmall ? 'text-[10px]' : 'text-xs')}>
            ₩{originalPrice.toLocaleString()}
          </span>
        )}
        <span className={cn('text-foreground font-bold tracking-tight', isSmall ? 'text-xs' : 'text-sm')}>
          ₩{price.toLocaleString()}
        </span>
      </div>
    );
  },
);
ProductPricing.displayName = 'ProductPricing';

export const MallProductCard: React.FC<Props> = memo(({ product, className, variant = 'default', onClick }) => {
  const [imgError, setImgError] = useState(false);

  if (variant === 'horizontal') {
    return (
      <div
        onClick={onClick}
        className={cn(
          'group bg-card hover:border-primary/40 hover:bg-accent/40 relative flex cursor-pointer items-center gap-3 overflow-hidden rounded-xl border p-2.5 shadow-2xs transition-all duration-200',
          className,
        )}>
        <div className='bg-muted relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border'>
          {!imgError ? (
            <img
              src={product.image}
              alt={product.title}
              onError={() => setImgError(true)}
              className='h-full w-full object-cover transition-transform duration-300 group-hover:scale-105'
              loading='lazy'
            />
          ) : (
            <div className='text-muted-foreground flex h-full w-full items-center justify-center text-[10px]'>Image</div>
          )}
          {product.badge && (
            <span className='py-0.2 absolute top-1 left-1 rounded bg-amber-500 px-1 text-[8px] font-extrabold text-slate-950'>
              {product.badge}
            </span>
          )}
        </div>

        <div className='flex min-w-0 flex-1 flex-col justify-center space-y-1'>
          {product.tag && <span className='text-muted-foreground truncate font-mono text-[10px]'>{product.tag}</span>}
          <h6 className='text-foreground group-hover:text-primary truncate text-xs font-semibold transition-colors'>
            {product.title}
          </h6>
          <ProductPricing price={product.price} originalPrice={product.originalPrice} isSmall />
        </div>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div
        onClick={onClick}
        className={cn(
          'group bg-card hover:border-primary/40 hover:bg-accent/30 relative flex cursor-pointer flex-col overflow-hidden rounded-lg border shadow-2xs transition-all duration-200',
          className,
        )}>
        <div className='bg-muted relative aspect-square w-full overflow-hidden border-b'>
          {!imgError ? (
            <img
              src={product.image}
              alt={product.title}
              onError={() => setImgError(true)}
              className='h-full w-full object-cover transition-transform duration-300 group-hover:scale-105'
              loading='lazy'
            />
          ) : (
            <div className='text-muted-foreground flex h-full w-full items-center justify-center text-[10px]'>
              {product.title}
            </div>
          )}
          <ProductBadges badge={product.badge} />
        </div>
        <div className='space-y-1 p-2'>
          {product.tag && <p className='text-muted-foreground truncate font-mono text-[9px]'>{product.tag}</p>}
          <h6 className='text-foreground group-hover:text-primary line-clamp-1 text-[11px] font-semibold transition-colors'>
            {product.title}
          </h6>
          <div className='flex items-baseline justify-between'>
            <span className='text-foreground text-xs font-bold'>₩{product.price.toLocaleString()}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      className={cn(
        'group bg-card hover:border-primary/50 relative flex cursor-pointer flex-col overflow-hidden rounded-xl border shadow-2xs transition-all duration-300 hover:-translate-y-1 hover:shadow-md',
        className,
      )}>
      <div className='bg-muted relative aspect-[4/3] w-full overflow-hidden border-b'>
        {!imgError ? (
          <img
            src={product.image}
            alt={product.title}
            onError={() => setImgError(true)}
            className='h-full w-full object-cover transition-transform duration-500 group-hover:scale-105'
            loading='lazy'
          />
        ) : (
          <div className='text-muted-foreground flex h-full w-full items-center justify-center text-xs font-medium'>
            {product.title}
          </div>
        )}

        <ProductBadges badge={product.badge} />
      </div>

      <div className='flex flex-1 flex-col justify-between space-y-2 p-3.5'>
        <div className='space-y-1'>
          {product.tag && <p className='text-primary truncate font-mono text-[10px] font-medium'>{product.tag}</p>}
          <h5 className='text-foreground group-hover:text-primary line-clamp-2 text-xs leading-snug font-semibold transition-colors'>
            {product.title}
          </h5>
          {product.description && <p className='text-muted-foreground line-clamp-1 text-[11px]'>{product.description}</p>}
        </div>

        <div className='flex items-center justify-between border-t pt-2'>
          <ProductPricing price={product.price} originalPrice={product.originalPrice} />
        </div>
      </div>
    </div>
  );
});

MallProductCard.displayName = 'MallProductCard';

export default MallProductCard;
