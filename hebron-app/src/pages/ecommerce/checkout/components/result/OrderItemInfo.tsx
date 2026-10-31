import { Product1 } from '@/assets/images';
import OrderItemCard from '@/components/card/OrderItemCard';
import { mapDesignGroupToProductDesign } from '@/data/design/product-design.service';
import type { OrderItemConfigurationRESP, OrderRESP } from '@/data/orders/orders.response';
import { formatPrice } from '@/utils/helper/common.helper';
import { PackageIcon } from '@phosphor-icons/react';
import { useTranslation } from 'react-i18next';

type OrderItemInfoProps = {
  order?: OrderRESP;
};

const getSelectedOptionsDescription = (selectedOptionValues?: OrderItemConfigurationRESP['selected_option_values']) =>
  selectedOptionValues
    ?.map(({ group, option }) => {
      const groupName = group?.name?.trim() || '-';
      const optionName = option?.name?.trim() || option?.name?.trim() || '-';

      return `${groupName}: ${optionName}`;
    })
    .join(' / ') || '-';

const getProductSpecification = (snapshot?: OrderItemConfigurationRESP['product_snapshot']) => {
  const info = [
    snapshot?.specification?.size || '-',
    snapshot?.specification?.materials || '-',
    snapshot?.specification?.case || '-',
  ].join(' / ');
  return info;
};

const formatAmount = (value?: string | number | null) => {
  if (value === null || value === undefined || String(value).trim() === '') return '-';

  const amount = Number(value);
  return Number.isFinite(amount) ? formatPrice(amount) : '-';
};

const OrderItemInfo = ({ order }: OrderItemInfoProps) => {
  const { t: tCommon } = useTranslation('common');
  const orderItems = order?.items ?? [];
  const totalPaymentAmount = formatAmount(order?.payment_details?.payment_amount);

  return (
    <section className='space-y-4'>
      <div className='flex items-center gap-2'>
        <PackageIcon className='size-5 text-neutral-400' weight='duotone' />
        <p className='text-lg font-bold'>{tCommon('title.ordered_items')}</p>
        <p className='text-sm text-neutral-500'>{orderItems.length}건</p>
      </div>
      <div className='space-y-2'>
        {orderItems.map((item) => {
          // `design_group` is included in the order response, so this only maps its metadata and never requests design detail.
          const design = item.design_group ? mapDesignGroupToProductDesign(item.design_group) : undefined;
          const content = item.order_design_content
            ? {
                title: item.order_design_content.title,
                recipientName: item.order_design_content.recipient_name,
                message: item.order_design_content.main_text,
                date: item.order_design_content.event_date,
                sender: item.order_design_content.sender_name,
              }
            : undefined;

          return (
            <OrderItemCard
              key={item.id}
              image={item.configuration?.product_snapshot?.images?.[0] || Product1}
              title={item.title?.trim() || '-'}
              description={getSelectedOptionsDescription(item.configuration?.selected_option_values)}
              specification={getProductSpecification(item.configuration?.product_snapshot)}
              content={content}
              designId={design?.id}
              previewFront={design?.previewFront}
              previewBack={design?.previewBack}
              design={design?.state}
              quantity={item.quantity}
              price={item.sub_total_amount}
            />
          );
        })}
        {orderItems.length === 0 && <p className='rounded-md bg-neutral-50 p-4 text-sm text-neutral-500'>-</p>}
        <div className='flex items-center justify-between rounded-md bg-neutral-50 p-4'>
          <p className='text-sm text-neutral-500'>{tCommon('title.total_payment_amount')}</p>
          <p className='text-brand text-lg font-bold'>{totalPaymentAmount}</p>
        </div>
      </div>
    </section>
  );
};

export default OrderItemInfo;
