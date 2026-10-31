import { formatPhone } from '@/utils/helper/common.helper';
import { Controller, type Control, type FieldValues, type Path } from 'react-hook-form';
import { AppInput, type AppInputProps } from '../input/AppInput';

type FormInputProps<T extends FieldValues> = Omit<AppInputProps, 'name' | 'value' | 'onChange'> & {
  name: Path<T>;
  control: Control<T>;
  hideError?: boolean;
  numericOnly?: boolean;
  mode?: 'phone';
};

const FormInput = <T extends FieldValues>({ name, control, hideError, numericOnly, mode, ...props }: FormInputProps<T>) => {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { onChange, value, ...field }, fieldState: { error } }) => (
        <AppInput
          {...field}
          {...props}
          isError={props.isError ?? Boolean(error)}
          errorMessage={hideError ? undefined : error?.message}
          inputMode={mode === 'phone' ? 'numeric' : props.inputMode}
          maxLength={mode === 'phone' ? 13 : props.maxLength}
          value={mode === 'phone' ? formatPhone(String(value ?? '')) : (value ?? '')}
          onChange={(e) => {
            const val = e.target.value;
            const nextValue = mode === 'phone' ? val.replace(/\D/g, '').slice(0, 11) : numericOnly ? val.replace(/\D/g, '') : val;
            onChange(nextValue, { shouldDirty: true, shouldValidate: true });
          }}
        />
      )}
    />
  );
};

export default FormInput;
