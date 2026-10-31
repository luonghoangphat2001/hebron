import { attachmentValueSchema } from '@/schemas/attachment/attachment-value.schema';
import { BRAND_CONTACT_FORM_LIMITS } from '@/utils/constants/brand-contact-form.constant';
import { PHONE_NUMBER_REGEX } from '@/utils/constants/regex.constant';
import { ProductType } from '@/utils/enums/product.enum';
import { z } from 'zod';

export const BRAND_CONTACT_FORM_ERROR_MESSAGES = {
  inquiryTypeRequired: '문의 유형을 선택해주세요.',
  companyNameRequired: '회사명을 입력해주세요.',
  managerNameRequired: '담당자명을 입력해주세요.',
  contactRequired: '연락처를 입력해주세요.',
  contactInvalid: '올바른 연락처 형식을 입력해주세요.',
  emailRequired: '이메일을 입력해주세요.',
  emailInvalid: '올바른 이메일 형식을 입력해주세요.',
  contentRequired: '문의 내용을 입력해주세요.',
  attachmentRequired: '첨부파일을 1개 이상 등록해주세요.',
} as const;

export const brandContactFormSchema = z.object({
  inquiryType: z.enum(ProductType, { error: BRAND_CONTACT_FORM_ERROR_MESSAGES.inquiryTypeRequired }),
  companyName: z.string().min(1, BRAND_CONTACT_FORM_ERROR_MESSAGES.companyNameRequired),
  managerName: z.string().min(1, BRAND_CONTACT_FORM_ERROR_MESSAGES.managerNameRequired),
  contact: z
    .string()
    .min(1, BRAND_CONTACT_FORM_ERROR_MESSAGES.contactRequired)
    .regex(PHONE_NUMBER_REGEX, BRAND_CONTACT_FORM_ERROR_MESSAGES.contactInvalid),
  email: z.string().min(1, BRAND_CONTACT_FORM_ERROR_MESSAGES.emailRequired).email(BRAND_CONTACT_FORM_ERROR_MESSAGES.emailInvalid),
  content: z.string().min(1, BRAND_CONTACT_FORM_ERROR_MESSAGES.contentRequired).max(BRAND_CONTACT_FORM_LIMITS.contentMaxLength),
  attachments: z
    .array(attachmentValueSchema)
    .min(1, BRAND_CONTACT_FORM_ERROR_MESSAGES.attachmentRequired)
    .max(BRAND_CONTACT_FORM_LIMITS.attachmentMaxFiles),
});

export type BrandContactFormValues = z.infer<typeof brandContactFormSchema>;
