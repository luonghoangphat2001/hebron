import AppDialog from '@/components/dialog/AppDialog';
import FormItem from '@/components/form/FormItem';
import AppSelect from '@/components/select/AppSelect';
import { AppRichTextEditor } from '@/components/shared/app-rich-text-editor';
import { appToast } from '@/components/toast/AppToast';
import { Input } from '@/components/ui/input';
import { useFAQCategoryListQuery, useFAQCreateMutation, useFAQDetailQuery, useFAQUpdateMutation } from '@/data/faq/faq.query';
import { transformFAQRESPToInput } from '@/data/faq/faq.service';
import { faqInputDefault, faqUpsertSchema, type FAQInput } from '@/schemas/faq/faq.schema';
import { PostingStatus } from '@/utils/enums/common.enum';
import { ExposureTarget, FAQ_SITE_TYPES } from '@/utils/enums/content.enum';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useMemo } from 'react';
import { Controller, useForm, type Resolver } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

export type FAQUpsertMode = 'create' | 'edit' | 'view';

type FAQUpsertModalProps = {
  open: boolean;
  setOpen: (value: boolean) => void;
  faqId: number | null;
  mode: FAQUpsertMode;
};

const FAQUpsertModal = ({ open, setOpen, faqId, mode }: FAQUpsertModalProps) => {
  const { t: tContent } = useTranslation('content');
  const { t: tCommon } = useTranslation('common');
  const { t: tEnum } = useTranslation('enum');

  const isReadonly = mode === 'view';
  const isEdit = mode === 'edit';

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<FAQInput>({
    mode: 'all',
    defaultValues: faqInputDefault,
    resolver: zodResolver(faqUpsertSchema) as Resolver<FAQInput>,
  });

  const { data: dataDetail, isLoading: isDetailLoading } = useFAQDetailQuery(open && faqId ? faqId : undefined);
  const { data: categories = [] } = useFAQCategoryListQuery();
  const { mutate: mutateCreate, isPending: isCreating } = useFAQCreateMutation();
  const { mutate: mutateUpdate, isPending: isUpdating } = useFAQUpdateMutation();

  const categoryOptions = useMemo(
    () =>
      categories.map(({ slug, name }) => ({
        value: slug || name,
        label: name,
      })),
    [categories],
  );
  const siteTypeOptions = useMemo(() => FAQ_SITE_TYPES.map((v) => ({ value: v, label: tEnum(`common.${v}`) })), [tEnum]);
  const postingStatusOptions = useMemo(
    () => Object.values(PostingStatus).map((v) => ({ value: v, label: tEnum(`common.${v}`) })),
    [tEnum],
  );
  const targetOptions = useMemo(
    () => Object.values(ExposureTarget).map((v) => ({ value: v, label: tEnum(`content.${v}`) })),
    [tEnum],
  );

  const onCreate = (input: FAQInput) => {
    if (isCreating) return;

    mutateCreate(input, {
      onSuccess: () => {
        setOpen(false);
        appToast.success(tCommon('notify.success_create'));
      },
      onError: (error) => {
        appToast.error(error.response?.data.message || tCommon('notify.fail_create'));
      },
    });
  };

  const onUpdate = (input: FAQInput) => {
    if (!faqId || isUpdating || !isDirty) return;

    mutateUpdate(
      { id: faqId, ...input },
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
  };

  useEffect(() => {
    if (!open) return;

    if (faqId && dataDetail) {
      reset(transformFAQRESPToInput(dataDetail));
      return;
    }

    if (mode === 'create') {
      reset(faqInputDefault);
    }
  }, [open, faqId, dataDetail, mode, reset]);

  const title =
    mode === 'create'
      ? tContent('faq.modal_create')
      : mode === 'edit'
        ? tContent('faq.modal_edit')
        : tContent('faq.modal_detail');

  return (
    <AppDialog
      open={open}
      onOpenChange={setOpen}
      title={title}
      onOk={isReadonly ? undefined : handleSubmit(isEdit ? onUpdate : onCreate)}
      okDisabled={isEdit && !isDirty}
      loading={isCreating || isUpdating}
      contentLoading={!!faqId && isDetailLoading}
      textCancel={isReadonly ? tCommon('button.close') : undefined}
      className='sm:max-w-4xl'>
      <div className='space-y-4'>
        <div className='grid grid-cols-3 items-start gap-4'>
          <FormItem label={tContent('faq.field_site_type')} required={!isReadonly} error={errors.site_type?.message}>
            <Controller
              control={control}
              name='site_type'
              render={({ field }) => (
                <AppSelect
                  options={siteTypeOptions}
                  value={field.value}
                  placeholder={tContent('filter.ph_select_site_type')}
                  onChange={field.onChange}
                  disabled={isReadonly}
                />
              )}
            />
          </FormItem>
          <FormItem label={tContent('faq.field_category')} required={!isReadonly} error={errors.category?.message}>
            <Controller
              control={control}
              name='category'
              render={({ field }) => (
                <AppSelect
                  options={categoryOptions}
                  value={field.value}
                  placeholder={tContent('filter.ph_select_category')}
                  onChange={field.onChange}
                  disabled={isReadonly}
                />
              )}
            />
          </FormItem>
          <FormItem label={tContent('faq.field_status')} required={!isReadonly} error={errors.posting_status?.message}>
            <Controller
              control={control}
              name='posting_status'
              render={({ field }) => (
                <AppSelect
                  options={postingStatusOptions}
                  value={field.value}
                  placeholder={tContent('filter.ph_select_status')}
                  onChange={field.onChange}
                  disabled={isReadonly}
                />
              )}
            />
          </FormItem>
          {/* <FormItem label={tContent('faq.field_exposure_target')} required={!isReadonly} error={errors.exposure_target?.message}>
            <Controller
              control={control}
              name='exposure_target'
              render={({ field }) => (
                <AppSelect
                  options={targetOptions}
                  value={field.value?.[0]}
                  placeholder={tContent('filter.ph_select_target')}
                  onChange={(value) => field.onChange(value ? [value] : [])}
                  disabled={isReadonly}
                />
              )}
            />
          </FormItem> */}
          <FormItem label={tContent('faq.field_sort_order')} required={!isReadonly} error={errors.sort_order?.message}>
            <Controller
              control={control}
              name='sort_order'
              render={({ field }) => (
                <Input
                  type='number'
                  min={0}
                  placeholder={tContent('faq.ph_sort_order')}
                  value={field.value}
                  onChange={(e) => field.onChange(Number(e.target.value) || 0)}
                  disabled={isReadonly}
                />
              )}
            />
          </FormItem>
        </div>
        <FormItem label={tContent('faq.field_question')} required={!isReadonly} error={errors.question?.message}>
          <Controller
            control={control}
            name='question'
            render={({ field }) => <Input {...field} placeholder={tContent('faq.ph_question')} disabled={isReadonly} />}
          />
        </FormItem>
        <FormItem label={tContent('faq.field_answer')} required={!isReadonly} error={errors.answer?.message}>
          <Controller
            control={control}
            name='answer'
            render={({ field }) => (
              <AppRichTextEditor
                value={field.value}
                onValueChange={field.onChange}
                placeholder={tContent('faq.ph_answer')}
                minHeight={200}
                disabled={isReadonly}
                isInvalid={!!errors.answer}
              />
            )}
          />
        </FormItem>
      </div>
    </AppDialog>
  );
};

export default FAQUpsertModal;
