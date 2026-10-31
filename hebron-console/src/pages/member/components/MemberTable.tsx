import { DataTable } from '@/components/table/DataTable';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { MemberListItemRESP } from '@/data/member/member.respsonse';
import type { MemberFilterValues } from '@/data/member/member.service';
import { cn } from '@/lib/utils';
import { DATE_HOUR_MINUTE } from '@/utils/constants/date.constant';
import { MEMBER_STATUS_BADGE, MEMBER_TYPE_BADGE } from '@/utils/constants/member.constant';
import { MY_ROUTE } from '@/utils/constants/route.constant';
import { MemberType, SortOrder } from '@/utils/enums/common.enum';
import { MemberSortBy, type MemberStatus } from '@/utils/enums/member.enum';
import { formatPhone } from '@/utils/helper/common.helper';
import type { ColumnDef, OnChangeFn, PaginationState, RowSelectionState } from '@tanstack/react-table';
import dayjs from 'dayjs';
import { ArrowDown, ArrowUp, ArrowUpDown, Eye } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

type MemberTableProps = {
  data: MemberListItemRESP[];
  isLoading: boolean;
  totalRows: number;
  filter: MemberFilterValues;
  pagination: PaginationState;
  onPaginationChange: OnChangeFn<PaginationState>;
  onSortChange: (patch: Partial<MemberFilterValues>) => void;
  rowSelection?: RowSelectionState;
  onRowSelectionChange?: OnChangeFn<RowSelectionState>;
};

const SortableHeader = ({
  label,
  column,
  filter,
  onSortChange,
}: {
  label: string;
  column: MemberSortBy;
  filter: MemberFilterValues;
  onSortChange: (patch: Partial<MemberFilterValues>) => void;
}) => {
  const isActive = filter.sort_by === column;
  const isAsc = filter.sort_order === SortOrder.ASC;
  const Icon = isActive ? (isAsc ? ArrowUp : ArrowDown) : ArrowUpDown;

  return (
    <Button
      variant='ghost'
      size='sm'
      className='-ml-3 h-auto gap-1 p-0 px-3 py-1 font-medium text-gray-500 hover:bg-transparent'
      onClick={() => onSortChange({ sort_by: column, sort_order: isActive && isAsc ? SortOrder.DESC : SortOrder.ASC })}>
      {label}
      <Icon className='size-3.5' />
    </Button>
  );
};

const MemberTable = ({
  data,
  isLoading,
  totalRows,
  filter,
  pagination,
  onPaginationChange,
  onSortChange,
  rowSelection,
  onRowSelectionChange,
}: MemberTableProps) => {
  const { t: tEnum } = useTranslation('enum');
  const { t: tMember } = useTranslation('member');
  const { t: tCommon } = useTranslation('common');
  const navigate = useNavigate();
  const [internalRowSelection, setInternalRowSelection] = useState<RowSelectionState>({});

  const activeRowSelection = rowSelection ?? internalRowSelection;
  const activeOnRowSelectionChange = onRowSelectionChange ?? setInternalRowSelection;

  const columns: ColumnDef<MemberListItemRESP>[] = [
    {
      id: 'no',
      header: tMember('column.no'),
      cell: ({ row }) => pagination.pageIndex * pagination.pageSize + row.index + 1,
      meta: { align: 'center', width: '60px' },
    },
    {
      id: 'username',
      header: () => (
        <SortableHeader label={tMember('column.id')} column={MemberSortBy.USERNAME} filter={filter} onSortChange={onSortChange} />
      ),
      cell: ({ row }) => (
        <div className='space-y-1'>
          <p>{row.original.username}</p>
        </div>
      ),
    },
    {
      id: 'name',
      header: () => (
        <SortableHeader label={tMember('column.name')} column={MemberSortBy.NAME} filter={filter} onSortChange={onSortChange} />
      ),
      cell: ({ row }) => (
        <div className='space-y-1'>
          <p className='text-gray-500'>{row.original.name}</p>
        </div>
      ),
    },
    {
      id: 'email',
      header: () => (
        <SortableHeader label={tMember('column.email')} column={MemberSortBy.EMAIL} filter={filter} onSortChange={onSortChange} />
      ),
      accessorKey: 'email',
    },
    {
      header: tMember('column.phone'),
      cell: ({ row }) => formatPhone(row.original.phone || ''),
    },
    {
      id: 'sign_up_at',
      header: () => (
        <SortableHeader
          label={tMember('column.sign_up_date')}
          column={MemberSortBy.CREATED_AT}
          filter={filter}
          onSortChange={onSortChange}
        />
      ),
      cell: ({ row }) => {
        const date = row.original.date_of_joining || row.original.created_at || row.original.sign_up_at;
        return date ? dayjs(date).format(DATE_HOUR_MINUTE) : '-';
      },
      meta: { width: '170px' },
    },
    {
      id: 'last_login_at',
      header: tMember('column.last_login_date'),
      cell: ({ row }) => (row.original.last_login_at ? dayjs(row.original.last_login_at).format(DATE_HOUR_MINUTE) : '-'),
      meta: { width: '170px' },
    },
    {
      id: 'member_type',
      header: tMember('column.type'),
      cell: ({ row }) => {
        const isBusiness = row.original.member_type === MemberType.BUSINESS;
        return (
          row.original.member_type && (
            <Badge className={cn(MEMBER_TYPE_BADGE[row.original.member_type])}>
              {isBusiness ? tMember('field.business_member') : tMember('field.individual_member')}
            </Badge>
          )
        );
      },
    },
    {
      id: 'status',
      header: () => (
        <SortableHeader
          label={tMember('column.status')}
          column={MemberSortBy.STATUS}
          filter={filter}
          onSortChange={onSortChange}
        />
      ),
      cell: ({ row }) => {
        const status = row.original.status;
        const value = typeof status === 'object' ? (status?.value as MemberStatus) : status;
        const label = typeof status === 'object' ? status?.label : value && tEnum(`member.${value}`);

        return <Badge className={cn(value && MEMBER_STATUS_BADGE[value])}>{label || '-'}</Badge>;
      },
      meta: { align: 'center', width: '150px' },
    },
    {
      id: 'actions',
      header: tCommon('button.actions'),
      cell: ({ row }) => (
        <Button size='icon-sm' variant='outline' onClick={() => navigate(MY_ROUTE.MEMBER.DETAIL(row.original.id))}>
          <Eye className='size-4' />
        </Button>
      ),
      meta: { align: 'center', width: '120px' },
    },
  ];

  return (
    <div>
      <DataTable
        data={data}
        isLoading={isLoading}
        columns={columns}
        totalRows={totalRows}
        pagination={pagination}
        onPaginationChange={onPaginationChange}
        pageSizeOptions={[10, 20, 50]}
        enableRowSelection
        rowSelection={activeRowSelection}
        onRowSelectionChange={activeOnRowSelectionChange}
        getRowId={(row) => row.id.toString()}
        emptyMessage={tMember('empty.no_members')}
      />
    </div>
  );
};

export default MemberTable;
