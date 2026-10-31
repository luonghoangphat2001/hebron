import { DataTable } from '@/components/table/DataTable';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { ShipmentRESP } from '@/data/delivery/delivery.response';
import { useCan } from '@/hooks/useMenuAccess';
import { cn } from '@/lib/utils';
import { DATE_FORMAT } from '@/utils/constants/date.constant';
import { SHIPMENT_STATUS_BADGE } from '@/utils/constants/delivery.constant';
import { MY_ROUTE } from '@/utils/constants/route.constant';
import { formatDate } from '@/utils/helper/common.helper';
import type { ColumnDef, OnChangeFn, PaginationState, RowSelectionState } from '@tanstack/react-table';
import { Pencil, Truck } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import ShipmentDetailModal from './ShipmentDetailModal';
import ShipmentEditModal from './ShipmentEditModal';

type ShipmentTableProps = {
  data: ShipmentRESP[];
  isLoading: boolean;
  totalRecord: number;
  pagination: PaginationState;
  onPaginationChange: OnChangeFn<PaginationState>;
  rowSelection: RowSelectionState;
  onRowSelectionChange: OnChangeFn<RowSelectionState>;
};

const ShipmentTable = ({
  data,
  isLoading,
  totalRecord,
  pagination,
  onPaginationChange,
  rowSelection,
  onRowSelectionChange,
}: ShipmentTableProps) => {
  const { t: tDelivery } = useTranslation('delivery');
  const { t: tEnum } = useTranslation('enum');
  const can = useCan();
  const [viewRow, setViewRow] = useState<ShipmentRESP | null>(null);
  const [editRow, setEditRow] = useState<ShipmentRESP | null>(null);

  const columns: ColumnDef<ShipmentRESP>[] = [
    {
      header: tDelivery('shipment.column.order_number'),
      cell: ({ row }) => (
        <Link to={MY_ROUTE.ORDER.DETAIL(row.original.order_number)} className='font-medium text-amber-600 hover:underline'>
          {row.original.order_number}
        </Link>
      ),
      meta: { width: '200px' },
    },
    {
      header: tDelivery('shipment.column.customer_name'),
      cell: ({ row }) => <span className='whitespace-normal'>{row.original.customer_name ?? '—'}</span>,
      meta: { align: 'center', width: '130px' },
    },
    {
      header: tDelivery('shipment.column.product_name'),
      cell: ({ row }) => <span className='whitespace-normal'>{row.original.product_name ?? '—'}</span>,
      meta: { width: '200px' },
    },
    {
      header: tDelivery('shipment.column.status'),
      cell: ({ row }) => (
        <Badge className={cn(SHIPMENT_STATUS_BADGE[row.original.status])}>{tEnum(`delivery.${row.original.status}`)}</Badge>
      ),
      meta: { align: 'center', width: '120px' },
    },
    {
      header: tDelivery('shipment.column.invoice_number'),
      cell: ({ row }) => row.original.invoice_number ?? '—',
      meta: { align: 'center', width: '180px' },
    },
    {
      header: tDelivery('shipment.column.carrier_name'),
      cell: ({ row }) => row.original.carrier_name ?? '—',
      meta: { align: 'center', width: '120px' },
    },
    {
      header: tDelivery('shipment.column.delivery_manager'),
      cell: ({ row }) => row.original.delivery_manager?.name ?? '—',
      meta: { align: 'center', width: '160px' },
    },
    {
      header: tDelivery('shipment.column.shipping_name'),
      cell: ({ row }) => row.original.shipping_name ?? '—',
      meta: { align: 'center', width: '120px' },
    },
    {
      header: tDelivery('shipment.column.quantity'),
      cell: ({ row }) => row.original.quantity?.toLocaleString() ?? '—',
      meta: { align: 'center', width: '100px' },
    },
    {
      header: tDelivery('shipment.column.shipped_at'),
      cell: ({ row }) =>
        row.original.shipped_at ? (
          <div>
            <div className='font-medium'>{formatDate(row.original.shipped_at, 'HH:mm')}</div>
            <div className='text-muted-foreground text-xs'>{formatDate(row.original.shipped_at, DATE_FORMAT)}</div>
          </div>
        ) : (
          '—'
        ),
      meta: { width: '110px' },
    },
    {
      header: tDelivery('shipment.column.delivered_at'),
      cell: ({ row }) =>
        row.original.delivered_at ? (
          <div>
            <div className='font-medium'>{formatDate(row.original.delivered_at, 'HH:mm')}</div>
            <div className='text-muted-foreground text-xs'>{formatDate(row.original.delivered_at, DATE_FORMAT)}</div>
          </div>
        ) : (
          '—'
        ),
      meta: { width: '110px' },
    },
    {
      id: 'tracking_number',
      header: tDelivery('shipment.column.tracking_number'),
      cell: ({ row }) =>
        row.original.tracking_number ? (
          <div className='flex flex-col items-center gap-1'>
            <span className='font-medium break-all'>{row.original.tracking_number}</span>
            <Button variant='outline' size='sm' className='gap-1' onClick={() => setViewRow(row.original)}>
              <Truck className='h-3.5 w-3.5' />
              {tDelivery('shipment.button.track')}
            </Button>
          </div>
        ) : can('register') ? (
          <Button variant='outline' size='sm' className='gap-1' onClick={() => setEditRow(row.original)}>
            <Pencil className='h-3.5 w-3.5' />
            {tDelivery('shipment.button.register')}
          </Button>
        ) : (
          '—'
        ),
      meta: { align: 'center', width: '150px' },
    },
  ];

  return (
    <>
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
        emptyMessage={tDelivery('shipment.empty')}
        tableClassName='table-fixed'
      />
      <ShipmentDetailModal
        key={`view-${viewRow?.id}`}
        open={!!viewRow}
        onOpenChange={(open) => !open && setViewRow(null)}
        shipment={viewRow}
        onEdit={() => {
          setEditRow(viewRow);
          setViewRow(null);
        }}
      />
      <ShipmentEditModal
        key={`edit-${editRow?.id}`}
        open={!!editRow}
        onOpenChange={(open) => !open && setEditRow(null)}
        shipment={editRow}
      />
    </>
  );
};

export default ShipmentTable;
