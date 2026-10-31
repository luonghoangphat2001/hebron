import { InfoIcon, WarningCircleIcon } from '@phosphor-icons/react';
import * as React from 'react';

import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export type AppInputProps = React.ComponentProps<typeof Input> & {
  label?: string;
  required?: boolean;
  infoMessage?: string;
  errorMessage?: string;
  isError?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerClassName?: string;
  labelPlacement?: 'responsive' | 'top' | 'left';
  labelClassName?: string;
};

export const AppInput = ({
  className,
  containerClassName,
  label,
  required,
  infoMessage,
  errorMessage,
  isError: isErrorProp,
  disabled,
  leftIcon,
  rightIcon,
  labelPlacement = 'responsive',
  labelClassName,
  ...props
}: AppInputProps) => {
  const isError = isErrorProp ?? Boolean(errorMessage);

  return (
    <div
      className={cn(
        'w-full space-y-1.5',
        labelPlacement === 'responsive' && 'md:flex md:items-start md:gap-4',
        labelPlacement === 'left' && 'flex items-start gap-4',
        containerClassName,
      )}>
      {label && (
        <div
          className={cn(
            'flex items-center gap-0.5',
            labelPlacement === 'responsive' && 'md:w-24',
            labelPlacement === 'left' && 'w-24',
            labelClassName,
          )}>
          <label className='text-sm font-medium whitespace-pre-line text-neutral-500'>{label}</label>
          {required && <p className='bg-danger size-1 min-w-1 rounded-full'></p>}
        </div>
      )}

      <div className='flex-1 space-y-1.5'>
        <div className='relative'>
          {leftIcon && <span className={cn('absolute top-1/2 left-3 -translate-y-1/2 [&_svg]:size-5')}>{leftIcon}</span>}

          <Input
            disabled={disabled}
            className={cn(
              'h-10 rounded-[6px] border border-neutral-200 bg-white px-3 text-sm text-neutral-950',
              'placeholder:text-neutral-400',
              'focus-visible:border-brand-strong focus-visible:border-2 focus-visible:ring-0 focus-visible:ring-offset-0',
              leftIcon && 'pl-10',
              rightIcon && 'pr-10',
              isError && 'border-danger focus-visible:border-danger focus-visible:border-2',
              disabled && 'bg-neutral-50',
              props.readOnly && 'focus-visible:border-neutral-200',
              className,
            )}
            {...props}
          />

          {rightIcon && <span className={cn('absolute top-1/2 right-3 -translate-y-1/2 [&_svg]:size-4')}>{rightIcon}</span>}
        </div>
        {infoMessage && !errorMessage && (
          <p className={cn('flex items-start gap-1 text-xs whitespace-pre-line text-neutral-400 md:whitespace-normal')}>
            <InfoIcon className='size-4 text-neutral-400' weight='fill' />
            {infoMessage}
          </p>
        )}
        {errorMessage && (
          <p className={cn('text-danger flex items-start gap-1 text-xs')}>
            <WarningCircleIcon className='text-danger size-4' weight='fill' />
            {errorMessage}
          </p>
        )}
      </div>
    </div>
  );
};
