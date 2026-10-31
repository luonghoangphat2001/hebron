import { cn } from '@/lib/utils';
import { WarningCircleIcon } from '@phosphor-icons/react';
import { Controller, type Control, type FieldValues, type Path } from 'react-hook-form';
import AppRadio from '../radio/AppRadio';
import { RadioGroup } from '../ui/radio-group';

type RadioOption = {
  value: string;
  label: React.ReactNode;
};

type FormRadioGroupProps<T extends FieldValues> = {
  name: Path<T>;
  control: Control<T>;
  options: RadioOption[];
  className?: string;
  itemClassName?: string;
  labelClassName?: string;
  size?: 'default' | 'md';
  label?: string;
  required?: boolean;
  containerClassName?: string;
  fieldLabelClassName?: string;
  labelPlacement?: 'responsive' | 'top' | 'left';
};

const FormRadioGroup = <T extends FieldValues>({
  name,
  control,
  options,
  className,
  labelClassName,
  size,
  label,
  required,
  containerClassName,
  fieldLabelClassName,
  labelPlacement = 'top',
}: FormRadioGroupProps<T>) => {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <div
          className={cn(
            'w-full space-y-1.5',
            labelPlacement === 'responsive' && 'md:flex md:items-start md:gap-4',
            labelPlacement === 'left' && 'flex items-start gap-4',
            containerClassName,
          )}>
          {label && (
            <div
              className={cn(
                'flex items-center gap-0.5',
                labelPlacement === 'responsive' && 'md:w-24',
                labelPlacement === 'left' && 'w-24',
                fieldLabelClassName,
              )}>
              <label className='text-sm font-medium whitespace-pre-line text-neutral-500'>{label}</label>
              {required && <p className='bg-danger size-1 min-w-1 rounded-full'></p>}
            </div>
          )}

          <div className='flex-1 space-y-1.5'>
            <RadioGroup
              value={field.value}
              onValueChange={field.onChange}
              className={cn('flex flex-wrap gap-x-6 gap-y-4', className)}>
              {options.map((option) => (
                <AppRadio
                  key={option.value}
                  value={option.value}
                  label={option.label}
                  labelClassName={labelClassName}
                  size={size}
                />
              ))}
            </RadioGroup>
            {error?.message && (
              <p className='text-danger flex items-start gap-1 text-xs'>
                <WarningCircleIcon className='text-danger size-4' weight='fill' />
                {error.message}
              </p>
            )}
          </div>
        </div>
      )}
    />
  );
};

export default FormRadioGroup;
