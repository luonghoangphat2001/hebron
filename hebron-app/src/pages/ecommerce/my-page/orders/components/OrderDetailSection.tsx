import { cn } from '@/lib/utils';
import type { Icon } from '@phosphor-icons/react';
import type { ReactNode } from 'react';

type OrderDetailSectionProps = {
  title: ReactNode;
  icon: Icon;
  children: ReactNode;
  className?: string;
};

const OrderDetailSection = ({ title, icon: Icon, children, className }: OrderDetailSectionProps) => {
  return (
    <section className={cn('flex flex-col', className)}>
      <div className='flex items-center gap-2 py-3'>
        <Icon className='size-5 shrink-0 text-neutral-500' weight='duotone' />
        <div className='flex items-center gap-2 text-lg text-neutral-950'>
          {typeof title === 'string' ? <span className='font-bold'>{title}</span> : title}
        </div>
      </div>
      <div className='pb-4'>{children}</div>
    </section>
  );
};

export default OrderDetailSection;
