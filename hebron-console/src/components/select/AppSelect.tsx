import { cn } from '@/lib/utils';
import { Check, ChevronDown, Loader2, X } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '../ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '../ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';

type SelectValue = string | number;

export type SelectOption<T extends SelectValue = string> = {
  label: string;
  value: T;
};

type Props<T extends SelectValue = string> = {
  value?: T;
  options: SelectOption<T>[];
  placeholder?: string;
  onChange?: (value?: T) => void;
  disabled?: boolean;
  className?: string;
  showSearch?: boolean;
  clearable?: boolean;
  onSearch?: (value: string) => void;
  onLoadMore?: () => void;
  hasMore?: boolean;
  isLoading?: boolean;
  isLoadingMore?: boolean;
};

export default function AppSelect<T extends SelectValue = string>({
  value,
  options,
  placeholder,
  onChange,
  disabled,
  className,
  showSearch,
  clearable = true,
  onSearch,
  onLoadMore,
  hasMore,
  isLoading,
  isLoadingMore,
}: Props<T>) {
  const { t } = useTranslation('common');
  const [open, setOpen] = useState(false);
  const isServerSearch = typeof onSearch === 'function';
  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    if (!onLoadMore || !hasMore || isLoadingMore) return;
    const { scrollHeight, scrollTop, clientHeight } = event.currentTarget;
    if (scrollHeight - scrollTop - clientHeight < 48) onLoadMore();
  };

  const selected = options.find((item) => item.value === value);

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) onSearch?.('');
      }}>
      <PopoverTrigger asChild>
        <Button
          variant='outline'
          role='combobox'
          disabled={disabled}
          className={cn('w-full justify-between', !value && 'text-muted-foreground', className)}>
          <span className='truncate font-normal'>{selected?.label || placeholder || t('placeholder.select_option')}</span>

          <div className='flex items-center gap-1'>
            {clearable && value && (
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

            <ChevronDown className='size-4 opacity-50' />
          </div>
        </Button>
      </PopoverTrigger>

      <PopoverContent
        className='w-[var(--radix-popover-trigger-width)] p-0'
        align='start'
        onCloseAutoFocus={(e) => {
          e.preventDefault();
        }}>
        <Command shouldFilter={!isServerSearch} filter={isServerSearch ? () => 1 : undefined}>
          {showSearch && <CommandInput placeholder={t('placeholder.search')} onValueChange={(value) => onSearch?.(value)} />}

          <CommandList onScroll={handleScroll}>
            <CommandEmpty>{isLoading ? t('select.loading') : t('empty.no_result')}</CommandEmpty>

            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={String(option.value)}
                  value={`${option.value}-${option.label}`}
                  keywords={[option.label]}
                  className={cn(value === option.value ? 'bg-slate-100' : '')}
                  onSelect={() => {
                    onChange?.(option.value === value && clearable ? undefined : option.value);

                    setOpen(false);
                  }}>
                  <div className='flex w-full items-center'>
                    <span className='truncate'>{option.label}</span>

                    <Check className={cn('ml-auto size-4 shrink-0', value === option.value ? 'opacity-100' : 'opacity-0')} />
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
            {(isLoading || isLoadingMore) && options.length > 0 && (
              <div className='text-muted-foreground flex items-center justify-center gap-2 py-2 text-xs'>
                <Loader2 className='size-3 animate-spin' /> {t('select.loading')}
              </div>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
