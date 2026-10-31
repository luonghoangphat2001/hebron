import { appToast } from '@/components/toast/AppToast';
import ExportExcelButton from '@/components/export/ExportExcelButton';
import SelectedRowsExportBar from '@/components/export/SelectedRowsExportBar';
import PageTitle from '@/components/PageTitle';
import { exportShipmentExcelAPI, getShipmentExportProgressAPI } from '@/data/delivery/delivery.api';
import { DELIVERY_QUERY_KEYS, useShipmentListQuery } from '@/data/delivery/delivery.query';
import type { ShipmentExportExcelREQ, ShipmentListREQ } from '@/data/delivery/delivery.request';
import { getShipmentListInitFilter } from '@/data/delivery/delivery.service';
import { useExportExcel } from '@/hooks/useExportExcel';
import { useFilterPaging } from '@/hooks/useFilterPaging';
import { toApiLocale } from '@/i18n';
import { ExportFileName, ExportType } from '@/utils/enums/common.enum';
import type { RowSelectionState } from '@tanstack/react-table';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import ShipmentFilter from './components/ShipmentFilter';
import ShipmentTable from './components/ShipmentTable';

const ShipmentPage = () => {
  const { t: tSidebar } = useTranslation('sidebar');
  const { t: tDelivery, i18n } = useTranslation('delivery');
  const { t: tCommon } = useTranslation('common');

  const { filter, pagination, handleFilterChange, onPaginationChange } = useFilterPaging<ShipmentListREQ>({
    getInitialFilter: getShipmentListInitFilter,
  });

  const { data, isLoading } = useShipmentListQuery(filter);

  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const selectedIds = Object.keys(rowSelection).map(Number);

  const { handleExport: triggerExport, isExporting } = useExportExcel<ShipmentExportExcelREQ>({
    queryKey: DELIVERY_QUERY_KEYS.SHIPMENT_EXPORT_PROGRESS,
    exportFn: exportShipmentExcelAPI,
    progressFn: getShipmentExportProgressAPI,
    exportFileName: ExportFileName.SHIPMENT,
    onProcessing: () => appToast.success(tCommon('notify.export_processing')),
    onSuccess: () => {
      appToast.success(tCommon('notify.export_success'));
      setRowSelection({});
    },
    onError: () => appToast.error(tCommon('notify.export_fail')),
  });

  const handleExport = (exportType: ExportType) => {
    triggerExport({
      export_type: exportType,
      selected_ids: exportType === ExportType.SELECTED ? selectedIds : undefined,
      current_page: exportType === ExportType.CURRENT_PAGE ? pagination.pageIndex + 1 : undefined,
      per_page: filter.per_page,
      search_term: filter.search_term,
      order_number: filter.order_number,
      customer_name: filter.customer_name,
      product_name: filter.product_name,
      shipping_manager_id: filter.shipping_manager_id,
      tracking_number: filter.tracking_number,
      invoice_number: filter.invoice_number,
      status: filter.status,
      shipment_date_from: filter.shipment_date_from,
      shipment_date_to: filter.shipment_date_to,
      sort_by: filter.sort_by,
      sort_order: filter.sort_order,
      locale: toApiLocale(i18n.language),
    });
  };

  return (
    <main className='space-y-6'>
      <PageTitle
        title={tSidebar('delivery_management')}
        extra={<ExportExcelButton isExporting={isExporting} onExport={handleExport} />}
      />
      <div className='text-muted-foreground -mt-4 text-sm'>{tDelivery('shipment.description')}</div>
      <ShipmentFilter filter={filter} handleFilterChange={handleFilterChange} />
      <SelectedRowsExportBar
        count={selectedIds.length}
        isExporting={isExporting}
        onExport={() => handleExport(ExportType.SELECTED)}
      />
      <ShipmentTable
        data={data?.list || []}
        isLoading={isLoading}
        totalRecord={data?.pagination?.total_item || 0}
        pagination={pagination}
        onPaginationChange={onPaginationChange}
        rowSelection={rowSelection}
        onRowSelectionChange={setRowSelection}
      />
    </main>
  );
};

export default ShipmentPage;
