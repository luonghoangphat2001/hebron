import { Typography } from '@/components/typography/Typography';
import { cn } from '@/lib/utils';
import type { Icon, IconWeight } from '@phosphor-icons/react';
import { Link } from 'react-router-dom';

export type StatusCardProps = {
  icon: Icon;
  label: string;
  value: number;
  iconWeight?: IconWeight;
  href?: string;
  className?: string;
};

const StatusCard = ({ icon: Icon, label, value, iconWeight = 'thin', href, className }: StatusCardProps) => {
  const content = (
    <div className={cn('flex min-w-0 flex-col items-center justify-center gap-3', className)}>
      <div className='flex size-20 shrink-0 items-center justify-center rounded-full bg-white shadow-sm'>
        <Icon className='size-12 text-neutral-600' weight={iconWeight} />
      </div>

      <div className='flex flex-col items-center'>
        <Typography as='span' variant='title-sm' weight='regular' className='text-center whitespace-normal text-neutral-500'>
          {label}
        </Typography>
        <Typography as='span' variant='display-xs' weight='bold' className='text-neutral-950'>
          {value}
        </Typography>
      </div>
    </div>
  );

  if (href) {
    return (
      <Link to={href} className='min-w-0 shrink-0 transition-opacity hover:opacity-80 md:w-full md:shrink'>
        {content}
      </Link>
    );
  }

  return <div className='min-w-0 shrink-0 md:w-full md:shrink'>{content}</div>;
};

export default StatusCard;
