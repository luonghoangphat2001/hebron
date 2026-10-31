import Can from '@/components/Can';
import AppDialog from '@/components/dialog/AppDialog';
import ConfirmDialog from '@/components/dialog/ConfirmDialog';
import ExportExcelButton from '@/components/export/ExportExcelButton';
import FilterContainer from '@/components/FilterContainer';
import PageTitle from '@/components/PageTitle';
import AppSelect from '@/components/select/AppSelect';
import { DataTable } from '@/components/table/DataTable';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import {
  useTemplateBulkDeleteMutation,
  useTemplateBulkUpdateMutation,
  useTemplateCopyMutation,
  useTemplateDeleteMutation,
  useTemplatesQuery,
} from '@/data/product-catalog/product-catalog.query';
import { productCatalogApi } from '@/data/product-catalog/product-catalog.api';
import type { ExportRequest, Template, TemplateListParams } from '@/data/product-catalog/product-catalog.types';
import { useExportExcel } from '@/hooks/useExportExcel';
import { MY_ROUTE } from '@/utils/constants/route.constant';
import { ExportType } from '@/utils/enums/common.enum';
import { templateAssetUrl as toStorageUrl } from './templateAssetUrl';
import { useQuery } from '@tanstack/react-query';
import type { ColumnDef, PaginationState, RowSelectionState } from '@tanstack/react-table';
import dayjs from 'dayjs';
import { ChevronDown, Copy, Download, Eye, Pencil, Plus, Trash2 } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { FieldLabel, QueryError, StatusBadge } from './TemplateUi';
import { getTemplateErrorMessage, useTemplateListState } from './templateUtils';

const parse = (params: URLSearchParams): TemplateListParams => ({
  page: Math.max(1, Number(params.get('page')) || 1),
  per_page: Math.max(1, Number(params.get('per_page')) || 10),
  template_name: params.get('template_name') || undefined,
  linked_product: params.get('linked_product') || undefined,
  specification: params.get('specification') || undefined,
  status: (params.get('status') as TemplateListParams['status']) || undefined,
  registrant: params.get('registrant') || undefined,
  last_modified_from: params.get('last_modified_from') || undefined,
  last_modified_to: params.get('last_modified_to') || undefined,
  sort_by: (params.get('sort_by') as TemplateListParams['sort_by']) || 'updated_at',
  sort_order: (params.get('sort_order') as TemplateListParams['sort_order']) || 'desc',
});

const getExportLocale = (language?: string): 'en' | 'ko' | 'ja' => {
  const code = (language || '').split('-')[0];
  if (code === 'kr' || code === 'ko') return 'ko';
  if (code === 'ja' || code === 'jp') return 'ja';
  return 'en';
};

export default function TemplateListPage() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation('template');
  const { t: tCommon } = useTranslation('common');
  const { state, update, reset } = useTemplateListState(parse);
  const query = useTemplatesQuery(state);
  const remove = useTemplateDeleteMutation();
  const bulkUpdate = useTemplateBulkUpdateMutation();
  const bulkDelete = useTemplateBulkDeleteMutation();
  const copyMutation = useTemplateCopyMutation();
  const [deleteId, setDeleteId] = useState<number>();
  const [copyId, setCopyId] = useState<number>();
  const [copyTitle, setCopyTitle] = useState('');
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const templateNameTimer = useRef<number | undefined>(undefined);
  const debounceTemplateName = (value: string) => {
    if (templateNameTimer.current) window.clearTimeout(templateNameTimer.current);
    templateNameTimer.current = window.setTimeout(() => update({ template_name: value }), 350);
  };

  useEffect(
    () => () => {
      if (templateNameTimer.current) window.clearTimeout(templateNameTimer.current);
    },
    [],
  );

  const preview = useQuery({
    queryKey: ['admin-template-copy-preview', copyId],
    queryFn: () => productCatalogApi.templates.copyPreview(copyId as number),
    enabled: !!copyId,
  });

  useEffect(() => {
    if (!copyId || !preview.data?.default_copy_title) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- seeds the editable draft from the async copy preview fetch
    setCopyTitle(String(preview.data.default_copy_title));
  }, [copyId, preview.data]);

  const exporter = useExportExcel<ExportRequest>({
    queryKey: 'template-export-progress',
    exportFn: productCatalogApi.templates.startExportResponse,
    progressFn: productCatalogApi.templates.exportProgressResponse,
    downloadFn: productCatalogApi.templates.downloadExport,
    exportFileName: 'templates',
    onSuccess: () => {
      toast.success(t('common.message.export_completed'));
      setRowSelection({});
    },
    onError: () => toast.error(t('common.message.export_failed')),
  });

  const openCopy = useCallback(
    (template: Template) => {
      setCopyId(template.id);
      setCopyTitle(t('template.message.copy_title', { name: template.name }));
    },
    [t],
  );

  const columns = useMemo<ColumnDef<Template>[]>(
    () => [
      {
        id: 'preview',
        header: t('common.field.preview'),
        meta: { width: '120px', align: 'center' },
        cell: ({ row }) => {
          const previewPath = row.original.preview_images?.[0] || row.original.front_preview_url;
          return previewPath ? (
            <img
              src={toStorageUrl(previewPath)}
              alt={row.original.name}
              loading='lazy'
              className='mx-auto h-16 w-24 rounded-md border bg-slate-50 object-contain'
            />
          ) : (
            <div className='mx-auto flex h-16 w-24 items-center justify-center rounded-md border border-dashed bg-slate-50 text-xs text-slate-400'>
              {t('template.message.no_preview')}
            </div>
          );
        },
      },
      {
        accessorKey: 'name',
        header: t('common.field.name'),
        cell: ({ row }) => (
          <button
            type='button'
            className='font-medium text-indigo-700 hover:underline'
            onClick={() => navigate(MY_ROUTE.PRODUCT.TEMPLATE_DETAIL(row.original.id))}>
            {row.original.name}
          </button>
        ),
      },
      {
        header: t('common.field.status'),
        cell: ({ row }) => (
          <StatusBadge
            active={row.original.is_active}
            activeText={t('common.status.active')}
            inactiveText={t('common.status.inactive')}
          />
        ),
      },
      {
        accessorKey: 'updated_at',
        header: t('common.field.last_modified'),
        cell: ({ getValue }) => (getValue() ? dayjs(String(getValue())).format('YYYY-MM-DD HH:mm') : '-'),
      },
      {
        id: 'actions',
        header: t('common.field.actions'),
        meta: { width: '150px', align: 'center' },
        cell: ({ row }) => (
          <div className='flex justify-center gap-1'>
            <Button
              variant='ghost'
              size='icon-sm'
              title={t('common.action.view')}
              onClick={() => navigate(MY_ROUTE.PRODUCT.TEMPLATE_DETAIL(row.original.id))}>
              <Eye />
            </Button>
            <Can action='register'>
              <Button variant='ghost' size='icon-sm' title={t('common.action.copy')} onClick={() => openCopy(row.original)}>
                <Copy />
              </Button>
            </Can>
            <Can action='edit'>
              <Button
                variant='ghost'
                size='icon-sm'
                title={t('common.action.edit')}
                onClick={() => navigate(MY_ROUTE.PRODUCT.TEMPLATE_EDIT(row.original.id))}>
                <Pencil />
              </Button>
            </Can>
            <Can action='delete'>
              <Button
                variant='ghost'
                size='icon-sm'
                title={t('common.action.delete')}
                onClick={() => setDeleteId(row.original.id)}>
                <Trash2 className='text-red-600' />
              </Button>
            </Can>
          </div>
        ),
      },
    ],
    [navigate, openCopy, t],
  );

  const pagination: PaginationState = {
    pageIndex: (state.page || 1) - 1,
    pageSize: state.per_page || 10,
  };
  const selectedIds = Object.keys(rowSelection)
    .filter((key) => rowSelection[key])
    .map(Number);
  const exportPayload = (scope: ExportRequest['export_type']): ExportRequest => {
    const { page, per_page, ...filters } = state;
    return {
      ...filters,
      export_type: scope,
      locale: getExportLocale(i18n.resolvedLanguage || i18n.language),
      ...(scope === 'CURRENT_PAGE' ? { current_page: page, per_page } : {}),
      ...(scope === 'SELECTED' ? { selected_ids: selectedIds } : {}),
    };
  };
  const handleExport = (scope: ExportType) => {
    exporter.handleExport(exportPayload(scope));
  };
  const updateSelectedStatus = (isActive: boolean) => {
    if (!selectedIds.length) return;
    bulkUpdate.mutate(
      { template_ids: selectedIds, field: 'is_active', value: isActive },
      {
        onSuccess: () => {
          toast.success(t('template.message.bulk_updated'));
          setRowSelection({});
        },
        onError: (error) => toast.error(getTemplateErrorMessage(error)),
      },
    );
  };

  return (
    <main className='space-y-6'>
      <PageTitle
        title={t('template.title.management')}
        extra={
          <div className='flex gap-2'>
            <ExportExcelButton isExporting={exporter.isExporting} onExport={handleExport} />
            <Can action='register'>
              <Button onClick={() => navigate(MY_ROUTE.PRODUCT.TEMPLATE_CREATE)}>
                <Plus /> {t('template.action.create')}
              </Button>
            </Can>
          </div>
        }
      />
      <FilterContainer onResetFilter={() => reset({ page: 1, per_page: 10, sort_by: 'updated_at', sort_order: 'desc' })}>
        <div className='grid gap-4 md:grid-cols-3 xl:grid-cols-4'>
          <div>
            <FieldLabel>{t('template.field.template_name')}</FieldLabel>
            <Input
              key={`template-name-${state.template_name || ''}`}
              defaultValue={state.template_name || ''}
              placeholder={t('template.placeholder.search_name')}
              onChange={(event) => debounceTemplateName(event.target.value)}
            />
          </div>
          <div>
            <FieldLabel>{t('common.field.status')}</FieldLabel>
            <AppSelect
              value={state.status}
              placeholder={t('template.placeholder.all_statuses')}
              onChange={(value) => update({ status: value })}
              options={[
                { value: 'active', label: t('common.status.active') },
                { value: 'inactive', label: t('common.status.inactive') },
              ]}
            />
          </div>
          <div>
            <FieldLabel>{t('template.field.modified_from')}</FieldLabel>
            <Input
              type='date'
              value={state.last_modified_from || ''}
              onChange={(event) => update({ last_modified_from: event.target.value })}
            />
          </div>
          <div>
            <FieldLabel>{t('template.field.modified_to')}</FieldLabel>
            <Input
              type='date'
              value={state.last_modified_to || ''}
              onChange={(event) => update({ last_modified_to: event.target.value })}
            />
          </div>
          <div>
            <FieldLabel>{t('template.field.sort_by')}</FieldLabel>
            <AppSelect
              value={state.sort_by}
              clearable={false}
              onChange={(value) => value && update({ sort_by: value })}
              options={[
                { value: 'name', label: t('template.sort.name') },
                { value: 'is_active', label: t('template.sort.status') },
                { value: 'updated_at', label: t('template.sort.last_modified') },
              ]}
            />
          </div>
          <div>
            <FieldLabel>{t('template.field.order')}</FieldLabel>
            <AppSelect
              value={state.sort_order}
              clearable={false}
              onChange={(value) => value && update({ sort_order: value })}
              options={[
                { value: 'desc', label: t('template.sort.descending') },
                { value: 'asc', label: t('template.sort.ascending') },
              ]}
            />
          </div>
        </div>
      </FilterContainer>
      {query.isError ? <QueryError message={getTemplateErrorMessage(query.error)} /> : null}
      {selectedIds.length ? (
        <div className='flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-white px-4 py-3'>
          <span className='text-sm font-medium'>{t('template.message.selected_count', { count: selectedIds.length })}</span>
          <div className='flex gap-2'>
            <Can action='edit'>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant='outline' disabled={bulkUpdate.isPending}>
                    {t('template.action.change_status')} <ChevronDown />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align='end'>
                  <DropdownMenuItem onClick={() => updateSelectedStatus(true)}>{t('common.status.active')}</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => updateSelectedStatus(false)}>{t('common.status.inactive')}</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </Can>
            <Button className='gap-2' disabled={exporter.isExporting} onClick={() => handleExport(ExportType.SELECTED)}>
              {exporter.isExporting ? <Spinner /> : <Download className='size-4' />}
              {tCommon('export.selected')}
            </Button>
            <Can action='delete'>
              <Button variant='destructive' disabled={bulkDelete.isPending} onClick={() => setBulkDeleteOpen(true)}>
                <Trash2 /> {t('template.action.delete_selected')}
              </Button>
            </Can>
          </div>
        </div>
      ) : null}
      <DataTable
        data={query.data?.items || []}
        columns={columns}
        totalRows={query.data?.total || 0}
        isLoading={query.isLoading}
        pagination={pagination}
        onPaginationChange={(next) => {
          const value = typeof next === 'function' ? next(pagination) : next;
          update({ page: value.pageIndex + 1, per_page: value.pageSize }, false);
        }}
        enableRowSelection
        rowSelection={rowSelection}
        onRowSelectionChange={setRowSelection}
        getRowId={(row) => String(row.id)}
      />

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(undefined)}
        title={t('template.title.delete')}
        description={t('common.message.delete_irreversible')}
        variant='destructive'
        isLoading={remove.isPending}
        onConfirm={() => {
          if (!deleteId) return;
          remove.mutate(deleteId, {
            onSuccess: () => {
              toast.success(t('template.message.deleted'));
              setDeleteId(undefined);
            },
            onError: (error) => toast.error(getTemplateErrorMessage(error)),
          });
        }}
      />

      <ConfirmDialog
        open={bulkDeleteOpen}
        onOpenChange={setBulkDeleteOpen}
        title={t('template.title.delete_selected')}
        description={t('template.message.delete_selected_confirm', { count: selectedIds.length })}
        variant='destructive'
        isLoading={bulkDelete.isPending}
        onConfirm={() => {
          if (!selectedIds.length) return;
          bulkDelete.mutate(
            { template_ids: selectedIds },
            {
              onSuccess: () => {
                toast.success(t('template.message.deleted'));
                setRowSelection({});
                setBulkDeleteOpen(false);
              },
              onError: (error) => toast.error(getTemplateErrorMessage(error)),
            },
          );
        }}
      />

      <AppDialog
        open={!!copyId}
        onOpenChange={(open) => !open && setCopyId(undefined)}
        title={t('template.title.copy')}
        description={String(preview.data?.title || '')}
        textOk={t('common.action.copy')}
        loading={copyMutation.isPending}
        onOk={() => {
          if (!copyId || !copyTitle.trim()) return;
          copyMutation.mutate(
            { id: copyId, copy_title: copyTitle.trim(), copy_layers: true },
            {
              onSuccess: () => {
                toast.success(t('template.message.copied'));
                setCopyId(undefined);
              },
              onError: (error) => toast.error(getTemplateErrorMessage(error)),
            },
          );
        }}>
        <div className='space-y-4'>
          <div>
            <FieldLabel required>{t('template.field.copy_title')}</FieldLabel>
            <Input value={copyTitle} onChange={(event) => setCopyTitle(event.target.value)} />
          </div>
        </div>
      </AppDialog>
    </main>
  );
}
