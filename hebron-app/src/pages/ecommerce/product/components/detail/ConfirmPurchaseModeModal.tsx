import AppDialog from '@/components/dialog/AppDialog';
import { Button } from '@/components/ui/button';
import { ArrowRightIcon, SignInIcon, UserMinusIcon } from '@phosphor-icons/react';
import { useTranslation } from 'react-i18next';

type ConfirmPurchaseModeModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLogin: () => void;
  onGuestCheckout: () => void;
};

const ConfirmPurchaseModeModal = ({ open, onOpenChange, onLogin, onGuestCheckout }: ConfirmPurchaseModeModalProps) => {
  const { t: tCommon } = useTranslation('common');

  return (
    <AppDialog
      open={open}
      onOpenChange={onOpenChange}
      title={tCommon('title.login_to_purchase')}
      titleClassName='text-lg md:text-display-xs!'
      className='sm:max-w-105'
      // contentClassName='border-y-0 px-8 py-9'
      showFooter={false}>
      <div className='space-y-3'>
        <p className='text-md text-neutral-500'>{tCommon('title.login_purchase_benefit')}</p>
        <div className='space-y-4'>
          <Button variant='outline' size='lg' className='h-13 w-full justify-between rounded-lg p-3' onClick={onLogin}>
            <span className='flex items-center gap-2'>
              <SignInIcon className='size-6 text-neutral-500' weight='duotone' />
              <span className='text-lg font-medium text-neutral-950'>{tCommon('title.login_or_sign_up')}</span>
            </span>
            <ArrowRightIcon className='size-6 text-neutral-950' weight='bold' />
          </Button>
          <Button variant='outline' size='lg' className='h-13 w-full justify-between rounded-lg p-3' onClick={onGuestCheckout}>
            <span className='flex items-center gap-4'>
              <UserMinusIcon className='size-6 text-neutral-500' weight='duotone' />
              <span className='text-lg font-medium text-neutral-950'>{tCommon('title.purchase_as_guest')}</span>
            </span>
            <ArrowRightIcon className='size-6 text-neutral-950' weight='bold' />
          </Button>
        </div>
      </div>
    </AppDialog>
  );
};

export default ConfirmPurchaseModeModal;
