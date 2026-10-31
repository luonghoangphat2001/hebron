import { Button } from '@/components/ui/button';
import { MY_ROUTE } from '@/utils/constants/route.constant';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';

const CheckoutFailPage = () => {
  const { t: tCommon } = useTranslation('common');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const message = searchParams.get('message');
  const code = searchParams.get('code');
  const orderNumber = searchParams.get('orderId') || searchParams.get('orderNumber');

  return (
    <section className='mx-auto flex min-h-96 max-w-125 flex-col items-center justify-center gap-4 px-4 text-center'>
      <h2 className='text-display-xs font-bold'>결제가 완료되지 않았습니다.</h2>
      <p className='text-sm text-neutral-500'>결제 과정에서 문제가 발생했습니다. 다시 시도해 주세요.</p>
      {(message || code || orderNumber) && (
        <div className='w-full rounded-lg bg-neutral-50 p-4 text-left text-sm text-neutral-600'>
          {message && <p>{message}</p>}
          {code && <p>오류 코드: {code}</p>}
          {orderNumber && <p>주문번호: {orderNumber}</p>}
        </div>
      )}
      <Button variant='outline' onClick={() => navigate(MY_ROUTE.CHECKOUT)}>
        {tCommon('button.cancel')}
      </Button>
    </section>
  );
};

export default CheckoutFailPage;
