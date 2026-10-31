import { Logo } from '@/assets/images';
import FormItem from '@/components/form/FormItem';
import { appToast } from '@/components/toast/AppToast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Field, FieldGroup } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { adminAPI } from '@/data/admin/admin.api';
import { ADMIN_QUERY_KEYS } from '@/data/admin/admin.query';
import { useLoginMutation } from '@/data/auth/auth.query';
import { loginSchema, type LoginInput } from '@/schemas/auth/auth.schema';
import { MY_ROUTE } from '@/utils/constants/route.constant';
import { firstMenuPath } from '@/utils/helper/permission.helper';
import { saveInfoToStorage } from '@/utils/helper/local-storagte.helper';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { t: tCommon } = useTranslation('common');

  const goToLandingPage = async () => {
    try {
      const me = await queryClient.fetchQuery({
        queryKey: [ADMIN_QUERY_KEYS.ME_PERMISSIONS],
        queryFn: adminAPI.myPermissions,
      });
      navigate(firstMenuPath(me.data.permissions) || MY_ROUTE.DASHBOARD.INDEX);
    } catch {
      navigate(MY_ROUTE.DASHBOARD.INDEX);
    }
  };

  //hook form
  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<LoginInput>({
    mode: 'all',
    defaultValues: {
      username: '',
      password: '',
    },
    resolver: zodResolver(loginSchema),
  });

  //api login
  const { mutate: mutateLogin, isPending } = useLoginMutation({
    onSuccess: (resp) => {
      const data = resp.data;
      if (data.user.is_normal_user) {
        appToast.error(tCommon('notify.something_went_wrong'));
        return;
      }

      saveInfoToStorage({ accessToken: data.access_token, refreshToken: data.refresh_token, userInfo: data.user });
      goToLandingPage();
    },
    onError: (error) => {
      appToast.error(error.response?.data.message || tCommon('notify.something_went_wrong'));
    },
  });

  const onSubmit = (input: LoginInput) => {
    if (isPending) return;

    mutateLogin({
      username: input.username,
      password: input.password,
    });
  };

  return (
    <div className='bg-muted flex min-h-svh items-center justify-center'>
      <div className='w-full max-w-sm'>
        <Card>
          <CardHeader className='my-2 flex justify-center'>
            <img src={Logo} alt='logo' className='' />
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)}>
              <FieldGroup>
                <FormItem label={tCommon('title.username')} error={errors.username?.message}>
                  <Controller
                    control={control}
                    name='username'
                    render={({ field, fieldState }) => (
                      <Input
                        {...field}
                        id={tCommon('title.username')}
                        placeholder={tCommon('placeholder.enter_username')}
                        aria-invalid={fieldState.invalid}
                      />
                    )}
                  />
                </FormItem>
                <FormItem label={tCommon('title.password')} error={errors.password?.message}>
                  <Controller
                    control={control}
                    name='password'
                    render={({ field, fieldState }) => (
                      <Input
                        {...field}
                        id={tCommon('title.password')}
                        type='password'
                        placeholder={tCommon('placeholder.enter_password')}
                        aria-invalid={fieldState.invalid}
                      />
                    )}
                  />
                </FormItem>
                <Field>
                  <Button type='submit' loading={isPending} disabled={isPending}>
                    {tCommon('button.log_in')}
                  </Button>
                </Field>
              </FieldGroup>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;
