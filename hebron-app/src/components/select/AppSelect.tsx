import { cn } from '@/lib/utils';
import { CaretDownIcon, CheckIcon, InfoIcon, WarningCircleIcon, XIcon } from '@phosphor-icons/react';
import { useEffect, useRef, useState } from 'react';
import { Button } from '../ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '../ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';

type SelectValue = string | number;

export type SelectOption<T extends SelectValue = string> = {
  label: string;
  value: T;
};

export type AppSelectProps<T extends SelectValue = string> = {
  value?: T;
  options: SelectOption<T>[];
  placeholder?: string;
  onChange?: (value?: T) => void;
  disabled?: boolean;
  className?: string;
  showSearch?: boolean;
  label?: string;
  required?: boolean;
  containerClassName?: string;
  infoMessage?: string;
  errorMessage?: string;
  isError?: boolean;
  labelPlacement?: 'responsive' | 'top' | 'left';
  labelClassName?: string;
  showClear?: boolean;
  variant?: 'default' | 'dark';
  wrapOptionLabel?: boolean;
};

export default function AppSelect<T extends SelectValue = string>({
  value,
  options,
  placeholder = '',
  onChange,
  disabled,
  className,
  showSearch,
  label,
  required,
  containerClassName,
  infoMessage,
  errorMessage,
  isError: isErrorProp,
  labelPlacement = 'responsive',
  labelClassName,
  showClear,
  variant = 'default',
  wrapOptionLabel,
}: AppSelectProps<T>) {
  const [open, setOpen] = useState(false);
  const selectedItemRef = useRef<HTMLDivElement | null>(null);
  const isDark = variant === 'dark';
  const isError = isErrorProp ?? Boolean(errorMessage);

  const selected = options.find((item) => item.value === value);

  useEffect(() => {
    if (!open) return;

    window.requestAnimationFrame(() => {
      selectedItemRef.current?.scrollIntoView({
        block: 'nearest',
      });
    });
  }, [open, value]);

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

      <div className='min-w-0 flex-1 space-y-1.5'>
        <Popover open={open} onOpenChange={setOpen} modal>
          <PopoverTrigger asChild>
            <Button
              variant='outline'
              role='combobox'
              disabled={disabled}
              className={cn(
                'justify-between rounded-[6px]',
                'w-full',
                !value && !isDark && 'text-muted-foreground',
                isError && 'border-danger',
                isDark && 'border-neutral-700 bg-neutral-900 font-normal text-white hover:bg-neutral-800 hover:text-white',
                className,
              )}>
              <span
                className={cn(
                  'truncate text-sm font-normal',
                  isDark
                    ? selected?.label
                      ? 'text-white'
                      : 'text-neutral-500'
                    : selected?.label
                      ? 'text-neutral-950'
                      : 'text-neutral-500',
                )}>
                {selected?.label || placeholder}
              </span>

              <div className='flex items-center gap-1'>
                {showClear && value && (
                  <div
                    role='button'
                    tabIndex={0}
                    onClick={(e) => {
                      e.stopPropagation();
                      onChange?.('' as T);
                    }}
                    className={cn('rounded-sm p-1', isDark ? 'hover:bg-neutral-800' : 'hover:bg-accent')}>
                    <XIcon className={cn('size-4', isDark ? 'text-neutral-400' : undefined)} />
                  </div>
                )}

                <CaretDownIcon className={cn('size-4', isDark ? 'text-neutral-400' : 'text-neutral-500')} />
              </div>
            </Button>
          </PopoverTrigger>

          <PopoverContent
            className='w-(--radix-popover-trigger-width) rounded-[6px] p-0'
            align='start'
            onCloseAutoFocus={(e) => {
              e.preventDefault();
            }}>
            <Command>
              {showSearch && <CommandInput placeholder='Search...' />}

              <CommandList>
                <CommandEmpty>No result.</CommandEmpty>

                <CommandGroup>
                  {options.map((option) => (
                    <CommandItem
                      key={option.value}
                      ref={value === option.value ? selectedItemRef : undefined}
                      value={option.label}
                      className={cn(
                        'data-[selected=true]:bg-transparent data-[selected=true]:text-inherit',
                        value === option.value && 'bg-slate-100 data-[selected=true]:bg-slate-100',
                      )}
                      onSelect={() => {
                        onChange?.(option.value);
                        setOpen(false);
                      }}>
                      <div className='flex w-full items-center'>
                        <span className={wrapOptionLabel ? 'wrap-break-words min-w-0 flex-1' : 'truncate'}>{option.label}</span>

                        <CheckIcon
                          className={cn('ml-auto size-4 shrink-0', value === option.value ? 'opacity-100' : 'opacity-0')}
                        />
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        {infoMessage && !errorMessage && (
          <p className={cn('flex items-start gap-1 text-xs whitespace-pre-line text-neutral-400 md:whitespace-normal')}>
            <InfoIcon className='size-4 shrink-0 text-neutral-400' weight='fill' />
            {infoMessage}
          </p>
        )}
        {errorMessage && (
          <p className={cn('text-danger flex items-start gap-1 text-xs')}>
            <WarningCircleIcon className='text-danger size-4 shrink-0' weight='fill' />
            {errorMessage}
          </p>
        )}
      </div>
    </div>
  );
}
