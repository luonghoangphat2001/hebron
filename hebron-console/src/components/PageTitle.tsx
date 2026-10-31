import { ChevronLeft } from 'lucide-react';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';

type PageTitleProps = {
  title: string;
  extra?: ReactNode;
  returnLink?: string;
};

const PageTitle = ({ title, extra, returnLink }: PageTitleProps) => {
  const navigate = useNavigate();

  const onReturn = () => {
    if (!returnLink) return;
    navigate(returnLink);
  };

  return (
    <header className='flex items-center justify-between'>
      <div className='flex items-center gap-4'>
        {returnLink && (
          <Button variant='outline' size='icon-sm' onClick={onReturn}>
            <ChevronLeft className='size-5' />
          </Button>
        )}
        <h2 className='text-2xl font-semibold'>{title}</h2>
      </div>
      {extra}
    </header>
  );
};

export default PageTitle;
