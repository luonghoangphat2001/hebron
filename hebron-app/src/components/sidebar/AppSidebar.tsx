import { Logo } from '@/assets/images';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail } from '@/components/ui/sidebar';
import type { SideBarItemType } from '@/utils/types/common.type';
import * as React from 'react';
import { NavMain } from './components/NavMain';
import { NavUser } from './components/NavUser';

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const sidebarItems: SideBarItemType[] = [];

  return (
    <Sidebar collapsible='icon' {...props}>
      <SidebarHeader>
        <div className='flex justify-center py-4'>
          <img src={Logo} alt='logo' />
        </div>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={sidebarItems} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
