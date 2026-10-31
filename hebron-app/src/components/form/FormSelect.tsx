import { Controller, type Control, type FieldValues, type Path } from 'react-hook-form';
import type { AppSelectProps } from '../select/AppSelect';
import AppSelect from '../select/AppSelect';

export type FormSelectProps<T extends FieldValues> = Omit<AppSelectProps, 'name' | 'value' | 'onChange'> & {
  name: Path<T>;
  control: Control<T>;
  hideError?: boolean;
  onChange?: (value: string) => void;
};

const FormSelect = <T extends FieldValues>({
  name,
  control,
  onChange: customOnChange,
  hideError,
  ...props
}: FormSelectProps<T>) => {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { onChange, value, ...field }, fieldState: { error } }) => (
        <AppSelect
          {...field}
          {...props}
          isError={props.isError ?? Boolean(error)}
          errorMessage={hideError ? undefined : error?.message}
          value={value ?? ''}
          onChange={(val) => {
            const nextValue = val ?? '';
            onChange(nextValue, { shouldDirty: true, shouldValidate: true });
            customOnChange?.(nextValue);
          }}
        />
      )}
    />
  );
};

export default FormSelect;
