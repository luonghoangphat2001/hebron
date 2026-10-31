import { BrandScrollStagger, BrandScrollStaggerItem } from '@/components/brand/BrandScrollReveal';
import type { BrandHomeStatView } from '@/data/pages/pages.mapper';

type StatsSectionProps = {
  items: BrandHomeStatView[];
};

const StatsSection = ({ items }: StatsSectionProps) => {
  if (!items.length) return null;

  return (
    <section className='px-4 py-6 text-white md:py-10'>
      <BrandScrollStagger className='mx-auto grid max-w-304 grid-cols-2 gap-4 md:flex md:justify-center md:gap-16'>
        {items.map((item) => (
          <BrandScrollStaggerItem key={item.value} className='flex flex-col gap-2 text-center md:gap-2' variant='scaleUp'>
            <p className='text-display-xs md:text-display-md font-bold'>{item.value}</p>
            <p className='md:text-md text-xs whitespace-pre-line text-neutral-500'>{item.label}</p>
          </BrandScrollStaggerItem>
        ))}
      </BrandScrollStagger>
    </section>
  );
};

export default StatsSection;
