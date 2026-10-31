import Can from '@/components/Can';
import ConfirmDialog from '@/components/dialog/ConfirmDialog';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import type { Product } from '@/data/product/product.response';
import { Download, Pencil, SlidersHorizontal, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import ProductBulkStatusModal from './ProductBulkStatusModal';
import ProductBulkUpdateModal from './ProductBulkUpdateModal';

type Props = {
  count: number;
  selectedProducts: Product[];
  isExporting?: boolean;
  onExport: () => void;
  isDeleting?: boolean;
  onDelete: () => void;
  onStatusChanged?: () => void;
  onUpdated?: () => void;
};

/** Shown above the table once rows are selected — export/status/delete, paired with row-selection state. */
const ProductBulkActionsBar = ({
  count,
  selectedProducts,
  isExporting,
  onExport,
  isDeleting,
  onDelete,
  onStatusChanged,
  onUpdated,
}: Props) => {
  const { t } = useTranslation('product');
  const { t: tCommon } = useTranslation('common');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [updateModalOpen, setUpdateModalOpen] = useState(false);

  if (count === 0) return null;

  return (
    <div className='flex items-center justify-between rounded-md border bg-gray-50 p-2'>
      <span className='text-muted-foreground text-sm'>{tCommon('label.selected_count', { count })}</span>
      <div className='flex items-center gap-2'>
        <Button variant='outline' size='sm' onClick={onExport} disabled={isExporting} className='gap-1.5'>
          {isExporting ? <Spinner /> : <Download className='size-4' />}
          {tCommon('export.selected')}
        </Button>
        <Can action='edit'>
          <Button variant='outline' size='sm' onClick={() => setUpdateModalOpen(true)} className='gap-1.5'>
            <Pencil className='size-4' />
            {t('bulk.update')}
          </Button>
        </Can>
        <Can action='edit'>
          <Button variant='outline' size='sm' onClick={() => setStatusModalOpen(true)} className='gap-1.5'>
            <SlidersHorizontal className='size-4' />
            {t('bulk.actions')}
          </Button>
        </Can>
        <Can action='delete'>
          <Button size='sm' variant='destructive' onClick={() => setConfirmOpen(true)} disabled={isDeleting} className='gap-1.5'>
            {isDeleting ? <Spinner /> : <Trash2 className='size-4' />}
            {t('bulk.delete')}
          </Button>
        </Can>
      </div>
      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={t('bulk.confirm_delete_title')}
        description={t('bulk.confirm_delete_description', { count })}
        onConfirm={() => {
          onDelete();
          setConfirmOpen(false);
        }}
        isLoading={isDeleting}
        variant='destructive'
      />
      <ProductBulkStatusModal
        open={statusModalOpen}
        setOpen={setStatusModalOpen}
        products={selectedProducts}
        onSuccess={onStatusChanged}
      />
      <ProductBulkUpdateModal
        open={updateModalOpen}
        setOpen={setUpdateModalOpen}
        productIds={selectedProducts.map((product) => product.id)}
        onSuccess={onUpdated}
      />
    </div>
  );
};

export default ProductBulkActionsBar;
