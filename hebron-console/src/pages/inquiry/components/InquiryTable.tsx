import { DataTable } from '@/components/table/DataTable';
import { TableSortHeader } from '@/components/table/TableSortHeader';
import { Button } from '@/components/ui/button';
import { MY_ROUTE } from '@/utils/constants/route.constant';
import type { ColumnDef, OnChangeFn, PaginationState, RowSelectionState } from '@tanstack/react-table';
import Can from '@/components/Can';
import { Eye, Paperclip, Trash } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import type { Inquiry } from '@/data/inquiry/inquiry.response';
import { InquirySortBy } from '@/utils/enums/inquiry.enum';
import type { SortOrder } from '@/utils/enums/common.enum';
import { formatDate } from '@/utils/helper/common.helper';
import { DATE_TIME_SHORT_FORMAT } from '@/utils/constants/date.constant';
import { InquiryPersonInChargeCell, InquiryStatusCell, InquiryTypeCell } from './InquiryTableCells';

type InquiryTableProps = {
  data: Inquiry[];
  totalRows: number;
  isLoading: boolean;
  pagination: PaginationState;
  onPaginationChange: OnChangeFn<PaginationState>;
  rowSelection?: RowSelectionState;
  onRowSelectionChange?: OnChangeFn<RowSelectionState>;
  sortBy?: InquirySortBy;
  sortOrder?: SortOrder;
  onSortChange?: (sortBy?: InquirySortBy, sortOrder?: SortOrder) => void;
  onDelete: (id: number) => void;
};

const InquiryTable = ({
  data,
  totalRows,
  isLoading,
  pagination,
  onPaginationChange,
  rowSelection,
  onRowSelectionChange,
  sortBy,
  sortOrder,
  onSortChange,
  onDelete,
}: InquiryTableProps) => {
  const { t: tInquiry } = useTranslation('inquiry');
  const { t: tCommon } = useTranslation('common');
  const navigate = useNavigate();

  const columns: ColumnDef<Inquiry>[] = [
    {
      header: tInquiry('column.no'),
      cell: ({ row }) => row.original.inquiry_number,
      meta: { width: '120px' },
    },
    {
      accessorKey: 'inquiry_type',
      header: () => (
        <TableSortHeader
          label={tInquiry('column.inquiry_type')}
          column={InquirySortBy.INQUIRY_TYPE}
          currentSortBy={sortBy}
          currentSortOrder={sortOrder}
          onSortChange={onSortChange}
        />
      ),
      cell: ({ row }) => <InquiryTypeCell type={row.original.inquiry_type} />,
      meta: { width: '180px' },
    },
    {
      header: tInquiry('column.inquiry_history'),
      cell: ({ row }) => (
        <div>
          <p className='cursor-pointer font-medium text-blue-600 hover:underline'>{row.original.title}</p>
          <p className='text-muted-foreground text-xs'>{tInquiry('label.replies', { count: row.original.reply_count ?? 0 })}</p>
        </div>
      ),
    },
    {
      header: tInquiry('column.inquirer_name'),
      accessorKey: 'inquirer_name',
      cell: ({ row }) => row.original.inquirer_name ?? '-',
      meta: { width: '180px' },
    },
    {
      accessorKey: 'status',
      header: () => (
        <TableSortHeader
          label={tInquiry('column.status')}
          column={InquirySortBy.STATUS}
          currentSortBy={sortBy}
          currentSortOrder={sortOrder}
          onSortChange={onSortChange}
        />
      ),
      cell: ({ row }) => <InquiryStatusCell status={row.original.status} />,
      meta: { align: 'center', width: '130px' },
    },
    {
      accessorKey: 'created_at',
      header: () => (
        <TableSortHeader
          label={tInquiry('column.registration_date')}
          column={InquirySortBy.CREATED_AT}
          currentSortBy={sortBy}
          currentSortOrder={sortOrder}
          onSortChange={onSortChange}
        />
      ),
      cell: ({ row }) => formatDate(row.original.created_at, DATE_TIME_SHORT_FORMAT),
      meta: { align: 'center', width: '160px' },
    },
    {
      header: tInquiry('column.person_in_charge'),
      cell: ({ row }) => <InquiryPersonInChargeCell assignedTo={row.original.assigned_to} />,
      meta: { align: 'center', width: '130px' },
    },
    {
      header: tInquiry('column.attachments'),
      cell: ({ row }) =>
        (row.original.attachment_count ?? 0) > 0 ? (
          <span className='flex items-center justify-center gap-1 text-sm text-blue-500'>
            <Paperclip className='size-3.5' />
            {row.original.attachment_count}
          </span>
        ) : (
          <span className='text-muted-foreground block text-center'>-</span>
        ),
      meta: { align: 'center', width: '100px' },
    },
    {
      id: 'actions',
      header: tCommon('button.actions'),
      cell: ({ row }) => (
        <div className='flex items-center justify-center gap-1'>
          <Button size='icon-sm' variant='outline' onClick={() => navigate(MY_ROUTE.INQUIRY.DETAIL(row.original.id))}>
            <Eye className='size-4' />
          </Button>
          <Can action='delete'>
            <Button size='icon-sm' variant='outline' className='text-red-500' onClick={() => onDelete(row.original.id)}>
              <Trash className='size-4' />
            </Button>
          </Can>
        </div>
      ),
      meta: { align: 'center', width: '120px' },
    },
  ];

  return (
    <DataTable
      data={data}
      columns={columns}
      totalRows={totalRows}
      pagination={pagination}
      onPaginationChange={onPaginationChange}
      rowSelection={rowSelection}
      onRowSelectionChange={onRowSelectionChange}
      enableRowSelection
      pageSizeOptions={[10, 20, 50]}
      getRowId={(row) => row.id.toString()}
      emptyMessage={tInquiry('empty.no_inquiries')}
      isLoading={isLoading}
    />
  );
};

export default InquiryTable;
