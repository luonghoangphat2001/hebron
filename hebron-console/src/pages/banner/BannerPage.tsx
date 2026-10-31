import Can from '@/components/Can';
import ConfirmDialog from '@/components/dialog/ConfirmDialog';
import PageTitle from '@/components/PageTitle';
import { appToast } from '@/components/toast/AppToast';
import { Button } from '@/components/ui/button';
import { useBannerDeleteMutation, useBannerListQuery } from '@/data/banner/banner.query';
import { getBannerListInitFilter, transformBannerFilterToREQ } from '@/data/banner/banner.service';
import { useFilterPaging } from '@/hooks/useFilterPaging';
import { Plus } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import BannerFilter, { type BannerFilterValues } from './components/BannerFilter';
import BannerTable from './components/BannerTable';
import BannerUpsertModal, { type BannerUpsertMode } from './components/BannerUpsertModal';

const BannerPage = () => {
  const { t: tSidebar } = useTranslation('sidebar');
  const { t: tContent } = useTranslation('content');
  const { t: tCommon } = useTranslation('common');

  const [isUpsertOpen, setIsUpsertOpen] = useState(false);
  const [bannerId, setBannerId] = useState<number | null>(null);
  const [mode, setMode] = useState<BannerUpsertMode>('create');
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteBannerId, setDeleteBannerId] = useState<number | null>(null);

  const { filter, pagination, handleFilterChange, onPaginationChange } = useFilterPaging<BannerFilterValues>({
    getInitialFilter: getBannerListInitFilter,
  });

  const queryParams = useMemo(() => transformBannerFilterToREQ(filter), [filter]);
  const { data, isLoading } = useBannerListQuery(queryParams);

  const { mutate: mutateDelete, isPending: isDeleting } = useBannerDeleteMutation({
    onSuccess: () => {
      setIsDeleteOpen(false);
      setDeleteBannerId(null);
      appToast.success(tCommon('notify.success_delete'));
    },
    onError: (error) => {
      appToast.error(error.response?.data.message || tCommon('notify.fail_delete'));
    },
  });

  const openCreate = () => {
    setBannerId(null);
    setMode('create');
    setIsUpsertOpen(true);
  };

  const openView = (id: number) => {
    setBannerId(id);
    setMode('view');
    setIsUpsertOpen(true);
  };

  const openEdit = (id: number) => {
    setBannerId(id);
    setMode('edit');
    setIsUpsertOpen(true);
  };

  const openDelete = (id: number) => {
    setDeleteBannerId(id);
    setIsDeleteOpen(true);
  };

  const confirmDelete = () => {
    if (!deleteBannerId || isDeleting) return;
    mutateDelete(deleteBannerId);
  };

  return (
    <main className='space-y-6'>
      <PageTitle
        title={tSidebar('banner_management')}
        extra={
          <Can action='register'>
            <Button onClick={openCreate}>
              <Plus /> {tContent('button.create_banner')}
            </Button>
          </Can>
        }
      />
      <BannerFilter filter={filter} handleFilterChange={handleFilterChange} />
      <BannerTable
        data={data?.data?.banners || []}
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
      <BannerUpsertModal open={isUpsertOpen} setOpen={setIsUpsertOpen} bannerId={bannerId} mode={mode} />
      <ConfirmDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        title={tContent('banner.confirm_delete_title')}
        description={tContent('banner.confirm_delete_desc')}
        onConfirm={confirmDelete}
        isLoading={isDeleting}
        variant='destructive'
      />
    </main>
  );
};

export default BannerPage;
