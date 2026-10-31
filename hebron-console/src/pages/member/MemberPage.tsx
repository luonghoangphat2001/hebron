import Can from '@/components/Can';
import ExportExcelButton from '@/components/export/ExportExcelButton';
import SelectedRowsExportBar from '@/components/export/SelectedRowsExportBar';
import PageTitle from '@/components/PageTitle';
import { appToast } from '@/components/toast/AppToast';
import { Button } from '@/components/ui/button';
import { exportMemberExcelAPI, getMemberExportProgressAPI } from '@/data/member/member.api';
import { MEMBER_QUERY_KEYS, useMemberListQuery } from '@/data/member/member.query';
import type { MemberExportExcelREQ } from '@/data/member/member.request';
import {
  getMemberListInitFilter,
  transformMemberFilterToExportREQ,
  transformMemberFilterToREQ,
  type MemberFilterValues,
} from '@/data/member/member.service';
import { useExportExcel } from '@/hooks/useExportExcel';
import { useFilterPaging } from '@/hooks/useFilterPaging';
import { toApiLocale } from '@/i18n';
import { ExportFileName, ExportType } from '@/utils/enums/common.enum';
import type { RowSelectionState } from '@tanstack/react-table';
import { Plus } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import MemberFilter from './components/MemberFilter';
import MemberRegistrationModal from './components/MemberRegistrationModal';
import MemberTable from './components/MemberTable';

const MemberPage = () => {
  const { t: tSidebar } = useTranslation('sidebar');
  const { t: tMember } = useTranslation('member');
  const { t: tCommon, i18n } = useTranslation('common');
  const [isCreate, setIsCreate] = useState(false);

  const { filter, pagination, handleFilterChange, onPaginationChange } = useFilterPaging<MemberFilterValues>({
    getInitialFilter: getMemberListInitFilter,
  });

  const queryParams = useMemo(() => transformMemberFilterToREQ(filter), [filter]);
  const { data, isLoading } = useMemberListQuery(queryParams);

  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const selectedIds = Object.keys(rowSelection).map(Number);

  const { handleExport: triggerExport, isExporting } = useExportExcel<MemberExportExcelREQ>({
    queryKey: MEMBER_QUERY_KEYS.EXPORT_PROGRESS,
    exportFn: exportMemberExcelAPI,
    progressFn: getMemberExportProgressAPI,
    exportFileName: ExportFileName.MEMBER,
    onProcessing: () => appToast.success(tCommon('notify.export_processing')),
    onSuccess: () => {
      appToast.success(tCommon('notify.export_success'));
      setRowSelection({});
    },
    onError: () => appToast.error(tCommon('notify.export_fail')),
  });

  const handleExport = (exportType: ExportType) => {
    triggerExport(
      transformMemberFilterToExportREQ(filter, exportType, selectedIds, pagination.pageIndex + 1, toApiLocale(i18n.language)),
    );
  };

  return (
    <main className='space-y-6'>
      <PageTitle
        title={tSidebar('member_management')}
        extra={
          <div className='flex items-center gap-2'>
            <ExportExcelButton isExporting={isExporting} onExport={handleExport} />
            <Can action='register'>
              <Button onClick={() => setIsCreate(true)}>
                <Plus /> {tMember('button.register')}
              </Button>
            </Can>
          </div>
        }
      />
      <MemberFilter filter={filter} onFilterChange={handleFilterChange} />
      <SelectedRowsExportBar
        count={selectedIds.length}
        isExporting={isExporting}
        onExport={() => handleExport(ExportType.SELECTED)}
      />
      <MemberTable
        data={data?.data.members || []}
        isLoading={isLoading}
        totalRows={data?.pagination?.total_item || 0}
        filter={filter}
        pagination={pagination}
        onPaginationChange={onPaginationChange}
        onSortChange={handleFilterChange}
        rowSelection={rowSelection}
        onRowSelectionChange={setRowSelection}
      />
      <MemberRegistrationModal open={isCreate} setOpen={setIsCreate} />
    </main>
  );
};

export default MemberPage;
