import type { AccessLogFilterInput, TaskLogFilterInput } from '@/schemas/system/system.schema';
import { INITIAL_PAGING, PAGE_PARAM_KEY, PER_PAGE_PARAM_KEY } from '@/utils/constants/common.constant';
import { DATE_FORMAT } from '@/utils/constants/date.constant';
import { ExportType, SortOrder } from '@/utils/enums/common.enum';
import { AccessLogSortBy, TaskLogSortBy } from '@/utils/enums/system.enum';
import dayjs from 'dayjs';
import type { AccessLogListREQ, TaskLogExportExcelREQ, TaskLogListREQ } from './system.request';
import type { TaskLogItemRESP } from './system.response';

export type TaskLogFilterValues = TaskLogFilterInput;
export type AccessLogFilterValues = AccessLogFilterInput;

export const DEFAULT_ACCESS_LOG_FILTER: AccessLogFilterValues = {
  login_id: undefined,
  user_id_name: undefined,
  ip_address: undefined,
  event_type: undefined,
  browser_info: undefined,
  show_abnormal_only: undefined,
  date_period: undefined,
  sort_by: undefined,
  sort_order: undefined,
  page: 1,
  per_page: 20,
};

export const getAccessLogListInitFilter = (searchParams: URLSearchParams): AccessLogFilterValues => ({
  login_id: searchParams.get('login_id') || undefined,
  user_id_name: searchParams.get('user_id_name') || undefined,
  ip_address: searchParams.get('ip_address') || undefined,
  event_type: searchParams.get('event_type') || undefined,
  browser_info: searchParams.get('browser_info') || undefined,
  show_abnormal_only: searchParams.get('show_abnormal_only') === 'true' ? true : undefined,
  date_period: undefined,
  sort_by: (searchParams.get('sort_by') as AccessLogSortBy) || undefined,
  sort_order: (searchParams.get('sort_order') as SortOrder) || undefined,
  page: Number(searchParams.get(PAGE_PARAM_KEY)) || INITIAL_PAGING.page || 1,
  per_page: Number(searchParams.get(PER_PAGE_PARAM_KEY)) || INITIAL_PAGING.per_page || 20,
});

export const transformAccessLogFilterToREQ = (filter: AccessLogFilterValues): AccessLogListREQ => ({
  login_id: filter.login_id || undefined,
  user_id_name: filter.user_id_name || undefined,
  ip_address: filter.ip_address || undefined,
  event_type: filter.event_type || undefined,
  browser_info: filter.browser_info || undefined,
  show_abnormal_only: filter.show_abnormal_only,
  access_date_from: filter.date_period?.from ? dayjs(filter.date_period.from).format(DATE_FORMAT) : undefined,
  access_date_to: filter.date_period?.to ? dayjs(filter.date_period.to).format(DATE_FORMAT) : undefined,
  sort_by: filter.sort_by,
  sort_order: filter.sort_order,
  current_page: filter.page,
  per_page: filter.per_page,
});

export const DEFAULT_TASK_LOG_FILTER: TaskLogFilterValues = {
  menu: undefined,
  worker_name: undefined,
  task_type: undefined,
  date_period: undefined,
  sort_by: undefined,
  sort_order: undefined,
  page: 1,
  per_page: 20,
};

export const getTaskLogListInitFilter = (searchParams: URLSearchParams): TaskLogFilterValues => ({
  menu: searchParams.get('menu') || undefined,
  worker_name: searchParams.get('worker_name') || undefined,
  task_type: searchParams.get('task_type') || undefined,
  date_period: undefined,
  sort_by: (searchParams.get('sort_by') as TaskLogSortBy) || undefined,
  sort_order: (searchParams.get('sort_order') as SortOrder) || undefined,
  page: Number(searchParams.get(PAGE_PARAM_KEY)) || INITIAL_PAGING.page || 1,
  per_page: Number(searchParams.get(PER_PAGE_PARAM_KEY)) || INITIAL_PAGING.per_page || 20,
});

export const transformTaskLogFilterToREQ = (filter: TaskLogFilterValues): TaskLogListREQ => ({
  menu: filter.menu || undefined,
  worker_name: filter.worker_name || undefined,
  task_type: filter.task_type || undefined,
  date_from: filter.date_period?.from ? dayjs(filter.date_period.from).format(DATE_FORMAT) : undefined,
  date_to: filter.date_period?.to ? dayjs(filter.date_period.to).format(DATE_FORMAT) : undefined,
  sort_by: filter.sort_by,
  sort_order: filter.sort_order,
  page: filter.page,
  per_page: filter.per_page,
});

export const transformTaskLogFilterToExportREQ = (
  filter: TaskLogFilterValues,
  exportType: ExportType,
  currentPage?: number,
  locale = 'en',
): TaskLogExportExcelREQ => ({
  export_type: exportType,
  current_page: exportType === ExportType.CURRENT_PAGE ? (currentPage ?? filter.page) : undefined,
  per_page: filter.per_page,
  locale,
  menu: filter.menu || undefined,
  worker_name: filter.worker_name || undefined,
  task_type: filter.task_type || undefined,
  date_from: filter.date_period?.from ? dayjs(filter.date_period.from).format(DATE_FORMAT) : undefined,
  date_to: filter.date_period?.to ? dayjs(filter.date_period.to).format(DATE_FORMAT) : undefined,
  sort_by: filter.sort_by,
  sort_order: filter.sort_order,
});

export type ParsedFieldChange = {
  fieldKey: string;
  fieldLabel: string;
  beforeVal?: string;
  afterVal?: string;
};

const formatValueType = (val: any): string => {
  if (val === null || val === undefined) return '-';
  if (typeof val === 'boolean') return val ? 'True' : 'False';

  if (typeof val === 'string') {
    const trimmed = val.trim();
    if ((trimmed.startsWith('{') && trimmed.endsWith('}')) || (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
      try {
        const parsed = JSON.parse(trimmed);
        return JSON.stringify(parsed, null, 2);
      } catch {
        return val;
      }
    }
    return val;
  }

  if (typeof val === 'object') {
    try {
      return JSON.stringify(val, null, 2);
    } catch {
      return String(val);
    }
  }
  return String(val);
};

export const parseTaskLogChanges = (item: TaskLogItemRESP, lang: string = 'en'): ParsedFieldChange[] => {
  if (!item.changed_fields || item.changed_fields.length === 0) return [];

  return item.changed_fields.map((change) => {
    const fieldKey = change.value || change.field || '';

    let fieldLabel = fieldKey;
    if (typeof change.label === 'string') {
      fieldLabel = change.label;
    } else if (change.label && typeof change.label === 'object') {
      fieldLabel = (change.label as any)[lang] || change.label.en || change.label.ko || change.label.ja || fieldKey;
    }

    const beforeRaw =
      change.before ??
      (item.before_values && !Array.isArray(item.before_values)
        ? (item.before_values[fieldKey]?.value ?? item.before_values[fieldKey])
        : undefined);

    const afterRaw =
      change.after ??
      (item.after_values && !Array.isArray(item.after_values)
        ? (item.after_values[fieldKey]?.value ?? item.after_values[fieldKey])
        : undefined);

    return {
      fieldKey,
      fieldLabel,
      beforeVal: formatValueType(beforeRaw),
      afterVal: formatValueType(afterRaw),
    };
  });
};
