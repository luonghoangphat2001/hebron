import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Spinner } from '../ui/spinner';

type CustomDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  className?: string;
  title: ReactNode;
  description?: string;
  children?: ReactNode;
  textCancel?: string;
  textOk?: string;
  onOk?: () => void;
  loading?: boolean;
  footerCenter?: boolean;
  showFooter?: boolean;
};

const CustomDialog = ({
  open,
  onOpenChange,
  className,
  title,
  description,
  children,
  textCancel,
  textOk,
  onOk,
  loading,
  footerCenter,
  showFooter = true,
}: CustomDialogProps) => {
  const { t: tCommon } = useTranslation('common');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent onOpenAutoFocus={(e) => e.preventDefault()} className={cn('flex max-h-[90vh] w-200 flex-col', className)}>
        <DialogHeader>
          <DialogTitle className='text-lg'>{title}</DialogTitle>
          <DialogDescription className='text-base'>{description || ''}</DialogDescription>
        </DialogHeader>
        {children && <div className='flex-1 overflow-y-auto'>{children}</div>}
        {showFooter && (
          <DialogFooter className={cn(footerCenter && 'sm:justify-center')}>
            <DialogClose asChild>
              <Button variant='outline' className='w-20'>
                {textCancel || tCommon('button.cancel')}
              </Button>
            </DialogClose>
            {onOk && (
              <Button type='submit' onClick={onOk} disabled={loading} className='w-20'>
                {loading && <Spinner />}
                {textOk || tCommon('button.save')}
              </Button>
            )}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CustomDialog;
