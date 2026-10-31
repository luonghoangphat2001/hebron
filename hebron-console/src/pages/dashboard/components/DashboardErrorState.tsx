import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { useTranslation } from 'react-i18next';

type Props = {
  title: string;
  isFetching?: boolean;
  onRetry: () => void;
};

const DashboardErrorState = ({ title, isFetching, onRetry }: Props) => {
  const { t } = useTranslation('dashboard');

  return (
    <div className='bg-card flex min-h-64 flex-col items-center justify-center gap-4 rounded-lg border px-6 py-10 text-center shadow-sm'>
      <div className='bg-destructive/10 text-destructive flex size-12 items-center justify-center rounded-full'>
        <AlertCircle className='size-6' />
      </div>
      <div className='space-y-1'>
        <h2 className='text-lg font-semibold'>{title}</h2>
        <p className='text-muted-foreground text-sm'>{t('error.description')}</p>
      </div>
      <Button variant='outline' className='gap-2' disabled={isFetching} onClick={onRetry}>
        <RefreshCw className={cn('size-4', isFetching && 'animate-spin')} /> {t('error.retry')}
      </Button>
    </div>
  );
};

export default DashboardErrorState;
