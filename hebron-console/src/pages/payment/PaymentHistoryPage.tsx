import ExportExcelButton from '@/components/export/ExportExcelButton';
import SelectedRowsExportBar from '@/components/export/SelectedRowsExportBar';
import PageTitle from '@/components/PageTitle';
import { appToast } from '@/components/toast/AppToast';
import { exportPaymentExcelAPI, getPaymentExportProgressAPI } from '@/data/payment/payment.api';
import { PAYMENT_QUERY_KEYS, usePaymentListQuery } from '@/data/payment/payment.query';
import type { PaymentExportExcelREQ } from '@/data/payment/payment.request';
import { transformPaymentFilterToExportREQ, transformPaymentFilterToREQ } from '@/data/payment/payment.service';
import { useExportExcel } from '@/hooks/useExportExcel';
import { toApiLocale } from '@/i18n';
import { ExportFileName, ExportType } from '@/utils/enums/common.enum';
import type { PaginationState, RowSelectionState } from '@tanstack/react-table';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import PaymentFilter, { DEFAULT_PAYMENT_FILTER, type PaymentFilterValues } from './components/PaymentFilter';
import PaymentTable from './components/PaymentTable';

const PaymentHistoryPage = () => {
  const { t: tSidebar } = useTranslation('sidebar');
  const { t: tPayment } = useTranslation('payment');
  const { t: tCommon, i18n } = useTranslation('common');

  const [activeFilter, setActiveFilter] = useState<PaymentFilterValues>(DEFAULT_PAYMENT_FILTER);
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 });
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const handleFilterChange = useCallback((filter: PaymentFilterValues) => {
    setActiveFilter(filter);
    setPagination((prev) => (prev.pageIndex === 0 ? prev : { ...prev, pageIndex: 0 }));
  }, []);

  const queryParams = useMemo(
    () => transformPaymentFilterToREQ(activeFilter, pagination.pageIndex + 1, pagination.pageSize),
    [activeFilter, pagination],
  );
  const { data, isLoading } = usePaymentListQuery(queryParams);
  const payments = data?.data.payments || [];

  const selectedIds = Object.keys(rowSelection).filter((key) => rowSelection[key]);

  const { handleExport: triggerExport, isExporting } = useExportExcel<PaymentExportExcelREQ>({
    queryKey: PAYMENT_QUERY_KEYS.EXPORT_PROGRESS,
    exportFn: exportPaymentExcelAPI,
    progressFn: getPaymentExportProgressAPI,
    exportFileName: ExportFileName.PAYMENT,
    onProcessing: () => appToast.success(tCommon('notify.export_processing')),
    onSuccess: () => {
      appToast.success(tCommon('notify.export_success'));
      setRowSelection({});
    },
    onError: () => appToast.error(tCommon('notify.export_fail')),
  });

  const handleExport = (exportType: ExportType) =>
    triggerExport(
      transformPaymentFilterToExportREQ(
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
      <PageTitle title={tSidebar('payment')} extra={<ExportExcelButton isExporting={isExporting} onExport={handleExport} />} />
      <div className='text-muted-foreground -mt-4 text-sm'>{tPayment('history.description')}</div>
      <PaymentFilter onChange={handleFilterChange} />
      <SelectedRowsExportBar
        count={selectedIds.length}
        isExporting={isExporting}
        onExport={() => handleExport(ExportType.SELECTED)}
      />
      <PaymentTable
        data={payments}
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

export default PaymentHistoryPage;
