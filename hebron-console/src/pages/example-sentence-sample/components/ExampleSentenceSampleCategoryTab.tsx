import RowActionButton from '@/components/button/RowActionButton';
import ConfirmDialog from '@/components/dialog/ConfirmDialog';
import FilterContainer from '@/components/FilterContainer';
import FormItem from '@/components/form/FormItem';
import AppSelect from '@/components/select/AppSelect';
import { DataTable } from '@/components/table/DataTable';
import { appToast } from '@/components/toast/AppToast';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  useExampleSentenceSampleCategoryDeleteMutation,
  useExampleSentenceSampleCategoryListQuery,
} from '@/data/example-sentence-sample/example-sentence-sample.query';
import type { ExampleSentenceSampleCategoryListREQ } from '@/data/example-sentence-sample/example-sentence-sample.request';
import type { ExampleSentenceSampleCategoryRESP } from '@/data/example-sentence-sample/example-sentence-sample.response';
import { getExampleSentenceSampleCategoryListInitFilter } from '@/data/example-sentence-sample/example-sentence-sample.service';
import useDebounce from '@/hooks/useDebounce';
import { useFilterPaging } from '@/hooks/useFilterPaging';
import type { ColumnDef } from '@tanstack/react-table';
import { Plus } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ExampleSentenceSampleCategoryUpsertModal from './ExampleSentenceSampleCategoryUpsertModal';

const ExampleSentenceSampleCategoryTab = () => {
  const { t: tContent } = useTranslation('content');
  const { t: tCommon } = useTranslation('common');
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [isUpsertOpen, setIsUpsertOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const { filter, pagination, handleFilterChange, onPaginationChange } = useFilterPaging<ExampleSentenceSampleCategoryListREQ>({
    getInitialFilter: getExampleSentenceSampleCategoryListInitFilter,
    prefix: 'category',
  });
  const [searchInput, setSearchInput] = useState(filter.keyword || '');
  const { data, isLoading } = useExampleSentenceSampleCategoryListQuery(filter);
  const categories = data?.list || [];
  const totalRecord = data?.pagination.total_item || 0;

  const handleKeywordChange = useCallback(
    (value: string) => handleFilterChange({ keyword: value || undefined }),
    [handleFilterChange],
  );
  useDebounce(searchInput, handleKeywordChange);
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setSearchInput(filter.keyword || ''), [filter.keyword]);

  const { mutate: remove, isPending: isDeleting } = useExampleSentenceSampleCategoryDeleteMutation({
    onSuccess: () => {
      setDeleteId(null);
      appToast.success(tCommon('notify.success_delete'));
    },
    onError: (error) => appToast.error(error.response?.data.message || tCommon('notify.fail_delete')),
  });

  const openCreate = useCallback(() => {
    setCategoryId(null);
    setIsUpsertOpen(true);
  }, []);

  const openEdit = (id: number) => {
    setCategoryId(id);
    setIsUpsertOpen(true);
  };

  const columns = useMemo<ColumnDef<ExampleSentenceSampleCategoryRESP>[]>(
    () => [
      {
        header: tContent('column.no'),
        cell: ({ row }) => pagination.pageIndex * pagination.pageSize + row.index + 1,
        meta: { align: 'center', width: '70px' },
      },
      { header: tContent('column.name'), accessorKey: 'name' },
      { header: tContent('sample.total_posts'), accessorKey: 'total_post', meta: { align: 'center', width: '140px' } },
      {
        header: tContent('column.status'),
        cell: ({ row }) => (
          <Badge variant={row.original.is_active ? 'default' : 'secondary'}>
            {row.original.is_active ? tContent('sample.active') : tContent('sample.inactive')}
          </Badge>
        ),
        meta: { align: 'center', width: '120px' },
      },
      {
        id: 'actions',
        header: tContent('column.actions'),
        cell: ({ row }) => (
          <RowActionButton onEdit={() => openEdit(row.original.id)} onDelete={() => setDeleteId(row.original.id)} />
        ),
        meta: { align: 'center', width: '80px' },
      },
    ],
    [pagination.pageIndex, pagination.pageSize, tContent],
  );

  return (
    <div className='space-y-6'>
      <div className='flex justify-end'>
        <Button onClick={openCreate}>
          <Plus /> {tContent('sample.add_category')}
        </Button>
      </div>
      <FilterContainer
        onResetFilter={() => {
          setSearchInput('');
          handleFilterChange({ keyword: undefined, is_active: undefined });
        }}>
        <div className='grid grid-cols-3 gap-4'>
          <FormItem label={tContent('filter.search')}>
            <Input
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder={tContent('sample.ph_search_category')}
            />
          </FormItem>
          <FormItem label={tContent('sample.field_active')}>
            <AppSelect
              options={[
                { value: 'true', label: tContent('sample.active') },
                { value: 'false', label: tContent('sample.inactive') },
              ]}
              value={filter.is_active === undefined ? undefined : String(filter.is_active)}
              placeholder={tContent('filter.ph_all_statuses')}
              onChange={(value) => handleFilterChange({ is_active: value === undefined ? undefined : value === 'true' })}
            />
          </FormItem>
        </div>
      </FilterContainer>
      <DataTable
        data={categories}
        columns={columns}
        isLoading={isLoading}
        totalRows={totalRecord}
        pagination={pagination}
        onPaginationChange={onPaginationChange}
        pageSizeOptions={[10, 20, 50]}
        getRowId={(row) => row.id.toString()}
        emptyMessage={tContent('sample.empty_category')}
      />
      <ExampleSentenceSampleCategoryUpsertModal open={isUpsertOpen} setOpen={setIsUpsertOpen} categoryId={categoryId} />
      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(value) => !value && setDeleteId(null)}
        title={tContent('sample.confirm_delete_category_title')}
        description={tContent('sample.confirm_delete_category_desc')}
        onConfirm={() => deleteId && remove(deleteId)}
        isLoading={isDeleting}
        variant='destructive'
      />
    </div>
  );
};

export default ExampleSentenceSampleCategoryTab;
