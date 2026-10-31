export type PaymentInitREQ = {
  order_number: string;
  payment_method: string;
  bank_account_holder?: string;
  return_url?: string | null;
  metadata?: unknown[];
};

export type PaymentConfirmREQ = {
  paymentKey: string;
  orderNumber: string;
  amount: number;
};
