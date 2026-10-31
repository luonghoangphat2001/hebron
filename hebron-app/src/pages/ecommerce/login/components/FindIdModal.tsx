import type { AppDialogProps } from '@/components/dialog/AppDialog';
import AppDialog from '@/components/dialog/AppDialog';
import FormEmail from '@/components/form/FormEmail';
import FormInput from '@/components/form/FormInput';
import FormPhone from '@/components/form/FormPhone';
import FormRadioGroup from '@/components/form/FormRadioGroup';
import WarningNote from '@/components/note/WarningNote';
import { appToast } from '@/components/toast/AppToast';
import { useFindIdMutation, useSendCodeMutation, useVerifyCodeMutation } from '@/data/auth/auth.query';
import type { FindIdRESP } from '@/data/auth/auth.response';
import { findIdInputDefault, findIdSchema, type FindIdInput } from '@/schemas/auth/auth.schema';
import { EMAIL_DOMAIN_OPTIONS, PHONE_OPTIONS } from '@/utils/constants/common.constant';
import { VerifyCodePurpose, VerifyCodeType } from '@/utils/enums/common.enum';
import { FindByType } from '@/utils/enums/login.enum';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { FormProvider, useForm, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import OTPVerification from './OTPVerification';
import ResultSection from './ResultSection';

type FindIdModalProps = Omit<AppDialogProps, 'children'> & {
  onOpenFindPasswordMoal: (value: boolean) => void;
};

const FindIdModal = ({ open, onOpenChange, title, className, onOpenFindPasswordMoal }: FindIdModalProps) => {
  const { t: tCommon } = useTranslation('common');
  const { t: tValidation } = useTranslation('validation');
  const [step, setStep] = useState<'form' | 'success' | 'fail'>('form');
  const [findIdData, setFindIdData] = useState<FindIdRESP | null>(null);
  const [openOtpModal, setOpenOtpModal] = useState(false);
  const [code, setCode] = useState<string>();

  const options = [
    { value: FindByType.EMAIL, label: tCommon('title.find_id_by_email') },
    { value: FindByType.MOBILE, label: tCommon('title.find_id_by_mobile') },
    { value: FindByType.BUSINESS, label: tCommon('title.find_id_by_business_number') },
  ];

  //hook form
  const form = useForm<FindIdInput>({
    mode: 'all',
    defaultValues: findIdInputDefault,
    resolver: zodResolver(findIdSchema(tCommon, tValidation)),
  });
  const { control, setValue, handleSubmit, reset, getValues } = form;
  const [findTypeWatch, cellphoneHead, cellphoneBody, cellphoneTail] = useWatch({
    control,
    name: ['findType', 'cellphoneHead', 'cellphoneBody', 'cellphoneTail'],
  });
  const formattedPhone = [cellphoneHead, cellphoneBody, cellphoneTail].filter(Boolean).join('-');

  //api find id
  const { mutate: mutateFindId, isPending: isFinding } = useFindIdMutation({
    onSuccess: (resp) => {
      const data = resp.data;
      setFindIdData(data);
      setStep('success');
    },
    onError: (_error) => {
      setStep('fail');
      // appToast.error(error.response?.data.message || tCommon('notify.something_went_wrong'));
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
      const input = getValues();
      mutateFindId({
        name: input.name,
        type: VerifyCodeType.MOBILE,
        mobile: formattedPhone,
        verification_code: code,
      });
    },
    onError: (error) => {
      appToast.error(error.response?.data.message || tCommon('notify.verify_failed'));
    },
  });

  const isSubmitting = isFinding || isSending || isVerifying;
  const confirmText =
    step === 'success'
      ? tCommon('title.find_password')
      : step === 'fail'
        ? tCommon('title.try_again')
        : tCommon('title.find_id_title');

  const handleSendCode = () => {
    if (isSending) return;
    mutateSendCode({
      name: getValues().name,
      type: VerifyCodeType.MOBILE,
      purpose: VerifyCodePurpose.FIND_ID,
      mobile: formattedPhone,
    });
  };

  const handleVerifyOtp = (otp: string) => {
    setCode(otp);

    mutateVerifyCode({
      type: VerifyCodeType.MOBILE,
      purpose: VerifyCodePurpose.FIND_ID,
      mobile: formattedPhone,
      code: otp,
    });
  };

  const onSubmit = (input: FindIdInput) => {
    if (isSubmitting) return;

    //mode mobile with OTP
    if (input.findType === VerifyCodeType.MOBILE) {
      handleSendCode();
      return;
    }

    //mode business number
    if (input.findType === VerifyCodeType.BUSINESS) {
      mutateFindId({
        type: VerifyCodeType.BUSINESS,
        company_name: input.company_name,
        business_registration_number: input.business_registration_number,
      });
      return;
    }

    //mode email
    mutateFindId({
      name: input.name,
      type: VerifyCodeType.EMAIL,
      email: `${input.emailId}@${input.emailDomain}`,
    });
  };

  const handleConfirm = () => {
    switch (step) {
      case 'form':
        return handleSubmit(onSubmit)();

      case 'success':
        onOpenChange(false);
        onOpenFindPasswordMoal(true);
        return;

      default:
        return setStep('form');
    }
  };

  useEffect(() => {
    if (open) {
      reset(findIdInputDefault);
      queueMicrotask(() => {
        setStep('form');
      });
    }
  }, [open, reset]);

  return (
    <>
      <AppDialog
        open={open}
        onOpenChange={onOpenChange}
        title={title}
        className={className}
        onConfirm={handleConfirm}
        closeOnInteractOutside={false}
        isConfirming={isSubmitting}
        confirmText={confirmText}>
        <FormProvider {...form}>
          {step === 'form' ? (
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
                    <FormPhone
                      label={tCommon('title.phone_number')}
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
                {findTypeWatch === VerifyCodeType.BUSINESS && (
                  <>
                    <FormInput
                      control={control}
                      name='company_name'
                      label={tCommon('title.company_name')}
                      required
                      placeholder={tCommon('title.company_name')}
                      containerClassName='md:gap-12'
                    />
                    <FormInput
                      control={control}
                      name='business_registration_number'
                      label={tCommon('title.business_registration_number')}
                      required
                      placeholder={tCommon('title.business_registration_number')}
                      containerClassName='md:gap-12'
                    />
                  </>
                )}
              </div>
              <WarningNote
                title={tCommon('title.account_recovery_notice_title')}
                description={tCommon('title.account_recovery_notice_description')}
              />
            </div>
          ) : (
            <ResultSection isSuccess={step === 'success'} title={tCommon('title.find_username_result')}>
              {step === 'success' ? (
                <div className='mt-6 w-full rounded-lg border border-neutral-200 bg-neutral-100 p-4 md:mt-10'>
                  <div className='flex items-center justify-between'>
                    <p className='text-sm'>{tCommon('title.username')}</p>
                    <p className='text-md font-bold md:text-lg'>{findIdData?.username}</p>
                  </div>
                  <div className='flex items-center justify-between'>
                    <p className='text-sm'>{tCommon('title.registration_date')}</p>
                    <p className='text-md font-bold md:text-lg'>{findIdData?.created_at}</p>
                  </div>
                </div>
              ) : (
                <div className='mt-6 w-full rounded-lg border border-neutral-200 bg-neutral-100 p-4 md:mt-10'>
                  <p className='text-center text-neutral-500'>{tCommon('title.no_matching_username_found')}</p>
                </div>
              )}
            </ResultSection>
          )}
        </FormProvider>
      </AppDialog>
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
  );
};

export default FindIdModal;
