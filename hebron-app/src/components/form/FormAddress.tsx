import { cn } from '@/lib/utils';
import { WarningCircleIcon } from '@phosphor-icons/react';
import { useState } from 'react';
import DaumPostcodeEmbed, { type Address } from 'react-daum-postcode';
import { useFormContext, useFormState, type Control, type FieldValues, type Path, type PathValue } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import AppDialog from '../dialog/AppDialog';
import { Button } from '../ui/button';
import FormInput from './FormInput';

type FormAddressProps<T extends FieldValues> = {
  control: Control<T>;
  nameZipCode: Path<T>;
  nameAddress: Path<T>;
  nameDetailAddress: Path<T>;
  label: string;
  required?: boolean;
  labelPlacement?: 'responsive' | 'top' | 'left';
  labelClassName?: string;
};

const FormAddress = <T extends FieldValues>({
  control,
  nameZipCode,
  nameAddress,
  nameDetailAddress,
  label,
  required,
  labelPlacement = 'responsive',
  labelClassName,
}: FormAddressProps<T>) => {
  const { t: tCommon } = useTranslation('common');
  const [open, setOpen] = useState(false);

  //form context
  const { setValue } = useFormContext<T>();
  const { errors } = useFormState({
    control,
  });

  const error = (errors[nameZipCode]?.message || errors[nameAddress]?.message) as string | undefined;

  const handleComplete = (data: Address) => {
    let fullAddress = data.address;
    let extraAddress = '';

    if (data.addressType === 'R') {
      if (data.bname !== '') {
        extraAddress += data.bname;
      }
      if (data.buildingName !== '') {
        extraAddress += extraAddress !== '' ? `, ${data.buildingName}` : data.buildingName;
      }
      fullAddress += extraAddress !== '' ? ` (${extraAddress})` : '';
    }

    setValue(nameZipCode, data.zonecode as PathValue<T, Path<T>>, { shouldValidate: true });
    setValue(nameAddress, fullAddress as PathValue<T, Path<T>>, { shouldValidate: true });
    setOpen(false);
  };

  return (
    <div>
      <div
        className={cn(
          'w-full space-y-1.5',
          labelPlacement === 'responsive' && 'md:flex md:items-start md:gap-4',
          labelPlacement === 'left' && 'flex items-start gap-4',
        )}>
        {label && (
          <div
            className={cn(
              'flex items-center gap-0.5',
              labelPlacement === 'responsive' && 'md:w-24',
              labelPlacement === 'left' && 'w-24',
              labelClassName,
            )}>
            <label className='text-sm font-medium text-neutral-500'>{label}</label>
            {required && <p className='bg-danger size-1 rounded-full'></p>}
          </div>
        )}

        <div className='flex-1 space-y-1.5'>
          <div className='space-y-4'>
            <div className='flex gap-2'>
              <FormInput
                control={control}
                name={nameZipCode}
                placeholder={tCommon('title.search_postal_code')}
                readOnly
                hideError
              />
              <Button variant='outline' className='w-27' onClick={() => setOpen(true)}>
                {tCommon('title.find_address')}
              </Button>
            </div>
            <FormInput control={control} name={nameAddress} placeholder={tCommon('title.address')} readOnly hideError />
            <FormInput control={control} name={nameDetailAddress} placeholder={tCommon('title.address_detail')} hideError />
          </div>
          {error && (
            <p className={cn('text-danger flex items-center gap-1 text-xs')}>
              <WarningCircleIcon className='text-danger size-4' weight='fill' />
              {error}
            </p>
          )}
        </div>
      </div>

      <AppDialog open={open} onOpenChange={setOpen} title={tCommon('title.find_address')} showFooter={false}>
        <DaumPostcodeEmbed onComplete={handleComplete} className='h-300' />
      </AppDialog>
    </div>
  );
};

export default FormAddress;
