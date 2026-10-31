import { ATTACHMENT_MAX_FILES, ATTACHMENT_MAX_SIZE_MB } from '@/utils/constants/attachment.constant';
import type { FileAttachmentREQ } from '@/data/files/files.request';
import type { InquiryCreateREQ, InquiryUpdateREQ } from '@/data/inquiries/inquiries.request';
import type { InquiryItemRESP } from '@/data/inquiries/inquiries.response';
import type { ReworkRequestFormValues } from '@/schemas/rework-request/rework-request-form.schema';
import { InquiryCategory } from '@/utils/enums/inquiry.enum';
import { toRemoteAttachmentValue } from '@/utils/helper/file.helper';
import { splitPhonePattern } from '@/utils/helper/common.helper';

export const REWORK_REQUEST_FORM_LABELS = {
  pageTitle: '문의하기',
  backToList: '재작업 신청',
  product: '선택상품',
  productPlaceholder: '상품',
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
  attachmentRequired: '첨부파일을 1개 이상 등록해주세요.',
  cancel: '취소',
  backToListButton: '목록으로',
  submitCreate: '작성하기',
  submitUpdate: '수정하기',
  submitMobile: '확인하기',
  loading: '불러오는 중...',
  createSuccess: '재작업 신청이 등록되었습니다.',
  updateSuccess: '재작업 신청이 수정되었습니다.',
  deleteSuccess: '재작업 신청이 삭제되었습니다.',
  submitFailed: '재작업 신청 저장에 실패했습니다.',
  deleteFailed: '재작업 신청 삭제에 실패했습니다.',
  deleteConfirmTitle: '재작업 신청 삭제',
  deleteConfirm: '이 재작업 신청을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.',
  productPickerTitle: '선택상품',
  productPickerSearchPlaceholder: '상품명을 입력하세요',
  productPickerCategory: '카테고리',
  productPickerConfirm: '요청 보내기',
} as const;

export const REWORK_REQUEST_FORM_LIMITS = {
  contentMaxLength: 5000,
  attachmentMaxFiles: ATTACHMENT_MAX_FILES,
} as const;

export const REWORK_REQUEST_FORM_DEFAULT_VALUES: ReworkRequestFormValues = {
  productId: '',
  productName: '',
  productSpecs: '',
  title: '',
  content: '',
  managerName: '',
  contact: '',
  attachments: [],
};

export const mapInquiryToReworkFormValues = (inquiry: InquiryItemRESP): ReworkRequestFormValues => ({
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

export const mapReworkFormToCreateREQ = (
  values: ReworkRequestFormValues,
  attachments: FileAttachmentREQ[],
): InquiryCreateREQ => ({
  category: InquiryCategory.REWORK,
  product_id: Number(values.productId),
  title: values.title,
  content: values.content,
  contact: normalizeContact(values.contact),
  attachments,
});

export const mapReworkFormToUpdateREQ = (
  values: ReworkRequestFormValues,
  attachments: FileAttachmentREQ[],
): InquiryUpdateREQ => ({
  category: InquiryCategory.REWORK,
  product_id: Number(values.productId),
  title: values.title,
  content: values.content,
  contact: normalizeContact(values.contact),
  attachments,
});
