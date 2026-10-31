import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Field, FieldError, FieldLabel } from '../ui/field';

type FormItemCustomProps = {
  children: ReactNode;
  label?: string;
  error?: string;
  required?: boolean;
};

const FormItemCustom = ({ children, label, error, required }: FormItemCustomProps) => {
  const { t: tError } = useTranslation('error');

  return (
    <Field data-invalid={!!error} className='gap-1.5'>
      <FieldLabel htmlFor={label}>
        {label || ''}
        {required && <span className='text-red-500'>*</span>}
      </FieldLabel>
      <div>{children}</div>
      {error && <FieldError errors={[{ message: tError(error as any) }]} />}
    </Field>
  );
};

export default FormItemCustom;
