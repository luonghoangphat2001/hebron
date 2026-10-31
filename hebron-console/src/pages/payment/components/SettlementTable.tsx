import { DataTable } from '@/components/table/DataTable';
import { Badge } from '@/components/ui/badge';
import type { SettlementReportItemRESP } from '@/data/payment/payment.response';
import { cn } from '@/lib/utils';
import { DATE_FORMAT } from '@/utils/constants/date.constant';
import { PAYMENT_STATUS_BADGE } from '@/utils/constants/payment.constant';
import { MY_ROUTE } from '@/utils/constants/route.constant';
import { formatDate } from '@/utils/helper/common.helper';
import type { ColumnDef, OnChangeFn, PaginationState, RowSelectionState } from '@tanstack/react-table';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

type Props = {
  data: SettlementReportItemRESP[];
  isLoading?: boolean;
  totalRows: number;
  pagination: PaginationState;
  onPaginationChange: OnChangeFn<PaginationState>;
  rowSelection: RowSelectionState;
  onRowSelectionChange: OnChangeFn<RowSelectionState>;
};

const SettlementTable = ({
  data,
  isLoading,
  totalRows,
  pagination,
  onPaginationChange,
  rowSelection,
  onRowSelectionChange,
}: Props) => {
  const { t: tPayment } = useTranslation('payment');
  const { t: tEnum } = useTranslation('enum');

  const columns: ColumnDef<SettlementReportItemRESP>[] = [
    {
      header: tPayment('settlement.column.no'),
      cell: ({ row }) => <span className='text-gray-500'>{pagination.pageIndex * pagination.pageSize + row.index + 1}</span>,
      meta: { align: 'center', width: '60px' },
    },
    {
      header: tPayment('settlement.column.settlement_date'),
      // Settled on payment date; unpaid rows fall back to when the transaction was created.
      cell: ({ row }) => {
        const date = row.original.paid_at || row.original.created_at;
        return (
          <div>
            <div className='font-medium'>{formatDate(date, 'HH:mm')}</div>
            <div className='text-muted-foreground text-xs'>{formatDate(date, DATE_FORMAT)}</div>
          </div>
        );
      },
      meta: { width: '110px' },
    },
    {
      header: tPayment('settlement.column.order_number'),
      cell: ({ row }) => (
        <Link to={MY_ROUTE.ORDER.DETAIL(row.original.order_number)} className='font-medium text-amber-600 hover:underline'>
          {row.original.order_number}
        </Link>
      ),
      meta: { width: '170px' },
    },
    {
      header: tPayment('settlement.column.customer'),
      cell: ({ row }) => <span className='whitespace-normal'>{row.original.customer_name}</span>,
    },
    {
      header: tPayment('settlement.column.product'),
      cell: ({ row }) => <span className='whitespace-normal'>{row.original.product_name}</span>,
    },
    {
      header: tPayment('settlement.column.category'),
      accessorKey: 'category_name',
      meta: { align: 'center', width: '140px' },
    },
    {
      header: tPayment('settlement.column.payment_amount'),
      cell: ({ row }) => <span className='font-medium'>₩{row.original.payment_amount.toLocaleString()}</span>,
      meta: { align: 'right', width: '120px' },
    },
    {
      header: tPayment('settlement.column.supply_price'),
      cell: ({ row }) => <span>₩{row.original.supply_price.toLocaleString()}</span>,
      meta: { align: 'right', width: '110px' },
    },
    {
      header: tPayment('settlement.column.vat'),
      cell: ({ row }) => <span>₩{row.original.vat.toLocaleString()}</span>,
      meta: { align: 'right', width: '90px' },
    },
    {
      header: tPayment('settlement.column.commission'),
      cell: ({ row }) => <span>₩{row.original.commission.toLocaleString()}</span>,
      meta: { align: 'right', width: '120px' },
    },
    {
      header: tPayment('settlement.column.status'),
      cell: ({ row }) => (
        <Badge className={cn(PAYMENT_STATUS_BADGE[row.original.status])}>
          {tEnum(`payment.${row.original.status}`, row.original.status)}
        </Badge>
      ),
      meta: { align: 'center', width: '150px' },
    },
  ];

  return (
    <DataTable
      data={data}
      columns={columns}
      isLoading={isLoading}
      totalRows={totalRows}
      pagination={pagination}
      onPaginationChange={onPaginationChange}
      pageSizeOptions={[10, 20, 50]}
      enableRowSelection
      rowSelection={rowSelection}
      onRowSelectionChange={onRowSelectionChange}
      getRowId={(row) => row.transaction_id}
      emptyMessage={tPayment('settlement.empty')}
    />
  );
};

export default SettlementTable;
