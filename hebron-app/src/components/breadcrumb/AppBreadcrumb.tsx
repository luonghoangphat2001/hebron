import { cn } from '@/lib/utils';
import { CaretRightIcon } from '@phosphor-icons/react';
import { Link } from 'react-router-dom';

export type AppBreadcrumbItem = {
  label: string;
  href?: string;
};

type AppBreadcrumbProps = {
  items?: AppBreadcrumbItem[];
  variant?: 'default' | 'dark';
};

const defaultItems: AppBreadcrumbItem[] = [{ label: '홈', href: '/' }, { label: '상패' }];

const AppBreadcrumb = ({ items = defaultItems, variant = 'default' }: AppBreadcrumbProps) => {
  return (
    <nav aria-label='breadcrumb'>
      <ol className='flex items-center gap-1'>
        {items.map((item, index) => {
          const isActive = index === items.length - 1;
          const className = cn(
            'px-2 py-1 text-sm',
            variant === 'dark'
              ? isActive
                ? 'font-bold text-white'
                : 'text-neutral-400 hover:text-white'
              : isActive
                ? 'font-bold text-neutral-950'
                : 'text-neutral-500',
          );

          return (
            <li className='flex items-center gap-1' key={`${item.label}-${index}`}>
              {index > 0 && (
                <CaretRightIcon
                  aria-hidden
                  className={cn('size-4', variant === 'dark' ? 'text-neutral-600' : 'text-neutral-500')}
                />
              )}
              {item.href && !isActive ? (
                <Link className={className} to={item.href}>
                  {item.label}
                </Link>
              ) : (
                <span aria-current={isActive ? 'page' : undefined} className={className}>
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default AppBreadcrumb;
