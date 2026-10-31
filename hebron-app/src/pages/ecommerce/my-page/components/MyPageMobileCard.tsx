import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

type MyPageMobileCardProps = {
  header?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
};

const MyPageMobileCard = ({ header, children, footer, className }: MyPageMobileCardProps) => {
  return (
    <article className={cn('flex flex-col overflow-hidden rounded-lg border border-neutral-200 bg-white', className)}>
      {header ? <div className='flex items-center gap-2 border-b border-neutral-100 px-4 py-3'>{header}</div> : null}
      <div className='px-4 py-3'>{children}</div>
      {footer ? <div className='px-4 pb-4'>{footer}</div> : null}
    </article>
  );
};

export default MyPageMobileCard;
