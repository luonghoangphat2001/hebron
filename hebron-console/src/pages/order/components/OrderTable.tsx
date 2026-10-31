import { Toss } from '@/assets/images';
import { DataTable } from '@/components/table/DataTable';
import { TableSortHeader } from '@/components/table/TableSortHeader';
import { appToast } from '@/components/toast/AppToast';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useWorkOrderPdfMutation } from '@/data/order/order.query';
import type { OrderListItemRESP } from '@/data/order/order.response';
import { cn } from '@/lib/utils';
import { DATE_TIME_SHORT_FORMAT } from '@/utils/constants/date.constant';
import { ORDER_STATUS_BADGE } from '@/utils/constants/order.constant';
import { MY_ROUTE } from '@/utils/constants/route.constant';
import { SortOrder } from '@/utils/enums/common.enum';
import { OrderSortby, PaymentMethod } from '@/utils/enums/order.enum';
import { formatCurrency, formatDate } from '@/utils/helper/common.helper';
import type { ColumnDef, OnChangeFn, PaginationState, RowSelectionState } from '@tanstack/react-table';
import { Eye, Printer } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

type OrderTableProps = {
  data: OrderListItemRESP[];
  totalRows: number;
  isLoading: boolean;
  pagination: PaginationState;
  onPaginationChange: OnChangeFn<PaginationState>;
  sortBy?: OrderSortby | string;
  sortOrder?: SortOrder;
  onSortChange?: (sortBy?: OrderSortby | string, sortOrder?: SortOrder) => void;
  rowSelection?: RowSelectionState;
  onRowSelectionChange?: OnChangeFn<RowSelectionState>;
};

const OrderTable = ({
  data,
  totalRows,
  isLoading,
  pagination,
  onPaginationChange,
  sortBy,
  sortOrder,
  onSortChange,
  rowSelection,
  onRowSelectionChange,
}: OrderTableProps) => {
  const { t: tEnum } = useTranslation('enum');
  const { t: tOrder } = useTranslation('order');
  const { t: tCommon } = useTranslation('common');
  const navigate = useNavigate();
  const [internalRowSelection, setInternalRowSelection] = useState<RowSelectionState>({});

  const activeRowSelection = rowSelection ?? internalRowSelection;
  const activeOnRowSelectionChange = onRowSelectionChange ?? setInternalRowSelection;

  const workOrderPdfMutation = useWorkOrderPdfMutation();

  const handleWorkOrderPdf = (order: OrderListItemRESP) => {
    workOrderPdfMutation.mutate(order.id, {
      onSuccess: (resp) => {
        if (resp.data?.pdf_url) {
          window.open(resp.data.pdf_url, '_blank');
        }
      },
      onError: () => appToast.error(tCommon('notify.something_went_wrong')),
    });
  };

  const columns: ColumnDef<OrderListItemRESP>[] = [
    {
      id: 'order_number',
      header: () => (
        <TableSortHeader
          label={tOrder('column.order_number')}
          column={OrderSortby.ORDER_NUMBER}
          currentSortBy={sortBy}
          currentSortOrder={sortOrder}
          onSortChange={onSortChange}
        />
      ),
      accessorKey: 'order_number',
      meta: { width: '160px' },
    },
    {
      id: 'customer',
      header: tOrder('column.customer'),
      cell: ({ row }) => row.original.user?.name || row.original.user?.username || row.original.company_name || '-',
      meta: { width: '150px' },
    },
    {
      id: 'recipient',
      header: tOrder('column.recipient'),
      cell: ({ row }) => row.original.recipient_name || row.original.user?.name || '-',
      meta: { width: '130px' },
    },
    {
      id: 'placed_at',
      header: () => (
        <TableSortHeader
          label={tOrder('column.order_date')}
          column={OrderSortby.PLACED_AT}
          currentSortBy={sortBy}
          currentSortOrder={sortOrder}
          onSortChange={onSortChange}
        />
      ),
      cell: ({ row }) => formatDate(row.original.created_at, DATE_TIME_SHORT_FORMAT),
      meta: { align: 'center', width: '180px' },
    },
    {
      id: 'total_amount',
      header: () => (
        <TableSortHeader
          label={tOrder('column.payment_amount')}
          column={OrderSortby.TOTAL_AMOUNT}
          currentSortBy={sortBy}
          currentSortOrder={sortOrder}
          onSortChange={onSortChange}
        />
      ),
      cell: ({ row }) => {
        const paymentMethod = row.original.payment_method;
        const showTossIcon = paymentMethod === PaymentMethod.CARD || paymentMethod === PaymentMethod.TOSS;
        const showDirectDeposit = paymentMethod === PaymentMethod.TRANSFER;

        return (
          <div className='flex flex-col items-center gap-1 text-right'>
            <span className='text-foreground text-sm font-semibold tabular-nums'>
              {formatCurrency(Number(row.original.total_amount || 0))}
            </span>
            {showTossIcon && (
              <div className='inline-flex items-center gap-1.5 rounded-full border border-blue-100 bg-blue-50/80 px-2 py-0.5 dark:border-blue-900/50 dark:bg-blue-950/40'>
                <img src={Toss} alt='Toss Payments' className='h-3 w-auto object-contain' />
              </div>
            )}
            {showDirectDeposit && <span className='text-muted-foreground text-xs font-medium'>무통장입금</span>}
          </div>
        );
      },
      meta: { align: 'right', width: '140px' },
    },
    {
      id: 'status',
      header: () => (
        <TableSortHeader
          label={tOrder('column.status')}
          column={OrderSortby.STATUS}
          currentSortBy={sortBy}
          currentSortOrder={sortOrder}
          onSortChange={onSortChange}
        />
      ),
      cell: ({ row }) => {
        const statusKey = row.original.status || '';
        const badgeStyle = ORDER_STATUS_BADGE[statusKey] || 'bg-gray-100 text-gray-700 rounded-sm';
        const displayLabel = tEnum(`order.${statusKey}`, statusKey);

        return <Badge className={cn(badgeStyle)}>{displayLabel}</Badge>;
      },
      meta: { align: 'center', width: '170px' },
    },
    {
      id: 'item_count',
      header: tOrder('column.item_count'),
      cell: ({ row }) => row.original.item_count ?? 0,
      meta: { align: 'center', width: '90px' },
    },
    {
      id: 'actions',
      header: tOrder('column.actions'),
      cell: ({ row }) => (
        <div className='flex items-center justify-center gap-1.5'>
          <Button size='icon-sm' variant='outline' onClick={() => navigate(MY_ROUTE.ORDER.DETAIL(row.original.order_number))}>
            <Eye className='size-4' />
          </Button>
          <Button
            size='icon-sm'
            variant='outline'
            disabled={workOrderPdfMutation.isPending}
            onClick={() => handleWorkOrderPdf(row.original)}>
            <Printer className='size-4' />
          </Button>
        </div>
      ),
      meta: { align: 'center', width: '110px' },
    },
  ];

  return (
    <div className='space-y-2'>
      <DataTable
        data={data}
        columns={columns}
        totalRows={totalRows}
        isLoading={isLoading}
        pagination={pagination}
        onPaginationChange={onPaginationChange}
        rowSelection={activeRowSelection}
        onRowSelectionChange={activeOnRowSelectionChange}
        enableRowSelection
        pageSizeOptions={[10, 20, 50]}
        getRowId={(row) => row.id.toString()}
        emptyMessage={tOrder('empty.no_orders')}
      />
    </div>
  );
};

export default OrderTable;
