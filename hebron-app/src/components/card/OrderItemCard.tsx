import DesignCompositePreview from '@/components/design/DesignCompositePreview';
import CartDesignPreviewDialog from '@/pages/ecommerce/cart/components/CartDesignPreviewDialog';
import { formatPrice } from '@/utils/helper/common.helper';
import type { GuestCartItem } from '@/utils/helper/guest-cart.helper';
import { PenIcon } from '@phosphor-icons/react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

type OrderItemCardProps = {
  title: string;
  image: string;
  description: string;
  specification?: string;
  content?: {
    title: string;
    recipientName: string;
    message: string;
    date: string;
    sender: string;
  };
  designId?: string;
  previewFront?: string;
  previewBack?: string;
  design?: GuestCartItem['design'];
  quantity: number;
  price: number;
};

const OrderItemCard = ({
  title,
  image,
  description,
  specification,
  content,
  designId,
  previewFront,
  previewBack,
  design,
  quantity,
  price,
}: OrderItemCardProps) => {
  const { t: tCommon } = useTranslation('common');
  const [isDesignPreviewOpen, setIsDesignPreviewOpen] = useState(false);
  const designPreviews = designId
    ? [
        { side: 'front' as const, image: previewFront, label: 'Front' },
        { side: 'back' as const, image: previewBack, label: 'Back' },
      ].filter((preview): preview is { side: 'front' | 'back'; image: string; label: string } => Boolean(preview.image))
    : [];
  const additionalDetails =
    content || designPreviews.length > 0 ? (
      <>
        {content && (
          <div className='mt-2 w-full space-y-1 rounded-lg bg-white p-3'>
            <div className='flex items-center gap-1'>
              <PenIcon className='size-4 text-neutral-400' weight='duotone' />
              <p className='text-sm font-bold'>{tCommon('title.text_content')}</p>
            </div>
            <p className='text-sm font-bold'>
              {content.title || '-'} <span className='ml-2 font-normal text-neutral-500'>{content.recipientName || '-'}</span>
            </p>
            <p className='line-clamp-2 text-sm text-neutral-500'>{content.message || '-'}</p>
            <p className='text-sm text-neutral-500'>
              {content.date || '-'} · {content.sender || '-'}
            </p>
          </div>
        )}
        {designPreviews.length > 0 && (
          <div className='mt-3 flex gap-2'>
            {designPreviews.map((preview) => (
              <button
                key={preview.side}
                type='button'
                className='size-16 cursor-pointer overflow-hidden rounded-md border border-neutral-200 bg-white'
                onClick={() => setIsDesignPreviewOpen(true)}
                aria-label={`${title} ${preview.label} design preview`}>
                <DesignCompositePreview
                  preview={preview.image}
                  design={design}
                  side={preview.side}
                  alt={`${title} ${preview.label}`}
                  className='size-full'
                />
              </button>
            ))}
          </div>
        )}
      </>
    ) : null;

  return (
    <div className='flex flex-col gap-4 rounded-md bg-neutral-50 p-4 md:flex-row'>
      <img src={image} alt={title} className='size-16 rounded-md bg-white object-contain' />
      <div className='flex w-full justify-between gap-4'>
        <div className='flex-1 space-y-1'>
          <p className='text-lg font-bold text-neutral-900'>{title}</p>
          {specification && <p className='text-sm text-neutral-500'>{specification}</p>}
          <p className='text-sm text-neutral-500'>{description}</p>
          <div className='hidden md:block'>
            {content && (
              <div className='mt-2 w-full space-y-1 rounded-lg bg-white p-3'>
                <div className='flex items-center gap-1'>
                  <PenIcon className='size-4 text-neutral-400' weight='duotone' />
                  <p className='text-sm font-bold'>{tCommon('title.text_content')}</p>
                </div>
                <p className='text-sm font-bold'>
                  {content.title || '-'} <span className='ml-2 font-normal text-neutral-500'>{content.recipientName || '-'}</span>
                </p>
                <p className='line-clamp-2 text-sm text-neutral-500'>{content.message || '-'}</p>
                <p className='text-sm text-neutral-500'>
                  {content.date || '-'} · {content.sender || '-'}
                </p>
              </div>
            )}
            {designPreviews.length > 0 && (
              <div className='mt-3 flex gap-2'>
                {designPreviews.map((preview) => (
                  <button
                    key={preview.side}
                    type='button'
                    className='size-16 cursor-pointer overflow-hidden rounded-md border border-neutral-200 bg-white'
                    onClick={() => setIsDesignPreviewOpen(true)}
                    aria-label={`${title} ${preview.label} design preview`}>
                    <DesignCompositePreview
                      preview={preview.image}
                      design={design}
                      side={preview.side}
                      alt={`${title} ${preview.label}`}
                      className='size-full'
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className='min-w-22.5 space-y-1 text-right'>
          <p className='text-sm text-neutral-500'>{quantity}개</p>
          <p className='text-lg font-bold'>{formatPrice(price)}</p>
        </div>
      </div>
      <div className='w-full md:hidden'>{additionalDetails}</div>
      {designPreviews.length > 0 && (
        <CartDesignPreviewDialog
          open={isDesignPreviewOpen}
          image={previewFront}
          backImage={previewBack}
          design={design}
          productName={title}
          onOpenChange={setIsDesignPreviewOpen}
        />
      )}
    </div>
  );
};

export default OrderItemCard;
