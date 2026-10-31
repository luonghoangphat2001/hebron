import { cn } from '@/lib/utils';
import { Slot } from 'radix-ui';
import * as React from 'react';

export const typographyVariants = {
  'display-sm': 'text-display-sm leading-[var(--text-display-sm--line-height)]',
  'display-xs': 'text-display-xs leading-[var(--text-display-xs--line-height)]',
  'title-lg': 'text-lg leading-[var(--text-lg--line-height)]',
  'title-md': 'text-md leading-[var(--text-md--line-height)]',
  'title-sm': 'text-sm leading-[var(--text-sm--line-height)]',
  'body-md': 'text-md leading-[var(--text-md--line-height)]',
  'body-sm': 'text-sm leading-[var(--text-sm--line-height)]',
  'label-md': 'text-md leading-[var(--text-md--line-height)]',
  'label-sm': 'text-sm leading-[var(--text-sm--line-height)]',
  caption: 'text-xs leading-[var(--text-xs--line-height)]',
} as const;

export const typographyWeights = {
  regular: 'font-normal',
  medium: 'font-medium',
  semibold: 'font-semibold',
  bold: 'font-bold',
} as const;

export type TypographyVariant = keyof typeof typographyVariants;
export type TypographyWeight = keyof typeof typographyWeights;

type TypographyOwnProps = {
  variant?: TypographyVariant;
  weight?: TypographyWeight;
  asChild?: boolean;
  className?: string;
};

export type TypographyProps<E extends React.ElementType = 'p'> = TypographyOwnProps &
  Omit<React.ComponentPropsWithoutRef<E>, keyof TypographyOwnProps | 'as'> & {
    as?: E;
  };

function Typography<E extends React.ElementType = 'p'>({
  as,
  asChild = false,
  variant = 'body-md',
  weight = 'regular',
  className,
  children,
  ...props
}: TypographyProps<E>) {
  const Comp = asChild ? Slot.Root : (as ?? 'p');

  return (
    <Comp className={cn(typographyVariants[variant], typographyWeights[weight], className)} {...props}>
      {children}
    </Comp>
  );
}

export { Typography };
