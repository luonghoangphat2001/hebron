import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

export type OrderDetailInfoCell = {
  label: string;
  value: ReactNode;
};

type OrderDetailInfoGridProps = {
  rows: OrderDetailInfoCell[][];
  className?: string;
};

const LabelCell = ({ label, className }: { label: string; className?: string }) => (
  <div
    className={cn('flex items-center border-r border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-500', className)}>
    {label}
  </div>
);

const ValueCell = ({ children, className }: { children: ReactNode; className?: string }) => (
  <div className={cn('text-md flex flex-wrap items-center gap-3 bg-white px-4 py-3 text-neutral-950', className)}>{children}</div>
);

const OrderDetailInfoGrid = ({ rows, className }: OrderDetailInfoGridProps) => {
  return (
    <div className={cn('overflow-hidden rounded-lg border border-neutral-200', className)}>
      {rows.map((row, rowIndex) => {
        const rowKey = row.map((cell) => cell.label).join('-');
        const isPairRow = row.length === 2;

        if (!isPairRow) {
          const cell = row[0];

          return (
            <div
              key={rowKey}
              className={cn(
                'grid grid-cols-[minmax(0,7.5rem)_1fr] border-neutral-200',
                rowIndex < rows.length - 1 && 'border-b',
              )}>
              <LabelCell label={cell.label} />
              <ValueCell>{cell.value}</ValueCell>
            </div>
          );
        }

        return (
          <div
            key={rowKey}
            className={cn(
              'grid grid-cols-[minmax(0,7.5rem)_1fr] border-neutral-200 md:grid-cols-[minmax(0,7.5rem)_1fr_minmax(0,7.5rem)_1fr]',
              rowIndex < rows.length - 1 && 'border-b',
            )}>
            <LabelCell label={row[0].label} />
            <ValueCell className='border-r border-neutral-200 md:border-b-0'>{row[0].value}</ValueCell>
            <LabelCell label={row[1].label} />
            <ValueCell>{row[1].value}</ValueCell>
          </div>
        );
      })}
    </div>
  );
};

export default OrderDetailInfoGrid;
