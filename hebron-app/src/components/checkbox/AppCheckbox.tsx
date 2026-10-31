import * as React from 'react';

import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';

type AppCheckboxVariant = 'default' | 'red';
type AppCheckboxSize = 'md' | 'lg';

export type AppCheckboxProps = React.ComponentProps<typeof Checkbox> & {
  label?: React.ReactNode;
  description?: React.ReactNode;
  variant?: AppCheckboxVariant;
  size?: AppCheckboxSize;
  labelClassName?: string;
};

const checkboxSizeVariants = {
  md: {
    checkbox: 'size-4 rounded-[4px]',
    icon: '[&_svg]:size-3',
    label: 'text-md',
    description: 'text-sm',
  },

  lg: {
    checkbox: 'size-5 rounded-[5px]',
    icon: '[&_svg]:size-3.5',
    label: 'text-lg',
    description: 'text-md',
  },
};

export function AppCheckbox({
  id,
  label,
  description,
  variant = 'default',
  size = 'md',
  disabled,
  className,
  labelClassName,
  ...props
}: AppCheckboxProps) {
  const reactId = React.useId();
  const inputId = id ?? reactId;

  const sizeStyle = checkboxSizeVariants[size];

  return (
    <div className='flex items-center gap-2'>
      <Checkbox
        id={inputId}
        disabled={disabled}
        className={cn(
          sizeStyle.checkbox,
          sizeStyle.icon,

          // danger
          variant === 'red' && [
            'border-red-500',

            'data-[state=checked]:border-red-500',
            'data-[state=checked]:bg-red-500',

            'data-[state=indeterminate]:border-red-500',
            'data-[state=indeterminate]:bg-red-500',
          ],

          disabled && 'opacity-50',

          className,
        )}
        {...props}
      />

      {(label || description) && (
        <label
          htmlFor={inputId}
          className={cn(
            'grid gap-1 leading-none select-none',
            disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer',
            sizeStyle.label,
            labelClassName,
          )}>
          {label && <span className={cn('text-neutral-950')}>{label}</span>}
        </label>
      )}
    </div>
  );
}
