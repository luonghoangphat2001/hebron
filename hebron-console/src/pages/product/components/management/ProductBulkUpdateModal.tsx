import { BLOCKED_NUMBER_KEYS } from '@/utils/constants/common.constant';
import AppDialog from '@/components/dialog/AppDialog';
import FormItem from '@/components/form/FormItem';
import AppMultiSelect from '@/components/select/AppMultiSelect';
import { appToast } from '@/components/toast/AppToast';
import { Input } from '@/components/ui/input';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group';
import { useCategoryInfiniteQuery } from '@/data/category/category.query';
import { useProductBulkUpdateMutation } from '@/data/product/product.query';
import type { ProductBulkUpdateREQ } from '@/data/product/product.request';
import { PRODUCT_PRICE_MAX_DIGITS } from '@/schemas/product/product.schema';
import { formatMoney } from '@/utils/helper/common.helper';
import { getErrorMessage } from '@/utils/helper/noti-error.helper';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

type Props = {
  open: boolean;
  setOpen: (value: boolean) => void;
  productIds: number[];
  onSuccess?: () => void;
};

/** Every field is optional — undefined / empty selection means "leave as is" for the selected products. */
type Changes = Omit<ProductBulkUpdateREQ, 'product_ids'>;

const ProductBulkUpdateModal = ({ open, setOpen, productIds, onSuccess }: Props) => {
  const { t } = useTranslation('product');
  const { t: tCommon } = useTranslation('common');
  const [changes, setChanges] = useState<Changes>({});

  const categoryQuery = useCategoryInfiniteQuery();
  const { mutateAsync, isPending } = useProductBulkUpdateMutation();

  const body: Changes = {
    ...(changes.category_ids?.length ? { category_ids: changes.category_ids } : {}),
    ...(changes.selling_price !== undefined ? { selling_price: changes.selling_price } : {}),
    ...(changes.stock_quantity !== undefined ? { stock_quantity: changes.stock_quantity } : {}),
    ...(changes.sort_order !== undefined ? { sort_order: changes.sort_order } : {}),
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) setChanges({});
    setOpen(next);
  };

  const handleOk = async () => {
    if (!Object.keys(body).length) return;

    try {
      const resp = await mutateAsync({ product_ids: productIds, ...body });
      appToast.success(t('bulk.success_update', { count: resp.data.updated_count }));
      handleOpenChange(false);
      onSuccess?.();
    } catch (error) {
      appToast.error(getErrorMessage(error, tCommon('notify.fail_update')));
    }
  };

  const setNumber = (key: keyof Changes, value: string) =>
    setChanges((prev) => ({ ...prev, [key]: value === '' ? undefined : Number(value) }));

  return (
    <AppDialog
      open={open}
      onOpenChange={handleOpenChange}
      title={t('bulk.update_modal_title')}
      description={t('bulk.update_hint', { count: productIds.length })}
      onOk={handleOk}
      loading={isPending}
      okDisabled={!Object.keys(body).length}
      className='sm:max-w-md'>
      <div className='space-y-4'>
        <FormItem label={t('modal.field_categories')}>
          <AppMultiSelect
            options={categoryQuery.data || []}
            value={changes.category_ids ?? []}
            onChange={(category_ids) => setChanges((prev) => ({ ...prev, category_ids }))}
            placeholder={t('modal.ph_categories')}
            onLoadMore={categoryQuery.fetchNextPage}
            hasMore={categoryQuery.hasNextPage}
            isLoadingMore={categoryQuery.isFetchingNextPage}
          />
        </FormItem>
        <FormItem label={t('modal.field_selling_price')}>
          <InputGroup>
            <InputGroupInput
              inputMode='numeric'
              placeholder={t('modal.ph_amount')}
              value={formatMoney(changes.selling_price)}
              onChange={(e) => setNumber('selling_price', e.target.value.replace(/\D/g, '').slice(0, PRODUCT_PRICE_MAX_DIGITS))}
            />
            <InputGroupAddon align='inline-end'>₩</InputGroupAddon>
          </InputGroup>
        </FormItem>
        <FormItem label={t('modal.field_stock_quantity')}>
          <Input
            type='number'
            min={0}
            placeholder={t('modal.ph_quantity')}
            value={changes.stock_quantity ?? ''}
            onKeyDown={(e) => BLOCKED_NUMBER_KEYS.includes(e.key) && e.preventDefault()}
            onChange={(e) => setNumber('stock_quantity', e.target.value)}
          />
        </FormItem>
        <FormItem label={t('modal.field_sort_order')}>
          <Input
            type='number'
            min={0}
            placeholder={t('modal.ph_quantity')}
            value={changes.sort_order ?? ''}
            onKeyDown={(e) => BLOCKED_NUMBER_KEYS.includes(e.key) && e.preventDefault()}
            onChange={(e) => setNumber('sort_order', e.target.value)}
          />
        </FormItem>
      </div>
    </AppDialog>
  );
};

export default ProductBulkUpdateModal;
