import ExportExcelButton from '@/components/export/ExportExcelButton';
import SelectedRowsExportBar from '@/components/export/SelectedRowsExportBar';
import PageTitle from '@/components/PageTitle';
import { appToast } from '@/components/toast/AppToast';
import { exportSettlementExcelAPI, getSettlementExportProgressAPI } from '@/data/payment/payment.api';
import { PAYMENT_QUERY_KEYS, useSettlementReportListQuery } from '@/data/payment/payment.query';
import type { SettlementExportExcelREQ } from '@/data/payment/payment.request';
import { transformSettlementFilterToExportREQ, transformSettlementFilterToREQ } from '@/data/payment/payment.service';
import { useExportExcel } from '@/hooks/useExportExcel';
import { toApiLocale } from '@/i18n';
import { ExportFileName, ExportType } from '@/utils/enums/common.enum';
import type { PaginationState, RowSelectionState } from '@tanstack/react-table';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import SettlementFilter, { DEFAULT_SETTLEMENT_FILTER, type SettlementFilterValues } from './components/SettlementFilter';
import SettlementTable from './components/SettlementTable';

const SettlementReportPage = () => {
  const { t: tSidebar } = useTranslation('sidebar');
  const { t: tPayment } = useTranslation('payment');
  const { t: tCommon, i18n } = useTranslation('common');

  const [activeFilter, setActiveFilter] = useState<SettlementFilterValues>(DEFAULT_SETTLEMENT_FILTER);
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 });
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const handleFilterChange = useCallback((filter: SettlementFilterValues) => {
    setActiveFilter(filter);
    setPagination((prev) => (prev.pageIndex === 0 ? prev : { ...prev, pageIndex: 0 }));
  }, []);

  const queryParams = useMemo(
    () => transformSettlementFilterToREQ(activeFilter, pagination.pageIndex + 1, pagination.pageSize),
    [activeFilter, pagination],
  );
  const { data, isLoading } = useSettlementReportListQuery(queryParams);

  const selectedIds = Object.keys(rowSelection).filter((key) => rowSelection[key]);

  const { handleExport: triggerExport, isExporting } = useExportExcel<SettlementExportExcelREQ>({
    queryKey: PAYMENT_QUERY_KEYS.SETTLEMENT_EXPORT_PROGRESS,
    exportFn: exportSettlementExcelAPI,
    progressFn: getSettlementExportProgressAPI,
    exportFileName: ExportFileName.SETTLEMENT,
    onProcessing: () => appToast.success(tCommon('notify.export_processing')),
    onSuccess: () => {
      appToast.success(tCommon('notify.export_success'));
      setRowSelection({});
    },
    onError: () => appToast.error(tCommon('notify.export_fail')),
  });

  const handleExport = (exportType: ExportType) =>
    triggerExport(
      transformSettlementFilterToExportREQ(
        activeFilter,
        exportType,
        selectedIds,
        pagination.pageIndex + 1,
        pagination.pageSize,
        toApiLocale(i18n.language),
      ),
    );

  return (
    <main className='space-y-6'>
      <PageTitle
        title={tSidebar('settlement_report')}
        extra={<ExportExcelButton isExporting={isExporting} onExport={handleExport} />}
      />
      <div className='text-muted-foreground -mt-4 text-sm'>{tPayment('settlement.description')}</div>
      <SettlementFilter onChange={handleFilterChange} />
      <SelectedRowsExportBar
        count={selectedIds.length}
        isExporting={isExporting}
        onExport={() => handleExport(ExportType.SELECTED)}
      />
      <SettlementTable
        data={data?.data.reports || []}
        isLoading={isLoading}
        totalRows={data?.data.pagination?.total_item ?? data?.pagination?.total_item ?? 0}
        pagination={pagination}
        onPaginationChange={setPagination}
        rowSelection={rowSelection}
        onRowSelectionChange={setRowSelection}
      />
    </main>
  );
};

export default SettlementReportPage;
