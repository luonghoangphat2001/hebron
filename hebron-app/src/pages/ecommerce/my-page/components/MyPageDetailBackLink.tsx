import { cn } from '@/lib/utils';
import { CaretLeftIcon } from '@phosphor-icons/react';
import { Link } from 'react-router-dom';

type MyPageDetailBackLinkProps = {
  to: string;
  label: string;
  className?: string;
};

const MyPageDetailBackLink = ({ to, label, className }: MyPageDetailBackLinkProps) => {
  return (
    <Link
      to={to}
      className={cn(
        'inline-flex items-center gap-1 text-sm font-bold text-neutral-500 transition-colors hover:text-neutral-950',
        className,
      )}>
      <CaretLeftIcon className='size-4 shrink-0' aria-hidden weight='bold' />
      {label}
    </Link>
  );
};

export default MyPageDetailBackLink;
