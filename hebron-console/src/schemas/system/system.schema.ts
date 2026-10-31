import { AccessLogEventType, AccessLogSortBy, TaskLogSortBy, TaskType } from '@/utils/enums/system.enum';
import { SortOrder } from '@/utils/enums/common.enum';
import type { DateRange } from 'react-day-picker';
import { z } from 'zod';

export const dateRangeSchema = z.object({
  from: z.date().optional(),
  to: z.date().optional(),
}) as z.ZodType<DateRange>;

export const taskLogFilterSchema = z.object({
  menu: z.string().optional(),
  worker_name: z.string().optional(),
  task_type: z.nativeEnum(TaskType).optional().or(z.string().optional()),
  date_period: dateRangeSchema.optional(),
  sort_by: z.nativeEnum(TaskLogSortBy).optional(),
  sort_order: z.nativeEnum(SortOrder).optional(),
  page: z.number().int().positive().default(1),
  per_page: z.number().int().positive().default(10),
});

export type TaskLogFilterInput = z.infer<typeof taskLogFilterSchema>;

export const accessLogFilterSchema = z.object({
  login_id: z.string().optional(),
  user_id_name: z.string().optional(),
  ip_address: z.string().optional(),
  event_type: z.nativeEnum(AccessLogEventType).optional().or(z.string().optional()),
  browser_info: z.string().optional(),
  show_abnormal_only: z.boolean().optional(),
  date_period: dateRangeSchema.optional(),
  sort_by: z.nativeEnum(AccessLogSortBy).optional().or(z.string().optional()),
  sort_order: z.nativeEnum(SortOrder).optional(),
  page: z.number().int().positive().default(1),
  per_page: z.number().int().positive().default(20),
});

export type AccessLogFilterInput = z.infer<typeof accessLogFilterSchema>;
