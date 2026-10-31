import Can from '@/components/Can';
import FormItem from '@/components/form/FormItem';
import PageTitle from '@/components/PageTitle';
import { appToast } from '@/components/toast/AppToast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useBankAccountQuery, useBankAccountUpdateMutation } from '@/data/bank-account';
import { useCan } from '@/hooks/useMenuAccess';
import { bankAccountDefault, bankAccountSchema, type BankAccountInput } from '@/schemas/bank-account/bank-account.schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { Landmark } from 'lucide-react';
import { useEffect } from 'react';
import { Controller, useForm, type Resolver } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

const BankAccountSettingsPage = () => {
  const { t: tSidebar } = useTranslation('sidebar');
  const { t: tSystem } = useTranslation('system');
  const { t: tCommon } = useTranslation('common');
  const canEdit = useCan()('edit');
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<BankAccountInput>({
    mode: 'all',
    defaultValues: bankAccountDefault,
    resolver: zodResolver(bankAccountSchema) as Resolver<BankAccountInput>,
  });

  const { data: bankAccount, isLoading } = useBankAccountQuery();

  useEffect(() => {
    if (!bankAccount) return;

    reset({
      bank_name: bankAccount.bank_name,
      account_number: bankAccount.account_number,
      account_holder: bankAccount.account_holder,
    });
  }, [bankAccount, reset]);

  const { mutate: updateBankAccount, isPending: isSaving } = useBankAccountUpdateMutation({
    onSuccess: (response) => {
      reset({
        bank_name: response.data.bank_account.bank_name,
        account_number: response.data.bank_account.account_number,
        account_holder: response.data.bank_account.account_holder,
      });
      appToast.success(tCommon('notify.success_update'));
    },
    onError: (error) => appToast.error(error.response?.data.message || tCommon('notify.fail_update')),
  });

  const onCancel = () => {
    if (!bankAccount) return;
    reset({
      bank_name: bankAccount.bank_name,
      account_number: bankAccount.account_number,
      account_holder: bankAccount.account_holder,
    });
  };

  return (
    <main className='space-y-6'>
      <PageTitle title={tSidebar('bank_account_settings')} />

      <Card className='max-w-4xl'>
        <CardHeader className='border-b'>
          <CardTitle className='flex items-center gap-2'>
            <Landmark className='text-primary size-4' />
            {tSystem('bank_account_setting.title')}
          </CardTitle>
          <CardDescription>{tSystem('bank_account_setting.description')}</CardDescription>
        </CardHeader>

        {isLoading ? (
          <CardContent className='grid gap-6 pt-6 sm:grid-cols-2'>
            <Skeleton className='h-16' />
            <Skeleton className='h-16' />
            <Skeleton className='h-16' />
          </CardContent>
        ) : (
          <form onSubmit={handleSubmit((input) => !isSaving && updateBankAccount(input))}>
            <CardContent className='grid gap-6 pt-6 sm:grid-cols-2'>
              <FormItem label={tSystem('bank_account_setting.field.bank_name')} required error={errors.bank_name?.message}>
                <Controller
                  control={control}
                  name='bank_name'
                  render={({ field }) => (
                    <Input
                      {...field}
                      placeholder={tSystem('bank_account_setting.placeholder.bank_name')}
                      disabled={isSaving || !canEdit}
                    />
                  )}
                />
              </FormItem>

              <FormItem
                label={tSystem('bank_account_setting.field.account_number')}
                required
                error={errors.account_number?.message}>
                <Controller
                  control={control}
                  name='account_number'
                  render={({ field }) => (
                    <Input
                      {...field}
                      inputMode='numeric'
                      placeholder={tSystem('bank_account_setting.placeholder.account_number')}
                      disabled={isSaving || !canEdit}
                    />
                  )}
                />
              </FormItem>

              <FormItem
                label={tSystem('bank_account_setting.field.account_holder')}
                required
                error={errors.account_holder?.message}>
                <Controller
                  control={control}
                  name='account_holder'
                  render={({ field }) => (
                    <Input
                      {...field}
                      placeholder={tSystem('bank_account_setting.placeholder.account_holder')}
                      disabled={isSaving || !canEdit}
                    />
                  )}
                />
              </FormItem>
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

export default BankAccountSettingsPage;
