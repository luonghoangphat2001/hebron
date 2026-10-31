import { SYSTEM_MENUS, type SystemMenu } from '@/utils/constants/permission.constant';

const matchedLength = (pathname: string, path?: string) =>
  path && (pathname === path || pathname.startsWith(`${path}/`)) ? path.length : 0;

export const findMenuByPath = (pathname: string): SystemMenu | undefined =>
  SYSTEM_MENUS.map((menu) => ({
    menu,
    length: Math.max(matchedLength(pathname, menu.path), matchedLength(pathname, menu.altPath)),
  }))
    .filter((item) => item.length > 0)
    .sort((a, b) => b.length - a.length)[0]?.menu;

export const firstMenuPath = (permissions: { menu: string }[]): string | undefined =>
  permissions
    .map((item) => {
      const menu = SYSTEM_MENUS.find((entry) => entry.key === item.menu);
      return menu && (menu.indexPath || menu.path);
    })
    .find(Boolean);
