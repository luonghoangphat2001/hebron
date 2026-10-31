import Can from '@/components/Can';
import ConfirmDialog from '@/components/dialog/ConfirmDialog';
import PageTitle from '@/components/PageTitle';
import { appToast } from '@/components/toast/AppToast';
import { Button } from '@/components/ui/button';
import { useCraftsmanshipDeleteMutation, useCraftsmanshipListQuery } from '@/data/craftsmanship/craftsmanship.query';
import type { PaginationState } from '@tanstack/react-table';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import CraftsmanshipTable from './components/CraftsmanshipTable';
import CraftsmanshipUpsertModal, { type CraftsmanshipUpsertMode } from './components/CraftsmanshipUpsertModal';

const CraftsmanshipPage = () => {
  const { t: tSidebar } = useTranslation('sidebar');
  const { t: tContent } = useTranslation('content');
  const { t: tCommon } = useTranslation('common');

  const [isUpsertOpen, setIsUpsertOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [mode, setMode] = useState<CraftsmanshipUpsertMode>('edit');
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 20,
  });

  const { data, isLoading } = useCraftsmanshipListQuery({
    page: pagination.pageIndex + 1,
    per_page: pagination.pageSize,
  });

  const { mutate: mutateDelete, isPending: isDeleting } = useCraftsmanshipDeleteMutation({
    onSuccess: () => {
      setIsDeleteOpen(false);
      setDeleteId(null);
      appToast.success(tCommon('notify.success_delete'));
    },
    onError: (error) => {
      appToast.error(error.response?.data?.message || tCommon('notify.fail_delete'));
    },
  });

  const craftsmanshipList = data?.list || [];

  const openCreate = () => {
    setSelectedId(null);
    setMode('create');
    setIsUpsertOpen(true);
  };

  const openView = (id: number) => {
    setSelectedId(id);
    setMode('view');
    setIsUpsertOpen(true);
  };

  const openEdit = (id: number) => {
    setSelectedId(id);
    setMode('edit');
    setIsUpsertOpen(true);
  };

  const openDelete = (id: number) => {
    setDeleteId(id);
    setIsDeleteOpen(true);
  };

  const confirmDelete = () => {
    if (!deleteId || isDeleting) return;
    mutateDelete(deleteId);
  };

  return (
    <main className='space-y-6'>
      <PageTitle
        title={tSidebar('craftsmanship_management')}
        extra={
          <Can action='register'>
            <Button onClick={openCreate}>
              <Plus className='h-4 w-4' /> {tContent('craftsmanship.add_new')}
            </Button>
          </Can>
        }
      />
      <CraftsmanshipTable
        data={craftsmanshipList}
        isLoading={isLoading}
        onView={openView}
        onEdit={openEdit}
        onDelete={openDelete}
        pagination={pagination}
        onPaginationChange={setPagination}
      />
      <CraftsmanshipUpsertModal open={isUpsertOpen} setOpen={setIsUpsertOpen} id={selectedId} mode={mode} />
      <ConfirmDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        title={tContent('craftsmanship.confirm_delete_title')}
        description={tContent('craftsmanship.confirm_delete_desc')}
        onConfirm={confirmDelete}
        isLoading={isDeleting}
        variant='destructive'
      />
    </main>
  );
};

export default CraftsmanshipPage;
