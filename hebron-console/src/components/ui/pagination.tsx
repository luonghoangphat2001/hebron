import * as React from 'react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ChevronLeftIcon, ChevronRightIcon, MoreHorizontalIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

function Pagination({ className, ...props }: React.ComponentProps<'nav'>) {
  const { t } = useTranslation('common');
  return (
    <nav
      role='navigation'
      aria-label={t('pagination.label')}
      data-slot='pagination'
      className={cn('mx-auto flex w-full justify-center', className)}
      {...props}
    />
  );
}

function PaginationContent({ className, ...props }: React.ComponentProps<'ul'>) {
  return <ul data-slot='pagination-content' className={cn('flex items-center gap-1', className)} {...props} />;
}

function PaginationItem({ ...props }: React.ComponentProps<'li'>) {
  return <li data-slot='pagination-item' {...props} />;
}

type PaginationLinkProps = {
  isActive?: boolean;
} & Pick<React.ComponentProps<typeof Button>, 'size'> &
  React.ComponentProps<'a'>;

function PaginationLink({ className, isActive, size = 'icon', ...props }: PaginationLinkProps) {
  return (
    <Button asChild variant={isActive ? 'outline' : 'ghost'} size={size} className={cn(className)}>
      <a aria-current={isActive ? 'page' : undefined} data-slot='pagination-link' data-active={isActive} {...props} />
    </Button>
  );
}

function PaginationPrevious({ className, text, ...props }: React.ComponentProps<typeof PaginationLink> & { text?: string }) {
  const { t } = useTranslation('common');
  return (
    <PaginationLink aria-label={t('pagination.previous_label')} size='default' className={cn('pl-2!', className)} {...props}>
      <ChevronLeftIcon data-icon='inline-start' />
      <span className='hidden sm:block'>{text || t('pagination.previous')}</span>
    </PaginationLink>
  );
}

function PaginationNext({ className, text, ...props }: React.ComponentProps<typeof PaginationLink> & { text?: string }) {
  const { t } = useTranslation('common');
  return (
    <PaginationLink aria-label={t('pagination.next_label')} size='default' className={cn('pr-2!', className)} {...props}>
      <span className='hidden sm:block'>{text || t('pagination.next')}</span>
      <ChevronRightIcon data-icon='inline-end' />
    </PaginationLink>
  );
}

function PaginationEllipsis({ className, ...props }: React.ComponentProps<'span'>) {
  const { t } = useTranslation('common');
  return (
    <span
      aria-hidden
      data-slot='pagination-ellipsis'
      className={cn("flex size-9 items-center justify-center [&_svg:not([class*='size-'])]:size-4", className)}
      {...props}>
      <MoreHorizontalIcon />
      <span className='sr-only'>{t('pagination.more')}</span>
    </span>
  );
}

export { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious };
