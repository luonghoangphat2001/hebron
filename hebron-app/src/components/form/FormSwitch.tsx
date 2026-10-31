import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { Controller, type Control, type FieldValues, type Path } from 'react-hook-form';
import { useId } from 'react';

type FormSwitchProps<T extends FieldValues> = {
  name: Path<T>;
  control: Control<T>;
  label: string;
  containerClassName?: string;
  labelClassName?: string;
};

const FormSwitch = <T extends FieldValues>({ name, control, label, containerClassName, labelClassName }: FormSwitchProps<T>) => {
  const switchId = useId();

  return (
    <div className={cn('w-full space-y-1.5', 'md:flex md:items-center md:gap-4', containerClassName)}>
      <label htmlFor={switchId} className={cn('flex cursor-pointer items-center gap-0.5 md:w-24', labelClassName)}>
        <span className='text-sm font-medium text-neutral-500'>{label}</span>
      </label>

      <div className='flex flex-1 items-center'>
        <Controller
          name={name}
          control={control}
          render={({ field }) => (
            <Switch id={switchId} checked={!!field.value} onCheckedChange={field.onChange} aria-label={label} />
          )}
        />
      </div>
    </div>
  );
};

export default FormSwitch;
