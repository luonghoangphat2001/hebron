import Description, { type DescriptionRow } from '@/components/description/Description';
import type { BankAccountRESP } from '@/data/bank-account/bank-account.response';
import { BankIcon } from '@phosphor-icons/react';
import { useTranslation } from 'react-i18next';

type CardPaymentInfoProps = {
  bankAccount?: BankAccountRESP | null;
  isLoading: boolean;
};

const CardPaymentInfo = ({ bankAccount, isLoading }: CardPaymentInfoProps) => {
  const { t: tCommon } = useTranslation('common');
  const accountValue = (value?: string) => (isLoading ? tCommon('title.loading') : value || '-');

  const paymentInfoRows: DescriptionRow[] = [
    { label: tCommon('title.bank_name'), value: accountValue(bankAccount?.bank_name) },
    { label: tCommon('title.account_number'), value: accountValue(bankAccount?.account_number) },
    { label: tCommon('title.account_holder'), value: accountValue(bankAccount?.account_holder) },
  ];

  return (
    <section className='space-y-4'>
      <div className='flex items-center gap-2'>
        <BankIcon className='size-5 text-neutral-400' weight='duotone' />
        <p className='text-lg font-bold'>{tCommon('title.bank_transfer_info')}</p>
      </div>
      <Description rows={paymentInfoRows} />
    </section>
  );
};

export default CardPaymentInfo;
