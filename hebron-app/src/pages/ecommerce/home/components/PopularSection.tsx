import { useAuth } from '@/contexts/AuthContext';
import { mapPopularGroups, mapPopularItems, type PopularSectionView } from '@/data/pages/home-mall.service';
import { cn } from '@/lib/utils';
import { getProductDetailPath } from '@/utils/constants/route.constant';
import { formatPrice } from '@/utils/helper/common.helper';
import { useMemo, useRef, useState, type MouseEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

type PopularSectionProps = {
  data?: PopularSectionView;
};

const PopularSection = ({ data }: PopularSectionProps) => {
  const { t: tCommon } = useTranslation('common');
  const { isAdmin } = useAuth();

  const groups = useMemo(() => mapPopularGroups(data?.categories), [data?.categories]);

  const [selectedSlug, setSelectedSlug] = useState<string>('');

  const effectiveSlug = selectedSlug || data?.defaultCategorySlug || data?.categories?.[0]?.slug || '';

  const selectedCategory = useMemo(() => {
    return data?.categories?.find((c) => c.slug === effectiveSlug) ?? data?.categories?.[0];
  }, [data?.categories, effectiveSlug]);

  const currentProducts = useMemo(() => {
    if (selectedCategory?.products && selectedCategory.products.length > 0) {
      return selectedCategory.products;
    }
    return data?.showcaseProducts ?? [];
  }, [selectedCategory, data?.showcaseProducts]);

  const popularItems = useMemo(() => mapPopularItems(currentProducts), [currentProducts]);

  const scrollRef = useRef<HTMLDivElement>(null);
  const isDown = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);
  const hasMoved = useRef(false);

  const onMouseDown = (e: MouseEvent<HTMLDivElement>) => {
    if (!scrollRef.current) return;
    isDown.current = true;
    hasMoved.current = false;
    startX.current = e.pageX - scrollRef.current.offsetLeft;
    scrollLeft.current = scrollRef.current.scrollLeft;
  };

  const onMouseLeave = () => {
    isDown.current = false;
  };

  const onMouseUp = () => {
    isDown.current = false;
  };

  const onMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!isDown.current || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX.current) * 1.5;
    if (Math.abs(x - startX.current) > 5) {
      hasMoved.current = true;
    }
    scrollRef.current.scrollLeft = scrollLeft.current - walk;
  };

  if (groups.length === 0 && popularItems.length === 0) return null;

  return (
    <section className='space-y-4 md:space-y-8'>
      <p className='md:text-display-sm text-xl font-bold'>{data?.title || tCommon('title.view_popular_product')}</p>
      {groups.length > 0 && (
        <div className='grid grid-cols-2 items-start gap-5 md:grid-cols-5'>
          {groups.map((group) => {
            const isSelected = effectiveSlug === group.slug;
            return (
              <button
                key={group.id}
                type='button'
                className='group flex w-full cursor-pointer flex-col items-start space-y-4 text-left'
                onClick={() => setSelectedSlug(group.slug)}>
                <div
                  className={cn(
                    'group-hover:bg-blue-brand relative aspect-square w-full overflow-hidden rounded-lg transition-all group-hover:p-2',
                    isSelected && 'bg-blue-brand p-2',
                  )}>
                  <div className='relative size-full overflow-hidden rounded-md'>
                    {group.image ? (
                      <img src={group.image} alt={group.name} className='absolute inset-0 size-full object-cover' />
                    ) : (
                      <div className='size-full bg-neutral-200' />
                    )}
                  </div>
                </div>
                <p
                  className={cn('md:text-md text-sm font-medium', isSelected ? 'text-blue-brand font-bold' : 'text-neutral-900')}>
                  {group.name}
                </p>
              </button>
            );
          })}
        </div>
      )}

      {popularItems.length > 0 && (
        <div
          style={data?.showcaseBackground ? { backgroundImage: `url(${data.showcaseBackground})` } : undefined}
          className='relative flex h-140 w-full flex-col overflow-hidden rounded-md bg-neutral-900 bg-cover bg-center bg-no-repeat p-4 md:h-181 md:p-10'>
          <div className='pointer-events-none absolute inset-0 z-0 bg-black/64' />
          <div className='z-10 mt-auto min-w-0 text-white'>
            {selectedCategory?.subtitle && <p className='text-md text-neutral-500'>{selectedCategory.subtitle}</p>}
            <p className='text-display-xs md:text-display-md mt-1 font-bold'>
              {selectedCategory?.label || data?.showcaseTitle || '인기 상품'}
            </p>
            <div
              ref={scrollRef}
              onMouseDown={onMouseDown}
              onMouseLeave={onMouseLeave}
              onMouseUp={onMouseUp}
              onMouseMove={onMouseMove}
              className='scrollbar-hide mt-6 flex cursor-grab gap-2 overflow-x-auto select-none active:cursor-grabbing md:gap-6'>
              {popularItems.map((item) => {
                const targetPath = getProductDetailPath(item.link || item.id);

                return (
                  <Link
                    key={item.id}
                    to={targetPath}
                    draggable={false}
                    onClick={(e) => {
                      if (hasMoved.current) {
                        e.preventDefault();
                      }
                    }}
                    className='w-35 shrink-0 space-y-4 rounded-md bg-[#FFFFFF29] p-2 backdrop-blur-[52px] transition hover:bg-[#ffffff3d] md:w-60 md:p-3'>
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className='size-31 rounded-md object-cover md:size-54'
                        loading='lazy'
                        draggable={false}
                      />
                    ) : (
                      <div className='flex size-31 items-center justify-center rounded-md bg-neutral-800 text-xs text-neutral-400 md:size-54'>
                        No Image
                      </div>
                    )}
                    <div className='space-y-1 text-white'>
                      <p className='text-md font-bold'>{item.name}</p>
                      <p className='text-md'>
                        {item.priceContent && !isAdmin
                          ? item.priceContent
                          : formatPrice(isAdmin ? (item.supplyPrice ?? item.sellingPrice) : item.sellingPrice)}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default PopularSection;
