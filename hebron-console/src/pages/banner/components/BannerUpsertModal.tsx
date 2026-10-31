import { DateRangePicker } from '@/components/date-picker/DateRangePicker';
import AppDialog from '@/components/dialog/AppDialog';
import FormItem from '@/components/form/FormItem';
import AppSelect from '@/components/select/AppSelect';
import { appToast } from '@/components/toast/AppToast';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AttachmentFile, { type AttachmentFileValue } from '@/components/upload/AttachmentFile';
import { useBannerCreateMutation, useBannerDetailQuery, useBannerUpdateMutation } from '@/data/banner/banner.query';
import {
  bannerDatesToDateRange,
  dateRangeToBannerDates,
  getPagesBySiteType,
  resolveBannerImages,
  transformBannerInputToCreateREQ,
  transformBannerInputToUpdateREQ,
  transformBannerRESPToInput,
  urlToAttachmentValue,
} from '@/data/banner/banner.service';
import { cn } from '@/lib/utils';
import { bannerInputDefault, bannerUpsertSchema, type BannerInput } from '@/schemas/banner/banner.schema';
import { BannerMode } from '@/utils/enums/banner.enum';
import { ExposureStatus, PageType, SiteType } from '@/utils/enums/common.enum';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, Monitor, Smartphone } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import type { DateRange } from 'react-day-picker';
import { Controller, useForm, type Resolver } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

export type BannerUpsertMode = 'create' | 'edit' | 'view';

type BannerUpsertModalProps = {
  open: boolean;
  setOpen: (value: boolean) => void;
  bannerId: number | null;
  mode: BannerUpsertMode;
};

const BannerUpsertModal = ({ open, setOpen, bannerId, mode }: BannerUpsertModalProps) => {
  const { t: tContent } = useTranslation('content');
  const { t: tCommon } = useTranslation('common');
  const { t: tEnum } = useTranslation('enum');

  const isReadonly = mode === 'view';
  const isEdit = mode === 'edit';
  const [activeTab, setActiveTab] = useState<BannerMode>(BannerMode.PC);
  const [pcAttachment, setPcAttachment] = useState<AttachmentFileValue | undefined>();
  const [mobileAttachment, setMobileAttachment] = useState<AttachmentFileValue | undefined>();
  const [uploadingAttachments, setUploadingAttachments] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isDirty },
  } = useForm<BannerInput>({
    mode: 'all',
    defaultValues: bannerInputDefault,
    resolver: zodResolver(bannerUpsertSchema) as Resolver<BannerInput>,
  });

  const selectedSiteType = watch('site_type');

  const { data: dataDetail, isLoading: isDetailLoading } = useBannerDetailQuery(open && bannerId ? bannerId : undefined);
  const { mutate: mutateCreate, isPending: isCreating } = useBannerCreateMutation();
  const { mutate: mutateUpdate, isPending: isUpdating } = useBannerUpdateMutation();

  const siteTypeOptions = useMemo(() => Object.values(SiteType).map((v) => ({ value: v, label: tEnum(`common.${v}`) })), [tEnum]);

  const pageTypeOptions = useMemo(() => {
    if (!selectedSiteType) return [];
    const pages = getPagesBySiteType(selectedSiteType);
    return pages.map((v) => ({ value: v, label: tEnum(`content.${v}` as any) }));
  }, [selectedSiteType, tEnum]);

  const exposurePeriod: DateRange | undefined = bannerDatesToDateRange(watch('exposure_start_date'), watch('exposure_end_date'));

  const handlePeriodChange = (range: DateRange | undefined) => {
    const { exposure_start_date, exposure_end_date } = dateRangeToBannerDates(range);
    setValue('exposure_start_date', exposure_start_date, { shouldDirty: true, shouldTouch: true, shouldValidate: true });
    setValue('exposure_end_date', exposure_end_date, { shouldDirty: true, shouldTouch: true, shouldValidate: true });
  };

  const handleSiteTypeChange = (siteType: SiteType) => {
    setValue('site_type', siteType, { shouldDirty: true, shouldTouch: true, shouldValidate: true });
    if (!siteType) {
      setValue('page_type', undefined as any, { shouldDirty: true, shouldTouch: true, shouldValidate: true });
      return;
    }
    const validPages = getPagesBySiteType(siteType);
    const currentPageType = watch('page_type');
    if (!validPages.includes(currentPageType)) {
      setValue('page_type', validPages[0] || PageType.HOME_PAGE, { shouldDirty: true, shouldTouch: true, shouldValidate: true });
    }
  };

  const onCreate = async (input: BannerInput) => {
    if (isCreating || uploadingAttachments) return;

    try {
      setUploadingAttachments(true);
      const { image_path, image_path_mobile } = await resolveBannerImages(input, pcAttachment, mobileAttachment);
      const finalInput: BannerInput = { ...input, image_path, image_path_mobile };

      mutateCreate(transformBannerInputToCreateREQ(finalInput), {
        onSuccess: () => {
          setOpen(false);
          appToast.success(tCommon('notify.success_create'));
        },
        onError: (error) => {
          appToast.error(error.response?.data.message || tCommon('notify.fail_create'));
        },
      });
    } catch {
      appToast.error(tCommon('notify.fail_upload'));
    } finally {
      setUploadingAttachments(false);
    }
  };

  const onUpdate = async (input: BannerInput) => {
    if (!bannerId || isUpdating || uploadingAttachments || !isDirty) return;

    try {
      setUploadingAttachments(true);
      const { image_path, image_path_mobile } = await resolveBannerImages(input, pcAttachment, mobileAttachment);
      const finalInput: BannerInput = { ...input, image_path, image_path_mobile };

      mutateUpdate(transformBannerInputToUpdateREQ(bannerId, finalInput), {
        onSuccess: () => {
          setOpen(false);
          appToast.success(tCommon('notify.success_update'));
        },
        onError: (error) => {
          appToast.error(error.response?.data.message || tCommon('notify.fail_update'));
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

    if (bannerId && dataDetail) {
      const input = transformBannerRESPToInput(dataDetail);
      reset(input);
      setPcAttachment(urlToAttachmentValue(input.image_path));
      setMobileAttachment(urlToAttachmentValue(input.image_path_mobile));
      setActiveTab(BannerMode.PC);
      return;
    }

    if (mode === 'create') {
      reset(bannerInputDefault);
      setPcAttachment(undefined);
      setMobileAttachment(undefined);
      setActiveTab(BannerMode.PC);
    }
  }, [open, bannerId, dataDetail, mode, reset]);

  const title =
    mode === 'create'
      ? tContent('banner.modal_create')
      : mode === 'edit'
        ? tContent('banner.modal_edit')
        : tContent('banner.modal_detail');

  return (
    <AppDialog
      open={open}
      onOpenChange={setOpen}
      title={title}
      onOk={isReadonly ? undefined : handleSubmit(isEdit ? onUpdate : onCreate)}
      okDisabled={isEdit && !isDirty}
      loading={isCreating || isUpdating || uploadingAttachments}
      contentLoading={!!bannerId && isDetailLoading}
      textCancel={isReadonly ? tCommon('button.close') : undefined}
      className='sm:max-w-250'>
      <div className='space-y-4'>
        <div className='rounded-md border border-gray-200 p-4'>
          <div className='flex items-center justify-between'>
            <p className='text-lg font-medium'>{tContent('banner.default_setting')}</p>
            <Controller
              control={control}
              name='status'
              render={({ field }) => (
                <div className='flex items-center gap-1'>
                  <Checkbox
                    className='bg-white'
                    checked={field.value === ExposureStatus.EXPOSED}
                    onCheckedChange={(checked) => field.onChange(checked ? ExposureStatus.EXPOSED : ExposureStatus.NON_EXPOSED)}
                    disabled={isReadonly}
                  />
                  {tContent('banner.exposure')}
                </div>
              )}
            />
          </div>
          <Separator className='my-3' />
          <div className='grid grid-cols-2 gap-4'>
            <FormItem label={tContent('banner.field_site_type')} required={!isReadonly} error={errors.site_type?.message}>
              <Controller
                control={control}
                name='site_type'
                render={({ field }) => (
                  <AppSelect
                    options={siteTypeOptions}
                    value={field.value}
                    placeholder={tContent('filter.ph_select_site_type')}
                    onChange={(val) => handleSiteTypeChange(val as SiteType)}
                    disabled={isReadonly}
                  />
                )}
              />
            </FormItem>
            <FormItem label={tContent('banner.field_page_type')} required={!isReadonly} error={errors.page_type?.message}>
              <Controller
                control={control}
                name='page_type'
                render={({ field }) => (
                  <AppSelect
                    options={pageTypeOptions}
                    value={field.value}
                    placeholder={
                      selectedSiteType ? tContent('filter.ph_select_page_type') : tContent('filter.ph_select_site_type')
                    }
                    onChange={field.onChange}
                    disabled={isReadonly || !selectedSiteType}
                  />
                )}
              />
            </FormItem>
            {/* <FormItem label={tContent('banner.field_location')} required={!isReadonly} error={errors.exposure_location?.message}>
              <Controller
                control={control}
                name='exposure_location'
                render={({ field }) => (
                  <AppSelect
                    options={locationOptions}
                    value={field.value}
                    placeholder={tContent('filter.ph_select_location')}
                    onChange={field.onChange}
                    disabled={isReadonly}
                  />
                )}
              />
            </FormItem> */}
            <FormItem
              label={tContent('banner.field_display_period')}
              required={!isReadonly}
              error={errors.exposure_start_date?.message || errors.exposure_end_date?.message}>
              <DateRangePicker
                value={exposurePeriod}
                onChange={handlePeriodChange}
                placeholder={tCommon('filter.pick_date_range')}
                disabled={isReadonly}
              />
            </FormItem>
            <FormItem label={tContent('banner.field_sort_order')} error={errors.sort_order?.message}>
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

        <div className='rounded-md border border-gray-200 p-4'>
          <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as BannerMode)}>
            <TabsList>
              <TabsTrigger value={BannerMode.PC}>
                <Monitor />
                {tContent('banner.pc_version')}
              </TabsTrigger>
              <TabsTrigger value={BannerMode.MOBILE}>
                <Smartphone />
                {tContent('banner.mobile_version')}
              </TabsTrigger>
            </TabsList>
          </Tabs>
          <div className='mt-6 grid grid-cols-2 gap-4'>
            <div className='space-y-4'>
              <FormItem label={tContent('banner.field_title')} required={!isReadonly} error={errors.name?.message}>
                <Controller
                  control={control}
                  name='name'
                  render={({ field }) => <Input {...field} placeholder={tContent('banner.ph_title')} disabled={isReadonly} />}
                />
              </FormItem>
              <FormItem label={tContent('banner.field_navigate_link')} icon={<Link size={14} />} error={errors.link_url?.message}>
                <Controller
                  control={control}
                  name='link_url'
                  render={({ field }) => (
                    <Input {...field} placeholder={tContent('banner.ph_navigate_link')} disabled={isReadonly} />
                  )}
                />
              </FormItem>
            </div>
            <div className='grid grid-cols-1 grid-rows-1'>
              <div
                className={cn(
                  'col-start-1 row-start-1 transition-opacity duration-150',
                  activeTab !== BannerMode.PC ? 'pointer-events-none invisible opacity-0' : 'visible opacity-100',
                )}>
                <FormItem label={tContent('banner.field_pc_image')} error={errors.image_path?.message} required={!isReadonly}>
                  <Controller
                    control={control}
                    name='image_path'
                    render={() => (
                      <AttachmentFile
                        accept='image/*'
                        disabled={isReadonly}
                        uploading={uploadingAttachments}
                        value={pcAttachment}
                        onChange={(val) => {
                          const item = Array.isArray(val) ? val[0] : val;
                          setPcAttachment(item);
                          setValue('image_path', item ? item.remote?.url || item.name : '', {
                            shouldDirty: true,
                            shouldTouch: true,
                            shouldValidate: true,
                          });
                        }}
                        className='[&>div>button]:w-full [&>div>div]:w-full'
                      />
                    )}
                  />
                </FormItem>
              </div>

              <div
                className={cn(
                  'col-start-1 row-start-1 transition-opacity duration-150',
                  activeTab !== BannerMode.MOBILE ? 'pointer-events-none invisible opacity-0' : 'visible opacity-100',
                )}>
                <FormItem label={tContent('banner.field_mobile_image')} error={errors.image_path_mobile?.message}>
                  <Controller
                    control={control}
                    name='image_path_mobile'
                    render={() => (
                      <AttachmentFile
                        accept='image/*'
                        disabled={isReadonly}
                        uploading={uploadingAttachments}
                        value={mobileAttachment}
                        onChange={(val) => {
                          const item = Array.isArray(val) ? val[0] : val;
                          setMobileAttachment(item);
                          setValue('image_path_mobile', item ? item.remote?.url || item.name : null, {
                            shouldDirty: true,
                            shouldTouch: true,
                            shouldValidate: true,
                          });
                        }}
                        className='[&>div>button]:w-full [&>div>div]:w-full'
                      />
                    )}
                  />
                </FormItem>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppDialog>
  );
};

export default BannerUpsertModal;
