import { appToast } from '@/components/toast/AppToast';
import { Button } from '@/components/ui/button';
import { useConfirmPaymentMutation, useInitPaymentMutation } from '@/data/payment/payment.query';
import { MY_ROUTE } from '@/utils/constants/route.constant';
import { OrderPaymentMethod } from '@/utils/enums/order.enum';
import type { ErrorRESP } from '@/utils/types/response.type';
import type { AxiosError } from 'axios';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';

const CheckoutSuccessPage = () => {
  const { t: tCommon } = useTranslation('common');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const processedRef = useRef(false);
  const [errorMessage, setErrorMessage] = useState<string>();
  const { mutateAsync: initPayment } = useInitPaymentMutation();
  const { mutateAsync: confirmPayment } = useConfirmPaymentMutation();
  const paymentKey = searchParams.get('paymentKey');
  const orderId = searchParams.get('orderId');
  const amountParam = searchParams.get('amount');
  const amount = Number(amountParam);
  const hasValidPaymentParams = Boolean(paymentKey && orderId && amountParam && Number.isFinite(amount));

  useEffect(() => {
    if (processedRef.current || !hasValidPaymentParams || !paymentKey || !orderId) return;
    processedRef.current = true;

    void (async () => {
      try {
        await initPayment({
          order_number: orderId,
          payment_method: OrderPaymentMethod.TOSS,
        });
        await confirmPayment({ paymentKey, orderNumber: orderId, amount });
        navigate(`${MY_ROUTE.CHECKOUT_RESULT}?orderNumber=${encodeURIComponent(orderId)}`, { replace: true });
      } catch (error) {
        const message = (error as AxiosError<ErrorRESP>).response?.data.message ?? tCommon('notify.something_went_wrong');
        setErrorMessage(message);
        appToast.error(message);
      }
    })();
  }, [amount, confirmPayment, hasValidPaymentParams, initPayment, navigate, orderId, paymentKey, tCommon]);

  const paymentError = hasValidPaymentParams ? errorMessage : tCommon('notify.something_went_wrong');

  if (paymentError) {
    return (
      <section className='mx-auto flex min-h-96 max-w-125 flex-col items-center justify-center gap-4 px-4 text-center'>
        <h2 className='text-display-xs font-bold'>결제 처리에 실패했습니다.</h2>
        <p className='text-sm text-neutral-500'>{paymentError}</p>
        <Button variant='outline' onClick={() => navigate(MY_ROUTE.CHECKOUT)}>
          {tCommon('button.cancel')}
        </Button>
      </section>
    );
  }

  return (
    <section className='mx-auto flex min-h-96 max-w-125 flex-col items-center justify-center gap-4 px-4 text-center'>
      <div className='size-10 animate-spin rounded-full border-4 border-neutral-200 border-t-red-500' />
      <h2 className='text-display-xs font-bold'>결제를 승인하고 있습니다.</h2>
      <p className='text-sm text-neutral-500'>결제 정보를 확인 중입니다. 잠시만 기다려 주세요.</p>
    </section>
  );
};

export default CheckoutSuccessPage;
