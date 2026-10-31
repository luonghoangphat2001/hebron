import Can from '@/components/Can';
import ConfirmDialog from '@/components/dialog/ConfirmDialog';
import PageTitle from '@/components/PageTitle';
import { appToast } from '@/components/toast/AppToast';
import { Button } from '@/components/ui/button';
import { usePortfolioDeleteMutation, usePortfolioListQuery } from '@/data/portfolio/portfolio.query';
import { getPortfolioListInitFilter, transformPortfolioFilterToREQ } from '@/data/portfolio/portfolio.service';
import { useFilterPaging } from '@/hooks/useFilterPaging';
import { FolderCog, Plus } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import PortfolioCategoryModal from './components/PortfolioCategoryModal';
import PortfolioFilter, { type PortfolioFilterValues } from './components/PortfolioFilter';
import PortfolioTable from './components/PortfolioTable';
import PortfolioUpsertModal, { type PortfolioUpsertMode } from './components/PortfolioUpsertModal';

const PortfolioPage = () => {
  const { t: tSidebar } = useTranslation('sidebar');
  const { t: tContent } = useTranslation('content');
  const { t: tCommon } = useTranslation('common');

  const [isUpsertOpen, setIsUpsertOpen] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [portfolioId, setPortfolioId] = useState<number | null>(null);
  const [mode, setMode] = useState<PortfolioUpsertMode>('create');
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletePortfolioId, setDeletePortfolioId] = useState<number | null>(null);

  const { filter, pagination, handleFilterChange, onPaginationChange } = useFilterPaging<PortfolioFilterValues>({
    getInitialFilter: getPortfolioListInitFilter,
  });

  const queryParams = useMemo(() => transformPortfolioFilterToREQ(filter), [filter]);
  const { data, isLoading } = usePortfolioListQuery(queryParams);

  const { mutate: mutateDelete, isPending: isDeleting } = usePortfolioDeleteMutation({
    onSuccess: () => {
      setIsDeleteOpen(false);
      setDeletePortfolioId(null);
      appToast.success(tCommon('notify.success_delete'));
    },
    onError: () => {
      appToast.error(tCommon('notify.fail_delete'));
    },
  });

  const openCreate = () => {
    setPortfolioId(null);
    setMode('create');
    setIsUpsertOpen(true);
  };

  const openView = (id: number) => {
    setPortfolioId(id);
    setMode('view');
    setIsUpsertOpen(true);
  };

  const openEdit = (id: number) => {
    setPortfolioId(id);
    setMode('edit');
    setIsUpsertOpen(true);
  };

  const openDelete = (id: number) => {
    setDeletePortfolioId(id);
    setIsDeleteOpen(true);
  };

  const confirmDelete = () => {
    if (!deletePortfolioId || isDeleting) return;
    mutateDelete(deletePortfolioId);
  };

  return (
    <main className='space-y-6'>
      <PageTitle
        title={tSidebar('portfolio_management')}
        extra={
          <div className='flex items-center gap-2'>
            <Can action='register'>
              <Button variant='outline' onClick={() => setIsCategoryOpen(true)}>
                <FolderCog className='h-4 w-4' /> {tContent('portfolio.manage_category')}
              </Button>
            </Can>
            <Can action='register'>
              <Button onClick={openCreate}>
                <Plus className='h-4 w-4' /> {tContent('portfolio.button_create')}
              </Button>
            </Can>
          </div>
        }
      />
      <PortfolioFilter filter={filter} handleFilterChange={handleFilterChange} />
      <PortfolioTable
        data={data?.data?.portfolios || []}
        totalRows={data?.pagination.total_item || 0}
        isLoading={isLoading}
        pagination={pagination}
        onPaginationChange={onPaginationChange}
        onView={openView}
        onEdit={openEdit}
        onDelete={openDelete}
      />
      <PortfolioUpsertModal open={isUpsertOpen} setOpen={setIsUpsertOpen} portfolioId={portfolioId} mode={mode} />
      {isCategoryOpen && <PortfolioCategoryModal open setOpen={setIsCategoryOpen} />}
      <ConfirmDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        title={tContent('portfolio.confirm_delete_title')}
        description={tContent('portfolio.confirm_delete_desc')}
        onConfirm={confirmDelete}
        isLoading={isDeleting}
        variant='destructive'
      />
    </main>
  );
};

export default PortfolioPage;
