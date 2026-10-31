import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import { Slot } from 'radix-ui';
import type { ComponentPropsWithoutRef, ElementType, ReactNode } from 'react';

type AppAccordionProps = ComponentPropsWithoutRef<typeof Collapsible> & {
  className?: string;
};

const AppAccordionRoot = ({ className, ...props }: AppAccordionProps) => {
  return <Collapsible data-slot='app-accordion' className={cn(className)} {...props} />;
};

type AppAccordionTriggerProps<E extends ElementType = 'button'> = {
  asChild?: boolean;
  as?: E;
  className?: string;
  children: ReactNode;
} & Omit<ComponentPropsWithoutRef<E>, 'asChild' | 'as' | 'className' | 'children'>;

const AppAccordionTrigger = <E extends ElementType = 'button'>({
  asChild = false,
  as,
  className,
  children,
  ...props
}: AppAccordionTriggerProps<E>) => {
  const Comp = asChild ? Slot.Root : (as ?? CollapsibleTrigger);

  return (
    <Comp
      data-slot='app-accordion-trigger'
      className={cn(
        'focus-visible:ring-blue-brand/30 flex w-full cursor-pointer items-center gap-3 py-4 text-left outline-none focus-visible:ring-2',
        className,
      )}
      {...props}>
      {children}
    </Comp>
  );
};

type AppAccordionContentProps = ComponentPropsWithoutRef<typeof CollapsibleContent> & {
  className?: string;
};

const AppAccordionContent = ({ className, children, ...props }: AppAccordionContentProps) => {
  return (
    <CollapsibleContent data-slot='app-accordion-content' className={cn('overflow-hidden', className)} {...props}>
      {children}
    </CollapsibleContent>
  );
};

const AppAccordion = Object.assign(AppAccordionRoot, {
  Trigger: AppAccordionTrigger,
  Content: AppAccordionContent,
});

export { AppAccordion, AppAccordionContent, AppAccordionTrigger };
export type { AppAccordionContentProps, AppAccordionProps, AppAccordionTriggerProps };
