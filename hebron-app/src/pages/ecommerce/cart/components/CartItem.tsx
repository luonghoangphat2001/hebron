import DesignCompositePreview from '@/components/design/DesignCompositePreview';
import { AppInput } from '@/components/input/AppInput';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useDeleteCartItemMutation } from '@/data/cart/cart.query';
import { getProductDetailPath } from '@/utils/constants/route.constant';
import { formatPrice } from '@/utils/helper/common.helper';
import type { GuestCartItem } from '@/utils/helper/guest-cart.helper';
import { EyeIcon, MinusIcon, PencilSimpleLineIcon, PenIcon, PlusIcon, RulerIcon } from '@phosphor-icons/react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

type CartItemProps = {
  cartItemId: number;
  productName?: string;
  productSlug?: string;
  productImage?: string;
  designId?: string;
  sku?: string;
  previewImage?: string;
  design?: GuestCartItem['design'];
  initialQuantity?: number;
  price?: number;
  content?: GuestCartItem['content'];
  selectedOptions?: GuestCartItem['selectedOptions'];
  onQuantityChange?: (quantity: number) => void;
  onEditContent?: () => void;
  onPreview?: () => void;
  onEditDesign?: () => void;
};

const CartItem = ({
  cartItemId,
  productName,
  productSlug,
  productImage,
  designId,
  sku,
  previewImage,
  design,
  initialQuantity = 1,
  price,
  content,
  selectedOptions,
  onQuantityChange,
  onEditContent,
  onPreview,
  onEditDesign,
}: CartItemProps) => {
  const { t: tCommon } = useTranslation('common');
  const { mutate: deleteCartItem, isPending: isDeletingCartItem } = useDeleteCartItemMutation();
  const quantity = initialQuantity;

  const handleDecreaseQuantity = () => {
    const nextQuantity = Math.max(0, quantity - 1);

    if (nextQuantity === 0) {
      deleteCartItem(cartItemId, { onSuccess: () => onQuantityChange?.(0) });
      return;
    }

    onQuantityChange?.(nextQuantity);
  };

  const handleIncreaseQuantity = () => {
    onQuantityChange?.(quantity + 1);
  };

  const optionItems = selectedOptions?.length
    ? selectedOptions.map((option) => ({
        label: option.groupName,
        value: (
          <p>
            {option.optionName}{' '}
            {option.additionalPrice !== 0 && (
              <span className='font-bold text-red-500'>
                {option.additionalPrice > 0 ? '+' : ''}
                {formatPrice(option.additionalPrice)}
              </span>
            )}
          </p>
        ),
      }))
    : [];

  return (
    <section className='rounded-lg border border-neutral-200'>
      <div className='flex items-center gap-1 p-5'>
        <p className='text-sm text-neutral-500'>EVERAWARD</p>
        <Badge variant='white' size='md' className='h-7 px-3'>
          {tCommon('title.free_shipping')}
        </Badge>
      </div>
      <div className='flex flex-col gap-4 border-t border-neutral-200 p-3 md:flex-row md:items-start md:p-5'>
        {previewImage ? (
          <DesignCompositePreview
            preview={previewImage}
            design={design}
            alt={productName || 'product'}
            className='h-64 w-full rounded-lg md:size-31'
          />
        ) : (
          <img src={productImage} alt={productName || 'product'} className='h-64 w-full rounded-lg object-contain md:size-31' />
        )}
        <div className='flex-1 space-y-3'>
          {/**Product name */}
          <div className='space-y-1'>
            {productSlug ? (
              <Link
                to={`${getProductDetailPath(productSlug)}${designId ? `?design=${encodeURIComponent(designId)}` : ''}`}
                className='text-lg font-bold text-neutral-900 hover:underline'>
                {productName || '크리스탈 상패 HB-7482'}
              </Link>
            ) : (
              <p className='text-lg font-bold text-neutral-900'>{productName || '크리스탈 상패 HB-7482'}</p>
            )}
            <p className='text-sm text-neutral-500'>{sku || 'HB-7482'}</p>
          </div>
          {/**options selected */}
          <div className='space-y-2'>
            {optionItems.map((option) => (
              <div key={option.label} className='flex items-center gap-6 text-xs md:text-sm'>
                <p className='w-fit text-neutral-500'>{option.label}</p>
                {option.value}
              </div>
            ))}
          </div>
          {/**Note */}
          <div className='space-y-2'>
            <div className={designId || !onEditContent ? 'hidden' : 'space-y-1 rounded-lg bg-neutral-50 p-3'}>
              <div className='flex items-center justify-between'>
                <div className='space-y-0.5'>
                  <div className='flex items-center gap-1'>
                    <PenIcon className='size-4 text-neutral-400' weight='duotone' />
                    <p className='text-sm font-bold'>{tCommon('title.text_content')}</p>
                  </div>
                  <p className='text-sm font-bold'>
                    {content?.title || '감 사 패'}{' '}
                    <span className='ml-2 font-normal text-neutral-500'>{content?.recipientName || '홍길동 상무님께'}</span>
                  </p>
                </div>
                {onEditContent ? (
                  <Button variant='outline' className='h-9 md:h-10' onClick={onEditContent}>
                    <PencilSimpleLineIcon size={20} />
                    {tCommon('button.edit')}
                  </Button>
                ) : null}
              </div>
              <p className='line-clamp-2 text-sm text-neutral-500'>
                {content?.message || '귀하께서는 회사 발전을 위하여 헌신과 노력을 아끼지 않으시고...'}
              </p>
              <p className='text-sm text-neutral-500'>
                {content?.date || '2026년 5월 26일'} · {content?.sender || '감사패드림 임직원 일동'}
              </p>
            </div>
            <div className={designId ? 'flex gap-3' : 'hidden'}>
              <Button variant='outline' className='flex-1 md:flex-none' onClick={onPreview}>
                <EyeIcon className='size-5' /> {tCommon('button.design_preview')}
              </Button>
              <Button variant='outline' className='flex-1 md:flex-none' onClick={onEditDesign}>
                <RulerIcon className='size-5' /> {tCommon('button.edit_design')}
              </Button>
            </div>
          </div>

          {/* <div className='flex items-center gap-2 text-sm text-neutral-500'>
            <ClockIcon className='size-4 text-neutral-400' weight='duotone' />
            <p>{tCommon('title.file_retention_period')}:</p>
            <p className='font-bold text-neutral-950'>2026.06.25</p>
            <p>(30일 남음)</p>
          </div> */}

          <div className='flex flex-col justify-between gap-3 md:flex-row md:items-center'>
            <div className='flex gap-1'>
              <Button variant='outline' className='size-13' disabled={isDeletingCartItem} onClick={handleDecreaseQuantity}>
                <MinusIcon className='size-6 text-neutral-950' weight='bold' />
              </Button>
              <AppInput className='text-md h-13 w-16 text-center' value={quantity} readOnly containerClassName='w-fit' />
              <Button variant='outline' className='size-13' disabled={isDeletingCartItem} onClick={handleIncreaseQuantity}>
                <PlusIcon className='size-6 text-neutral-950' weight='bold' />
              </Button>
            </div>
            <div className='flex items-center gap-1 md:flex-col-reverse md:items-start'>
              <p className='text-lg font-bold'>{price ? formatPrice(price * quantity) : formatPrice(230000)}</p>
              {!price && <p className='text-sm text-neutral-500 line-through'>{formatPrice(350000)}</p>}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CartItem;
