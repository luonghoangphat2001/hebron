import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

type MyPageFormMobileFooterProps = {
  isDocked: boolean;
  children: ReactNode;
  className?: string;
};

const MyPageFormMobileFooter = ({ isDocked, children, className }: MyPageFormMobileFooterProps) => {
  return (
    <div
      className={cn(
        'z-10 border-t border-neutral-200 bg-white px-5 py-4 md:hidden',
        isDocked ? 'absolute inset-x-0 bottom-0' : 'fixed inset-x-0 bottom-0',
        className,
      )}>
      {children}
    </div>
  );
};

export default MyPageFormMobileFooter;
