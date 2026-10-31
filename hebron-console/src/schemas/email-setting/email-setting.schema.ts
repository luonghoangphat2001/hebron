import { ERROR_MESSAGE } from '@/utils/constants/error-message.constant';
import { z } from 'zod';

export const emailSettingSchema = z.object({
  sender_email: z.string().min(1, ERROR_MESSAGE.FIELD_REQUIRED).email(ERROR_MESSAGE.EMAIL_INVALID),
  sender_name: z.string().min(1, ERROR_MESSAGE.FIELD_REQUIRED),
  receiver_emails: z.array(z.string().email(ERROR_MESSAGE.EMAIL_INVALID)).min(1, ERROR_MESSAGE.FIELD_REQUIRED),
});

export type EmailSettingInput = z.infer<typeof emailSettingSchema>;

export const emailSettingDefault: EmailSettingInput = {
  sender_email: '',
  sender_name: '',
  receiver_emails: [],
};
