import Can from '@/components/Can';
import ConfirmDialog from '@/components/dialog/ConfirmDialog';
import PageTitle from '@/components/PageTitle';
import { appToast } from '@/components/toast/AppToast';
import { Button } from '@/components/ui/button';
import { useMediaDeleteMutation, useMediaListQuery } from '@/data/media/media.query';
import type { MediaListREQ } from '@/data/media/media.request';
import { getMediaListInitFilter } from '@/data/media/media.service';
import { useFilterPaging } from '@/hooks/useFilterPaging';
import { FolderCog, Plus } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import MediaCategoryModal from './components/MediaCategoryModal';
import MediaFilter from './components/MediaFilter';
import MediaTable from './components/MediaTable';
import MediaUpsertModal, { type MediaUpsertMode } from './components/MediaUpsertModal';

const MediaPage = () => {
  const { t: tSidebar } = useTranslation('sidebar');
  const { t: tContent } = useTranslation('content');
  const { t: tCommon } = useTranslation('common');

  const [isUpsertOpen, setIsUpsertOpen] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [mediaId, setMediaId] = useState<number | null>(null);
  const [mode, setMode] = useState<MediaUpsertMode>('create');
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const { filter, pagination, handleFilterChange, onPaginationChange } = useFilterPaging<MediaListREQ>({
    getInitialFilter: getMediaListInitFilter,
  });

  const { data, isLoading } = useMediaListQuery(filter);
  const { mutate: mutateDelete, isPending: isDeleting } = useMediaDeleteMutation({
    onSuccess: () => {
      setDeleteId(null);
      appToast.success(tCommon('notify.success_delete'));
    },
    onError: (error) => {
      appToast.error(error.response?.data?.message || tCommon('notify.fail_delete'));
    },
  });

  const openCreate = () => {
    setMediaId(null);
    setMode('create');
    setIsUpsertOpen(true);
  };

  const openEdit = (id: number) => {
    setMediaId(id);
    setMode('edit');
    setIsUpsertOpen(true);
  };

  const openView = (id: number) => {
    setMediaId(id);
    setMode('view');
    setIsUpsertOpen(true);
  };

  return (
    <main className='space-y-6'>
      <PageTitle
        title={tSidebar('media_management')}
        extra={
          <div className='flex items-center gap-2'>
            <Can action='register'>
              <Button variant='outline' onClick={() => setIsCategoryOpen(true)}>
                <FolderCog className='h-4 w-4' /> {tContent('media.manage_category')}
              </Button>
            </Can>
            <Can action='register'>
              <Button onClick={openCreate}>
                <Plus className='h-4 w-4' /> {tContent('media.add_new')}
              </Button>
            </Can>
          </div>
        }
      />
      <MediaFilter filter={filter} handleFilterChange={handleFilterChange} />
      <MediaTable
        data={data?.list || []}
        isLoading={isLoading}
        totalRecord={data?.pagination.total_item || 0}
        pagination={pagination}
        onPaginationChange={onPaginationChange}
        onView={openView}
        onEdit={openEdit}
        onDelete={setDeleteId}
      />
      <MediaUpsertModal
        open={isUpsertOpen}
        setOpen={setIsUpsertOpen}
        id={mediaId}
        mode={mode}
        defaultSiteType={filter.site_type}
      />
      {isCategoryOpen && <MediaCategoryModal open setOpen={setIsCategoryOpen} siteType={filter.site_type} />}
      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(value) => !value && setDeleteId(null)}
        title={tContent('media.confirm_delete_title')}
        description={tContent('media.confirm_delete_desc')}
        onConfirm={() => deleteId && !isDeleting && mutateDelete(deleteId)}
        isLoading={isDeleting}
        variant='destructive'
      />
    </main>
  );
};

export default MediaPage;
