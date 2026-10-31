import Can from '@/components/Can';
import ConfirmDialog from '@/components/dialog/ConfirmDialog';
import { appToast } from '@/components/toast/AppToast';
import { Button } from '@/components/ui/button';
import type { OrderDetailRESP } from '@/data/order/order.response';
import { useUpdatePaymentStatusMutation } from '@/data/payment/payment.query';
import type { PaymentListItemRESP } from '@/data/payment/payment.response';
import { DATE_TIME_FORMAT } from '@/utils/constants/date.constant';
import { OrderStatus, PaymentMethod } from '@/utils/enums/order.enum';
import { PaymentStatus } from '@/utils/enums/payment.enum';
import { formatCurrency, formatDate, formatPhone } from '@/utils/helper/common.helper';
import { FileText, Pencil } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import OrderStatusEditModal from './OrderStatusEditModal';

type Props = {
  order: OrderDetailRESP;
  memberName: string;
  recipientName: string;
  recipientPhone: string;
  shippingAddress: string;
  paymentAmount: number;
  payment?: PaymentListItemRESP;
  isPaymentLoading: boolean;
  isOrderActionLocked: boolean;
  onRefetchOrder: () => void;
};

const OrderBasicInfoSection = ({
  order,
  memberName,
  recipientName,
  recipientPhone,
  shippingAddress,
  paymentAmount,
  payment,
  isPaymentLoading,
  isOrderActionLocked,
  onRefetchOrder,
}: Props) => {
  const { t: tOrder } = useTranslation('order');
  const { t: tEnum } = useTranslation('enum');
  const { t: tCommon } = useTranslation('common');

  const [isStatusEditOpen, setIsStatusEditOpen] = useState(false);
  const [isManualPaymentConfirmOpen, setIsManualPaymentConfirmOpen] = useState(false);
  const paymentStatus = payment?.status || order.payment_status;
  const paymentTransactionId = payment?.transaction_id || order.transaction_id || order.payment_details?.transaction_id;
  const isAwaitingTransferPayment =
    order.status === OrderStatus.AWAITING_PAYMENT && order.payment_method === PaymentMethod.TRANSFER;

  const { mutate: confirmManualPayment, isPending: isConfirmingManualPayment } = useUpdatePaymentStatusMutation({
    onSuccess: (resp) => {
      appToast.success(resp.message || tCommon('notify.success_update'));
      setIsManualPaymentConfirmOpen(false);
      onRefetchOrder();
    },
    onError: (err: any) => {
      appToast.error(err?.response?.data?.message || tCommon('notify.something_went_wrong'));
    },
  });

  const handleConfirmManualPayment = () => {
    if (!paymentTransactionId) return;

    confirmManualPayment({ transactionId: paymentTransactionId, status: PaymentStatus.PAID });
  };

  return (
    <section className='space-y-4 rounded-md border border-gray-200 p-5 dark:border-gray-800'>
      <div className='flex items-center justify-between'>
        <h2 className='flex items-center gap-2 text-sm font-semibold'>
          <FileText className='size-4' />
          {tOrder('section.basic_information')}
        </h2>
        <div className='flex items-center gap-2'>
          <Can action='edit'>
            <Button
              size='sm'
              variant='default'
              className='h-8 gap-1.5 text-xs'
              disabled={isOrderActionLocked}
              onClick={() => setIsStatusEditOpen(true)}>
              <Pencil className='size-3.5' />
              {tOrder('button.edit_status')}
            </Button>
          </Can>
          <Can action='edit'>
            {isAwaitingTransferPayment && (
              <Button
                size='sm'
                variant='default'
                className='h-8 text-xs'
                disabled={isPaymentLoading || !paymentTransactionId}
                onClick={() => setIsManualPaymentConfirmOpen(true)}>
                {tOrder('button.confirm_manual_payment')}
              </Button>
            )}
          </Can>
        </div>
      </div>

      <div className='grid grid-cols-2 gap-x-8 gap-y-3 text-sm'>
        <InfoRow label={tOrder('field.member_name')} value={memberName} />
        <InfoRow label={tOrder('field.recipient_name')} value={recipientName} />
        <InfoRow label={tOrder('field.recipient_phone')} value={recipientPhone === '-' ? '-' : formatPhone(recipientPhone)} />
        <InfoRow
          label={tOrder('field.order_datetime')}
          value={formatDate(order.created_at || order.metadata?.placed_at, DATE_TIME_FORMAT)}
        />
        <InfoRow label={tOrder('field.payment_amount')} value={formatCurrency(paymentAmount)} />
        <InfoRow
          label={tOrder('field.payment_status')}
          value={paymentStatus ? (tEnum as any)(`payment.${paymentStatus}`, paymentStatus) : '-'}
        />
        <InfoRow
          label={tOrder('field.payment_method')}
          value={order.payment_method ? (tEnum as any)(`payment.${order.payment_method}`, order.payment_method) : '-'}
        />
        <InfoRow label={tOrder('field.shipping_address')} value={shippingAddress} />
      </div>

      <OrderStatusEditModal
        open={isStatusEditOpen}
        setOpen={setIsStatusEditOpen}
        orderNumber={order.order_number}
        currentStatus={order.status}
        onSuccess={onRefetchOrder}
      />

      <ConfirmDialog
        open={isManualPaymentConfirmOpen}
        onOpenChange={setIsManualPaymentConfirmOpen}
        title={tOrder('confirm.manual_payment_title')}
        description={tOrder('confirm.manual_payment_description')}
        confirmLabel={tOrder('button.confirm_manual_payment')}
        onConfirm={handleConfirmManualPayment}
        isLoading={isConfirmingManualPayment}
      />
    </section>
  );
};

function InfoRow({ label, value }: { label: string; value?: string }) {
  return (
    <div className='flex justify-between gap-2'>
      <span className='text-muted-foreground text-xs'>{label}</span>
      <span className='text-right text-xs font-medium break-all'>{value ?? '-'}</span>
    </div>
  );
}

export default OrderBasicInfoSection;
