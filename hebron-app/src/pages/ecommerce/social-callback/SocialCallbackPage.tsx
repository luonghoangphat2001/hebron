import { Spinner } from '@/components/ui/spinner';
import { appToast } from '@/components/toast/AppToast';
import { useAuth } from '@/contexts/AuthContext';
import { useSocialLoginMutation } from '@/data/auth/auth.query';
import { MY_ROUTE } from '@/utils/constants/route.constant';
import { SocialProvider } from '@/utils/enums/common.enum';
import type { ErrorRESP } from '@/utils/types/response.type';
import type { AxiosError } from 'axios';
import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';

const isSocialProvider = (provider?: string): provider is SocialProvider =>
  Object.values(SocialProvider).includes(provider as SocialProvider);

const SocialCallbackPage = () => {
  const { t: tCommon } = useTranslation('common');
  const { login } = useAuth();
  const navigate = useNavigate();
  const { provider } = useParams<{ provider: string }>();
  const [searchParams] = useSearchParams();
  const code = searchParams.get('code');
  const processedCallback = useRef<string | null>(null);
  const { mutate: mutateSocialLogin, isPending } = useSocialLoginMutation();

  useEffect(() => {
    const callbackKey = `${provider ?? ''}:${code ?? ''}`;
    if (processedCallback.current === callbackKey) return;

    processedCallback.current = callbackKey;

    if (!isSocialProvider(provider) || !code) {
      appToast.error(tCommon('notify.social_login_callback_invalid'));
      navigate(MY_ROUTE.LOGIN, { replace: true });
      return;
    }

    mutateSocialLogin(
      { provider, code },
      {
        onSuccess: async ({ data }) => {
          try {
            await login({ accessToken: data.access_token, refreshToken: data.refresh_token });
            navigate(MY_ROUTE.HOME, { replace: true });
          } catch (error) {
            const axiosError = error as AxiosError<ErrorRESP>;
            appToast.error(axiosError.response?.data?.message || tCommon('notify.social_login_failed'));
            navigate(MY_ROUTE.LOGIN, { replace: true });
          }
        },
        onError: (error) => {
          appToast.error(error.response?.data?.message || tCommon('notify.social_login_failed'));
          navigate(MY_ROUTE.LOGIN, { replace: true });
        },
      },
    );
  }, [code, login, mutateSocialLogin, navigate, provider, tCommon]);

  return (
    <div className='flex min-h-80 flex-col items-center justify-center gap-3 text-center' aria-busy={isPending}>
      <Spinner className='size-8 text-neutral-500' />
      <p className='text-sm text-neutral-600'>{tCommon('title.social_login_processing')}</p>
    </div>
  );
};

export default SocialCallbackPage;
