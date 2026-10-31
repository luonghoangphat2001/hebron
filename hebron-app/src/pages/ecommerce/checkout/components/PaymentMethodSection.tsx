import AppRadio from '@/components/radio/AppRadio';
import TossPaymentInfo from '@/components/TossPaymentInfo';
import { RadioGroup } from '@/components/ui/radio-group';
import { cn } from '@/lib/utils';
import { OrderPaymentMethod } from '@/utils/enums/order.enum';
import { BankIcon, CreditCardIcon } from '@phosphor-icons/react';
import { useTranslation } from 'react-i18next';

type PaymentMethodSectionProps = {
  paymentMethod: OrderPaymentMethod;
  onPaymentMethodChange: (paymentMethod: OrderPaymentMethod) => void;
  isBankAccountLoading: boolean;
  isBankTransferAvailable: boolean;
};

const PaymentMethodSection = ({
  paymentMethod,
  onPaymentMethodChange,
  isBankAccountLoading,
  isBankTransferAvailable,
}: PaymentMethodSectionProps) => {
  const { t: tCommon } = useTranslation('common');
  const isTransfer = paymentMethod === OrderPaymentMethod.TRANSFER;

  return (
    <section className='space-y-3 rounded-lg border border-neutral-200 p-3 md:p-4'>
      <div className='flex items-center gap-1.5'>
        <CreditCardIcon className='size-5 text-neutral-400' weight='duotone' />
        <p className='text-md font-bold'>{tCommon('title.payment_method')}</p>
      </div>
      <RadioGroup
        value={paymentMethod}
        onValueChange={(value) => onPaymentMethodChange(value as OrderPaymentMethod)}
        className='space-y-2'>
        <label
          htmlFor='payment-method-toss'
          className={cn(
            'flex cursor-pointer items-center justify-between rounded-md border border-neutral-200 p-2 transition-colors hover:border-neutral-400 hover:bg-neutral-50',
            paymentMethod === OrderPaymentMethod.TOSS && 'border-blue-brand',
          )}>
          <TossPaymentInfo />
          <AppRadio id='payment-method-toss' value={OrderPaymentMethod.TOSS} />
        </label>
        <label
          htmlFor='payment-method-transfer'
          className={cn(
            'flex cursor-pointer items-center justify-between rounded-md border border-neutral-200 p-2 transition-colors hover:border-neutral-400 hover:bg-neutral-50',
            paymentMethod === OrderPaymentMethod.TRANSFER && 'border-blue-brand',
          )}>
          <div className='flex items-center gap-2'>
            <div className='flex size-8 items-center justify-center rounded-[6px] border border-neutral-200'>
              <BankIcon className='size-5 text-neutral-600' weight='duotone' />
            </div>
            <p className='text-sm font-bold'>{tCommon('title.bank_transfer')}</p>
          </div>
          <AppRadio id='payment-method-transfer' value={OrderPaymentMethod.TRANSFER} />
        </label>
      </RadioGroup>
      {isTransfer && isBankAccountLoading && <p className='text-sm text-neutral-500'>{tCommon('title.loading')}</p>}
      {isTransfer && !isBankAccountLoading && !isBankTransferAvailable && (
        <p className='text-danger text-sm'>{tCommon('notify.bank_account_unavailable')}</p>
      )}
    </section>
  );
};

export default PaymentMethodSection;
