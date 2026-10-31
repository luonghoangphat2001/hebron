import { cn } from '@/lib/utils';
import MyPageProductPickerDialog, {
  type MyPageProductPickerLabels,
} from '@/pages/ecommerce/my-page/components/MyPageProductPickerDialog';
import type { QuoteProductOption } from '@/utils/constants/quote-product.constant';
import { CaretDownIcon, WarningCircleIcon } from '@phosphor-icons/react';
import { useState } from 'react';
import { Controller, type Control, type FieldPath, type UseFormSetValue, useWatch } from 'react-hook-form';

type ProductPickerFormValues = {
  productId: string;
  productName: string;
  productSpecs: string;
};

type MyPageProductPickerFieldProps<T extends ProductPickerFormValues> = {
  control: Control<T>;
  setValue: UseFormSetValue<T>;
  label: string;
  placeholder: string;
  required?: boolean;
  showCategory?: boolean;
  pickerLabels: MyPageProductPickerLabels;
  disabled?: boolean;
};

const MyPageProductPickerField = <T extends ProductPickerFormValues>({
  control,
  setValue,
  label,
  placeholder,
  required = false,
  showCategory = true,
  pickerLabels,
  disabled = false,
}: MyPageProductPickerFieldProps<T>) => {
  const [productPickerOpen, setProductPickerOpen] = useState(false);
  const [pickerSession, setPickerSession] = useState(0);

  const productIdName = 'productId' as FieldPath<T>;
  const productNameName = 'productName' as FieldPath<T>;
  const productSpecsName = 'productSpecs' as FieldPath<T>;

  const [productName, productSpecs] = useWatch({
    control,
    name: [productNameName, productSpecsName],
  });

  const openProductPicker = () => {
    if (disabled) return;
    setPickerSession((prev) => prev + 1);
    setProductPickerOpen(true);
  };

  const handleProductConfirm = (product: QuoteProductOption, onProductIdChange: (value: string) => void) => {
    onProductIdChange(product.id);
    setValue(productNameName, product.name as never, { shouldDirty: true, shouldTouch: true });
    setValue(productSpecsName, product.specs as never, { shouldDirty: true, shouldTouch: true });
    setProductPickerOpen(false);
  };

  return (
    <Controller
      name={productIdName}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <>
          <div className='w-full space-y-1.5 md:flex md:items-start md:gap-4'>
            <div className='flex items-center gap-0.5 md:w-24'>
              <span className='text-sm font-medium text-neutral-500'>{label}</span>
              {required ? <span className='bg-danger size-1 min-w-1 rounded-full' aria-hidden /> : null}
            </div>

            <div className='min-w-0 flex-1 space-y-1.5'>
              <button
                type='button'
                onClick={openProductPicker}
                disabled={disabled}
                className={cn(
                  'flex min-h-10 w-full items-center justify-between gap-3 rounded-md border border-neutral-200 bg-white px-3 py-2 text-left text-sm',
                  disabled ? 'cursor-default' : 'cursor-pointer',
                  field.value ? 'text-neutral-950' : 'text-neutral-400',
                  error && 'border-danger',
                )}>
                <span className='min-w-0 flex-1'>
                  {field.value ? (
                    <span className='flex min-w-0 flex-col gap-0.5'>
                      <span className='truncate font-medium'>{productName}</span>
                      <span className='line-clamp-2 text-xs text-neutral-500'>{productSpecs}</span>
                    </span>
                  ) : (
                    placeholder
                  )}
                </span>
                {!disabled ? <CaretDownIcon className='size-4 shrink-0 text-neutral-500' aria-hidden /> : null}
              </button>
              {error?.message ? (
                <p className='text-danger flex items-start gap-1 text-xs'>
                  <WarningCircleIcon className='text-danger size-4 shrink-0' weight='fill' aria-hidden />
                  {error.message}
                </p>
              ) : null}
            </div>
          </div>

          {!disabled ? (
            <MyPageProductPickerDialog
              open={productPickerOpen}
              onOpenChange={setProductPickerOpen}
              sessionKey={pickerSession}
              selectedProductId={field.value}
              showCategory={showCategory}
              labels={pickerLabels}
              onConfirm={(product) => handleProductConfirm(product, field.onChange)}
            />
          ) : null}
        </>
      )}
    />
  );
};

export default MyPageProductPickerField;
