import AppDialog from '@/components/dialog/AppDialog';
import FormItem from '@/components/form/FormItem';
import AppSelect from '@/components/select/AppSelect';
import { appToast } from '@/components/toast/AppToast';
import { Input } from '@/components/ui/input';
import { usePermissionCopyMutation } from '@/data/permission/permission.query';
import { nextCopyName } from '@/data/permission/permission.service';
import type { PermissionListItemRESP } from '@/data/permission/permission.response';
import {
  permissionCopyInputDefault,
  permissionCopySchema,
  type PermissionCopyInput,
} from '@/schemas/permission/permission.schema';
import { STATUS_ENUM_KEY } from '@/utils/constants/common.constant';
import { Status } from '@/utils/enums/common.enum';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useMemo } from 'react';
import { Controller, useForm, type Resolver } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

type Props = {
  open: boolean;
  setOpen: (value: boolean) => void;
  source: PermissionListItemRESP | null;
};

const PermissionCopyDialog = ({ open, setOpen, source }: Props) => {
  const { t: tPermission } = useTranslation('system');
  const { t: tEnum } = useTranslation('enum');
  const { t: tCommon } = useTranslation('common');

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PermissionCopyInput>({
    mode: 'all',
    defaultValues: permissionCopyInputDefault,
    resolver: zodResolver(permissionCopySchema) as Resolver<PermissionCopyInput>,
  });

  const { mutate: mutateCopy, isPending: isCopying } = usePermissionCopyMutation();

  const statusOptions = useMemo(
    () => Object.values(Status).map((v) => ({ value: v, label: tEnum(STATUS_ENUM_KEY[v]) })),
    [tEnum],
  );

  useEffect(() => {
    if (!open || !source) return;
    reset({ name: nextCopyName(source.name), usage_status: source.usage_status.value });
  }, [open, source, reset]);

  const onSubmit = (input: PermissionCopyInput) => {
    if (!source || isCopying) return;

    mutateCopy(
      { id: source.id, ...input },
      {
        onSuccess: () => {
          setOpen(false);
          appToast.success(tCommon('notify.success_create'));
        },
        onError: (error) => appToast.error(error.response?.data.message || tCommon('notify.fail_create')),
      },
    );
  };

  return (
    <AppDialog
      open={open}
      onOpenChange={setOpen}
      title={tPermission('permission.modal.title_copy')}
      onOk={handleSubmit(onSubmit)}
      loading={isCopying}
      className='sm:max-w-lg'>
      <div className='space-y-4'>
        <FormItem label={tPermission('permission.field.name')} required error={errors.name?.message}>
          <Controller
            control={control}
            name='name'
            render={({ field }) => <Input {...field} placeholder={tPermission('permission.placeholder.name')} />}
          />
        </FormItem>
        <FormItem label={tPermission('permission.field.status')} required error={errors.usage_status?.message}>
          <Controller
            control={control}
            name='usage_status'
            render={({ field }) => <AppSelect options={statusOptions} value={field.value} onChange={field.onChange} />}
          />
        </FormItem>
      </div>
    </AppDialog>
  );
};

export default PermissionCopyDialog;
