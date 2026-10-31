import { ERROR_MESSAGE } from '@/utils/constants/error-message.constant';
import { Status } from '@/utils/enums/common.enum';
import type { DefaultValues } from 'react-hook-form';
import { z } from 'zod';

export const permissionUpsertSchema = z.object({
  name: z.string().min(1, ERROR_MESSAGE.FIELD_REQUIRED),
  description: z.string().optional().default(''),
  usage_status: z.enum(Status, { error: ERROR_MESSAGE.FIELD_REQUIRED }),
});

export type PermissionInput = z.infer<typeof permissionUpsertSchema>;

export const permissionInputDefault: DefaultValues<PermissionInput> = {
  name: '',
  description: '',
  usage_status: Status.ACTIVE,
};

export const permissionCopySchema = z.object({
  name: z.string().min(1, ERROR_MESSAGE.FIELD_REQUIRED),
  usage_status: z.enum(Status, { error: ERROR_MESSAGE.FIELD_REQUIRED }),
});

export type PermissionCopyInput = z.infer<typeof permissionCopySchema>;

export const permissionCopyInputDefault: DefaultValues<PermissionCopyInput> = {
  name: '',
  usage_status: Status.ACTIVE,
};
