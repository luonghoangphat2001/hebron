import { InquiryCategory, InquiryStatus } from '@/utils/enums/inquiry.enum';
import { QuoteStatus } from '@/utils/enums/quote.enum';
import type { QuoteItem } from '@/utils/types/quote.type';

export const QUOTE_TABLE_LABELS = {
  createdAt: '작성일',
  category: '구분',
  title: '제목',
  managerName: '담당자명',
  phone: '휴대전화',
  status: '진행상태',
  empty: '등록된 견적문의가 없습니다.',
  loading: '불러오는 중...',
  pageTitle: '견적문의',
  inquire: '문의하기',
} as const;

export const INQUIRY_CATEGORY_LABELS: Record<InquiryCategory, string> = {
  [InquiryCategory.PRODUCT]: '상품',
  [InquiryCategory.QUOTE]: '견적',
  [InquiryCategory.SHIPPING]: '배송',
  [InquiryCategory.PAYMENT]: '결제',
  [InquiryCategory.REWORK]: '재작업',
  [InquiryCategory.REFUND]: '환불',
  [InquiryCategory.DELIVERY]: '납품',
};

export const INQUIRY_STATUS_LABELS: Record<InquiryStatus, string> = {
  [InquiryStatus.PENDING]: '확인중',
  [InquiryStatus.ANSWERED]: '답변완료',
};

export const getInquiryCategoryLabel = (category: string, categoryLabel?: string) =>
  categoryLabel ?? INQUIRY_CATEGORY_LABELS[category as InquiryCategory] ?? category;

export const getInquiryStatusLabel = (status: string, statusLabel?: string) =>
  statusLabel ?? INQUIRY_STATUS_LABELS[status as InquiryStatus] ?? status;

const QUOTE_TITLE = '제목 제목 제목 제목 제목 제목 제목 제목';

export const MOCK_QUOTE_LIST: QuoteItem[] = Array.from({ length: 30 }, (_, index) => ({
  id: String(index + 1),
  createdAt: '2025.09.19',
  category: '안내',
  title: QUOTE_TITLE,
  managerName: '홍길동',
  phone: '010-0000-0000',
  status: index === 1 ? QuoteStatus.ANSWERED : QuoteStatus.CHECKING,
  isNew: index < 4,
}));

export const getQuoteById = (quoteId: string) => MOCK_QUOTE_LIST.find((quote) => quote.id === quoteId);
