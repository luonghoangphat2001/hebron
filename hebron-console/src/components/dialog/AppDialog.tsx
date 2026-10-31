import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
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
import type { ReactNode, SubmitEvent } from 'react';
import { useTranslation } from 'react-i18next';

type AppDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  className?: string;
  title: ReactNode;
  description?: string;
  children?: ReactNode;
  textCancel?: string;
  textOk?: string;
  onOk?: () => void;
  okDisabled?: boolean;
  loading?: boolean;
  footerCenter?: boolean;
  clickOverlay?: boolean;
  contentLoading?: boolean;
};

const AppDialog = ({
  open,
  onOpenChange,
  className,
  title,
  description,
  children,
  textCancel,
  textOk,
  onOk,
  okDisabled,
  loading,
  footerCenter,
  clickOverlay = false,
  contentLoading = false,
}: AppDialogProps) => {
  const { t: tCommon } = useTranslation('common');

  const handleSubmit = (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!onOk || loading || okDisabled) return;
    onOk();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        onOpenAutoFocus={(e) => e.preventDefault()}
        onPointerDownOutside={(e) => {
          if (!clickOverlay) e.preventDefault();
        }}
        className={cn('flex max-h-[90vh] flex-col gap-0 overflow-hidden p-0', className)}>
        <form className='flex min-h-0 flex-1 flex-col' onSubmit={handleSubmit} noValidate>
          <DialogHeader className='border-b border-gray-200 p-4'>
            <DialogTitle className='text-base'>{title}</DialogTitle>
            <DialogDescription className='text-base'>{description || ''}</DialogDescription>
          </DialogHeader>
          {(children || contentLoading) && (
            <div className='scrollbar-thin flex-1 overflow-y-auto p-4'>
              {contentLoading ? (
                <div className='space-y-4'>
                  <Skeleton className='h-10 w-full' />
                  <Skeleton className='h-10 w-full' />
                  <Skeleton className='h-10 w-3/4' />
                </div>
              ) : (
                children
              )}
            </div>
          )}
          <DialogFooter className={cn('border-t border-gray-200 bg-gray-50 p-4', footerCenter && 'sm:justify-center')}>
            <DialogClose asChild>
              <Button type='button' variant='outline' className='w-20' disabled={loading}>
                {textCancel || tCommon('button.cancel')}
              </Button>
            </DialogClose>
            {onOk && (
              <Button type='submit' loading={loading} disabled={loading || okDisabled} className='w-20'>
                {textOk || tCommon('button.save')}
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AppDialog;
