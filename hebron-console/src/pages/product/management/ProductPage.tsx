import Can from '@/components/Can';
import PageTitle from '@/components/PageTitle';
import ExportExcelButton from '@/components/export/ExportExcelButton';
import { appToast } from '@/components/toast/AppToast';
import { Button } from '@/components/ui/button';
import { exportProductExcelAPI, getProductExportProgressAPI } from '@/data/product/product.api';
import { PRODUCT_QUERY_KEYS, useProductBulkDeleteMutation, useProductListQuery } from '@/data/product/product.query';
import type { ProductExportExcelREQ, ProductListREQ } from '@/data/product/product.request';
import { getProductListInitFilter, transformProductFilterToExportREQ } from '@/data/product/product.service';
import { useExportExcel } from '@/hooks/useExportExcel';
import { useFilterPaging } from '@/hooks/useFilterPaging';
import { toApiLocale } from '@/i18n';
import { ExportFileName, ExportType } from '@/utils/enums/common.enum';
import { getErrorMessage } from '@/utils/helper/noti-error.helper';
import { MY_ROUTE } from '@/utils/constants/route.constant';
import type { RowSelectionState } from '@tanstack/react-table';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import ProductBulkActionsBar from '../components/management/ProductBulkActionsBar';
import ProductFilter from '../components/management/ProductFilter';
import ProductTable from '../components/management/ProductTable';

const ProductPage = () => {
  const { t: tSidebar } = useTranslation('sidebar');
  const { t, i18n } = useTranslation('product');
  const { t: tCommon } = useTranslation('common');
  const navigate = useNavigate();

  const { filter, pagination, handleFilterChange, onPaginationChange } = useFilterPaging<ProductListREQ>({
    getInitialFilter: getProductListInitFilter,
  });

  const { data, isLoading } = useProductListQuery(filter);

  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const selectedIds = Object.keys(rowSelection).map(Number);
  const selectedProducts = (data?.list ?? []).filter((product) => selectedIds.includes(product.id));

  const { handleExport: triggerExport, isExporting } = useExportExcel<ProductExportExcelREQ>({
    queryKey: PRODUCT_QUERY_KEYS.EXPORT_PROGRESS,
    exportFn: exportProductExcelAPI,
    progressFn: getProductExportProgressAPI,
    exportFileName: ExportFileName.PRODUCT,
    onProcessing: () => appToast.success(tCommon('notify.export_processing')),
    onSuccess: () => {
      appToast.success(tCommon('notify.export_success'));
      setRowSelection({});
    },
    onError: () => appToast.error(tCommon('notify.export_fail')),
  });

  const handleExport = (exportType: ExportType) => {
    triggerExport(
      transformProductFilterToExportREQ(filter, exportType, selectedIds, pagination.pageIndex + 1, toApiLocale(i18n.language)),
    );
  };

  const { mutate: mutateBulkDelete, isPending: isBulkDeleting } = useProductBulkDeleteMutation({
    onSuccess: (resp) => {
      appToast.success(t('bulk.success_delete', { count: resp.data.deleted_count }));
      setRowSelection({});
    },
    onError: (error) => appToast.error(getErrorMessage(error, tCommon('notify.fail_delete'))),
  });

  return (
    <main className='space-y-6'>
      <PageTitle
        title={tSidebar('product_list')}
        extra={
          <div className='flex items-center gap-2'>
            <ExportExcelButton isExporting={isExporting} onExport={handleExport} />
            <Can action='register'>
              <Button onClick={() => navigate(MY_ROUTE.PRODUCT.CREATE)}>
                <Plus /> {t('button_add')}
              </Button>
            </Can>
          </div>
        }
      />
      <ProductFilter filter={filter} handleFilterChange={handleFilterChange} />
      <ProductBulkActionsBar
        count={selectedIds.length}
        selectedProducts={selectedProducts}
        isExporting={isExporting}
        onExport={() => handleExport(ExportType.SELECTED)}
        isDeleting={isBulkDeleting}
        onDelete={() => mutateBulkDelete({ product_ids: selectedIds })}
        onStatusChanged={() => setRowSelection({})}
        onUpdated={() => setRowSelection({})}
      />
      <ProductTable
        data={data?.list || []}
        isLoading={isLoading}
        totalRows={data?.pagination?.total_item || 0}
        pagination={pagination}
        onPaginationChange={onPaginationChange}
        sortBy={filter.order_by}
        sortOrder={filter.sort_order}
        onSortChange={(order_by, sort_order) => handleFilterChange({ order_by, sort_order })}
        rowSelection={rowSelection}
        onRowSelectionChange={setRowSelection}
      />
    </main>
  );
};

export default ProductPage;
