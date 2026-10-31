import Can from '@/components/Can';
import PageTitle from '@/components/PageTitle';
import ExportExcelButton from '@/components/export/ExportExcelButton';
import SelectedRowsExportBar from '@/components/export/SelectedRowsExportBar';
import { appToast } from '@/components/toast/AppToast';
import { Button } from '@/components/ui/button';
import { exportOptionGroupExcelAPI, getOptionGroupExportProgressAPI } from '@/data/option-group/option-group.api';
import { OPTION_GROUP_QUERY_KEYS, useOptionGroupListQuery } from '@/data/option-group/option-group.query';
import type { OptionGroupExportExcelREQ, OptionGroupListREQ } from '@/data/option-group/option-group.request';
import { getOptionGroupListInitFilter, transformOptionGroupFilterToExportREQ } from '@/data/option-group/option-group.service';
import { useExportExcel } from '@/hooks/useExportExcel';
import { useFilterPaging } from '@/hooks/useFilterPaging';
import { toApiLocale } from '@/i18n';
import { ExportFileName, ExportType } from '@/utils/enums/common.enum';
import type { RowSelectionState } from '@tanstack/react-table';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import OptionGroupFilter from '../components/options/OptionGroupFilter';
import OptionGroupTable from '../components/options/OptionGroupTable';
import OptionGroupUpsertModal from '../components/options/OptionGroupUpsertModal';

const OptionPage = () => {
  const { t: tSidebar } = useTranslation('sidebar');
  const { t, i18n } = useTranslation('option');
  const { t: tCommon } = useTranslation('common');
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const { filter, pagination, handleFilterChange, onPaginationChange } = useFilterPaging<OptionGroupListREQ>({
    getInitialFilter: getOptionGroupListInitFilter,
  });

  const { data, isLoading } = useOptionGroupListQuery(filter);

  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const selectedIds = Object.keys(rowSelection).map(Number);

  const { handleExport: triggerExport, isExporting } = useExportExcel<OptionGroupExportExcelREQ>({
    queryKey: OPTION_GROUP_QUERY_KEYS.EXPORT_PROGRESS,
    exportFn: exportOptionGroupExcelAPI,
    progressFn: getOptionGroupExportProgressAPI,
    exportFileName: ExportFileName.OPTION_GROUP,
    onProcessing: () => appToast.success(tCommon('notify.export_processing')),
    onSuccess: () => {
      appToast.success(tCommon('notify.export_success'));
      setRowSelection({});
    },
    onError: () => appToast.error(tCommon('notify.export_fail')),
  });

  const handleExport = (exportType: ExportType) => {
    triggerExport(
      transformOptionGroupFilterToExportREQ(
        filter,
        exportType,
        selectedIds,
        pagination.pageIndex + 1,
        toApiLocale(i18n.language),
      ),
    );
  };

  return (
    <main className='space-y-6'>
      <PageTitle
        title={tSidebar('option_list')}
        extra={
          <div className='flex items-center gap-2'>
            <ExportExcelButton isExporting={isExporting} onExport={handleExport} />
            <Can action='register'>
              <Button onClick={() => setIsCreateOpen(true)}>
                <Plus /> {t('group.button_add')}
              </Button>
            </Can>
          </div>
        }
      />
      <OptionGroupFilter filter={filter} handleFilterChange={handleFilterChange} />
      <SelectedRowsExportBar
        count={selectedIds.length}
        isExporting={isExporting}
        onExport={() => handleExport(ExportType.SELECTED)}
      />
      <OptionGroupTable
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
      <OptionGroupUpsertModal open={isCreateOpen} setOpen={setIsCreateOpen} />
    </main>
  );
};

export default OptionPage;
