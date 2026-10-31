import Can from '@/components/Can';
import ConfirmDialog from '@/components/dialog/ConfirmDialog';
import PageTitle from '@/components/PageTitle';
import { appToast } from '@/components/toast/AppToast';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  useExampleSentenceSampleDeleteMutation,
  useExampleSentenceSampleListQuery,
} from '@/data/example-sentence-sample/example-sentence-sample.query';
import type { ExampleSentenceSampleListREQ } from '@/data/example-sentence-sample/example-sentence-sample.request';
import { getExampleSentenceSampleListInitFilter } from '@/data/example-sentence-sample/example-sentence-sample.service';
import { useFilterPaging } from '@/hooks/useFilterPaging';
import { Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import ExampleSentenceSampleCategoryTab from './components/ExampleSentenceSampleCategoryTab';
import ExampleSentenceSampleFilter from './components/ExampleSentenceSampleFilter';
import ExampleSentenceSampleTable from './components/ExampleSentenceSampleTable';
import ExampleSentenceSampleUpsertModal, {
  type ExampleSentenceSampleUpsertMode,
} from './components/ExampleSentenceSampleUpsertModal';

type SampleTab = 'sample' | 'category';

const ExampleSentenceSamplePage = () => {
  const { t: tSidebar } = useTranslation('sidebar');
  const { t: tContent } = useTranslation('content');
  const { t: tCommon } = useTranslation('common');
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<SampleTab>(searchParams.get('tab') === 'category' ? 'category' : 'sample');
  const [sampleId, setSampleId] = useState<number | null>(null);
  const [mode, setMode] = useState<ExampleSentenceSampleUpsertMode>('create');
  const [isUpsertOpen, setIsUpsertOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const { filter, pagination, handleFilterChange, onPaginationChange } = useFilterPaging<ExampleSentenceSampleListREQ>({
    getInitialFilter: getExampleSentenceSampleListInitFilter,
    prefix: 'sample',
  });
  const { data, isLoading } = useExampleSentenceSampleListQuery(filter);
  const { mutate: remove, isPending: isDeleting } = useExampleSentenceSampleDeleteMutation({
    onSuccess: () => {
      setIsDeleteOpen(false);
      setDeleteId(null);
      appToast.success(tCommon('notify.success_delete'));
    },
    onError: (error) => appToast.error(error.response?.data.message || tCommon('notify.fail_delete')),
  });

  const openModal = (nextMode: ExampleSentenceSampleUpsertMode, id: number | null = null) => {
    setMode(nextMode);
    setSampleId(id);
    setIsUpsertOpen(true);
  };

  useEffect(() => {
    setSearchParams((params) => {
      params.set('tab', activeTab);
      return params;
    });
  }, [activeTab, setSearchParams]);

  return (
    <main className='space-y-6'>
      <PageTitle
        title={tSidebar('sample_management')}
        extra={
          activeTab === 'sample' ? (
            <Can action='register'>
              <Button onClick={() => openModal('create')}>
                <Plus /> {tContent('sample.add_new')}
              </Button>
            </Can>
          ) : undefined
        }
      />
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as SampleTab)}>
        <TabsList>
          <TabsTrigger value='sample' className='cursor-pointer'>
            {tContent('sample.tab_sample')}
          </TabsTrigger>
          <TabsTrigger value='category' className='cursor-pointer'>
            {tContent('sample.tab_category')}
          </TabsTrigger>
        </TabsList>
        <TabsContent value='sample' forceMount className='space-y-6 data-[state=inactive]:hidden'>
          <ExampleSentenceSampleFilter filter={filter} handleFilterChange={handleFilterChange} />
          <ExampleSentenceSampleTable
            data={data?.list || []}
            isLoading={isLoading}
            totalRecord={data?.pagination.total_item || 0}
            pagination={pagination}
            onPaginationChange={onPaginationChange}
            onView={(id) => openModal('view', id)}
            onEdit={(id) => openModal('edit', id)}
            onDelete={(id) => {
              setDeleteId(id);
              setIsDeleteOpen(true);
            }}
          />
        </TabsContent>
        <TabsContent value='category' forceMount className='data-[state=inactive]:hidden'>
          <ExampleSentenceSampleCategoryTab />
        </TabsContent>
      </Tabs>
      <ExampleSentenceSampleUpsertModal open={isUpsertOpen} setOpen={setIsUpsertOpen} sampleId={sampleId} mode={mode} />
      <ConfirmDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        title={tContent('sample.confirm_delete_title')}
        description={tContent('sample.confirm_delete_desc')}
        onConfirm={() => deleteId && remove(deleteId)}
        isLoading={isDeleting}
        variant='destructive'
      />
    </main>
  );
};

export default ExampleSentenceSamplePage;
