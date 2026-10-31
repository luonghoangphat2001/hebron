import { DataTable } from '@/components/table/DataTable';
import { appToast } from '@/components/toast/AppToast';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useProductUpdateMesSettingsMutation, useProductListQuery } from '@/data/product/product.query';
import type { ProductListREQ } from '@/data/product/product.request';
import type { Product } from '@/data/product/product.response';
import { getProductListInitFilter } from '@/data/product/product.service';
import { useFilterPaging } from '@/hooks/useFilterPaging';
import { useCan } from '@/hooks/useMenuAccess';
import { getErrorMessage } from '@/utils/helper/noti-error.helper';
import { getFileUrl } from '@/utils/helper/common.helper';
import type { ColumnDef } from '@tanstack/react-table';
import { ImageOff } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import ProductFilter from '@/pages/product/components/management/ProductFilter';

const MesConnectionSettings = () => {
  const { t: tMes } = useTranslation('mes');
  const { t: tProduct } = useTranslation('product');
  const { t: tCommon } = useTranslation('common');
  const can = useCan();

  const { filter, pagination, handleFilterChange, onPaginationChange } = useFilterPaging<ProductListREQ>({
    getInitialFilter: getProductListInitFilter,
    prefix: 'product',
  });
  const { data, isLoading } = useProductListQuery(filter);

  const { mutate: mutateMesSettings } = useProductUpdateMesSettingsMutation({
    onError: (error) => appToast.error(getErrorMessage(error, tCommon('notify.fail_update'))),
  });

  const columns: ColumnDef<Product>[] = [
    {
      id: 'image',
      header: tProduct('column.image'),
      cell: ({ row }) => {
        const image = row.original.first_image || row.original.images?.[0];

        return (
          <div className='bg-muted/30 flex size-12 items-center justify-center overflow-hidden rounded-md border'>
            {image ? (
              <img src={getFileUrl(image)} alt={row.original.name?.ko} className='size-full object-cover' loading='lazy' />
            ) : (
              <ImageOff className='text-muted-foreground size-4' />
            )}
          </div>
        );
      },
      meta: { align: 'center', width: '80px' },
    },
    {
      header: tMes('connection_settings.column.product_name'),
      cell: ({ row }) => <span className='line-clamp-2'>{row.original.name?.ko || row.original.name?.en}</span>,
      meta: { width: '260px' },
    },
    {
      header: tProduct('column.sku'),
      cell: ({ row }) => <span className='font-mono text-xs'>{row.original.sku || '-'}</span>,
      meta: { width: '140px' },
    },
    {
      header: tMes('connection_settings.column.category'),
      cell: ({ row }) => {
        const categories = row.original.categories || [];
        if (!categories.length) return <span className='text-muted-foreground'>-</span>;

        return (
          <div className='flex flex-wrap items-center gap-1'>
            {categories.map((category) => (
              <Badge key={category.id} variant='outline' className='rounded-sm'>
                {category.name?.ko || category.name?.en}
              </Badge>
            ))}
          </div>
        );
      },
      meta: { width: '220px' },
    },
    {
      id: 'status',
      header: tProduct('column.status'),
      cell: ({ row }) => (
        <Badge variant={row.original.is_public ? 'default' : 'secondary'} className='rounded-sm'>
          {row.original.is_public ? tProduct('status.sold') : tProduct('status.hidden')}
        </Badge>
      ),
      meta: { align: 'center', width: '110px' },
    },
    {
      header: tMes('connection_settings.column.mes_enabled'),
      cell: ({ row }) => (
        <Switch
          checked={row.original.mes_inventory_enabled}
          onCheckedChange={(v) => mutateMesSettings({ id: row.original.id, mes_inventory_enabled: v })}
          disabled={!can('edit')}
          className='cursor-pointer'
        />
      ),
      meta: { align: 'center', width: '180px' },
    },
  ];

  return (
    <div className='space-y-4'>
      <ProductFilter filter={filter} handleFilterChange={handleFilterChange} />

      {/* Product table */}
      <DataTable
        data={data?.list || []}
        isLoading={isLoading}
        columns={columns}
        totalRows={data?.pagination?.total_item || 0}
        pagination={pagination}
        onPaginationChange={onPaginationChange}
        pageSizeOptions={[10, 20, 50]}
        getRowId={(row) => row.id.toString()}
        emptyMessage={tMes('connection_settings.empty')}
      />
    </div>
  );
};

export default MesConnectionSettings;
