import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { enUS, ko } from 'date-fns/locale';
import dayjs from 'dayjs';
import { CalendarIcon, X } from 'lucide-react';
import { useState } from 'react';
import type { DateRange } from 'react-day-picker';
import { useTranslation } from 'react-i18next';

type Props = {
  value?: DateRange;
  onChange?: (range?: DateRange) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  allowClear?: boolean;
  format?: string;
};

export function DateRangePicker({
  value,
  onChange,
  placeholder = 'Pick date range',
  disabled,
  className,
  allowClear = true,
  format = 'YYYY-MM-DD',
}: Props) {
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(false);

  const displayValue =
    value?.from && value?.to ? `${dayjs(value.from).format(format)} ~ ${dayjs(value.to).format(format)}` : placeholder;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant='outline'
          disabled={disabled}
          className={cn('w-full justify-between font-normal', !value?.from && 'text-muted-foreground', className)}>
          <span className='truncate'>{displayValue}</span>
          <div className='flex items-center gap-1'>
            {allowClear && value?.from && (
              <div
                role='button'
                tabIndex={0}
                onClick={(e) => {
                  e.stopPropagation();
                  onChange?.(undefined);
                }}
                className='hover:bg-accent rounded-sm p-1'>
                <X className='size-4' />
              </div>
            )}
            <CalendarIcon className='size-4 opacity-50' />
          </div>
        </Button>
      </PopoverTrigger>

      <PopoverContent align='start' className='w-auto p-0'>
        <Calendar
          locale={i18n.language === 'en' ? enUS : ko}
          mode='range'
          selected={value}
          onSelect={onChange}
          numberOfMonths={2}
        />
      </PopoverContent>
    </Popover>
  );
}
