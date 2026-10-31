import type { BrandContactUsCreateREQ } from '@/data/brand-contact-us/brand-contact-us.request';
import type { FileAttachmentREQ } from '@/data/files/files.request';
import type { BrandContactFormValues } from '@/schemas/brand-contact/brand-contact-form.schema';
import { ATTACHMENT_MAX_FILES } from '@/utils/constants/attachment.constant';
import { SiteType } from '@/utils/enums/common.enum';
import type { DefaultValues } from 'react-hook-form';

export const BRAND_CONTACT_FORM_LABELS = {
  pageTitle: '문의하기',
  inquiryType: '문의 유형',
  inquiryTypePlaceholder: '문의 유형을 선택해주세요',
  companyName: '회사명',
  companyNamePlaceholder: '회사명',
  managerName: '담당자명',
  managerNamePlaceholder: '담당자명',
  contact: '연락처',
  contactPlaceholder: '010-0000-0000',
  email: '이메일',
  emailPlaceholder: 'abc@naver.com',
  content: '문의 내용',
  contentPlaceholder: '문의 내용을 입력해주세요',
  attachments: '첨부 파일',
  submit: '문의하기',
  submitting: '전송 중...',
  submitSuccess: '문의가 정상적으로 접수되었습니다.',
  submitFailed: '문의 접수에 실패했습니다. 잠시 후 다시 시도해주세요.',
} as const;

export const BRAND_CONTACT_FORM_LIMITS = {
  contentMaxLength: 500,
  attachmentMaxFiles: ATTACHMENT_MAX_FILES,
} as const;

export const BRAND_CONTACT_FORM_DEFAULT_VALUES: DefaultValues<BrandContactFormValues> = {
  inquiryType: undefined,
  companyName: '',
  managerName: '',
  contact: '',
  email: '',
  content: '',
  attachments: [],
};

export const mapBrandContactFormToCreateREQ = (
  values: BrandContactFormValues,
  attachments: FileAttachmentREQ[],
): BrandContactUsCreateREQ => ({
  product_type: values.inquiryType,
  // ponytail: this form is only mounted on the brand router.
  site_type: SiteType.BRAND_SITE,
  company_name: values.companyName,
  manager_name: values.managerName,
  phone: values.contact,
  email: values.email,
  message: values.content,
  attachments,
});

export const BRAND_CONTACT_MAP_LOCATION = {
  address: '07271 서울특별시 영등포구 양산로 57-5 (양평동3가) 양평동 이노플렉스 1105호',
  latitude: 37.52895,
  longitude: 126.89147,
} as const;
