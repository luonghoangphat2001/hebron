import Can from '@/components/Can';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useShipmentByInvoiceQuery, useShipmentTrackingEventsQuery } from '@/data/delivery/delivery.query';
import type { ShipmentRESP } from '@/data/delivery/delivery.response';
import { cn } from '@/lib/utils';
import { DATE_TIME_FORMAT } from '@/utils/constants/date.constant';
import { SHIPMENT_STATUS_BADGE } from '@/utils/constants/delivery.constant';
import { formatDate } from '@/utils/helper/common.helper';
import { ClipboardList, Pencil, Truck } from 'lucide-react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shipment: ShipmentRESP | null;
  onEdit: () => void;
};

const Row = ({ label, children }: { label: string; children: ReactNode }) => (
  <div>
    <p className='text-xs text-gray-500'>{label}</p>
    <p className='font-medium wrap-break-word'>{children}</p>
  </div>
);

const ShipmentDetailModal = ({ open, onOpenChange, shipment, onEdit }: Props) => {
  const { t: tDelivery } = useTranslation('delivery');
  const { t: tEnum } = useTranslation('enum');

  // Rows already carry the full shipment; refetch by invoice only to show the freshest data.
  const invoiceNumber = open ? shipment?.invoice_number : undefined;
  const { data: fresh } = useShipmentByInvoiceQuery(invoiceNumber);
  const { data: events = [] } = useShipmentTrackingEventsQuery(shipment?.tracking_number ? invoiceNumber : undefined);
  const data = fresh ?? shipment;

  if (!data) return null;

  // Newest first — `occurred_at` is 'YYYY-MM-DD HH:mm:ss', so sorting it as text is chronological.
  const history = [...events].sort((a, b) => (b.occurred_at ?? '').localeCompare(a.occurred_at ?? ''));
  const latest = history[0];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        onOpenAutoFocus={(e) => e.preventDefault()}
        className='flex max-h-[90vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-3xl'>
        <DialogHeader className='border-b border-gray-200 p-4'>
          <DialogTitle className='text-base'>{tDelivery('shipment.modal.detail_title')}</DialogTitle>
          <DialogDescription>{data.order_number}</DialogDescription>
          <Can action='edit'>
            <Button variant='outline' size='sm' className='absolute top-4 right-12 gap-1' onClick={onEdit}>
              <Pencil className='h-3.5 w-3.5' />
              {tDelivery('shipment.button.edit')}
            </Button>
          </Can>
        </DialogHeader>

        <div className='scrollbar-thin flex-1 space-y-4 overflow-y-auto p-4 text-sm'>
          <div className='rounded-xl border border-gray-200 p-4'>
            <div className='mb-3 flex items-center gap-2 font-semibold'>
              <ClipboardList className='h-4 w-4 text-gray-500' />
              {tDelivery('shipment.modal.section.order_info')}
              <Badge className={cn('ml-auto', SHIPMENT_STATUS_BADGE[data.status])}>{tEnum(`delivery.${data.status}`)}</Badge>
            </div>
            <div className='grid grid-cols-3 gap-y-3'>
              <Row label={tDelivery('shipment.column.customer_name')}>{data.customer_name ?? '-'}</Row>
              <Row label={tDelivery('shipment.column.product_name')}>{data.product_name ?? '-'}</Row>
              <Row label={tDelivery('shipment.column.quantity')}>{data.quantity?.toLocaleString() ?? '-'}</Row>
              <Row label={tDelivery('shipment.column.delivery_manager')}>{data.delivery_manager?.name ?? '-'}</Row>
              <Row label={tDelivery('shipment.column.shipped_at')}>
                {data.shipped_at ? formatDate(data.shipped_at, DATE_TIME_FORMAT) : '-'}
              </Row>
              <Row label={tDelivery('shipment.column.delivered_at')}>
                {data.delivered_at ? formatDate(data.delivered_at, DATE_TIME_FORMAT) : '-'}
              </Row>
            </div>
          </div>

          <div className='rounded-xl border border-gray-200 p-4'>
            <div className='mb-3 flex items-center gap-2 font-semibold'>
              <Truck className='h-4 w-4 text-gray-500' />
              {tDelivery('shipment.modal.section.shipping_info')}
            </div>
            <div className='grid grid-cols-3 gap-y-3'>
              <Row label={tDelivery('shipment.column.invoice_number')}>{data.invoice_number ?? '-'}</Row>
              <Row label={tDelivery('shipment.column.tracking_number')}>{data.tracking_number ?? '-'}</Row>
              <Row label={tDelivery('shipment.column.carrier_name')}>{data.carrier_name ?? '-'}</Row>
              <Row label={tDelivery('shipment.column.shipping_name')}>{data.shipping_name ?? '-'}</Row>
              <Row label={tDelivery('shipment.column.shipping_phone')}>{data.shipping_phone ?? '-'}</Row>
              <Row label={tDelivery('shipment.column.shipping_fee')}>{`${data.shipping_fee?.toLocaleString() ?? 0}원`}</Row>
              <Row label={tDelivery('shipment.column.shipping_postcode')}>{data.shipping_postcode ?? '-'}</Row>
              <div className='col-span-2'>
                <Row label={tDelivery('shipment.column.shipping_address')}>
                  {data.shipping_address ?? '-'}
                  {data.shipping_address_detail ? ` (${data.shipping_address_detail})` : ''}
                </Row>
              </div>
              <Row label={tDelivery('shipment.modal.field.current_status')}>{latest?.status ?? '-'}</Row>
              <Row label={tDelivery('shipment.modal.field.last_updated')}>{latest?.occurred_at ?? '-'}</Row>
            </div>

            {!!data.tracking_number && (
              <div className='mt-4 border-t border-gray-200 pt-4'>
                <p className='mb-3 font-semibold'>{tDelivery('shipment.modal.section.tracking_history')}</p>
                {history.length ? (
                  <ol className='space-y-4'>
                    {history.map((event, idx) => (
                      <li key={`${event.occurred_at}-${idx}`} className='relative flex gap-3 pb-4 last:pb-0'>
                        <span
                          className={cn(
                            'mt-1 h-3 w-3 shrink-0 rounded-full',
                            idx === 0 ? 'bg-amber-400 ring-2 ring-amber-300 ring-offset-1' : 'bg-gray-300',
                          )}
                        />
                        {idx < history.length - 1 && <span className='absolute top-4 left-1.5 h-full w-px bg-gray-200' />}
                        <div className='flex-1'>
                          <div className='flex items-start justify-between gap-4'>
                            <p className='font-semibold'>{event.status}</p>
                            <p className='shrink-0 text-xs text-gray-500'>{event.occurred_at}</p>
                          </div>
                          <p className='text-gray-600'>{event.description}</p>
                          {event.alert && <p className='font-medium text-red-500'>{event.alert}</p>}
                          {event.location && <p className='text-xs text-gray-500'>{event.location}</p>}
                        </div>
                      </li>
                    ))}
                  </ol>
                ) : (
                  <p className='text-gray-500'>{tDelivery('shipment.modal.no_tracking_history')}</p>
                )}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShipmentDetailModal;
