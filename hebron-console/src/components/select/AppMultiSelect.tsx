import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Check, ChevronDown, Loader2, X } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { SelectOption } from './AppSelect';

type Props<T extends string | number> = {
  value?: T[];
  options: SelectOption<T>[];
  placeholder?: string;
  onChange?: (value: T[]) => void;
  disabled?: boolean;
  className?: string;
  onLoadMore?: () => void;
  hasMore?: boolean;
  isLoadingMore?: boolean;
  hideBadges?: boolean;
};

const LOAD_MORE_THRESHOLD_PX = 48;

/** Multi-value sibling of AppSelect — same Command/Popover shell, selected values shown as removable badges. */
export default function AppMultiSelect<T extends string | number>({
  value = [],
  options,
  placeholder,
  onChange,
  disabled,
  className,
  onLoadMore,
  hasMore,
  isLoadingMore,
  hideBadges,
}: Props<T>) {
  const { t } = useTranslation('common');
  const [open, setOpen] = useState(false);

  const toggle = (item: T) => onChange?.(value.includes(item) ? value.filter((v) => v !== item) : [...value, item]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (!onLoadMore || !hasMore || isLoadingMore) return;

    const { scrollHeight, scrollTop, clientHeight } = e.currentTarget;
    if (scrollHeight - scrollTop - clientHeight < LOAD_MORE_THRESHOLD_PX) onLoadMore();
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant='outline'
          role='combobox'
          disabled={disabled}
          className={cn(
            'h-auto min-h-9 w-full justify-between py-1.5',
            (!value.length || hideBadges) && 'text-muted-foreground',
            className,
          )}>
          {value.length && !hideBadges ? (
            <div className='flex flex-wrap gap-1'>
              {value.map((item) => {
                const label = options.find((option) => option.value === item)?.label ?? String(item);

                return (
                  <Badge key={item} variant='secondary' className='gap-1 rounded-sm font-normal'>
                    <span className='max-w-40 truncate'>{label}</span>
                    <span
                      role='button'
                      tabIndex={0}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggle(item);
                      }}>
                      <X className='size-3' />
                    </span>
                  </Badge>
                );
              })}
            </div>
          ) : (
            <span className='truncate font-normal'>
              {placeholder ?? t('select.placeholder')}
              {hideBadges && !!value.length && ` · ${t('pagination.selected_count', { count: value.length })}`}
            </span>
          )}
          <ChevronDown className='size-4 shrink-0 opacity-50' />
        </Button>
      </PopoverTrigger>

      <PopoverContent
        className='w-(--radix-popover-trigger-width) p-0'
        align='start'
        onCloseAutoFocus={(e) => e.preventDefault()}>
        <Command>
          <CommandInput placeholder={t('select.search_placeholder')} />
          <CommandList onScroll={handleScroll}>
            <CommandEmpty>{t('select.no_result')}</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem key={option.value} value={option.label} onSelect={() => toggle(option.value)}>
                  <div className='flex w-full items-center'>
                    <span className='truncate'>{option.label}</span>
                    <Check
                      className={cn('ml-auto size-4 shrink-0', value.includes(option.value) ? 'opacity-100' : 'opacity-0')}
                    />
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
            {isLoadingMore && (
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
