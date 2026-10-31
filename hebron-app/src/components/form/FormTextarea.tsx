import { AppTextarea } from '@/components/textarea/AppTextarea';
import { cn } from '@/lib/utils';
import { Controller, type Control, type FieldValues, type Path } from 'react-hook-form';

type FormTextareaProps<T extends FieldValues> = Omit<React.ComponentProps<typeof AppTextarea>, 'value' | 'onChange'> & {
  name: Path<T>;
  control: Control<T>;
  hideError?: boolean;
};

const FormTextarea = <T extends FieldValues>({ name, control, hideError, className, ...props }: FormTextareaProps<T>) => {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { value, onChange, ...field }, fieldState: { error } }) => (
        <AppTextarea
          {...field}
          {...props}
          className={cn('min-h-40 resize-none', className)}
          value={value ?? ''}
          onChange={onChange}
          errorMessage={hideError ? undefined : error?.message}
        />
      )}
    />
  );
};

export default FormTextarea;
