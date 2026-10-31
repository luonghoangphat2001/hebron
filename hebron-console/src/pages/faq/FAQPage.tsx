import Can from '@/components/Can';
import ConfirmDialog from '@/components/dialog/ConfirmDialog';
import PageTitle from '@/components/PageTitle';
import { appToast } from '@/components/toast/AppToast';
import { Button } from '@/components/ui/button';
import { useFAQDeleteMutation, useFAQListQuery } from '@/data/faq/faq.query';
import type { FAQListREQ } from '@/data/faq/faq.request';
import { getFAQListInitFilter } from '@/data/faq/faq.service';
import { useFilterPaging } from '@/hooks/useFilterPaging';
import { FolderCog, Plus } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import FAQCategoryModal from './components/FAQCategoryModal';
import FAQFilter from './components/FAQFilter';
import FAQTable from './components/FAQTable';
import FAQUpsertModal, { type FAQUpsertMode } from './components/FAQUpsertModal';

const FAQPage = () => {
  const { t: tSidebar } = useTranslation('sidebar');
  const { t: tContent } = useTranslation('content');
  const { t: tCommon } = useTranslation('common');

  const [isUpsertOpen, setIsUpsertOpen] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [faqId, setFaqId] = useState<number | null>(null);
  const [mode, setMode] = useState<FAQUpsertMode>('create');
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteFaqId, setDeleteFaqId] = useState<number | null>(null);

  const { filter, pagination, handleFilterChange, onPaginationChange } = useFilterPaging<FAQListREQ>({
    getInitialFilter: getFAQListInitFilter,
  });

  const { data, isLoading } = useFAQListQuery(filter);
  const { mutate: mutateDelete, isPending: isDeleting } = useFAQDeleteMutation({
    onSuccess: () => {
      setIsDeleteOpen(false);
      setDeleteFaqId(null);
      appToast.success(tCommon('notify.success_delete'));
    },
    onError: (error) => {
      appToast.error(error.response?.data.message || tCommon('notify.fail_delete'));
    },
  });

  const openCreate = () => {
    setFaqId(null);
    setMode('create');
    setIsUpsertOpen(true);
  };

  const openEdit = (id: number) => {
    setFaqId(id);
    setMode('edit');
    setIsUpsertOpen(true);
  };

  const openView = (id: number) => {
    setFaqId(id);
    setMode('view');
    setIsUpsertOpen(true);
  };

  const openDelete = (id: number) => {
    setDeleteFaqId(id);
    setIsDeleteOpen(true);
  };

  const confirmDelete = () => {
    if (!deleteFaqId || isDeleting) return;
    mutateDelete(deleteFaqId);
  };

  return (
    <main className='space-y-6'>
      <PageTitle
        title={tSidebar('faq_management')}
        extra={
          <div className='flex items-center gap-2'>
            <Can action='register'>
              <Button variant='outline' onClick={() => setIsCategoryOpen(true)}>
                <FolderCog className='h-4 w-4' /> {tContent('faq.manage_category')}
              </Button>
            </Can>
            <Can action='register'>
              <Button onClick={openCreate}>
                <Plus className='h-4 w-4' /> {tContent('button.add_faq')}
              </Button>
            </Can>
          </div>
        }
      />
      <FAQFilter filter={filter} handleFilterChange={handleFilterChange} />
      <FAQTable
        data={data?.list || []}
        isLoading={isLoading}
        totalRecord={data?.pagination.total_item || 0}
        pagination={pagination}
        onPaginationChange={onPaginationChange}
        onView={openView}
        onEdit={openEdit}
        onDelete={openDelete}
      />
      <FAQUpsertModal open={isUpsertOpen} setOpen={setIsUpsertOpen} faqId={faqId} mode={mode} />
      {isCategoryOpen && <FAQCategoryModal open setOpen={setIsCategoryOpen} />}
      <ConfirmDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        title={tContent('faq.confirm_delete_title')}
        description={tContent('faq.confirm_delete_desc')}
        onConfirm={confirmDelete}
        isLoading={isDeleting}
        variant='destructive'
      />
    </main>
  );
};

export default FAQPage;
