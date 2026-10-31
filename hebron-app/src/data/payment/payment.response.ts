export type PaymentInitRESP = {
  transaction_id: string;
  payment_method: string;
  status: string;
  amount: number;
  currency: string;
};

export type PaymentConfirmRESP = {
  transaction_id: string;
  status: string;
  order: {
    order_number: string;
    payment_status: string;
  };
};
