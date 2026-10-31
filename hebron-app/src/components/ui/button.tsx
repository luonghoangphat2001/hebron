import { cva, type VariantProps } from 'class-variance-authority';
import { Slot } from 'radix-ui';
import * as React from 'react';

import { cn } from '@/lib/utils';
import { Spinner } from './spinner';

const buttonVariants = cva(
  'group/button inline-flex shrink-0 items-center cursor-pointer justify-center rounded-md border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-70 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default: 'bg-red-500 text-white font-bold rounded-[360px] hover:bg-red-600',
        outline:
          'rounded-[360px] border-neutral-200 bg-white font-bold text-neutral-500 hover:bg-neutral-100 disabled:bg-neutral-100',
        ghost: 'rounded-[360px] bg-white font-bold text-neutral-500 hover:bg-neutral-100 disabled:bg-neutral-100',
      },
      size: {
        default: 'py-2.5 h-10 text-sm px-[14px] gap-1.5',
        xs: 'py-2 h-9 gap-1.5 px-3 text-sm',
        md: 'py-2.5 h-11 text-md px-4 gap-2',
        lg: 'py-3 h-12 text-md px-[18px] gap-2',
        icon: 'size-9',
        'icon-xs':
          "size-6 rounded-[min(var(--radius-md),8px)] in-data-[slot=button-group]:rounded-md [&_svg:not([class*='size-'])]:size-3",
        'icon-sm': 'size-8 rounded-[min(var(--radius-md),10px)] in-data-[slot=button-group]:rounded-md',
        'icon-lg': 'size-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

function Button({
  className,
  variant = 'default',
  size = 'default',
  asChild = false,
  loading,
  children,
  type = 'button',
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
    loading?: boolean;
  }) {
  const Comp = asChild ? Slot.Root : 'button';

  return (
    <Comp
      data-slot='button'
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size }), className)}
      type={type}
      {...props}>
      {asChild ? (
        children
      ) : (
        <>
          {loading && <Spinner />}
          {children}
        </>
      )}
    </Comp>
  );
}

export { Button, buttonVariants };
