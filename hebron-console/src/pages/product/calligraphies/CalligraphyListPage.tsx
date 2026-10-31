import Can from '@/components/Can';
import PageTitle from '@/components/PageTitle';
import ConfirmDialog from '@/components/dialog/ConfirmDialog';
import AppDialog from '@/components/dialog/AppDialog';
import AppSelect from '@/components/select/AppSelect';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import {
  useCalligraphiesQuery,
  useCalligraphyBulkDeleteMutation,
  useCalligraphyBulkUpdateMutation,
  useCalligraphyCreateMutation,
  useCalligraphyUpdateMutation,
} from '@/data/calligraphy/calligraphy.query';
import {
  CALLIGRAPHY_TYPES,
  type Calligraphy,
  type CalligraphyListParams,
  type CalligraphyType,
} from '@/data/calligraphy/calligraphy.types';
import { uploadFileAPI } from '@/data/file/file.api';
import useDebounce from '@/hooks/useDebounce';
import { cn } from '@/lib/utils';
import { FileType } from '@/utils/enums/file.enum';
import { getErrorMessage } from '@/utils/helper/noti-error.helper';
import { toStorageUrl } from '@/utils/helper/storage-url.helper';
import { ImagePlus, Pencil, Trash2, Upload, X } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

const ACCEPT = 'image/jpeg,image/png,image/webp';
const MAX_SIZE = 10 * 1024 * 1024;
const initialFilters: CalligraphyListParams = {
  type: 'calligraphy',
  page: 1,
  per_page: 20,
  sort_by: 'created_at',
  sort_order: 'desc',
};

export default function CalligraphyListPage() {
  const { t } = useTranslation('product');
  const { t: tCommon } = useTranslation('common');
  const [filters, setFilters] = useState(initialFilters);
  const [searchInput, setSearchInput] = useState('');
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState<Calligraphy | null>(null);
  const [type, setType] = useState<CalligraphyType>('calligraphy');
  const [files, setFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [texts, setTexts] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const previewUrlsRef = useRef<string[]>([]);

  const query = useCalligraphiesQuery(filters);
  const create = useCalligraphyCreateMutation();
  const update = useCalligraphyUpdateMutation();
  const bulkUpdate = useCalligraphyBulkUpdateMutation();
  const bulkDelete = useCalligraphyBulkDeleteMutation();
  const items = query.data?.items || [];
  const selectedCount = selectedIds.length;
  const allPageSelected = items.length > 0 && items.every((item) => selectedIds.includes(item.id));
  const somePageSelected = items.some((item) => selectedIds.includes(item.id));
  const busy = saving || create.isPending || update.isPending || bulkUpdate.isPending || bulkDelete.isPending;
  const typeOptions = useMemo(() => CALLIGRAPHY_TYPES.map((value) => ({ value, label: t(`calligraphy.type.${value}`) })), [t]);

  const applySearch = useCallback((value: string) => {
    setFilters((current) => ({ ...current, search: value.trim() || undefined, page: 1 }));
    setSelectedIds([]);
  }, []);

  useDebounce(searchInput, applySearch);

  useEffect(() => {
    previewUrlsRef.current = previewUrls;
  }, [previewUrls]);

  useEffect(
    () => () => {
      previewUrlsRef.current.forEach((url) => {
        if (url.startsWith('blob:')) URL.revokeObjectURL(url);
      });
    },
    [],
  );

  const closeEditor = () => {
    previewUrlsRef.current.forEach((url) => {
      if (url.startsWith('blob:')) URL.revokeObjectURL(url);
    });
    setEditorOpen(false);
    setEditing(null);
    setFiles([]);
    setPreviewUrls([]);
    setTexts([]);
  };

  const openCreate = () => {
    setEditing(null);
    setType('calligraphy');
    setFiles([]);
    setPreviewUrls([]);
    setTexts([]);
    setEditorOpen(true);
  };

  const openEdit = (item: Calligraphy) => {
    setEditing(item);
    setType(item.type);
    setFiles([]);
    setPreviewUrls([toStorageUrl(item.image_url || item.image_path)]);
    setTexts([item.text || '']);
    setEditorOpen(true);
  };

  const selectFiles = (event: ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(event.target.files || []);
    event.target.value = '';
    if (!selected.length) return;
    if (selected.some((file) => !['image/jpeg', 'image/png', 'image/webp'].includes(file.type))) {
      toast.error(t('calligraphy.message.invalid_type'));
      return;
    }
    if (selected.some((file) => file.size > MAX_SIZE)) {
      toast.error(t('calligraphy.message.too_large'));
      return;
    }
    const next = editing ? selected.slice(0, 1) : selected;
    previewUrlsRef.current.forEach((url) => {
      if (url.startsWith('blob:')) URL.revokeObjectURL(url);
    });
    setFiles(next);
    setPreviewUrls(next.map((file) => URL.createObjectURL(file)));
    setTexts(next.map((_, index) => (editing && index === 0 ? editing.text || '' : '')));
  };

  const removePreview = (index: number) => {
    const removedUrl = previewUrlsRef.current[index];
    if (removedUrl?.startsWith('blob:')) URL.revokeObjectURL(removedUrl);
    setFiles((current) => current.filter((_, fileIndex) => fileIndex !== index));
    setPreviewUrls((current) => current.filter((_, previewIndex) => previewIndex !== index));
    setTexts((current) => current.filter((_, textIndex) => textIndex !== index));
  };

  const save = async () => {
    setSaving(true);
    try {
      if (editing) {
        let imagePath = editing.image_path;
        if (files[0]) {
          const response = await uploadFileAPI(files[0], FileType.CALLIGRAPHIES);
          imagePath = response.data.file.path;
        }
        await update.mutateAsync({
          id: editing.id,
          payload: { image_path: imagePath, type, text: texts[0]?.trim() || null },
        });
        toast.success(t('calligraphy.message.updated'));
      } else {
        if (!files.length) return;
        const uploads = await Promise.all(files.map((file) => uploadFileAPI(file, FileType.CALLIGRAPHIES)));
        await Promise.all(
          uploads.map((response, index) =>
            create.mutateAsync({ image_path: response.data.file.path, type, text: texts[index]?.trim() || null }),
          ),
        );
        toast.success(t('calligraphy.message.created_multiple', { count: files.length }));
      }
      closeEditor();
    } catch (error) {
      toast.error(getErrorMessage(error, t('calligraphy.message.save_failed')));
    } finally {
      setSaving(false);
    }
  };

  const changeBulkType = (value?: CalligraphyType) => {
    if (!value || !selectedIds.length) return;
    bulkUpdate.mutate(
      { ids: selectedIds, value },
      {
        onSuccess: () => {
          toast.success(t('calligraphy.message.bulk_updated'));
          setSelectedIds([]);
        },
        onError: (error) => toast.error(getErrorMessage(error, t('calligraphy.message.bulk_update_failed'))),
      },
    );
  };

  const confirmDelete = () => {
    bulkDelete.mutate(selectedIds, {
      onSuccess: () => {
        toast.success(t('calligraphy.message.deleted'));
        setSelectedIds([]);
        setDeleteOpen(false);
      },
      onError: (error) => toast.error(getErrorMessage(error, t('calligraphy.message.delete_failed'))),
    });
  };

  const changePage = (page: number) => {
    setFilters((current) => ({ ...current, page }));
    setSelectedIds([]);
  };

  return (
    <main className='space-y-6'>
      <PageTitle
        title={t('calligraphy.title')}
        extra={
          <Can action='register'>
            <Button onClick={openCreate} disabled={busy}>
              <ImagePlus /> {t('calligraphy.action.add')}
            </Button>
          </Can>
        }
      />

      <section className='rounded-lg border bg-white p-4'>
        <div className='grid max-w-3xl gap-4 md:grid-cols-2'>
          <div>
            <p className='mb-2 text-sm font-medium'>{t('calligraphy.filter.search')}</p>
            <Input
              value={searchInput}
              placeholder={t('calligraphy.filter.search_placeholder')}
              onChange={(event) => setSearchInput(event.target.value)}
            />
          </div>
          <div>
            <p className='mb-2 text-sm font-medium'>{t('calligraphy.filter.type')}</p>
            <AppSelect
              value={filters.type}
              options={typeOptions}
              clearable={false}
              onChange={(value) => {
                if (!value) return;
                setFilters((current) => ({ ...current, type: value, page: 1 }));
                setSelectedIds([]);
              }}
            />
          </div>
        </div>
      </section>

      <section className='flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-slate-50 p-3'>
        <div className='flex items-center gap-2'>
          <Checkbox
            checked={allPageSelected || (somePageSelected && 'indeterminate')}
            onCheckedChange={(checked) =>
              setSelectedIds((current) =>
                checked
                  ? Array.from(new Set([...current, ...items.map((item) => item.id)]))
                  : current.filter((id) => !items.some((item) => item.id === id)),
              )
            }
          />
          <span className='text-sm font-medium'>{tCommon('label.selected_count', { count: selectedCount })}</span>
        </div>
        <div className='flex items-center gap-2'>
          <Can action='edit'>
            <AppSelect
              value={undefined}
              options={typeOptions}
              placeholder={t('calligraphy.action.change_type')}
              disabled={busy || !selectedCount}
              clearable={false}
              onChange={changeBulkType}
              className='w-56'
            />
          </Can>
          <Can action='delete'>
            <Button variant='destructive' size='sm' disabled={busy || !selectedCount} onClick={() => setDeleteOpen(true)}>
              <Trash2 /> {tCommon('button.delete')}
            </Button>
          </Can>
        </div>
      </section>

      {query.isLoading ? (
        <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className='aspect-[4/3] animate-pulse rounded-lg bg-slate-100' />
          ))}
        </div>
      ) : query.isError ? (
        <div className='rounded-lg border p-10 text-center text-sm text-red-600'>
          {getErrorMessage(query.error, t('calligraphy.message.load_failed'))}
        </div>
      ) : items.length ? (
        <section className='grid gap-4 sm:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8'>
          {items.map((item) => {
            const selected = selectedIds.includes(item.id);
            return (
              <div
                key={item.id}
                role='button'
                tabIndex={0}
                aria-pressed={selected}
                onClick={() =>
                  setSelectedIds((current) => (selected ? current.filter((id) => id !== item.id) : [...current, item.id]))
                }
                onKeyDown={(event) =>
                  event.key === 'Enter' &&
                  setSelectedIds((current) => (selected ? current.filter((id) => id !== item.id) : [...current, item.id]))
                }
                className={cn(
                  'group relative aspect-[4/3] cursor-pointer overflow-hidden rounded-xl border-2 bg-slate-300 shadow-sm transition hover:border-indigo-300 hover:shadow-md',
                  selected ? 'border-indigo-600 ring-2 ring-indigo-100' : 'border-transparent',
                )}>
                <img
                  src={toStorageUrl(item.image_url || item.image_path)}
                  alt={item.type_label}
                  loading='lazy'
                  className='size-full object-contain p-2'
                />
                <Can action='edit'>
                  <Button
                    type='button'
                    variant='secondary'
                    size='icon-sm'
                    className='absolute top-2 right-2 opacity-0 shadow-sm transition-opacity group-hover:opacity-100 focus:opacity-100'
                    aria-label={tCommon('button.edit')}
                    onClick={(event) => {
                      event.stopPropagation();
                      openEdit(item);
                    }}>
                    <Pencil />
                  </Button>
                </Can>
              </div>
            );
          })}
        </section>
      ) : (
        <div className='rounded-lg border border-dashed p-16 text-center text-sm text-slate-500'>
          {t('calligraphy.message.empty')}
        </div>
      )}

      <footer className='flex flex-col items-center justify-between gap-3 sm:flex-row'>
        <span className='text-muted-foreground text-sm'>
          {t('calligraphy.pagination.total', { count: query.data?.total || 0 })}
        </span>
        <div className='flex items-center gap-2'>
          <Button variant='outline' size='sm' disabled={filters.page <= 1} onClick={() => changePage(filters.page - 1)}>
            {tCommon('pagination.previous')}
          </Button>
          <span className='min-w-20 text-center text-sm'>
            {filters.page} / {query.data?.totalPages || 1}
          </span>
          <Button
            variant='outline'
            size='sm'
            disabled={filters.page >= (query.data?.totalPages || 1)}
            onClick={() => changePage(filters.page + 1)}>
            {tCommon('pagination.next')}
          </Button>
        </div>
      </footer>

      <AppDialog
        open={editorOpen}
        onOpenChange={(open) => (open ? setEditorOpen(true) : closeEditor())}
        title={t(editing ? 'calligraphy.editor.edit_title' : 'calligraphy.editor.create_title')}
        onOk={save}
        loading={saving || create.isPending || update.isPending}
        okDisabled={!previewUrls.length}>
        <div className='space-y-4'>
          <div>
            <p className='mb-2 text-sm font-medium'>{t('calligraphy.editor.image')}</p>
            <div
              role='button'
              tabIndex={0}
              onClick={() => inputRef.current?.click()}
              onKeyDown={(event) => event.key === 'Enter' && inputRef.current?.click()}
              className={cn(
                'flex w-full cursor-pointer items-center justify-center rounded-lg border border-dashed border-slate-400 bg-slate-200',
                previewUrls.length ? 'max-h-[430px] min-h-72 overflow-y-auto' : 'aspect-[4/3] overflow-hidden',
              )}>
              {previewUrls.length ? (
                <div className={cn('grid min-h-full w-full content-start gap-3 p-3', editing ? 'grid-cols-1' : 'grid-cols-3')}>
                  {previewUrls.map((url, index) => (
                    <div
                      key={`${url}-${index}`}
                      className='relative overflow-hidden rounded-md border border-slate-400 bg-slate-300 p-2 shadow-sm'>
                      <img src={url} alt='' className={cn('w-full object-contain', editing ? 'h-56' : 'aspect-square')} />
                      {previewUrls.length > 1 ? (
                        <span className='absolute top-1 left-1 rounded bg-slate-900/70 px-1.5 py-0.5 text-[10px] leading-none text-white'>
                          {index + 1}
                        </span>
                      ) : null}
                      <Button
                        type='button'
                        variant='destructive'
                        size='icon-sm'
                        className='absolute top-1 right-1 size-6 rounded-full shadow-sm'
                        aria-label={tCommon('button.delete')}
                        title={tCommon('button.delete')}
                        onClick={(event) => {
                          event.stopPropagation();
                          removePreview(index);
                        }}>
                        <X className='size-3.5' />
                      </Button>
                      <Input
                        value={texts[index] || ''}
                        maxLength={500}
                        placeholder={t('calligraphy.editor.text_placeholder')}
                        className='mt-2 bg-white'
                        onClick={(event) => event.stopPropagation()}
                        onKeyDown={(event) => event.stopPropagation()}
                        onChange={(event) =>
                          setTexts((current) =>
                            current.map((value, textIndex) => (textIndex === index ? event.target.value : value)),
                          )
                        }
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <span className='flex items-center gap-2 text-sm text-slate-500'>
                  <Upload /> {t('calligraphy.action.upload')}
                </span>
              )}
            </div>
            <input ref={inputRef} hidden type='file' accept={ACCEPT} multiple={!editing} onChange={selectFiles} />
          </div>
          <div>
            <p className='mb-2 text-sm font-medium'>{t('calligraphy.editor.type')}</p>
            <AppSelect value={type} options={typeOptions} clearable={false} onChange={(value) => value && setType(value)} />
          </div>
        </div>
      </AppDialog>

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title={t('calligraphy.delete.title')}
        description={t('calligraphy.delete.description', { count: selectedCount })}
        onConfirm={confirmDelete}
        isLoading={bulkDelete.isPending}
        variant='destructive'
      />
      {busy && bulkUpdate.isPending ? <Spinner className='fixed right-6 bottom-6' /> : null}
    </main>
  );
}
