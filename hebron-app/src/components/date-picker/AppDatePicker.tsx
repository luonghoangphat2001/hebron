import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { CalendarDotsIcon, InfoIcon, WarningCircleIcon, XIcon } from '@phosphor-icons/react';
import { ko } from 'date-fns/locale';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import * as React from 'react';
import { Button } from '../ui/button';

import { DATE_FORMAT_DASH, DATE_FORMAT_DOT } from '@/utils/constants/date.constant';
import 'dayjs/locale/ko';

dayjs.extend(customParseFormat);
dayjs.locale('ko');

export type AppDatePickerProps = Omit<React.ComponentProps<typeof Button>, 'value' | 'onChange' | 'variant'> & {
  value?: string | Date | null;
  onChange?: (value: string) => void;
  label?: string;
  required?: boolean;
  placeholder?: string;
  infoMessage?: string;
  errorMessage?: string;
  containerClassName?: string;
  labelPlacement?: 'responsive' | 'top' | 'left';
  labelClassName?: string;
  displayFormat?: string;
  outputFormat?: string;
  inputFormats?: string[];
  readOnly?: boolean;
  clearable?: boolean;
  startYear?: number;
  endYear?: number;
  variant?: 'default' | 'dark';
};

const parseDateValue = (value: AppDatePickerProps['value'], inputFormats: string[]) => {
  if (!value) return undefined;

  if (value instanceof Date) {
    return dayjs(value).isValid() ? value : undefined;
  }

  const parsed = dayjs(value, inputFormats, true);
  return parsed.isValid() ? parsed.toDate() : undefined;
};

const AppDatePicker = ({
  className,
  containerClassName,
  label,
  required,
  placeholder = '일시 선택',
  infoMessage,
  errorMessage,
  disabled,
  labelPlacement = 'responsive',
  labelClassName,
  value,
  onChange,
  displayFormat = DATE_FORMAT_DOT,
  outputFormat = DATE_FORMAT_DOT,
  inputFormats = [DATE_FORMAT_DOT, DATE_FORMAT_DASH],
  readOnly,
  clearable = true,
  startYear,
  endYear,
  variant = 'default',
  ...props
}: AppDatePickerProps) => {
  const [open, setOpen] = React.useState(false);
  const isDark = variant === 'dark';
  const selectedDate = parseDateValue(value, inputFormats);
  const isError = Boolean(errorMessage);
  const displayValue = selectedDate ? dayjs(selectedDate).format(displayFormat) : '';
  const canClear = clearable && Boolean(displayValue) && !disabled && !readOnly;
  const currentYear = dayjs().year();
  const calendarStartYear = startYear ?? currentYear - 100;
  const calendarEndYear = endYear ?? currentYear + 20;

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
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              type='button'
              variant='outline'
              role='combobox'
              disabled={disabled || readOnly}
              aria-invalid={isError}
              className={cn(
                'h-10 w-full justify-between rounded-[6px] border px-3 text-sm font-normal',
                'focus-visible:border-brand-strong focus-visible:border-2 focus-visible:ring-0 focus-visible:ring-offset-0',
                isDark
                  ? 'border-neutral-700 bg-neutral-900 text-white hover:bg-neutral-800 hover:text-white'
                  : 'border-neutral-200 bg-white text-neutral-950 hover:bg-white',
                isError && 'border-danger focus-visible:border-danger focus-visible:border-2',
                disabled && (isDark ? 'opacity-70' : 'bg-neutral-50'),
                readOnly && !isDark && 'focus-visible:border-neutral-200',
                className,
              )}
              {...props}>
              <span
                className={cn(
                  'truncate',
                  isDark
                    ? displayValue
                      ? 'text-white'
                      : 'text-neutral-500'
                    : displayValue
                      ? 'text-neutral-950'
                      : 'text-neutral-400',
                )}>
                {displayValue || placeholder}
              </span>
              <span className='flex items-center gap-1'>
                {canClear && (
                  <span
                    role='button'
                    tabIndex={0}
                    aria-label='Clear date'
                    onPointerDown={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                    }}
                    onClick={(event) => {
                      event.stopPropagation();
                      onChange?.('');
                      setOpen(false);
                    }}
                    onKeyDown={(event) => {
                      if (event.key !== 'Enter' && event.key !== ' ') return;
                      event.preventDefault();
                      event.stopPropagation();
                      onChange?.('');
                      setOpen(false);
                    }}
                    className={cn(
                      'rounded-sm p-1',
                      isDark
                        ? 'text-neutral-400 hover:bg-neutral-800 hover:text-neutral-300'
                        : 'text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700',
                    )}>
                    <XIcon className='size-4' />
                  </span>
                )}
                <CalendarDotsIcon className={cn('size-4', isDark ? 'text-neutral-400' : 'text-neutral-500')} aria-hidden />
              </span>
            </Button>
          </PopoverTrigger>

          <PopoverContent
            align='start'
            className='w-auto rounded-[6px] p-0'
            onCloseAutoFocus={(event) => {
              event.preventDefault();
            }}>
            <Calendar
              mode='single'
              selected={selectedDate}
              defaultMonth={selectedDate}
              captionLayout='dropdown'
              startMonth={dayjs().year(calendarStartYear).month(0).date(1).toDate()}
              endMonth={dayjs().year(calendarEndYear).month(11).date(31).toDate()}
              locale={ko}
              onSelect={(date) => {
                if (!date) return;
                onChange?.(dayjs(date).format(outputFormat));
                setOpen(false);
              }}
            />
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
};

export default AppDatePicker;
