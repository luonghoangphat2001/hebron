import ExportExcelButton from '@/components/export/ExportExcelButton';
import PageTitle from '@/components/PageTitle';
import { appToast } from '@/components/toast/AppToast';
import { exportTaskLogExcelAPI, getTaskLogExportProgressAPI } from '@/data/system/system.api';
import { SYSTEM_QUERY_KEYS, useTaskLogListQuery } from '@/data/system/system.query';
import type { TaskLogExportExcelREQ } from '@/data/system/system.request';
import {
  getTaskLogListInitFilter,
  transformTaskLogFilterToExportREQ,
  transformTaskLogFilterToREQ,
  type TaskLogFilterValues,
} from '@/data/system/system.service';
import { useExportExcel } from '@/hooks/useExportExcel';
import { useFilterPaging } from '@/hooks/useFilterPaging';
import { toApiLocale } from '@/i18n';
import { ExportFileName, ExportType } from '@/utils/enums/common.enum';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import OperationLogFilter from './components/OperationLogFilter';
import OperationLogTable from './components/OperationLogTable';

const OperationLogPage = () => {
  const { t: tSidebar } = useTranslation('sidebar');
  const { t: tCommon, i18n } = useTranslation('common');

  const { filter, pagination, handleFilterChange, onPaginationChange } = useFilterPaging<TaskLogFilterValues>({
    getInitialFilter: getTaskLogListInitFilter,
  });

  const queryParams = useMemo(() => transformTaskLogFilterToREQ(filter), [filter]);
  const { data, isLoading } = useTaskLogListQuery(queryParams);

  const { handleExport: triggerExport, isExporting } = useExportExcel<TaskLogExportExcelREQ>({
    queryKey: SYSTEM_QUERY_KEYS.EXPORT_PROGRESS,
    exportFn: exportTaskLogExcelAPI,
    progressFn: getTaskLogExportProgressAPI,
    exportFileName: ExportFileName.OPERATION_LOG,
    onProcessing: () => appToast.success(tCommon('notify.export_processing')),
    onSuccess: () => {
      appToast.success(tCommon('notify.export_success'));
    },
    onError: () => appToast.error(tCommon('notify.export_fail')),
  });

  const handleExport = (exportType: ExportType) => {
    triggerExport(transformTaskLogFilterToExportREQ(filter, exportType, pagination.pageIndex + 1, toApiLocale(i18n.language)));
  };

  return (
    <main className='space-y-6'>
      <PageTitle
        title={tSidebar('operation_logs')}
        extra={<ExportExcelButton isExporting={isExporting} onExport={handleExport} />}
      />
      <OperationLogFilter filter={filter} onFilterChange={handleFilterChange} />
      <OperationLogTable
        data={data?.data?.task_logs || []}
        totalRows={data?.pagination?.total_item || 0}
        isLoading={isLoading}
        pagination={pagination}
        onPaginationChange={onPaginationChange}
        sortBy={filter.sort_by}
        sortOrder={filter.sort_order}
        onSortChange={(sortBy, sortOrder) => handleFilterChange({ sort_by: sortBy, sort_order: sortOrder })}
      />
    </main>
  );
};

export default OperationLogPage;
