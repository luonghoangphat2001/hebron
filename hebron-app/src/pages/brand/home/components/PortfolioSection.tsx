import { BrandScrollReveal } from '@/components/brand/BrandScrollReveal';
import type { BrandHomePortfolioView } from '@/data/pages/pages.mapper';
import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

import PortfolioCarousel from './PortfolioCarousel';
import PortfolioIntro from './PortfolioIntro';

type PortfolioSectionProps = {
  children?: ReactNode;
  /** Home: hiện intro text. Portfolio page: ẩn vì hero đã có title. */
  showIntro?: boolean;
  data?: BrandHomePortfolioView;
};

const PortfolioSection = ({ children, showIntro = true, data }: PortfolioSectionProps) => {
  return (
    <section className={cn('min-w-0 overflow-x-hidden px-4 text-white', showIntro ? 'py-10 md:py-24' : 'pb-10 md:pb-16')}>
      {showIntro && data ? <PortfolioIntro heading={data.heading} description={data.description} /> : null}

      <BrandScrollReveal className={cn('mx-auto max-w-7xl', showIntro && 'mt-10')} variant='scaleUp' delay={0.1}>
        <PortfolioCarousel items={data?.items} />
      </BrandScrollReveal>

      {children && <div className='mx-auto mt-10 flex max-w-7xl flex-col gap-10'>{children}</div>}
    </section>
  );
};

export default PortfolioSection;
