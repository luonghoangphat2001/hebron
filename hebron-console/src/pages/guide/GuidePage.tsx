import Can from '@/components/Can';
import ConfirmDialog from '@/components/dialog/ConfirmDialog';
import PageTitle from '@/components/PageTitle';
import { appToast } from '@/components/toast/AppToast';
import { Button } from '@/components/ui/button';
import { useGuideDeleteMutation, useGuideListQuery } from '@/data/guide/guide.query';
import type { GuideListREQ } from '@/data/guide/guide.request';
import { getGuideListInitFilter } from '@/data/guide/guide.service';
import { useFilterPaging } from '@/hooks/useFilterPaging';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import GuideFilter from './components/GuideFilter';
import GuideTable from './components/GuideTable';
import GuideUpsertModal, { type GuideUpsertMode } from './components/GuideUpsertModal';

const GuidePage = () => {
  const { t: tSidebar } = useTranslation('sidebar');
  const { t: tContent } = useTranslation('content');
  const { t: tCommon } = useTranslation('common');

  const [isUpsertOpen, setIsUpsertOpen] = useState(false);
  const [guideId, setGuideId] = useState<number | null>(null);
  const [mode, setMode] = useState<GuideUpsertMode>('create');
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteGuideId, setDeleteGuideId] = useState<number | null>(null);

  const { filter, pagination, handleFilterChange, onPaginationChange } = useFilterPaging<GuideListREQ>({
    getInitialFilter: getGuideListInitFilter,
  });

  const { data, isLoading } = useGuideListQuery(filter);
  const { mutate: mutateDelete, isPending: isDeleting } = useGuideDeleteMutation({
    onSuccess: () => {
      setIsDeleteOpen(false);
      setDeleteGuideId(null);
      appToast.success(tCommon('notify.success_delete'));
    },
    onError: (error) => {
      appToast.error(error.response?.data.message || tCommon('notify.fail_delete'));
    },
  });

  const openCreate = () => {
    setGuideId(null);
    setMode('create');
    setIsUpsertOpen(true);
  };

  const openEdit = (id: number) => {
    setGuideId(id);
    setMode('edit');
    setIsUpsertOpen(true);
  };

  const openView = (id: number) => {
    setGuideId(id);
    setMode('view');
    setIsUpsertOpen(true);
  };

  const openDelete = (id: number) => {
    setDeleteGuideId(id);
    setIsDeleteOpen(true);
  };

  const confirmDelete = () => {
    if (!deleteGuideId || isDeleting) return;
    mutateDelete(deleteGuideId);
  };

  return (
    <main className='space-y-6'>
      <PageTitle
        title={tSidebar('guide_content_management')}
        extra={
          <Can action='register'>
            <Button onClick={openCreate}>
              <Plus /> {tContent('button.add_guide')}
            </Button>
          </Can>
        }
      />
      <GuideFilter filter={filter} handleFilterChange={handleFilterChange} />
      <GuideTable
        data={data?.list || []}
        isLoading={isLoading}
        totalRecord={data?.pagination?.total_item || 0}
        pagination={pagination}
        onPaginationChange={onPaginationChange}
        onView={openView}
        onEdit={openEdit}
        onDelete={openDelete}
      />
      <GuideUpsertModal open={isUpsertOpen} setOpen={setIsUpsertOpen} guideId={guideId} mode={mode} />
      <ConfirmDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        title={tContent('guide.confirm_delete_title')}
        description={tContent('guide.confirm_delete_desc')}
        onConfirm={confirmDelete}
        isLoading={isDeleting}
        variant='destructive'
      />
    </main>
  );
};

export default GuidePage;
