import { DateRangePicker } from '@/components/date-picker/DateRangePicker';
import AppDialog from '@/components/dialog/AppDialog';
import FormItem from '@/components/form/FormItem';
import { appToast } from '@/components/toast/AppToast';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import AttachmentFile, { type AttachmentFileValue } from '@/components/upload/AttachmentFile';
import { usePopupCreateMutation, usePopupDetailQuery, usePopupUpdateMutation } from '@/data/popup/popup.query';
import {
  dateRangeToPopupDates,
  popupDatesToDateRange,
  resolvePopupImage,
  transformPopupInputToCreateREQ,
  transformPopupInputToUpdateREQ,
  transformPopupRESPToInput,
  urlToAttachmentValue,
} from '@/data/popup/popup.service';
import { popupInputDefault, popupUpsertSchema, type PopupInput } from '@/schemas/popup/popup.schema';
import { ExposureStatus } from '@/utils/enums/common.enum';
import { ExposureTarget } from '@/utils/enums/content.enum';
import { PopupLocation } from '@/utils/enums/popup.enum';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useMemo, useState } from 'react';
import type { DateRange } from 'react-day-picker';
import { Controller, useForm, type Resolver } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

export type PopupUpsertMode = 'create' | 'edit' | 'view';

type PopupUpsertModalProps = {
  open: boolean;
  setOpen: (value: boolean) => void;
  popupId?: number | null;
  mode?: PopupUpsertMode;
};

const PopupUpsertModal = ({ open, setOpen, popupId = null, mode = 'create' }: PopupUpsertModalProps) => {
  const { t: tContent } = useTranslation('content');
  const { t: tCommon } = useTranslation('common');
  const { t: tEnum } = useTranslation('enum');

  const isReadonly = mode === 'view';
  const isEdit = mode === 'edit';
  const [attachment, setAttachment] = useState<AttachmentFileValue | undefined>();
  const [uploadingAttachment, setUploadingAttachment] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isDirty },
  } = useForm<PopupInput>({
    mode: 'all',
    defaultValues: popupInputDefault,
    resolver: zodResolver(popupUpsertSchema) as Resolver<PopupInput>,
  });

  const { data: dataDetail, isLoading: isDetailLoading } = usePopupDetailQuery(open && popupId ? popupId : undefined);
  const { mutate: mutateCreate, isPending: isCreating } = usePopupCreateMutation();
  const { mutate: mutateUpdate, isPending: isUpdating } = usePopupUpdateMutation();

  const locationOptions = useMemo(
    () => Object.values(PopupLocation).map((v) => ({ value: v, label: tEnum(`content.${v}` as any) })),
    [tEnum],
  );

  const targetOptions = useMemo(
    () => Object.values(ExposureTarget).map((v) => ({ value: v, label: tEnum(`content.${v}` as any) })),
    [tEnum],
  );

  const exposurePeriod: DateRange | undefined = popupDatesToDateRange(watch('exposure_start_date'), watch('exposure_end_date'));

  const handlePeriodChange = (range: DateRange | undefined) => {
    const { exposure_start_date, exposure_end_date } = dateRangeToPopupDates(range);
    setValue('exposure_start_date', exposure_start_date, { shouldDirty: true, shouldTouch: true, shouldValidate: true });
    setValue('exposure_end_date', exposure_end_date, { shouldDirty: true, shouldTouch: true, shouldValidate: true });
  };

  const onCreate = async (input: PopupInput) => {
    if (isCreating || uploadingAttachment) return;

    try {
      setUploadingAttachment(true);
      const image_path = await resolvePopupImage(input, attachment);
      const finalInput: PopupInput = { ...input, image_path };

      mutateCreate(transformPopupInputToCreateREQ(finalInput), {
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
      setUploadingAttachment(false);
    }
  };

  const onUpdate = async (input: PopupInput) => {
    if (!popupId || isUpdating || uploadingAttachment || !isDirty) return;

    try {
      setUploadingAttachment(true);
      const image_path = await resolvePopupImage(input, attachment);
      const finalInput: PopupInput = { ...input, image_path };

      mutateUpdate(transformPopupInputToUpdateREQ(popupId, finalInput), {
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
      setUploadingAttachment(false);
    }
  };

  useEffect(() => {
    if (!open) return;

    if (popupId && dataDetail) {
      const input = transformPopupRESPToInput(dataDetail);
      reset(input);
      setAttachment(urlToAttachmentValue(input.image_path));
      return;
    }

    if (mode === 'create') {
      reset(popupInputDefault);
      setAttachment(undefined);
    }
  }, [open, popupId, dataDetail, mode, reset]);

  const title =
    mode === 'create'
      ? tContent('popup.modal_create')
      : mode === 'edit'
        ? tContent('popup.modal_edit' as any)
        : tContent('popup.modal_detail' as any);

  return (
    <AppDialog
      open={open}
      onOpenChange={setOpen}
      title={title}
      onOk={isReadonly ? undefined : handleSubmit(isEdit ? onUpdate : onCreate)}
      okDisabled={isEdit && !isDirty}
      loading={isCreating || isUpdating || uploadingAttachment}
      contentLoading={!!popupId && isDetailLoading}
      textCancel={isReadonly ? tCommon('button.close') : undefined}
      className='sm:max-w-xl'>
      <div className='space-y-4'>
        <div className='rounded-md border border-gray-200 p-4'>
          <div className='flex items-center justify-between'>
            <p className='text-base font-medium'>{tContent('popup.settings_title')}</p>
            <Controller
              control={control}
              name='status'
              render={({ field }) => (
                <div className='flex items-center gap-2'>
                  <Checkbox
                    id='popup-expose'
                    checked={field.value === ExposureStatus.EXPOSED}
                    onCheckedChange={(checked) => field.onChange(checked ? ExposureStatus.EXPOSED : ExposureStatus.NON_EXPOSED)}
                    disabled={isReadonly}
                  />
                  <label htmlFor='popup-expose' className='cursor-pointer text-sm'>
                    {tContent('popup.exposure')}
                  </label>
                </div>
              )}
            />
          </div>
          <Separator className='my-3' />
          <div className='space-y-4'>
            <FormItem label={tContent('popup.field_name')} required={!isReadonly} error={errors.name?.message}>
              <Controller
                control={control}
                name='name'
                render={({ field }) => <Input {...field} placeholder={tContent('popup.ph_name')} disabled={isReadonly} />}
              />
            </FormItem>
            <div className='grid grid-cols-2 gap-4'>
              {/* <FormItem label={tContent('popup.field_target')} required={!isReadonly} error={errors.exposure_target?.message}>
                <Controller
                  control={control}
                  name='exposure_target'
                  render={({ field }) => (
                    <AppSelect
                      options={targetOptions}
                      value={field.value}
                      placeholder={tContent('filter.ph_select_site')}
                      onChange={field.onChange}
                      disabled={isReadonly}
                    />
                  )}
                />
              </FormItem>
              <FormItem label={tContent('popup.field_location')} required={!isReadonly} error={errors.exposure_location?.message}>
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
            </div>
            <FormItem
              label={tContent('popup.field_period')}
              required={!isReadonly}
              error={errors.exposure_start_date?.message || errors.exposure_end_date?.message}>
              <DateRangePicker
                value={exposurePeriod}
                onChange={handlePeriodChange}
                placeholder={tCommon('filter.pick_date_range')}
                disabled={isReadonly}
              />
            </FormItem>
            <div className='grid grid-cols-2 gap-4'>
              <FormItem label={tContent('popup.field_width')} required={!isReadonly} error={errors.width?.message}>
                <Controller
                  control={control}
                  name='width'
                  render={({ field }) => (
                    <Input
                      type='number'
                      placeholder='400'
                      {...field}
                      value={field.value ?? ''}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                      disabled={isReadonly}
                    />
                  )}
                />
              </FormItem>
              <FormItem label={tContent('popup.field_height')} required={!isReadonly} error={errors.height?.message}>
                <Controller
                  control={control}
                  name='height'
                  render={({ field }) => (
                    <Input
                      type='number'
                      placeholder='300'
                      {...field}
                      value={field.value ?? ''}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                      disabled={isReadonly}
                    />
                  )}
                />
              </FormItem>
            </div>
            <FormItem label={tContent('popup.field_image')} required={!isReadonly} error={errors.image_path?.message}>
              <Controller
                control={control}
                name='image_path'
                render={() => (
                  <AttachmentFile
                    accept='image/*'
                    disabled={isReadonly}
                    uploading={uploadingAttachment}
                    value={attachment}
                    onChange={(val) => {
                      const item = Array.isArray(val) ? val[0] : val;
                      setAttachment(item);
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
        </div>
      </div>
    </AppDialog>
  );
};

export default PopupUpsertModal;
