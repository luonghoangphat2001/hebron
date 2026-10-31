import type { SortOrder, Status } from '@/utils/enums/common.enum';
import type { AccessLogSortBy, TaskLogSortBy } from '@/utils/enums/system.enum';
import type { ExportExcelBaseREQ } from '@/utils/types/export.type';
import type { PaginationREQ, SortREQ } from '@/utils/types/request.type';

export type PermissionCreateREQ = {
  name: string;
  code: string;
  description?: string;
  status: Status;
};

export type PermissionUpdateREQ = { id: number } & PermissionCreateREQ;

export type PermissionListREQ = {
  page: number;
  size: number;
  search?: string;
  status?: Status;
};

export type TaskLogListREQ = PaginationREQ &
  SortREQ & {
    menu?: string;
    worker_name?: string;
    task_type?: string;
    date_from?: string;
    date_to?: string;
    sort_by?: TaskLogSortBy | string;
  };

export type TaskLogExportExcelREQ = ExportExcelBaseREQ & Omit<TaskLogListREQ, 'page'>;

export type AccessLogListREQ = {
  current_page?: number;
  per_page?: number;
  login_id?: string;
  user_id_name?: string;
  ip_address?: string;
  event_type?: string;
  browser_info?: string;
  access_date_from?: string;
  access_date_to?: string;
  connection_time_from?: string;
  connection_time_to?: string;
  show_abnormal_only?: boolean;
  sort_by?: AccessLogSortBy | string;
  sort_order?: SortOrder;
};
