import type { BrandHomePortfolioItemView } from '@/data/pages/pages.mapper';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { useMemo, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';

type CarouselSlide = {
  id: string | number;
  title: string;
  image: string;
  imageMobile: string;
  linkUrl: string | null;
};

const SlideLink = ({ linkUrl, className, children }: { linkUrl: string | null; className?: string; children: ReactNode }) => {
  if (!linkUrl) {
    return <div className={className}>{children}</div>;
  }

  const isExternal = /^https?:\/\//.test(linkUrl);

  if (isExternal) {
    return (
      <a href={linkUrl} target='_blank' rel='noopener noreferrer' className={className}>
        {children}
      </a>
    );
  }

  return (
    <Link to={linkUrl} className={className}>
      {children}
    </Link>
  );
};

type PortfolioCarouselMobileProps = {
  items: CarouselSlide[];
  className?: string;
  itemClassName?: string;
};

const PortfolioCarouselMobile = ({ items, className, itemClassName }: PortfolioCarouselMobileProps) => {
  return (
    <div
      className={cn(
        'flex snap-x snap-mandatory gap-3 overflow-x-auto pr-4 pb-2 md:hidden',
        '[scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
        className,
      )}>
      {items.map((item) => (
        <SlideLink
          key={item.id}
          linkUrl={item.linkUrl}
          className={cn(
            'relative aspect-square w-[85vw] max-w-80 shrink-0 snap-center overflow-hidden rounded-2xl',
            itemClassName,
          )}>
          <img src={item.imageMobile} alt={item.title} className='h-full w-full object-cover' />
          <div className='absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent' />
          <h3 className='absolute bottom-4 left-4 text-lg font-bold'>{item.title}</h3>
        </SlideLink>
      ))}
    </div>
  );
};

type PortfolioCarouselDesktopProps = {
  items: CarouselSlide[];
  className?: string;
  itemClassName?: string;
};

const PortfolioCarouselDesktop = ({ items, className, itemClassName }: PortfolioCarouselDesktopProps) => {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <div className={cn('mx-auto hidden h-160 w-full max-w-7xl min-w-0 gap-6 overflow-hidden px-4 md:flex', className)}>
      {items.map((item, index) => {
        const isActive = activeIndex === index;

        return (
          <motion.div
            key={item.id}
            className={cn('relative cursor-pointer overflow-hidden rounded-2xl', itemClassName)}
            animate={{ flex: isActive ? 5 : 1 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            onMouseEnter={() => setActiveIndex(index)}>
            <SlideLink linkUrl={item.linkUrl} className='absolute inset-0 block'>
              <motion.img
                src={item.image}
                alt={item.title}
                className='h-full w-full object-cover'
                animate={{
                  scale: isActive ? 1.04 : 1,
                  filter: isActive ? 'brightness(0.9)' : 'brightness(0.55)',
                }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              />

              <div className='absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent' />

              <motion.h3
                className='text-display-md absolute bottom-6 left-6 font-bold whitespace-nowrap'
                animate={{ opacity: isActive ? 1 : 0, y: isActive ? 0 : 20 }}
                transition={{ duration: 0.35 }}>
                {item.title}
              </motion.h3>
            </SlideLink>
          </motion.div>
        );
      })}
    </div>
  );
};

type PortfolioCarouselProps = {
  items?: BrandHomePortfolioItemView[];
  className?: string;
  itemClassName?: string;
};

const PortfolioCarousel = ({ items: cmsItems, className, itemClassName }: PortfolioCarouselProps) => {
  const items = useMemo(
    () =>
      (cmsItems ?? []).map((item) => ({
        id: item.id,
        title: item.title,
        image: item.image,
        imageMobile: item.imageMobile,
        linkUrl: item.linkUrl,
      })),
    [cmsItems],
  );

  if (items.length === 0) {
    return null;
  }

  return (
    <>
      <PortfolioCarouselMobile items={items} className={className} itemClassName={itemClassName} />
      <PortfolioCarouselDesktop items={items} className={className} itemClassName={itemClassName} />
    </>
  );
};

export default PortfolioCarousel;
