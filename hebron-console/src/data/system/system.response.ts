import type { Pagination } from '@/utils/types/response.type';
import type { Status } from '@/utils/enums/common.enum';

export type PermissionListItemRESP = {
  id: number;
  name: string;
  code: string;
  description: string;
  status: Status;
  created_at: string;
  updated_at: string;
};

export type TaskLogWorkerRESP = {
  id: number;
  name: string;
  username: string;
  email?: string;
};

export type FieldChangeLabelRESP = {
  en?: string;
  ko?: string;
  ja?: string;
};

export type FieldChangeItemRESP = {
  value: string;
  label?: FieldChangeLabelRESP | string;
  field?: string;
  before?: any;
  after?: any;
};

export type FieldValueDetailRESP = {
  value: any;
  label?: FieldChangeLabelRESP | string;
};

export type TaskLogItemRESP = {
  id: number;
  menu: string;
  target_menu?: string;
  task_type: string;
  description?: string;
  worker?: TaskLogWorkerRESP | null;
  data_identifier?: number | string;
  subject_type?: string;
  subject_id?: number;
  changed_fields?: FieldChangeItemRESP[];
  before_values?: Record<string, FieldValueDetailRESP | any> | any[];
  after_values?: Record<string, FieldValueDetailRESP | any> | any[];
  created_at: string;
  updated_at: string;
};

export type TaskLogDataRESP = {
  task_logs: TaskLogItemRESP[];
  pagination: Pagination;
};

export type AccessLogUserRESP = {
  id: number;
  username: string;
  name?: string;
  email?: string;
};

export type AccessLogItemRESP = {
  id: number;
  login_id?: string;
  username?: string | null;
  ip_address?: string;
  browser_info?: string;
  description?: string;
  user_id?: number | null;
  user_agent?: string;
  event_type?: string;
  attempt_count?: number | null;
  connection_time?: string;
  access_date?: string;
  user?: AccessLogUserRESP | null;
  created_at: string;
  updated_at: string;
};

export type AccessLogDataRESP = {
  access_logs: AccessLogItemRESP[];
  pagination: Pagination;
};
