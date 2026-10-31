import type { Status } from '@/utils/enums/common.enum';
import type { PaginationREQ } from '@/utils/types/request.type';

export type AdminListREQ = PaginationREQ & {
  search_term?: string;
  status?: string;
};

export type AdminCreateREQ = {
  name: string;
  username: string;
  password: string;
  password_confirmation: string;
  email: string;
  mobile: string;
  position?: string;
  status?: Status;
  admin_permission_ids?: number[];
};

export type AdminUpdateREQ = Partial<AdminCreateREQ> & {
  id: number;
};

export type AdminChangePasswordREQ = {
  id: number;
  password: string;
  password_confirmation: string;
};
