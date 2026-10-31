import type { AttachmentFileValue } from '@/components/upload/AttachmentFile';
import { ERROR_MESSAGE } from '@/utils/constants/error-message.constant';
import { PostingStatus, SiteType } from '@/utils/enums/common.enum';
import { ExposureLocation, NoticeType } from '@/utils/enums/content.enum';
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

export const noticeUpsertSchema = z.object({
  title: z.string().trim().min(1, ERROR_MESSAGE.FIELD_REQUIRED),
  content: z.string().trim().min(1, ERROR_MESSAGE.FIELD_REQUIRED),
  category: z.number().min(1, ERROR_MESSAGE.FIELD_REQUIRED),
  type: z.nativeEnum(NoticeType, { error: ERROR_MESSAGE.FIELD_REQUIRED }),
  site_type: z.nativeEnum(SiteType, { error: ERROR_MESSAGE.FIELD_REQUIRED }).default(SiteType.SHOPPING_MALL),
  is_pinned: z.boolean(),
  exposure_status: z.nativeEnum(PostingStatus, { error: ERROR_MESSAGE.FIELD_REQUIRED }),
  exposure_location: z.nativeEnum(ExposureLocation, { error: ERROR_MESSAGE.FIELD_REQUIRED }).default(ExposureLocation.MAIN),
  exposure_start_date: z.string().min(1, ERROR_MESSAGE.FIELD_REQUIRED),
  exposure_end_date: z.string().optional(),
  attachments: z.array(attachmentValueSchema),
});

export type NoticeInput = Omit<z.infer<typeof noticeUpsertSchema>, 'attachments'> & {
  attachments: AttachmentFileValue[];
};

export const noticeInputDefault: DefaultValues<NoticeInput> = {
  title: '',
  content: '',
  category: undefined as unknown as number,
  type: NoticeType.GENERAL,
  site_type: SiteType.SHOPPING_MALL,
  is_pinned: false,
  exposure_status: PostingStatus.EXPOSED,
  exposure_location: ExposureLocation.MAIN,
  exposure_start_date: '',
  exposure_end_date: '',
  attachments: [],
};
