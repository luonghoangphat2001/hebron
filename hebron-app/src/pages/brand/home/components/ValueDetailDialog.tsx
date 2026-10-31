import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import type { BrandHomeValueCardView } from '@/data/pages/pages.mapper';
import { cn } from '@/lib/utils';
import { getMallProductDetailPath } from '@/utils/constants/route.constant';
import { XIcon } from '@phosphor-icons/react';
import { Link } from 'react-router-dom';

type ValueDetailDialogProps = {
  item: BrandHomeValueCardView | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const ValueDetailDialog = ({ item, open, onOpenChange }: ValueDetailDialogProps) => {
  if (!item) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        aria-describedby={undefined}
        className={cn(
          'flex max-h-[calc(100dvh-2rem)] flex-col gap-0 overflow-hidden border border-neutral-800 bg-neutral-950 p-0 text-white',
          'max-w-[calc(100%-2rem)] sm:max-w-3xl md:max-w-5xl',
          'max-sm:top-auto max-sm:bottom-2 max-sm:translate-y-0',
        )}>
        <div className='flex shrink-0 justify-end px-4 pt-4 md:px-6 md:pt-6'>
          <button
            type='button'
            aria-label='Close'
            onClick={() => onOpenChange(false)}
            className='flex size-9 cursor-pointer items-center justify-center rounded-full text-white transition-colors hover:bg-white/10'>
            <XIcon className='size-5' weight='bold' />
          </button>
        </div>

        <div className='flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto px-4 pb-6 md:gap-8 md:px-6 md:pb-8'>
          <div className='flex flex-col gap-4 md:flex-row md:items-start md:gap-8'>
            <div className='relative mx-auto h-47.5 w-85.75 max-w-full overflow-hidden rounded-xl md:mx-0 md:h-82 md:w-147.5 md:shrink-0'>
              <img
                src={item.image}
                alt={item.imageAlt || ''}
                className='absolute inset-0 size-full object-contain object-center'
              />
            </div>

            <div className='flex flex-col gap-3 md:flex-1 md:pt-2'>
              <DialogTitle className='text-display-xs md:text-display-sm font-bold text-white'>{item.title}</DialogTitle>
              {item.description ? (
                <DialogDescription className='text-sm leading-relaxed whitespace-pre-line text-neutral-400'>
                  {item.description}
                </DialogDescription>
              ) : null}
            </div>
          </div>

          {(item.products?.length ?? 0) > 0 ? (
            <div className='flex gap-3 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'>
              {item.products?.map((product) => (
                <Link
                  key={product.id}
                  to={getMallProductDetailPath(product.slug || product.id)}
                  onClick={() => onOpenChange(false)}
                  className='hover:bg-neutral-850 flex w-36 shrink-0 flex-col overflow-hidden rounded-xl bg-neutral-900 transition-colors'>
                  <div className='aspect-square overflow-hidden bg-neutral-800'>
                    <img
                      src={product.image}
                      alt=''
                      className='size-full object-cover transition-transform duration-300 hover:scale-105'
                    />
                  </div>
                  <div className='flex flex-col gap-1 p-3'>
                    <p className='truncate text-sm font-medium text-white'>{product.title}</p>
                    <p className='text-xs text-neutral-400'>{product.price}</p>
                  </div>
                </Link>
              ))}
            </div>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ValueDetailDialog;
