import { InfoIcon, WarningCircleIcon } from '@phosphor-icons/react';
import * as React from 'react';

import { cn } from '@/lib/utils';
import { Textarea } from '../ui/textarea';

type AppTextAreaProps = React.ComponentProps<'textarea'> & {
  label?: string;
  required?: boolean;
  infoMessage?: string;
  errorMessage?: string;
  containerClassName?: string;
  labelPlacement?: 'responsive' | 'top' | 'left';
  labelClassName?: string;
};

export const AppTextarea = ({
  className,
  containerClassName,
  label,
  required,
  infoMessage,
  errorMessage,
  disabled,
  labelPlacement = 'responsive',
  labelClassName,
  value,
  maxLength,
  ...props
}: AppTextAreaProps) => {
  const isError = Boolean(errorMessage);
  const currentLength = String(value ?? '').length;

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
          <label className='text-sm font-medium text-neutral-500'>{label}</label>
          {required && <p className='bg-danger size-1 min-w-1 rounded-full'></p>}
        </div>
      )}

      <div className='min-w-0 flex-1 space-y-1.5'>
        <div className='relative'>
          <Textarea
            disabled={disabled}
            value={value}
            maxLength={maxLength}
            className={cn(
              'min-h-10 rounded-[6px] border border-neutral-200 bg-white px-3 text-sm text-neutral-950',
              'placeholder:text-neutral-400',
              'focus-visible:border-brand-strong focus-visible:border-2 focus-visible:ring-0 focus-visible:ring-offset-0',
              maxLength && 'pb-8',
              isError && 'border-danger focus-visible:border-danger focus-visible:border-2',
              disabled && 'bg-neutral-50',
              props.readOnly && 'focus-visible:border-neutral-200',
              className,
            )}
            {...props}
          />
          {maxLength ? (
            <span className='absolute right-3 bottom-3 text-xs text-neutral-400'>
              {currentLength}/{maxLength}자
            </span>
          ) : null}
        </div>

        {infoMessage && !errorMessage && (
          <p className={cn('flex items-center gap-1 text-xs text-neutral-400')}>
            <InfoIcon className='size-4 text-neutral-400' weight='fill' />
            {infoMessage}
          </p>
        )}
        {errorMessage && (
          <p className={cn('text-danger flex items-center gap-1 text-xs')}>
            <WarningCircleIcon className='text-danger size-4' weight='fill' />
            {errorMessage}
          </p>
        )}
      </div>
    </div>
  );
};
