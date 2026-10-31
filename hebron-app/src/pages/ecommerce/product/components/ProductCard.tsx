import { ImagePlaceholder } from '@/components/ui/image-placeholder';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/contexts/AuthContext';
import type { ProductItemRESP } from '@/data/products/products.response';
import { cn } from '@/lib/utils';
import { PRODUCT_BADGE_STYLE } from '@/utils/constants/product.constant';
import { getProductDetailPath } from '@/utils/constants/route.constant';
import { ProductBadge } from '@/utils/enums/product.enum';
import { resolveStorageUrl } from '@/utils/helper/canvas.helper';
import { formatPrice } from '@/utils/helper/common.helper';
import { getLocalizedName } from '@/utils/helper/product-picker.helper';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ProductCard = ({ product }: { product: ProductItemRESP }) => {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const title = getLocalizedName(product.name);
  const image = resolveStorageUrl(product.first_image || product.images?.[0]);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [isImageError, setIsImageError] = useState(!image);
  const code = product.sku ?? product.slug;
  const priceContent = product.price_content?.trim();
  const displayPrice = formatPrice(isAdmin ? product.supply_price : product.selling_price);
  // const originalPrice = formatPrice(product.supply_price);
  // const hasDiscount = Boolean(product.discount_percentage);
  const badge = product.is_popular ? ProductBadge.Best : product.is_featured ? ProductBadge.New : undefined;

  const targetPath = getProductDetailPath(product.link || product.slug);

  const handleNavigateDetail = () => {
    if (targetPath.startsWith('http://') || targetPath.startsWith('https://')) {
      window.location.href = targetPath;
    } else {
      navigate(targetPath);
    }
  };

  return (
    <article className='group min-w-0'>
      <div className='relative aspect-square overflow-hidden rounded-md'>
        {isImageError ? (
          <ImagePlaceholder className='absolute inset-0' />
        ) : (
          !isImageLoaded && <Skeleton className='absolute inset-0 rounded-md bg-neutral-200' />
        )}
        {image && !isImageError && (
          <img
            alt={title}
            className={cn(
              'h-full w-full cursor-pointer object-cover transition-opacity duration-200',
              isImageLoaded ? 'opacity-100' : 'opacity-0',
            )}
            src={image}
            loading='lazy'
            decoding='async'
            onClick={handleNavigateDetail}
            onLoad={() => setIsImageLoaded(true)}
            onError={() => setIsImageError(true)}
          />
        )}
        {badge && (
          <span className={cn('absolute top-2.5 left-2 rounded-full px-2 text-sm font-medium', PRODUCT_BADGE_STYLE[badge])}>
            {badge}
          </span>
        )}
        <div className='pointer-events-none absolute inset-0 hidden bg-black/64 opacity-0 transition-opacity duration-200 group-hover:opacity-100 md:block' />
      </div>

      <div className='mt-2 space-y-1'>
        <h3 className='text-md cursor-pointer truncate font-medium hover:underline' onClick={handleNavigateDetail}>
          {title}
        </h3>
        {/* <p className='text-sm text-neutral-500'>{code}</p> */}
        {priceContent && !isAdmin ? (
          <p className='text-md font-bold'>{priceContent}</p>
        ) : (
          <>
            {/* {hasDiscount && originalPrice && (
              <div className='flex min-w-0 items-center gap-1'>
                <span className='truncate text-sm text-neutral-500'>{originalPrice}</span>
              </div>
            )} */}
            <p className='text-md font-bold'>{displayPrice}</p>
          </>
        )}
      </div>
    </article>
  );
};

export default ProductCard;
