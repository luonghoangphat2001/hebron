import { Hero } from '@/assets/images';
import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

import BrandNav from './BrandNav';

const DEFAULT_OVERLAY_OPACITY = 0.36;

type BrandHeroSectionProps = {
  children: ReactNode;
  className?: string;
  bottomFadeClassName?: string;
  backgroundImageUrl?: string | null;
  overlayOpacity?: number;
};

const BrandHeroSection = ({
  children,
  className,
  bottomFadeClassName,
  backgroundImageUrl,
  overlayOpacity = DEFAULT_OVERLAY_OPACITY,
}: BrandHeroSectionProps) => {
  const imageUrl = backgroundImageUrl || Hero;
  const opacity = Number.isFinite(overlayOpacity) ? overlayOpacity : DEFAULT_OVERLAY_OPACITY;

  const background = `
    linear-gradient(
      0deg,
      rgba(0, 0, 0, ${opacity}) 0%,
      rgba(0, 0, 0, ${opacity}) 100%
    ),
    url(${imageUrl}) lightgray center / cover no-repeat
  `;

  return (
    <section
      className={cn('relative flex w-full min-w-0 flex-col overflow-x-hidden bg-cover bg-center bg-no-repeat', className)}
      style={{ background }}>
      <div className='relative z-10 flex min-h-full flex-1 flex-col'>
        <BrandNav />
        {children}
      </div>

      <div
        className={cn(
          'pointer-events-none absolute inset-x-0 bottom-0 w-full',
          'bg-[linear-gradient(180deg,rgba(0,0,0,0)_0%,rgba(10,10,10,0)_50%,#0A0A0A_100%)]',
          bottomFadeClassName,
        )}
      />
    </section>
  );
};

export default BrandHeroSection;
