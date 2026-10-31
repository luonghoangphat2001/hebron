import { ERROR_MESSAGE } from '@/utils/constants/error-message.constant';
import { PASSWORD_REGEX } from '@/utils/constants/regex.constant';
import { z } from 'zod';

export const commonSchema = {
  password: z.string().min(1, ERROR_MESSAGE.PASSWORD_REQUIRED).regex(PASSWORD_REGEX, ERROR_MESSAGE.PASSWORD_INVALID),
  requiredString: z.string().min(1, ERROR_MESSAGE.FIELD_REQUIRED),
};
