import { LogoShort } from '@/assets/svgs';
import { BrandScrollReveal, BrandScrollStagger, BrandScrollStaggerItem } from '@/components/brand/BrandScrollReveal';
import type { BrandHomeCustomProcessView } from '@/data/pages/pages.mapper';
import { cn } from '@/lib/utils';

type CustomSectionProps = {
  data: BrandHomeCustomProcessView;
};

const CustomSection = ({ data }: CustomSectionProps) => {
  return (
    <section className='mx-auto flex w-full max-w-304 flex-col gap-10 px-4 py-8 text-white sm:px-0 md:py-24'>
      <BrandScrollReveal className='flex flex-col gap-2 md:flex-row md:items-center md:justify-between' variant='fadeUp'>
        <div className='flex flex-1 items-start gap-3'>
          <img src={LogoShort} alt='' className='mt-1 size-6 shrink-0 md:mt-2.5' aria-hidden />
          <p className='text-display-xs md:text-display-md font-bold whitespace-pre-line'>{data.heading}</p>
        </div>
        <p className='text-sm whitespace-pre-line text-neutral-400 md:text-lg'>{data.description}</p>
      </BrandScrollReveal>

      <BrandScrollStagger className='flex flex-col gap-14' stagger={0.15}>
        {data.steps.map((custom, index) => (
          <BrandScrollStaggerItem
            key={custom.id}
            variant={index % 2 === 0 ? 'slideRight' : 'slideLeft'}
            className={cn(
              'flex flex-col-reverse gap-4 sm:flex-col md:flex-row md:items-start md:justify-between md:gap-16',
              index % 2 !== 1 ? 'md:flex-row-reverse md:text-left' : 'md:text-right',
            )}>
            <img
              src={custom.image}
              alt={custom.imageAlt || ''}
              loading='lazy'
              decoding='async'
              className='order-1 w-full shrink-0 rounded-xl object-cover md:order-0 md:w-147.5'
            />
            <div className='order-2 flex flex-col gap-2 md:order-0 md:max-w-md'>
              <p className='text-display-xs md:text-display-md'>{custom.title}</p>
              <p className='text-sm font-light whitespace-pre-line text-neutral-400'>{custom.description}</p>
            </div>
          </BrandScrollStaggerItem>
        ))}
      </BrandScrollStagger>
    </section>
  );
};

export default CustomSection;
