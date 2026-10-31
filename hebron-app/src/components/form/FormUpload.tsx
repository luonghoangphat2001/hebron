import { Controller, type Control, type FieldValues, type Path } from 'react-hook-form';
import type { UploadProps } from '../upload/Upload';
import Upload from '../upload/Upload';

export type FormUploadProps<T extends FieldValues> = Omit<UploadProps, 'name' | 'files' | 'onChange' | 'error'> & {
  name: Path<T>;
  control: Control<T>;
};

const FormUpload = <T extends FieldValues>({ name, control, ...props }: FormUploadProps<T>) => {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { value, onChange, ...field }, fieldState: { error } }) => (
        <Upload {...field} {...props} files={value ?? []} onChange={(files) => onChange(files)} errorMessage={error?.message} />
      )}
    />
  );
};

export default FormUpload;
