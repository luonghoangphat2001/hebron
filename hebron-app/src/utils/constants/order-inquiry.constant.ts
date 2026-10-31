import type { OrderInquiryFormValues } from '@/schemas/order-inquiry/order-inquiry.schema';

export const ORDER_INQUIRY_LABELS = {
  title: '주문조회',
  descriptionLine1: '주문번호와 주문 시 입력하신',
  descriptionLine2: '핸드폰번호를 입력해주세요.',
  orderCodeLabel: '주문번호',
  phoneLabel: '핸드폰번호',
  orderCodePlaceholder: '주문번호',
  phonePlaceholder: '핸드폰번호',
  searchButton: '조회하기',
  noResults: '검색 결과가 없습니다.',
  quoteDownload: '견적서',
  transactionStatement: '거래명세서',
} as const;

export const ORDER_INQUIRY_DEFAULT_VALUES: OrderInquiryFormValues = {
  orderCode: '',
  phone: '',
};
