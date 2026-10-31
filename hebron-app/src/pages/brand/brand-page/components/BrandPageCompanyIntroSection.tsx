import { BrandScrollReveal } from '@/components/brand/BrandScrollReveal';
import type { CompanyInfoView } from '@/data/pages/pages.mapper';
import BrandPageSectionHeading from '@/pages/brand/brand-page/components/BrandPageSectionHeading';

type BrandPageCompanyIntroSectionProps = {
  data?: CompanyInfoView;
};

const BrandPageCompanyIntroSection = ({ data }: BrandPageCompanyIntroSectionProps) => {
  if (!data) return null;

  const { heading, imageUrl, companyInfo } = data;

  return (
    <section className='mx-auto flex w-full max-w-360 flex-col gap-2 px-4 py-8 sm:gap-10 sm:px-[clamp(16px,5.56vw,80px)] lg:py-4'>
      <div className='px-0 md:px-8'>
        {heading && (
          <BrandScrollReveal variant='fadeUp'>
            <BrandPageSectionHeading title={heading} />
          </BrandScrollReveal>
        )}

        <div className='flex flex-col gap-2 sm:gap-16 lg:flex-row lg:items-start'>
          {imageUrl && (
            <BrandScrollReveal
              className='h-62.5 w-93.75 max-w-full shrink-0 overflow-hidden rounded-lg lg:h-114.5 lg:w-172'
              variant='slideRight'>
              <img src={imageUrl} alt='' className='size-full object-cover object-center' />
            </BrandScrollReveal>
          )}

          <BrandScrollReveal className='flex min-w-0 flex-1 flex-col gap-3' variant='slideLeft' delay={0.1}>
            {heading && <h3 className='text-display-xs md:text-display-sm font-bold'>{heading}</h3>}

            {companyInfo && companyInfo.length > 0 && (
              <dl className='flex flex-col'>
                {companyInfo.map((field, idx) => (
                  <div
                    key={`${field.label}-${idx}`}
                    className='md:text-md flex h-13 items-center justify-between gap-4 border-b border-neutral-800/60 text-sm last:border-b-0'>
                    <dt className='shrink-0 text-neutral-500'>{field.label}</dt>
                    <dd className='text-right text-neutral-200'>{field.value}</dd>
                  </div>
                ))}
              </dl>
            )}
          </BrandScrollReveal>
        </div>
      </div>
    </section>
  );
};

export default BrandPageCompanyIntroSection;
