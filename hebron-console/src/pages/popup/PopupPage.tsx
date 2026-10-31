import Can from '@/components/Can';
import ConfirmDialog from '@/components/dialog/ConfirmDialog';
import PageTitle from '@/components/PageTitle';
import { appToast } from '@/components/toast/AppToast';
import { Button } from '@/components/ui/button';
import { usePopupDeleteMutation, usePopupListQuery } from '@/data/popup/popup.query';
import { getPopupListInitFilter, transformPopupFilterToREQ } from '@/data/popup/popup.service';
import { useFilterPaging } from '@/hooks/useFilterPaging';
import { Plus } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import PopupFilter, { type PopupFilterValues } from './components/PopupFilter';
import PopupTable from './components/PopupTable';
import PopupUpsertModal, { type PopupUpsertMode } from './components/PopupUpsertModal';

const PopupPage = () => {
  const { t: tSidebar } = useTranslation('sidebar');
  const { t: tContent } = useTranslation('content');
  const { t: tCommon } = useTranslation('common');

  const [isUpsertOpen, setIsUpsertOpen] = useState(false);
  const [popupId, setPopupId] = useState<number | null>(null);
  const [mode, setMode] = useState<PopupUpsertMode>('create');
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletePopupId, setDeletePopupId] = useState<number | null>(null);

  const { filter, pagination, handleFilterChange, onPaginationChange } = useFilterPaging<PopupFilterValues>({
    getInitialFilter: getPopupListInitFilter,
  });

  const queryParams = useMemo(() => transformPopupFilterToREQ(filter), [filter]);
  const { data, isLoading } = usePopupListQuery(queryParams);

  const { mutate: mutateDelete, isPending: isDeleting } = usePopupDeleteMutation({
    onSuccess: () => {
      setIsDeleteOpen(false);
      setDeletePopupId(null);
      appToast.success(tCommon('notify.success_delete'));
    },
    onError: (error) => {
      appToast.error(error.response?.data.message || tCommon('notify.fail_delete'));
    },
  });

  const openCreate = () => {
    setPopupId(null);
    setMode('create');
    setIsUpsertOpen(true);
  };

  const openView = (id: number) => {
    setPopupId(id);
    setMode('view');
    setIsUpsertOpen(true);
  };

  const openEdit = (id: number) => {
    setPopupId(id);
    setMode('edit');
    setIsUpsertOpen(true);
  };

  const openDelete = (id: number) => {
    setDeletePopupId(id);
    setIsDeleteOpen(true);
  };

  const confirmDelete = () => {
    if (!deletePopupId || isDeleting) return;
    mutateDelete(deletePopupId);
  };

  return (
    <main className='space-y-6'>
      <PageTitle
        title={tSidebar('popup_management')}
        extra={
          <Can action='register'>
            <Button onClick={openCreate}>
              <Plus /> {tContent('button.register_popup')}
            </Button>
          </Can>
        }
      />
      <PopupFilter onFilterChange={handleFilterChange} />
      <PopupTable
        data={data?.data?.popups || []}
        totalRows={data?.pagination.total_item || 0}
        isLoading={isLoading}
        pagination={pagination}
        onPaginationChange={onPaginationChange}
        onView={openView}
        onEdit={openEdit}
        onDelete={openDelete}
        sortBy={filter.sort_by}
        sortOrder={filter.sort_order}
        onSortChange={(sortBy, sortOrder) => handleFilterChange({ sort_by: sortBy, sort_order: sortOrder })}
      />
      <PopupUpsertModal open={isUpsertOpen} setOpen={setIsUpsertOpen} popupId={popupId} mode={mode} />
      <ConfirmDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        title={tContent('popup.confirm_delete_title')}
        description={tContent('popup.confirm_delete_desc')}
        onConfirm={confirmDelete}
        isLoading={isDeleting}
        variant='destructive'
      />
    </main>
  );
};

export default PopupPage;
