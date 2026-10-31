import OrderDetailContent from '@/pages/ecommerce/my-page/orders/components/OrderDetailContent';
import type { OrderDetail } from '@/utils/types/my-page.type';

type OrderInquiryResultProps = {
  order: OrderDetail;
};

const OrderInquiryResult = ({ order }: OrderInquiryResultProps) => {
  return <OrderDetailContent order={order} showAddressChange={false} bordered />;
};

export default OrderInquiryResult;
