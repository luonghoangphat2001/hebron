import { ChevronRight } from 'lucide-react';

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import type { SideBarItemType } from '@/utils/types/common.type';
import { Link, useLocation } from 'react-router-dom';

type NavMainProps = {
  items: SideBarItemType[];
};

export function NavMain({ items }: NavMainProps) {
  const location = useLocation();
  const isPathActive = (url: string) => location.pathname === url || location.pathname.startsWith(`${url}/`);

  return (
    <SidebarGroup>
      {/* <SidebarGroupLabel>Platform</SidebarGroupLabel> */}
      <SidebarMenu>
        {items.map((item) =>
          item.items && item.items.length > 0 ? (
            <Collapsible
              key={item.title}
              asChild
              className='group/collapsible'
              defaultOpen={location.pathname.includes(item.url)}>
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton
                    tooltip={item.title}
                    isActive={location.pathname.includes(item.url)}
                    className={cn(location.pathname.includes(item.url) && 'bg-blue-600! text-white!')}>
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                    <ChevronRight className='ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90' />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    {item.items?.map((subItem) =>
                      subItem.items && subItem.items.length > 0 ? (
                        <Collapsible
                          key={subItem.title}
                          asChild
                          className='group/subcollapsible'
                          defaultOpen={location.pathname.startsWith(subItem.url)}>
                          <SidebarMenuSubItem>
                            <CollapsibleTrigger asChild>
                              <SidebarMenuSubButton
                                className={cn(
                                  'flex w-full cursor-pointer items-center justify-between',
                                  location.pathname.startsWith(subItem.url) && 'font-semibold text-blue-600!',
                                )}>
                                <span>{subItem.title}</span>
                                <ChevronRight className='h-3.5 w-3.5 transition-transform duration-200 group-data-[state=open]/subcollapsible:rotate-90' />
                              </SidebarMenuSubButton>
                            </CollapsibleTrigger>
                            <CollapsibleContent>
                              <SidebarMenuSub className='ml-2 space-y-0.5 border-l border-neutral-200/80 py-0.5 pl-2'>
                                {subItem.items.map((nested) => (
                                  <SidebarMenuSubItem key={nested.title}>
                                    <SidebarMenuSubButton
                                      asChild
                                      isActive={isPathActive(nested.url)}
                                      className={isPathActive(nested.url) ? 'bg-blue-100! font-medium text-blue-500!' : ''}>
                                      <Link to={nested.url}>
                                        <span>{nested.title}</span>
                                      </Link>
                                    </SidebarMenuSubButton>
                                  </SidebarMenuSubItem>
                                ))}
                              </SidebarMenuSub>
                            </CollapsibleContent>
                          </SidebarMenuSubItem>
                        </Collapsible>
                      ) : (
                        <SidebarMenuSubItem key={subItem.title}>
                          <SidebarMenuSubButton
                            asChild
                            isActive={isPathActive(subItem.url)}
                            className={isPathActive(subItem.url) ? 'bg-blue-100! font-medium text-blue-500!' : ''}>
                            <Link to={subItem.url}>
                              <span>{subItem.title}</span>
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ),
                    )}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          ) : (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                tooltip={item.title}
                asChild
                isActive={location.pathname.includes(item.url)}
                className={cn(location.pathname.includes(item.url) && 'bg-blue-600! text-white!')}>
                <Link to={item.url}>
                  {item.icon && <item.icon />}
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ),
        )}
      </SidebarMenu>
    </SidebarGroup>
  );
}
