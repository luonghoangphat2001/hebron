import { ERROR_MESSAGE } from '@/utils/constants/error-message.constant';
import type { DefaultValues } from 'react-hook-form';
import { z } from 'zod';
import { commonSchema } from '..';

export const adminUpsertSchema = (isUpdate = false) =>
  z.object({
    username: isUpdate ? z.string().optional().default('') : commonSchema.requiredString,
    password: isUpdate ? z.string().optional().default('') : commonSchema.password,
    name: commonSchema.requiredString,
    email: commonSchema.requiredString.email(ERROR_MESSAGE.EMAIL_INVALID),
    phone: commonSchema.requiredString.regex(/^\d{11}$/, ERROR_MESSAGE.PHONE_INVALID),
    permission: z.number({ error: ERROR_MESSAGE.FIELD_REQUIRED }),
    status: z.boolean(),
  });

export type AdminInput = z.infer<ReturnType<typeof adminUpsertSchema>>;

export const adminInputDefault: DefaultValues<AdminInput> = {
  username: '',
  password: '',
  name: '',
  email: '',
  phone: '',
  permission: undefined,
  status: true,
};

export const adminChangePasswordSchema = z
  .object({
    password: commonSchema.password,
    passwordConfirmation: commonSchema.password,
  })
  .refine((data) => data.password === data.passwordConfirmation, {
    path: ['passwordConfirmation'],
    message: 'PASSWORD_CONFIRM_INVALID',
  });

export type AdminChangePasswordInput = z.infer<typeof adminChangePasswordSchema>;

export const adminChangePasswordDefault: AdminChangePasswordInput = {
  password: '',
  passwordConfirmation: '',
};
