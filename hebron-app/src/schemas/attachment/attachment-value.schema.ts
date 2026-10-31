import type { FileAttachmentREQ } from '@/data/files/files.request';
import { z } from 'zod';

export const fileAttachmentReqSchema = z.object({
  file_path: z.string(),
  file_name: z.string(),
  file_size: z.number(),
  file_type: z.string(),
}) satisfies z.ZodType<FileAttachmentREQ>;

const localAttachmentDraftSchema = z.object({
  localId: z.string(),
  file: z.instanceof(File),
});

const remoteAttachmentValueSchema = fileAttachmentReqSchema.extend({
  localId: z.string(),
});

export const attachmentValueSchema = z.union([localAttachmentDraftSchema, remoteAttachmentValueSchema]);
