import { LogoShort } from '@/assets/svgs';
import { BrandScrollReveal } from '@/components/brand/BrandScrollReveal';
import type { BrandHomeIntroductionView } from '@/data/pages/pages.mapper';

type IntroductionSectionProps = {
  data: BrandHomeIntroductionView;
};

const IntroductionSection = ({ data }: IntroductionSectionProps) => {
  return (
    <section className='mx-auto flex w-full max-w-304 flex-col gap-10 px-4 py-8 text-white sm:px-0 md:py-24'>
      <BrandScrollReveal className='flex flex-col gap-2 md:flex-row md:items-start md:justify-between' variant='fadeUp'>
        <div className='flex flex-1 items-center gap-3'>
          <img src={LogoShort} alt='' className='size-6 shrink-0' aria-hidden />
          <h2 className='text-display-xs md:text-display-md font-bold'>{data.heading}</h2>
        </div>
        <p className='text-sm whitespace-pre-line text-neutral-400 sm:px-10 md:max-w-xl md:text-sm'>{data.description}</p>
      </BrandScrollReveal>

      {data.imageUrl ? (
        <BrandScrollReveal className='overflow-hidden rounded-lg' variant='scaleUp' delay={0.1}>
          {data.mediaType === 'video' ? (
            <video
              src={data.imageUrl}
              autoPlay
              loop
              muted
              playsInline
              className='aspect-video w-full object-cover object-center'
            />
          ) : (
            <img
              src={data.imageUrl}
              alt={data.imageAlt || ''}
              className='aspect-video w-full object-cover object-center md:aspect-auto'
              loading='lazy'
              decoding='async'
            />
          )}
        </BrandScrollReveal>
      ) : null}
    </section>
  );
};

export default IntroductionSection;
