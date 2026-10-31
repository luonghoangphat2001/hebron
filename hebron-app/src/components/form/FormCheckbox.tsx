import { Controller, type Control, type FieldValues, type Path } from 'react-hook-form';

import { AppCheckbox, type AppCheckboxProps } from '../checkbox/AppCheckbox';

type FormCheckboxProps<T extends FieldValues> = Omit<AppCheckboxProps, 'name' | 'checked' | 'onCheckedChange'> & {
  name: Path<T>;
  control: Control<T>;
};

const FormCheckbox = <T extends FieldValues>({ name, control, ...props }: FormCheckboxProps<T>) => {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <AppCheckbox
          {...props}
          name={field.name}
          checked={!!field.value}
          onCheckedChange={(checked) => {
            field.onChange(checked === true);
          }}
        />
      )}
    />
  );
};

export default FormCheckbox;
