import { appToast } from '@/components/toast/AppToast';
import { Typography } from '@/components/typography/Typography';
import { Spinner } from '@/components/ui/spinner';
import { useAuth } from '@/contexts/AuthContext';
import { useLogoutMutation } from '@/data/auth/auth.query';
import { cn } from '@/lib/utils';
import { MY_ROUTE } from '@/utils/constants/route.constant';
import { readRefreshToken } from '@/utils/helper/local-storagte.helper';
import { SignOutIcon } from '@phosphor-icons/react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

type MyPageLogoutButtonProps = {
  className?: string;
  onLoggedOut?: () => void;
};

const MyPageLogoutButton = ({ className, onLoggedOut }: MyPageLogoutButtonProps) => {
  const { t } = useTranslation('common');
  const { logout } = useAuth();
  const navigate = useNavigate();

  //api logout
  const { mutate: mutateLogout, isPending } = useLogoutMutation({
    onSuccess: () => {
      logout();
      onLoggedOut?.();
      navigate(MY_ROUTE.HOME);
    },
    onError: (error) => {
      appToast.error(error.response?.data.message || t('notify.something_went_wrong'));
    },
  });

  const handleLogout = () => {
    if (isPending) return;
    const refreshToken = readRefreshToken();
    if (!refreshToken) {
      logout();
      onLoggedOut?.();
      navigate(MY_ROUTE.HOME);
      return;
    }
    mutateLogout({ refresh_token: refreshToken });
  };

  return (
    <button
      type='button'
      onClick={handleLogout}
      disabled={isPending}
      className={cn(
        'text-danger hover:bg-danger/10 flex w-full cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-left transition-colors',
        className,
      )}>
      <SignOutIcon className='text-danger size-5 shrink-0' aria-hidden />
      <Typography as='span' variant='body-sm' className='text-danger'>
        {t('button.log_out')}
      </Typography>
      {isPending && <Spinner />}
    </button>
  );
};

export default MyPageLogoutButton;
