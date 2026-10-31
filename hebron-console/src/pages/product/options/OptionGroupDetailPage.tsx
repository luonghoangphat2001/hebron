import Can from '@/components/Can';
import PageTitle from '@/components/PageTitle';
import RowActionButton from '@/components/button/RowActionButton';
import ConfirmDialog from '@/components/dialog/ConfirmDialog';
import { DataTable } from '@/components/table/DataTable';
import { appToast } from '@/components/toast/AppToast';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  useOptionGroupAssignProductsMutation,
  useOptionGroupDeleteMutation,
  useOptionGroupDetailQuery,
} from '@/data/option-group/option-group.query';
import { useOptionDeleteMutation, useOptionListQuery } from '@/data/option/option.query';
import type { ProductOptions } from '@/data/option/option.response';
import { useOptionGroupDisplayTypeOptions } from '@/hooks/useOptionGroupDisplayTypeOptions';
import { MY_ROUTE } from '@/utils/constants/route.constant';
import { formatCurrency, formatDate } from '@/utils/helper/common.helper';
import type { ColumnDef, PaginationState } from '@tanstack/react-table';
import { Edit, Plus, Trash } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import ProductPicker from '../components/ProductPicker';
import OptionFilter, { type OptionFilterValues } from '../components/options/OptionFilter';
import OptionGroupUpsertModal from '../components/options/OptionGroupUpsertModal';
import OptionUpsertModal from '../components/options/OptionUpsertModal';

const Row = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className='flex items-start justify-between gap-4 text-sm'>
    <span className='shrink-0 text-gray-500'>{label}</span>
    <span className='min-w-0 text-right font-medium break-all'>{children}</span>
  </div>
);

const TableSkeleton = ({ cols, rows = 3 }: { cols: number; rows?: number }) => (
  <div className='overflow-hidden rounded-md border'>
    <Table>
      <TableHeader className='bg-slate-100'>
        <TableRow className='hover:bg-slate-100'>
          {Array.from({ length: cols }).map((_, i) => (
            <TableHead key={i}>
              <Skeleton className='h-4 w-20' />
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {Array.from({ length: rows }).map((_, r) => (
          <TableRow key={r}>
            {Array.from({ length: cols }).map((_, c) => (
              <TableCell key={c}>
                <Skeleton className='h-4 w-full' />
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </div>
);

const DetailSkeleton = () => (
  <>
    <div className='grid grid-cols-3 gap-4 rounded-xl border border-gray-200 bg-white p-4'>
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className='flex items-center justify-between gap-4'>
          <Skeleton className='h-4 w-16' />
          <Skeleton className='h-4 w-20' />
        </div>
      ))}
    </div>

    <section className='rounded-xl border border-gray-200 bg-white p-4'>
      <Skeleton className='mb-2 h-5 w-24' />
      <TableSkeleton cols={6} />
    </section>

    <section className='rounded-xl border border-gray-200 bg-white p-4'>
      <Skeleton className='mb-2 h-5 w-24' />
      <TableSkeleton cols={2} />
    </section>
  </>
);

const OptionGroupDetailPage = () => {
  const { t: tCommon } = useTranslation('common');
  const { t } = useTranslation('option');
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, isLoading } = useOptionGroupDetailQuery(Number(id));
  const displayTypeOptions = useOptionGroupDisplayTypeOptions();
  const displayTypeLabel = displayTypeOptions.find((o) => o.value === data?.display_type)?.label ?? data?.display_type;

  const [isCreateOptionOpen, setIsCreateOptionOpen] = useState(false);
  const [editOptionId, setEditOptionId] = useState<number | undefined>(undefined);
  const [deleteOptionId, setDeleteOptionId] = useState<number | undefined>(undefined);
  const [isAssignProductsOpen, setIsAssignProductsOpen] = useState(false);
  const [isEditGroupOpen, setIsEditGroupOpen] = useState(false);
  const [isDeleteGroupOpen, setIsDeleteGroupOpen] = useState(false);

  const { mutate: mutateDeleteGroup, isPending: isDeletingGroup } = useOptionGroupDeleteMutation({
    onSuccess: () => {
      appToast.success(tCommon('notify.success_delete'));
      navigate(MY_ROUTE.PRODUCT.OPTION_LIST);
    },
    onError: (error) => {
      appToast.error(error.response?.data.message || tCommon('notify.fail_delete'));
    },
  });

  const [optionFilter, setOptionFilter] = useState<OptionFilterValues>({});
  const [optionsPagination, setOptionsPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 });
  const { data: optionsData, isLoading: isOptionsLoading } = useOptionListQuery({
    option_group_id: id,
    name: optionFilter.name,
    is_active: optionFilter.is_active,
    page: optionsPagination.pageIndex + 1,
    per_page: optionsPagination.pageSize,
  });

  const handleOptionFilterChange = (patch: Partial<OptionFilterValues>) => {
    setOptionFilter((prev) => ({ ...prev, ...patch }));
    setOptionsPagination((prev) => ({ ...prev, pageIndex: 0 }));
  };

  const { mutate: mutateDelete, isPending: isDeleting } = useOptionDeleteMutation({
    onSuccess: () => {
      setDeleteOptionId(undefined);
      appToast.success(tCommon('notify.success_delete'));
    },
    onError: (error) => {
      appToast.error(error.response?.data.message || tCommon('notify.fail_delete'));
    },
  });

  const { mutate: mutateAssignProducts, isPending: isAssigningProducts } = useOptionGroupAssignProductsMutation({
    onSuccess: () => {
      setIsAssignProductsOpen(false);
      appToast.success(tCommon('notify.success_update'));
    },
    onError: (error) => {
      appToast.error(error.response?.data.message || tCommon('notify.fail_update'));
    },
  });

  const optionColumns: ColumnDef<ProductOptions>[] = [
    {
      header: t('option.column.name'),
      accessorKey: 'name',
    },
    {
      header: t('option.column.additional_price'),
      cell: ({ row }) => formatCurrency(row.original.additional_price),
      meta: { align: 'right' },
    },
    {
      header: t('option.column.brand_site_price'),
      cell: ({ row }) => formatCurrency(row.original.additional_brand_site_price),
      meta: { align: 'right' },
    },
    {
      header: t('option.column.active'),
      cell: ({ row }) => (
        <Badge className={row.original.is_active ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'}>
          {row.original.is_active ? t('option.status_active') : t('option.status_inactive')}
        </Badge>
      ),
      meta: { align: 'center' },
    },
    {
      header: t('option.column.sort_order'),
      accessorKey: 'sort_order',
      meta: { align: 'center' },
    },
    {
      id: 'actions',
      header: t('option.column.action'),
      cell: ({ row }) => (
        <RowActionButton
          onEdit={() => setEditOptionId(Number(row.original.id))}
          onDelete={() => setDeleteOptionId(Number(row.original.id))}
        />
      ),
      meta: { align: 'center', width: '80px' },
    },
  ];

  return (
    <main className='space-y-6'>
      <PageTitle
        title={t('detail.title')}
        returnLink={MY_ROUTE.PRODUCT.OPTION_LIST}
        extra={
          data && (
            <div className='flex items-center gap-2'>
              <Can action='edit'>
                <Button size='sm' variant='outline' onClick={() => setIsEditGroupOpen(true)}>
                  <Edit className='size-4' /> {t('detail.button_edit')}
                </Button>
              </Can>
              <Can action='delete'>
                <Button size='sm' variant='destructive' onClick={() => setIsDeleteGroupOpen(true)}>
                  <Trash className='size-4' /> {t('group.button_delete')}
                </Button>
              </Can>
            </div>
          )
        }
      />

      {isLoading && <DetailSkeleton />}

      {!isLoading && data && (
        <>
          <div className='grid grid-cols-3 gap-x-8 gap-y-4 rounded-xl border border-gray-200 bg-white p-4'>
            <Row label={t('detail.field_code')}>
              <span className='font-mono'>{data.code}</span>
            </Row>
            <Row label={t('detail.field_name')}>{data.name}</Row>
            {/* <Row label={t('detail.field_display_type')}>{displayTypeLabel}</Row> */}
            <Row label={t('detail.field_required')}>{data.is_required ? t('detail.yes') : t('detail.no')}</Row>
            <Row label={t('detail.field_products')}>{data.products_count}</Row>
            <Row label={t('detail.field_updated_at')}>{formatDate(data.updated_at)}</Row>
          </div>

          <section className='rounded-xl border border-gray-200 bg-white p-4'>
            <div className='mb-2 flex items-center justify-between'>
              <p className='text-sm font-semibold'>
                {t('detail.section_options', { count: optionsData?.pagination?.total_item ?? 0 })}
              </p>
              <Can action='register'>
                <Button size='sm' onClick={() => setIsCreateOptionOpen(true)}>
                  <Plus className='size-4' /> {t('detail.button_add_option')}
                </Button>
              </Can>
            </div>
            <div className='mb-3'>
              <OptionFilter filter={optionFilter} handleFilterChange={handleOptionFilterChange} />
            </div>
            <DataTable
              data={optionsData?.list || []}
              isLoading={isOptionsLoading}
              columns={optionColumns}
              totalRows={optionsData?.pagination?.total_item || 0}
              pagination={optionsPagination}
              onPaginationChange={setOptionsPagination}
              pageSizeOptions={[10, 20, 50]}
              getRowId={(row) => row.id.toString()}
              emptyMessage={t('detail.empty_options')}
            />
          </section>

          <section className='rounded-xl border border-gray-200 bg-white p-4'>
            <div className='mb-2 flex items-center justify-between'>
              <p className='text-sm font-semibold'>{t('detail.section_products', { count: data.products?.length || 0 })}</p>
              <Can action='edit'>
                <Button size='sm' onClick={() => setIsAssignProductsOpen(true)}>
                  {t('detail.button_assign_products')}
                </Button>
              </Can>
            </div>
            <div className='overflow-hidden rounded-md border'>
              <Table>
                <TableHeader className='bg-slate-100'>
                  <TableRow className='hover:bg-slate-100'>
                    <TableHead>{t('detail.products_column_name')}</TableHead>
                    <TableHead>{t('detail.products_column_slug')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.products?.length ? (
                    data.products.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell>{product.name}</TableCell>
                        <TableCell className='text-muted-foreground font-mono text-xs'>{product.slug}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={2} className='text-muted-foreground h-16 text-center'>
                        {t('detail.empty_products')}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </section>
        </>
      )}

      <OptionUpsertModal open={isCreateOptionOpen} setOpen={setIsCreateOptionOpen} optionGroupId={id as string} />
      <OptionUpsertModal
        open={editOptionId !== undefined}
        setOpen={(o) => !o && setEditOptionId(undefined)}
        optionGroupId={id as string}
        optionId={editOptionId}
      />
      <ConfirmDialog
        open={deleteOptionId !== undefined}
        onOpenChange={(o) => !o && setDeleteOptionId(undefined)}
        title={t('detail.confirm_delete_option_title')}
        description={t('detail.confirm_delete_option_description')}
        onConfirm={() => deleteOptionId && mutateDelete(deleteOptionId)}
        isLoading={isDeleting}
        variant='destructive'
      />
      <OptionGroupUpsertModal open={isEditGroupOpen} setOpen={setIsEditGroupOpen} optionGroupId={Number(id)} />
      <ConfirmDialog
        open={isDeleteGroupOpen}
        onOpenChange={setIsDeleteGroupOpen}
        title={t('group.confirm_delete_title')}
        description={t('group.confirm_delete_description')}
        onConfirm={() => mutateDeleteGroup(Number(id))}
        isLoading={isDeletingGroup}
        variant='destructive'
      />
      {data && (
        <ProductPicker
          open={isAssignProductsOpen}
          setOpen={setIsAssignProductsOpen}
          initialProducts={data.products || []}
          isSaving={isAssigningProducts}
          onConfirm={(productIds) => mutateAssignProducts({ id: Number(id), product_ids: productIds })}
        />
      )}
    </main>
  );
};

export default OptionGroupDetailPage;
