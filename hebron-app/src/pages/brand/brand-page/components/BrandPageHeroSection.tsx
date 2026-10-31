import { BrandScrollReveal, BrandScrollStagger, BrandScrollStaggerItem } from '@/components/brand/BrandScrollReveal';
import type { BrandStoryHeroView } from '@/data/pages/pages.mapper';
import { useIsMobile } from '@/hooks/useIsMobile';
import BrandHeroSection from '@/pages/brand/components/BrandHeroSection';

type BrandPageHeroSectionProps = {
  data?: BrandStoryHeroView;
};

const BrandPageHeroSection = ({ data }: BrandPageHeroSectionProps) => {
  const isMobile = useIsMobile();

  if (!data) return null;

  const { heading, description, stats, imageUrl, backgroundImageUrlPC, backgroundImageUrlMB } = data;

  return (
    <section>
      <BrandHeroSection
        className='h-80 min-h-80 md:h-[320px]'
        bottomFadeClassName='h-24'
        backgroundImageUrl={isMobile ? backgroundImageUrlMB : backgroundImageUrlPC}>
        <div className='flex flex-col items-center justify-center px-4 pt-16 pb-12 md:pt-20 md:pb-16'>
          {heading && (
            <BrandScrollReveal variant='fadeUp'>
              <h1 className='text-3xl font-semibold text-white md:text-[48px] md:leading-[60px]'>{heading}</h1>
            </BrandScrollReveal>
          )}
        </div>
      </BrandHeroSection>

      <div className='mx-auto flex w-full max-w-360 flex-col gap-6 px-3 py-6 sm:px-20 sm:py-24 md:gap-12'>
        {description && (
          <BrandScrollReveal variant='fadeUp'>
            <p className='md:text-md text-sm leading-relaxed whitespace-pre-line text-neutral-400'>{description}</p>
          </BrandScrollReveal>
        )}

        {stats && stats.length > 0 && (
          <BrandScrollStagger className='grid grid-cols-2 gap-4 md:flex md:gap-16'>
            {stats.map((stat, index) => (
              <BrandScrollStaggerItem key={`${stat.value}-${index}`} className='flex flex-col gap-2' variant='scaleUp'>
                <p className='text-display-md font-bold'>{stat.value}</p>
                <p className='text-sm text-neutral-500'>{stat.label}</p>
              </BrandScrollStaggerItem>
            ))}
          </BrandScrollStagger>
        )}

        {imageUrl && (
          <BrandScrollReveal
            className='flex max-h-[720px] min-h-[193px] items-start self-stretch overflow-hidden rounded-lg'
            variant='scaleUp'
            delay={0.1}>
            <img src={imageUrl} alt='' className='aspect-video h-full w-full object-center md:aspect-16/9' />
          </BrandScrollReveal>
        )}
      </div>
    </section>
  );
};

export default BrandPageHeroSection;
