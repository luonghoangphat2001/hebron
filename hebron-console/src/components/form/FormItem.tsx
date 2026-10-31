import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Field, FieldError, FieldLabel } from '../ui/field';

type FormItemProps = {
  children: ReactNode;
  label?: string;
  icon?: ReactNode;
  error?: string;
  required?: boolean;
};

const FormItem = ({ children, label, icon, error, required }: FormItemProps) => {
  const { t: tError } = useTranslation('error');

  return (
    <Field data-invalid={!!error} className='gap-1'>
      <FieldLabel htmlFor={label}>
        {label || ''}
        {icon}
        {required && <span className='text-red-500'>*</span>}
      </FieldLabel>
      <div className='h-full'>{children}</div>
      {error && <FieldError errors={[{ message: tError(error as any) }]} />}
    </Field>
  );
};

export default FormItem;
