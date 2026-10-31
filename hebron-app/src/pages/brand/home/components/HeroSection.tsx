import { BrandScrollReveal } from '@/components/brand/BrandScrollReveal';
import { Button } from '@/components/ui/button';
import type { BrandHomeHeroView } from '@/data/pages/pages.mapper';
import { useIsMobile } from '@/hooks/useIsMobile';
import BrandHeroSection from '@/pages/brand/components/BrandHeroSection';
import { Link } from 'react-router-dom';

type HeroSectionProps = {
  data: BrandHomeHeroView;
};

const HeroSection = ({ data }: HeroSectionProps) => {
  const isMobile = useIsMobile();
  const isExternalCta = /^https?:\/\//i.test(data.ctaLink);

  return (
    <BrandHeroSection
      className='h-225 min-h-140'
      bottomFadeClassName='h-24 md:h-205'
      backgroundImageUrl={isMobile ? data.imageUrlMB : data.imageUrlPC}
      overlayOpacity={data.overlayOpacity}>
      <div className='absolute inset-x-0 bottom-[25%] z-10 flex translate-y-1/2 flex-col items-center gap-6 px-4'>
        <BrandScrollReveal variant='fadeUp' duration={0.55} delay={0.05}>
          <p className='text-display-sm md:text-display-xl text-center font-black whitespace-pre-line text-white'>
            {data.heading}
          </p>
        </BrandScrollReveal>
        <BrandScrollReveal variant='fadeUp' duration={0.55} delay={0.12}>
          <p className='text-center text-sm whitespace-pre-line text-white md:text-lg'>{data.description}</p>
        </BrandScrollReveal>
        <BrandScrollReveal variant='scaleUp' duration={0.5} delay={0.2} className='w-full sm:w-auto'>
          <Button asChild className='text-md! bg-brand h-11 w-full rounded-full text-white sm:max-w-39 md:w-39' size='lg'>
            {isExternalCta ? (
              <a href={data.ctaLink} target='_blank' rel='noopener noreferrer'>
                {data.ctaLabel}
              </a>
            ) : (
              <Link to={data.ctaLink}>{data.ctaLabel}</Link>
            )}
          </Button>
        </BrandScrollReveal>
      </div>
    </BrandHeroSection>
  );
};

export default HeroSection;
