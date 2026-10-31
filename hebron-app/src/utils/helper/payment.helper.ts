import { loadTossPayments } from '@tosspayments/tosspayments-sdk';
import { TOSS_CLIENT_KEY } from '../constants/common.constant';
import { MY_ROUTE } from '../constants/route.constant';

export type PaymentOrder = {
  orderNumber: string;
  amount: number;
  customerName?: string;
  customerEmail?: string;
  customerMobilePhone?: string;
};

export const handlePayment = async (onCancelPayment: () => void, order?: PaymentOrder) => {
  if (!order) return;

  try {
    const tossPayments = await loadTossPayments(TOSS_CLIENT_KEY as string);
    // @docs https://docs.tosspayments.com/sdk/v2/js#tosspaymentspayment
    const payment = tossPayments.payment({
      customerKey: 'TEST',
    });

    const successUrl = `${window.location.origin}${MY_ROUTE.CHECKOUT_SUCCESS}`;
    const failUrl = `${window.location.origin}${MY_ROUTE.CHECKOUT_FAIL}`;

    // const successUrl = order?.userCoupon ? `${baseSuccessUrl}?userCoupon=${order.userCoupon}` : baseSuccessUrl;

    await payment.requestPayment({
      method: 'CARD',
      amount: {
        currency: 'KRW',
        value: Math.round(order.amount || 0),
      },
      orderId: order.orderNumber,
      orderName: order.orderNumber,
      successUrl,
      failUrl,
      customerName: order.customerName,
      customerEmail: order.customerEmail,
      customerMobilePhone: order.customerMobilePhone,
      card: {
        useEscrow: false,
        flowMode: 'DEFAULT',
        useCardPoint: false,
        useAppCardOnly: false,
      },
    });
  } catch (error: unknown) {
    onCancelPayment();
    console.log(error);
  }
};
