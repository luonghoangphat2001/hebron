import { attachmentValueSchema } from '@/schemas/attachment/attachment-value.schema';
import { QUOTE_FORM_LIMITS } from '@/utils/constants/quote-form.constant';
import { z } from 'zod';

export const QUOTE_FORM_ERROR_MESSAGES = {
  productRequired: '상품을 선택해주세요.',
  titleRequired: '제목을 입력해주세요.',
  contentRequired: '내용을 입력해주세요.',
  managerNameRequired: '담당자명을 입력해주세요.',
  contactRequired: '연락처를 입력해주세요.',
} as const;

export const quoteFormSchema = z.object({
  productId: z.string().min(1, QUOTE_FORM_ERROR_MESSAGES.productRequired),
  productName: z.string(),
  productSpecs: z.string(),
  title: z.string().min(1, QUOTE_FORM_ERROR_MESSAGES.titleRequired),
  content: z.string().min(1, QUOTE_FORM_ERROR_MESSAGES.contentRequired).max(QUOTE_FORM_LIMITS.contentMaxLength),
  managerName: z.string().optional(),
  contact: z.string().min(1, QUOTE_FORM_ERROR_MESSAGES.contactRequired),
  attachments: z.array(attachmentValueSchema).max(QUOTE_FORM_LIMITS.attachmentMaxFiles),
});

export type QuoteFormValues = z.infer<typeof quoteFormSchema>;
