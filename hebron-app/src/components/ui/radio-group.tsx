import { RadioGroup as RadioGroupPrimitive } from 'radix-ui';
import * as React from 'react';

import { cn } from '@/lib/utils';

function RadioGroup({ className, ...props }: React.ComponentProps<typeof RadioGroupPrimitive.Root>) {
  return <RadioGroupPrimitive.Root data-slot='radio-group' className={cn('grid w-full gap-2.5', className)} {...props} />;
}

export type RadioGroupItemProps = React.ComponentProps<typeof RadioGroupPrimitive.Item> & {
  size?: 'default' | 'md';
  color?: 'default' | 'red';
};

function RadioGroupItem({ className, size = 'default', color = 'default', ...props }: RadioGroupItemProps) {
  return (
    <RadioGroupPrimitive.Item
      data-slot='radio-group-item'
      className={cn(
        'group/radio-group-item peer focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 aria-invalid:aria-checked:border-primary dark:bg-input/30 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 data-checked:border-blue-brand data-checked:bg-blue-brand data-checked:text-primary-foreground dark:data-checked:bg-primary relative flex aspect-square size-4 shrink-0 rounded-full border border-neutral-200 outline-none after:absolute after:-inset-x-3 after:-inset-y-2 focus-visible:ring-3 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:ring-3',
        size === 'md' && 'size-5',
        color === 'red' && 'border-red-500 data-checked:border-red-500 data-checked:bg-red-500',
        className,
      )}
      {...props}>
      <RadioGroupPrimitive.Indicator data-slot='radio-group-indicator' className='flex size-4 items-center justify-center'>
        <span
          className={cn(
            'bg-primary-foreground absolute top-1/2 left-1/2 size-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full',
            size === 'md' && 'size-2',
          )}
        />
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  );
}

export { RadioGroup, RadioGroupItem };
