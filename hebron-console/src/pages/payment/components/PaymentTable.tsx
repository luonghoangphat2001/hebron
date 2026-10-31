import Can from '@/components/Can';
import { DataTable } from '@/components/table/DataTable';
import { appToast } from '@/components/toast/AppToast';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { usePaymentReceiptMutation } from '@/data/payment/payment.query';
import type { PaymentListItemRESP } from '@/data/payment/payment.response';
import { cn } from '@/lib/utils';
import { DATE_FORMAT } from '@/utils/constants/date.constant';
import { MY_ROUTE } from '@/utils/constants/route.constant';
import { PAYMENT_NON_REFUNDABLE_STATUS, PAYMENT_STATUS_BADGE } from '@/utils/constants/payment.constant';
import { PaymentMethod } from '@/utils/enums/payment.enum';
import { formatDate } from '@/utils/helper/common.helper';
import type { ColumnDef, OnChangeFn, PaginationState, RowSelectionState } from '@tanstack/react-table';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import PaymentRefundModal from './PaymentRefundModal';

type Props = {
  data: PaymentListItemRESP[];
  isLoading?: boolean;
  totalRows: number;
  pagination: PaginationState;
  onPaginationChange: OnChangeFn<PaginationState>;
  rowSelection: RowSelectionState;
  onRowSelectionChange: OnChangeFn<RowSelectionState>;
};

const PaymentTable = ({
  data,
  isLoading,
  totalRows,
  pagination,
  onPaginationChange,
  rowSelection,
  onRowSelectionChange,
}: Props) => {
  const { t: tPayment } = useTranslation('payment');
  const { t: tCommon } = useTranslation('common');
  const { t: tEnum } = useTranslation('enum');

  const [refundTarget, setRefundTarget] = useState<PaymentListItemRESP | null>(null);
  const { mutate: printReceipt, isPending: isPrinting, variables: printingId } = usePaymentReceiptMutation();

  const handlePrint = (transactionId: string) =>
    printReceipt(transactionId, {
      onSuccess: (resp) => {
        if (resp.data?.pdf_url) window.open(resp.data.pdf_url, '_blank');
      },
      onError: () => appToast.error(tCommon('notify.something_went_wrong')),
    });

  const columns: ColumnDef<PaymentListItemRESP>[] = [
    {
      header: tPayment('history.column.no'),
      cell: ({ row }) => <span className='text-gray-500'>{pagination.pageIndex * pagination.pageSize + row.index + 1}</span>,
      meta: { align: 'center', width: '60px' },
    },
    {
      header: tPayment('history.column.transaction_id'),
      cell: ({ row }) => <span className='font-mono text-sm'>{row.original.transaction_id}</span>,
      meta: { width: '200px' },
    },
    {
      header: tPayment('history.column.order_id'),
      cell: ({ row }) => (
        <div>
          {row.original.order?.order_number ? (
            <Link
              to={MY_ROUTE.ORDER.DETAIL(row.original.order.order_number)}
              className='font-medium text-amber-600 hover:underline'>
              {row.original.order.order_number}
            </Link>
          ) : (
            <span className='text-muted-foreground'>—</span>
          )}
          <div className='text-muted-foreground text-xs'>
            {row.original.order?.company_name || row.original.order?.contact_name}
          </div>
        </div>
      ),
      meta: { width: '200px' },
    },
    {
      header: tPayment('history.column.payment_method'),
      cell: ({ row }) => {
        const paymentMethod =
          row.original.payment_method === PaymentMethod.CARD ? PaymentMethod.TOSS : row.original.payment_method;

        return (
          <Badge variant='outline' className='rounded-sm'>
            {tEnum(`payment.${paymentMethod}`, paymentMethod)}
          </Badge>
        );
      },
      meta: { align: 'center', width: '110px' },
    },
    {
      header: tPayment('history.column.status'),
      cell: ({ row }) => (
        <Badge className={cn(PAYMENT_STATUS_BADGE[row.original.status])}>
          {tEnum(`payment.${row.original.status}`, row.original.status)}
        </Badge>
      ),
      meta: { align: 'center', width: '140px' },
    },
    {
      header: tPayment('history.column.amount'),
      cell: ({ row }) => <span className='font-medium'>₩{row.original.amount.toLocaleString()}</span>,
      meta: { align: 'right', width: '120px' },
    },
    {
      header: tPayment('history.column.paid_at'),
      cell: ({ row }) =>
        row.original.paid_at ? (
          <div>
            <div className='font-medium'>{formatDate(row.original.paid_at, 'HH:mm')}</div>
            <div className='text-muted-foreground text-xs'>{formatDate(row.original.paid_at, DATE_FORMAT)}</div>
          </div>
        ) : (
          <span className='text-muted-foreground'>—</span>
        ),
      meta: { align: 'center', width: '110px' },
    },
    {
      header: tPayment('history.column.created_at'),
      cell: ({ row }) => (
        <div>
          <div className='font-medium'>{formatDate(row.original.created_at, 'HH:mm')}</div>
          <div className='text-muted-foreground text-xs'>{formatDate(row.original.created_at, DATE_FORMAT)}</div>
        </div>
      ),
      meta: { align: 'center', width: '110px' },
    },
    {
      header: tPayment('history.column.actions'),
      cell: ({ row }) => (
        <div className='flex justify-center gap-1'>
          <Button
            size='sm'
            variant='outline'
            className='h-7 px-2 text-xs'
            loading={isPrinting && printingId === row.original.transaction_id}
            onClick={() => handlePrint(row.original.transaction_id)}>
            {tPayment('history.button.print')}
          </Button>
          <Can action='edit'>
            <Button
              size='sm'
              variant='outline'
              className='h-7 px-2 text-xs'
              disabled={PAYMENT_NON_REFUNDABLE_STATUS.includes(row.original.status) || !row.original.paid_at}
              onClick={() => setRefundTarget(row.original)}>
              {tPayment('history.button.refund')}
            </Button>
          </Can>
        </div>
      ),
      meta: { align: 'center', width: '130px' },
    },
  ];

  return (
    <>
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
        emptyMessage={tPayment('history.empty')}
      />
      <PaymentRefundModal payment={refundTarget} open={!!refundTarget} onOpenChange={(open) => !open && setRefundTarget(null)} />
    </>
  );
};

export default PaymentTable;
