import AppDialog from '@/components/dialog/AppDialog';
import FormItem from '@/components/form/FormItem';
import { appToast } from '@/components/toast/AppToast';
import { Input } from '@/components/ui/input';
import { useAdminChangePasswordMutation } from '@/data/admin/admin.query';
import {
  adminChangePasswordDefault,
  adminChangePasswordSchema,
  type AdminChangePasswordInput,
} from '@/schemas/admin/admin.schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

type AdministratorChangePasswordModalProps = {
  open: boolean;
  setOpen: (value: boolean) => void;
  adminId: number | null;
};

const AdministratorChangePasswordModal = ({ open, setOpen, adminId }: AdministratorChangePasswordModalProps) => {
  const { t: tCommon } = useTranslation('common');
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AdminChangePasswordInput>({
    mode: 'all',
    defaultValues: adminChangePasswordDefault,
    resolver: zodResolver(adminChangePasswordSchema),
  });
  const changePasswordMutation = useAdminChangePasswordMutation({
    onSuccess: () => {
      appToast.success(tCommon('notify.success_update'));
      setOpen(false);
    },
    onError: (error) => {
      appToast.error(error.response?.data.message || tCommon('notify.fail_update'));
    },
  });

  const onSubmit = (input: AdminChangePasswordInput) => {
    if (!adminId || changePasswordMutation.isPending) return;

    changePasswordMutation.mutate({
      id: adminId,
      password: input.password,
      password_confirmation: input.passwordConfirmation,
    });
  };

  useEffect(() => {
    if (open) reset(adminChangePasswordDefault);
  }, [open, reset]);

  return (
    <AppDialog
      open={open}
      onOpenChange={setOpen}
      title={tCommon('button.reset_password')}
      onOk={handleSubmit(onSubmit)}
      loading={changePasswordMutation.isPending}
      className='sm:max-w-120'>
      <div className='space-y-4'>
        <FormItem label={tCommon('title.new_password')} required error={errors.password?.message}>
          <Controller
            control={control}
            name='password'
            render={({ field }) => <Input {...field} type='password' placeholder={tCommon('placeholder.enter_password')} />}
          />
        </FormItem>
        <FormItem label={tCommon('title.confirm_password')} required error={errors.passwordConfirmation?.message}>
          <Controller
            control={control}
            name='passwordConfirmation'
            render={({ field }) => <Input {...field} type='password' placeholder={tCommon('placeholder.confirm_password')} />}
          />
        </FormItem>
      </div>
    </AppDialog>
  );
};

export default AdministratorChangePasswordModal;
