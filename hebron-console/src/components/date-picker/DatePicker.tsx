import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { enUS, ko } from 'date-fns/locale';
import dayjs from 'dayjs';
import { CalendarIcon, X } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

type Props = {
  value?: Date;
  onChange?: (date?: Date) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  allowClear?: boolean;
  format?: string;
};

export function DatePicker({
  value,
  onChange,
  placeholder = 'Pick a date',
  disabled,
  className,
  allowClear = true,
  format = 'YYYY-MM-DD',
}: Props) {
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant='outline'
          disabled={disabled}
          className={cn('w-full justify-between font-normal', !value && 'text-muted-foreground', className)}>
          <span className='truncate'>{value ? dayjs(value).format(format) : placeholder}</span>

          <div className='flex items-center gap-1'>
            {allowClear && value && (
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
          mode='single'
          selected={value}
          onSelect={(date) => {
            onChange?.(date);

            setOpen(false);
          }}
        />
      </PopoverContent>
    </Popover>
  );
}
