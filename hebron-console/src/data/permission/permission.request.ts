import type { Status } from '@/utils/enums/common.enum';
import type { ExportExcelBaseREQ } from '@/utils/types/export.type';
import type { PaginationREQ } from '@/utils/types/request.type';

export type MenuPermissionREQ = {
  menu: string;
  actions: string[];
};

export type PermissionListREQ = PaginationREQ & {
  search?: string;
  usage_status?: Status;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
};

export type PermissionCreateREQ = {
  name: string;
  description?: string;
  usage_status: Status;
  menu_permissions: MenuPermissionREQ[];
};

export type PermissionUpdateREQ = { id: number } & PermissionCreateREQ;

export type PermissionCopyREQ = { id: number } & Pick<PermissionCreateREQ, 'name' | 'usage_status'>;

export type PermissionSettignREQ = { id: number } & Pick<PermissionCreateREQ, 'menu_permissions'>;

export type PermissionExportExcelREQ = Omit<PermissionListREQ, 'page'> & ExportExcelBaseREQ;
