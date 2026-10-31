import { ERROR_MESSAGE } from '@/utils/constants/error-message.constant';
import { PASSWORD_REGEX } from '@/utils/constants/regex.constant';
import { z } from 'zod';

export const commonSchema = {
  password: z.string().min(1, ERROR_MESSAGE.PASSWORD_REQUIRED).regex(PASSWORD_REGEX, ERROR_MESSAGE.PASSWORD_INVALID),
  requiredString: z.string().min(1, ERROR_MESSAGE.FIELD_REQUIRED),
  // attachments: (maxFiles: number) =>
  //   z
  //     .array(
  //       z.object({
  //         filename: z.string(),
  //         url: z.string(),
  //         key: z.string().optional(),
  //         size: z.number().optional(),
  //         mimeType: z.string().optional(),
  //       }),
  //     )
  //     .max(maxFiles, `최대 ${maxFiles}개까지 업로드 가능합니다.`),
};
