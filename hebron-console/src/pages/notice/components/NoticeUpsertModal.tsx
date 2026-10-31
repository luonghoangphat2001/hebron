import { DateRangePicker } from '@/components/date-picker/DateRangePicker';
import AppDialog from '@/components/dialog/AppDialog';
import FormItem from '@/components/form/FormItem';
import AppSelect from '@/components/select/AppSelect';
import { AppRichTextEditor } from '@/components/shared/app-rich-text-editor';
import { appToast } from '@/components/toast/AppToast';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import AttachmentFile, { uploadAttachmentFiles, type AttachmentFileValue } from '@/components/upload/AttachmentFile';
import {
  useNoticeCategoryListQuery,
  useNoticeCreateMutation,
  useNoticeDetailQuery,
  useNoticeUpdateMutation,
} from '@/data/notice/notice.query';
import { toNoticeUpsertBody, transformNoticeRESPToInput } from '@/data/notice/notice.service';
import { noticeInputDefault, noticeUpsertSchema, type NoticeInput } from '@/schemas/notice/notice.schema';
import { NOTICE_ATTACHMENT_ACCEPT } from '@/utils/constants/attachment.constant';
import { DATE_TIME_FORMAT } from '@/utils/constants/date.constant';
import { PostingStatus } from '@/utils/enums/common.enum';
import { NoticeType } from '@/utils/enums/content.enum';
import { FileType } from '@/utils/enums/file.enum';
import { zodResolver } from '@hookform/resolvers/zod';
import dayjs from 'dayjs';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { DateRange } from 'react-day-picker';
import { Controller, useForm, type Resolver } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

export type NoticeUpsertMode = 'create' | 'edit' | 'view';

type NoticeUpsertModalProps = {
  open: boolean;
  setOpen: (value: boolean) => void;
  noticeId: number | null;
  mode: NoticeUpsertMode;
};

const getAttachmentsSignature = (attachments: AttachmentFileValue[] = []) =>
  attachments
    .map(
      (item) =>
        `${item.localId}:${item.file ? `local-${item.file.size}-${item.file.lastModified}` : `remote-${item.remote?.path || item.remote?.url || ''}`}`,
    )
    .join('|');

const NoticeUpsertModal = ({ open, setOpen, noticeId, mode }: NoticeUpsertModalProps) => {
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
  } = useForm<NoticeInput>({
    mode: 'all',
    defaultValues: noticeInputDefault,
    resolver: zodResolver(noticeUpsertSchema) as Resolver<NoticeInput>,
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

  const { data: dataDetail, isLoading: isDetailLoading } = useNoticeDetailQuery(open && noticeId ? noticeId : undefined);
  const { mutate: mutateCreate, isPending: isCreating } = useNoticeCreateMutation();
  const { mutate: mutateUpdate, isPending: isUpdating } = useNoticeUpdateMutation();

  const { data: categories = [] } = useNoticeCategoryListQuery();
  const categoryOptions = useMemo(() => categories.map((c) => ({ value: c.id, label: c.name })), [categories]);
  const typeOptions = useMemo(() => Object.values(NoticeType).map((v) => ({ value: v, label: tEnum(`content.${v}`) })), [tEnum]);
  const statusOptions = useMemo(
    () => Object.values(PostingStatus).map((v) => ({ value: v, label: tEnum(`common.${v}`) })),
    [tEnum],
  );

  const applyFormValues = (values: NoticeInput) => {
    reset(values);
    attachmentsBaselineRef.current = getAttachmentsSignature(values.attachments || []);
  };

  const submitNotice = async (input: NoticeInput, action: 'create' | 'update') => {
    if (action === 'update' && (!noticeId || !canSave)) return;
    if (isCreating || isUpdating || uploadingAttachments) return;

    try {
      setUploadingAttachments(true);
      const uploadedFiles = await uploadAttachmentFiles(input.attachments, FileType.NOTICE_ATTACHMENTS);
      const body = toNoticeUpsertBody(input, uploadedFiles);

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
        { id: noticeId as number, ...body },
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
      applyFormValues(noticeInputDefault as NoticeInput);
      return;
    }

    if (noticeId && dataDetail && hydratedDetailIdRef.current !== dataDetail.id) {
      hydratedDetailIdRef.current = dataDetail.id;
      applyFormValues(transformNoticeRESPToInput(dataDetail));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- hydrate once per opened notice
  }, [open, noticeId, dataDetail, mode, reset]);

  const title =
    mode === 'create'
      ? tContent('notice.modal_create')
      : mode === 'edit'
        ? tContent('notice.modal_edit')
        : tContent('notice.modal_detail');

  return (
    <AppDialog
      open={open}
      onOpenChange={setOpen}
      title={title}
      onOk={isReadonly ? undefined : handleSubmit((input) => submitNotice(input, isEdit ? 'update' : 'create'))}
      okDisabled={isEdit && !canSave}
      loading={isCreating || isUpdating || uploadingAttachments}
      contentLoading={!!noticeId && isDetailLoading}
      textCancel={isReadonly ? tCommon('button.close') : undefined}
      className='max-w-4xl sm:max-w-4xl'>
      <div className='space-y-4'>
        {/* Row 1: Title & Pinned */}
        <div className='grid grid-cols-1 items-start gap-4 sm:grid-cols-12'>
          <div className='sm:col-span-9 lg:col-span-10'>
            <FormItem label={tContent('notice.field_title')} required={!isReadonly} error={errors.title?.message}>
              <Controller
                control={control}
                name='title'
                render={({ field }) => (
                  <Input {...field} placeholder={tContent('notice.ph_title')} disabled={isReadonly} className='h-9 font-medium' />
                )}
              />
            </FormItem>
          </div>
          <div className='sm:col-span-3 lg:col-span-2'>
            <FormItem label={tContent('notice.field_is_pinned')}>
              <Controller
                control={control}
                name='is_pinned'
                render={({ field }) => (
                  <div className='border-input bg-background flex h-9 items-center justify-between gap-2 rounded-md border px-3'>
                    <span className='text-muted-foreground text-xs'>
                      {field.value ? tContent('notice.badge_pinned') : tEnum('common.INACTIVE')}
                    </span>
                    <Switch checked={field.value} onCheckedChange={field.onChange} disabled={isReadonly} />
                  </div>
                )}
              />
            </FormItem>
          </div>
        </div>

        <div className='grid grid-cols-1 items-start gap-4 sm:grid-cols-2 lg:grid-cols-4'>
          <FormItem label={tContent('notice.field_category')} required={!isReadonly} error={errors.category?.message}>
            <Controller
              control={control}
              name='category'
              render={({ field }) => (
                <AppSelect
                  options={categoryOptions}
                  value={field.value}
                  placeholder={tContent('notice.ph_select_category')}
                  onChange={field.onChange}
                  disabled={isReadonly}
                />
              )}
            />
          </FormItem>
          <FormItem label={tContent('notice.field_type')} required={!isReadonly} error={errors.type?.message}>
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
            label={tContent('notice.field_exposure_status')}
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
          <FormItem
            label={tContent('notice.field_period')}
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
        </div>

        <FormItem label={tContent('notice.field_content')} required={!isReadonly} error={errors.content?.message}>
          <Controller
            control={control}
            name='content'
            render={({ field }) => (
              <AppRichTextEditor
                value={field.value}
                onValueChange={field.onChange}
                placeholder={tContent('notice.ph_content')}
                disabled={isReadonly}
                isInvalid={!!errors.content}
                minHeight={280}
                imageUploadMode='immediate'
                imageFileType={FileType.NOTICE_ATTACHMENTS}
              />
            )}
          />
        </FormItem>

        <FormItem label={tContent('notice.field_attachment')}>
          <Controller
            control={control}
            name='attachments'
            render={({ field }) => (
              <AttachmentFile
                multiple
                accept={NOTICE_ATTACHMENT_ACCEPT}
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

export default NoticeUpsertModal;
