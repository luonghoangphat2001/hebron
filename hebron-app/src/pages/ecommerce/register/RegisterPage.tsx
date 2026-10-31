import { AppCheckbox } from '@/components/checkbox/AppCheckbox';
import FormCheckbox from '@/components/form/FormCheckbox';
import { Button } from '@/components/ui/button';
import { registerInputDefault, registerSchema, type RegisterInput } from '@/schemas/auth/auth.schema';
import { MY_ROUTE } from '@/utils/constants/route.constant';
import { MemberType } from '@/utils/enums/common.enum';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { FormProvider, useForm, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import RegisterForm from './components/RegisterForm';
import RoleModeCard from './components/RoleModeCard';

const lorem =
  '로렘 입숨 돌로르 시트 아멧 컨섹튜르. 코모도 네크 펠렌테스케 아멧 세드 모르비 알리캄. 마우리스 오르나레 풀비나르 놀라 아 펠렌테스케 퀴스 마싸 벨셈퍼.';

const RegisterPage = () => {
  const { t: tValidation } = useTranslation('validation');
  const { t: tCommon } = useTranslation('common');
  const navigate = useNavigate();
  const [step, setStep] = useState(1);

  const TERMS = [
    { id: 'termOfService', label: tCommon('title.terms_of_service_required') },
    { id: 'privacyPolicy', label: tCommon('title.privacy_policy_required') },
    { id: 'smsReception', label: tCommon('title.sms_marketing_consent_optional') },
    { id: 'emailReception', label: tCommon('title.email_marketing_consent_optional') },
  ] as const;

  //hook form
  const form = useForm<RegisterInput>({
    mode: 'all',
    defaultValues: registerInputDefault,
    resolver: zodResolver(registerSchema(tCommon, tValidation)),
  });
  const { control, setValue, clearErrors } = form;

  const memberType = useWatch({ control, name: 'memberType' });
  const [termOfService, privacyPolicy, smsReception, emailReception] = useWatch({
    control,
    name: ['termOfService', 'privacyPolicy', 'smsReception', 'emailReception'],
  });

  const allChecked = termOfService && privacyPolicy && smsReception && emailReception;
  const hasRequiredTermsChecked = termOfService && privacyPolicy;
  const canProceedToStepTwo = hasRequiredTermsChecked;

  const handleToggleAll = (checked: boolean) => {
    setValue('termOfService', checked);
    setValue('privacyPolicy', checked);
    setValue('smsReception', checked);
    setValue('emailReception', checked);
  };

  const backFirstStep = () => {
    setStep(1);
  };

  const toLoginForm = () => {
    if (!canProceedToStepTwo) return;
    setStep(2);
    clearErrors();
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  const backToLogin = () => {
    navigate(MY_ROUTE.LOGIN);
  };

  return (
    <FormProvider {...form}>
      {step === 1 && (
        <section className='mx-auto max-w-105 space-y-10 py-6 md:py-12'>
          <h2 className='text-display-xs md:text-display-sm font-bold'>{tCommon('title.join_membership')}</h2>
          <div className='grid grid-cols-2 gap-2'>
            <RoleModeCard
              role={MemberType.INDIVIDUAL}
              isActive={memberType === MemberType.INDIVIDUAL}
              onClick={() => setValue('memberType', MemberType.INDIVIDUAL)}
            />
            <RoleModeCard
              role={MemberType.BUSINESS}
              isActive={memberType === MemberType.BUSINESS}
              onClick={() => setValue('memberType', MemberType.BUSINESS)}
            />
          </div>

          <div>
            <p className='mb-4 text-lg font-semibold'>{tCommon('title.term_of_use')}</p>
            <AppCheckbox
              label={tCommon('title.agree_to_all')}
              className='size-5'
              checked={allChecked}
              onCheckedChange={handleToggleAll}
            />
            <div className='mt-3 space-y-6 rounded-lg border border-neutral-200 p-4'>
              {TERMS.map((term) => (
                <div key={term.id} className='space-y-3'>
                  <FormCheckbox control={control} name={term.id} label={term.label} labelClassName='text-sm' className='size-4' />
                  <div className='custom-scrollbar max-h-36 overflow-y-auto rounded-lg bg-neutral-100 p-3 text-sm'>
                    {lorem.repeat(4)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className='grid grid-cols-2 gap-4'>
            <Button variant='outline' onClick={backToLogin}>
              {tCommon('button.cancel')}
            </Button>
            <Button disabled={!canProceedToStepTwo} onClick={toLoginForm}>
              {tCommon('button.sign_up')}
            </Button>
          </div>
        </section>
      )}
      {step === 2 && <RegisterForm backFirstStep={backFirstStep} />}
    </FormProvider>
  );
};

export default RegisterPage;
