import AppDatePicker, { type AppDatePickerProps } from '@/components/date-picker/AppDatePicker';
import { Controller, type Control, type FieldValues, type Path } from 'react-hook-form';

type FormDatePickerProps<T extends FieldValues> = Omit<AppDatePickerProps, 'value' | 'onChange'> & {
  name: Path<T>;
  control: Control<T>;
  hideError?: boolean;
};

const FormDatePicker = <T extends FieldValues>({ name, control, hideError, ...props }: FormDatePickerProps<T>) => {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { value, onChange, ...field }, fieldState: { error } }) => (
        <AppDatePicker
          {...field}
          {...props}
          value={value ?? ''}
          onChange={onChange}
          errorMessage={hideError ? undefined : error?.message}
        />
      )}
    />
  );
};

export default FormDatePicker;
