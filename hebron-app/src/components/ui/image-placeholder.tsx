import { cn } from '@/lib/utils';
import { ImageBrokenIcon } from '@phosphor-icons/react';

function ImagePlaceholder({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn('grid place-items-center bg-neutral-50 text-neutral-500', className)}
      role='img'
      aria-label='이미지 없음'
      {...props}>
      <span className='grid size-12 place-items-center rounded-lg border border-neutral-200 bg-white'>
        <ImageBrokenIcon className='size-5' aria-hidden='true' />
      </span>
    </div>
  );
}

export { ImagePlaceholder };
