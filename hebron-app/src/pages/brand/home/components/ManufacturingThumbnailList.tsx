import type { BrandHomeManufacturingSlideView } from '@/data/pages/pages.mapper';
import { cn } from '@/lib/utils';
import { useEffect, useRef } from 'react';

type ManufacturingThumbnailListProps = {
  slides: BrandHomeManufacturingSlideView[];
  activeIndex: number;
  progress: number;
  isPaused: boolean;
  onSelectStep: (index: number) => void;
  className?: string;
};

const ManufacturingThumbnailList = ({
  slides,
  activeIndex,
  progress,
  isPaused,
  onSelectStep,
  className,
}: ManufacturingThumbnailListProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const activeItemRef = useRef<HTMLButtonElement>(null);

  // Automatically scroll thumbnail strip horizontally without scrolling the webpage
  useEffect(() => {
    const container = containerRef.current;
    const activeItem = activeItemRef.current;
    if (!container || !activeItem) return;

    const targetScrollLeft = activeItem.offsetLeft - container.clientWidth / 2 + activeItem.clientWidth / 2;

    container.scrollTo({
      left: Math.max(0, targetScrollLeft),
      behavior: 'smooth',
    });
  }, [activeIndex]);

  return (
    <div className={cn('relative w-full', className)}>
      <div
        ref={containerRef}
        className='relative flex w-full items-center gap-2.5 overflow-x-auto py-1'
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        {slides.map((slide, index) => {
          const isActive = index === activeIndex;
          return (
            <button
              key={slide.id}
              ref={isActive ? activeItemRef : null}
              type='button'
              onClick={() => onSelectStep(index)}
              className={cn(
                'group relative flex w-36 shrink-0 cursor-pointer flex-col overflow-hidden rounded-lg border text-left backdrop-blur-md transition-all duration-300 sm:w-44',
                isActive
                  ? 'border-white/90 bg-black/70 shadow-lg ring-1 ring-white/40'
                  : 'border-white/10 bg-black/40 opacity-60 hover:border-white/30 hover:bg-black/60 hover:opacity-100',
              )}>
              {/* Top Progress Line for Active Step */}
              <div className='h-0.5 w-full bg-white/15'>
                {isActive ? (
                  <div className='bg-brand h-full transition-all duration-75 ease-linear' style={{ width: `${progress}%` }} />
                ) : (
                  <div className='h-full w-0 bg-white/30 transition-all duration-300 group-hover:w-full' />
                )}
              </div>

              <div className='flex flex-col gap-1.5 p-2 sm:p-2.5'>
                {/* Thumbnail Image */}
                <div className='relative h-13 w-full overflow-hidden rounded-md bg-neutral-900 sm:h-16'>
                  <img
                    src={slide.poster}
                    alt={slide.title}
                    className={cn(
                      'size-full object-cover transition-transform duration-500',
                      isActive ? 'scale-105' : 'group-hover:scale-105',
                    )}
                  />
                  <div className='absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent' />

                  {/* Step Number on Thumbnail */}
                  <span className='absolute bottom-1 left-1.5 font-mono text-[10px] font-bold text-white/90'>
                    {String(index + 1).padStart(2, '0')}
                  </span>

                  {/* Active Indicator Tag */}
                  {isActive && (
                    <span className='bg-brand/90 absolute top-1 right-1 inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[8px] font-bold tracking-wider text-white'>
                      재생 중
                    </span>
                  )}
                </div>

                {/* Step Info */}
                <div className='flex flex-col'>
                  <p
                    className={cn(
                      'line-clamp-1 text-xs font-bold transition-colors',
                      isActive ? 'text-white' : 'text-neutral-300 group-hover:text-white',
                    )}>
                    {slide.title}
                  </p>
                  <p className='line-clamp-1 text-[10px] text-neutral-400'>
                    {isActive ? (isPaused ? '일시정지' : '진행 중...') : '클릭하여 이동'}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ManufacturingThumbnailList;
