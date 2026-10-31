import Can from '@/components/Can';
import FormItem from '@/components/form/FormItem';
import PageTitle from '@/components/PageTitle';
import { appToast } from '@/components/toast/AppToast';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useEmailSettingQuery, useEmailSettingUpdateMutation } from '@/data/email-setting';
import { useCan } from '@/hooks/useMenuAccess';
import { emailSettingDefault, emailSettingSchema, type EmailSettingInput } from '@/schemas/email-setting/email-setting.schema';
import { ERROR_MESSAGE } from '@/utils/constants/error-message.constant';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, Plus, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Controller, useForm, useWatch, type Resolver } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

const emailSchema = emailSettingSchema.shape.sender_email;

const EmailSettingsPage = () => {
  const { t: tSidebar } = useTranslation('sidebar');
  const { t: tSystem } = useTranslation('system');
  const { t: tCommon } = useTranslation('common');
  const canEdit = useCan()('edit');
  const [receiverEmail, setReceiverEmail] = useState('');

  const {
    control,
    handleSubmit,
    reset,
    setError,
    setValue,
    clearErrors,
    formState: { errors, isDirty },
  } = useForm<EmailSettingInput>({
    mode: 'all',
    defaultValues: emailSettingDefault,
    resolver: zodResolver(emailSettingSchema) as Resolver<EmailSettingInput>,
  });

  const { data: emailSetting, isLoading } = useEmailSettingQuery();
  const receiverEmails = useWatch({ control, name: 'receiver_emails' }) || [];

  useEffect(() => {
    if (!emailSetting) return;

    reset({
      sender_email: emailSetting.sender_email,
      sender_name: emailSetting.sender_name,
      receiver_emails: emailSetting.receiver_emails || [],
    });
  }, [emailSetting, reset]);

  const { mutate: updateEmailSetting, isPending: isSaving } = useEmailSettingUpdateMutation({
    onSuccess: (response) => {
      reset({
        sender_email: response.data.sender_email,
        sender_name: response.data.sender_name,
        receiver_emails: response.data.receiver_emails || [],
      });
      setReceiverEmail('');
      appToast.success(tCommon('notify.success_update'));
    },
    onError: (error) => appToast.error(error.response?.data.message || tCommon('notify.fail_update')),
  });

  const addReceiverEmails = () => {
    const candidates = receiverEmail
      .split(/[,;]/)
      .map((email) => email.trim())
      .filter(Boolean);

    if (!candidates.length) return;

    if (candidates.some((email) => !emailSchema.safeParse(email).success)) {
      setError('receiver_emails', { message: ERROR_MESSAGE.EMAIL_INVALID });
      return;
    }

    const nextEmails = [...new Set([...receiverEmails, ...candidates])];
    setValue('receiver_emails', nextEmails, { shouldDirty: true, shouldValidate: true });
    clearErrors('receiver_emails');
    setReceiverEmail('');
  };

  const removeReceiverEmail = (email: string) => {
    const nextEmails = receiverEmails.filter((item) => item !== email);
    setValue('receiver_emails', nextEmails, { shouldDirty: true, shouldValidate: true });
  };

  const onSubmit = (input: EmailSettingInput) => {
    if (!isSaving) updateEmailSetting(input);
  };

  const onCancel = () => {
    if (!emailSetting) return;
    reset({
      sender_email: emailSetting.sender_email,
      sender_name: emailSetting.sender_name,
      receiver_emails: emailSetting.receiver_emails || [],
    });
    setReceiverEmail('');
  };

  return (
    <main className='space-y-6'>
      <PageTitle title={tSidebar('email_settings')} />

      <Card className='max-w-4xl'>
        <CardHeader className='border-b'>
          <CardTitle className='flex items-center gap-2'>
            <Mail className='text-primary size-4' />
            {tSystem('email_setting.title')}
          </CardTitle>
          <CardDescription>{tSystem('email_setting.description')}</CardDescription>
        </CardHeader>

        {isLoading ? (
          <CardContent className='grid gap-6 pt-6 sm:grid-cols-2'>
            <Skeleton className='h-16' />
            <Skeleton className='h-16' />
            <Skeleton className='h-24 sm:col-span-2' />
          </CardContent>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)}>
            <CardContent className='grid gap-6 pt-6 sm:grid-cols-2'>
              <FormItem label={tSystem('email_setting.field.sender_email')} required error={errors.sender_email?.message}>
                <Controller
                  control={control}
                  name='sender_email'
                  render={({ field }) => (
                    <Input
                      {...field}
                      type='email'
                      placeholder={tSystem('email_setting.placeholder.sender_email')}
                      disabled={isSaving || !canEdit}
                    />
                  )}
                />
              </FormItem>

              <FormItem label={tSystem('email_setting.field.sender_name')} required error={errors.sender_name?.message}>
                <Controller
                  control={control}
                  name='sender_name'
                  render={({ field }) => (
                    <Input
                      {...field}
                      placeholder={tSystem('email_setting.placeholder.sender_name')}
                      disabled={isSaving || !canEdit}
                    />
                  )}
                />
              </FormItem>

              <div className='sm:col-span-2'>
                <FormItem label={tSystem('email_setting.field.receiver_emails')} required error={errors.receiver_emails?.message}>
                  <Controller
                    control={control}
                    name='receiver_emails'
                    render={({ field }) => (
                      <div className='space-y-2'>
                        <div className='flex gap-2'>
                          <Input
                            value={receiverEmail}
                            type='email'
                            placeholder={tSystem('email_setting.placeholder.receiver_emails')}
                            disabled={isSaving || !canEdit}
                            onChange={(event) => setReceiverEmail(event.target.value)}
                            onBlur={addReceiverEmails}
                            onKeyDown={(event) => {
                              if (event.key === 'Enter' || event.key === ',') {
                                event.preventDefault();
                                addReceiverEmails();
                              }
                            }}
                          />
                          <Button
                            type='button'
                            variant='outline'
                            size='icon'
                            aria-label={tSystem('email_setting.button.add_receiver')}
                            disabled={isSaving || !canEdit}
                            onClick={addReceiverEmails}>
                            <Plus />
                          </Button>
                        </div>
                        {!!field.value.length && (
                          <div className='flex flex-wrap gap-2'>
                            {field.value.map((email) => (
                              <Badge key={email} variant='secondary' className='h-7 gap-1 pl-2.5'>
                                {email}
                                <button
                                  type='button'
                                  aria-label={tSystem('email_setting.button.remove_receiver', { email })}
                                  className='hover:bg-foreground/10 rounded-full p-0.5'
                                  disabled={isSaving || !canEdit}
                                  onClick={() => removeReceiverEmail(email)}>
                                  <X className='size-3' />
                                </button>
                              </Badge>
                            ))}
                          </div>
                        )}
                        <p className='text-muted-foreground text-xs'>{tSystem('email_setting.receiver_hint')}</p>
                      </div>
                    )}
                  />
                </FormItem>
              </div>
            </CardContent>

            <Can action='edit'>
              <CardFooter className='mt-2 justify-end gap-2 border-t'>
                <Button type='button' variant='outline' disabled={!isDirty || isSaving} onClick={onCancel}>
                  {tCommon('button.cancel')}
                </Button>
                <Button type='submit' disabled={!isDirty || isSaving} loading={isSaving}>
                  {tCommon('button.save')}
                </Button>
              </CardFooter>
            </Can>
          </form>
        )}
      </Card>
    </main>
  );
};

export default EmailSettingsPage;
