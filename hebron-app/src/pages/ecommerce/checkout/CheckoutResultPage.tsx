import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useBankAccountQuery } from '@/data/bank-account/bank-account.query';
import { useCartQuery } from '@/data/cart/cart.query';
import { useOrderDetailQuery } from '@/data/orders/orders.query';
import { getMyPageOrderDetailPath, MY_ROUTE } from '@/utils/constants/route.constant';
import { OrderPaymentMethod } from '@/utils/enums/order.enum';
import { ArrowRightIcon, CheckIcon } from '@phosphor-icons/react';
import { MagnifyingGlassIcon } from '@phosphor-icons/react/dist/ssr';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import CardPaymentInfo from './components/result/CardPaymentInfo';
import OrderInformation from './components/result/OrderInformation';
import OrderItemInfo from './components/result/OrderItemInfo';

const CheckoutResultPage = () => {
  const { t: tCommon } = useTranslation('common');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isLoggedIn } = useAuth();
  const orderNumber = searchParams.get('orderNumber')?.trim() || '';
  const { data: orderDetail, isLoading: isOrderLoading } = useOrderDetailQuery(orderNumber);
  const { refetch: refetchCart } = useCartQuery({ enabled: false });
  const order = orderDetail?.data.order;
  const isBankTransfer = order?.payment_method === OrderPaymentMethod.TRANSFER;
  const { data: bankAccountData, isLoading: isBankAccountLoading } = useBankAccountQuery({ enabled: isBankTransfer });

  useEffect(() => {
    void refetchCart();
  }, [refetchCart]);

  const backToProductList = () => {
    navigate(MY_ROUTE.PRODUCT_LIST);
  };

  const viewOrderDetail = () => {
    navigate(getMyPageOrderDetailPath(orderNumber));
  };

  const toOrderInquiry = () => {
    navigate(MY_ROUTE.ORDER_INQUIRY);
  };

  return (
    <section className='mx-auto max-w-180 space-y-12 pb-6'>
      <section className='flex flex-col items-center gap-2'>
        <div className='flex size-16 items-center justify-center rounded-full bg-[#E8F5EC]'>
          <CheckIcon className='size-8 text-[#4CAF50]' weight='bold' />
        </div>
        <h2 className='text-display-xs md:text-display-sm font-bold'>{tCommon('title.order_successfully_completed')}</h2>
        {isBankTransfer && <p className='text-md md:text-lg'>{tCommon('title.bank_transfer_instruction')}</p>}
      </section>
      <section className='space-y-4'>
        {isOrderLoading ? (
          <p className='py-8 text-center text-sm text-neutral-500'>주문 정보를 불러오는 중입니다.</p>
        ) : (
          <>
            {isBankTransfer && (
              <CardPaymentInfo bankAccount={bankAccountData?.data.bank_account} isLoading={isBankAccountLoading} />
            )}
            <OrderInformation order={order} />
            <OrderItemInfo order={order} />
          </>
        )}
        {!isLoggedIn && (
          <div
            className='flex cursor-pointer items-center justify-between gap-2 rounded-lg border border-neutral-200 p-3 hover:bg-neutral-50'
            onClick={toOrderInquiry}>
            <div className='flex items-start gap-2'>
              <MagnifyingGlassIcon className='size-6 text-neutral-500' weight='duotone' />
              <div className='space-y-0.5'>
                <p className='text-lg font-medium'>{tCommon('title.non_member_order_inquiry')}</p>
                <p className='text-sm text-neutral-500'>{tCommon('title.check_order_by_number_and_phone')}</p>
              </div>
            </div>
            <ArrowRightIcon className='size-6' weight='bold' />
          </div>
        )}
      </section>
      <div className='flex justify-center gap-4'>
        <Button variant='outline' size='md' className='flex-1 md:flex-none' onClick={backToProductList}>
          {tCommon('button.continue_shopping_view')}
        </Button>
        {isLoggedIn && (
          <Button size='md' className='flex-1 md:flex-none' disabled={!orderNumber} onClick={viewOrderDetail}>
            {tCommon('button.view_order_detail')}
          </Button>
        )}
      </div>
    </section>
  );
};

export default CheckoutResultPage;
