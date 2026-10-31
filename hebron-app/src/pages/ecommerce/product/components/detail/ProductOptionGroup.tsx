import { AppInput } from '@/components/input/AppInput';
import { Button } from '@/components/ui/button';
import { formatPrice } from '@/utils/helper/common.helper';
import { MinusIcon, PlusIcon, XIcon } from '@phosphor-icons/react';

export type ProductOptionGroupSelection = {
  groupName: string;
  optionName: string;
  additionalPrice: number;
};

type ProductOptionGroupProps = {
  productName: string;
  selectedOptions: ProductOptionGroupSelection[];
  quantity: number;
  totalPrice: number;
  minQuantity: number;
  maxQuantity: number;
  onQuantityChange: (quantity: number) => void;
  onClear: () => void;
};

const ProductOptionGroup = ({
  productName,
  selectedOptions,
  quantity,
  totalPrice,
  minQuantity,
  maxQuantity,
  onQuantityChange,
  onClear,
}: ProductOptionGroupProps) => {
  const canDecrease = quantity > minQuantity;
  const canIncrease = quantity < maxQuantity;

  return (
    <section className='' aria-label='Selected product options'>
      <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
        <div className='min-w-0 flex-1'>
          <p className='font-medium text-neutral-950'>{productName}</p>
          {selectedOptions.length > 0 && (
            <div className='mt-1 space-y-0.5 text-sm text-neutral-500'>
              {selectedOptions.map((option) => (
                <p key={option.groupName}>
                  - {option.groupName}: {option.optionName}{' '}
                  <span className='font-medium text-neutral-700'>
                    ({option.additionalPrice > 0 ? '+' : ''}
                    {formatPrice(option.additionalPrice)})
                  </span>
                </p>
              ))}
            </div>
          )}
        </div>
        <div className='flex items-center justify-between gap-4 sm:justify-end'>
          <div className='flex items-center gap-1'>
            <Button
              type='button'
              variant='ghost'
              size='icon-xs'
              aria-label='Decrease quantity'
              disabled={!canDecrease}
              onClick={() => onQuantityChange(quantity - 1)}>
              <MinusIcon className='size-4' />
            </Button>
            <AppInput
              aria-label='Quantity'
              className='h-9 w-11 rounded-none text-center'
              containerClassName='w-fit'
              readOnly
              value={quantity}
            />
            <Button
              type='button'
              variant='ghost'
              size='icon-xs'
              aria-label='Increase quantity'
              disabled={!canIncrease}
              onClick={() => onQuantityChange(quantity + 1)}>
              <PlusIcon className='size-4' />
            </Button>
            <Button type='button' variant='ghost' size='icon-xs' aria-label='Clear selected options' onClick={onClear}>
              <XIcon className='size-4 text-neutral-400' />
            </Button>
          </div>
          <p className='text-md text-blue-brand min-w-25 text-right font-bold'>{formatPrice(totalPrice)}</p>
        </div>
      </div>
    </section>
  );
};

export default ProductOptionGroup;
