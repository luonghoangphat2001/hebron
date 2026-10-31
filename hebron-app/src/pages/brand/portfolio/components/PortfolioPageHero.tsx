import { BrandScrollReveal } from '@/components/brand/BrandScrollReveal';
import BrandHeroSection from '@/pages/brand/components/BrandHeroSection';

const DEFAULT_TITLE = '포트폴리오';

type PortfolioPageHeroProps = {
  title?: string | null;
  backgroundImageUrl?: string | null;
};

const PortfolioPageHero = ({ title, backgroundImageUrl }: PortfolioPageHeroProps) => {
  return (
    <BrandHeroSection className='h-80 min-h-80 md:h-[320px]' bottomFadeClassName='h-24' backgroundImageUrl={backgroundImageUrl}>
      <div className='flex flex-1 flex-col items-center justify-end px-4 pb-16'>
        <BrandScrollReveal variant='fadeUp'>
          <h1 className='text-3xl font-semibold text-white md:text-[48px] md:leading-[60px]'>{title || DEFAULT_TITLE}</h1>
        </BrandScrollReveal>
      </div>
    </BrandHeroSection>
  );
};

export default PortfolioPageHero;
