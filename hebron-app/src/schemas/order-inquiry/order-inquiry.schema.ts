import { z } from 'zod';

export const ORDER_INQUIRY_ERROR_MESSAGES = {
  orderCodeRequired: '주문번호를 입력해주세요.',
  phoneRequired: '핸드폰번호를 입력해주세요.',
} as const;

export const orderInquirySchema = z.object({
  orderCode: z.string().min(1, ORDER_INQUIRY_ERROR_MESSAGES.orderCodeRequired),
  phone: z.string().min(1, ORDER_INQUIRY_ERROR_MESSAGES.phoneRequired),
});

export type OrderInquiryFormValues = z.infer<typeof orderInquirySchema>;
