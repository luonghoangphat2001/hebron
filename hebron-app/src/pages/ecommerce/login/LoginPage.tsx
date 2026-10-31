import { Kakaotalk, Naver } from '@/assets/svgs';
import { AppCheckbox } from '@/components/checkbox/AppCheckbox';
import FormInput from '@/components/form/FormInput';
import { appToast } from '@/components/toast/AppToast';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useLoginMutation, useSocialRedirectMutation } from '@/data/auth/auth.query';
import { loginInputDefault, loginSchema, type LoginInput } from '@/schemas/auth/auth.schema';
import { CALL_BACK_URL } from '@/utils/constants/common.constant';
import { MY_ROUTE } from '@/utils/constants/route.constant';
import { SocialProvider } from '@/utils/enums/common.enum';
import type { ErrorRESP } from '@/utils/types/response.type';
import { zodResolver } from '@hookform/resolvers/zod';
import type { AxiosError } from 'axios';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import FindIdModal from './components/FindIdModal';
import FindPasswordModal from './components/FindPasswordModal';

const LoginPage = () => {
  const { t: tCommon } = useTranslation('common');
  const { t: tValidation } = useTranslation('validation');
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [openFindIdModal, setOpenFindIdModal] = useState(false);
  const [openFindPasswordModal, setOpenFindPasswordModal] = useState(false);
  const [socialProviderLoading, setSocialProviderLoading] = useState<SocialProvider | null>(null);

  //hook form
  const { control, handleSubmit } = useForm<LoginInput>({
    mode: 'all',
    defaultValues: loginInputDefault,
    resolver: zodResolver(loginSchema(tCommon, tValidation)),
  });

  //api login
  const { mutate: mutateLogin, isPending } = useLoginMutation();
  const { mutate: mutateSocialRedirect, isPending: isSocialRedirectPending } = useSocialRedirectMutation();

  const toRegisterPage = () => {
    navigate(MY_ROUTE.REGISTER);
  };

  const onLogin = (input: LoginInput) => {
    if (isPending) return;

    mutateLogin(
      {
        username: input.username,
        password: input.password,
      },
      {
        onSuccess: async (resp) => {
          const data = resp.data;

          try {
            await login({ accessToken: data.access_token, refreshToken: data.refresh_token });
            const callbackUrl = location.state?.[CALL_BACK_URL];
            navigate(typeof callbackUrl === 'string' ? callbackUrl : MY_ROUTE.HOME);
          } catch (error) {
            const axiosError = error as AxiosError<ErrorRESP>;
            appToast.error(axiosError.response?.data?.message || tCommon('notify.login_failed'));
          }
        },
        onError: (error) => {
          appToast.error(error.response?.data.message || tCommon('notify.login_failed'));
        },
      },
    );
  };

  const onSocialLogin = (provider: SocialProvider) => {
    if (isSocialRedirectPending) return;

    setSocialProviderLoading(provider);
    mutateSocialRedirect(provider, {
      onSuccess: ({ data }) => {
        window.location.href = data.redirect_url;
      },
      onError: (error) => {
        setSocialProviderLoading(null);
        appToast.error(error.response?.data?.message || tCommon('notify.social_login_failed'));
      },
    });
  };

  return (
    <form onSubmit={handleSubmit(onLogin)} className='mx-auto max-w-105 space-y-10 py-6 md:py-12'>
      <h2 className='text-display-xs md:text-display-sm font-bold'>{tCommon('title.login')}</h2>
      <div className='space-y-4'>
        <FormInput
          control={control}
          name='username'
          label={tCommon('title.username')}
          required
          labelPlacement='top'
          placeholder={tCommon('title.username')}
        />
        <FormInput
          control={control}
          name='password'
          label={tCommon('title.password')}
          type='password'
          required
          labelPlacement='top'
          placeholder={tCommon('title.password')}
        />
        <div className='flex items-center justify-between'>
          <AppCheckbox label={tCommon('title.remember_username_password')} labelClassName='text-sm' />
          <span className='text-sm text-neutral-500'>
            <span className='cursor-pointer hover:font-semibold' onClick={() => setOpenFindPasswordModal(true)}>
              {tCommon('title.forgot_password')}
            </span>
            <span className='mx-2'>|</span>
            <span className='cursor-pointer hover:font-semibold' onClick={() => setOpenFindIdModal(true)}>
              {tCommon('title.find_id')}
            </span>
          </span>
        </div>
      </div>
      <div className='space-y-6'>
        <Button className='w-full' type='submit' loading={isPending} disabled={isPending}>
          {tCommon('title.login')}
        </Button>
        <div className='flex items-center gap-6'>
          <div className='h-px flex-1 bg-neutral-200' />
          <span className='text-sm text-neutral-500'>{tCommon('title.social_login')}</span>
          <div className='h-px flex-1 bg-neutral-200' />
        </div>
        <div className='-mt-3 grid grid-cols-2 gap-3'>
          <Button
            type='button'
            variant='outline'
            className='h-12 rounded-md font-normal text-neutral-950'
            loading={isSocialRedirectPending && socialProviderLoading === SocialProvider.KAKAO}
            disabled={isSocialRedirectPending}
            onClick={() => onSocialLogin(SocialProvider.KAKAO)}>
            <img src={Kakaotalk} alt='kakaotalk' className='size-6' />
            {tCommon('title.continue_with_kakao')}
          </Button>
          <Button
            type='button'
            variant='outline'
            className='h-12 rounded-md font-normal text-[#03C75A]'
            loading={isSocialRedirectPending && socialProviderLoading === SocialProvider.NAVER}
            disabled={isSocialRedirectPending}
            onClick={() => onSocialLogin(SocialProvider.NAVER)}>
            <img src={Naver} alt='naver' className='size-6' />
            {tCommon('title.continue_with_naver')}
          </Button>
        </div>
      </div>
      <div className='space-y-2'>
        <p className='text-center text-sm text-neutral-500'>{tCommon('title.first_time_here')}</p>
        <Button variant='outline' className='w-full' onClick={toRegisterPage}>
          {tCommon('title.sign_up')}
        </Button>
      </div>

      <FindIdModal
        open={openFindIdModal}
        onOpenChange={setOpenFindIdModal}
        onOpenFindPasswordMoal={setOpenFindPasswordModal}
        title={tCommon('title.find_id_title')}
      />
      <FindPasswordModal
        open={openFindPasswordModal}
        onOpenChange={setOpenFindPasswordModal}
        title={tCommon('title.find_password')}
      />
    </form>
  );
};

export default LoginPage;
