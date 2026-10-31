import { useMyPermissionsQuery } from '@/data/admin/admin.query';
import type { PermissionActionKey } from '@/utils/constants/permission.constant';
import { findMenuByPath } from '@/utils/helper/permission.helper';
import { useCallback, useMemo } from 'react';
import { useLocation } from 'react-router-dom';

export const useMenuAccess = () => {
  const { data, isLoading } = useMyPermissionsQuery();

  const allowedMenus = useMemo(() => new Set((data?.permissions || []).map((item) => item.menu)), [data]);

  const canAccess = useCallback(
    (pathname: string) => {
      const menu = findMenuByPath(pathname);
      return !menu || allowedMenus.has(menu.key);
    },
    [allowedMenus],
  );

  return { canAccess, isLoading };
};

export const useCan = () => {
  const { pathname } = useLocation();
  const { data } = useMyPermissionsQuery();

  const menu = findMenuByPath(pathname);
  const actions = useMemo(
    () => new Set(data?.permissions.find((item) => item.menu === menu?.key)?.actions || []),
    [data, menu?.key],
  );

  return useCallback((action: PermissionActionKey) => !menu || actions.has(action), [menu, actions]);
};
