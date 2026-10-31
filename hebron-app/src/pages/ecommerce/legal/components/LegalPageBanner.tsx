import { Typography } from '@/components/typography/Typography';

type LegalPageBannerProps = {
  title: string;
  image: string;
};

const LegalPageBanner = ({ title, image }: LegalPageBannerProps) => {
  return (
    <section className='relative w-full overflow-hidden rounded-lg'>
      <img src={image} alt='' className='h-41.5 w-full object-cover' aria-hidden />
      <div className='absolute inset-0 bg-neutral-950/50' aria-hidden />
      <div className='absolute inset-0 flex items-end px-6 pb-4 md:px-10 md:pb-6'>
        <Typography variant='display-sm' weight='bold' className='text-4xl text-white'>
          {title}
        </Typography>
      </div>
    </section>
  );
};

export default LegalPageBanner;
