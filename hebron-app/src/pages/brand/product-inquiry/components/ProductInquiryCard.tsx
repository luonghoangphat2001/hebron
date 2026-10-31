import { ImagePlaceholder } from '@/components/ui/image-placeholder';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import type { ProductInquiryCardData } from '@/utils/constants/brand-product-inquiry.constant';
import { useState } from 'react';

type ProductInquiryCardProps = {
  product?: ProductInquiryCardData | null;
  className?: string;
};

const ProductImage = ({ src, alt }: { src?: string; alt?: string }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(!src);

  return (
    <div className='relative size-[124px] shrink-0 overflow-hidden rounded-xl bg-neutral-900'>
      {!src || isError ? (
        <ImagePlaceholder className='size-full' />
      ) : (
        <>
          {!isLoaded && <Skeleton className='absolute inset-0 size-full rounded-xl bg-neutral-800' />}
          <img
            src={src}
            alt={alt}
            onLoad={() => setIsLoaded(true)}
            onError={() => setIsError(true)}
            className={cn(
              'pointer-events-none size-full rounded-xl object-cover transition-opacity duration-200',
              isLoaded ? 'opacity-100' : 'opacity-0',
            )}
          />
        </>
      )}
    </div>
  );
};

export const ProductInquiryCard = ({ product, className }: ProductInquiryCardProps) => {
  if (!product) return null;

  return (
    <div className={cn('flex w-full flex-col items-start rounded-xl border border-neutral-800 bg-neutral-900/40 p-4', className)}>
      <div className='flex w-full flex-col items-start gap-4 sm:flex-row'>
        {/* Product Image */}
        <ProductImage key={product.image} src={product.image} alt={product.title} />

        {/* Content Details */}
        <div className='flex min-w-0 flex-1 flex-col gap-3'>
          {/* Title and SKU */}
          <div className='flex flex-col gap-1'>
            <h3 className='truncate text-lg leading-7 font-bold text-neutral-50'>{product.title}</h3>
            {product.sku && <p className='text-sm leading-5 text-neutral-500'>{product.sku}</p>}
          </div>

          {/* Options / Specs Table */}
          {product.options && product.options.length > 0 && (
            <div className='flex w-full flex-col gap-2'>
              {product.options.map((opt) => (
                <div key={opt.label} className='flex items-center gap-6 text-sm leading-5'>
                  <span className='w-24 shrink-0 text-neutral-500'>{opt.label}</span>
                  <span className='font-normal text-neutral-50'>{opt.value}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductInquiryCard;
