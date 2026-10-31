import type { Status } from '@/utils/enums/common.enum';
import type { ExportExcelRESP } from '@/utils/types/export.type';

export type StructurePermission = {
  id: number;
  name: string;
};

export type StructureGroupMenu = {
  id: number;
  key: string;
  name: string;
  show_in_navigation: boolean;
};

export type StructureGroup = {
  id: number;
  key: string;
  name: string;
  menus: StructureGroupMenu[];
};

export type MenuPermissionStructureRESP = {
  permission: StructurePermission;
  groups: StructureGroup[];
};

export type MenuPermission = {
  menu: string;
  actions: string[];
};

export type PermissionUsageStatusRESP = {
  value: Status;
  label: string;
};

export type PersmissionRegistrantRESP = {
  id: number | string;
  username: string;
  name: string;
};

export type PermissionRESP = {
  id: number;
  name: string;
  description: string;
  usage_status: PermissionUsageStatusRESP;
  registrant: PersmissionRegistrantRESP;
  menu_permissions: MenuPermission[];
  created_at: string;
  updated_at: string;
};

export type PermissionListItemRESP = Omit<PermissionRESP, 'menu_permissions'>;

export type PermissionListRESP = {
  permissions: PermissionListItemRESP[];
};

export type PermissionDetailRESP = {
  permission: PermissionRESP;
};

export type PermissionExportExcelRESP = ExportExcelRESP;
