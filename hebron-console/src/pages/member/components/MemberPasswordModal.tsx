import AppDialog from '@/components/dialog/AppDialog';
import FormItem from '@/components/form/FormItem';
import { appToast } from '@/components/toast/AppToast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useMemberPasswordUpdateMutation } from '@/data/member/member.query';
import { generateTemporaryPassword } from '@/data/member/member.service';
import { cn } from '@/lib/utils';
import { memberPasswordUpdateSchema, type MemberPasswordUpdateInput } from '@/schemas/member/member.schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { RefreshCw } from 'lucide-react';
import { useState } from 'react';
import { Controller, useForm, type Resolver } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

type MemberPasswordModalProps = {
  open: boolean;
  setOpen: (value: boolean) => void;
  memberId: number;
  onChanged: (note: string) => void;
};

type Mode = 'direct' | 'temporary';

const MemberPasswordModal = ({ open, setOpen, memberId, onChanged }: MemberPasswordModalProps) => {
  const { t: tMember } = useTranslation('member');
  const { t: tCommon } = useTranslation('common');
  const [mode, setMode] = useState<Mode>('direct');
  const [temporaryPassword, setTemporaryPassword] = useState('');

  const {
    control,
    handleSubmit,
    reset,
    clearErrors,
    formState: { errors },
  } = useForm<MemberPasswordUpdateInput>({
    mode: 'all',
    defaultValues: {
      member_id: memberId,
      new_password: '',
      generate_temporary: false,
    },
    resolver: zodResolver(memberPasswordUpdateSchema) as Resolver<MemberPasswordUpdateInput>,
  });

  const updateMutation = useMemberPasswordUpdateMutation({
    onSuccess: () => {
      appToast.success(tCommon('notify.success_update'));
      onChanged(mode === 'direct' ? tMember('log.password_changed_directly') : tMember('log.password_changed_temporary'));
      reset();
      setTemporaryPassword('');
      setOpen(false);
    },
    onError: () => appToast.error(tCommon('notify.something_went_wrong')),
  });

  const onSubmit = (data: MemberPasswordUpdateInput) => {
    if (mode === 'direct') {
      updateMutation.mutate({ member_id: memberId, new_password: data.new_password });
    } else {
      const generated = temporaryPassword || generateTemporaryPassword();
      setTemporaryPassword(generated);
      updateMutation.mutate({ member_id: memberId, generate_temporary: true, new_password: generated });
    }
  };

  return (
    <AppDialog
      open={open}
      onOpenChange={(v) => {
        if (!v) {
          reset();
          setTemporaryPassword('');
        }
        setOpen(v);
      }}
      title={tMember('title.change_password')}
      onOk={handleSubmit(onSubmit)}
      loading={updateMutation.isPending}
      className='sm:max-w-120'>
      <div className='space-y-4'>
        <div className='flex gap-2'>
          <Button
            type='button'
            variant={mode === 'direct' ? 'default' : 'outline'}
            className={cn('flex-1')}
            onClick={() => {
              setMode('direct');
              clearErrors();
            }}>
            {tMember('label.set_password_directly')}
          </Button>
          <Button
            type='button'
            variant={mode === 'temporary' ? 'default' : 'outline'}
            className={cn('flex-1')}
            onClick={() => {
              setMode('temporary');
              clearErrors();
            }}>
            {tMember('label.generate_temporary_password')}
          </Button>
        </div>

        {mode === 'direct' ? (
          <FormItem label={tMember('field.new_password')} required error={errors.new_password?.message}>
            <Controller
              control={control}
              name='new_password'
              render={({ field }) => <Input type='text' {...field} value={field.value || ''} />}
            />
          </FormItem>
        ) : (
          <FormItem label={tMember('field.temporary_password')}>
            <div className='flex gap-2'>
              <Input readOnly value={temporaryPassword} placeholder={tMember('placeholder.generate_to_view')} />
              <Button
                type='button'
                variant='outline'
                size='icon'
                onClick={() => setTemporaryPassword(generateTemporaryPassword())}>
                <RefreshCw className='size-4' />
              </Button>
            </div>
          </FormItem>
        )}
      </div>
    </AppDialog>
  );
};

export default MemberPasswordModal;
