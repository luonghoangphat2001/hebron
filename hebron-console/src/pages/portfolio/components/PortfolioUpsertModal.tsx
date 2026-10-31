import AppDialog from '@/components/dialog/AppDialog';
import FormItem from '@/components/form/FormItem';
import { AppRichTextEditor } from '@/components/shared/app-rich-text-editor';
import AppSelect from '@/components/select/AppSelect';
import { appToast } from '@/components/toast/AppToast';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import AttachmentFile, { type AttachmentFileValue } from '@/components/upload/AttachmentFile';
import {
  resolvePortfolioCoverImage,
  transformPortfolioInputToCreateREQ,
  transformPortfolioInputToUpdateREQ,
  transformPortfolioRESPToInput,
  urlToAttachmentValue,
} from '@/data/portfolio/portfolio.service';
import {
  usePortfolioCategoryListQuery,
  usePortfolioCreateMutation,
  usePortfolioDetailQuery,
  usePortfolioUpdateMutation,
} from '@/data/portfolio/portfolio.query';
import { portfolioInputDefault, portfolioUpsertSchema, type PortfolioInput } from '@/schemas/portfolio/portfolio.schema';
import { SiteType } from '@/utils/enums/common.enum';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useMemo, useState } from 'react';
import { Controller, useForm, type Resolver } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { FileType } from '@/utils/enums/file.enum';

export type PortfolioUpsertMode = 'create' | 'edit' | 'view';

type Props = {
  open: boolean;
  setOpen: (value: boolean) => void;
  portfolioId: number | null;
  mode: PortfolioUpsertMode;
};

const PortfolioUpsertModal = ({ open, setOpen, portfolioId, mode }: Props) => {
  const { t: tContent } = useTranslation('content');
  const { t: tCommon } = useTranslation('common');

  const isReadonly = mode === 'view';
  const isEdit = mode === 'edit';

  const [coverAttachment, setCoverAttachment] = useState<AttachmentFileValue | undefined>();
  const [uploadingAttachments, setUploadingAttachments] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isDirty },
  } = useForm<PortfolioInput>({
    mode: 'all',
    defaultValues: portfolioInputDefault,
    resolver: zodResolver(portfolioUpsertSchema) as Resolver<PortfolioInput>,
  });

  const { data: dataDetail, isLoading: isDetailLoading } = usePortfolioDetailQuery(open && portfolioId ? portfolioId : undefined);
  const { data: categories = [] } = usePortfolioCategoryListQuery();
  const { mutate: mutateCreate, isPending: isCreating } = usePortfolioCreateMutation();
  const { mutate: mutateUpdate, isPending: isUpdating } = usePortfolioUpdateMutation();

  const categoryOptions = useMemo(
    () =>
      categories.map(({ slug, name }) => ({
        value: slug || name,
        label: name,
      })),
    [categories],
  );

  const siteTypeOptions = useMemo(
    () => [
      { value: SiteType.BRAND_SITE, label: tContent('portfolio.site_type.brand') },
      { value: SiteType.SHOPPING_MALL, label: tContent('portfolio.site_type.mall') },
      { value: SiteType.PLAIN_SITE, label: tContent('portfolio.site_type.plain') },
    ],
    [tContent],
  );

  const onCreate = async (input: PortfolioInput) => {
    if (isCreating || uploadingAttachments) return;
    try {
      setUploadingAttachments(true);
      const cover_image = await resolvePortfolioCoverImage(coverAttachment, input.cover_image);
      const finalInput: PortfolioInput = { ...input, cover_image: cover_image ?? '' };

      mutateCreate(transformPortfolioInputToCreateREQ(finalInput), {
        onSuccess: () => {
          setOpen(false);
          appToast.success(tCommon('notify.success_create'));
        },
        onError: (error) => {
          appToast.error(error?.response?.data?.message || tCommon('notify.fail_create'));
        },
      });
    } catch {
      appToast.error(tCommon('notify.fail_upload'));
    } finally {
      setUploadingAttachments(false);
    }
  };

  const onUpdate = async (input: PortfolioInput) => {
    if (!portfolioId || isUpdating || uploadingAttachments || !isDirty) return;
    try {
      setUploadingAttachments(true);
      const cover_image = await resolvePortfolioCoverImage(coverAttachment, input.cover_image);
      const finalInput: PortfolioInput = { ...input, cover_image: cover_image ?? '' };

      mutateUpdate(transformPortfolioInputToUpdateREQ(portfolioId, finalInput), {
        onSuccess: () => {
          setOpen(false);
          appToast.success(tCommon('notify.success_update'));
        },
        onError: (error) => {
          appToast.error(error?.response?.data?.message || tCommon('notify.fail_update'));
        },
      });
    } catch {
      appToast.error(tCommon('notify.fail_upload'));
    } finally {
      setUploadingAttachments(false);
    }
  };

  useEffect(() => {
    if (!open) return;

    if (portfolioId && dataDetail?.portfolio) {
      const input = transformPortfolioRESPToInput(dataDetail.portfolio);
      reset(input);
      setCoverAttachment(urlToAttachmentValue(input.cover_image));
      return;
    }

    if (mode === 'create') {
      reset(portfolioInputDefault);
      setCoverAttachment(undefined);
    }
  }, [open, portfolioId, dataDetail, mode, reset]);

  const title =
    mode === 'create'
      ? tContent('portfolio.modal_create')
      : mode === 'edit'
        ? tContent('portfolio.modal_edit')
        : tContent('portfolio.modal_detail');

  return (
    <AppDialog
      open={open}
      onOpenChange={setOpen}
      title={title}
      onOk={isReadonly ? undefined : handleSubmit(isEdit ? onUpdate : onCreate)}
      okDisabled={isEdit && !isDirty}
      loading={isCreating || isUpdating || uploadingAttachments}
      contentLoading={!!portfolioId && isDetailLoading}
      textCancel={isReadonly ? tCommon('button.close') : undefined}
      className='sm:max-w-3xl'>
      <div className='space-y-5'>
        {/* ── Basic info ── */}
        <div className='rounded-md border border-gray-200 p-4'>
          <div className='flex items-center justify-between'>
            <p className='text-lg font-medium'>{tContent('portfolio.section_basic')}</p>
            <div className='flex items-center gap-4'>
              <Controller
                control={control}
                name='is_featured'
                render={({ field }) => (
                  <div className='flex items-center gap-1.5'>
                    <Checkbox
                      className='bg-white'
                      checked={field.value}
                      onCheckedChange={(checked) => field.onChange(!!checked)}
                      disabled={isReadonly}
                    />
                    <span className='text-sm'>{tContent('portfolio.field_featured')}</span>
                  </div>
                )}
              />
              <Controller
                control={control}
                name='is_active'
                render={({ field }) => (
                  <div className='flex items-center gap-1.5'>
                    <Checkbox
                      className='bg-white'
                      checked={!!field.value}
                      onCheckedChange={(checked) => field.onChange(!!checked)}
                      disabled={isReadonly}
                    />
                    <span className='text-sm'>{tContent('portfolio.field_active')}</span>
                  </div>
                )}
              />
            </div>
          </div>
          <Separator className='my-3' />
          <div className='grid grid-cols-2 gap-4'>
            <FormItem label={tContent('portfolio.field_title')} required={!isReadonly} error={errors.title?.message}>
              <Controller
                control={control}
                name='title'
                render={({ field }) => <Input {...field} placeholder={tContent('portfolio.ph_title')} disabled={isReadonly} />}
              />
            </FormItem>
            <FormItem label={tContent('portfolio.field_client')} required={!isReadonly} error={errors.client?.message}>
              <Controller
                control={control}
                name='client'
                render={({ field }) => <Input {...field} placeholder={tContent('portfolio.ph_client')} disabled={isReadonly} />}
              />
            </FormItem>
            <FormItem label={tContent('portfolio.field_category')} required={!isReadonly} error={errors.category?.message}>
              <Controller
                control={control}
                name='category'
                render={({ field }) => (
                  <AppSelect
                    options={categoryOptions}
                    value={field.value}
                    onChange={field.onChange}
                    placeholder={tContent('portfolio.ph_category')}
                    disabled={isReadonly}
                  />
                )}
              />
            </FormItem>
            <FormItem label={tContent('portfolio.field_year')} required={!isReadonly} error={errors.year?.message}>
              <Controller
                control={control}
                name='year'
                render={({ field }) => (
                  <Input
                    type='number'
                    min={2000}
                    max={2100}
                    {...field}
                    value={field.value}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                    disabled={isReadonly}
                  />
                )}
              />
            </FormItem>
            <FormItem label={tContent('portfolio.field_site_type')} required={!isReadonly} error={errors.site_type?.message}>
              <Controller
                control={control}
                name='site_type'
                render={({ field }) => (
                  <AppSelect
                    options={siteTypeOptions}
                    value={field.value}
                    onChange={(v) => field.onChange(v as SiteType)}
                    placeholder={tContent('portfolio.ph_site_type')}
                    disabled={true}
                  />
                )}
              />
            </FormItem>
            <FormItem label={tContent('portfolio.field_sort_order')} error={errors.sort_order?.message}>
              <Controller
                control={control}
                name='sort_order'
                render={({ field }) => (
                  <Input
                    type='number'
                    min={1}
                    {...field}
                    value={field.value}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                    disabled={isReadonly}
                  />
                )}
              />
            </FormItem>
          </div>
        </div>

        {/* ── Description ── */}
        <div className='rounded-md border border-gray-200 p-4'>
          <p className='mb-3 text-lg font-medium'>{tContent('portfolio.section_description')}</p>
          <FormItem label={tContent('portfolio.field_description')} required={!isReadonly} error={errors.description?.message}>
            <Controller
              control={control}
              name='description'
              render={({ field }) => (
                <AppRichTextEditor
                  value={field.value}
                  onValueChange={field.onChange}
                  placeholder={tContent('portfolio.ph_description')}
                  disabled={isReadonly}
                  imageUploadMode='immediate'
                  imageFileType={FileType.PORTFOLIO}
                />
              )}
            />
          </FormItem>
        </div>

        {/* ── Images ── */}
        <div className='rounded-md border border-gray-200 p-4'>
          <p className='mb-3 text-lg font-medium'>{tContent('portfolio.section_images')}</p>
          <div className='grid grid-cols-1 gap-4'>
            <FormItem label={tContent('portfolio.field_cover_image')} error={errors.cover_image?.message}>
              <Controller
                control={control}
                name='cover_image'
                render={() => (
                  <AttachmentFile
                    accept='image/*'
                    disabled={isReadonly}
                    uploading={uploadingAttachments}
                    value={coverAttachment}
                    onChange={(val) => {
                      const item = Array.isArray(val) ? val[0] : val;
                      setCoverAttachment(item);
                      setValue('cover_image', item ? item.remote?.url || item.name : '', {
                        shouldDirty: true,
                        shouldTouch: true,
                        shouldValidate: true,
                      });
                    }}
                  />
                )}
              />
            </FormItem>
          </div>
        </div>
      </div>
    </AppDialog>
  );
};

export default PortfolioUpsertModal;
