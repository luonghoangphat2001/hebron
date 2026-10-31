import type { AppDialogProps } from '@/components/dialog/AppDialog';
import AppDialog from '@/components/dialog/AppDialog';
import FormEmail from '@/components/form/FormEmail';
import FormInput from '@/components/form/FormInput';
import FormPhone from '@/components/form/FormPhone';
import FormRadioGroup from '@/components/form/FormRadioGroup';
import { appToast } from '@/components/toast/AppToast';
import { useFindIdMutation, useResetPasswordMutation, useSendCodeMutation, useVerifyCodeMutation } from '@/data/auth/auth.query';
import {
  findPasswordInputDefault,
  findPasswordSchema,
  resetPasswordInputDefault,
  resetPasswordSchema,
  type FindPasswordInput,
  type ResetPasswordInput,
} from '@/schemas/auth/auth.schema';
import { EMAIL_DOMAIN_OPTIONS, PHONE_OPTIONS } from '@/utils/constants/common.constant';
import { VerifyCodePurpose, VerifyCodeType } from '@/utils/enums/common.enum';
import { FindByType } from '@/utils/enums/login.enum';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { FormProvider, useForm, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import OTPVerification from './OTPVerification';
import ResultSection from './ResultSection';

type FindPasswordModalProps = Omit<AppDialogProps, 'children'>;

const FindPasswordModal = ({ open, onOpenChange, title, className }: FindPasswordModalProps) => {
  const { t: tCommon } = useTranslation('common');
  const { t: tValidation } = useTranslation('validation');
  const [step, setStep] = useState<'form' | 'change-password' | 'success' | 'fail'>('form');
  const [openOtpModal, setOpenOtpModal] = useState(false);
  const [code, setCode] = useState<string>();

  const options = [
    { value: FindByType.EMAIL, label: tCommon('title.find_id_by_email') },
    { value: FindByType.MOBILE, label: tCommon('title.find_id_by_mobile') },
  ];

  const form = useForm<FindPasswordInput>({
    mode: 'all',
    defaultValues: findPasswordInputDefault,
    resolver: zodResolver(findPasswordSchema(tCommon, tValidation)),
  });
  const { control, setValue, handleSubmit, getValues, reset } = form;
  const [findTypeWatch, cellphoneHead, cellphoneBody, cellphoneTail] = useWatch({
    control,
    name: ['findType', 'cellphoneHead', 'cellphoneBody', 'cellphoneTail'],
  });
  const formattedPhone = [cellphoneHead, cellphoneBody, cellphoneTail].filter(Boolean).join('-');
  const confirmText =
    step === 'success'
      ? tCommon('button.check')
      : step === 'change-password'
        ? tCommon('title.change_password')
        : tCommon('title.find_password');

  const resetPasswordForm = useForm<ResetPasswordInput>({
    mode: 'all',
    defaultValues: resetPasswordInputDefault,
    resolver: zodResolver(resetPasswordSchema(tCommon, tValidation)),
  });

  //api find id
  const { mutate: mutateFindId, isPending: isFinding } = useFindIdMutation({
    onSuccess: (resp) => {
      if (resp.data.username === getValues().id) {
        setStep('change-password');
      } else {
        appToast.error(tCommon('notify.something_went_wrong'));
      }
    },
    onError: (error) => {
      appToast.error(error.response?.data.message || tCommon('notify.something_went_wrong'));
    },
  });
  //api send code
  const { mutate: mutateSendCode, isPending: isSending } = useSendCodeMutation({
    onSuccess: () => {
      appToast.success(tCommon('notify.otp_code_sent'));
      setOpenOtpModal(true);
    },
    onError: (error) => {
      appToast.error(error.response?.data.message || tCommon('notify.otp_code_send_failed'));
    },
  });
  //api verify code
  const { mutate: mutateVerifyCode, isPending: isVerifying } = useVerifyCodeMutation({
    onSuccess: () => {
      setOpenOtpModal(false);
      mutateFindId({
        name: getValues().name,
        username: getValues().id,
        type: VerifyCodeType.MOBILE,
        mobile: formattedPhone,
        verification_code: code,
      });
    },
    onError: (error) => {
      appToast.error(error.response?.data.message || tCommon('notify.verify_failed'));
    },
  });
  //api reset password
  const { mutate: resetPassword, isPending: isResettingPassword } = useResetPasswordMutation({
    onSuccess: () => {
      setStep('success');
    },
    onError: () => {
      setStep('fail');
    },
  });

  const isSubmitting = isFinding || isSending || isVerifying || isResettingPassword;

  const handleSendCode = () => {
    if (isSending) return;
    mutateSendCode({
      name: getValues().name,
      username: getValues().id,
      type: VerifyCodeType.MOBILE,
      purpose: VerifyCodePurpose.RESET_PASSWORD,
      mobile: formattedPhone,
    });
  };

  const handleVerifyOtp = (otp: string) => {
    setCode(otp);

    mutateVerifyCode({
      type: VerifyCodeType.MOBILE,
      purpose: VerifyCodePurpose.RESET_PASSWORD,
      mobile: formattedPhone,
      code: otp,
    });
  };

  const onResetPasswordSubmit = (input: ResetPasswordInput) => {
    if (isResettingPassword) return;

    const formData = getValues();
    resetPassword({
      username: formData.id,
      name: formData.name,
      type: formData.findType,
      email: formData.findType === VerifyCodeType.EMAIL ? `${formData.emailId}@${formData.emailDomain}` : undefined,
      mobile: formData.findType === VerifyCodeType.MOBILE ? `${cellphoneHead}${cellphoneBody}${cellphoneTail}` : undefined,
      verification_code: formData.findType === VerifyCodeType.MOBILE ? code : undefined,
      password: input.password,
      password_confirmation: input.confirmedPassword,
    });
  };

  const onSubmit = (input: FindPasswordInput) => {
    if (input.findType === VerifyCodeType.MOBILE) {
      handleSendCode();
      return;
    }

    mutateFindId({
      name: input.name,
      username: input.id,
      type: VerifyCodeType.EMAIL,
      email: `${input.emailId}@${input.emailDomain}`,
    });
  };

  const handleConfirm = () => {
    switch (step) {
      case 'form':
        return handleSubmit(onSubmit)();
      // case 'otp':
      //   return setStep('change-password');
      case 'change-password':
        return resetPasswordForm.handleSubmit(onResetPasswordSubmit)();
      case 'fail':
        return setStep('form');
      default:
        return onOpenChange(false);
    }
  };

  useEffect(() => {
    if (open) {
      reset(findPasswordInputDefault);
      resetPasswordForm.reset(resetPasswordInputDefault);
      queueMicrotask(() => {
        setStep('form');
      });
    }
  }, [open, reset, resetPasswordForm]);

  return (
    <AppDialog
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      className={className}
      onConfirm={handleConfirm}
      isConfirming={isSubmitting}
      confirmText={confirmText}>
      <>
        <FormProvider {...form}>
          {step === 'form' && (
            <div className='space-y-6 md:space-y-10'>
              <FormRadioGroup control={control} name='findType' options={options} />
              <div className='space-y-4'>
                {findTypeWatch === VerifyCodeType.EMAIL && (
                  <>
                    <FormInput
                      control={control}
                      name='name'
                      label={tCommon('title.full_name')}
                      required
                      placeholder={tCommon('title.full_name')}
                      containerClassName='md:gap-12'
                    />
                    <FormInput
                      control={control}
                      name='id'
                      label={tCommon('title.username')}
                      required
                      placeholder={tCommon('title.username')}
                      containerClassName='md:gap-12'
                    />
                    <FormEmail
                      control={control}
                      setValue={setValue}
                      nameId='emailId'
                      nameDomain='emailDomain'
                      nameDomainSelect='emailDomainSelect'
                      label={tCommon('title.email')}
                      required
                      emailOptions={EMAIL_DOMAIN_OPTIONS}
                      containerClassName='md:gap-12'
                    />
                  </>
                )}
                {findTypeWatch === VerifyCodeType.MOBILE && (
                  <>
                    <FormInput
                      control={control}
                      name='name'
                      label={tCommon('title.full_name')}
                      required
                      placeholder={tCommon('title.full_name')}
                      containerClassName='md:gap-12'
                    />
                    <FormInput
                      control={control}
                      name='id'
                      label={tCommon('title.username')}
                      required
                      placeholder={tCommon('title.username')}
                      containerClassName='md:gap-12'
                    />
                    <FormPhone
                      label={tCommon('title.cell_phone')}
                      control={control}
                      phoneOptions={PHONE_OPTIONS}
                      namePrefix='cellphoneHead'
                      namePhone1='cellphoneBody'
                      namePhone2='cellphoneTail'
                      required
                      hideVerifyButton
                      containerClassName='md:gap-12'
                    />
                  </>
                )}
              </div>
            </div>
          )}
        </FormProvider>
        {step === 'change-password' && (
          <FormProvider {...resetPasswordForm}>
            <div className='space-y-4'>
              <FormInput
                control={resetPasswordForm.control}
                name='password'
                label={tCommon('title.password')}
                required
                placeholder={tCommon('title.password')}
                infoMessage={tCommon('title.password_rule')}
                type='password'
              />
              <FormInput
                control={resetPasswordForm.control}
                name='confirmedPassword'
                label={tCommon('title.verify_password')}
                required
                placeholder={tCommon('title.verify_password')}
                type='password'
              />
            </div>
          </FormProvider>
        )}
        {(step === 'success' || step === 'fail') && (
          <ResultSection
            isSuccess={step === 'success'}
            title={step === 'success' ? tCommon('title.password_changed_successfully') : tCommon('title.password_change_failed')}>
            {step === 'success' ? (
              <p className='mt-1.5 text-center text-sm text-neutral-500'>{tCommon('title.please_log_in_again')}</p>
            ) : (
              <p className='mt-1.5 text-center text-sm text-neutral-500'>{tCommon('title.please_try_again')}</p>
            )}
          </ResultSection>
        )}
        {openOtpModal && (
          <OTPVerification
            open={openOtpModal}
            onOpenChange={setOpenOtpModal}
            phone={formattedPhone}
            onVerify={handleVerifyOtp}
            onResend={handleSendCode}
            isVerifying={isVerifying}
          />
        )}
      </>
    </AppDialog>
  );
};

export default FindPasswordModal;
