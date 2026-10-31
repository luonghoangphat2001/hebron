import { Table } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

type AppTableProps = {
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
  tableClassName?: string;
};

const AppTable = ({ children, footer, className, tableClassName }: AppTableProps) => {
  return (
    <div className={cn('overflow-hidden rounded-lg border border-neutral-200', className)}>
      <Table className={tableClassName}>{children}</Table>
      {footer ? <div className='border-t border-neutral-200 p-3'>{footer}</div> : null}
    </div>
  );
};

export default AppTable;
