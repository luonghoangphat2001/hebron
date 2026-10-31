import { cn } from '@/lib/utils';
import { WarningCircleIcon } from '@phosphor-icons/react';
import {
  useFormState,
  useWatch,
  type Control,
  type FieldValues,
  type Path,
  type PathValue,
  type UseFormSetValue,
} from 'react-hook-form';
import type { SelectOption } from '../select/AppSelect';
import FormInput from './FormInput';
import FormSelect from './FormSelect';

type FormEmailProps<T extends FieldValues> = {
  control: Control<T>;
  setValue: UseFormSetValue<T>;
  nameId: Path<T>;
  nameDomain: Path<T>;
  nameDomainSelect: Path<T>;
  label: string;
  required?: boolean;
  emailOptions: SelectOption[];
  containerClassName?: string;
  labelClassName?: string;
};

const FormEmail = <T extends FieldValues>({
  control,
  setValue,
  nameId,
  nameDomain,
  nameDomainSelect,
  label,
  required,
  emailOptions,
  containerClassName,
  labelClassName,
}: FormEmailProps<T>) => {
  const { errors } = useFormState({ control });

  const domainSelect = useWatch({ control, name: nameDomainSelect });
  const isDirectInput = domainSelect === 'direct';

  const error = (errors[nameId]?.message || errors[nameDomain]?.message) as string | undefined;

  return (
    <div className={cn('w-full space-y-1.5 md:flex md:items-start md:gap-4', containerClassName)}>
      {label && (
        <div className={cn('flex items-center gap-0.5 md:w-24', labelClassName)}>
          <label className='text-sm font-medium text-neutral-500'>{label}</label>
          {required && <p className='bg-danger size-1 rounded-full'></p>}
        </div>
      )}
      <div className='flex-1 space-y-1.5'>
        <div className='flex w-full items-center gap-2'>
          <FormInput control={control} name={nameId} placeholder='이메일' containerClassName='flex-1' hideError />
          <span className='text-md text-neutral-500'>@</span>
          <FormInput
            control={control}
            name={nameDomain}
            containerClassName='flex-1'
            // placeholder={placeholderDomain}
            // showClear={isDirectInput}
            readOnly={!isDirectInput}
            hideError
          />
          <div className='flex-1'>
            <FormSelect
              control={control}
              name={nameDomainSelect}
              options={emailOptions}
              placeholder='직접입력'
              hideError
              onChange={(val) => {
                if (val !== 'direct') {
                  setValue(nameDomain, val as PathValue<T, Path<T>>);
                } else {
                  setValue(nameDomain, '' as PathValue<T, Path<T>>);
                }
              }}
            />
          </div>
        </div>
        {error && (
          <p className={cn('text-danger flex items-center gap-1 text-xs')}>
            <WarningCircleIcon className='text-danger size-4' weight='fill' />
            {error}
          </p>
        )}
      </div>
    </div>
  );
};

export default FormEmail;
