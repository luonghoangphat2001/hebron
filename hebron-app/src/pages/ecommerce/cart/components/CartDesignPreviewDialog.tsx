import AppDialog from '@/components/dialog/AppDialog';
import DesignCompositePreview from '@/components/design/DesignCompositePreview';
import type { GuestCartItem } from '@/utils/helper/guest-cart.helper';

type Props = {
  open: boolean;
  image?: string;
  backImage?: string;
  design?: GuestCartItem['design'];
  productName?: string;
  onOpenChange: (open: boolean) => void;
};

const getPreviewAspectRatio = (design: GuestCartItem['design'], side: 'front' | 'back') => {
  const canvasSize = design?.sideFrames?.[side]?.canvasSize || design?.canvasSize;
  if (!canvasSize?.width || !canvasSize.height) return undefined;

  return `${canvasSize.width} / ${canvasSize.height}`;
};

const CartDesignPreviewDialog = ({ open, image, backImage, design, productName, onOpenChange }: Props) => (
  <AppDialog
    open={open}
    onOpenChange={onOpenChange}
    title='시안 미리보기'
    showFooter={false}
    className='sm:max-w-3xl'
    contentClassName='border-y-0 bg-neutral-50 p-3 md:p-5'>
    <div className='grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-5'>
      {[
        { side: 'front' as const, image, label: '앞면' },
        { side: 'back' as const, image: backImage, label: '뒷면' },
      ]
        .filter((item): item is { side: 'front' | 'back'; image: string; label: string } => Boolean(item.image))
        .map((item) => (
          <figure key={item.side} className='flex min-w-0 flex-col items-center gap-2 rounded-lg bg-white p-2 md:p-3'>
            <div className='w-full overflow-hidden' style={{ aspectRatio: getPreviewAspectRatio(design, item.side) }}>
              <DesignCompositePreview
                preview={item.image}
                design={design}
                side={item.side}
                alt={`${productName || '디자인 미리보기'} ${item.label}`}
                className='size-full'
              />
            </div>
            <figcaption className='text-sm font-medium text-neutral-500'>{item.label}</figcaption>
          </figure>
        ))}
    </div>
  </AppDialog>
);

export default CartDesignPreviewDialog;
