import { ChevronsUpDown, LogOut } from 'lucide-react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from '@/components/ui/sidebar';
import { LANG } from '@/utils/constants/common.constant';
import { clearLocalStore } from '@/utils/helper/local-storagte.helper';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Switch } from '../../ui/switch';

export function NavUser() {
  const { isMobile } = useSidebar();
  const { i18n } = useTranslation();
  const [isEnglish, setIsEnglish] = useState(false);

  const handleLogout = () => {
    clearLocalStore();
    window.location.reload();
  };

  const displayEnglish = (checked: boolean) => {
    setIsEnglish(checked);
    if (checked) {
      i18n.changeLanguage('en');
      localStorage.setItem(LANG, 'en');
    } else {
      i18n.changeLanguage('kr');
      localStorage.setItem(LANG, 'kr');
    }
  };

  useEffect(() => {
    const value = localStorage.getItem(LANG);

    // your condition here
    if (value === 'en') {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsEnglish(true);
    } else {
      setIsEnglish(false);
    }
  }, []);

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size='lg'
              className='data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground'>
              <div className='grid flex-1 text-left text-sm leading-tight'>
                <span className='truncate font-medium'>Admin</span>
              </div>
              <ChevronsUpDown className='ml-auto size-4' />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent className='w-40 rounded-lg' side={isMobile ? 'bottom' : 'right'} align='end' sideOffset={4}>
            <DropdownMenuLabel className='p-0 font-normal'>
              <div className='flex items-center gap-2 px-1 py-1.5 text-left text-sm'>
                <div className='grid flex-1 text-left text-sm leading-tight'>
                  <span className='truncate font-medium'>Admin</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                English
                <Switch className='ml-1' checked={isEnglish} onCheckedChange={displayEnglish} />
              </DropdownMenuItem>
            </DropdownMenuGroup>

            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
