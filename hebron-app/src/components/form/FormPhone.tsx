import AppDialog from '@/components/dialog/AppDialog';
import OTPInput from '@/components/input/OTPInput';
import { useCountDown } from '@/hooks/useCountDown';
import { cn } from '@/lib/utils';
import { WarningCircleIcon } from '@phosphor-icons/react';
import { useState } from 'react';
import { useFormState, useWatch, type Control, type FieldValues, type Path } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import type { SelectOption } from '../select/AppSelect';
import { Button } from '../ui/button';
import FormInput from './FormInput';
import FormSelect from './FormSelect';

type FormPhoneProps<T extends FieldValues> = {
  control: Control<T>;
  namePrefix: Path<T>;
  namePhone1: Path<T>;
  namePhone2: Path<T>;
  label: string;
  phoneOptions?: SelectOption[];
  placeholderSelect?: string;
  required?: boolean;
  showVerifyButton?: boolean;
  hideVerifyButton?: boolean;
  onSendCode?: () => Promise<boolean | void> | boolean | void;
  onOtpVerify?: (otp: string) => Promise<void> | void;
  isSendingCode?: boolean;
  isVerifying?: boolean;
  isVerified?: boolean;
  containerClassName?: string;
  labelClassName?: string;
};

const FormPhone = <T extends FieldValues>({
  control,
  namePrefix,
  namePhone1,
  namePhone2,
  label,
  phoneOptions,
  placeholderSelect,
  required,
  showVerifyButton = true,
  hideVerifyButton = false,
  onSendCode,
  onOtpVerify,
  isSendingCode,
  isVerifying,
  isVerified,
  containerClassName,
  labelClassName,
}: FormPhoneProps<T>) => {
  const { t: tCommon } = useTranslation('common');
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const [otp, setOtp] = useState('');
  const isOtpActive = isOtpModalOpen && !isVerified;
  const { seconds, reset, isExpired } = useCountDown(180, undefined, isOtpActive);
  const minutes = Math.floor(seconds / 60);
  const remainSeconds = seconds % 60;
  const [phonePrefix, phoneBody, phoneTail] = useWatch({
    control,
    name: [namePrefix, namePhone1, namePhone2],
  });
  const phoneNumber = [phonePrefix, phoneBody, phoneTail].filter(Boolean).join('-');
  // const {
  //   formState: { errors },
  // } = useFormContext();

  const { errors } = useFormState({
    control,
  });

  const handleSendCode = async () => {
    if (!onSendCode || isSendingCode) return;

    const shouldOpenModal = await onSendCode();
    if (shouldOpenModal === false) return;

    setOtp('');
    reset();
    setIsOtpModalOpen(true);
  };

  const handleVerifyOtp = async () => {
    if (!onOtpVerify || isVerifying || otp.length < 6) return;

    await onOtpVerify(otp);
  };

  const verifyButtonText = isVerified ? tCommon('title.verification_completed') : tCommon('title.send_verification_code');
  const error = (errors[namePrefix]?.message || errors[namePhone1]?.message || errors[namePhone2]?.message) as string | undefined;

  return (
    <>
      <div className={cn('w-full space-y-1.5 md:flex md:items-start md:gap-4', containerClassName)}>
        {label && (
          <div className='flex items-center justify-between'>
            <div className={cn('flex items-center gap-0.5 md:w-24', labelClassName)}>
              <label className='text-sm font-medium text-neutral-500'>{label}</label>
              {required && <p className='bg-danger size-1 rounded-full'></p>}
            </div>
            <div className={cn('block md:hidden', hideVerifyButton && 'hidden')}>
              {showVerifyButton && (
                <Button
                  variant='outline'
                  size='xs'
                  className='h-7 px-2 text-xs'
                  onClick={handleSendCode}
                  loading={isSendingCode}
                  disabled={isSendingCode || isVerified}>
                  {verifyButtonText}
                </Button>
              )}
            </div>
          </div>
        )}

        <div className='flex-1 space-y-1.5'>
          <div className='flex w-full items-center gap-2'>
            {phoneOptions ? (
              <FormSelect
                control={control}
                name={namePrefix}
                options={phoneOptions}
                placeholder={placeholderSelect}
                containerClassName='flex-1'
                hideError
              />
            ) : (
              <FormInput control={control} name={namePrefix} maxLength={4} numericOnly containerClassName='flex-1' hideError />
            )}
            <p className='text-sm text-neutral-500'>-</p>
            <FormInput control={control} name={namePhone1} maxLength={4} numericOnly containerClassName='flex-1' hideError />
            <p className='text-sm text-neutral-500'>-</p>
            <FormInput control={control} name={namePhone2} maxLength={4} numericOnly containerClassName='flex-1' hideError />
            <div className={cn('hidden w-27 md:block', hideVerifyButton && 'md:hidden')}>
              {showVerifyButton && (
                <Button
                  variant='outline'
                  className='w-full'
                  onClick={handleSendCode}
                  loading={isSendingCode}
                  disabled={isSendingCode || isVerified}>
                  {verifyButtonText}
                </Button>
              )}
            </div>
          </div>
          {error && (
            <p className={cn('text-danger flex items-center gap-1 text-xs')}>
              <WarningCircleIcon className='text-danger size-4' weight='fill' />
              {error}
            </p>
          )}
        </div>
      </div>

      <AppDialog
        open={isOtpActive}
        onOpenChange={setIsOtpModalOpen}
        title={tCommon('title.enter_verification_code')}
        confirmText={tCommon('button.check')}
        isConfirming={isVerifying}
        onConfirm={handleVerifyOtp}
        contentClassName='border-y-0'>
        <section className='flex flex-col items-center space-y-3 md:space-y-4'>
          <div className='space-y-2 text-center'>
            <p className='text-xl font-bold'>
              {phoneNumber}
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
          <Button
            type='button'
            variant='ghost'
            size='xs'
            className='h-auto px-0 py-0 text-sm underline underline-offset-2'
            onClick={handleSendCode}
            loading={isSendingCode}
            disabled={!isExpired || isSendingCode}>
            {tCommon('title.did_not_receive_verification_code')}
          </Button>
        </section>
      </AppDialog>
    </>
  );
};

export default FormPhone;
