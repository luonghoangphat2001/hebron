import { ERROR_MESSAGE } from '@/utils/constants/error-message.constant';
import { z } from 'zod';

export const bankAccountSchema = z.object({
  bank_name: z.string().trim().min(1, ERROR_MESSAGE.FIELD_REQUIRED),
  account_number: z.string().trim().min(1, ERROR_MESSAGE.FIELD_REQUIRED),
  account_holder: z.string().trim().min(1, ERROR_MESSAGE.FIELD_REQUIRED),
});

export type BankAccountInput = z.infer<typeof bankAccountSchema>;

export const bankAccountDefault: BankAccountInput = {
  bank_name: '',
  account_number: '',
  account_holder: '',
};
