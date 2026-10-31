import RowActionButton from '@/components/button/RowActionButton';
import ConfirmDialog from '@/components/dialog/ConfirmDialog';
import { DataTable } from '@/components/table/DataTable';
import { TableSortHeader } from '@/components/table/TableSortHeader';
import { appToast } from '@/components/toast/AppToast';
import { Badge } from '@/components/ui/badge';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { useProductDeleteMutation } from '@/data/product/product.query';
import { useCan } from '@/hooks/useMenuAccess';
import type { Product } from '@/data/product/product.response';
import type { SortOrder } from '@/utils/enums/common.enum';
import { ProductSort } from '@/utils/enums/product.enum';
import { MY_ROUTE } from '@/utils/constants/route.constant';
import { formatCurrency, formatDate } from '@/utils/helper/common.helper';
import { toStorageUrl } from '@/utils/helper/storage-url.helper';
import { getErrorMessage } from '@/utils/helper/noti-error.helper';
import type { ColumnDef, OnChangeFn, PaginationState, RowSelectionState } from '@tanstack/react-table';
import { Copy, ImageOff } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import ProductCopyModal from './ProductCopyModal';

const MAX_CATEGORIES_SHOWN = 2;

type Props = {
  data: Product[];
  isLoading: boolean;
  totalRows: number;
  pagination: PaginationState;
  onPaginationChange: OnChangeFn<PaginationState>;
  sortBy?: ProductSort;
  sortOrder?: SortOrder;
  onSortChange?: (sortBy?: ProductSort, sortOrder?: SortOrder) => void;
  rowSelection?: RowSelectionState;
  onRowSelectionChange?: OnChangeFn<RowSelectionState>;
};

const ProductTable = ({
  data,
  isLoading,
  totalRows,
  pagination,
  onPaginationChange,
  sortBy,
  sortOrder,
  onSortChange,
  rowSelection,
  onRowSelectionChange,
}: Props) => {
  const { t } = useTranslation('product');
  const { t: tCommon } = useTranslation('common');
  const navigate = useNavigate();
  const can = useCan();

  const [deleteProductId, setDeleteProductId] = useState<number | undefined>(undefined);
  const [copyProductId, setCopyProductId] = useState<number | undefined>(undefined);
  const [internalRowSelection, setInternalRowSelection] = useState<RowSelectionState>({});

  const activeRowSelection = rowSelection ?? internalRowSelection;
  const activeOnRowSelectionChange = onRowSelectionChange ?? setInternalRowSelection;

  const { mutate: mutateDelete, isPending: isDeleting } = useProductDeleteMutation({
    onSuccess: (_, id) => {
      setDeleteProductId(undefined);
      appToast.success(tCommon('notify.success_delete'));
      activeOnRowSelectionChange((prev) => {
        const next = { ...prev };
        delete next[id.toString()];
        return next;
      });
    },
    onError: (error) => appToast.error(getErrorMessage(error, tCommon('notify.fail_delete'))),
  });

  const columns: ColumnDef<Product>[] = [
    {
      id: 'image',
      header: t('column.image'),
      cell: ({ row }) => {
        const image = row.original.first_image || row.original.images?.[0];

        return (
          <div className='bg-muted/30 flex size-12 items-center justify-center overflow-hidden rounded-md border'>
            {image ? (
              <img src={toStorageUrl(image)} alt={row.original.name?.ko} className='size-full object-cover' loading='lazy' />
            ) : (
              <ImageOff className='text-muted-foreground size-4' />
            )}
          </div>
        );
      },
      meta: { align: 'center', width: '80px' },
    },
    {
      id: 'name',
      header: () => (
        <TableSortHeader
          label={t('column.name')}
          column={ProductSort.NAME}
          currentSortBy={sortBy}
          currentSortOrder={sortOrder}
          onSortChange={onSortChange}
        />
      ),
      cell: ({ row }) => <span className='line-clamp-2'>{row.original.name?.ko || row.original.name?.en}</span>,
      meta: { width: '260px' },
    },
    {
      header: t('column.sku'),
      cell: ({ row }) => <span className='font-mono text-xs'>{row.original.sku || '-'}</span>,
      meta: { width: '140px' },
    },
    {
      id: 'category',
      header: () => (
        <TableSortHeader
          label={t('column.category')}
          column={ProductSort.CATEGORY}
          currentSortBy={sortBy}
          currentSortOrder={sortOrder}
          onSortChange={onSortChange}
        />
      ),
      cell: ({ row }) => {
        const categories = row.original.categories || [];
        if (!categories.length) return <span className='text-muted-foreground'>-</span>;

        return (
          <div className='flex flex-wrap items-center gap-1'>
            {categories.slice(0, MAX_CATEGORIES_SHOWN).map((category) => (
              <Badge key={category.id} variant='outline' className='rounded-sm'>
                {category.name?.ko || category.name?.en}
              </Badge>
            ))}
            {categories.length > MAX_CATEGORIES_SHOWN && (
              <span className='text-muted-foreground text-xs'>+{categories.length - MAX_CATEGORIES_SHOWN}</span>
            )}
          </div>
        );
      },
      meta: { width: '220px' },
    },
    {
      header: t('column.price'),
      cell: ({ row }) => formatCurrency(row.original.selling_price || 0),
      meta: { align: 'right', width: '140px' },
    },
    {
      header: t('column.stock'),
      cell: ({ row }) => {
        const stockQuantity = row.original.stock_quantity ?? 0;

        return <span className={stockQuantity <= 0 ? 'text-destructive font-medium' : undefined}>{stockQuantity}</span>;
      },
      meta: { align: 'center', width: '90px' },
    },
    {
      id: 'status',
      header: () => (
        <TableSortHeader
          label={t('column.status')}
          column={ProductSort.STATUS}
          currentSortBy={sortBy}
          currentSortOrder={sortOrder}
          onSortChange={onSortChange}
        />
      ),
      cell: ({ row }) => (
        <Badge variant={row.original.is_public ? 'default' : 'secondary'} className='rounded-sm'>
          {row.original.is_public ? t('status.sold') : t('status.hidden')}
        </Badge>
      ),
      meta: { align: 'center', width: '110px' },
    },
    {
      id: 'created_at',
      header: () => (
        <TableSortHeader
          label={t('column.created_at')}
          column={ProductSort.CREATED_AT}
          currentSortBy={sortBy}
          currentSortOrder={sortOrder}
          onSortChange={onSortChange}
        />
      ),
      cell: ({ row }) => formatDate(row.original.created_at),
      meta: { align: 'center', width: '150px' },
    },
    {
      id: 'actions',
      header: t('column.action'),
      cell: ({ row }) => (
        <RowActionButton
          onView={() => navigate(MY_ROUTE.PRODUCT.DETAIL(row.original.id))}
          onEdit={() => navigate(MY_ROUTE.PRODUCT.EDIT(row.original.id))}
          onDelete={() => setDeleteProductId(row.original.id)}>
          {can('register') && (
            <DropdownMenuItem onClick={() => setCopyProductId(row.original.id)} className='cursor-pointer'>
              <Copy /> {tCommon('button.copy')}
            </DropdownMenuItem>
          )}
        </RowActionButton>
      ),
      meta: { align: 'center', width: '80px' },
    },
  ];

  return (
    <>
      <DataTable
        data={data}
        isLoading={isLoading}
        columns={columns}
        totalRows={totalRows}
        pagination={pagination}
        onPaginationChange={onPaginationChange}
        pageSizeOptions={[10, 20, 50]}
        enableRowSelection
        rowSelection={activeRowSelection}
        onRowSelectionChange={activeOnRowSelectionChange}
        getRowId={(row) => row.id.toString()}
        emptyMessage={t('empty')}
      />
      <ProductCopyModal
        open={copyProductId !== undefined}
        setOpen={(o) => !o && setCopyProductId(undefined)}
        productId={copyProductId}
      />
      <ConfirmDialog
        open={deleteProductId !== undefined}
        onOpenChange={(o) => !o && setDeleteProductId(undefined)}
        title={t('confirm_delete_title')}
        description={t('confirm_delete_description')}
        onConfirm={() => deleteProductId && mutateDelete(deleteProductId)}
        isLoading={isDeleting}
        variant='destructive'
      />
    </>
  );
};

export default ProductTable;
