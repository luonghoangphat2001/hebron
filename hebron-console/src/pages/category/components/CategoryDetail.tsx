import Can from '@/components/Can';
import ConfirmDialog from '@/components/dialog/ConfirmDialog';
import { DateRangePicker } from '@/components/date-picker/DateRangePicker';
import FormItem from '@/components/form/FormItem';
import AppSelect from '@/components/select/AppSelect';
import { appToast } from '@/components/toast/AppToast';
import AppUpload from '@/components/upload/AppUpload';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import {
  useCategoryDeleteMutation,
  useCategoryDetailQuery,
  useCategoryExposureUpdateMutation,
  useCategoryUpdateMutation,
} from '@/data/category/category.query';
import { resolveExposureImageUrl, slugifyCategoryName } from '@/data/category/category.service';
import { DATE_FORMAT } from '@/utils/constants/date.constant';
import { CategoryLevels, CategoryStatus } from '@/utils/enums/category.enum';
import { getErrorMessage } from '@/utils/helper/noti-error.helper';
import dayjs from 'dayjs';
import { Layers, Loader2, Plus, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import type { DateRange } from 'react-day-picker';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import CategoryProductGrid from './CategoryProductGrid';

type EditBasicForm = {
  name: string;
  name_en: string;
  slug: string;
  description: string;
  subtitle: string;
  status: CategoryStatus | undefined;
};

type EditExposureForm = {
  exposure_order: string;
  icon_image: string | File;
  banner_image: string | File;
  expose_date_range: DateRange | undefined;
};

type Props = {
  categoryId: number | null;
  onDeleted: () => void;
  onAddSub: () => void;
};

const CategoryDetail = ({ categoryId, onDeleted, onAddSub }: Props) => {
  const { t: tCategory } = useTranslation('category');
  const { t: tCommon } = useTranslation('common');
  const { t: tEnum } = useTranslation('enum');

  const { data, isLoading } = useCategoryDetailQuery(categoryId ?? undefined);
  const category = data?.category ?? null;

  const [searchParams, setSearchParams] = useSearchParams();
  const tab = searchParams.get('tab') === 'products' ? 'products' : 'info';

  const handleTabChange = (value: string) => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.set('tab', value);
        return next;
      },
      { replace: true },
    );
  };

  const [isEditingBasic, setIsEditingBasic] = useState(false);
  const [isEditingExposure, setIsEditingExposure] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isSavingExposure, setIsSavingExposure] = useState(false);

  const [basicForm, setBasicForm] = useState<EditBasicForm>({
    name: '',
    name_en: '',
    slug: '',
    description: '',
    subtitle: '',
    status: undefined,
  });

  const [exposureForm, setExposureForm] = useState<EditExposureForm>({
    exposure_order: '',
    icon_image: '',
    banner_image: '',
    expose_date_range: undefined,
  });

  const updateMutation = useCategoryUpdateMutation();
  const exposureMutation = useCategoryExposureUpdateMutation();
  const deleteMutation = useCategoryDeleteMutation();

  const statusOptions = useMemo(
    () => Object.values(CategoryStatus).map((v) => ({ value: v, label: tEnum(`category.${v}`) })),
    [tEnum],
  );

  const subcategoryCount = category?.children.length ?? 0;
  const allowCreateSub = category?.level !== CategoryLevels.SMALL;

  const startEditBasic = () => {
    if (!category) return;
    setBasicForm({
      name: category.name,
      name_en: category.name_en ?? '',
      slug: category.slug,
      description: category.description ?? '',
      subtitle: category.subtitle ?? '',
      status: category.status.value,
    });
    setIsEditingBasic(true);
  };

  const startEditExposure = () => {
    if (!category) return;
    setExposureForm({
      exposure_order: String(category.exposure_order),
      icon_image: category.icon ?? '',
      banner_image: category.banner_image ?? '',
      expose_date_range:
        category.exposure_start_date || category.exposure_end_date
          ? {
              from: category.exposure_start_date ? new Date(category.exposure_start_date) : undefined,
              to: category.exposure_end_date ? new Date(category.exposure_end_date) : undefined,
            }
          : undefined,
    });
    setIsEditingExposure(true);
  };

  const handleSaveBasic = () => {
    if (!category) return;
    updateMutation.mutate(
      {
        id: category.id,
        name: basicForm.name.trim(),
        name_en: basicForm.name_en.trim() || null,
        slug: basicForm.slug.trim(),
        description: basicForm.description.trim(),
        subtitle: basicForm.subtitle.trim() || null,
        status: basicForm.status as CategoryStatus,
        parent_id: category.parent_id,
        icon: category.icon ?? '',
        sort_order: category.sort_order,
        is_best: category.is_best,
      },
      {
        onSuccess: () => {
          appToast.success(tCommon('notify.success_update'));
          setIsEditingBasic(false);
        },
        onError: (error) => appToast.error(getErrorMessage(error, tCommon('notify.fail_update'))),
      },
    );
  };

  const handleSaveExposure = async () => {
    if (!category) return;
    setIsSavingExposure(true);
    try {
      const [iconImageUrl, bannerImageUrl] = await Promise.all([
        resolveExposureImageUrl(exposureForm.icon_image, 'icon'),
        resolveExposureImageUrl(exposureForm.banner_image, 'banner'),
      ]);

      exposureMutation.mutate(
        {
          id: category.id,
          body: {
            exposure_order: Number(exposureForm.exposure_order),
            image: bannerImageUrl || null,
            banner_image: bannerImageUrl || null,
            icon_image: iconImageUrl || null,
            exposure_start_date: exposureForm.expose_date_range?.from
              ? dayjs(exposureForm.expose_date_range.from).format(DATE_FORMAT)
              : '',
            exposure_end_date: exposureForm.expose_date_range?.to
              ? dayjs(exposureForm.expose_date_range.to).format(DATE_FORMAT)
              : '',
          },
        },
        {
          onSuccess: () => {
            appToast.success(tCommon('notify.success_update'));
            setIsEditingExposure(false);
          },
          onError: (error) => appToast.error(getErrorMessage(error, tCommon('notify.fail_update'))),
        },
      );
    } catch (error) {
      appToast.error(getErrorMessage(error, tCommon('notify.fail_update')));
    } finally {
      setIsSavingExposure(false);
    }
  };

  const handleDelete = () => {
    if (!category) return;
    deleteMutation.mutate(category.id, {
      onSuccess: () => {
        appToast.success(tCommon('notify.success_delete'));
        setConfirmDelete(false);
        onDeleted();
      },
      onError: (error) => appToast.error(getErrorMessage(error, tCommon('notify.fail_delete'))),
    });
  };

  if (isLoading) {
    return (
      <div className='flex min-h-80 flex-1 items-center justify-center rounded-lg border bg-white'>
        <Loader2 className='text-muted-foreground h-6 w-6 animate-spin' />
      </div>
    );
  }

  if (!category) {
    return (
      <div className='text-muted-foreground flex min-h-80 flex-1 flex-col items-center justify-center gap-3 rounded-lg border bg-white'>
        <Layers className='h-10 w-10' />
        <p className='text-sm'>{tCategory('detail.empty_hint')}</p>
      </div>
    );
  }

  const isShow = category.status.value === CategoryStatus.ACTTIVE;

  const exposePeriodDisplay = (() => {
    const fmt = (d?: string) => (d ? dayjs(d).format(DATE_FORMAT) : null);
    const from = fmt(category.exposure_start_date);
    const to = fmt(category.exposure_end_date);
    if (from && to) return `${from} ~ ${to}`;
    if (from) return `${from} ~`;
    if (to) return `~ ${to}`;
    return '—';
  })();

  return (
    <div className='flex flex-1 flex-col overflow-hidden rounded-lg border bg-white'>
      {/* Header */}
      <div className='flex items-start justify-between gap-4 border-b px-6 py-4'>
        <div className='space-y-1'>
          <div className='flex items-center gap-2'>
            <h2 className='text-lg font-semibold'>{category.name}</h2>
            <Badge className='rounded-sm' variant={isShow ? 'default' : 'secondary'}>
              {tEnum(`category.${category.status.value}`)}
            </Badge>
          </div>
          <div className='text-muted-foreground flex items-center gap-3 text-xs'>
            <span>{category.slug}</span>
            {subcategoryCount > 0 && (
              <>
                <span>·</span>
                <span>{tCategory('detail.subcategory_count', { count: subcategoryCount })}</span>
              </>
            )}
            {category.parent?.name && (
              <>
                <span>·</span>
                <span>
                  {tCategory('detail.parent_label')}: {category.parent.name}
                </span>
              </>
            )}
          </div>
        </div>

        <div className='flex shrink-0 items-center gap-2'>
          {allowCreateSub && (
            <Can action='register'>
              <Button size='sm' variant='outline' onClick={onAddSub}>
                <Plus className='h-4 w-4' />
                {tCategory('button.add_child')}
              </Button>
            </Can>
          )}
          <Can action='delete'>
            <Button size='sm' variant='destructive' onClick={() => setConfirmDelete(true)}>
              <Trash2 className='h-4 w-4' />
            </Button>
          </Can>
        </div>
      </div>

      <Tabs value={tab} onValueChange={handleTabChange} className='min-h-0 flex-1 gap-0'>
        <div className='shrink-0 border-b px-6 py-3'>
          <TabsList>
            <TabsTrigger value='info'>{tCategory('tab.info')}</TabsTrigger>
            <TabsTrigger value='products'>{tCategory('tab.products')}</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value='info' className='min-h-0 space-y-6 overflow-y-auto p-6'>
          {/* Basic Info Section */}
          <div className='space-y-4'>
            <div className='flex items-center justify-between'>
              <p className='text-sm font-medium text-gray-700'>{tCategory('detail.section_basic')}</p>
              <Can action='edit'>
                {isEditingBasic ? (
                  <div className='flex gap-2'>
                    <Button
                      size='sm'
                      variant='outline'
                      onClick={() => setIsEditingBasic(false)}
                      disabled={updateMutation.isPending}>
                      {tCategory('detail.cancel')}
                    </Button>
                    <Button size='sm' onClick={handleSaveBasic} disabled={updateMutation.isPending}>
                      {tCategory('detail.save')}
                    </Button>
                  </div>
                ) : (
                  <Button size='sm' variant='outline' onClick={startEditBasic}>
                    {tCategory('detail.edit')}
                  </Button>
                )}
              </Can>
            </div>

            {isEditingBasic ? (
              <div className='grid grid-cols-2 gap-4'>
                <FormItem label={tCategory('field.name')} required>
                  <Input value={basicForm.name} onChange={(e) => setBasicForm((p) => ({ ...p, name: e.target.value }))} />
                </FormItem>
                <FormItem label={tCategory('field.name_en')}>
                  <Input value={basicForm.name_en} onChange={(e) => setBasicForm((p) => ({ ...p, name_en: e.target.value }))} />
                </FormItem>
                <FormItem label={tCategory('field.slug')} required>
                  <Input
                    value={basicForm.slug}
                    onChange={(e) => setBasicForm((p) => ({ ...p, slug: slugifyCategoryName(e.target.value) }))}
                  />
                </FormItem>
                <FormItem label={tCategory('field.subtitle')}>
                  <Input value={basicForm.subtitle} onChange={(e) => setBasicForm((p) => ({ ...p, subtitle: e.target.value }))} />
                </FormItem>
                <FormItem label={tCategory('field.status')} required>
                  <AppSelect
                    options={statusOptions}
                    value={basicForm.status}
                    placeholder={tCategory('placeholder.select_status')}
                    onChange={(v) => setBasicForm((p) => ({ ...p, status: v as CategoryStatus | undefined }))}
                  />
                </FormItem>
                <div className='col-span-2'>
                  <FormItem label={tCategory('field.description')}>
                    <Textarea
                      value={basicForm.description}
                      onChange={(e) => setBasicForm((p) => ({ ...p, description: e.target.value }))}
                      rows={2}
                    />
                  </FormItem>
                </div>
              </div>
            ) : (
              <div className='grid grid-cols-2 gap-x-8 gap-y-3'>
                <ReadonlyField label={tCategory('field.name')} value={category.name} />
                <ReadonlyField label={tCategory('field.name_en')} value={category.name_en || '—'} />
                <ReadonlyField label={tCategory('field.slug')} value={category.slug} />
                <ReadonlyField label={tCategory('field.subtitle')} value={category.subtitle || '—'} />
                <ReadonlyField label={tCategory('field.status')} value={tEnum(`category.${category.status.value}`)} />
                <ReadonlyField
                  label={tCategory('field.description')}
                  value={category.description || '—'}
                  className='col-span-2'
                />
              </div>
            )}
          </div>

          <Separator />

          {/* Exposure Settings Section */}
          <div className='space-y-4'>
            <div className='flex items-center justify-between'>
              <p className='text-sm font-medium text-gray-700'>{tCategory('detail.section_exposure')}</p>
              <Can action='edit'>
                {isEditingExposure ? (
                  <div className='flex gap-2'>
                    <Button
                      size='sm'
                      variant='outline'
                      onClick={() => setIsEditingExposure(false)}
                      disabled={isSavingExposure || exposureMutation.isPending}>
                      {tCategory('detail.cancel')}
                    </Button>
                    <Button size='sm' onClick={handleSaveExposure} disabled={isSavingExposure || exposureMutation.isPending}>
                      {tCategory('detail.save')}
                    </Button>
                  </div>
                ) : (
                  <Button size='sm' variant='outline' onClick={startEditExposure}>
                    {tCategory('detail.edit')}
                  </Button>
                )}
              </Can>
            </div>

            {isEditingExposure ? (
              <div className='grid grid-cols-2 gap-4'>
                <FormItem label={tCategory('field.order')} required>
                  <Input
                    type='number'
                    min={1}
                    value={exposureForm.exposure_order}
                    onChange={(e) => setExposureForm((p) => ({ ...p, exposure_order: e.target.value }))}
                  />
                </FormItem>
                <FormItem label={tCategory('field.expose_period')}>
                  <DateRangePicker
                    value={exposureForm.expose_date_range}
                    onChange={(v) => setExposureForm((p) => ({ ...p, expose_date_range: v }))}
                  />
                </FormItem>
                <FormItem label={tCategory('field.icon_image')}>
                  <AppUpload
                    value={exposureForm.icon_image || undefined}
                    onChange={(v) => setExposureForm((p) => ({ ...p, icon_image: (v as string | File) ?? '' }))}
                    previewHeight='h-48 w-48'
                  />
                </FormItem>
                <FormItem label={tCategory('field.banner_image')}>
                  <AppUpload
                    value={exposureForm.banner_image || undefined}
                    onChange={(v) => setExposureForm((p) => ({ ...p, banner_image: (v as string | File) ?? '' }))}
                    previewHeight='h-48 w-48'
                  />
                </FormItem>
              </div>
            ) : (
              <div className='grid grid-cols-2 gap-x-8 gap-y-3'>
                <ReadonlyField label={tCategory('field.order')} value={String(category.exposure_order)} />
                <ReadonlyField label={tCategory('field.expose_period')} value={exposePeriodDisplay} />
                <ReadonlyImageField label={tCategory('field.icon_image')} src={category.icon} />
                <ReadonlyImageField label={tCategory('field.banner_image')} src={category.banner_image} />
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value='products' className='min-h-0 overflow-y-auto p-6'>
          <CategoryProductGrid categoryId={category.id} />
        </TabsContent>
      </Tabs>

      <ConfirmDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title={tCategory('confirm.delete_title')}
        description={tCategory('confirm.delete_description')}
        onConfirm={handleDelete}
        isLoading={deleteMutation.isPending}
        variant='destructive'
      />
    </div>
  );
};

const ReadonlyImageField = ({ label, src }: { label: string; src?: string | null }) => (
  <div>
    <p className='text-muted-foreground mb-1 text-xs tracking-wide uppercase'>{label}</p>
    {src ? (
      <img src={src} alt={label} className='h-48 w-48 rounded-md border object-cover' />
    ) : (
      <p className='text-sm font-medium text-gray-900'>—</p>
    )}
  </div>
);

const ReadonlyField = ({ label, value, className }: { label: string; value: string; className?: string }) => (
  <div className={className}>
    <p className='text-muted-foreground mb-1 text-xs tracking-wide uppercase'>{label}</p>
    <p className='text-sm font-medium text-gray-900'>{value}</p>
  </div>
);

export default CategoryDetail;
