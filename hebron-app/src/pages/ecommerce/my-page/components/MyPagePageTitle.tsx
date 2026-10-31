import { Typography } from '@/components/typography/Typography';
import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

type MyPagePageTitleProps = {
  children: ReactNode;
  className?: string;
};

const MyPagePageTitle = ({ children, className }: MyPagePageTitleProps) => {
  return (
    <Typography weight='bold' className={cn('text-lg md:text-xl', className)}>
      {children}
    </Typography>
  );
};

export default MyPagePageTitle;
