import { PaymentStatus } from '../enums/payment.enum';

export const PAYMENT_STATUS_BADGE: Record<PaymentStatus, string> = {
  [PaymentStatus.PENDING]: 'bg-amber-100 text-amber-600 rounded-sm',
  [PaymentStatus.PROCESSING]: 'bg-blue-100 text-blue-600 rounded-sm',
  [PaymentStatus.PAID]: 'bg-green-100 text-green-600 rounded-sm',
  [PaymentStatus.FAILED]: 'bg-red-100 text-red-600 rounded-sm',
  [PaymentStatus.CANCELLED]: 'bg-gray-100 text-gray-600 rounded-sm',
  [PaymentStatus.REFUNDED]: 'bg-slate-100 text-slate-600 rounded-sm',
  [PaymentStatus.PARTIALLY_REFUNDED]: 'bg-orange-100 text-orange-600 rounded-sm',
  [PaymentStatus.EXPIRED]: 'bg-rose-100 text-rose-600 rounded-sm',
};

// Statuses with nothing left to refund.
export const PAYMENT_NON_REFUNDABLE_STATUS: PaymentStatus[] = [
  PaymentStatus.REFUNDED,
  PaymentStatus.CANCELLED,
  PaymentStatus.FAILED,
  PaymentStatus.EXPIRED,
];
