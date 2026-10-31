import { useCan } from '@/hooks/useMenuAccess';
import type { PermissionActionKey } from '@/utils/constants/permission.constant';
import type { ReactNode } from 'react';

type CanProps = {
  action: PermissionActionKey;
  children: ReactNode;
};

const Can = ({ action, children }: CanProps) => {
  const can = useCan();

  return can(action) ? <>{children}</> : null;
};

export default Can;
