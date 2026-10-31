import Can from '@/components/Can';
import ConfirmDialog from '@/components/dialog/ConfirmDialog';
// import ExportExcelButton from '@/components/export/ExportExcelButton';
// import SelectedRowsExportBar from '@/components/export/SelectedRowsExportBar';
import PageTitle from '@/components/PageTitle';
import { appToast } from '@/components/toast/AppToast';
import { Button } from '@/components/ui/button';
// import { exportPermissionExcelAPI, getPermissionExportProgressAPI } from '@/data/permission/permission.api';
import { usePermissionDeleteMutation, usePermissionListQuery } from '@/data/permission/permission.query';
import type { PermissionListREQ } from '@/data/permission/permission.request';
import type { PermissionListItemRESP } from '@/data/permission/permission.response';
import { getPermissionListInitFilter } from '@/data/permission/permission.service';
// import { useExportExcel } from '@/hooks/useExportExcel';
import { useFilterPaging } from '@/hooks/useFilterPaging';
import type { RowSelectionState } from '@tanstack/react-table';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import PermissionCopyDialog from './components/PermissionCopyDialog';
import PermissionFilter from './components/PermissionFilter';
import PermissionTable from './components/PermissionTable';
import PermissionUpsertModal from './components/PermissionUpsertModal';

const PermissionPage = () => {
  const { t: tSidebar } = useTranslation('sidebar');
  const { t: tPermission } = useTranslation('system');
  const { t: tCommon } = useTranslation('common');

  const [isUpsertOpen, setIsUpsertOpen] = useState(false);
  const [permissionId, setPermissionId] = useState<number | null>(null);
  const [copySource, setCopySource] = useState<PermissionListItemRESP | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);

  const { filter, pagination, handleFilterChange, onPaginationChange } = useFilterPaging<PermissionListREQ>({
    getInitialFilter: getPermissionListInitFilter,
  });

  const { data, isLoading } = usePermissionListQuery(filter);

  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const { mutate: mutateDelete, isPending: isDeleting } = usePermissionDeleteMutation({
    onSuccess: () => {
      setDeleteTarget(null);
      appToast.success(tCommon('notify.success_delete'));
    },
    onError: (error) => appToast.error(error.response?.data.message || tCommon('notify.fail_delete')),
  });

  // const selectedIds = Object.keys(rowSelection).map(Number);
  //
  // const { handleExport: triggerExport, isExporting } = useExportExcel<PermissionExportExcelREQ>({
  //   queryKey: PERMISSION_QUERY_KEYS.EXPORT_PROGRESS,
  //   exportFn: exportPermissionExcelAPI,
  //   progressFn: getPermissionExportProgressAPI,
  //   onProcessing: () => appToast.success(tCommon('notify.export_processing')),
  //   onSuccess: (filePath) => {
  //     window.open(filePath, '_blank');
  //     appToast.success(tCommon('notify.export_success'));
  //     setRowSelection({});
  //   },
  //   onError: () => appToast.error(tCommon('notify.export_fail')),
  // });
  //
  // const handleExport = (exportType: ExportType) => {
  //   triggerExport(
  //     transformPermissionFilterToExportREQ(filter, exportType, selectedIds, pagination.pageIndex + 1, toApiLocale(i18n.language)),
  //   );
  // };

  const openCreate = () => {
    setPermissionId(null);
    setIsUpsertOpen(true);
  };

  const openEdit = (id: number) => {
    setPermissionId(id);
    setIsUpsertOpen(true);
  };

  const openCopy = (permission: PermissionListItemRESP) => setCopySource(permission);

  return (
    <main className='space-y-6'>
      <PageTitle
        title={tSidebar('permission_management')}
        extra={
          <div className='flex gap-2'>
            {/* <ExportExcelButton isExporting={isExporting} onExport={handleExport} /> */}
            <Can action='register'>
              <Button onClick={openCreate}>
                <Plus /> {tPermission('permission.button.add')}
              </Button>
            </Can>
          </div>
        }
      />
      <PermissionFilter filter={filter} handleFilterChange={handleFilterChange} />
      {/* <SelectedRowsExportBar
        count={selectedIds.length}
        isExporting={isExporting}
        onExport={() => handleExport(ExportType.SELECTED)}
      /> */}
      <PermissionTable
        data={data?.list || []}
        isLoading={isLoading}
        totalRecord={data?.pagination?.total_item || 0}
        pagination={pagination}
        onPaginationChange={onPaginationChange}
        rowSelection={rowSelection}
        onRowSelectionChange={setRowSelection}
        onEdit={openEdit}
        onCopy={openCopy}
        onDelete={setDeleteTarget}
      />

      <PermissionUpsertModal
        key={permissionId ?? 'create'}
        open={isUpsertOpen}
        setOpen={setIsUpsertOpen}
        permissionId={permissionId}
      />

      <PermissionCopyDialog open={!!copySource} setOpen={(open) => !open && setCopySource(null)} source={copySource} />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title={tPermission('permission.confirm.delete_title')}
        description={tPermission('permission.confirm.delete_description')}
        confirmLabel={tCommon('button.delete')}
        onConfirm={() => deleteTarget && mutateDelete(deleteTarget)}
        isLoading={isDeleting}
        variant='destructive'
      />
    </main>
  );
};

export default PermissionPage;
