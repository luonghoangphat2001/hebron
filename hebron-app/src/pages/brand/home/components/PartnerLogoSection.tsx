import { BrandScrollReveal } from '@/components/brand/BrandScrollReveal';
import type { BrandHomePartnerLogoView } from '@/data/pages/pages.mapper';
import { useTicker } from '@/hooks/useTicker';
import { motion } from 'framer-motion';

type PartnerLogoSectionProps = {
  logos: BrandHomePartnerLogoView[];
};

const PartnerLogoSection = ({ logos }: PartnerLogoSectionProps) => {
  const { trackItems, animate, transition } = useTicker({
    items: logos,
    minItems: 10,
    speed: 2.5,
    direction: 'left',
  });

  if (!logos.length) return null;

  return (
    <section className='py-8 md:py-16'>
      <BrandScrollReveal className='relative mx-auto max-w-304 overflow-hidden py-4' variant='fadeIn' duration={0.8}>
        <div className='flex overflow-hidden select-none'>
          <motion.div className='flex shrink-0 items-center gap-6 pr-6' animate={animate} transition={transition}>
            {trackItems.map((item, index) => (
              <img
                key={`track-1-${item.id}-${index}`}
                src={item.logoUrl}
                alt={item.name || ''}
                className='h-8 shrink-0 opacity-35 transition-opacity hover:opacity-80 md:h-auto'
                aria-hidden={!item.name}
              />
            ))}
          </motion.div>

          <motion.div className='flex shrink-0 items-center gap-6 pr-6' animate={animate} transition={transition} aria-hidden>
            {trackItems.map((item, index) => (
              <img
                key={`track-2-${item.id}-${index}`}
                src={item.logoUrl}
                alt={item.name || ''}
                className='h-8 shrink-0 opacity-35 transition-opacity hover:opacity-80 md:h-auto'
                aria-hidden={!item.name}
              />
            ))}
          </motion.div>
        </div>

        <div
          className='pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-linear-to-r from-neutral-950 to-transparent md:w-32'
          aria-hidden
        />
        <div
          className='pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-linear-to-l from-neutral-950 to-transparent md:w-32'
          aria-hidden
        />
      </BrandScrollReveal>
    </section>
  );
};

export default PartnerLogoSection;
