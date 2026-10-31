import Can from '@/components/Can';
import ConfirmDialog from '@/components/dialog/ConfirmDialog';
import PageTitle from '@/components/PageTitle';
import { appToast } from '@/components/toast/AppToast';
import { Button } from '@/components/ui/button';
import { useNoticeDeleteMutation, useNoticeListQuery } from '@/data/notice/notice.query';
import type { NoticeListREQ } from '@/data/notice/notice.request';
import { getNoticeListInitFilter } from '@/data/notice/notice.service';
import { useFilterPaging } from '@/hooks/useFilterPaging';
import { FolderCog, Plus } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import NoticeCategoryModal from './components/NoticeCategoryModal';
import NoticeFilter from './components/NoticeFilter';
import NoticeTable from './components/NoticeTable';
import NoticeUpsertModal, { type NoticeUpsertMode } from './components/NoticeUpsertModal';

const NoticePage = () => {
  const { t: tSidebar } = useTranslation('sidebar');
  const { t: tContent } = useTranslation('content');
  const { t: tCommon } = useTranslation('common');

  const [isUpsertOpen, setIsUpsertOpen] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [noticeId, setNoticeId] = useState<number | null>(null);
  const [mode, setMode] = useState<NoticeUpsertMode>('create');
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteNoticeId, setDeleteNoticeId] = useState<number | null>(null);

  const { filter, pagination, handleFilterChange, onPaginationChange } = useFilterPaging<NoticeListREQ>({
    getInitialFilter: getNoticeListInitFilter,
  });

  const { data, isLoading } = useNoticeListQuery(filter);
  const { mutate: mutateDelete, isPending: isDeleting } = useNoticeDeleteMutation({
    onSuccess: () => {
      setIsDeleteOpen(false);
      setDeleteNoticeId(null);
      appToast.success(tCommon('notify.success_delete'));
    },
    onError: (error) => {
      appToast.error(error.response?.data.message || tCommon('notify.fail_delete'));
    },
  });

  const openCreate = () => {
    setNoticeId(null);
    setMode('create');
    setIsUpsertOpen(true);
  };

  const openEdit = (id: number) => {
    setNoticeId(id);
    setMode('edit');
    setIsUpsertOpen(true);
  };

  const openView = (id: number) => {
    setNoticeId(id);
    setMode('view');
    setIsUpsertOpen(true);
  };

  const openDelete = (id: number) => {
    setDeleteNoticeId(id);
    setIsDeleteOpen(true);
  };

  const confirmDelete = () => {
    if (!deleteNoticeId || isDeleting) return;
    mutateDelete(deleteNoticeId);
  };

  return (
    <main className='space-y-6'>
      <PageTitle
        title={tSidebar('notice_management')}
        extra={
          <div className='flex items-center gap-2'>
            <Can action='register'>
              <Button variant='outline' onClick={() => setIsCategoryOpen(true)}>
                <FolderCog className='h-4 w-4' /> {tContent('notice.manage_category')}
              </Button>
            </Can>
            <Can action='register'>
              <Button onClick={openCreate}>
                <Plus className='h-4 w-4' /> {tContent('button.register_notice')}
              </Button>
            </Can>
          </div>
        }
      />
      <NoticeFilter filter={filter} handleFilterChange={handleFilterChange} />
      <NoticeTable
        data={data?.list || []}
        isLoading={isLoading}
        totalRecord={data?.pagination?.total_item || 0}
        pagination={pagination}
        onPaginationChange={onPaginationChange}
        onView={openView}
        onEdit={openEdit}
        onDelete={openDelete}
      />
      <NoticeUpsertModal open={isUpsertOpen} setOpen={setIsUpsertOpen} noticeId={noticeId} mode={mode} />
      {isCategoryOpen && <NoticeCategoryModal open setOpen={setIsCategoryOpen} />}
      <ConfirmDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        title={tContent('notice.confirm_delete_title')}
        description={tContent('notice.confirm_delete_desc')}
        onConfirm={confirmDelete}
        isLoading={isDeleting}
        variant='destructive'
      />
    </main>
  );
};

export default NoticePage;
