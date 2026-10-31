import { ImagePlaceholder } from '@/components/ui/image-placeholder';
import { Skeleton } from '@/components/ui/skeleton';
import type { ProductItemRESP } from '@/data/products/products.response';
import { cn } from '@/lib/utils';
import { getBrandProductDetailPath } from '@/utils/constants/route.constant';
import { formatPrice } from '@/utils/helper/common.helper';
import { getLocalizedName } from '@/utils/helper/product-picker.helper';
import { useState } from 'react';
import { Link } from 'react-router-dom';

type BrandProductCardProps = {
  product: ProductItemRESP;
  className?: string;
};

const BrandProductCard = ({ product, className }: BrandProductCardProps) => {
  const title = getLocalizedName(product.name);
  const rawImage = product.first_image || product.images?.[0];
  const image = rawImage || '';
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [isImageError, setIsImageError] = useState(!image);

  const priceContent = product.price_content?.trim();
  const price = priceContent || formatPrice(product.supply_price ?? 0);
  const shouldShowPrice = (product.supply_price ?? 0) > 0;
  const targetUrl = getBrandProductDetailPath(product?.slug);

  return (
    <Link
      to={targetUrl}
      className={cn('group flex w-full flex-col gap-3 text-left transition-opacity hover:opacity-95', className)}>
      <div className='relative aspect-square w-full overflow-hidden rounded-lg border border-neutral-800 bg-neutral-900'>
        {isImageError ? (
          <ImagePlaceholder className='absolute inset-0' />
        ) : (
          !isImageLoaded && <Skeleton className='absolute inset-0 rounded-lg bg-neutral-800' />
        )}
        {image && !isImageError && (
          <img
            src={image}
            alt={title}
            className={cn(
              'size-full object-cover transition-transform duration-300 group-hover:scale-105',
              isImageLoaded ? 'opacity-100' : 'opacity-0',
            )}
            loading='lazy'
            decoding='async'
            onLoad={() => setIsImageLoaded(true)}
            onError={() => setIsImageError(true)}
          />
        )}
      </div>

      <div className='flex w-full flex-col gap-1 text-white'>
        <h3 className='text-lg' title={title}>
          {title}
        </h3>
        {/* {sku && <p className='line-clamp-1 text-sm leading-6 font-normal text-white/50 md:text-base'>{sku}</p>} */}
        {shouldShowPrice && <p className='text-md text-white/50'>{price}</p>}
      </div>
    </Link>
  );
};

export const BrandProductCardSkeleton = ({ count = 12 }: { count?: number }) => (
  <>
    {Array.from({ length: count }, (_, index) => (
      <div key={index} className='flex w-full flex-col gap-3'>
        <Skeleton className='aspect-square w-full rounded-lg bg-neutral-900' />
        <div className='flex flex-col gap-2'>
          <Skeleton className='h-7 w-3/4 rounded bg-neutral-900 md:h-8' />
          <Skeleton className='h-5 w-1/3 rounded bg-neutral-900/80 md:h-6' />
          {/* <Skeleton className='h-7 w-1/2 rounded bg-neutral-900 md:h-8' /> */}
        </div>
      </div>
    ))}
  </>
);

export default BrandProductCard;
