import AppDialog from '@/components/dialog/AppDialog';
import FormItem from '@/components/form/FormItem';
import AppSelect from '@/components/select/AppSelect';
import { AppRichTextEditor } from '@/components/shared/app-rich-text-editor';
import { appToast } from '@/components/toast/AppToast';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import AttachmentFile, { type AttachmentFileValue } from '@/components/upload/AttachmentFile';
import {
  useMediaCategoryListQuery,
  useMediaCreateMutation,
  useMediaDetailQuery,
  useMediaUpdateMutation,
} from '@/data/media/media.query';
import {
  resolveMediaFile,
  toMediaAttachment,
  transformInputToMediaCreateREQ,
  transformMediaToInput,
} from '@/data/media/media.service';
import { mediaCreateSchema, mediaInputDefault, type MediaInput } from '@/schemas/media/media.schema';
import { SiteType } from '@/utils/enums/common.enum';
import { FileType } from '@/utils/enums/file.enum';
import { handleNumberInputChange } from '@/utils/helper/common.helper';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useMemo, useState } from 'react';
import { Controller, useForm, type Resolver } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import MediaDetailView from './MediaDetailView';

export type MediaUpsertMode = 'create' | 'edit' | 'view';

type Props = {
  open: boolean;
  setOpen: (value: boolean) => void;
  id: number | null;
  mode: MediaUpsertMode;
  defaultSiteType?: SiteType;
};

const MediaUpsertModal = ({ open, setOpen, id, mode, defaultSiteType }: Props) => {
  const { t: tContent } = useTranslation('content');
  const { t: tCommon } = useTranslation('common');
  // const { t: tEnum } = useTranslation('enum');

  const isCreate = mode === 'create';
  const isReadonly = mode === 'view';

  const [thumbnail, setThumbnail] = useState<AttachmentFileValue | undefined>();
  const [uploading, setUploading] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isDirty },
  } = useForm<MediaInput>({
    mode: 'onChange',
    defaultValues: mediaInputDefault,
    resolver: zodResolver(mediaCreateSchema) as Resolver<MediaInput>,
  });

  const { data: dataDetail, isLoading: isDetailLoading } = useMediaDetailQuery(open && id ? id : undefined);
  const { data: categories = [], isLoading: isCategoryLoading } = useMediaCategoryListQuery();
  const { mutate: mutateCreate, isPending: isCreating } = useMediaCreateMutation();
  const { mutate: mutateUpdate, isPending: isUpdating } = useMediaUpdateMutation();

  // const siteTypeOptions = useMemo(
  //   () => Object.values(SiteType).map((v) => ({ value: v, label: tEnum(`common.${v}` as 'common.BRAND_SITE') })),
  //   [tEnum],
  // );
  const categoryOptions = useMemo(() => categories.map((c) => ({ value: c.id, label: c.name })), [categories]);

  useEffect(() => {
    if (!open) return;

    if (isCreate) {
      reset({ ...mediaInputDefault, site_type: defaultSiteType || SiteType.BRAND_SITE });
      setThumbnail(undefined);
      return;
    }

    if (dataDetail) {
      reset(transformMediaToInput(dataDetail));
      setThumbnail(toMediaAttachment(dataDetail.image_url || dataDetail.url));
    }
  }, [open, isCreate, defaultSiteType, dataDetail, reset]);

  const onSubmit = async (input: MediaInput) => {
    if (isCreating || isUpdating || uploading) return;

    try {
      setUploading(true);
      const uploadedImage = await resolveMediaFile(thumbnail);
      const body = transformInputToMediaCreateREQ(input, uploadedImage);

      if (isCreate) {
        mutateCreate(body, {
          onSuccess: () => {
            setOpen(false);
            appToast.success(tCommon('notify.success_create'));
          },
          onError: (error) => {
            appToast.error(error.response?.data?.message || tCommon('notify.fail_create'));
          },
        });
        return;
      }

      if (id) {
        mutateUpdate(
          { id, body },
          {
            onSuccess: () => {
              setOpen(false);
              appToast.success(tCommon('notify.success_update'));
            },
            onError: (error) => {
              appToast.error(error.response?.data?.message || tCommon('notify.fail_update'));
            },
          },
        );
      }
    } catch (err: any) {
      appToast.error(err?.response?.data?.message || err?.message || tCommon('notify.fail_upload'));
    } finally {
      setUploading(false);
    }
  };

  return (
    <AppDialog
      open={open}
      onOpenChange={setOpen}
      title={
        isCreate ? tContent('media.modal_create') : isReadonly ? tContent('media.modal_detail') : tContent('media.modal_edit')
      }
      onOk={isReadonly ? undefined : handleSubmit(onSubmit)}
      okDisabled={mode === 'edit' && !isDirty}
      loading={isCreating || isUpdating || uploading}
      contentLoading={!isCreate && !!id && isDetailLoading}
      textCancel={isReadonly ? tCommon('button.close') : undefined}
      className='sm:max-w-200'>
      {isReadonly ? (
        <MediaDetailView media={dataDetail} />
      ) : (
        <div className='space-y-4'>
          <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
            {/* <FormItem label={tContent('filter.site_type')} required error={errors.site_type?.message}>
              <Controller
                control={control}
                name='site_type'
                render={({ field }) => (
                  <AppSelect
                    options={siteTypeOptions}
                    value={field.value}
                    clearable={false}
                    placeholder={tContent('filter.ph_select_site_type')}
                    onChange={(value) => {
                      field.onChange(value);
                      setValue('category_id', 0, { shouldValidate: true });
                    }}
                  />
                )}
              />
            </FormItem> */}

            <FormItem label={tContent('filter.category')} required error={errors.category_id?.message}>
              {isCategoryLoading ? (
                <Skeleton className='h-9 w-full rounded-md' />
              ) : (
                <Controller
                  control={control}
                  name='category_id'
                  render={({ field }) => (
                    <AppSelect
                      options={categoryOptions}
                      value={field.value || undefined}
                      placeholder={tContent('filter.ph_select_category')}
                      onChange={(value) => field.onChange(value ?? 0)}
                    />
                  )}
                />
              )}
            </FormItem>

            <FormItem label={tContent('media.field_sort_order')} error={errors.sort_order?.message}>
              <Controller
                control={control}
                name='sort_order'
                render={({ field }) => (
                  <Input type='number' min={0} step={1} {...field} onChange={(e) => handleNumberInputChange(e, field.onChange)} />
                )}
              />
            </FormItem>
          </div>

          <FormItem label={tContent('media.field_title')} required error={errors.title?.message}>
            <Controller
              control={control}
              name='title'
              render={({ field }) => <Input {...field} placeholder={tContent('media.ph_title')} />}
            />
          </FormItem>

          <FormItem label={tContent('image.field_image')} error={errors.thumbnail_path?.message}>
            <AttachmentFile
              accept='image/*'
              tileClassName='h-40 w-full'
              uploading={uploading}
              value={thumbnail}
              onChange={(val) => {
                const item = Array.isArray(val) ? val[0] : val;
                setThumbnail(item);
                setValue('thumbnail_path', item?.remote?.url || item?.name || null, { shouldDirty: true });
              }}
            />
          </FormItem>

          {/* ── Description ── */}
          <div className='rounded-md border border-gray-200 p-4'>
            <p className='mb-3 text-lg font-medium'>{tContent('portfolio.section_description')}</p>
            <FormItem label={tContent('media.field_description')} error={errors.description?.message}>
              <Controller
                control={control}
                name='description'
                render={({ field }) => (
                  <AppRichTextEditor
                    value={field.value || ''}
                    onValueChange={field.onChange}
                    placeholder={tContent('media.ph_description')}
                    imageUploadMode='immediate'
                    imageFileType={FileType.MEDIA}
                  />
                )}
              />
            </FormItem>
          </div>

          <FormItem label={tContent('media.field_is_active')}>
            <Controller
              control={control}
              name='is_active'
              render={({ field }) => <Switch checked={field.value} onCheckedChange={field.onChange} />}
            />
          </FormItem>

          {/* <FormItem label={tContent('media.field_link_url')} error={errors.link_url?.message}>
            <Controller
              control={control}
              name='link_url'
              render={({ field }) => <Input {...field} value={field.value || ''} placeholder={tContent('media.ph_link_url')} />}
            />
          </FormItem> */}
        </div>
      )}
    </AppDialog>
  );
};

export default MediaUpsertModal;
