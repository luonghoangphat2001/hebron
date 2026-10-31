import AppDialog from '@/components/dialog/AppDialog';
import FormItem from '@/components/form/FormItem';
import { appToast } from '@/components/toast/AppToast';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import {
  useOptionGroupCreateMutation,
  useOptionGroupDetailQuery,
  useOptionGroupUpdateMutation,
} from '@/data/option-group/option-group.query';
import {
  optionGroupCreateInputDefault,
  optionGroupCreateSchema,
  type OptionGroupCreateInput,
} from '@/schemas/option-group/option-group.schema';
import { OptionGroupDisplayType } from '@/utils/enums/option-group.enum';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { Controller, useForm, type Resolver } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

type Props = {
  open: boolean;
  setOpen: (value: boolean) => void;
  optionGroupId?: number;
};

const OptionGroupUpsertModal = ({ open, setOpen, optionGroupId }: Props) => {
  const { t: tCommon } = useTranslation('common');
  const { t } = useTranslation('option');
  const isEdit = !!optionGroupId;

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<OptionGroupCreateInput>({
    mode: 'all',
    defaultValues: optionGroupCreateInputDefault,
    resolver: zodResolver(optionGroupCreateSchema) as Resolver<OptionGroupCreateInput>,
  });

  const { data: dataDetail, isLoading: isDetailLoading } = useOptionGroupDetailQuery(
    open && optionGroupId ? optionGroupId : undefined,
  );
  const { mutate: mutateCreate, isPending: isCreating } = useOptionGroupCreateMutation();
  const { mutate: mutateUpdate, isPending: isUpdating } = useOptionGroupUpdateMutation();

  useEffect(() => {
    if (!open) return;

    if (!isEdit) {
      reset(optionGroupCreateInputDefault as OptionGroupCreateInput);
      return;
    }

    if (dataDetail) {
      reset({
        code: dataDetail.code,
        name: dataDetail.name,
        display_type: OptionGroupDisplayType.SELECT,
        is_required: dataDetail.is_required,
      });
    }
  }, [open, isEdit, dataDetail, reset]);

  const onSubmit = (input: OptionGroupCreateInput) => {
    if (isEdit) {
      mutateUpdate(
        {
          id: optionGroupId,
          name: input.name,
          display_type: OptionGroupDisplayType.SELECT,
          is_required: input.is_required,
        },
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
      return;
    }

    mutateCreate(
      { ...input, display_type: OptionGroupDisplayType.SELECT },
      {
        onSuccess: () => {
          setOpen(false);
          appToast.success(tCommon('notify.success_create'));
        },
        onError: (error) => {
          appToast.error(error.response?.data.message || tCommon('notify.fail_create'));
        },
      },
    );
  };

  return (
    <AppDialog
      open={open}
      onOpenChange={setOpen}
      title={isEdit ? t('group.modal.edit_title') : t('group.modal.create_title')}
      onOk={handleSubmit(onSubmit)}
      loading={isCreating || isUpdating}
      contentLoading={isEdit && isDetailLoading}
      className='sm:max-w-lg'>
      <div className='space-y-5'>
        <FormItem label={t('group.modal.field_code')} required error={errors.code?.message}>
          <Controller
            control={control}
            name='code'
            render={({ field }) => (
              <Input {...field} placeholder={t('group.modal.code_placeholder')} disabled={isEdit} className='font-mono' />
            )}
          />
        </FormItem>

        <FormItem label={t('group.modal.field_name')} required error={errors.name?.message}>
          <Controller
            control={control}
            name='name'
            render={({ field }) => <Input {...field} placeholder={t('group.modal.name_placeholder')} />}
          />
        </FormItem>

        <FormItem label={t('group.modal.field_status')}>
          <Controller
            control={control}
            name='is_required'
            render={({ field }) => (
              <label className='flex h-9 cursor-pointer items-center justify-between rounded-md border border-gray-200 px-3'>
                <span className='text-sm font-medium text-gray-700'>
                  {field.value ? t('group.modal.required') : t('group.modal.not_required')}
                </span>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </label>
            )}
          />
        </FormItem>
      </div>
    </AppDialog>
  );
};

export default OptionGroupUpsertModal;
