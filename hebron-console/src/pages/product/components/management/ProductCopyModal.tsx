import AppDialog from '@/components/dialog/AppDialog';
import FormItem from '@/components/form/FormItem';
import { appToast } from '@/components/toast/AppToast';
import { Input } from '@/components/ui/input';
import { useProductCopyMutation, useProductCopyPreviewQuery } from '@/data/product/product.query';
import { getErrorMessage } from '@/utils/helper/noti-error.helper';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

type Props = {
  open: boolean;
  setOpen: (value: boolean) => void;
  productId?: number;
};

const ProductCopyModal = ({ open, setOpen, productId }: Props) => {
  const { t } = useTranslation('product');
  const { t: tCommon } = useTranslation('common');
  const [copyTitle, setCopyTitle] = useState('');

  const { data: preview, isLoading } = useProductCopyPreviewQuery(open ? productId : undefined);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- seeds the editable draft from the async preview fetch
    if (preview) setCopyTitle(preview.default_copy_title);
  }, [preview]);

  const { mutate, isPending } = useProductCopyMutation({
    onSuccess: () => {
      setOpen(false);
      appToast.success(tCommon('notify.success_copy'));
    },
    onError: (error) => appToast.error(getErrorMessage(error, tCommon('notify.fail_copy'))),
  });

  return (
    <AppDialog
      open={open}
      onOpenChange={setOpen}
      title={t('copy_modal.title')}
      onOk={() => productId && mutate({ id: productId, copy_title: copyTitle.trim() })}
      loading={isPending}
      contentLoading={isLoading}
      okDisabled={!copyTitle.trim()}
      className='sm:max-w-md'>
      <FormItem label={t('copy_modal.field_copy_title')} required>
        <Input value={copyTitle} onChange={(e) => setCopyTitle(e.target.value)} placeholder={t('copy_modal.ph_copy_title')} />
      </FormItem>
    </AppDialog>
  );
};

export default ProductCopyModal;
