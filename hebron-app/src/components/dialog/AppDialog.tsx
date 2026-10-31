import { cn } from '@/lib/utils';
import { XIcon } from '@phosphor-icons/react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '../ui/button';
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';

export type AppDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: ReactNode;
  subTitle?: ReactNode;
  titleClassName?: string;
  headerClassName?: string;
  closeButtonClassName?: string;
  children: ReactNode;
  contentClassName?: string;
  className?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  confirmText?: string;
  cancelText?: string;
  confirmIcon?: ReactNode;
  cancelIcon?: ReactNode;
  isConfirming?: boolean;
  isCancelling?: boolean;
  showFooter?: boolean;
  closeOnInteractOutside?: boolean;
};

const AppDialog = ({
  open,
  onOpenChange,
  title,
  subTitle,
  titleClassName,
  headerClassName,
  closeButtonClassName,
  children,
  contentClassName,
  className,
  onConfirm,
  onCancel,
  confirmText,
  cancelText,
  confirmIcon,
  cancelIcon,
  isConfirming,
  isCancelling,
  showFooter = true,
  closeOnInteractOutside = true,
}: AppDialogProps) => {
  const { t: tCommon } = useTranslation('common');
  const isBusy = isConfirming || isCancelling;

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (isBusy && !nextOpen) return;
        onOpenChange(nextOpen);
      }}>
      <DialogContent
        showCloseButton={false}
        aria-describedby={undefined}
        onPointerDownOutside={(e) => {
          if (!closeOnInteractOutside || isBusy) {
            e.preventDefault();
          }
        }}
        onEscapeKeyDown={(e) => {
          if (isBusy) e.preventDefault();
        }}
        className={cn(
          // desktop
          'flex max-h-[calc(100dvh-40px)] flex-col gap-0 overflow-hidden bg-white p-0 sm:max-w-156 sm:rounded-xl',

          // mobile
          'max-sm:right-2 max-sm:left-2',
          'max-sm:top-auto max-sm:bottom-2',
          'max-sm:w-auto max-sm:max-w-none',
          'max-sm:translate-x-0 max-sm:translate-y-0',
          'max-sm:rounded-2xl',

          // animation mobile
          'max-sm:data-[state=open]:slide-in-from-bottom',
          'max-sm:data-[state=closed]:slide-out-to-bottom',

          className,
        )}>
        <DialogHeader
          className={cn('shrink-0 flex-row items-center justify-between px-3 py-4 md:px-6 md:py-4.5', headerClassName)}>
          <DialogTitle className={cn('md:text-display-xs! text-lg font-bold text-neutral-950', titleClassName)}>
            <p>{title}</p>
            {subTitle}
          </DialogTitle>

          <DialogClose
            disabled={isBusy}
            className={cn(
              'flex size-9 cursor-pointer items-center justify-center rounded-full bg-neutral-100 ring-0 outline-none focus:ring-0 focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50',
              closeButtonClassName,
            )}>
            <XIcon className='size-5 text-neutral-950' weight='bold' />
          </DialogClose>
        </DialogHeader>
        <div
          className={cn(
            'custom-scrollbar min-h-0 flex-1 overflow-y-auto border-y border-neutral-200 p-3 md:p-6',
            contentClassName,
          )}>
          {children}
        </div>
        {showFooter && (
          <div className='flex shrink-0 justify-end gap-3 p-3 md:gap-4 md:px-6 md:py-4'>
            <Button
              variant='outline'
              className='flex-1 md:w-37 md:flex-none'
              onClick={onCancel ?? (() => onOpenChange(false))}
              loading={isCancelling}
              disabled={isBusy}>
              {cancelText || tCommon('button.cancel')} {cancelIcon}
            </Button>
            <Button className='flex-1 md:min-w-37 md:flex-none' onClick={onConfirm} loading={isConfirming} disabled={isBusy}>
              {confirmText || tCommon('button.check')} {confirmIcon}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AppDialog;
