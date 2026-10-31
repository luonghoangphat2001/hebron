import AppDialog from '@/components/dialog/AppDialog';
import FormItem from '@/components/form/FormItem';
import { appToast } from '@/components/toast/AppToast';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { useOptionCreateMutation, useOptionDetailQuery, useOptionUpdateMutation } from '@/data/option/option.query';
import { optionCreateInputDefault, optionCreateSchema, type OptionCreateInput } from '@/schemas/option/option.schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { Controller, useForm, type Resolver } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

type Props = {
  open: boolean;
  setOpen: (value: boolean) => void;
  optionGroupId: number | string;
  optionId?: number;
};

const OptionUpsertModal = ({ open, setOpen, optionGroupId, optionId }: Props) => {
  const { t: tCommon } = useTranslation('common');
  const { t } = useTranslation('option');
  const isEdit = !!optionId;

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<OptionCreateInput>({
    mode: 'all',
    defaultValues: optionCreateInputDefault,
    resolver: zodResolver(optionCreateSchema) as Resolver<OptionCreateInput>,
  });

  const { data: dataDetail, isLoading: isDetailLoading } = useOptionDetailQuery(open && optionId ? optionId : undefined);
  const { mutate: mutateCreate, isPending: isCreating } = useOptionCreateMutation();
  const { mutate: mutateUpdate, isPending: isUpdating } = useOptionUpdateMutation();

  useEffect(() => {
    if (!open) return;

    if (!isEdit) {
      reset(optionCreateInputDefault as OptionCreateInput);
      return;
    }

    if (dataDetail) {
      reset({
        name: dataDetail.name,
        additional_price: dataDetail.additional_price,
        additional_brand_site_price: dataDetail.additional_brand_site_price,
        sort_order: dataDetail.sort_order,
        is_active: dataDetail.is_active,
      });
    }
  }, [open, isEdit, dataDetail, reset]);

  const onSubmit = (input: OptionCreateInput) => {
    // Keep both API fields in sync with the shared brand/plain site price.
    const payload = { ...input, additional_plain_site_price: input.additional_brand_site_price };

    if (isEdit) {
      mutateUpdate(
        { id: optionId, ...payload },
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
      { ...payload, option_group_id: optionGroupId },
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
      title={isEdit ? t('option.modal.edit_title') : t('option.modal.create_title')}
      onOk={handleSubmit(onSubmit)}
      loading={isCreating || isUpdating}
      contentLoading={isEdit && isDetailLoading}
      className='sm:max-w-xl'>
      <div className='space-y-5'>
        <div className='grid grid-cols-3 items-start gap-4'>
          <div className='col-span-2'>
            <FormItem label={t('option.modal.field_name')} required error={errors.name?.message}>
              <Controller
                control={control}
                name='name'
                render={({ field }) => <Input {...field} placeholder={t('option.modal.name_placeholder')} />}
              />
            </FormItem>
          </div>
          <FormItem label={t('option.modal.field_sort_order')} required error={errors.sort_order?.message}>
            <Controller
              control={control}
              name='sort_order'
              render={({ field }) => (
                <Input
                  type='number'
                  min={0}
                  className='text-right'
                  value={field.value}
                  onChange={(e) => field.onChange(Number(e.target.value) || 0)}
                />
              )}
            />
          </FormItem>
        </div>

        <div className='space-y-3'>
          <p className='text-sm font-medium text-gray-700'>{t('option.modal.field_additional_price')}</p>
          <div className='grid grid-cols-2 gap-4'>
            <FormItem label={t('option.modal.field_default')} required error={errors.additional_price?.message}>
              <Controller
                control={control}
                name='additional_price'
                render={({ field }) => (
                  <Input
                    type='number'
                    min={0}
                    className='text-right'
                    value={field.value}
                    onChange={(e) => field.onChange(Number(e.target.value) || 0)}
                  />
                )}
              />
            </FormItem>

            <FormItem label={t('option.modal.field_brand_site')} required error={errors.additional_brand_site_price?.message}>
              <Controller
                control={control}
                name='additional_brand_site_price'
                render={({ field }) => (
                  <Input
                    type='number'
                    min={0}
                    className='text-right'
                    value={field.value}
                    onChange={(e) => field.onChange(Number(e.target.value) || 0)}
                  />
                )}
              />
            </FormItem>
          </div>
        </div>

        <FormItem label={t('option.modal.field_status')}>
          <Controller
            control={control}
            name='is_active'
            render={({ field }) => (
              <label className='flex h-9 cursor-pointer items-center justify-between rounded-md border border-gray-200 px-3'>
                <span className='text-sm font-medium text-gray-700'>
                  {field.value ? t('option.modal.active') : t('option.modal.inactive')}
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

export default OptionUpsertModal;
