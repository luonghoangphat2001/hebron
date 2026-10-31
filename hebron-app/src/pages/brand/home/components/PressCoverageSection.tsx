import { LogoShort } from '@/assets/svgs';
import { BrandScrollReveal } from '@/components/brand/BrandScrollReveal';
import type { BrandHomePressItemView, BrandHomePressView } from '@/data/pages/pages.mapper';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';

type PressCoverageCardProps = {
  category: string;
  title: string;
  subtitle: string;
  image: string;
  isActive: boolean;
  onSelect: () => void;
};

const PressCoverageCard = ({ category, title, subtitle, image, isActive, onSelect }: PressCoverageCardProps) => {
  return (
    <div
      onClick={onSelect}
      className={cn(
        'group relative flex size-full cursor-pointer flex-col overflow-hidden rounded-[12px] bg-[#171717] p-[12px] text-left transition-all duration-500 select-none',
        isActive
          ? 'shadow-[0_40px_90px_rgba(0,0,0,0.98),0_0_50px_rgba(201,168,76,0.22)]'
          : 'shadow-[0_25px_60px_rgba(0,0,0,0.9)]',
      )}>
      <div className='relative aspect-[400/500] w-full shrink-0 overflow-hidden rounded-[12px] bg-neutral-900'>
        <img
          src={image}
          alt={title || ''}
          draggable={false}
          className='pointer-events-none size-full object-cover object-center transition-transform duration-700 group-hover:scale-105'
        />
        <div
          className='pointer-events-none absolute inset-0 rounded-[12px]'
          style={{
            background: 'linear-gradient(180deg, rgba(0, 0, 0, 0.24) 0%, #000 87.37%)',
          }}
          aria-hidden
        />
      </div>

      <div className='flex flex-col gap-[6px] pt-3 md:pt-4'>
        <span className='text-[14px] leading-[20px] font-medium text-[#c9a84c]'>{category}</span>
        <p className='truncate text-[20px] leading-[28px] font-bold text-white md:text-[24px] md:leading-[32px]'>
          {title || 'Title'}
        </p>
        <p className='line-clamp-2 text-[15px] leading-[24px] font-normal text-[#a3a3a3] md:text-[18px] md:leading-[28px]'>
          {subtitle || 'Subtitle'}
        </p>
      </div>
    </div>
  );
};

type PressCoverageCarouselProps = {
  items: BrandHomePressItemView[];
};

const PressCoverageCarousel = ({ items }: PressCoverageCarouselProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [activeIndex, setActiveIndex] = useState(Math.floor(items.length / 2));
  const [offsetX, setOffsetX] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  const centerOnIndex = useCallback(
    (index: number, smooth = true) => {
      const container = containerRef.current;
      const card = cardRefs.current[index];
      if (!container || !card) return;

      const containerWidth = container.clientWidth;
      const cardLeft = card.offsetLeft;
      const cardWidth = card.offsetWidth;
      const nextOffset = containerWidth / 2 - (cardLeft + cardWidth / 2);

      setActiveIndex(index);
      setOffsetX(nextOffset);

      if (isMobile && trackRef.current) {
        const scrollLeft = cardLeft - (containerWidth - cardWidth) / 2;
        trackRef.current.scrollTo({ left: scrollLeft, behavior: smooth ? 'smooth' : 'auto' });
      }
    },
    [isMobile],
  );

  const updateActiveFromScroll = useCallback(() => {
    if (!isMobile || !trackRef.current) return;

    const container = trackRef.current;
    const containerRect = container.getBoundingClientRect();
    const viewportCenter = containerRect.left + containerRect.width / 2;

    let closestIndex = 0;
    let closestDistance = Number.POSITIVE_INFINITY;

    cardRefs.current.forEach((card, index) => {
      if (!card) return;

      const rect = card.getBoundingClientRect();
      const cardCenter = rect.left + rect.width / 2;
      const distance = Math.abs(cardCenter - viewportCenter);

      if (distance < closestDistance) {
        closestDistance = distance;
        closestIndex = index;
      }
    });

    setActiveIndex(closestIndex);
  }, [isMobile]);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 767px)');

    const handleChange = () => {
      setIsMobile(mediaQuery.matches);
    };

    handleChange();
    mediaQuery.addEventListener('change', handleChange);

    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  useLayoutEffect(() => {
    if (isMobile) return;

    let frame = requestAnimationFrame(() => {
      frame = requestAnimationFrame(() => {
        centerOnIndex(activeIndex, false);
      });
    });

    return () => cancelAnimationFrame(frame);
  }, [activeIndex, isMobile, centerOnIndex]);

  useEffect(() => {
    if (isMobile) return;

    const handleResize = () => centerOnIndex(activeIndex, false);
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, [activeIndex, isMobile, centerOnIndex]);

  if (!items.length) return null;

  return (
    <div ref={containerRef} className='relative w-full overflow-hidden pt-0 sm:pt-36'>
      {/* Custom Recessed Gallery Shelf & Downward Golden Wall Wash Light matching screenshot */}
      <div
        className='pointer-events-none absolute top-6 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center select-none md:top-8'
        aria-hidden>
        {/* Downward warm amber/gold wall wash light */}
        <div
          className='-mt-[1px] h-[320px] w-[460px] md:h-[400px] md:w-[640px]'
          style={{
            background:
              'radial-gradient(ellipse 70% 60% at 50% 0%, rgba(175, 138, 50, 0.48) 0%, rgba(115, 88, 30, 0.25) 35%, rgba(50, 38, 12, 0.08) 65%, transparent 100%)',
            filter: 'blur(14px)',
          }}
        />
      </div>

      {isMobile ? (
        <div
          ref={trackRef}
          onScroll={updateActiveFromScroll}
          className={cn(
            'flex w-full items-end overflow-x-auto px-[15vw] pt-16 pb-8',
            '-space-x-12 sm:-space-x-16',
            'snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
          )}>
          {items.map((item, index) => {
            const distance = Math.abs(index - activeIndex);
            const isActive = distance === 0;
            const zIndex = 50 - distance;
            const y = isActive ? -48 : 0;

            return (
              <motion.div
                key={item.id}
                ref={(element) => {
                  cardRefs.current[index] = element;
                }}
                layout
                style={{ zIndex }}
                animate={{
                  y,
                }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className='w-[280px] shrink-0 snap-center sm:w-[320px]'>
                <PressCoverageCard {...item} isActive={isActive} onSelect={() => centerOnIndex(index)} />
              </motion.div>
            );
          })}
        </div>
      ) : (
        <motion.div
          className='flex items-end -space-x-16 pt-20 pb-10 md:-space-x-20 lg:-space-x-24'
          animate={{ x: offsetX }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}>
          {items.map((item, index) => {
            const distance = Math.abs(index - activeIndex);
            const isActive = distance === 0;
            const zIndex = 50 - distance;
            const y = isActive ? -98 : 0;

            return (
              <motion.div
                key={item.id}
                ref={(element) => {
                  cardRefs.current[index] = element;
                }}
                layout
                style={{ zIndex }}
                animate={{
                  y,
                }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                className='w-[340px] shrink-0 lg:w-[376px]'>
                <PressCoverageCard {...item} isActive={isActive} onSelect={() => centerOnIndex(index)} />
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </div>
  );
};

type PressCoverageSectionProps = {
  data: BrandHomePressView;
};

const PressCoverageSection = ({ data }: PressCoverageSectionProps) => {
  const { title, subtitle, items } = data;

  return (
    <section className='relative flex w-full flex-col gap-8 overflow-hidden bg-[#0a0a0a] py-8 text-white sm:py-24 md:gap-14'>
      {/* Gradient glow giới hạn theo vùng nội dung, không tràn full width */}
      <div
        className='pointer-events-none absolute top-0 left-1/2 h-[70%] w-full max-w-[1000px] -translate-x-1/2 bg-[radial-gradient(ellipse_at_top,_rgba(201,168,76,0.1)_0%,_rgba(255,255,255,0)_100%)] blur-3xl'
        aria-hidden
      />

      <BrandScrollReveal
        className='relative z-10 mx-auto flex w-full max-w-304 flex-col gap-4 px-6 md:flex-row md:items-center md:justify-between md:gap-2 md:px-0'
        variant='fadeUp'>
        <div className='flex flex-1 items-center gap-4'>
          <img src={LogoShort} alt='' className='size-6 shrink-0 md:size-6' aria-hidden />
          <h2 className='text-[28px] leading-[36px] font-bold text-white md:text-[36px] md:leading-[44px]'>{title}</h2>
        </div>
        <p className='text-[15px] leading-[24px] font-normal whitespace-pre-line text-[#a3a3a3] md:max-w-lg md:text-right md:text-[18px] md:leading-[28px]'>
          {subtitle}
        </p>
      </BrandScrollReveal>

      <BrandScrollReveal className='relative z-10' variant='scaleUp' delay={0.1}>
        <PressCoverageCarousel items={items} />
      </BrandScrollReveal>
    </section>
  );
};

export default PressCoverageSection;
