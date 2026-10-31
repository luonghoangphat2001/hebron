import type { MenuPermission } from '@/data/permission/permission.response';
import type { Status } from '@/utils/enums/common.enum';

export type AdminRESP = {
  id: number;
  username: string;
  name: string;
  email: string;
  phone: string;
  mobile: string;
  postcode: string;
  address: string;
  detailed_address: string;
  authority: string;
  role: string;
  is_admin: boolean;
  is_super_admin: boolean;
  is_store_admin: boolean;
  is_normal_user: boolean;
  headquarters: string;
  business_office: string;
  team: string;
  position: string;
  admin_permissions_ids: number[];
  last_login_at: string;
  last_login_ip: string;
  status: Status;
};

export type AdminListRESP = {
  users: AdminRESP[];
};

export type AdminDetailRESP = {
  user: AdminRESP;
};

export type AdminMePermissionsRESP = {
  user_id: number;
  name: string;
  email: string;
  permissions: MenuPermission[];
};
