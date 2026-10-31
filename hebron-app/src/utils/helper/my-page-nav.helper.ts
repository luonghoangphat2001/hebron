import { MY_ROUTE, ROUTE_NAME } from '@/utils/constants/route.constant';

const MY_PAGE_ORDERS_PATH = `${ROUTE_NAME.MY_PAGE}/${MY_ROUTE.MY_PAGE.ORDERS}`;
const MY_PAGE_NOTICE_PATH = `${ROUTE_NAME.MY_PAGE}/${MY_ROUTE.MY_PAGE.NOTICE}`;
const MY_PAGE_QUOTE_PATH = `${ROUTE_NAME.MY_PAGE}/${MY_ROUTE.MY_PAGE.QUOTE}`;
const MY_PAGE_SHIPPING_INQUIRY_PATH = `${ROUTE_NAME.MY_PAGE}/${MY_ROUTE.MY_PAGE.SHIPPING_INQUIRY}`;
const MY_PAGE_REWORK_REQUEST_PATH = `${ROUTE_NAME.MY_PAGE}/${MY_ROUTE.MY_PAGE.REWORK_REQUEST}`;

const PREFIX_MATCH_PATHS = [
  MY_PAGE_ORDERS_PATH,
  MY_PAGE_NOTICE_PATH,
  MY_PAGE_QUOTE_PATH,
  MY_PAGE_SHIPPING_INQUIRY_PATH,
  MY_PAGE_REWORK_REQUEST_PATH,
];

export const isMyPageNavItemActive = (pathname: string, href: string) => {
  if (href === '#') return false;
  if (PREFIX_MATCH_PATHS.includes(href)) {
    return pathname === href || pathname.startsWith(`${href}/`);
  }
  return pathname === href;
};
