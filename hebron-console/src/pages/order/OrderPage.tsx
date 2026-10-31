import ExportExcelButton from '@/components/export/ExportExcelButton';
import SelectedRowsExportBar from '@/components/export/SelectedRowsExportBar';
import SelectedRowsPrintBar from '@/components/print/SelectedRowsPrintBar';
import PageTitle from '@/components/PageTitle';
import { appToast } from '@/components/toast/AppToast';
import { exportOrderExcelAPI, getOrderExportProgressAPI } from '@/data/order/order.api';
import { ORDER_QUERY_KEYS, useBatchWorkOrderPdfMutation, useOrderListQuery } from '@/data/order/order.query';
import type { OrderExportExcelREQ, OrderListREQ } from '@/data/order/order.request';
import {
  getOrderListInitFilter,
  transformOrderFilterToExportREQ,
  transformOrderFilterToREQ,
  type OrderFilterValues,
} from '@/data/order/order.service';
import { useExportExcel } from '@/hooks/useExportExcel';
import { useFilterPaging } from '@/hooks/useFilterPaging';
import { toApiLocale } from '@/i18n';
import { ExportFileName, ExportType } from '@/utils/enums/common.enum';
import type { RowSelectionState } from '@tanstack/react-table';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import OrderFilter from './components/OrderFilter';
import OrderTable from './components/OrderTable';

const OrderPage = () => {
  const { t: tSidebar } = useTranslation('sidebar');
  const { t: tOrder } = useTranslation('order');
  const { t: tCommon, i18n } = useTranslation('common');

  const { filter, pagination, handleFilterChange, onPaginationChange } = useFilterPaging<OrderFilterValues>({
    getInitialFilter: getOrderListInitFilter,
  });

  const queryParams: OrderListREQ = useMemo(() => transformOrderFilterToREQ(filter), [filter]);
  const { data, isLoading } = useOrderListQuery(queryParams);

  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const selectedIds = Object.keys(rowSelection).map(Number);

  const { mutate: batchWorkOrderPdf, isPending: isBatchWorkOrderPdfPending } = useBatchWorkOrderPdfMutation();

  const { handleExport: triggerExport, isExporting } = useExportExcel<OrderExportExcelREQ>({
    queryKey: ORDER_QUERY_KEYS.EXPORT_PROGRESS,
    exportFn: exportOrderExcelAPI,
    progressFn: getOrderExportProgressAPI,
    exportFileName: ExportFileName.ORDER,
    onProcessing: () => appToast.success(tCommon('notify.export_processing')),
    onSuccess: () => {
      appToast.success(tCommon('notify.export_success'));
      setRowSelection({});
    },
    onError: () => appToast.error(tCommon('notify.export_fail')),
  });

  const handleExport = (exportType: ExportType) => {
    triggerExport(
      transformOrderFilterToExportREQ(filter, exportType, selectedIds, pagination.pageIndex + 1, toApiLocale(i18n.language)),
    );
  };

  const handleBatchPrint = () => {
    if (selectedIds.length === 0) return;
    batchWorkOrderPdf(
      { order_ids: selectedIds },
      {
        onSuccess: (resp) => {
          if (resp.data?.pdf_url) {
            window.open(resp.data.pdf_url, '_blank');
          }
          setRowSelection({});
        },
        onError: () => appToast.error(tCommon('notify.something_went_wrong')),
      },
    );
  };

  const handleSortChange = (sortBy?: string, sortOrder?: any) => {
    handleFilterChange({
      sort_by: sortBy,
      sort_order: sortOrder,
    });
  };

  return (
    <main className='space-y-6'>
      <PageTitle
        title={tSidebar('order_management')}
        extra={
          <div className='flex items-center gap-2'>
            <ExportExcelButton isExporting={isExporting} onExport={handleExport} />
          </div>
        }
      />
      <div className='text-muted-foreground -mt-4 text-sm'>{tOrder('page.description')}</div>
      <OrderFilter filter={filter} onFilterChange={handleFilterChange} />
      <SelectedRowsExportBar
        count={selectedIds.length}
        isExporting={isExporting}
        onExport={() => handleExport(ExportType.SELECTED)}>
        <SelectedRowsPrintBar isPrinting={isBatchWorkOrderPdfPending} onPrint={handleBatchPrint} />
      </SelectedRowsExportBar>

      <OrderTable
        data={data?.data.orders || []}
        totalRows={data?.pagination?.total_item || 0}
        isLoading={isLoading}
        pagination={pagination}
        onPaginationChange={onPaginationChange}
        sortBy={filter.sort_by}
        sortOrder={filter.sort_order}
        onSortChange={handleSortChange}
        rowSelection={rowSelection}
        onRowSelectionChange={setRowSelection}
      />
    </main>
  );
};

export default OrderPage;
