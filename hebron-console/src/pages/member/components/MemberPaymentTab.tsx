import type { MemberPaymentInfoRESP } from '@/data/member/member.respsonse';
import { useTranslation } from 'react-i18next';

type MemberPaymentTabProps = {
  paymentInfo: MemberPaymentInfoRESP;
};

const MemberPaymentTab = ({ paymentInfo }: MemberPaymentTabProps) => {
  const { t: tMember } = useTranslation('member');

  return (
    <section className='space-y-4 rounded-md border border-gray-200 p-5'>
      <div className='grid grid-cols-2 gap-x-8 gap-y-3 text-sm'>
        <InfoRow label={tMember('field.bank_name')} value={paymentInfo.bank_name} />
        <InfoRow label={tMember('field.account_number')} value={paymentInfo.account_number} />
        <InfoRow label={tMember('field.account_holder')} value={paymentInfo.account_holder} />
        <InfoRow label={tMember('field.outstanding_balance')} value={`${paymentInfo.outstanding_balance.toLocaleString()}원`} />
      </div>
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

export default MemberPaymentTab;
