import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { SortOrder } from '@/utils/enums/common.enum';
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';

export type TableSortHeaderProps<T extends string = string> = {
  label: string;
  column: T;
  currentSortBy?: T | string;
  currentSortOrder?: SortOrder;
  onSortChange?: (sortBy?: T, sortOrder?: SortOrder) => void;
  className?: string;
  disabled?: boolean;
};

export const TableSortHeader = <T extends string = string>({
  label,
  column,
  currentSortBy,
  currentSortOrder,
  onSortChange,
  className,
  disabled,
}: TableSortHeaderProps<T>) => {
  const isActive = currentSortBy === column && Boolean(currentSortOrder);
  const Icon = isActive ? (currentSortOrder === SortOrder.ASC ? ArrowUp : ArrowDown) : ArrowUpDown;

  const handleClick = () => {
    if (!onSortChange || disabled) return;

    if (!isActive) return onSortChange(column, SortOrder.DESC);
    if (currentSortOrder === SortOrder.DESC) return onSortChange(column, SortOrder.ASC);

    onSortChange(undefined, undefined);
  };

  return (
    <Button
      variant='ghost'
      size='sm'
      disabled={disabled}
      className={cn(
        '-ml-3 h-auto gap-1 p-0 px-3 py-1 font-medium transition-colors hover:bg-transparent',
        isActive ? 'font-semibold text-blue-600' : 'text-gray-500 hover:text-gray-900',
        className,
      )}
      onClick={handleClick}>
      {label}
      <Icon className={cn('size-3.5', isActive ? 'text-blue-600' : 'text-gray-400')} />
    </Button>
  );
};
