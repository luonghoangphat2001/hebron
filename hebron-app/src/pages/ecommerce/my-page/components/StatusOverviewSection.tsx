import MyPagePageTitle from '@/pages/ecommerce/my-page/components/MyPagePageTitle';
import { cn } from '@/lib/utils';
import StatusCard from '@/pages/ecommerce/my-page/components/StatusCard';
import type { StatusOverviewGroup } from '@/utils/types/my-page.type';

type StatusOverviewSectionProps = {
  group: StatusOverviewGroup;
  className?: string;
};

const StatusOverviewSection = ({ group, className }: StatusOverviewSectionProps) => {
  return (
    <section className={cn('flex w-full min-w-0 flex-col gap-2 md:gap-4', className)}>
      <MyPagePageTitle>{group.title}</MyPagePageTitle>

      <div className='scrollbar-hide overflow-x-auto rounded-2xl bg-neutral-100'>
        <div
          className={cn(
            'relative isolate grid gap-2 px-4 pt-9 pb-3 md:min-w-0',
            group.items.length === 6 ? 'min-w-[42rem] grid-cols-6' : 'min-w-[35rem] grid-cols-5',
          )}>
          {group.items.length !== 6 ? (
            <div aria-hidden className='absolute top-19 right-[10%] left-[10%] -z-10 h-0.5 bg-white' />
          ) : null}
          {group.items.map((item) => (
            <StatusCard
              key={item.key}
              icon={item.icon}
              label={item.label}
              value={item.count}
              iconWeight={item.iconWeight}
              href={item.href}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatusOverviewSection;
