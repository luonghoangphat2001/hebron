import { DateRangePicker } from '@/components/date-picker/DateRangePicker';
import AppDialog from '@/components/dialog/AppDialog';
import FormItem from '@/components/form/FormItem';
import AppSelect from '@/components/select/AppSelect';
import { appToast } from '@/components/toast/AppToast';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import AttachmentFile, { uploadAttachmentFiles, type AttachmentFileValue } from '@/components/upload/AttachmentFile';
import { useGuideCreateMutation, useGuideDetailQuery, useGuideUpdateMutation } from '@/data/guide/guide.query';
import { toGuideUpsertBody, transformGuideRESPToInput } from '@/data/guide/guide.service';
import { guideInputDefault, guideUpsertSchema, type GuideInput } from '@/schemas/guide/guide.schema';
import { GUIDE_ATTACHMENT_ACCEPT } from '@/utils/constants/attachment.constant';
import { DATE_TIME_FORMAT } from '@/utils/constants/date.constant';
import { PostingStatus } from '@/utils/enums/common.enum';
import { GuideType } from '@/utils/enums/content.enum';
import { FileType } from '@/utils/enums/file.enum';
import { zodResolver } from '@hookform/resolvers/zod';
import dayjs from 'dayjs';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { DateRange } from 'react-day-picker';
import { Controller, useForm, type Resolver } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

export type GuideUpsertMode = 'create' | 'edit' | 'view';

type GuideUpsertModalProps = {
  open: boolean;
  setOpen: (value: boolean) => void;
  guideId: number | null;
  mode: GuideUpsertMode;
};

const getAttachmentsSignature = (attachments: AttachmentFileValue[] = []) =>
  attachments
    .map(
      (item) =>
        `${item.localId}:${item.file ? `local-${item.file.size}-${item.file.lastModified}` : `remote-${item.remote?.path || item.remote?.url || ''}`}`,
    )
    .join('|');

const GuideUpsertModal = ({ open, setOpen, guideId, mode }: GuideUpsertModalProps) => {
  const { t: tContent } = useTranslation('content');
  const { t: tCommon } = useTranslation('common');
  const { t: tEnum } = useTranslation('enum');

  const isReadonly = mode === 'view';
  const isEdit = mode === 'edit';
  const [uploadingAttachments, setUploadingAttachments] = useState(false);
  const attachmentsBaselineRef = useRef('');
  const hydratedDetailIdRef = useRef<number | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isDirty },
  } = useForm<GuideInput>({
    mode: 'all',
    defaultValues: guideInputDefault,
    resolver: zodResolver(guideUpsertSchema) as Resolver<GuideInput>,
  });

  const startDate = watch('exposure_start_date');
  const endDate = watch('exposure_end_date');
  const attachments = watch('attachments') || [];
  const period: DateRange | undefined =
    startDate || endDate
      ? {
          from: startDate ? dayjs(startDate).toDate() : undefined,
          to: endDate ? dayjs(endDate).toDate() : undefined,
        }
      : undefined;

  const isAttachmentsDirty = getAttachmentsSignature(attachments) !== attachmentsBaselineRef.current;
  const canSave = !isEdit || isDirty || isAttachmentsDirty;

  const { data: dataDetail, isLoading: isDetailLoading } = useGuideDetailQuery(open && guideId ? guideId : undefined);
  const { mutate: mutateCreate, isPending: isCreating } = useGuideCreateMutation();
  const { mutate: mutateUpdate, isPending: isUpdating } = useGuideUpdateMutation();

  const typeOptions = useMemo(() => Object.values(GuideType).map((v) => ({ value: v, label: tEnum(`content.${v}`) })), [tEnum]);
  const statusOptions = useMemo(
    () => Object.values(PostingStatus).map((v) => ({ value: v, label: tEnum(`common.${v}`) })),
    [tEnum],
  );

  const applyFormValues = (values: GuideInput) => {
    reset(values);
    attachmentsBaselineRef.current = getAttachmentsSignature(values.attachments || []);
  };

  const submitGuide = async (input: GuideInput, action: 'create' | 'update') => {
    if (action === 'update' && (!guideId || !canSave)) return;
    if (isCreating || isUpdating || uploadingAttachments) return;

    try {
      setUploadingAttachments(true);
      const uploadedFiles = await uploadAttachmentFiles(input.attachments, FileType.GUIDE_CONTENT_ATTACHMENTS);
      const body = toGuideUpsertBody(input, uploadedFiles);

      if (action === 'create') {
        mutateCreate(body, {
          onSuccess: () => {
            setOpen(false);
            appToast.success(tCommon('notify.success_create'));
          },
          onError: (error) => {
            appToast.error(error.response?.data.message || tCommon('notify.fail_create'));
          },
        });
        return;
      }

      mutateUpdate(
        { id: guideId as number, ...body },
        {
          onSuccess: () => {
            setOpen(false);
            appToast.success(tCommon('notify.success_update'));
          },
          onError: (error) => {
            appToast.error(error.response?.data.message || tCommon('notify.fail_update'));
          },
        },
      );
    } catch {
      appToast.error(tCommon('notify.fail_upload'));
    } finally {
      setUploadingAttachments(false);
    }
  };

  useEffect(() => {
    if (!open) {
      hydratedDetailIdRef.current = null;
      return;
    }

    if (mode === 'create') {
      applyFormValues(guideInputDefault as GuideInput);
      return;
    }

    if (guideId && dataDetail && hydratedDetailIdRef.current !== Number(dataDetail.id)) {
      hydratedDetailIdRef.current = Number(dataDetail.id);
      applyFormValues(transformGuideRESPToInput(dataDetail));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- hydrate once per opened guide
  }, [open, guideId, dataDetail, mode, reset]);

  const title =
    mode === 'create'
      ? tContent('guide.modal_create')
      : mode === 'edit'
        ? tContent('guide.modal_edit')
        : tContent('guide.modal_detail');

  return (
    <AppDialog
      open={open}
      onOpenChange={setOpen}
      title={title}
      onOk={isReadonly ? undefined : handleSubmit((input) => submitGuide(input, isEdit ? 'update' : 'create'))}
      okDisabled={isEdit && !canSave}
      loading={isCreating || isUpdating || uploadingAttachments}
      contentLoading={!!guideId && isDetailLoading}
      textCancel={isReadonly ? tCommon('button.close') : undefined}
      className='sm:max-w-2xl'>
      <div className='space-y-4'>
        <div className='grid grid-cols-2 items-start gap-4'>
          <FormItem label={tContent('guide.field_type')} required={!isReadonly} error={errors.type?.message}>
            <Controller
              control={control}
              name='type'
              render={({ field }) => (
                <AppSelect
                  options={typeOptions}
                  value={field.value}
                  placeholder={tContent('filter.ph_select_type')}
                  onChange={field.onChange}
                  disabled={isReadonly}
                />
              )}
            />
          </FormItem>
          <FormItem
            label={tContent('guide.field_exposure_status')}
            required={!isReadonly}
            error={errors.exposure_status?.message}>
            <Controller
              control={control}
              name='exposure_status'
              render={({ field }) => (
                <AppSelect
                  options={statusOptions}
                  value={field.value}
                  placeholder={tContent('filter.ph_select_status')}
                  onChange={field.onChange}
                  disabled={isReadonly}
                />
              )}
            />
          </FormItem>
        </div>

        <FormItem label={tContent('guide.field_title')} required={!isReadonly} error={errors.title?.message}>
          <Controller
            control={control}
            name='title'
            render={({ field }) => <Input {...field} placeholder={tContent('guide.ph_title')} disabled={isReadonly} />}
          />
        </FormItem>

        <FormItem
          label={tContent('guide.field_period')}
          required={!isReadonly}
          error={errors.exposure_start_date?.message || errors.exposure_end_date?.message}>
          <DateRangePicker
            value={period}
            disabled={isReadonly}
            placeholder={tCommon('filter.pick_date_range')}
            onChange={(value) => {
              setValue('exposure_start_date', value?.from ? dayjs(value.from).format(DATE_TIME_FORMAT) : '', {
                shouldDirty: true,
                shouldValidate: true,
              });
              setValue('exposure_end_date', value?.to ? dayjs(value.to).endOf('day').format(DATE_TIME_FORMAT) : '', {
                shouldDirty: true,
                shouldValidate: true,
              });
            }}
          />
        </FormItem>

        <FormItem label={tContent('guide.field_content')} required={!isReadonly} error={errors.content?.message}>
          <Controller
            control={control}
            name='content'
            render={({ field }) => (
              <Textarea
                {...field}
                placeholder={tContent('guide.ph_content')}
                className='min-h-40 resize-none'
                disabled={isReadonly}
              />
            )}
          />
        </FormItem>

        <FormItem label={tContent('guide.field_attachment')}>
          <Controller
            control={control}
            name='attachments'
            render={({ field }) => (
              <AttachmentFile
                multiple
                accept={GUIDE_ATTACHMENT_ACCEPT}
                disabled={isReadonly}
                uploading={uploadingAttachments}
                value={field.value}
                onChange={(value) => {
                  const next = Array.isArray(value) ? value : value ? [value] : ([] as AttachmentFileValue[]);
                  setValue('attachments', next, { shouldDirty: true, shouldTouch: true, shouldValidate: true });
                }}
              />
            )}
          />
        </FormItem>
      </div>
    </AppDialog>
  );
};

export default GuideUpsertModal;
