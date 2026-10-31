import { LogoShort } from '@/assets/svgs';
import { cn } from '@/lib/utils';
import type { BrandProductInquiryFormValues } from '@/schemas/brand-product-inquiry/brand-product-inquiry-form.schema';
import { BRAND_PRODUCT_INQUIRY_PAGE_LABELS, getBrandProductInquiryImage } from '@/utils/constants/brand-product-inquiry.constant';
import { useFormContext, useWatch } from 'react-hook-form';

type ProductInquiryPreviewImageProps = {
  imageUrl?: string | null;
};

const ProductInquiryPreviewImage = ({ imageUrl }: ProductInquiryPreviewImageProps) => {
  const { control } = useFormContext<BrandProductInquiryFormValues>();
  const inquiryType = useWatch({ control, name: 'inquiryType' });
  const defaultImage = getBrandProductInquiryImage(inquiryType);
  const previewImage = imageUrl || defaultImage;

  return (
    <div className='order-last flex w-full shrink-0 flex-col gap-6 lg:order-first lg:w-107 lg:gap-10'>
      <div className='hidden items-center gap-4 lg:flex'>
        <img src={LogoShort} alt='' className='h-11 w-6 object-contain' aria-hidden />
        <h2 className='text-display-xs font-bold text-white md:text-[36px] md:leading-[44px]'>
          {BRAND_PRODUCT_INQUIRY_PAGE_LABELS.formSectionTitle}
        </h2>
      </div>

      <div className='w-full overflow-hidden rounded-2xl'>
        <img
          key={previewImage}
          src={previewImage}
          alt=''
          className={cn(
            'w-full rounded-2xl object-cover object-center transition-opacity duration-300',
            'h-105 sm:h-125 lg:h-232.5',
          )}
          aria-hidden
        />
      </div>
    </div>
  );
};

export default ProductInquiryPreviewImage;
