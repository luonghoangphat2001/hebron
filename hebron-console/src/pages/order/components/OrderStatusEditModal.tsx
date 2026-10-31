import FormItem from '@/components/form/FormItem';
import AppSelect from '@/components/select/AppSelect';
import { appToast } from '@/components/toast/AppToast';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Spinner } from '@/components/ui/spinner';
import { useUpdateOrderStatusMutation } from '@/data/order/order.query';
import { updateOrderStatusSchema, type OrderStatusInput } from '@/schemas/order/order.schema';
import { OrderStatus } from '@/utils/enums/order.enum';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMemo } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

type Props = {
  open: boolean;
  setOpen: (open: boolean) => void;
  orderNumber: string;
  currentStatus: string;
  onSuccess: () => void;
};

const OrderStatusEditModal = ({ open, setOpen, orderNumber, currentStatus, onSuccess }: Props) => {
  const { t: tOrder } = useTranslation('order');
  const { t: tEnum } = useTranslation('enum');
  const { t: tCommon } = useTranslation('common');

  const { mutate: updateStatus, isPending } = useUpdateOrderStatusMutation({
    onSuccess: (resp) => {
      appToast.success(resp.message || tCommon('notify.success_update'));
      setOpen(false);
      onSuccess();
    },
    onError: (err: any) => {
      const errorMsg = err?.response?.data?.message || tCommon('notify.something_went_wrong');
      appToast.error(errorMsg);
    },
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<OrderStatusInput>({
    resolver: zodResolver(updateOrderStatusSchema),
    defaultValues: {
      status: (currentStatus as OrderStatus) || OrderStatus.PENDING,
    },
  });

  const statusOptions = useMemo(
    () =>
      Array.from(new Set(Object.values(OrderStatus))).map((v) => ({
        value: v,
        label: tEnum(`order.${v}`, v),
      })),
    [tEnum],
  );

  const onSubmit = (data: OrderStatusInput) => {
    updateStatus({ orderNumber, status: data.status });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle>{tOrder('button.edit_status')}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className='space-y-4 py-2'>
          <FormItem label={tOrder('field.status')} required error={errors.status?.message}>
            <Controller
              control={control}
              name='status'
              render={({ field }) => (
                <AppSelect
                  options={statusOptions}
                  value={field.value}
                  placeholder={tOrder('placeholder.select_status')}
                  onChange={(val) => field.onChange(val || '')}
                  clearable={false}
                  showSearch
                />
              )}
            />
          </FormItem>

          <DialogFooter className='pt-2'>
            <Button type='button' variant='outline' onClick={() => setOpen(false)} disabled={isPending}>
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

export default OrderStatusEditModal;
