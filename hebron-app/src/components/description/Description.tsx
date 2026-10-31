import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

export type DescriptionRow = {
  label: ReactNode;
  value: ReactNode;
  labelClassName?: string;
  valueClassName?: string;
  label2?: ReactNode;
  value2?: ReactNode;
  label2ClassName?: string;
  value2ClassName?: string;
};

type DescriptionProps = {
  rows: DescriptionRow[];
  className?: string;
  labelClassName?: string;
  valueClassName?: string;
};

type DescriptionPairProps = {
  label: ReactNode;
  value: ReactNode;
  labelClassName?: string;
  valueClassName?: string;
  className?: string;
};

const DescriptionPair = ({ label, value, labelClassName, valueClassName, className }: DescriptionPairProps) => {
  return (
    <div className={cn('flex min-w-0', className)}>
      <div
        className={cn(
          'flex w-38.75 shrink-0 items-center border-r border-neutral-200 bg-neutral-50 px-3 py-4.5 text-sm text-neutral-500',
          labelClassName,
        )}>
        {label}
      </div>
      <div className={cn('text-md flex min-w-0 flex-1 flex-wrap items-center gap-3 px-3 py-3', valueClassName)}>{value}</div>
    </div>
  );
};

const Description = ({ rows, className, labelClassName, valueClassName }: DescriptionProps) => {
  return (
    <div className={cn('overflow-hidden rounded-md border border-neutral-200', className)}>
      {rows.map((row, index) => {
        const hasSecondPair = row.label2 !== undefined || row.value2 !== undefined;

        return (
          <div key={index} className='flex flex-wrap border-b border-neutral-200 last:border-b-0'>
            <DescriptionPair
              label={row.label}
              value={row.value}
              labelClassName={cn(labelClassName, row.labelClassName)}
              valueClassName={cn(valueClassName, row.valueClassName)}
              className={cn('w-full', hasSecondPair && 'border-b border-neutral-200 md:w-1/2 md:border-r md:border-b-0')}
            />
            {hasSecondPair && (
              <DescriptionPair
                label={row.label2}
                value={row.value2}
                labelClassName={cn(labelClassName, row.label2ClassName)}
                valueClassName={cn(valueClassName, row.value2ClassName)}
                className='w-full md:w-1/2'
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default Description;
