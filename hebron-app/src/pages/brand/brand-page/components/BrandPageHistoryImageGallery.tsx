import { cn } from '@/lib/utils';

type BrandPageHistoryImageGalleryProps = {
  images?: string[];
  className?: string;
};

const BrandPageHistoryImageGallery = ({ images, className }: BrandPageHistoryImageGalleryProps) => {
  if (!images || images.length === 0) return null;

  const firstImage = images[0];

  return (
    <div className={cn('w-full max-w-[498px]', className)}>
      <img src={firstImage} alt='' className='h-[200px] w-full rounded-lg object-cover object-center sm:h-[285px]' />
    </div>
  );
};

export default BrandPageHistoryImageGallery;
