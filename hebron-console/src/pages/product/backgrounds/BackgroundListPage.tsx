import Can from '@/components/Can';
import ConfirmDialog from '@/components/dialog/ConfirmDialog';
import PageTitle from '@/components/PageTitle';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Spinner } from '@/components/ui/spinner';
import {
  useBackgroundBulkDeleteMutation,
  useBackgroundCreateMutation,
  useBackgroundsQuery,
} from '@/data/background/background.query';
import type { BackgroundDeleteBlocker, BackgroundListParams } from '@/data/background/background.types';
import { uploadFileAPI } from '@/data/file/file.api';
import { cn } from '@/lib/utils';
import { FileType } from '@/utils/enums/file.enum';
import { getErrorMessage } from '@/utils/helper/noti-error.helper';
import { toStorageUrl } from '@/utils/helper/storage-url.helper';
import { isAxiosError } from 'axios';
import { ImagePlus, Trash2 } from 'lucide-react';
import { useMemo, useRef, useState, type ChangeEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

const ACCEPT = 'image/jpeg,image/png,image/webp';
const MAX_SIZE = 50 * 1024 * 1024;

const initialFilters: BackgroundListParams = {
  page: 1,
  per_page: 20,
  sort_by: 'created_at',
  sort_order: 'desc',
};

const blockersFromError = (error: unknown): BackgroundDeleteBlocker[] => {
  if (!isAxiosError(error)) return [];
  const blockers = error.response?.data?.errors?.backgrounds;
  return Array.isArray(blockers) ? blockers : [];
};

export default function BackgroundListPage() {
  const { t } = useTranslation('product');
  const { t: tCommon } = useTranslation('common');
  const [filters, setFilters] = useState(initialFilters);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [blockers, setBlockers] = useState<BackgroundDeleteBlocker[]>([]);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const query = useBackgroundsQuery(filters);
  const create = useBackgroundCreateMutation();
  const bulkDelete = useBackgroundBulkDeleteMutation();
  const items = query.data?.items || [];
  const allPageSelected = items.length > 0 && items.every((item) => selectedIds.includes(item.id));
  const somePageSelected = items.some((item) => selectedIds.includes(item.id));
  const selectedCount = selectedIds.length;
  const busy = uploading || create.isPending || bulkDelete.isPending;

  const changePage = (page: number) => {
    setFilters((current) => ({ ...current, page }));
    setSelectedIds([]);
  };

  const toggle = (id: number) => {
    setSelectedIds((current) => (current.includes(id) ? current.filter((value) => value !== id) : [...current, id]));
  };

  const upload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      toast.error(t('background.message.invalid_type'));
      return;
    }
    if (file.size > MAX_SIZE) {
      toast.error(t('background.message.too_large'));
      return;
    }

    setUploading(true);
    try {
      const response = await uploadFileAPI(file, FileType.BACKGROUNDS);
      const uploaded = response.data?.file;
      if (!uploaded?.path) throw new Error(t('background.message.upload_failed'));
      await create.mutateAsync({ image_path: uploaded.path });
      toast.success(t('background.message.created'));
    } catch (error) {
      toast.error(getErrorMessage(error, t('background.message.upload_failed')));
    } finally {
      setUploading(false);
    }
  };

  const confirmDelete = () => {
    bulkDelete.mutate(selectedIds, {
      onSuccess: () => {
        toast.success(t('background.message.deleted'));
        setSelectedIds([]);
        setDeleteOpen(false);
        setBlockers([]);
      },
      onError: (error) => {
        const dependencies = blockersFromError(error);
        setDeleteOpen(false);
        if (dependencies.length) setBlockers(dependencies);
        else toast.error(getErrorMessage(error, t('background.message.delete_failed')));
      },
    });
  };

  const blockerText = useMemo(
    () =>
      blockers
        .map((background) => {
          const names = background.templates.map((template) => template.name).join(', ');
          return `• ${names}`;
        })
        .join('\n'),
    [blockers],
  );

  return (
    <main className='space-y-6'>
      <PageTitle
        title={t('background.title')}
        extra={
          <>
            <Can action='register'>
              <Button onClick={() => inputRef.current?.click()} disabled={busy}>
                {uploading || create.isPending ? <Spinner /> : <ImagePlus />}
                {t('background.action.add')}
              </Button>
            </Can>
            <input ref={inputRef} hidden type='file' accept={ACCEPT} onChange={upload} />
          </>
        }
      />

      <section className='flex items-center justify-between gap-3 rounded-lg border bg-slate-50 p-3'>
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
        <Can action='delete'>
          <Button variant='destructive' size='sm' disabled={busy || selectedCount === 0} onClick={() => setDeleteOpen(true)}>
            <Trash2 /> {tCommon('button.delete')}
          </Button>
        </Can>
      </section>

      {query.isLoading ? (
        <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className='aspect-[4/3] animate-pulse rounded-lg bg-slate-100' />
          ))}
        </div>
      ) : query.isError ? (
        <div className='rounded-lg border p-10 text-center text-sm text-red-600'>
          {getErrorMessage(query.error, t('background.message.load_failed'))}
        </div>
      ) : items.length ? (
        <section className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
          {items.map((item) => {
            const selected = selectedIds.includes(item.id);
            return (
              <button
                key={item.id}
                type='button'
                aria-pressed={selected}
                onClick={() => toggle(item.id)}
                className={cn(
                  'group relative aspect-[4/3] overflow-hidden rounded-xl border-2 bg-slate-100 text-left shadow-sm transition hover:border-indigo-300 hover:shadow-md',
                  selected ? 'border-indigo-600 ring-2 ring-indigo-100' : 'border-transparent',
                )}>
                <img
                  src={toStorageUrl(item.image_url || item.image_path)}
                  alt='Background'
                  loading='lazy'
                  className='h-full w-full object-contain transition group-hover:scale-[1.02]'
                />
              </button>
            );
          })}
        </section>
      ) : (
        <div className='rounded-lg border border-dashed p-16 text-center text-sm text-slate-500'>
          {t('background.message.empty')}
        </div>
      )}

      <footer className='flex flex-col items-center justify-between gap-3 sm:flex-row'>
        <span className='text-muted-foreground text-sm'>
          {t('background.pagination.total', { count: query.data?.total || 0 })}
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

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title={t('background.delete.title')}
        description={t('background.delete.description', { count: selectedCount })}
        onConfirm={confirmDelete}
        isLoading={bulkDelete.isPending}
        variant='destructive'
      />

      <ConfirmDialog
        open={blockers.length > 0}
        onOpenChange={(open) => !open && setBlockers([])}
        title={t('background.delete.blocked_title')}
        description={`${t('background.delete.blocked_description')}\n${blockerText}`}
        confirmLabel={tCommon('button.close')}
        onConfirm={() => setBlockers([])}
      />
    </main>
  );
}
