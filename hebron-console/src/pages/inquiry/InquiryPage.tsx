import ConfirmDialog from '@/components/dialog/ConfirmDialog';
import { appToast } from '@/components/toast/AppToast';
import ExportExcelButton from '@/components/export/ExportExcelButton';
import SelectedRowsExportBar from '@/components/export/SelectedRowsExportBar';
import PageTitle from '@/components/PageTitle';
import { exportInquiryExcelAPI, getInquiryExportProgressAPI } from '@/data/inquiry/inquiry.api';
import { INQUIRY_QUERY_KEYS, useInquiryDeleteMutation, useInquiryListQuery } from '@/data/inquiry/inquiry.query';
import type { InquiryExportExcelREQ } from '@/data/inquiry/inquiry.request';
import {
  getInquiryListInitFilter,
  transformInquiryFilterToExportREQ,
  transformInquiryFilterToREQ,
} from '@/data/inquiry/inquiry.service';
import { useExportExcel } from '@/hooks/useExportExcel';
import { useFilterPaging } from '@/hooks/useFilterPaging';
import { toApiLocale } from '@/i18n';
import { ExportFileName, ExportType } from '@/utils/enums/common.enum';
import type { RowSelectionState } from '@tanstack/react-table';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import InquiryFilter, { type InquiryFilterValues } from './components/InquiryFilter';
import InquiryTable from './components/InquiryTable';

const InquiryPage = () => {
  const { t: tSidebar } = useTranslation('sidebar');
  const { t: tInquiry, i18n } = useTranslation('inquiry');
  const { t: tCommon } = useTranslation('common');

  const { filter, pagination, handleFilterChange, onPaginationChange } = useFilterPaging<InquiryFilterValues>({
    getInitialFilter: getInquiryListInitFilter,
  });

  const queryParams = useMemo(() => transformInquiryFilterToREQ(filter), [filter]);
  const { data, isLoading } = useInquiryListQuery(queryParams);

  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const selectedIds = Object.keys(rowSelection).map(Number);

  const [deleteId, setDeleteId] = useState<number | null>(null);
  const { mutate: mutateDelete, isPending: isDeleting } = useInquiryDeleteMutation({
    onSuccess: () => {
      setDeleteId(null);
      appToast.success(tCommon('notify.success_delete'));
    },
    onError: (error) => {
      appToast.error(error.response?.data.message || tCommon('notify.fail_delete'));
    },
  });

  const { handleExport: triggerExport, isExporting } = useExportExcel<InquiryExportExcelREQ>({
    queryKey: INQUIRY_QUERY_KEYS.EXPORT_PROGRESS,
    exportFn: exportInquiryExcelAPI,
    progressFn: getInquiryExportProgressAPI,
    exportFileName: ExportFileName.INQUIRY,
    onProcessing: () => appToast.success(tCommon('notify.export_processing')),
    onSuccess: () => {
      appToast.success(tCommon('notify.export_success'));
      setRowSelection({});
    },
    onError: () => appToast.error(tCommon('notify.export_fail')),
  });

  const handleExport = (exportType: ExportType) => {
    triggerExport(
      transformInquiryFilterToExportREQ(filter, exportType, selectedIds, pagination.pageIndex + 1, toApiLocale(i18n.language)),
    );
  };

  return (
    <main className='space-y-6'>
      <PageTitle
        title={tSidebar('inquiry_management')}
        extra={<ExportExcelButton isExporting={isExporting} onExport={handleExport} />}
      />
      <div className='text-muted-foreground -mt-4 text-sm'>{tInquiry('page.description')}</div>
      <InquiryFilter onFilterChange={handleFilterChange} />
      <SelectedRowsExportBar
        count={selectedIds.length}
        isExporting={isExporting}
        onExport={() => handleExport(ExportType.SELECTED)}
      />
      <InquiryTable
        data={data?.data?.inquiries || []}
        isLoading={isLoading}
        totalRows={data?.pagination?.total_item || 0}
        pagination={pagination}
        onPaginationChange={onPaginationChange}
        rowSelection={rowSelection}
        onRowSelectionChange={setRowSelection}
        sortBy={filter.sort_by}
        sortOrder={filter.sort_order}
        onSortChange={(sortBy, sortOrder) => handleFilterChange({ sort_by: sortBy, sort_order: sortOrder })}
        onDelete={setDeleteId}
      />
      <ConfirmDialog
        open={deleteId !== null}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title={tInquiry('confirm.delete_title')}
        description={tInquiry('confirm.delete_desc')}
        onConfirm={() => deleteId !== null && !isDeleting && mutateDelete(deleteId)}
        isLoading={isDeleting}
        variant='destructive'
      />
    </main>
  );
};

export default InquiryPage;
