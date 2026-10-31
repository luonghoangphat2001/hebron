import AppDialog from '@/components/dialog/AppDialog';
import FormItem from '@/components/form/FormItem';
import { appToast } from '@/components/toast/AppToast';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import {
  useExampleSentenceSampleCategoryCreateMutation,
  useExampleSentenceSampleCategoryDetailQuery,
  useExampleSentenceSampleCategoryUpdateMutation,
} from '@/data/example-sentence-sample/example-sentence-sample.query';
import {
  exampleSentenceSampleCategoryInputDefault,
  exampleSentenceSampleCategoryUpsertSchema,
  type ExampleSentenceSampleCategoryInput,
} from '@/schemas/example-sentence-sample/example-sentence-sample.schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { Controller, useForm, type Resolver } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

type Props = {
  open: boolean;
  setOpen: (value: boolean) => void;
  categoryId: number | null;
};

const ExampleSentenceSampleCategoryUpsertModal = ({ open, setOpen, categoryId }: Props) => {
  const { t: tContent } = useTranslation('content');
  const { t: tCommon } = useTranslation('common');
  const isEdit = !!categoryId;
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<ExampleSentenceSampleCategoryInput>({
    mode: 'all',
    defaultValues: exampleSentenceSampleCategoryInputDefault,
    resolver: zodResolver(exampleSentenceSampleCategoryUpsertSchema) as Resolver<ExampleSentenceSampleCategoryInput>,
  });
  const { data: detail, isLoading: isDetailLoading } = useExampleSentenceSampleCategoryDetailQuery(
    open && categoryId ? categoryId : undefined,
  );
  const { mutate: create, isPending: isCreating } = useExampleSentenceSampleCategoryCreateMutation();
  const { mutate: update, isPending: isUpdating } = useExampleSentenceSampleCategoryUpdateMutation();

  useEffect(() => {
    if (!open) return;
    if (detail) {
      reset({
        name: detail.name,
        is_active: detail.is_active,
      });
      return;
    }
    if (!categoryId) reset(exampleSentenceSampleCategoryInputDefault);
  }, [categoryId, detail, open, reset]);

  const onCreate = (input: ExampleSentenceSampleCategoryInput) => {
    create(input, {
      onSuccess: () => {
        setOpen(false);
        appToast.success(tCommon('notify.success_create'));
      },
      onError: (error) => appToast.error(error.response?.data.message || tCommon('notify.fail_create')),
    });
  };

  const onUpdate = (input: ExampleSentenceSampleCategoryInput) => {
    if (!categoryId || !isDirty) return;
    update(
      { id: categoryId, ...input },
      {
        onSuccess: () => {
          setOpen(false);
          appToast.success(tCommon('notify.success_update'));
        },
        onError: (error) => appToast.error(error.response?.data.message || tCommon('notify.fail_update')),
      },
    );
  };

  return (
    <AppDialog
      open={open}
      onOpenChange={setOpen}
      title={tContent(isEdit ? 'sample.category_modal_edit' : 'sample.category_modal_create')}
      onOk={handleSubmit(isEdit ? onUpdate : onCreate)}
      okDisabled={isEdit && !isDirty}
      loading={isCreating || isUpdating}
      contentLoading={isEdit && isDetailLoading}
      className='sm:max-w-lg'>
      <div className='space-y-4'>
        <FormItem label={tContent('sample.field_category_name')} required error={errors.name?.message}>
          <Controller
            control={control}
            name='name'
            render={({ field }) => <Input {...field} placeholder={tContent('sample.ph_category_name')} />}
          />
        </FormItem>
        <FormItem label={tContent('sample.field_active')}>
          <Controller
            control={control}
            name='is_active'
            render={({ field }) => <Switch checked={field.value} onCheckedChange={field.onChange} />}
          />
        </FormItem>
      </div>
    </AppDialog>
  );
};

export default ExampleSentenceSampleCategoryUpsertModal;
