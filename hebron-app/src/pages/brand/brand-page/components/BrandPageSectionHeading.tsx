import { cn } from '@/lib/utils';
import { BRAND_PAGE_SECTION_ICON } from '@/utils/constants/brand-page.constant';

type BrandPageSectionHeadingProps = {
  title: string;
  className?: string;
};

const BrandPageSectionHeading = ({ title, className }: BrandPageSectionHeadingProps) => {
  return (
    <div className={cn('flex items-center gap-3', className)}>
      <img src={BRAND_PAGE_SECTION_ICON} alt='' className='size-6 shrink-0' aria-hidden />
      <h2 className='text-display-xs md:text-display-sm font-bold'>{title}</h2>
    </div>
  );
};

export default BrandPageSectionHeading;
