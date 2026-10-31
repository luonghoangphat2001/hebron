import RowActionButton from '@/components/button/RowActionButton';
import { DataTable } from '@/components/table/DataTable';
import { Badge } from '@/components/ui/badge';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import type { PermissionListItemRESP } from '@/data/permission/permission.response';
import { useCan } from '@/hooks/useMenuAccess';
import { cn } from '@/lib/utils';
import { STATUS_BADGE, STATUS_ENUM_KEY } from '@/utils/constants/common.constant';
import { DATE_FORMAT } from '@/utils/constants/date.constant';
import { formatDate } from '@/utils/helper/common.helper';
import type { ColumnDef, OnChangeFn, PaginationState, RowSelectionState } from '@tanstack/react-table';
import { Copy } from 'lucide-react';
import { useTranslation } from 'react-i18next';

type PermissionTableProps = {
  data: PermissionListItemRESP[];
  isLoading: boolean;
  totalRecord: number;
  pagination: PaginationState;
  onPaginationChange: OnChangeFn<PaginationState>;
  rowSelection: RowSelectionState;
  onRowSelectionChange: OnChangeFn<RowSelectionState>;
  onEdit: (id: number) => void;
  onCopy: (permission: PermissionListItemRESP) => void;
  onDelete: (id: number) => void;
};

const PermissionTable = ({
  data,
  isLoading,
  totalRecord,
  pagination,
  onPaginationChange,
  rowSelection,
  onRowSelectionChange,
  onEdit,
  onCopy,
  onDelete,
}: PermissionTableProps) => {
  const { t: tPermission } = useTranslation('system');
  const { t: tCommon } = useTranslation('common');
  const { t: tEnum } = useTranslation('enum');
  const can = useCan();

  const columns: ColumnDef<PermissionListItemRESP>[] = [
    {
      header: tPermission('permission.column.name'),
      accessorKey: 'name',
    },
    {
      header: tPermission('permission.column.description'),
      cell: ({ row }) => <span className='text-gray-500'>{row.original.description}</span>,
    },
    {
      header: tPermission('permission.column.status'),
      cell: ({ row }) => (
        <Badge className={cn(STATUS_BADGE[row.original.usage_status.value])}>
          {tEnum(STATUS_ENUM_KEY[row.original.usage_status.value])}
        </Badge>
      ),
      meta: { align: 'center', width: '130px' },
    },
    {
      header: tPermission('permission.column.created_at'),
      cell: ({ row }) => formatDate(row.original.created_at, DATE_FORMAT),
      meta: { align: 'center', width: '140px' },
    },
    {
      header: tPermission('permission.column.updated_at'),
      cell: ({ row }) => formatDate(row.original.updated_at, DATE_FORMAT),
      meta: { align: 'center', width: '130px' },
    },
    {
      header: tPermission('permission.column.registrant'),
      cell: ({ row }) => row.original.registrant?.name ?? '—',
      meta: { align: 'center', width: '130px' },
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <RowActionButton onEdit={() => onEdit(row.original.id)} onDelete={() => onDelete(row.original.id)}>
          {can('register') && (
            <DropdownMenuItem
              className='cursor-pointer text-emerald-600! focus:**:text-emerald-600!'
              onClick={() => onCopy(row.original)}>
              <Copy /> {tCommon('button.copy')}
            </DropdownMenuItem>
          )}
        </RowActionButton>
      ),
      meta: { align: 'center', width: '80px' },
    },
  ];

  return (
    <DataTable
      data={data}
      columns={columns}
      isLoading={isLoading}
      totalRows={totalRecord}
      pagination={pagination}
      onPaginationChange={onPaginationChange}
      rowSelection={rowSelection}
      onRowSelectionChange={onRowSelectionChange}
      enableRowSelection
      pageSizeOptions={[10, 20, 50]}
      getRowId={(row) => row.id.toString()}
      emptyMessage={tPermission('permission.empty')}
    />
  );
};

export default PermissionTable;
