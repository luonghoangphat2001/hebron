import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { MemberAccountRESP } from '@/data/member/member.respsonse';
import { cn } from '@/lib/utils';
import { MEMBER_STATUS_BADGE } from '@/utils/constants/member.constant';
import type { MemberStatus } from '@/utils/enums/member.enum';
import { useTranslation } from 'react-i18next';

type MemberAccountsTabProps = {
  accounts: MemberAccountRESP[];
};

const MemberAccountsTab = ({ accounts }: MemberAccountsTabProps) => {
  const { t: tEnum } = useTranslation('enum');
  const { t: tMember } = useTranslation('member');

  return (
    <section className='rounded-md border border-gray-200 p-5'>
      <Table>
        <TableHeader className='bg-slate-100'>
          <TableRow>
            <TableHead>{tMember('column.name_id')}</TableHead>
            <TableHead>{tMember('column.email')}</TableHead>
            <TableHead>{tMember('column.mobile')}</TableHead>
            <TableHead className='text-center'>{tMember('column.role')}</TableHead>
            <TableHead className='text-center'>{tMember('column.status')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {accounts.map((account) => {
            const memberStatus = account.status as MemberStatus;
            return (
              <TableRow key={account.id}>
                <TableCell>
                  <p>{account.name}</p>
                  <p className='text-gray-500'>{account.username}</p>
                </TableCell>
                <TableCell>{account.email}</TableCell>
                <TableCell>{account.mobile || '-'}</TableCell>
                <TableCell>{account.phone || '-'}</TableCell>
                <TableCell className='text-center'>
                  <Badge className={cn(MEMBER_STATUS_BADGE[memberStatus])}>{tEnum(`member.${memberStatus}`)}</Badge>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </section>
  );
};

export default MemberAccountsTab;
