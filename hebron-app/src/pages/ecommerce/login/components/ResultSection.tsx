import { cn } from '@/lib/utils';
import { CheckIcon, XIcon } from '@phosphor-icons/react';
import type { ReactNode } from 'react';

type ResultSectionProps = {
  isSuccess: boolean;
  title: string;
  children?: ReactNode;
};

const ResultSection = ({ isSuccess, title, children }: ResultSectionProps) => {
  return (
    <div>
      <div className='flex flex-col items-center gap-4 md:gap-6'>
        <div
          className={cn('flex size-16 items-center justify-center rounded-full', isSuccess ? 'bg-[#E8F5EC]' : 'bg-[#EB57571A]')}>
          {isSuccess ? (
            <CheckIcon size={32} className='text-[#4CAF50]' weight='bold' />
          ) : (
            <XIcon size={32} className='text-[#EB5757]' weight='bold' />
          )}
        </div>
        <p className='text-xl font-bold'>{title}</p>
      </div>
      {children}
    </div>
  );
};

export default ResultSection;
