import AppDialog from '@/components/dialog/AppDialog';
import { DateRangePicker } from '@/components/date-picker/DateRangePicker';
import FormItem from '@/components/form/FormItem';
import AppSelect from '@/components/select/AppSelect';
import { appToast } from '@/components/toast/AppToast';
import AppUpload from '@/components/upload/AppUpload';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { useCategoryCreateMutation, useCategoryUpdateMutation } from '@/data/category/category.query';
import {
  resolveExposureImageUrl,
  slugifyCategoryName,
  toCategoryCreateBody,
  toCategoryUpdateBody,
  type CategoryFormValues,
} from '@/data/category/category.service';
import type { CategorynNode } from '@/data/category/category.response';
import { CategoryStatus } from '@/utils/enums/category.enum';
import { getErrorMessage } from '@/utils/helper/noti-error.helper';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

type FormState = CategoryFormValues & {
  icon: string | File;
  banner_image: string | File;
};

const DEFAULT_FORM: FormState = {
  name: '',
  name_en: '',
  slug: '',
  description: '',
  subtitle: '',
  status: undefined,
  sort_order: '',
  icon: '',
  banner_image: '',
  expose_date_range: undefined,
  parent_id: undefined,
};

const buildInitialForm = (editData?: CategorynNode | null, defaultParentId?: number): FormState => {
  if (!editData) return { ...DEFAULT_FORM, parent_id: defaultParentId };
  return {
    name: editData.name,
    name_en: editData.name_en ?? '',
    slug: editData.slug,
    description: editData.description ?? '',
    subtitle: editData.subtitle ?? '',
    status: editData.status.value,
    sort_order: String(editData.sort_order),
    icon: editData.icon ?? '',
    banner_image: editData.banner_image ?? '',
    expose_date_range:
      editData.exposure_start_date || editData.exposure_end_date
        ? {
            from: editData.exposure_start_date ? new Date(editData.exposure_start_date) : undefined,
            to: editData.exposure_end_date ? new Date(editData.exposure_end_date) : undefined,
          }
        : undefined,
    parent_id: editData.parent_id ?? undefined,
  };
};

type Props = {
  open: boolean;
  setOpen: (value: boolean) => void;
  depth: number;
  parentCategory?: CategorynNode | null;
  editData?: CategorynNode | null;
};

const CategoryUpsertModal = ({ open, setOpen, depth, parentCategory, editData }: Props) => {
  const { t: tCategory } = useTranslation('category');
  const { t: tCommon } = useTranslation('common');
  const { t: tEnum } = useTranslation('enum');

  const isEdit = !!editData;
  const [form, setForm] = useState<FormState>(() => buildInitialForm(editData, parentCategory?.id));
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const slugTouched = useRef(isEdit);

  useEffect(() => {
    if (!open) return;
    setForm(buildInitialForm(editData, parentCategory?.id));
    setErrors({});
    slugTouched.current = isEdit;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const update = (patch: Partial<FormState>) => {
    setForm((prev) => ({ ...prev, ...patch }));
    const key = Object.keys(patch)[0] as keyof FormState;
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const handleNameChange = (value: string) => {
    if (slugTouched.current) {
      update({ name: value });
    } else {
      update({ name: value, slug: slugifyCategoryName(value) });
    }
  };

  const handleSlugChange = (value: string) => {
    slugTouched.current = true;
    update({ slug: slugifyCategoryName(value) });
  };

  const statusOptions = useMemo(
    () => Object.values(CategoryStatus).map((v) => ({ value: v, label: tEnum(`category.${v}`) })),
    [tEnum],
  );

  const createMutation = useCategoryCreateMutation();
  const updateMutation = useCategoryUpdateMutation();
  const [isUploading, setIsUploading] = useState(false);
  const isLoading = createMutation.isPending || updateMutation.isPending || isUploading;

  const validate = (): boolean => {
    const next: Partial<Record<keyof FormState, string>> = {};
    if (!form.name.trim()) next.name = 'FIELD_REQUIRED';
    if (!form.slug.trim()) next.slug = 'FIELD_REQUIRED';
    if (!form.status) next.status = 'FIELD_REQUIRED';
    if (!form.sort_order.trim() || isNaN(Number(form.sort_order))) next.sort_order = 'FIELD_REQUIRED';
    if (depth === 2 && !form.parent_id) next.parent_id = 'FIELD_REQUIRED';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleOk = async () => {
    if (!validate()) return;

    setIsUploading(true);
    let iconUrl: string;
    try {
      iconUrl = await resolveExposureImageUrl(form.icon, 'icon');
    } catch (error) {
      appToast.error(getErrorMessage(error, tCommon(isEdit ? 'notify.fail_update' : 'notify.fail_create')));
      setIsUploading(false);
      return;
    }

    if (isEdit && editData) {
      setIsUploading(false);

      updateMutation.mutate(toCategoryUpdateBody(form, editData, depth, iconUrl), {
        onSuccess: () => {
          appToast.success(tCommon('notify.success_update'));
          setOpen(false);
        },
        onError: (error) => appToast.error(getErrorMessage(error, tCommon('notify.fail_update'))),
      });
    } else {
      let bannerUrl: string;
      try {
        bannerUrl = await resolveExposureImageUrl(form.banner_image, 'banner');
      } catch (error) {
        appToast.error(getErrorMessage(error, tCommon('notify.fail_create')));
        setIsUploading(false);
        return;
      }
      setIsUploading(false);

      createMutation.mutate(toCategoryCreateBody(form, depth, iconUrl, bannerUrl), {
        onSuccess: () => {
          appToast.success(tCommon('notify.success_create'));
          setOpen(false);
        },
        onError: (error) => appToast.error(getErrorMessage(error, tCommon('notify.fail_create'))),
      });
    }
  };

  const title = isEdit
    ? depth === 1
      ? tCategory('modal.title_edit_parent')
      : tCategory('modal.title_edit_child')
    : depth === 1
      ? tCategory('modal.title_create_parent')
      : tCategory('modal.title_create_child');

  return (
    <AppDialog open={open} onOpenChange={setOpen} title={title} onOk={handleOk} loading={isLoading} className='sm:max-w-2xl'>
      <div className='space-y-6'>
        <div className='space-y-4'>
          <p className='text-sm font-medium text-gray-700'>{tCategory('modal.section_basic')}</p>
          <div className='grid grid-cols-2 gap-4'>
            <FormItem label={tCategory('field.name')} required error={errors.name}>
              <Input
                placeholder={tCategory('placeholder.name')}
                value={form.name}
                onChange={(e) => handleNameChange(e.target.value)}
              />
            </FormItem>
            <FormItem label={tCategory('field.name_en')}>
              <Input
                placeholder={tCategory('placeholder.name')}
                value={form.name_en}
                onChange={(e) => update({ name_en: e.target.value })}
              />
            </FormItem>
            <FormItem label={tCategory('field.slug')} required error={errors.slug}>
              <Input
                placeholder={tCategory('placeholder.slug')}
                value={form.slug}
                onChange={(e) => handleSlugChange(e.target.value)}
              />
            </FormItem>
            <FormItem label={tCategory('field.status')} required error={errors.status}>
              <AppSelect
                options={statusOptions}
                value={form.status}
                placeholder={tCategory('placeholder.select_status')}
                onChange={(v) => update({ status: v as CategoryStatus | undefined })}
              />
            </FormItem>
          </div>
          <FormItem label={tCategory('field.description')}>
            <Textarea
              placeholder={tCategory('placeholder.description')}
              value={form.description}
              onChange={(e) => update({ description: e.target.value })}
              rows={3}
            />
          </FormItem>
        </div>

        <Separator />

        <div className='space-y-4'>
          <p className='text-sm font-medium text-gray-700'>{tCategory('modal.section_exposure')}</p>
          <div className='grid grid-cols-2 gap-4'>
            <FormItem label={tCategory('field.order')} required error={errors.sort_order}>
              <Input type='number' min={1} value={form.sort_order} onChange={(e) => update({ sort_order: e.target.value })} />
            </FormItem>
            <FormItem label={tCategory('field.expose_period')}>
              <DateRangePicker value={form.expose_date_range} onChange={(v) => update({ expose_date_range: v })} />
            </FormItem>
            <FormItem label={tCategory('field.icon')}>
              <AppUpload
                value={form.icon || undefined}
                onChange={(v) => update({ icon: (v as string | File) ?? '' })}
                previewHeight='h-48 w-48'
              />
            </FormItem>
            <FormItem label={tCategory('field.banner_image')}>
              <AppUpload
                value={form.banner_image || undefined}
                onChange={(v) => update({ banner_image: (v as string | File) ?? '' })}
                previewHeight='h-48 w-48'
              />
            </FormItem>
          </div>
        </div>
      </div>
    </AppDialog>
  );
};

export default CategoryUpsertModal;
