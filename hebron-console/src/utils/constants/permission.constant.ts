import type { resources } from '@/i18n/resources';
import { MY_ROUTE, ROUTE_NAME } from './route.constant';

export type SidebarKey = keyof (typeof resources)['en']['sidebar'];

export type PermissionMenuKey =
  | 'dashboard'
  | 'statistics'
  | 'administrator'
  | 'member'
  | 'product'
  | 'product_template'
  | 'product_background'
  | 'product_calligraphy'
  | 'product_option'
  | 'product_shopping_setting'
  | 'category'
  | 'order'
  | 'payment'
  | 'payment_settlement'
  | 'delivery'
  | 'content_banner'
  | 'content_popup'
  | 'content_notice'
  | 'content_guide'
  | 'content_uploaded_image'
  | 'content_faq'
  | 'content_portfolio'
  | 'content_cta'
  | 'content_craftsmanship'
  | 'content_media'
  | 'inquiry'
  | 'permission'
  | 'connection_log'
  | 'operation_log'
  | 'email_setting'
  | 'bank_account_setting'
  | 'mes'
  | 'homepage_mall'
  | 'homepage_brand'
  | 'homepage_vendor';

export type SystemMenu = {
  key: PermissionMenuKey;
  sidebarKey: SidebarKey;
  path: string;
  altPath?: string;
  indexPath?: string;
};

export const SYSTEM_MENUS: SystemMenu[] = [
  { key: 'dashboard', sidebarKey: 'operations_dashboard', path: MY_ROUTE.DASHBOARD.INDEX },
  { key: 'statistics', sidebarKey: 'statistical_management', path: MY_ROUTE.DASHBOARD.STATISTICS },
  { key: 'administrator', sidebarKey: 'administrator_management', path: MY_ROUTE.ADMINISTRATOR },
  { key: 'member', sidebarKey: 'member_management', path: ROUTE_NAME.MEMBER, indexPath: MY_ROUTE.MEMBER.LIST },
  { key: 'product', sidebarKey: 'product_list', path: MY_ROUTE.PRODUCT.LIST },
  { key: 'product_template', sidebarKey: 'template_list', path: MY_ROUTE.PRODUCT.TEMPLATE_LIST },
  { key: 'product_background', sidebarKey: 'background_list', path: MY_ROUTE.PRODUCT.BACKGROUND_LIST },
  { key: 'product_calligraphy', sidebarKey: 'calligraphy_list', path: MY_ROUTE.PRODUCT.CALLIGRAPHY_LIST },
  {
    key: 'product_option',
    sidebarKey: 'option_list',
    path: MY_ROUTE.PRODUCT.OPTION_LIST,
    altPath: `${ROUTE_NAME.PRODUCT}/option`,
  },
  { key: 'product_shopping_setting', sidebarKey: 'shopping_setting', path: MY_ROUTE.PRODUCT.SHOPPING_SETTING },
  { key: 'category', sidebarKey: 'category_management', path: ROUTE_NAME.CATEGORY },
  { key: 'order', sidebarKey: 'order_management', path: ROUTE_NAME.ORDER },
  { key: 'payment', sidebarKey: 'payment', path: MY_ROUTE.PAYMENT.LIST },
  { key: 'payment_settlement', sidebarKey: 'settlement_report', path: MY_ROUTE.PAYMENT.SETTLEMENT },
  { key: 'delivery', sidebarKey: 'delivery_management', path: MY_ROUTE.DELIVERY.SHIPPING },
  { key: 'content_banner', sidebarKey: 'banner_management', path: MY_ROUTE.CONTENT.BANNER },
  { key: 'content_popup', sidebarKey: 'popup_management', path: MY_ROUTE.CONTENT.POPUP },
  { key: 'content_notice', sidebarKey: 'notice_management', path: MY_ROUTE.CONTENT.NOTICE },
  { key: 'content_guide', sidebarKey: 'guide_content_management', path: MY_ROUTE.CONTENT.GUIDE },
  { key: 'content_uploaded_image', sidebarKey: 'manage_uploaded_images', path: MY_ROUTE.CONTENT.UPLOADED_IMAGE },
  { key: 'content_faq', sidebarKey: 'faq_management', path: MY_ROUTE.CONTENT.FAQ },
  { key: 'content_portfolio', sidebarKey: 'portfolio_management', path: MY_ROUTE.PORTFOLIO },
  { key: 'content_cta', sidebarKey: 'cta_management', path: MY_ROUTE.CONTENT.CTA },
  { key: 'content_craftsmanship', sidebarKey: 'craftsmanship_management', path: MY_ROUTE.CONTENT.CRAFTSMANSHIP },
  { key: 'content_media', sidebarKey: 'media_management', path: MY_ROUTE.CONTENT.MEDIA },
  { key: 'inquiry', sidebarKey: 'inquiry_management', path: ROUTE_NAME.INQUIRY },
  { key: 'permission', sidebarKey: 'permission_management', path: ROUTE_NAME.PERMISSION },
  { key: 'connection_log', sidebarKey: 'connection_logs', path: MY_ROUTE.SYSTEM.CONNECTION_LOG },
  { key: 'operation_log', sidebarKey: 'operation_logs', path: MY_ROUTE.SYSTEM.OPERATION_LOG },
  { key: 'email_setting', sidebarKey: 'email_settings', path: MY_ROUTE.SYSTEM.EMAIL_SETTINGS },
  { key: 'bank_account_setting', sidebarKey: 'bank_account_settings', path: MY_ROUTE.SYSTEM.BANK_ACCOUNT_SETTINGS },
  { key: 'mes', sidebarKey: 'mes_monitoring', path: ROUTE_NAME.MES },
  { key: 'homepage_mall', sidebarKey: 'mall', path: MY_ROUTE.HOME_PAGE_MANAGEMENT.MALL },
  { key: 'homepage_brand', sidebarKey: 'brand', path: MY_ROUTE.HOME_PAGE_MANAGEMENT.BRAND },
  { key: 'homepage_vendor', sidebarKey: 'vendor', path: MY_ROUTE.HOME_PAGE_MANAGEMENT.VENDOR },
];

const menuByKey = (key: PermissionMenuKey): SystemMenu => SYSTEM_MENUS.find((m) => m.key === key) as SystemMenu;

export type PermissionMenuGroup = {
  key: string;
  groupSidebarKey: SidebarKey;
  menus: SystemMenu[];
};

export const PERMISSION_MENU_GROUPS: PermissionMenuGroup[] = [
  { key: 'dashboard', groupSidebarKey: 'dashboard_statistics', menus: [menuByKey('dashboard'), menuByKey('statistics')] },
  { key: 'administrator', groupSidebarKey: 'administrator_management', menus: [menuByKey('administrator')] },
  { key: 'member', groupSidebarKey: 'member_management', menus: [menuByKey('member')] },
  {
    key: 'product',
    groupSidebarKey: 'product_management',
    menus: [
      menuByKey('product'),
      menuByKey('product_template'),
      menuByKey('product_background'),
      menuByKey('product_calligraphy'),
      menuByKey('product_option'),
      menuByKey('product_shopping_setting'),
    ],
  },
  { key: 'category', groupSidebarKey: 'category_management', menus: [menuByKey('category')] },
  { key: 'order', groupSidebarKey: 'order_management', menus: [menuByKey('order')] },
  {
    key: 'payment',
    groupSidebarKey: 'payment_management',
    menus: [menuByKey('payment'), menuByKey('payment_settlement')],
  },
  {
    key: 'delivery',
    groupSidebarKey: 'delivery_management',
    menus: [menuByKey('delivery')],
  },
  {
    key: 'content',
    groupSidebarKey: 'content_management',
    menus: [
      menuByKey('content_banner'),
      menuByKey('content_popup'),
      menuByKey('content_notice'),
      menuByKey('content_guide'),
      menuByKey('content_uploaded_image'),
      menuByKey('content_faq'),
      menuByKey('content_portfolio'),
      menuByKey('content_cta'),
      menuByKey('content_craftsmanship'),
      menuByKey('content_media'),
    ],
  },
  { key: 'inquiry', groupSidebarKey: 'inquiry_management', menus: [menuByKey('inquiry')] },
  { key: 'permission', groupSidebarKey: 'permission_management', menus: [menuByKey('permission')] },
  {
    key: 'system',
    groupSidebarKey: 'basic_system_management',
    menus: [
      menuByKey('connection_log'),
      menuByKey('operation_log'),
      menuByKey('email_setting'),
      menuByKey('bank_account_setting'),
    ],
  },
  { key: 'mes', groupSidebarKey: 'mes_monitoring', menus: [menuByKey('mes')] },
  {
    key: 'homepage',
    groupSidebarKey: 'home_page_management',
    menus: [menuByKey('homepage_mall'), menuByKey('homepage_brand'), menuByKey('homepage_vendor')],
  },
];

export type PermissionActionKey = 'view' | 'register' | 'edit' | 'delete';

export const PERMISSION_ACTIONS: { key: PermissionActionKey }[] = [{ key: 'register' }, { key: 'edit' }, { key: 'delete' }];

export const DEFAULT_MENU_ACTIONS: Record<PermissionActionKey, boolean> = {
  view: false,
  register: false,
  edit: false,
  delete: false,
};
