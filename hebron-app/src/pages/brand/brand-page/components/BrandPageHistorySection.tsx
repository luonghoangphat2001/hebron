import { BrandScrollReveal } from '@/components/brand/BrandScrollReveal';
import type { BrandStoryHistoryView } from '@/data/pages/pages.mapper';
import { useIsMobile } from '@/hooks/useIsMobile';
import { cn } from '@/lib/utils';
import BrandPageHistoryImageGallery from '@/pages/brand/brand-page/components/BrandPageHistoryImageGallery';
import BrandPageSectionHeading from '@/pages/brand/brand-page/components/BrandPageSectionHeading';
import React, { useMemo, useState } from 'react';

type BrandPageHistorySectionProps = {
  data?: BrandStoryHistoryView;
};

const BrandPageHistorySection = ({ data }: BrandPageHistorySectionProps): React.JSX.Element | null => {
  const isMobile = useIsMobile();
  const timeline = useMemo(() => data?.timeline ?? [], [data?.timeline]);
  const sectionTitle = data?.heading || data?.title || '';

  const { decades, historyMap } = useMemo(() => {
    const map: Record<string, Array<{ year: number; description: string; images?: string[] }>> = {};

    timeline.forEach((item) => {
      const decadeStr = `${Math.floor(item.year / 10) * 10}s`;
      if (!map[decadeStr]) map[decadeStr] = [];
      map[decadeStr].push({
        year: item.year,
        description: item.description,
        images: item.images,
      });
    });

    const decadeKeys = Object.keys(map).sort((a, b) => b.localeCompare(a));
    return {
      decades: decadeKeys,
      historyMap: map,
    };
  }, [timeline]);

  const [activeDecade, setActiveDecade] = useState<string>('');

  if (!timeline.length || !decades.length) return null;

  const currentDecade = activeDecade && decades.includes(activeDecade) ? activeDecade : decades[0];
  const entries = historyMap[currentDecade] ?? [];

  return (
    <section className='mx-auto flex w-full max-w-360 flex-col gap-6 px-4 py-10 sm:gap-10 sm:px-[clamp(16px,5.56vw,80px)] sm:py-24'>
      {sectionTitle && (
        <BrandScrollReveal variant='fadeUp'>
          <BrandPageSectionHeading title={sectionTitle} className='px-0 sm:px-8' />
        </BrandScrollReveal>
      )}

      {isMobile && decades.length > 1 && (
        <div className='flex gap-4 px-0 sm:px-8'>
          {decades.map((decade) => (
            <button
              key={decade}
              type='button'
              onClick={() => setActiveDecade(decade)}
              className={cn(
                'cursor-pointer transition-colors',
                currentDecade === decade ? 'text-yellow-golden' : 'text-neutral-600',
              )}>
              <span className='text-display-xs'>{decade}</span>
            </button>
          ))}
        </div>
      )}

      <div className='flex flex-col gap-6 px-0 sm:px-8 lg:flex-row'>
        {!isMobile && decades.length > 1 && (
          <nav className='hidden shrink-0 flex-col gap-6 lg:flex lg:w-52' aria-label='연혁 시대'>
            {decades.map((decade) => (
              <button
                key={decade}
                type='button'
                onClick={() => setActiveDecade(decade)}
                className={cn(
                  'cursor-pointer text-left transition-colors',
                  currentDecade === decade ? 'text-yellow-golden' : 'text-neutral-600 hover:text-neutral-400',
                )}>
                <span className='text-display-xs'>{decade}</span>
              </button>
            ))}
          </nav>
        )}

        <div className='min-w-0 flex-1'>
          <div className='flex flex-col gap-6'>
            <h3 className='text-display-xs md:text-display-lg font-bold text-white'>{currentDecade}</h3>
            <div className='flex flex-col'>
              {entries.map((entry, index) => (
                <BrandScrollReveal
                  key={`${entry.year}-${index}`}
                  variant='fadeUp'
                  delay={index * 0.08}
                  className='flex w-full items-start'>
                  {/* Left Column: Year & Timeline bullet positioned on vertical line */}
                  <div className='relative flex w-[80px] shrink-0 self-stretch border-r border-[#262626] pt-3 pr-px sm:w-[156px] sm:pt-3.5'>
                    <div className='relative flex w-full items-start'>
                      <span className='absolute -right-[4.5px] mt-2 size-[9px] rounded-full bg-white' aria-hidden />
                      <p className='text-[16px] leading-[24px] font-normal text-white tabular-nums sm:text-[18px] sm:leading-[28px]'>
                        {entry.year}
                      </p>
                    </div>
                  </div>

                  {/* Right Column: Description & Image Gallery */}
                  <div className='min-w-0 flex-1 py-3 pl-6 sm:pl-12'>
                    <div className='flex flex-col gap-4 sm:gap-5'>
                      <p className='text-sm leading-6 font-normal text-white sm:text-base'>{entry.description}</p>
                      <BrandPageHistoryImageGallery images={entry.images} />
                    </div>
                  </div>
                </BrandScrollReveal>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BrandPageHistorySection;
