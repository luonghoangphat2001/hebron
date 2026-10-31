import AppDialog from '@/components/dialog/AppDialog';
import ConfirmDialog from '@/components/dialog/ConfirmDialog';
import FormItem from '@/components/form/FormItem';
import { appToast } from '@/components/toast/AppToast';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { normalizeSlug, toSlug } from '@/data/media/media.service';
import { cn } from '@/lib/utils';
import { STATUS_BADGE } from '@/utils/constants/common.constant';
import { Status } from '@/utils/enums/common.enum';
import { zodResolver } from '@hookform/resolvers/zod';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useRef, useState, type ChangeEvent } from 'react';
import { Controller, useForm, type Resolver } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';

const categoryManageSchema = z.object({
  name: z.string().trim().min(1, 'Category name is required'),
  slug: z.string().trim().optional(),
  sort_order: z.coerce.number().default(0),
  is_active: z.boolean().default(true),
});

export type CategoryManageInput = z.infer<typeof categoryManageSchema>;

export type CategoryManageItem = {
  id: number;
  name: string;
  slug?: string | null;
  sort_order?: number;
  is_active?: boolean;
};

type MutationOptions = {
  onSuccess: () => void;
  onError: (err: any) => void;
};

export type CategoryManageModalProps = {
  open: boolean;
  setOpen: (value: boolean) => void;
  title: string;
  addButtonText?: string;
  categories: CategoryManageItem[];
  isLoading: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  onCreate: (body: CategoryManageInput, options: MutationOptions) => void;
  onUpdate: (id: number, body: CategoryManageInput, options: MutationOptions) => void;
  onDelete: (id: number, options: MutationOptions) => void;
};

const handleSlugChange = (e: ChangeEvent<HTMLInputElement>, onChange: (value: string) => void) => {
  const el = e.target;
  const typed = el.value;
  const next = normalizeSlug(typed);
  onChange(next);

  if (next === typed) return;
  const caret = (el.selectionStart ?? typed.length) + next.length - typed.length;
  requestAnimationFrame(() => el.setSelectionRange(caret, caret));
};

const DEFAULT_FORM: CategoryManageInput = {
  name: '',
  slug: '',
  sort_order: 0,
  is_active: true,
};

const CategoryManageModal = ({
  open,
  setOpen,
  title,
  addButtonText,
  categories,
  isLoading,
  isCreating,
  isUpdating,
  isDeleting,
  onCreate,
  onUpdate,
  onDelete,
}: CategoryManageModalProps) => {
  const { t: tContent } = useTranslation('content');
  const { t: tCommon } = useTranslation('common');
  const { t: tEnum } = useTranslation('enum');

  const [editing, setEditing] = useState<CategoryManageItem | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const formRef = useRef<HTMLDivElement>(null);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<CategoryManageInput>({
    mode: 'onChange',
    defaultValues: DEFAULT_FORM,
    resolver: zodResolver(categoryManageSchema) as Resolver<CategoryManageInput>,
  });

  const openCreateForm = () => {
    setEditing(null);
    const nextSortOrder = categories.reduce((max, c) => Math.max(max, c.sort_order ?? 0), -1) + 1;
    reset({ ...DEFAULT_FORM, sort_order: nextSortOrder });
    setIsFormOpen(true);
  };

  const openEditForm = (category: CategoryManageItem) => {
    setEditing(category);
    reset({
      name: category.name,
      slug: category.slug ?? '',
      sort_order: category.sort_order ?? 0,
      is_active: category.is_active ?? true,
    });
    setIsFormOpen(true);
    requestAnimationFrame(() => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  };

  const onSave = (input: CategoryManageInput) => {
    if (isCreating || isUpdating) return;

    const slug = input.slug?.trim() ? toSlug(input.slug) : undefined;
    const body: CategoryManageInput = {
      ...input,
      name: input.name.trim(),
      slug,
      sort_order: Number(input.sort_order) || 0,
    };

    if (editing) {
      onUpdate(editing.id, body, {
        onSuccess: () => {
          setIsFormOpen(false);
          setEditing(null);
          appToast.success(tCommon('notify.success_update'));
        },
        onError: (error) => appToast.error(error?.response?.data?.message || tCommon('notify.fail_update')),
      });
      return;
    }

    onCreate(body, {
      onSuccess: () => {
        setIsFormOpen(false);
        appToast.success(tCommon('notify.success_create'));
      },
      onError: (error) => appToast.error(error?.response?.data?.message || tCommon('notify.fail_create')),
    });
  };

  const confirmDelete = () => {
    if (!deleteId || isDeleting) return;
    onDelete(deleteId, {
      onSuccess: () => {
        setDeleteId(null);
        appToast.success(tCommon('notify.success_delete'));
      },
      onError: (error) => {
        appToast.error(error?.response?.data?.message || tCommon('notify.fail_delete'));
      },
    });
  };

  return (
    <>
      <AppDialog open={open} onOpenChange={setOpen} title={title} textCancel={tCommon('button.close')} className='sm:max-w-175'>
        <div className='space-y-4'>
          <div className='flex items-end justify-end gap-4'>
            <Button type='button' size='sm' disabled={isFormOpen || isLoading} onClick={openCreateForm}>
              <Plus className='h-4 w-4' /> {addButtonText || tContent('media.add_category')}
            </Button>
          </div>

          {isFormOpen && (
            <div ref={formRef} className='bg-muted/20 space-y-4 rounded-lg border p-4'>
              <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
                <FormItem label={tContent('media.field_category_name')} required error={errors.name?.message}>
                  <Controller
                    control={control}
                    name='name'
                    render={({ field }) => <Input {...field} placeholder={tContent('media.ph_category_name')} />}
                  />
                </FormItem>
                <FormItem label={tContent('media.field_slug')} error={errors.slug?.message}>
                  <Controller
                    control={control}
                    name='slug'
                    render={({ field }) => (
                      <Input
                        {...field}
                        placeholder={tContent('media.ph_slug')}
                        onChange={(e) => handleSlugChange(e, field.onChange)}
                      />
                    )}
                  />
                </FormItem>
                {/* <FormItem label={tContent('media.field_sort_order')} error={errors.sort_order?.message}>
                  <Controller
                    control={control}
                    name='sort_order'
                    render={({ field }) => (
                      <Input
                        type='number'
                        min={0}
                        step={1}
                        {...field}
                        onChange={(e) => handleNumberInputChange(e, field.onChange)}
                      />
                    )}
                  />
                </FormItem> */}
              </div>

              <FormItem label={tContent('media.field_is_active')}>
                <Controller
                  control={control}
                  name='is_active'
                  render={({ field }) => <Switch checked={field.value} onCheckedChange={field.onChange} />}
                />
              </FormItem>

              <div className='flex justify-end gap-2'>
                <Button type='button' variant='outline' size='sm' onClick={() => setIsFormOpen(false)}>
                  {tCommon('button.cancel')}
                </Button>
                <Button
                  type='button'
                  size='sm'
                  loading={isCreating || isUpdating}
                  disabled={!!editing && !isDirty}
                  onClick={handleSubmit(onSave)}>
                  {tCommon('button.save')}
                </Button>
              </div>
            </div>
          )}

          <Separator />

          {isLoading ? (
            <div className='space-y-2'>
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className='flex items-center justify-between gap-3 rounded-lg border p-3'>
                  <div className='w-full space-y-2'>
                    <Skeleton className='h-4 w-40' />
                    <Skeleton className='h-3 w-24' />
                  </div>
                  <div className='flex shrink-0 items-center gap-2'>
                    <Skeleton className='h-5 w-14 rounded-sm' />
                    <Skeleton className='size-8 rounded-md' />
                    <Skeleton className='size-8 rounded-md' />
                  </div>
                </div>
              ))}
            </div>
          ) : categories.length === 0 ? (
            <p className='text-muted-foreground py-6 text-center text-sm'>{tContent('media.empty_category')}</p>
          ) : (
            <div className='space-y-2'>
              {categories.map((category) => (
                <div
                  key={category.id}
                  className='hover:bg-muted/30 flex items-center justify-between gap-3 rounded-lg border p-3 transition-colors'>
                  <div className='min-w-0'>
                    <p className='truncate text-sm font-semibold'>{category.name}</p>
                    {category.slug && <p className='text-muted-foreground truncate font-mono text-xs'>{category.slug}</p>}
                  </div>
                  <div className='flex shrink-0 items-center gap-2'>
                    {/* <span className='text-muted-foreground font-mono text-xs'>#{category.sort_order ?? 0}</span> */}
                    <Badge className={cn(STATUS_BADGE[category.is_active !== false ? Status.ACTIVE : Status.INACTIVE])}>
                      {tEnum(category.is_active !== false ? 'common.ACTIVE' : 'common.INACTIVE')}
                    </Badge>
                    <Button type='button' size='icon-sm' variant='ghost' onClick={() => openEditForm(category)}>
                      <Pencil className='h-3.5 w-3.5' />
                    </Button>
                    <Button
                      type='button'
                      size='icon-sm'
                      variant='ghost'
                      className='text-muted-foreground hover:text-destructive'
                      onClick={() => setDeleteId(category.id)}>
                      <Trash2 className='h-3.5 w-3.5' />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </AppDialog>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(value) => !value && setDeleteId(null)}
        title={tContent('media.confirm_delete_category_title')}
        description={tContent('media.confirm_delete_category_desc')}
        onConfirm={confirmDelete}
        isLoading={isDeleting}
        variant='destructive'
      />
    </>
  );
};

export default CategoryManageModal;
