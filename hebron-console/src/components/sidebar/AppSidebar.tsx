import { Logo } from '@/assets/images';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail } from '@/components/ui/sidebar';
import { useMenuAccess } from '@/hooks/useMenuAccess';
import { MY_ROUTE, ROUTE_NAME } from '@/utils/constants/route.constant';
import type { SideBarItemType, SideBarSubItemType } from '@/utils/types/common.type';
import {
  ClipboardList,
  Grid2X2,
  Layers,
  LayoutDashboard,
  MessageSquareText,
  MonitorCog,
  Package,
  ServerCog,
  ShieldCheck,
  ShieldUser,
  Truck,
  UsersRound,
  Wallet,
} from 'lucide-react';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { NavMain } from './components/NavMain';
import { NavUser } from './components/NavUser';

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { t: tSidebar } = useTranslation('sidebar');
  const { canAccess } = useMenuAccess();

  const filterByAccess = <T extends SideBarItemType | SideBarSubItemType>(items: T[]): T[] =>
    items.flatMap((item) => {
      if (!item.items?.length) return canAccess(item.url) ? [item] : [];

      const children = filterByAccess(item.items);
      return children.length ? [{ ...item, items: children }] : [];
    });

  const sidebarItems: SideBarItemType[] = [
    {
      title: tSidebar('dashboard_statistics'),
      url: ROUTE_NAME.DASHBOARD,
      icon: LayoutDashboard,
      items: [
        {
          title: tSidebar('operations_dashboard'),
          url: MY_ROUTE.DASHBOARD.INDEX,
        },
        {
          title: tSidebar('statistical_management'),
          url: MY_ROUTE.DASHBOARD.STATISTICS,
        },
      ],
    },
    {
      title: tSidebar('administrator_management'),
      url: MY_ROUTE.ADMINISTRATOR,
      icon: ShieldUser,
    },
    // {
    //   title: tSidebar('outsourcing_management'),
    //   url: ROUTE_NAME.OUTSOURCING,
    //   icon: Building2,
    // },
    {
      title: tSidebar('member_management'),
      url: MY_ROUTE.MEMBER.LIST,
      icon: UsersRound,
      // items: [
      //   {
      //     title: tSidebar('member_management'),
      //     url: MY_ROUTE.MEMBER.LIST,
      //   },
      //   {
      //     title: tSidebar('approval_management'),
      //     url: MY_ROUTE.MEMBER.APPROVAL,
      //   },
      //   {
      //     title: tSidebar('membership_level_management'),
      //     url: MY_ROUTE.MEMBER.MEMBERSHIP_LEVEL,
      //   },
      // ],
    },
    {
      title: tSidebar('product_management'),
      url: ROUTE_NAME.PRODUCT,
      icon: Package,
      items: [
        {
          title: tSidebar('product_list'),
          url: MY_ROUTE.PRODUCT.LIST,
        },
        {
          title: tSidebar('template_list'),
          url: MY_ROUTE.PRODUCT.TEMPLATE_LIST,
        },
        {
          title: tSidebar('background_list'),
          url: MY_ROUTE.PRODUCT.BACKGROUND_LIST,
        },
        {
          title: tSidebar('calligraphy_list'),
          url: MY_ROUTE.PRODUCT.CALLIGRAPHY_LIST,
        },
        {
          title: tSidebar('option_list'),
          url: MY_ROUTE.PRODUCT.OPTION_LIST,
        },
        {
          title: tSidebar('shopping_setting'),
          url: MY_ROUTE.PRODUCT.SHOPPING_SETTING,
        },
      ],
    },
    {
      title: tSidebar('category_management'),
      url: MY_ROUTE.CATEGORY.INDEX,
      icon: Grid2X2,
    },
    {
      title: tSidebar('order_management'),
      url: MY_ROUTE.ORDER.LIST,
      icon: ClipboardList,
    },
    {
      title: tSidebar('payment_management'),
      url: ROUTE_NAME.PAYMENT,
      icon: Wallet,
      items: [
        {
          title: tSidebar('payment'),
          url: MY_ROUTE.PAYMENT.LIST,
        },
        {
          title: tSidebar('settlement_report'),
          url: MY_ROUTE.PAYMENT.SETTLEMENT,
        },
      ],
    },
    {
      title: tSidebar('delivery_management'),
      url: MY_ROUTE.DELIVERY.SHIPPING,
      icon: Truck,
    },
    {
      title: tSidebar('content_management'),
      url: ROUTE_NAME.CONTENT,
      icon: Layers,
      items: [
        {
          title: tSidebar('banner_management'),
          url: MY_ROUTE.CONTENT.BANNER,
        },
        {
          title: tSidebar('popup_management'),
          url: MY_ROUTE.CONTENT.POPUP,
        },
        {
          title: tSidebar('notice_management'),
          url: MY_ROUTE.CONTENT.NOTICE,
        },
        {
          title: tSidebar('guide_content_management'),
          url: MY_ROUTE.CONTENT.GUIDE,
        },
        {
          title: tSidebar('manage_uploaded_images'),
          url: MY_ROUTE.CONTENT.UPLOADED_IMAGE,
        },
        {
          title: tSidebar('faq_management'),
          url: MY_ROUTE.CONTENT.FAQ,
        },
        {
          title: tSidebar('portfolio_management'),
          url: MY_ROUTE.PORTFOLIO,
        },
        {
          title: tSidebar('cta_management'),
          url: MY_ROUTE.CONTENT.CTA,
        },
        {
          title: tSidebar('craftsmanship_management'),
          url: MY_ROUTE.CONTENT.CRAFTSMANSHIP,
        },
        {
          title: tSidebar('media_management'),
          url: MY_ROUTE.CONTENT.MEDIA,
        },
        {
          title: tSidebar('sample_management'),
          url: MY_ROUTE.CONTENT.SAMPLE,
        },
      ],
    },
    {
      title: tSidebar('inquiry_management'),
      url: ROUTE_NAME.INQUIRY,
      icon: MessageSquareText,
    },
    {
      title: tSidebar('permission_management'),
      url: ROUTE_NAME.PERMISSION,
      icon: ShieldCheck,
    },
    {
      title: tSidebar('basic_system_management'),
      url: ROUTE_NAME.SYSTEM,
      icon: MonitorCog,
      items: [
        {
          title: tSidebar('connection_logs'),
          url: MY_ROUTE.SYSTEM.CONNECTION_LOG,
        },
        {
          title: tSidebar('operation_logs'),
          url: MY_ROUTE.SYSTEM.OPERATION_LOG,
        },
        {
          title: tSidebar('email_settings'),
          url: MY_ROUTE.SYSTEM.EMAIL_SETTINGS,
        },
        {
          title: tSidebar('bank_account_settings'),
          url: MY_ROUTE.SYSTEM.BANK_ACCOUNT_SETTINGS,
        },
      ],
    },
    {
      title: tSidebar('mes_monitoring'),
      url: ROUTE_NAME.MES,
      icon: ServerCog,
    },
    {
      title: tSidebar('home_page_management'),
      url: ROUTE_NAME.HOME_PAGE_MANAGEMENT,
      icon: MonitorCog,
      items: [
        {
          title: tSidebar('mall'),
          url: MY_ROUTE.HOME_PAGE_MANAGEMENT.MALL,
        },
        {
          title: tSidebar('brand'),
          url: MY_ROUTE.HOME_PAGE_MANAGEMENT.BRAND,
          items: [
            {
              title: tSidebar('brand_home'),
              url: MY_ROUTE.HOME_PAGE_MANAGEMENT.BRAND_HOME,
            },
            {
              title: tSidebar('brand_story'),
              url: MY_ROUTE.HOME_PAGE_MANAGEMENT.BRAND_STORY,
            },
            {
              title: tSidebar('brand_products'),
              url: MY_ROUTE.HOME_PAGE_MANAGEMENT.BRAND_PRODUCTS,
            },
            {
              title: tSidebar('brand_process'),
              url: MY_ROUTE.HOME_PAGE_MANAGEMENT.BRAND_PROCESS,
            },
            {
              title: tSidebar('brand_media'),
              url: MY_ROUTE.HOME_PAGE_MANAGEMENT.BRAND_MEDIA,
            },
            {
              title: tSidebar('brand_contact'),
              url: MY_ROUTE.HOME_PAGE_MANAGEMENT.BRAND_CONTACT,
            },
            {
              title: tSidebar('brand_inquiry'),
              url: MY_ROUTE.HOME_PAGE_MANAGEMENT.BRAND_INQUIRY,
            },
          ],
        },
        {
          title: tSidebar('vendor'),
          url: MY_ROUTE.HOME_PAGE_MANAGEMENT.VENDOR,
        },
      ],
    },
  ];

  return (
    <Sidebar collapsible='icon' {...props}>
      <SidebarHeader>
        <div className='flex justify-center py-4'>
          <img src={Logo} alt='logo' />
        </div>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={filterByAccess(sidebarItems)} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
