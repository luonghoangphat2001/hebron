import AppFileDropzone, { type AppFileDropzoneProps } from '@/components/upload/AppFileDropzone';
import { Controller, type Control, type FieldValues, type Path } from 'react-hook-form';

type FormFileDropzoneProps<T extends FieldValues> = Omit<AppFileDropzoneProps, 'files' | 'onChange'> & {
  name: Path<T>;
  control: Control<T>;
};

const FormFileDropzone = <T extends FieldValues>({ name, control, ...props }: FormFileDropzoneProps<T>) => {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { value, onChange }, fieldState: { error } }) => (
        <AppFileDropzone {...props} files={value ?? []} onChange={onChange} errorMessage={error?.message} />
      )}
    />
  );
};

export default FormFileDropzone;
