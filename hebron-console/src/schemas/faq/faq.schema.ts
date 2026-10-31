import { ERROR_MESSAGE } from '@/utils/constants/error-message.constant';
import { PostingStatus, SiteType } from '@/utils/enums/common.enum';
import { ExposureTarget } from '@/utils/enums/content.enum';
import type { DefaultValues } from 'react-hook-form';
import { z } from 'zod';

export const faqUpsertSchema = z.object({
  category: z.string().trim().min(1, ERROR_MESSAGE.FIELD_REQUIRED),
  site_type: z.nativeEnum(SiteType, { error: ERROR_MESSAGE.FIELD_REQUIRED }),
  question: z.string().trim().min(1, ERROR_MESSAGE.FIELD_REQUIRED),
  answer: z.string().trim().min(1, ERROR_MESSAGE.FIELD_REQUIRED),
  sort_order: z.number().int().min(0, ERROR_MESSAGE.FIELD_REQUIRED),
  posting_status: z.nativeEnum(PostingStatus, { error: ERROR_MESSAGE.FIELD_REQUIRED }),
  exposure_target: z.array(z.nativeEnum(ExposureTarget)).min(1, ERROR_MESSAGE.FIELD_REQUIRED),
});

export type FAQInput = z.infer<typeof faqUpsertSchema>;

export const faqInputDefault: DefaultValues<FAQInput> = {
  category: '',
  site_type: undefined,
  sort_order: 0,
  posting_status: PostingStatus.EXPOSED,
  exposure_target: [ExposureTarget.ALL],
  question: '',
  answer: '',
};
