import { useTranslation } from 'react-i18next';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog';
import { Spinner } from '../ui/spinner';

type ConfirmDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  isLoading?: boolean;
  variant?: 'destructive' | 'default' | 'link' | 'outline' | 'secondary' | 'ghost';
  closeOnConfirm?: boolean;
};

const ConfirmDialog = ({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  cancelLabel,
  onConfirm,
  isLoading = false,
  variant,
  closeOnConfirm = false,
}: ConfirmDialogProps) => {
  const { t: tCommon } = useTranslation('common');

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title || tCommon('confirm.default_title')}</AlertDialogTitle>
          <AlertDialogDescription>{description || tCommon('confirm.default_description')}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className='min-w-20 whitespace-nowrap' disabled={isLoading}>
            {cancelLabel || tCommon('button.cancel')}
          </AlertDialogCancel>
          <AlertDialogAction
            className='min-w-20 whitespace-nowrap'
            onClick={(event) => {
              if (!closeOnConfirm) event.preventDefault();
              onConfirm();
            }}
            disabled={isLoading}
            variant={variant}>
            {isLoading && <Spinner />} {confirmLabel || tCommon('button.delete')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ConfirmDialog;
