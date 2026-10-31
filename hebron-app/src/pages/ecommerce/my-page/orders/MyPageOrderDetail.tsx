import { Typography } from '@/components/typography/Typography';
import { useMyPageOrderDetailQuery } from '@/data/orders/mypage-orders.query';
import { mapOrderToOrderDetail } from '@/data/orders/orders.mapper';
import MyPageDetailBackLink from '@/pages/ecommerce/my-page/components/MyPageDetailBackLink';
import OrderDetailContent from '@/pages/ecommerce/my-page/orders/components/OrderDetailContent';
import { ORDER_TABLE_PAGE_LABELS } from '@/utils/constants/orders.constant';
import { getMyPageOrdersPath } from '@/utils/constants/route.constant';
import { Navigate, useParams } from 'react-router-dom';

const MyPageOrderDetail = () => {
  const { orderId = '' } = useParams();
  const { data, isLoading, isError } = useMyPageOrderDetailQuery(orderId, {
    enabled: Boolean(orderId),
  });

  const order = data?.data.order ? mapOrderToOrderDetail(data.data.order) : null;

  if (!orderId || isError || (!isLoading && !order)) {
    return <Navigate to={getMyPageOrdersPath()} replace />;
  }

  if (isLoading || !order) {
    return (
      <div className='flex w-full min-w-0 flex-col gap-6 sm:gap-8'>
        <MyPageDetailBackLink to={getMyPageOrdersPath()} label='주문/배송 조회' />
        <Typography className='text-md text-neutral-500'>{ORDER_TABLE_PAGE_LABELS.loading}</Typography>
      </div>
    );
  }

  return (
    <div className='flex w-full min-w-0 flex-col gap-6 sm:gap-8'>
      <MyPageDetailBackLink to={getMyPageOrdersPath()} label='주문/배송 조회' />

      <OrderDetailContent order={order} />
    </div>
  );
};

export default MyPageOrderDetail;
