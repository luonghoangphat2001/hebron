import type { AttachmentFileValue } from '@/components/upload/AttachmentFile';
import { ERROR_MESSAGE } from '@/utils/constants/error-message.constant';
import { PostingStatus } from '@/utils/enums/common.enum';
import { GuideType } from '@/utils/enums/content.enum';
import type { DefaultValues } from 'react-hook-form';
import { z } from 'zod';

const attachmentValueSchema = z.object({
  localId: z.string(),
  name: z.string(),
  size: z.number(),
  mime_type: z.string(),
  file: z.any().optional(),
  remote: z.any().optional(),
});

export const guideUpsertSchema = z.object({
  title: z.string().trim().min(1, ERROR_MESSAGE.FIELD_REQUIRED),
  content: z.string().trim().min(1, ERROR_MESSAGE.FIELD_REQUIRED),
  type: z.nativeEnum(GuideType, { error: ERROR_MESSAGE.FIELD_REQUIRED }),
  exposure_status: z.nativeEnum(PostingStatus, { error: ERROR_MESSAGE.FIELD_REQUIRED }),
  exposure_start_date: z.string().min(1, ERROR_MESSAGE.FIELD_REQUIRED),
  exposure_end_date: z.string().optional(),
  attachments: z.array(attachmentValueSchema),
});

export type GuideInput = Omit<z.infer<typeof guideUpsertSchema>, 'attachments'> & {
  attachments: AttachmentFileValue[];
};

export const guideInputDefault: DefaultValues<GuideInput> = {
  title: '',
  content: '',
  type: GuideType.PRODUCTION_GUIDE,
  exposure_status: PostingStatus.EXPOSED,
  exposure_start_date: '',
  exposure_end_date: '',
  attachments: [],
};
