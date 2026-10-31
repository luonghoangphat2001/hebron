import { ChevronsUpDown, LogOut } from 'lucide-react';

import { appToast } from '@/components/toast/AppToast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from '@/components/ui/sidebar';
import { Spinner } from '@/components/ui/spinner';
import { useLogoutMutation } from '@/data/auth/auth.query';
import { clearLocalStore, readRefreshToken, readUserInfo } from '@/utils/helper/local-storagte.helper';
import { useTranslation } from 'react-i18next';

export function NavUser() {
  const { isMobile } = useSidebar();
  const { t: tCommon } = useTranslation('common');
  const userInfo = readUserInfo();

  //api logout
  const { mutate: mutateLogout, isPending } = useLogoutMutation({
    onSuccess: () => {
      clearLocalStore();
      window.location.reload();
    },
    onError: (error) => {
      appToast.error(error.response?.data.message || tCommon('notify.something_went_wrong'));
    },
  });

  const handleLogout = () => {
    if (isPending) return;

    const refreshToken = readRefreshToken();
    if (!refreshToken) {
      clearLocalStore();
      window.location.reload();
      return;
    }
    mutateLogout({ refresh_token: refreshToken });
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size='lg'
              className='data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground'>
              <div className='grid flex-1 text-left text-sm leading-tight'>
                <span className='truncate font-medium'>
                  {userInfo?.username} - {userInfo?.name}
                </span>
              </div>
              <ChevronsUpDown className='ml-auto size-4' />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent className='w-40 rounded-lg' side={isMobile ? 'bottom' : 'right'} align='end' sideOffset={4}>
            <DropdownMenuLabel className='p-0 font-normal'>
              <div className='flex items-center gap-2 px-1 py-1.5 text-left text-sm'>
                <div className='grid flex-1 text-left text-sm leading-tight'>
                  <span className='truncate font-medium'>{userInfo?.name}</span>
                </div>
              </div>
            </DropdownMenuLabel>

            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} disabled={isPending}>
              <LogOut />
              {tCommon('button.log_out')}
              {isPending && <Spinner />}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
