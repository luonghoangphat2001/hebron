import { useCan } from '@/hooks/useMenuAccess';
import RowActionButton from '@/components/button/RowActionButton';
import { DataTable } from '@/components/table/DataTable';
import { Badge } from '@/components/ui/badge';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import type { AdminRESP } from '@/data/admin/admin.response';
import { cn } from '@/lib/utils';
import { STATUS_BADGE } from '@/utils/constants/common.constant';
import { formatDate, formatPhone } from '@/utils/helper/common.helper';
import type { ColumnDef, OnChangeFn, PaginationState } from '@tanstack/react-table';
import { KeyRound } from 'lucide-react';
import { useTranslation } from 'react-i18next';

type AdministratorTableProps = {
  data: AdminRESP[];
  isLoading: boolean;
  totalRecord: number;
  pagination: PaginationState;
  onPaginationChange: OnChangeFn<PaginationState>;
  clickUpdate: (id: number) => void;
  clickResetPassword: (id: number) => void;
  clickDelete: (id: number) => void;
};

const AdministratorTable = ({
  data,
  isLoading,
  totalRecord,
  pagination,
  onPaginationChange,
  clickUpdate,
  clickResetPassword,
  clickDelete,
}: AdministratorTableProps) => {
  const { t: tCommon } = useTranslation('common');
  const { t: tEnum } = useTranslation('enum');
  const can = useCan();

  const columns: ColumnDef<AdminRESP>[] = [
    {
      header: 'No.',
      cell: ({ row }) => totalRecord - pagination.pageIndex * pagination.pageSize - row.index,
      meta: { align: 'center', width: '70px' },
    },
    {
      header: `${tCommon('title.full_name')} / ${tCommon('title.username')}`,
      cell: ({ row }) => (
        <div className='space-y-1'>
          <p>{row.original.name}</p>
          <p className='text-gray-500'>{row.original.username}</p>
        </div>
      ),
    },
    {
      header: tCommon('title.permission'),
      accessorKey: 'authority',
    },
    {
      header: tCommon('title.email'),
      accessorKey: 'email',
    },
    {
      header: tCommon('title.phone_number'),
      accessorKey: 'mobile',
      cell: ({ row }) => formatPhone(row.original.mobile),
    },
    {
      header: `${tCommon('title.last_login_at')} / ${tCommon('title.ip_address')}`,
      cell: ({ row }) => (
        <div className='space-y-1'>
          <p>{formatDate(row.original.last_login_at)}</p>
          <p className='text-gray-500'>{row.original.last_login_ip}</p>
        </div>
      ),
    },
    {
      header: tCommon('title.status'),
      cell: ({ row }) => (
        <Badge className={cn(STATUS_BADGE[row.original.status])}>
          {tEnum(`common.${row.original.status.toUpperCase()}` as any)}
        </Badge>
      ),
      meta: { align: 'center', width: '150px' },
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        return (
          <RowActionButton onEdit={() => clickUpdate(row.original.id)} onDelete={() => clickDelete(row.original.id)}>
            {can('edit') && (
              <DropdownMenuItem onClick={() => clickResetPassword(row.original.id)} className='cursor-pointer'>
                <KeyRound /> {tCommon('button.reset_password')}
              </DropdownMenuItem>
            )}
          </RowActionButton>
        );
      },
      meta: { align: 'center', width: '80px' },
    },
  ];

  return (
    <div>
      <DataTable
        // ── Data & columns ──
        isLoading={isLoading}
        data={data}
        columns={columns}
        totalRows={totalRecord}
        // ── Pagination ──
        pagination={pagination}
        onPaginationChange={onPaginationChange}
        // pageSizeOptions={[10, 20, 50]}
        // ── Row selection ──
        // enableRowSelection
        // rowSelection={rowSelection}
        // onRowSelectionChange={setRowSelection}
        getRowId={(row) => row.id.toString()}
        // ── UX ──
        emptyMessage='No users found.'
      />
    </div>
  );
};

export default AdministratorTable;
