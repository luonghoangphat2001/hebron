import { z } from 'zod';
import type { DateRange } from 'react-day-picker';
import { OrderSortby, OrderStatus } from '@/utils/enums/order.enum';
import { SortOrder } from '@/utils/enums/common.enum';

export const dateRangeSchema = z.object({
  from: z.date().optional(),
  to: z.date().optional(),
}) as z.ZodType<DateRange>;

export const orderFilterSchema = z.object({
  order_number: z.string().optional(),
  customer_name: z.string().optional(),
  orderer_name: z.string().optional(),
  status: z.nativeEnum(OrderStatus).optional().or(z.string().optional()),
  date_period: dateRangeSchema.optional(),
  sort_by: z.nativeEnum(OrderSortby).optional().or(z.string().optional()),
  sort_order: z.nativeEnum(SortOrder).optional(),
  page: z.number().int().positive().default(1),
  per_page: z.number().int().positive().default(20),
});

export type OrderFilterInput = z.infer<typeof orderFilterSchema>;

export const orderBasicInfoSchema = z.object({
  member_name: z.string().trim().min(1, 'FIELD_REQUIRED'),
  recipient_name: z.string().trim().min(1, 'FIELD_REQUIRED'),
  recipient_phone: z.string().trim().min(1, 'FIELD_REQUIRED'),
  ordered_at: z.string().trim().min(1, 'FIELD_REQUIRED'),
  payment_amount: z.string().trim().min(1, 'FIELD_REQUIRED'),
  shipping_address: z.string().trim().min(1, 'FIELD_REQUIRED'),
  payment_method: z.string().optional(),
});

export type OrderBasicInfoInput = z.infer<typeof orderBasicInfoSchema>;

export const uploadOrderDraftFileSchema = z.object({
  orderNumber: z.string().trim().min(1, 'FIELD_REQUIRED'),
  file: z.custom<File>((v) => v instanceof File, { message: 'FILE_REQUIRED' }),
  design_group_id: z.number().int().positive().optional(),
});

export type UploadOrderDraftFileInput = z.infer<typeof uploadOrderDraftFileSchema>;

export const updateOrderStatusSchema = z.object({
  status: z.nativeEnum(OrderStatus, { message: 'FIELD_REQUIRED' }).or(z.string().min(1, 'FIELD_REQUIRED')),
});

export type OrderStatusInput = z.infer<typeof updateOrderStatusSchema>;
