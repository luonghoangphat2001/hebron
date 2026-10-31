import FormItem from '@/components/form/FormItem';
import { appToast } from '@/components/toast/AppToast';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { useShipmentUpdateMutation } from '@/data/delivery/delivery.query';
import type { ShipmentRESP } from '@/data/delivery/delivery.response';
import { shipmentUpdateSchema, type ShipmentUpdateInput } from '@/schemas/delivery/delivery.schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shipment: ShipmentRESP | null;
};

const ShipmentEditModal = ({ open, onOpenChange, shipment }: Props) => {
  const { t: tDelivery } = useTranslation('delivery');
  const { t: tCommon } = useTranslation('common');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ShipmentUpdateInput>({
    resolver: zodResolver(shipmentUpdateSchema),
    defaultValues: {
      invoice_number: shipment?.invoice_number || '',
      tracking_number: shipment?.tracking_number || '',
      carrier_name: shipment?.carrier_name || '',
    },
  });

  const { mutate: updateShipment, isPending } = useShipmentUpdateMutation({
    onSuccess: (resp) => {
      appToast.success(resp.message || tCommon('notify.success_update'));
      onOpenChange(false);
    },
    onError: (err) => appToast.error(err?.response?.data?.message || tCommon('notify.something_went_wrong')),
  });

  if (!shipment) return null;

  const onSubmit = (data: ShipmentUpdateInput) => updateShipment({ orderNumber: shipment.order_number, ...data });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[480px]'>
        <DialogHeader>
          <DialogTitle>{tDelivery('shipment.modal.edit_title')}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className='space-y-4 py-2'>
          <FormItem label={tDelivery('shipment.field.invoice_number')} required error={errors.invoice_number?.message}>
            <Input placeholder={tDelivery('shipment.placeholder.invoice_number')} {...register('invoice_number')} />
          </FormItem>
          <FormItem label={tDelivery('shipment.field.tracking_number')} required error={errors.tracking_number?.message}>
            <Input placeholder={tDelivery('shipment.placeholder.tracking_number')} {...register('tracking_number')} />
          </FormItem>
          <FormItem label={tDelivery('shipment.field.carrier_name')} required error={errors.carrier_name?.message}>
            <Input placeholder={tDelivery('shipment.placeholder.carrier_name')} {...register('carrier_name')} />
          </FormItem>

          <DialogFooter className='pt-2'>
            <Button type='button' variant='outline' onClick={() => onOpenChange(false)} disabled={isPending}>
              {tCommon('button.cancel')}
            </Button>
            <Button type='submit' disabled={isPending} className='gap-2'>
              {isPending && <Spinner className='size-4' />}
              {tCommon('button.save')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ShipmentEditModal;
