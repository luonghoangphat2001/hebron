import AppCheckBox from '@/components/checkbox/AppCheckBox';
import AppDialog from '@/components/dialog/AppDialog';
import FormItem from '@/components/form/FormItem';
import AppSelect from '@/components/select/AppSelect';
import { appToast } from '@/components/toast/AppToast';
import { Input } from '@/components/ui/input';
import { useAdminCreateMutation, useAdminDetailQuery, useAdminUpdateMutation } from '@/data/admin/admin.query';
import {
  transformAdminInputToCreateREQ,
  transformAdminInputToUpdateREQ,
  transformAdminRESPToInput,
} from '@/data/admin/admin.service';
import { usePermissionDetailQuery, usePermissionListQuery } from '@/data/permission/permission.query';
import { adminInputDefault, adminUpsertSchema, type AdminInput } from '@/schemas/admin/admin.schema';
import { Status } from '@/utils/enums/common.enum';
import { formatPhone } from '@/utils/helper/common.helper';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useMemo } from 'react';
import { Controller, useForm, useWatch, type Resolver } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

type AdministratorUpsertModalProps = {
  open: boolean;
  setOpen: (value: boolean) => void;
  adminId: number | null;
};

const AdministratorUpsertModal = ({ open, setOpen, adminId }: AdministratorUpsertModalProps) => {
  const { t: tCommon } = useTranslation('common');
  const { t: tEnum } = useTranslation('enum');

  //hook form
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AdminInput>({
    mode: 'all',
    defaultValues: adminInputDefault,
    resolver: zodResolver(adminUpsertSchema(!!adminId)) as Resolver<AdminInput>,
  });

  //api create
  const { mutate: mutateCreate, isPending: isCreating } = useAdminCreateMutation();
  //api detail
  const { data: dataDetail, isLoading } = useAdminDetailQuery(adminId || undefined);
  //api update
  const { mutate: mutateUpdate, isPending: isUpdating } = useAdminUpdateMutation();
  //api permission list (active only)
  const { data: dataPermission } = usePermissionListQuery({ page: 1, per_page: 100, usage_status: Status.ACTIVE });

  const permissionId = useWatch({ control, name: 'permission' });
  const { data: assignedPermission } = usePermissionDetailQuery(permissionId);

  const permissionOptions = useMemo(() => {
    const options = (dataPermission?.list || []).map((item) => ({ value: item.id, label: item.name }));
    if (assignedPermission && !options.some((option) => option.value === assignedPermission.id)) {
      options.push({ value: assignedPermission.id, label: assignedPermission.name });
    }
    return options;
  }, [dataPermission, assignedPermission]);

  const onCreate = (input: AdminInput) => {
    if (isCreating) return;

    const body = transformAdminInputToCreateREQ(input);
    mutateCreate(body, {
      onSuccess: () => {
        setOpen(false);
        appToast.success(tCommon('notify.success_create'));
      },
      onError: (error) => {
        appToast.error(error.response?.data.message || tCommon('notify.fail_create'));
      },
    });
  };

  const onUpdate = (input: AdminInput) => {
    if (!adminId || isUpdating) return;

    const body = transformAdminInputToUpdateREQ(adminId, input);
    mutateUpdate(body, {
      onSuccess: () => {
        appToast.success(tCommon('notify.success_update'));
      },
      onError: (error) => {
        appToast.error(error.response?.data.message || tCommon('notify.fail_update'));
      },
    });
  };

  useEffect(() => {
    if (adminId && dataDetail) {
      reset(transformAdminRESPToInput(dataDetail));
      return;
    }
    reset(adminInputDefault);
  }, [open, reset, adminId, dataDetail]);

  return (
    <AppDialog
      open={open}
      onOpenChange={setOpen}
      title={adminId ? tCommon('title.administrator_edit') + ' - ' + dataDetail?.username : tCommon('title.administrator_create')}
      onOk={handleSubmit(adminId ? onUpdate : onCreate)}
      loading={isCreating || isUpdating}
      contentLoading={isLoading}
      className='sm:max-w-200'>
      <div className='grid grid-cols-2 gap-4'>
        <FormItem label={tCommon('title.username')} required={!adminId} error={errors.username?.message}>
          <Controller
            control={control}
            name='username'
            render={({ field }) => <Input {...field} placeholder={tCommon('title.username')} disabled={!!adminId} />}
          />
        </FormItem>
        {!adminId && (
          <FormItem label={tCommon('title.password')} required error={errors.password?.message}>
            <Controller
              control={control}
              name='password'
              render={({ field }) => <Input {...field} type='password' placeholder={tCommon('title.password')} />}
            />
          </FormItem>
        )}
        <FormItem label={tCommon('title.full_name')} required error={errors.name?.message}>
          <Controller
            control={control}
            name='name'
            render={({ field }) => <Input {...field} placeholder={tCommon('title.full_name')} />}
          />
        </FormItem>
        <FormItem label={tCommon('title.email')} required error={errors.email?.message}>
          <Controller
            control={control}
            name='email'
            render={({ field }) => <Input {...field} placeholder={'user@gmail.com'} disabled={!!adminId} />}
          />
        </FormItem>
        <FormItem label={tCommon('title.phone_number')} required error={errors.phone?.message}>
          <Controller
            control={control}
            name='phone'
            render={({ field }) => (
              <Input
                {...field}
                value={formatPhone(field.value)}
                onChange={(event) => field.onChange(event.target.value.replace(/\D/g, '').slice(0, 11))}
                inputMode='numeric'
                maxLength={13}
                placeholder='xxx-xxxx-xxxx'
              />
            )}
          />
        </FormItem>
        <FormItem label={tCommon('title.permission')} required error={errors.permission?.message}>
          <Controller
            control={control}
            name='permission'
            render={({ field }) => (
              <AppSelect options={permissionOptions} value={field.value} onChange={field.onChange} showSearch />
            )}
          />
        </FormItem>
        {adminId && (
          <div className='flex items-center'>
            <Controller
              control={control}
              name='status'
              render={({ field }) => (
                <AppCheckBox label={tEnum('common.ACTIVE')} checked={field.value} onCheckedChange={field.onChange} />
              )}
            />
          </div>
        )}
      </div>
    </AppDialog>
  );
};

export default AdministratorUpsertModal;
