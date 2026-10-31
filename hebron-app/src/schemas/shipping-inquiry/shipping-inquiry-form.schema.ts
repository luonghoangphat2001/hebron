import { attachmentValueSchema } from '@/schemas/attachment/attachment-value.schema';
import { SHIPPING_INQUIRY_FORM_LIMITS } from '@/utils/constants/shipping-inquiry-form.constant';
import { z } from 'zod';

export const SHIPPING_INQUIRY_FORM_ERROR_MESSAGES = {
  productRequired: '주문번호를 선택해주세요.',
  titleRequired: '제목을 입력해주세요.',
  contentRequired: '내용을 입력해주세요.',
  managerNameRequired: '담당자명을 입력해주세요.',
  contactRequired: '연락처를 입력해주세요.',
} as const;

export const shippingInquiryFormSchema = z.object({
  productId: z.string().min(1, SHIPPING_INQUIRY_FORM_ERROR_MESSAGES.productRequired),
  productName: z.string(),
  productSpecs: z.string(),
  title: z.string().min(1, SHIPPING_INQUIRY_FORM_ERROR_MESSAGES.titleRequired),
  content: z
    .string()
    .min(1, SHIPPING_INQUIRY_FORM_ERROR_MESSAGES.contentRequired)
    .max(SHIPPING_INQUIRY_FORM_LIMITS.contentMaxLength),
  managerName: z.string().min(1, SHIPPING_INQUIRY_FORM_ERROR_MESSAGES.managerNameRequired),
  contact: z.string().min(1, SHIPPING_INQUIRY_FORM_ERROR_MESSAGES.contactRequired),
  attachments: z.array(attachmentValueSchema).max(SHIPPING_INQUIRY_FORM_LIMITS.attachmentMaxFiles),
});

export type ShippingInquiryFormValues = z.infer<typeof shippingInquiryFormSchema>;
