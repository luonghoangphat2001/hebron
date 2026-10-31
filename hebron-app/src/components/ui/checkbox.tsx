import { cn } from '@/lib/utils';
import { CheckIcon, MinusIcon } from '@phosphor-icons/react';
import { Checkbox as CheckboxPrimitive } from 'radix-ui';
import * as React from 'react';

function Checkbox({ className, checked, ...props }: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
  return (
    <CheckboxPrimitive.Root
      data-slot='checkbox'
      checked={checked}
      className={cn(
        'peer focus-visible:border-ring focus-visible:ring-ring/50 border-neutral-200',
        'data-[state=checked]:border-blue-brand data-[state=checked]:bg-blue-brand data-[state=checked]:text-white',
        'data-[state=indeterminate]:border-blue-brand data-[state=indeterminate]:bg-blue-brand data-[state=indeterminate]:text-white',
        'relative flex size-5 shrink-0 items-center justify-center rounded-[6px] border shadow-xs transition-shadow outline-none',
        'focus-visible:ring-3 disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}>
      <CheckboxPrimitive.Indicator
        data-slot='checkbox-indicator'
        className='grid place-content-center text-current transition-none'>
        {checked === 'indeterminate' ? (
          <MinusIcon className='size-3' weight='bold' />
        ) : (
          <CheckIcon className='size-3' weight='bold' />
        )}
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}

export { Checkbox };
