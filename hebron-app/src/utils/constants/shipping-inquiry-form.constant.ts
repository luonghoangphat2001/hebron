import type { FileAttachmentREQ } from '@/data/files/files.request';
import type { InquiryCreateREQ, InquiryUpdateREQ } from '@/data/inquiries/inquiries.request';
import type { InquiryItemRESP } from '@/data/inquiries/inquiries.response';
import type { ShippingInquiryFormValues } from '@/schemas/shipping-inquiry/shipping-inquiry-form.schema';
import { ATTACHMENT_MAX_FILES, ATTACHMENT_MAX_SIZE_MB } from '@/utils/constants/attachment.constant';
import { InquiryCategory } from '@/utils/enums/inquiry.enum';
import { splitPhonePattern } from '@/utils/helper/common.helper';
import { toRemoteAttachmentValue } from '@/utils/helper/file.helper';

export const SHIPPING_INQUIRY_FORM_LABELS = {
  pageTitle: '문의하기',
  backToList: '출고/배송문의',
  order: '주문번호',
  orderPlaceholder: '주문번호',
  productPickerTitle: '주문번호',
  productPickerSearchPlaceholder: '상품명을 입력하세요',
  productPickerCategory: '카테고리',
  productPickerConfirm: '요청 보내기',
  title: '제목',
  titlePlaceholder: '제목을 입력해주세요',
  content: '내용',
  contentPlaceholder: '문의 내용을 입력해주세요',
  managerName: '담당자명',
  managerNamePlaceholder: '담당자명',
  contact: '연락처',
  contactPlaceholder: '연락처',
  contactInfo: '답변 등록시 안내 문자가 전송됩니다.',
  attachments: '첨부파일',
  attachmentInfo: `관련 파일이 있으시면 이곳에 첨부해주세요. (${ATTACHMENT_MAX_SIZE_MB}mb 이내)`,
  cancel: '취소',
  backToListButton: '목록으로',
  submitCreate: '작성하기',
  submitUpdate: '수정하기',
  submitMobile: '확인하기',
  loading: '불러오는 중...',
  createSuccess: '출고/배송문의가 등록되었습니다.',
  updateSuccess: '출고/배송문의가 수정되었습니다.',
  deleteSuccess: '출고/배송문의가 삭제되었습니다.',
  submitFailed: '출고/배송문의 저장에 실패했습니다.',
  deleteFailed: '출고/배송문의 삭제에 실패했습니다.',
  deleteConfirmTitle: '출고/배송문의 삭제',
  deleteConfirm: '이 출고/배송문의를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.',
} as const;

export const SHIPPING_INQUIRY_FORM_LIMITS = {
  contentMaxLength: 5000,
  attachmentMaxFiles: ATTACHMENT_MAX_FILES,
} as const;

export const SHIPPING_INQUIRY_FORM_DEFAULT_VALUES: ShippingInquiryFormValues = {
  productId: '',
  productName: '',
  productSpecs: '',
  title: '',
  content: '',
  managerName: '',
  contact: '',
  attachments: [],
};

export const mapInquiryToShippingFormValues = (inquiry: InquiryItemRESP): ShippingInquiryFormValues => ({
  productId: inquiry.product_id ? String(inquiry.product_id) : '',
  productName: inquiry.product?.name ?? '',
  productSpecs: inquiry.product?.sku ?? '',
  title: inquiry.title,
  content: inquiry.content,
  managerName: inquiry.author_name,
  contact: splitPhonePattern(inquiry.contact)?.formatted ?? inquiry.contact,
  attachments: inquiry.attachments.map(toRemoteAttachmentValue),
});

const normalizeContact = (contact: string) => contact.replace(/\D/g, '');

export const mapShippingFormToCreateREQ = (
  values: ShippingInquiryFormValues,
  attachments: FileAttachmentREQ[],
): InquiryCreateREQ => ({
  category: InquiryCategory.SHIPPING,
  product_id: Number(values.productId),
  title: values.title,
  content: values.content,
  contact: normalizeContact(values.contact),
  attachments,
});

export const mapShippingFormToUpdateREQ = (
  values: ShippingInquiryFormValues,
  attachments: FileAttachmentREQ[],
): InquiryUpdateREQ => ({
  category: InquiryCategory.SHIPPING,
  product_id: Number(values.productId),
  title: values.title,
  content: values.content,
  contact: normalizeContact(values.contact),
  attachments,
});
