import { appToast } from '@/components/toast/AppToast';
import { Button } from '@/components/ui/button';
import { useProfileQuery, useUpdateProfileMutation } from '@/data/profile/profile.query';
import { useMyPageFormMobileFooterDock } from '@/hooks/useMyPageFormMobileFooterDock';
import MyPageFormMobileFooter from '@/pages/ecommerce/my-page/components/MyPageFormMobileFooter';
import MyPagePageTitle from '@/pages/ecommerce/my-page/components/MyPagePageTitle';
import MemberInfoFormFields from '@/pages/ecommerce/my-page/info/components/MemberInfoFormFields';
import type { MemberInfoFormValues } from '@/schemas/member-info/member-info-form.schema';
import { memberInfoFormSchema } from '@/schemas/member-info/member-info-form.schema';
import {
  MEMBER_INFO_FORM_DEFAULT_VALUES,
  MEMBER_INFO_FORM_LABELS,
  mapMemberInfoFormToProfileREQ,
  mapProfileToMemberInfoFormValues,
} from '@/utils/constants/member-info-form.constant';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { FormProvider, useForm } from 'react-hook-form';

const MyPageInfo = () => {
  const { formRef, isDocked } = useMyPageFormMobileFooterDock();

  const { data: profileData, isLoading: isProfileLoading } = useProfileQuery();
  const updateMutation = useUpdateProfileMutation();

  const form = useForm<MemberInfoFormValues>({
    resolver: zodResolver(memberInfoFormSchema),
    defaultValues: MEMBER_INFO_FORM_DEFAULT_VALUES,
    shouldUnregister: false,
  });

  useEffect(() => {
    if (!profileData?.data.profile) return;
    form.reset(mapProfileToMemberInfoFormValues(profileData.data.profile));
  }, [profileData, form]);

  const { formState } = form;
  const isSubmitting = updateMutation.isPending;
  const canSubmit = formState.isDirty && !isSubmitting;

  const onSubmit = (values: MemberInfoFormValues) => {
    updateMutation.mutate(mapMemberInfoFormToProfileREQ(values), {
      onSuccess: (response) => {
        appToast.success(response.message || MEMBER_INFO_FORM_LABELS.updateSuccess);
      },
      onError: (error) => {
        appToast.error(error.response?.data.message || MEMBER_INFO_FORM_LABELS.updateFailed);
      },
    });
  };

  if (isProfileLoading) {
    return (
      <section className='flex flex-col gap-6 rounded-lg border border-neutral-200 bg-white p-5 md:p-6'>
        <MyPagePageTitle>{MEMBER_INFO_FORM_LABELS.pageTitle}</MyPagePageTitle>
        <p className='text-sm text-neutral-500'>{MEMBER_INFO_FORM_LABELS.loading}</p>
      </section>
    );
  }

  return (
    <section className='rounded-lg border border-neutral-200 bg-white p-5 md:p-6'>
      <FormProvider {...form}>
        <form
          ref={formRef}
          className='relative flex w-full min-w-0 flex-col gap-6 pb-20 md:pb-0'
          onSubmit={form.handleSubmit(onSubmit)}>
          <div className='flex items-center justify-between gap-4'>
            <MyPagePageTitle>{MEMBER_INFO_FORM_LABELS.pageTitle}</MyPagePageTitle>

            <Button type='submit' className='hidden px-14 md:inline-flex' disabled={!canSubmit} loading={isSubmitting}>
              {MEMBER_INFO_FORM_LABELS.submit}
            </Button>
          </div>

          <MemberInfoFormFields />

          <MyPageFormMobileFooter isDocked={isDocked}>
            <Button type='submit' className='w-full' disabled={!canSubmit} loading={isSubmitting}>
              {MEMBER_INFO_FORM_LABELS.submit}
            </Button>
          </MyPageFormMobileFooter>
        </form>
      </FormProvider>
    </section>
  );
};

export default MyPageInfo;
