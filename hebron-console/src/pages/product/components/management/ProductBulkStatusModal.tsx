import AppDialog from '@/components/dialog/AppDialog';
import { appToast } from '@/components/toast/AppToast';
import { Button } from '@/components/ui/button';
import { useProductBulkUpdateStatusMutation } from '@/data/product/product.query';
import type { ProductBulkStatusField } from '@/data/product/product.request';
import type { Product } from '@/data/product/product.response';
import { getErrorMessage } from '@/utils/helper/noti-error.helper';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

type Props = {
  open: boolean;
  setOpen: (value: boolean) => void;
  products: Product[];
  onSuccess?: () => void;
};

/** undefined = leave this field unchanged for the selected products. */
type FieldChanges = Partial<Record<ProductBulkStatusField, boolean>>;

const FIELDS: ProductBulkStatusField[] = ['is_active', 'is_popular', 'is_featured'];

const ProductBulkStatusModal = ({ open, setOpen, products, onSuccess }: Props) => {
  const { t } = useTranslation('product');
  const { t: tCommon } = useTranslation('common');
  const [changes, setChanges] = useState<FieldChanges>({});

  const { mutateAsync, isPending } = useProductBulkUpdateStatusMutation();

  const fieldLabel: Record<ProductBulkStatusField, string> = {
    is_active: t('modal.is_active'),
    is_popular: t('modal.is_popular'),
    is_featured: t('modal.is_featured'),
  };

  const currentOnCount = (field: ProductBulkStatusField) => products.filter((product) => product[field]).length;

  const entries = (Object.entries(changes) as [ProductBulkStatusField, boolean | undefined][]).filter(
    ([, value]) => value !== undefined,
  ) as [ProductBulkStatusField, boolean][];

  const handleOpenChange = (next: boolean) => {
    if (!next) setChanges({});
    setOpen(next);
  };

  const handleOk = async () => {
    if (!entries.length) return;

    const productIds = products.map((product) => product.id);

    try {
      const results = await Promise.all(entries.map(([field, value]) => mutateAsync({ product_ids: productIds, field, value })));
      const updatedCount = Math.max(...results.map((resp) => resp.data.updated_count));
      appToast.success(t('bulk.success_status', { count: updatedCount }));
      handleOpenChange(false);
      onSuccess?.();
    } catch (error) {
      appToast.error(getErrorMessage(error, tCommon('notify.fail_update')));
    }
  };

  return (
    <AppDialog
      open={open}
      onOpenChange={handleOpenChange}
      title={t('bulk.status_modal_title')}
      onOk={handleOk}
      loading={isPending}
      okDisabled={!entries.length}
      className='sm:max-w-md'>
      <div className='space-y-4'>
        {FIELDS.map((field) => (
          <div key={field} className='flex items-center justify-between'>
            <div>
              <span className='text-sm font-medium'>{fieldLabel[field]}</span>
              <p className='text-muted-foreground text-xs'>
                {t('bulk.current_status', { onCount: currentOnCount(field), total: products.length })}
              </p>
            </div>
            <div className='flex items-center gap-1.5'>
              <Button
                type='button'
                size='sm'
                variant={changes[field] === undefined ? 'secondary' : 'outline'}
                onClick={() => setChanges((prev) => ({ ...prev, [field]: undefined }))}>
                {t('bulk.keep')}
              </Button>
              <Button
                type='button'
                size='sm'
                variant={changes[field] === true ? 'default' : 'outline'}
                onClick={() => setChanges((prev) => ({ ...prev, [field]: true }))}>
                {t('bulk.on')}
              </Button>
              <Button
                type='button'
                size='sm'
                variant={changes[field] === false ? 'default' : 'outline'}
                onClick={() => setChanges((prev) => ({ ...prev, [field]: false }))}>
                {t('bulk.off')}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </AppDialog>
  );
};

export default ProductBulkStatusModal;
