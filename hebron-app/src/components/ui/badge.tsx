import { cva, type VariantProps } from 'class-variance-authority';
import { Slot } from 'radix-ui';
import * as React from 'react';

import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'group/badge inline-flex w-fit text-white shrink-0 items-center justify-center gap-1 overflow-hidden rounded-4xl border border-transparent text-sm font-medium whitespace-nowrap transition-all focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&>svg]:pointer-events-none [&>svg]:size-3!',
  {
    variants: {
      variant: {
        default: 'bg-blue-brand',
        black: 'bg-neutral-950',
        red: 'bg-brand',
        'red-outline': 'bg-red-50 border-red-500 text-red-500',
        white: 'bg-neutral-50 border-neutral-200 text-neutral-950',
      },
      size: {
        default: 'px-1.5',
        md: 'px-2 py-0.5',
      },
    },
    defaultVariants: {
      size: 'default',
      variant: 'default',
    },
  },
);

function Badge({
  className,
  variant = 'default',
  size = 'default',
  asChild = false,
  ...props
}: React.ComponentProps<'span'> & VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : 'span';

  return <Comp data-slot='badge' data-variant={variant} className={cn(badgeVariants({ variant, size }), className)} {...props} />;
}

export { Badge, badgeVariants };
