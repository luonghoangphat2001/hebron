import Description from '@/components/description/Description';
import TossPaymentInfo from '@/components/TossPaymentInfo';
import type { OrderRESP } from '@/data/orders/orders.response';
import { OrderPaymentMethod } from '@/utils/enums/order.enum';
import { BankIcon, UserIcon } from '@phosphor-icons/react';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';

type OrderInformationProps = {
  order?: OrderRESP;
};

const getTextOrDash = (value?: string | null) => value?.trim() || '-';

const OrderInformation = ({ order }: OrderInformationProps) => {
  const { t: tCommon } = useTranslation('common');
  const orderDate = order?.created_at;
  const paymentMethod =
    order?.payment_method === OrderPaymentMethod.TRANSFER ? (
      <div className='flex items-center gap-2'>
        <div className='flex size-8 items-center justify-center rounded-[6px] border border-neutral-200'>
          <BankIcon className='size-5 text-neutral-600' weight='duotone' />
        </div>
        <p className='text-sm font-bold'>{tCommon('title.bank_transfer')}</p>
      </div>
    ) : (
      <TossPaymentInfo />
    );
  const shippingAddress = [order?.shipping.postcode, order?.shipping?.address, order?.shipping?.address_detail]
    .filter((value): value is string => Boolean(value?.trim()))
    .join(' ');

  const paymentInfoRows = [
    { label: tCommon('title.order_number'), value: getTextOrDash(order?.order_number) },
    {
      label: tCommon('title.order_date'),
      value: orderDate && dayjs(orderDate).isValid() ? dayjs(orderDate).format('YYYY.MM.DD HH:mm') : '-',
    },
    { label: tCommon('title.payment_method'), value: paymentMethod },
    // { label: tCommon('title.shipping_method'), value: getTextOrDash(order?.shipping_method) },
    {
      label: tCommon('title.shipping_address'),
      value: shippingAddress || '-',
    },
  ];

  return (
    <section className='space-y-4'>
      <div className='flex items-center gap-2'>
        <UserIcon className='size-5 text-neutral-400' weight='duotone' />
        <p className='text-lg font-bold'>{tCommon('title.order_information')}</p>
      </div>
      <Description rows={paymentInfoRows} />
    </section>
  );
};

export default OrderInformation;
