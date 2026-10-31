import AppDialog from '@/components/dialog/AppDialog';
import FormItem from '@/components/form/FormItem';
import { appToast } from '@/components/toast/AppToast';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useRefundPaymentMutation } from '@/data/payment/payment.query';
import type { PaymentListItemRESP } from '@/data/payment/payment.response';
import { PaymentMethod } from '@/utils/enums/payment.enum';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

const REASON_MAX_LENGTH = 500;

type Props = {
  payment: PaymentListItemRESP | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const PaymentRefundModal = ({ payment, open, onOpenChange }: Props) => {
  const { t: tPayment } = useTranslation('payment');

  const [reason, setReason] = useState('');
  const [amount, setAmount] = useState('');

  const [lastPayment, setLastPayment] = useState(payment);
  if (lastPayment !== payment) {
    setLastPayment(payment);
    setReason('');
    setAmount('');
  }

  const { mutate: refund, isPending } = useRefundPaymentMutation();
  const isTossPayment = payment?.payment_method === PaymentMethod.CARD || payment?.payment_method === PaymentMethod.TOSS;

  const handleOk = () => {
    if (!payment || !reason.trim()) return;
    refund(
      {
        transactionId: payment.transaction_id,
        reason: reason.trim(),
        // Empty amount = full refund;
        amount: amount ? Number(amount) : undefined,
      },
      {
        onSuccess: () => {
          appToast.success(tPayment('history.refund_modal.success'));
          onOpenChange(false);
        },
        onError: () => appToast.error(tPayment('history.refund_modal.fail')),
      },
    );
  };

  return (
    <AppDialog
      open={open}
      onOpenChange={onOpenChange}
      title={tPayment('history.refund_modal.title')}
      description={payment ? `${payment.transaction_id} · ₩${payment.amount.toLocaleString()}` : undefined}
      textOk={tPayment('history.button.refund')}
      onOk={handleOk}
      okDisabled={!reason.trim()}
      loading={isPending}
      className='sm:max-w-lg'>
      <div className='space-y-4'>
        <div className='rounded-md border border-blue-200 bg-blue-50 p-3 text-sm text-blue-950'>
          <p className='font-medium'>
            {tPayment(isTossPayment ? 'history.refund_modal.toss_notice_title' : 'history.refund_modal.transfer_notice_title')}
          </p>
          <p className='mt-1 text-blue-800'>
            {tPayment(
              isTossPayment ? 'history.refund_modal.toss_notice_description' : 'history.refund_modal.transfer_notice_description',
            )}
          </p>
        </div>
        <FormItem label={tPayment('history.refund_modal.reason')} required>
          <Textarea
            value={reason}
            maxLength={REASON_MAX_LENGTH}
            rows={4}
            placeholder={tPayment('history.refund_modal.reason_placeholder')}
            onChange={(e) => setReason(e.target.value)}
          />
          <div className='text-muted-foreground text-right text-xs'>
            {reason.length}/{REASON_MAX_LENGTH}
          </div>
        </FormItem>
        <FormItem label={tPayment('history.refund_modal.amount')}>
          <Input
            type='number'
            min={0}
            max={payment?.amount}
            value={amount}
            placeholder={tPayment('history.refund_modal.amount_placeholder')}
            onChange={(e) => setAmount(e.target.value)}
          />
        </FormItem>
      </div>
    </AppDialog>
  );
};

export default PaymentRefundModal;
