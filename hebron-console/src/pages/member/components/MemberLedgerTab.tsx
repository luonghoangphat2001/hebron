import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { MemberLedgerEntryRESP } from '@/data/member/member.respsonse';
import { DATE_HOUR_MINUTE } from '@/utils/constants/date.constant';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';

type MemberLedgerTabProps = {
  ledger: MemberLedgerEntryRESP[];
};

const MemberLedgerTab = ({ ledger }: MemberLedgerTabProps) => {
  const { t: tEnum } = useTranslation('enum');
  const { t: tMember } = useTranslation('member');

  return (
    <section className='rounded-md border border-gray-200 p-5'>
      {ledger.length === 0 ? (
        <p className='text-muted-foreground text-sm'>{tMember('empty.no_ledger_entries')}</p>
      ) : (
        <Table>
          <TableHeader className='bg-slate-100'>
            <TableRow>
              <TableHead>{tMember('column.transaction_date')}</TableHead>
              <TableHead>{tMember('column.type')}</TableHead>
              <TableHead className='text-right'>{tMember('column.amount')}</TableHead>
              <TableHead className='text-right'>{tMember('column.balance_after')}</TableHead>
              <TableHead>{tMember('column.memo')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ledger.map((entry) => (
              <TableRow key={entry.id}>
                <TableCell>{dayjs(entry.transaction_at).format(DATE_HOUR_MINUTE)}</TableCell>
                <TableCell>{tEnum(`member.${entry.type}`)}</TableCell>
                <TableCell className='text-right'>{entry.amount.toLocaleString()}원</TableCell>
                <TableCell className='text-right'>{entry.balance_after.toLocaleString()}원</TableCell>
                <TableCell>{entry.memo}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </section>
  );
};

export default MemberLedgerTab;
