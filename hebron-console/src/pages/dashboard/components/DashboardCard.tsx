import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

type Props = {
  title: string;
  icon?: LucideIcon;
  description?: string;
  extra?: ReactNode;
  className?: string;
  contentClassName?: string;
  children: ReactNode;
};

const DashboardCard = ({ title, icon: Icon, description, extra, className, contentClassName, children }: Props) => {
  return (
    <Card className={cn('gap-0 border-gray-200 bg-white py-0 shadow-sm', className)}>
      {/* [.border-b]:pb-4 overrides the pb-6 CardHeader applies to bordered headers */}
      <CardHeader className='border-b border-gray-100 bg-linear-to-r from-gray-50 to-white pt-4 [.border-b]:pb-4'>
        <div className='flex items-start justify-between gap-4'>
          <div className='min-w-0'>
            <CardTitle className='flex items-center gap-2 text-lg font-bold text-gray-900'>
              {Icon && <Icon className='text-primary size-5 shrink-0' />}
              <span className='truncate'>{title}</span>
            </CardTitle>
            {description && <p className='text-muted-foreground mt-2 text-sm'>{description}</p>}
          </div>
          {extra}
        </div>
      </CardHeader>

      <CardContent className={cn('p-5', contentClassName)}>{children}</CardContent>
    </Card>
  );
};

export default DashboardCard;
