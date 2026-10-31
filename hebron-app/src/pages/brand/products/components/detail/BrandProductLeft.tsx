import { ImagePlaceholder } from '@/components/ui/image-placeholder';
import { Skeleton } from '@/components/ui/skeleton';
import type { ProductItemRESP } from '@/data/products/products.response';
import { cn } from '@/lib/utils';
import { getLocalizedName } from '@/utils/helper/product-picker.helper';
import type { MouseEvent } from 'react';
import { useMemo, useRef, useState } from 'react';

type BrandProductLeftProps = {
  product: ProductItemRESP;
  className?: string;
};

export const BrandProductLeft = ({ product, className }: BrandProductLeftProps) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isMainImageLoaded, setIsMainImageLoaded] = useState(false);
  const [isMainImageError, setIsMainImageError] = useState(false);

  const thumbnailsRef = useRef<HTMLDivElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartXRef = useRef(0);
  const scrollStartLeftRef = useRef(0);
  const hasDraggedRef = useRef(false);

  const productImages = useMemo(() => {
    return (product.images ?? []).filter((image): image is string => Boolean(image));
  }, [product.images]);

  const selectedImage = productImages[selectedImageIndex] || '';
  const title = getLocalizedName(product.name);

  const handleDragStart = (event: MouseEvent<HTMLDivElement>) => {
    if (!thumbnailsRef.current) return;
    setIsDragging(true);
    hasDraggedRef.current = false;
    dragStartXRef.current = event.pageX;
    scrollStartLeftRef.current = thumbnailsRef.current.scrollLeft;
  };

  const handleDragMove = (event: MouseEvent<HTMLDivElement>) => {
    if (!isDragging || !thumbnailsRef.current) return;
    const distance = event.pageX - dragStartXRef.current;
    if (Math.abs(distance) > 4) {
      hasDraggedRef.current = true;
    }
    thumbnailsRef.current.scrollLeft = scrollStartLeftRef.current - distance;
    event.preventDefault();
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  const handleThumbnailClick = (index: number) => {
    if (hasDraggedRef.current) {
      hasDraggedRef.current = false;
      return;
    }
    setSelectedImageIndex(index);
    setIsMainImageLoaded(false);
    setIsMainImageError(false);
  };

  return (
    <div className={cn('flex w-full flex-col gap-3 md:w-[480px] md:shrink-0', className)}>
      {/* Main Image */}
      <div className='relative aspect-square w-full overflow-hidden rounded-xl border border-neutral-800 bg-neutral-900'>
        {!isMainImageLoaded && !isMainImageError && selectedImage && (
          <Skeleton className='absolute inset-0 rounded-xl bg-neutral-800' />
        )}
        {selectedImage && !isMainImageError ? (
          <img
            key={selectedImage}
            src={selectedImage}
            alt={title}
            onLoad={() => setIsMainImageLoaded(true)}
            onError={() => {
              setIsMainImageError(true);
              setIsMainImageLoaded(true);
            }}
            className={cn(
              'size-full object-cover transition-opacity duration-300',
              isMainImageLoaded ? 'opacity-100' : 'opacity-0',
            )}
          />
        ) : (
          <ImagePlaceholder className='size-full' />
        )}
      </div>

      {/* Thumbnails Row with Drag-to-Scroll support */}
      {productImages.length > 0 && (
        <div
          ref={thumbnailsRef}
          onMouseDown={handleDragStart}
          onMouseMove={handleDragMove}
          onMouseUp={handleDragEnd}
          onMouseLeave={handleDragEnd}
          className={cn(
            'scrollbar-hide flex touch-pan-x gap-3 overflow-x-auto pb-1 select-none',
            isDragging ? 'cursor-grabbing' : 'cursor-grab',
          )}>
          {productImages.map((img, idx) => {
            const isSelected = idx === selectedImageIndex;
            return (
              <button
                key={`${img}-${idx}`}
                type='button'
                onClick={() => handleThumbnailClick(idx)}
                className={cn(
                  'relative size-20 shrink-0 cursor-pointer overflow-hidden rounded-lg border bg-neutral-900 transition',
                  isSelected ? 'border-brand ring-brand ring-1' : 'border-neutral-800 opacity-70 hover:opacity-100',
                )}>
                <img src={img} alt={`${title} ${idx + 1}`} draggable={false} className='size-full object-cover' />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default BrandProductLeft;
