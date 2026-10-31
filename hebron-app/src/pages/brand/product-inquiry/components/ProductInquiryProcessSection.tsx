import type { BrandProductInquiryStepView } from '@/utils/types/brand-product-inquiry.type';
import { cn } from '@/lib/utils';
import {
  BRAND_PRODUCT_INQUIRY_PAGE_LABELS,
  BRAND_PRODUCT_INQUIRY_PROCESS_STEPS,
  getBrandProductInquiryStepIcon,
} from '@/utils/constants/brand-product-inquiry.constant';

type ProductInquiryProcessSectionProps = {
  title?: string;
  subtitle?: string;
  steps?: BrandProductInquiryStepView[];
};

const ProductInquiryProcessSection = ({ title, subtitle, steps }: ProductInquiryProcessSectionProps) => {
  const processSteps = steps?.length ? steps : BRAND_PRODUCT_INQUIRY_PROCESS_STEPS;
  const heading = title || BRAND_PRODUCT_INQUIRY_PAGE_LABELS.processTitle;
  const description = subtitle || BRAND_PRODUCT_INQUIRY_PAGE_LABELS.processSubtitle;

  return (
    <section className='mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-10 md:py-14'>
      <div className='flex flex-col gap-2'>
        <h2 className='text-display-sm md:text-display-md font-bold'>{heading}</h2>
        <p className='md:text-md text-sm text-neutral-400'>{description}</p>
      </div>

      <div
        className={cn(
          'flex gap-2.5 overflow-x-auto pb-2 md:grid md:grid-cols-3 md:overflow-x-visible lg:grid-cols-6',
          'snap-x snap-mandatory md:snap-none',
          '[scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
        )}>
        {processSteps.map((step) => {
          const StepIcon = getBrandProductInquiryStepIcon(step.key);

          return (
            <article
              key={step.key}
              className='flex w-44 shrink-0 snap-start flex-col gap-3 rounded-lg border border-neutral-800 bg-neutral-900 p-4 md:w-auto'>
              <StepIcon className='size-5 text-neutral-400' weight='regular' aria-hidden />
              <div className='flex flex-col gap-1'>
                <h3 className='text-sm font-bold text-white'>{step.title}</h3>
                <p className='text-xs leading-relaxed text-neutral-500'>{step.description}</p>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
};

export default ProductInquiryProcessSection;
