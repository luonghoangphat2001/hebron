import { mapOrderToOrderDetail } from '@/data/orders/orders.mapper';
import { useOrderInquiryDetailMutation } from '@/data/orders/orders.query';
import OrderInquiryBanner from '@/pages/ecommerce/order-inquiry/components/OrderInquiryBanner';
import OrderInquiryResult from '@/pages/ecommerce/order-inquiry/components/OrderInquiryResult';
import OrderInquirySearchForm from '@/pages/ecommerce/order-inquiry/components/OrderInquirySearchForm';
import type { OrderInquiryFormValues } from '@/schemas/order-inquiry/order-inquiry.schema';
import { ORDER_INQUIRY_LABELS } from '@/utils/constants/order-inquiry.constant';
import type { OrderDetail } from '@/utils/types/my-page.type';
import { useState } from 'react';

type SearchState = 'idle' | 'not_found' | 'found';

const OrderInquiryPage = () => {
  const [searchState, setSearchState] = useState<SearchState>('idle');
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const inquiryDetailMutation = useOrderInquiryDetailMutation();

  const handleSearch = (values: OrderInquiryFormValues) => {
    inquiryDetailMutation.mutate(
      {
        order_number: values.orderCode.trim(),
        mobile_phone: values.phone.trim(),
      },
      {
        onSuccess: (response) => {
          const result = response.data.order ? mapOrderToOrderDetail(response.data.order) : null;
          if (!result) {
            setOrder(null);
            setSearchState('not_found');
            return;
          }

          setOrder(result);
          setSearchState('found');
        },
        onError: () => {
          setOrder(null);
          setSearchState('not_found');
        },
      },
    );
  };

  const isSubmitting = inquiryDetailMutation.isPending;

  return (
    <section className='mx-auto flex w-full max-w-180 min-w-0 flex-col gap-6 py-6 md:py-21'>
      <OrderInquiryBanner />

      <div className='flex w-full flex-col gap-8 md:gap-10'>
        <OrderInquirySearchForm onSubmit={handleSearch} isSubmitting={isSubmitting} />

        {searchState === 'not_found' ? (
          <p className='md:text-md text-brand text-center text-sm font-medium' role='status'>
            {ORDER_INQUIRY_LABELS.noResults}
          </p>
        ) : null}

        {searchState === 'found' && order ? <OrderInquiryResult order={order} /> : null}
      </div>
    </section>
  );
};

export default OrderInquiryPage;
