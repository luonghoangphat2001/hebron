import { LogoShort } from '@/assets/svgs';
import { BrandScrollReveal } from '@/components/brand/BrandScrollReveal';
import { cn } from '@/lib/utils';
import { BRAND_ROUTE } from '@/utils/constants/route.constant';
import type { BrandHomePortfolioView } from '@/utils/types/pages.type';
import { Link } from 'react-router-dom';
import PortfolioCarousel from './PortfolioCarousel';

type PortfolioPreviewSectionProps = {
  className?: string;
  data?: BrandHomePortfolioView;
};

const PortfolioPreviewSection = ({ className, data }: PortfolioPreviewSectionProps) => {
  const heading = data?.heading;
  const description = data?.description;
  const viewAllLink = data?.viewAllLink || BRAND_ROUTE.PORTFOLIO;
  const viewAllLabel = data?.viewAllLabel || 'ì „ì²´ ë³´ê¸°';

  return (
    <section
      className={cn(
        'relative flex w-full flex-col items-center gap-10 overflow-hidden bg-neutral-950 py-8 text-white md:py-24',
        className,
      )}>
      <BrandScrollReveal
        className='flex w-full max-w-304 flex-col gap-2 px-4 md:flex-row md:items-start md:justify-between lg:px-0'
        variant='fadeUp'>
        <div className='flex flex-1 items-center gap-3 md:gap-2'>
          <img src={LogoShort} alt='' className='size-6 shrink-0' aria-hidden />
          <h2 className='text-[30px] leading-[38px] font-bold text-white md:text-[36px] md:leading-[44px]'>{heading}</h2>
        </div>
        <p className='text-sm whitespace-pre-line text-neutral-400 md:max-w-138.5 md:text-[18px] md:leading-[28px]'>
          {description}
        </p>
      </BrandScrollReveal>

      <BrandScrollReveal className='w-full max-w-304 px-4 lg:px-0' variant='scaleUp' delay={0.1}>
        <PortfolioCarousel items={data?.items.slice(0, 5)} className='max-w-full px-0' />
      </BrandScrollReveal>

      <BrandScrollReveal variant='fadeUp' delay={0.2} className='w-full sm:w-41'>
        <Link
          to={viewAllLink}
          className='flex h-10 items-center justify-center rounded-full border border-white/12 px-4 py-2 text-sm font-normal text-[#fafafa] transition-colors hover:border-white/30 hover:bg-white/5'>
          {viewAllLabel}
        </Link>
      </BrandScrollReveal>
    </section>
  );
};

export default PortfolioPreviewSection;
