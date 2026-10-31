import { normalizeBannerItem, type Banner, type BannerCarouselItem } from '@/data/pages/home-mall.service';
import type { SiteType } from '@/utils/enums/common.enum';
import { ArrowLeftIcon, ArrowRightIcon, CaretLeftIcon, CaretRightIcon } from '@phosphor-icons/react';
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties, type TouchEvent } from 'react';

export type { BannerCarouselItem };

type BannerCarouselProps = {
  banners?: BannerCarouselItem[];
  siteType?: SiteType | string;
  isLoading?: boolean;
  autoplay?: boolean;
  autoplayInterval?: number;
};

type SliderMetrics = {
  viewportWidth: number;
  slideWidth: number;
};

const MAIN_BANNER_MEDIA_CLASS = 'size-full object-contain object-center';

const renderBannerMedia = (banner: Banner) => {
  const isVideo = banner.mediaType === 'video' && Boolean(banner.videoUrl || banner.videoUrlMobile);
  const mediaSrc = banner.videoUrl || banner.videoUrlMobile;

  const content =
    isVideo && mediaSrc ? (
      <video src={mediaSrc} autoPlay loop muted playsInline className={MAIN_BANNER_MEDIA_CLASS} />
    ) : (
      <picture className='block size-full'>
        {banner.imageUrlMobile && <source media='(max-width: 767px)' srcSet={banner.imageUrlMobile} />}
        <img src={banner.imageUrl} alt={banner.alt} className={MAIN_BANNER_MEDIA_CLASS} draggable={false} />
      </picture>
    );

  if (banner.linkUrl) {
    return (
      <a href={banner.linkUrl} target='_blank' rel='noopener noreferrer' className='absolute inset-0 block'>
        {content}
      </a>
    );
  }

  return <div className='absolute inset-0'>{content}</div>;
};

const BannerCarousel = ({ banners: bannerItems, isLoading, autoplay = true, autoplayInterval = 5000 }: BannerCarouselProps) => {
  const [trackIndex, setTrackIndex] = useState(1);
  const [enableTransition, setEnableTransition] = useState(true);
  const [metrics, setMetrics] = useState<SliderMetrics>({
    viewportWidth: 0,
    slideWidth: 0,
  });
  const viewportRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number | null>(null);

  const banners = useMemo<Banner[]>(() => {
    if (!bannerItems?.length) return [];
    return bannerItems.map(normalizeBannerItem);
  }, [bannerItems]);

  const trackBanners = useMemo<Banner[]>(() => {
    if (banners.length === 0) return [];
    return [banners[banners.length - 1], ...banners, banners[0]];
  }, [banners]);

  const activeIndex = banners.length > 0 ? (((trackIndex - 1) % banners.length) + banners.length) % banners.length : 0;
  const hasMultipleBanners = banners.length > 1;

  const updateMetrics = useCallback(() => {
    const viewportWidth = viewportRef.current?.clientWidth || document.documentElement.clientWidth;
    setMetrics({ viewportWidth, slideWidth: viewportWidth });
  }, []);

  useLayoutEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    updateMetrics();

    const viewport = viewportRef.current;
    if (!viewport) return;

    const resizeObserver = new ResizeObserver(updateMetrics);
    resizeObserver.observe(viewport);
    window.addEventListener('resize', updateMetrics);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', updateMetrics);
    };
  }, [updateMetrics]);

  useEffect(() => {
    if (enableTransition) return;

    const frame = requestAnimationFrame(() => {
      setEnableTransition(true);
    });

    return () => cancelAnimationFrame(frame);
  }, [enableTransition]);

  const goToPrevious = useCallback(() => {
    if (!hasMultipleBanners || trackIndex === 0 || trackIndex === banners.length + 1) return;

    setEnableTransition(true);
    setTrackIndex((current) => current - 1);
  }, [hasMultipleBanners, trackIndex, banners.length]);

  const goToNext = useCallback(() => {
    if (!hasMultipleBanners || trackIndex === 0 || trackIndex === banners.length + 1) return;

    setEnableTransition(true);
    setTrackIndex((current) => current + 1);
  }, [hasMultipleBanners, trackIndex, banners.length]);

  useEffect(() => {
    if (!autoplay || !hasMultipleBanners) return;

    const timer = setInterval(() => {
      goToNext();
    }, autoplayInterval);

    return () => clearInterval(timer);
  }, [autoplay, autoplayInterval, hasMultipleBanners, goToNext]);

  const handleTouchStart = (event: TouchEvent<HTMLDivElement>) => {
    touchStartX.current = event.touches[0].clientX;
  };

  const handleTouchEnd = (event: TouchEvent<HTMLDivElement>) => {
    if (touchStartX.current === null) return;

    const distance = touchStartX.current - event.changedTouches[0].clientX;
    touchStartX.current = null;

    if (Math.abs(distance) < 40) return;
    if (distance > 0) goToNext();
    else goToPrevious();
  };

  const handleTransitionEnd = () => {
    if (trackIndex === 0) {
      setEnableTransition(false);
      setTrackIndex(banners.length);
    }

    if (trackIndex === banners.length + 1) {
      setEnableTransition(false);
      setTrackIndex(1);
    }
  };

  if (!banners.length && !isLoading) return null;

  const translateX = metrics.slideWidth > 0 ? -trackIndex * metrics.slideWidth : 0;

  const trackStyle = {
    transform: `translate3d(${translateX}px, 0, 0)`,
    transitionDuration: enableTransition ? '500ms' : '0ms',
  } as CSSProperties;

  const slideStyle = {
    width: `${metrics.slideWidth}px`,
  } as CSSProperties;

  return (
    <section className='flex w-full flex-col items-center md:pb-0'>
      <div
        ref={viewportRef}
        className='relative w-full overflow-hidden'
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}>
        <div className='flex transition-transform ease-out' style={trackStyle} onTransitionEnd={handleTransitionEnd}>
          {trackBanners.map((banner, index) => (
            <div
              key={`${banner.id}-${index}`}
              className='relative aspect-[5/2] w-full shrink-0 overflow-hidden bg-neutral-100 md:aspect-[1240/344]'
              style={slideStyle}>
              {renderBannerMedia(banner)}
            </div>
          ))}
        </div>

        {hasMultipleBanners && (
          <>
            <button
              type='button'
              aria-label='Previous banner'
              className='absolute top-1/2 left-4 flex size-9 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white shadow-sm md:hidden'
              onClick={goToPrevious}>
              <ArrowLeftIcon size={20} className='text-[#343330]' />
            </button>
            <button
              type='button'
              aria-label='Next banner'
              className='absolute top-1/2 right-4 flex size-9 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white shadow-sm md:hidden'
              onClick={goToNext}>
              <ArrowRightIcon size={20} className='text-[#343330]' />
            </button>
          </>
        )}
      </div>

      {hasMultipleBanners && (
        <div className='mt-8 hidden items-center gap-3 md:flex'>
          <button type='button' aria-label='Previous banner' className='cursor-pointer hover:opacity-60' onClick={goToPrevious}>
            <CaretLeftIcon size={24} />
          </button>
          <p className='text-lg font-semibold'>
            {String(activeIndex + 1).padStart(2, '0')}{' '}
            <span className='ml-1 font-normal text-neutral-500'>/{String(banners.length).padStart(2, '0')}</span>
          </p>
          <button type='button' aria-label='Next banner' className='cursor-pointer hover:opacity-60' onClick={goToNext}>
            <CaretRightIcon size={24} />
          </button>
        </div>
      )}
    </section>
  );
};

export default BannerCarousel;
