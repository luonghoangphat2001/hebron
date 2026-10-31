import FormAddress from '@/components/form/FormAddress';
import FormEmail from '@/components/form/FormEmail';
import FormInput from '@/components/form/FormInput';
import FormPhone from '@/components/form/FormPhone';
import FormUpload from '@/components/form/FormUpload';
import { appToast } from '@/components/toast/AppToast';
import { Button } from '@/components/ui/button';
import { useRegisterMutation, useSendCodeMutation, useVerifyCodeMutation } from '@/data/auth/auth.query';
import { transformInputToRegisterFormData } from '@/data/auth/auth.service';
import type { RegisterInput } from '@/schemas/auth/auth.schema';
import { EMAIL_DOMAIN_OPTIONS, RECAPTCHA_SITE_KEY } from '@/utils/constants/common.constant';
import { MY_ROUTE } from '@/utils/constants/route.constant';
import { MemberType, VerifyCodePurpose, VerifyCodeType } from '@/utils/enums/common.enum';
import { CaretLeftIcon } from '@phosphor-icons/react';
import { useState } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';
import { Controller, useFormContext, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

type RegisterFormProps = {
  backFirstStep: () => void;
};

const RegisterForm = ({ backFirstStep }: RegisterFormProps) => {
  const { t: tCommon } = useTranslation('common');
  const { t: tValidation } = useTranslation('validation');
  const navigate = useNavigate();
  const { control, setValue, watch, handleSubmit } = useFormContext<RegisterInput>();

  const memberTypeWatch = watch('memberType');
  const [verifiedPhone, setVerifiedPhone] = useState('');

  const [cellPhoneHead, cellPhoneBody, cellPhoneTail] = useWatch({
    control,
    name: ['cellPhoneHead', 'cellPhoneBody', 'cellPhoneTail'],
  });

  const fullPhone = `${cellPhoneHead}${cellPhoneBody}${cellPhoneTail}`;
  const isPhoneVerified = verifiedPhone === fullPhone;

  //api send code
  const { mutate: sendCode, isPending: isSending } = useSendCodeMutation();
  //api verify code
  const { mutate: verifyCode, isPending: isVerifying } = useVerifyCodeMutation();
  //api register
  const { mutate: mutateRegister, isPending } = useRegisterMutation();

  const handleSendCode = () => {
    if (isSending) return false;

    if (!cellPhoneHead || !cellPhoneBody || !cellPhoneTail) {
      appToast.error(tValidation('required', { field: tCommon('title.cell_phone') }));
      return false;
    }
    sendCode(
      {
        mobile: fullPhone,
        purpose: VerifyCodePurpose.REGISTER,
        type: VerifyCodeType.MOBILE,
      },
      {
        onSuccess: () => {
          setVerifiedPhone('');
          appToast.success(tCommon('notify.otp_code_sent'));
        },
        onError: (error) => {
          appToast.error(error.response?.data.message || tCommon('notify.otp_code_send_failed'));
        },
      },
    );
    return true;
  };

  const handleVerifyOtp = (otp: string) => {
    if (isVerifying) return;

    verifyCode(
      {
        mobile: fullPhone,
        purpose: VerifyCodePurpose.REGISTER,
        type: VerifyCodeType.MOBILE,
        code: otp,
      },
      {
        onSuccess: () => {
          setVerifiedPhone(fullPhone);
          appToast.success(tCommon('notify.verify_success'));
        },
        onError: (error) => {
          appToast.error(error.response?.data.message || tCommon('notify.verify_failed'));
        },
      },
    );
  };

  const onRegister = (input: RegisterInput) => {
    if (isPending) return;
    const formData = transformInputToRegisterFormData(input);

    mutateRegister(formData, {
      onSuccess: () => {
        appToast.success(tCommon('notify.register_success'));
        navigate(MY_ROUTE.LOGIN);
      },
      onError: (error) => {
        appToast.error(error.response?.data.message ?? tCommon('notify.register_failed'));
      },
    });
  };

  return (
    <section className='py-6 md:py-12'>
      <div className='flex cursor-pointer items-center gap-5 hover:opacity-80' onClick={backFirstStep}>
        <CaretLeftIcon size={24} weight='bold' />
        <p className='md:text-display-xs text-xl font-bold'>
          {memberTypeWatch === MemberType.INDIVIDUAL
            ? tCommon('title.register_individual_member')
            : tCommon('title.register_business_member')}
        </p>
      </div>
      <div className='mx-auto mt-10 max-w-155 space-y-10 md:mt-0'>
        <p className='text-lg font-bold'>{tCommon('title.basic_info')}</p>
        <div className='-mt-4 space-y-4 md:mt-0'>
          <FormInput
            control={control}
            name='username'
            label={tCommon('title.username')}
            required
            placeholder={tCommon('title.username')}
          />
          <FormInput
            control={control}
            name='password'
            label={tCommon('title.password')}
            required
            placeholder={tCommon('title.password')}
            type='password'
            infoMessage={tCommon('title.password_rule')}
          />
          <FormInput
            control={control}
            name='confirmedPassword'
            label={tCommon('title.verify_password')}
            required
            placeholder={tCommon('title.verify_password')}
            type='password'
          />
          <FormInput
            control={control}
            name='name'
            label={tCommon('title.full_name')}
            required
            placeholder={tCommon('title.full_name')}
          />
          <FormPhone
            label={tCommon('title.cell_phone')}
            control={control}
            namePrefix='cellPhoneHead'
            namePhone1='cellPhoneBody'
            namePhone2='cellPhoneTail'
            required
            onSendCode={handleSendCode}
            onOtpVerify={handleVerifyOtp}
            isSendingCode={isSending}
            isVerifying={isVerifying}
            isVerified={isPhoneVerified}
          />
          <FormPhone
            label={tCommon('title.landline_phone')}
            control={control}
            namePrefix='landlinePhoneHead'
            namePhone1='landlinePhoneBody'
            namePhone2='landlinePhoneTail'
            showVerifyButton={false}
          />
          <FormAddress
            control={control}
            nameZipCode='zipCode'
            nameAddress='address'
            nameDetailAddress='detailedAddress'
            label={tCommon('title.address')}
            required
          />
          <FormEmail
            control={control}
            setValue={setValue}
            nameId='emailId'
            nameDomain='emailDomain'
            nameDomainSelect='emailDomainSelect'
            label={tCommon('title.email')}
            emailOptions={EMAIL_DOMAIN_OPTIONS}
          />
        </div>

        {memberTypeWatch === MemberType.BUSINESS && (
          <>
            <p className='text-lg font-bold'>{tCommon('title.company_info')}</p>
            <div className='space-y-4'>
              <FormInput
                control={control}
                name='bizRegNumber'
                label={tCommon('title.business_registration_number')}
                required
                placeholder={tCommon('title.business_registration_number')}
              />
              <FormInput
                control={control}
                name='companyName'
                label={tCommon('title.company_name')}
                required
                placeholder={tCommon('title.company_name')}
              />
              <FormInput
                control={control}
                name='ceoName'
                label={tCommon('title.representative_name')}
                required
                placeholder={tCommon('title.representative_name')}
              />
              <FormInput
                control={control}
                name='industry'
                label={tCommon('title.business_industry')}
                required
                placeholder={tCommon('title.business_industry')}
              />
              <FormInput
                control={control}
                name='bizType'
                label={tCommon('title.business_type')}
                required
                placeholder={tCommon('title.business_type')}
              />
              <FormAddress
                control={control}
                nameZipCode='bizZipCode'
                nameAddress='bizAddress'
                nameDetailAddress='bizDetailedAddress'
                label={tCommon('title.address')}
                required
              />
              <FormInput
                control={control}
                name='taxEmail'
                label={tCommon('title.tax_invoice_email')}
                required
                placeholder={tCommon('title.tax_invoice_email')}
              />
              <FormInput
                control={control}
                name='homepage'
                label={tCommon('title.website')}
                placeholder={tCommon('title.website')}
              />
              <FormUpload
                label={tCommon('title.business_registration_certificate')}
                control={control}
                name='bizCertificate'
                labelButton={tCommon('button.upload')}
                infoMessage={tCommon('title.upload_business_license_image_or_pdf')}
                required
                multiple={false}
                accept='image/*,application/pdf'
              />
            </div>
          </>
        )}

        <div className='-mt-6 flex justify-center'>
          <Controller
            control={control}
            name='recaptchaToken'
            render={({ field }) => (
              <ReCAPTCHA
                sitekey={RECAPTCHA_SITE_KEY}
                onChange={(token) => field.onChange(token ?? '')}
                onExpired={() => field.onChange('')}
                hl='ko'
              />
            )}
          />
        </div>

        <div className='mx-auto grid max-w-105 grid-cols-2 gap-4'>
          <Button
            variant='outline'
            disabled={isPending}
            onClick={() => {
              backFirstStep();
              window.scrollTo({
                top: 0,
                behavior: 'smooth',
              });
            }}>
            {tCommon('button.cancel')}
          </Button>
          <Button onClick={handleSubmit(onRegister)} loading={isPending} disabled={isPending}>
            {tCommon('button.sign_up')}
          </Button>
        </div>
      </div>
    </section>
  );
};

export default RegisterForm;
