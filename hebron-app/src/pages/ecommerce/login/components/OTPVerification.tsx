import AppDialog from '@/components/dialog/AppDialog';
import OTPInput from '@/components/input/OTPInput';
import { useCountDown } from '@/hooks/useCountDown';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

type OTPVerificationProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  phone: string;
  onVerify: (otp: string) => Promise<void> | void;
  onResend: () => Promise<void> | void;
  isVerifying?: boolean;
};

const OTPVerification = ({ open, onOpenChange, phone, onVerify, onResend, isVerifying }: OTPVerificationProps) => {
  const { t: tCommon } = useTranslation('common');
  const [otp, setOtp] = useState('');
  const [isResending, setIsResending] = useState(false);
  const { seconds, reset, isExpired } = useCountDown(180, undefined, open);
  const minutes = Math.floor(seconds / 60);
  const remainSeconds = seconds % 60;

  const handleVerify = () => {
    if (otp.length < 6 || isVerifying) return;

    onVerify(otp);
  };

  const handleResend = async () => {
    if (!isExpired || isResending) return;

    setIsResending(true);
    try {
      await onResend();
      setOtp('');
      reset();
    } finally {
      setIsResending(false);
    }
  };

  return (
    <AppDialog
      open={open}
      onOpenChange={onOpenChange}
      title={tCommon('title.enter_verification_code')}
      confirmText={tCommon('button.check')}
      isConfirming={isVerifying}
      onConfirm={handleVerify}
      contentClassName='border-y-0'
      closeOnInteractOutside={false}>
      <section className='flex flex-col items-center space-y-3 md:space-y-4'>
        <div className='space-y-2 text-center'>
          <p className='text-xl font-bold'>
            {phone}
            {tCommon('title.sent_to')}
          </p>
          <p className='text-sm text-neutral-500'>{tCommon('title.please_enter_verification_code')}</p>
        </div>
        <div className='space-y-2 md:space-y-3'>
          <OTPInput value={otp} onChange={setOtp} disabled={isVerifying} />
          <p className='text-blue-brand text-center text-sm font-bold'>
            {minutes}:{String(remainSeconds).padStart(2, '0')}
          </p>
        </div>
        <button
          type='button'
          className='cursor-pointer text-sm underline underline-offset-2 hover:font-medium disabled:cursor-not-allowed disabled:text-neutral-400 disabled:hover:font-normal'
          onClick={handleResend}
          disabled={!isExpired || isResending || isVerifying}>
          {tCommon('title.did_not_receive_verification_code')}
        </button>
      </section>
    </AppDialog>
  );
};

export default OTPVerification;
