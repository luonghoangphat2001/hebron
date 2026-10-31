import { LogoShort } from '@/assets/svgs';
import { BrandScrollReveal } from '@/components/brand/BrandScrollReveal';

type PortfolioIntroProps = {
  heading: string;
  description: string;
};

const PortfolioIntro = ({ heading, description }: PortfolioIntroProps) => {
  return (
    <BrandScrollReveal
      className='mx-auto flex max-w-304 flex-col gap-4 md:flex-row md:items-start md:justify-between md:gap-16'
      variant='fadeUp'>
      <div className='flex items-center gap-3'>
        <img src={LogoShort} alt='' className='size-6 shrink-0' aria-hidden />
        <p className='text-display-xs md:text-display-md font-bold'>{heading}</p>
      </div>
      <p className='text-sm whitespace-pre-line text-neutral-400 md:max-w-md md:px-0 md:text-lg'>{description}</p>
    </BrandScrollReveal>
  );
};

export default PortfolioIntro;
