import { Logo as BrandLogo } from '@/assets/svgs';
import { BrandScrollReveal } from '@/components/brand/BrandScrollReveal';
import { Button } from '@/components/ui/button';
import type { BrandHomeAboutCtaProductItemView, BrandHomeAboutCtaView } from '@/data/pages/pages.mapper';
import { useTicker } from '@/hooks/useTicker';
import { cn } from '@/lib/utils';
import { BRAND_MOMENT_TROPHIES, BRAND_MOMENT_TROPHY_HEIGHT_CLASSES } from '@/utils/constants/brand-moment.constant';
import { getBrandProductDetailPath, getBrandProductInquiryPath, getBrandProductsPath } from '@/utils/constants/route.constant';
import { motion } from 'framer-motion';
import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import Momentflare from '../../../assets/images/moment-flare.png';

type BrandMomentSectionProps = {
  className?: string;
  data?: BrandHomeAboutCtaView;
};

const BrandMomentSection = ({ className, data }: BrandMomentSectionProps) => {
  // eslint-disable-next-line react-hooks/preserve-manual-memoization
  const trophyItems: BrandHomeAboutCtaProductItemView[] = useMemo(() => {
    if (data?.items?.length) return data.items;
    const images = data?.productImages?.length ? data.productImages : [...BRAND_MOMENT_TROPHIES];
    return images.map((image) => ({ image }));
  }, [data?.items, data?.productImages]);

  const line1Items = trophyItems.slice(0, 11);
  const line2Items = trophyItems.length > 11 ? trophyItems.slice(11) : trophyItems.slice(0, 11);

  // Line 1 ticker: Right to Left
  const line1Ticker = useTicker({
    items: line1Items,
    minItems: 12,
    speed: 3,
    direction: 'left',
  });

  // Line 2 ticker: Left to Right
  const line2Ticker = useTicker({
    items: line2Items,
    minItems: 13,
    speed: 3,
    direction: 'right',
  });

  return (
    <section
      className={cn(
        'relative flex flex-col gap-10 overflow-hidden bg-neutral-950 px-4 py-8 text-white md:gap-14 md:px-0 md:py-16',
        className,
      )}>
      <div className='pointer-events-none absolute right-1/2 z-20 h-[274px] w-[274px] translate-x-2/5 translate-y-3/4 select-none'>
        <img src={Momentflare} className='size-full' alt='' />
      </div>
      <BrandScrollReveal
        className='relative z-30 mx-auto flex max-w-5xl flex-col items-center gap-6 text-center [&>*:nth-child(3)]:mt-4'
        variant='fadeUp'>
        <div className='flex flex-col items-center gap-2'>
          <p className='md:text-display-lg text-[30px] leading-[38px] font-bold'>당신의 순간을</p>
          <div className='text-display-sm md:text-display-lg flex items-center gap-2 font-bold md:gap-4'>
            <div className='inline-flex items-center gap-1'>
              <img src={BrandLogo} alt='HEBRON' className='h-auto w-[130px] md:w-58.5' aria-hidden />
              <span>이</span>
            </div>
            <p>완성합니다</p>
          </div>
        </div>

        <p className='md:text-md text-sm leading-6 whitespace-pre-line text-white md:leading-normal'>
          {'기업 행사, 골프 대회, 포상식, 기념일\n어떤 자리든 헤브론의 상패가 그 가치를 더합니다.'}
        </p>

        <div className='flex w-full max-w-[343px] items-center justify-center gap-2 sm:w-auto sm:max-w-none'>
          <Button
            asChild
            size='lg'
            variant='outline'
            className='text-md! h-11 flex-1 rounded-full border border-white bg-transparent font-bold text-white! transition-colors hover:border-white hover:bg-white/10 hover:text-white! active:bg-white/20 sm:w-35 sm:flex-initial'>
            <Link to={getBrandProductsPath()}>{data?.secondaryLabel || '기성품 보러가기'}</Link>
          </Button>
          <Button
            asChild
            size='lg'
            className='text-md! bg-brand hover:bg-brand/90 h-11 flex-1 rounded-full px-6 font-bold text-white! transition-colors sm:w-35 sm:flex-initial'>
            <Link to={getBrandProductInquiryPath()}>{data?.primaryLabel || '제작문의'}</Link>
          </Button>
        </div>
      </BrandScrollReveal>

      <BrandScrollReveal className='relative w-full' variant='scaleUp' delay={0.15}>
        <div className='relative z-10 flex flex-col gap-4 overflow-hidden select-none'>
          {/* Line 1: Right to Left */}
          <div className='flex overflow-hidden'>
            <motion.div
              className='flex shrink-0 items-end gap-3 pr-3 md:gap-4 md:pr-4'
              animate={line1Ticker.animate}
              transition={line1Ticker.transition}>
              {line1Ticker.trackItems.map((item, index) => {
                const img = (
                  <img
                    src={item.image}
                    alt=''
                    aria-hidden
                    className={cn(
                      'w-auto shrink-0 object-contain',
                      BRAND_MOMENT_TROPHY_HEIGHT_CLASSES[index % BRAND_MOMENT_TROPHY_HEIGHT_CLASSES.length],
                    )}
                    loading='lazy'
                  />
                );

                return item.slug ? (
                  <Link
                    key={`line1-track1-${item.image}-${index}`}
                    to={getBrandProductDetailPath(item.slug)}
                    className='shrink-0'>
                    {img}
                  </Link>
                ) : (
                  <span key={`line1-track1-${item.image}-${index}`} className='shrink-0'>
                    {img}
                  </span>
                );
              })}
            </motion.div>

            <motion.div
              className='flex shrink-0 items-end gap-3 pr-3 md:gap-4 md:pr-4'
              animate={line1Ticker.animate}
              transition={line1Ticker.transition}
              aria-hidden>
              {line1Ticker.trackItems.map((item, index) => {
                const img = (
                  <img
                    src={item.image}
                    alt=''
                    aria-hidden
                    className={cn(
                      'w-auto shrink-0 object-contain',
                      BRAND_MOMENT_TROPHY_HEIGHT_CLASSES[index % BRAND_MOMENT_TROPHY_HEIGHT_CLASSES.length],
                    )}
                    loading='lazy'
                  />
                );

                return item.slug ? (
                  <Link
                    key={`line1-track2-${item.image}-${index}`}
                    to={getBrandProductDetailPath(item.slug)}
                    tabIndex={-1}
                    className='shrink-0'>
                    {img}
                  </Link>
                ) : (
                  <span key={`line1-track2-${item.image}-${index}`} className='shrink-0'>
                    {img}
                  </span>
                );
              })}
            </motion.div>
          </div>

          {/* Line 2: Left to Right */}
          {line2Items.length > 0 && (
            <div className='flex overflow-hidden'>
              <motion.div
                className='flex shrink-0 items-end gap-3 pr-3 md:gap-4 md:pr-4'
                animate={line2Ticker.animate}
                transition={line2Ticker.transition}>
                {line2Ticker.trackItems.map((item, index) => {
                  const img = (
                    <img
                      src={item.image}
                      alt=''
                      aria-hidden
                      className={cn(
                        'w-auto shrink-0 object-contain',
                        BRAND_MOMENT_TROPHY_HEIGHT_CLASSES[(index + 3) % BRAND_MOMENT_TROPHY_HEIGHT_CLASSES.length],
                      )}
                      loading='lazy'
                    />
                  );

                  if (item.slug) {
                    return (
                      <Link
                        key={`line2-track1-${item.image}-${index}`}
                        to={getBrandProductDetailPath(item.slug)}
                        className='shrink-0'>
                        {img}
                      </Link>
                    );
                  }

                  return (
                    <span key={`line2-track1-${item.image}-${index}`} className='shrink-0'>
                      {img}
                    </span>
                  );
                })}
              </motion.div>

              <motion.div
                className='flex shrink-0 items-end gap-3 pr-3 md:gap-4 md:pr-4'
                animate={line2Ticker.animate}
                transition={line2Ticker.transition}
                aria-hidden>
                {line2Ticker.trackItems.map((item, index) => {
                  const img = (
                    <img
                      src={item.image}
                      alt=''
                      aria-hidden
                      className={cn(
                        'w-auto shrink-0 object-contain',
                        BRAND_MOMENT_TROPHY_HEIGHT_CLASSES[(index + 3) % BRAND_MOMENT_TROPHY_HEIGHT_CLASSES.length],
                      )}
                      loading='lazy'
                    />
                  );

                  if (item.slug) {
                    return (
                      <Link
                        key={`line2-track2-${item.image}-${index}`}
                        to={getBrandProductDetailPath(item.slug)}
                        tabIndex={-1}
                        className='shrink-0'>
                        {img}
                      </Link>
                    );
                  }

                  return (
                    <span key={`line2-track2-${item.image}-${index}`} className='shrink-0'>
                      {img}
                    </span>
                  );
                })}
              </motion.div>
            </div>
          )}

          {/* Edge gradient fades */}
          <div
            className='pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-linear-to-r from-neutral-950 to-transparent md:w-32'
            aria-hidden
          />
          <div
            className='pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-linear-to-l from-neutral-950 to-transparent md:w-32'
            aria-hidden
          />
        </div>
      </BrandScrollReveal>
    </section>
  );
};

export default BrandMomentSection;
