import AppDialog from '@/components/dialog/AppDialog';
import FormItem from '@/components/form/FormItem';
import { appToast } from '@/components/toast/AppToast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AttachmentFile, { type AttachmentFileValue } from '@/components/upload/AttachmentFile';
import { uploadFileAPI } from '@/data/file/file.api';
import { useMemberCreateMutation } from '@/data/member/member.query';
import type { MemberCreateREQ } from '@/data/member/member.request';
import { replacePhoneDigits, transformMemberCreateInputToREQ } from '@/data/member/member.service';
import { memberCreateInputDefault, memberCreateSchema, type MemberCreateInput } from '@/schemas/member/member.schema';
import { MemberType } from '@/utils/enums/common.enum';
import { FileType } from '@/utils/enums/file.enum';
import { formatPhone } from '@/utils/helper/common.helper';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { Controller, useForm, type Resolver } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

type MemberRegistrationModalProps = {
  open: boolean;
  setOpen: (value: boolean) => void;
};

const MemberRegistrationModal = ({ open, setOpen }: MemberRegistrationModalProps) => {
  const { t: tMember } = useTranslation('member');
  const { t: tCommon } = useTranslation('common');
  const [attachment, setAttachment] = useState<AttachmentFileValue | undefined>();
  const [uploadingFile, setUploadingFile] = useState(false);

  const [isBusiness, setIsBusiness] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    clearErrors,
    formState: { errors },
  } = useForm<MemberCreateInput>({
    mode: 'all',
    defaultValues: memberCreateInputDefault,
    resolver: zodResolver(memberCreateSchema) as Resolver<MemberCreateInput>,
  });

  const createMutation = useMemberCreateMutation({
    onSuccess: () => {
      appToast.success(tCommon('notify.success_create'));
      reset(memberCreateInputDefault);
      setAttachment(undefined);
      setIsBusiness(false);
      setOpen(false);
    },
    onError: (err: any) => {
      appToast.error(err?.response?.data?.message || err?.message || tCommon('notify.fail_create'));
    },
  });

  const onSubmit = async (data: MemberCreateInput) => {
    let registrationFilePath = data.business_registration_file || '';

    if (isBusiness && attachment?.file) {
      setUploadingFile(true);
      try {
        const resp = await uploadFileAPI(attachment.file, FileType.BUSINESS_REGISTRATIONS);
        registrationFilePath = resp.data?.file?.path || resp.data?.file?.url || resp.data?.file?.name || '';
      } catch (err: any) {
        setUploadingFile(false);
        appToast.error(err.response?.data?.message || err.message || tCommon('notify.fail_create'));
        return;
      }
      setUploadingFile(false);
    }

    const payload: MemberCreateREQ = transformMemberCreateInputToREQ(data, registrationFilePath);

    createMutation.mutate(payload);
  };

  return (
    <AppDialog
      open={open}
      onOpenChange={(v) => {
        if (!v) {
          reset(memberCreateInputDefault);
          setAttachment(undefined);
          setIsBusiness(false);
        }
        setOpen(v);
      }}
      title={tMember('title.registration')}
      description={tMember('description.registration')}
      onOk={handleSubmit(onSubmit, (formErrors) => {
        console.warn('Member registration validation errors:', formErrors);
        const firstKey = Object.keys(formErrors)[0];
        if (firstKey && formErrors[firstKey as keyof typeof formErrors]?.message) {
          appToast.error(String(formErrors[firstKey as keyof typeof formErrors]?.message));
        }
      })}
      loading={createMutation.isPending || uploadingFile}
      className='sm:max-w-220'>
      <div className='max-h-[70vh] space-y-6 overflow-y-auto pr-1.5'>
        {/* Member Type Toggle */}
        <div className='flex w-fit items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 p-1.5 dark:border-gray-700 dark:bg-gray-800'>
          <Button
            type='button'
            variant={!isBusiness ? 'default' : 'ghost'}
            size='sm'
            onClick={() => {
              setValue('member_type', MemberType.INDIVIDUAL);
              setIsBusiness(false);
              clearErrors();
            }}
            className='px-4 font-medium transition-all'>
            {tMember('field.individual_member')}
          </Button>
          <Button
            type='button'
            variant={isBusiness ? 'default' : 'ghost'}
            size='sm'
            onClick={() => {
              setValue('member_type', MemberType.BUSINESS);
              setIsBusiness(true);
              clearErrors();
            }}
            className='px-4 font-medium transition-all'>
            {tMember('field.business_member')}
          </Button>
        </div>

        {/* Section 1: Basic Information */}
        <div className='space-y-4'>
          <div className='flex items-center gap-2 border-b border-gray-200 pb-2 dark:border-gray-700'>
            <h3 className='text-sm font-semibold text-gray-900 dark:text-gray-100'>{tMember('section.basic_info')}</h3>
          </div>

          <div className='grid grid-cols-2 gap-4'>
            <FormItem label={tMember('field.name')} required error={errors.name?.message}>
              <Controller
                control={control}
                name='name'
                render={({ field }) => <Input placeholder={tMember('placeholder.enter_name')} {...field} />}
              />
            </FormItem>

            <FormItem label={tMember('field.username')} required error={errors.username?.message}>
              <Controller
                control={control}
                name='username'
                render={({ field }) => <Input placeholder={tMember('placeholder.enter_username')} {...field} />}
              />
            </FormItem>

            <FormItem label={tMember('field.password')} required error={errors.password?.message}>
              <Controller
                control={control}
                name='password'
                render={({ field }) => (
                  <Input
                    type='password'
                    placeholder={tMember('placeholder.enter_password')}
                    {...field}
                    value={field.value || ''}
                  />
                )}
              />
            </FormItem>

            <FormItem label={tMember('field.email')} error={errors.email?.message}>
              <Controller
                control={control}
                name='email'
                render={({ field }) => <Input type='email' placeholder={tMember('placeholder.enter_email')} {...field} />}
              />
            </FormItem>

            <FormItem label={tMember('field.mobile')} required error={errors.mobile?.message}>
              <Controller
                control={control}
                name='mobile'
                render={({ field }) => (
                  <Input
                    placeholder={tMember('placeholder.enter_mobile')}
                    value={formatPhone(field.value || '')}
                    onChange={(e) => field.onChange(replacePhoneDigits(e.target.value))}
                  />
                )}
              />
            </FormItem>

            <FormItem label={tMember('field.phone')} required error={errors.phone?.message}>
              <Controller
                control={control}
                name='phone'
                render={({ field }) => (
                  <Input
                    placeholder={tMember('placeholder.enter_phone')}
                    value={formatPhone(field.value || '')}
                    onChange={(e) => field.onChange(replacePhoneDigits(e.target.value))}
                  />
                )}
              />
            </FormItem>

            <FormItem label={tMember('field.postcode')} required error={errors.postcode?.message}>
              <Controller
                control={control}
                name='postcode'
                render={({ field }) => (
                  <Input placeholder={tMember('placeholder.enter_postcode')} {...field} value={field.value || ''} />
                )}
              />
            </FormItem>

            <FormItem label={tMember('field.address')} required error={errors.address?.message}>
              <Controller
                control={control}
                name='address'
                render={({ field }) => (
                  <Input placeholder={tMember('placeholder.enter_address')} {...field} value={field.value || ''} />
                )}
              />
            </FormItem>

            <div className='col-span-2'>
              <FormItem label={tMember('field.detailed_address')} error={errors.detailed_address?.message}>
                <Controller
                  control={control}
                  name='detailed_address'
                  render={({ field }) => (
                    <Input placeholder={tMember('placeholder.enter_detailed_address')} {...field} value={field.value || ''} />
                  )}
                />
              </FormItem>
            </div>
          </div>
        </div>

        {/* Section 2: Business Information */}
        {isBusiness && (
          <div className='space-y-4 border-t border-gray-200 pt-2 dark:border-gray-700'>
            <div className='flex items-center gap-2 border-b border-gray-200 pb-2 dark:border-gray-700'>
              <h3 className='text-sm font-semibold text-gray-900 dark:text-gray-100'>{tMember('section.business_info')}</h3>
            </div>

            <div className='grid grid-cols-2 gap-4'>
              <FormItem label={tMember('field.company_name')} required error={errors.company_name?.message}>
                <Controller
                  control={control}
                  name='company_name'
                  render={({ field }) => (
                    <Input placeholder={tMember('placeholder.enter_company_name')} {...field} value={field.value || ''} />
                  )}
                />
              </FormItem>

              <FormItem
                label={tMember('field.business_registration_number')}
                required
                error={errors.business_registration_number?.message}>
                <Controller
                  control={control}
                  name='business_registration_number'
                  render={({ field }) => (
                    <Input placeholder={tMember('placeholder.enter_business_number')} {...field} value={field.value || ''} />
                  )}
                />
              </FormItem>

              <FormItem label={tMember('field.representative_name')} required error={errors.representative_name?.message}>
                <Controller
                  control={control}
                  name='representative_name'
                  render={({ field }) => (
                    <Input placeholder={tMember('placeholder.enter_representative_name')} {...field} value={field.value || ''} />
                  )}
                />
              </FormItem>

              <FormItem label={tMember('field.tax_invoice_email')} required error={errors.tax_invoice_email?.message}>
                <Controller
                  control={control}
                  name='tax_invoice_email'
                  render={({ field }) => (
                    <Input
                      type='email'
                      placeholder={tMember('placeholder.enter_tax_invoice_email')}
                      {...field}
                      value={field.value || ''}
                    />
                  )}
                />
              </FormItem>

              <FormItem label={tMember('field.industry_type')} required error={errors.industry_type?.message}>
                <Controller
                  control={control}
                  name='industry_type'
                  render={({ field }) => (
                    <Input placeholder={tMember('placeholder.enter_industry_type')} {...field} value={field.value || ''} />
                  )}
                />
              </FormItem>

              <FormItem label={tMember('field.business_type')} required error={errors.business_type?.message}>
                <Controller
                  control={control}
                  name='business_type'
                  render={({ field }) => (
                    <Input placeholder={tMember('placeholder.enter_business_type')} {...field} value={field.value || ''} />
                  )}
                />
              </FormItem>

              <FormItem label={tMember('field.business_postcode')} required error={errors.business_postcode?.message}>
                <Controller
                  control={control}
                  name='business_postcode'
                  render={({ field }) => (
                    <Input placeholder={tMember('placeholder.enter_postcode')} {...field} value={field.value || ''} />
                  )}
                />
              </FormItem>

              <FormItem label={tMember('field.business_address')} required error={errors.business_address?.message}>
                <Controller
                  control={control}
                  name='business_address'
                  render={({ field }) => (
                    <Input placeholder={tMember('placeholder.enter_address')} {...field} value={field.value || ''} />
                  )}
                />
              </FormItem>

              <div className='col-span-2'>
                <FormItem label={tMember('field.business_address_detail')} error={errors.business_address_detail?.message}>
                  <Controller
                    control={control}
                    name='business_address_detail'
                    render={({ field }) => (
                      <Input placeholder={tMember('placeholder.enter_detailed_address')} {...field} value={field.value || ''} />
                    )}
                  />
                </FormItem>
              </div>

              <div className='col-span-2'>
                <FormItem label={tMember('field.homepage_url')} required error={errors.homepage_url?.message}>
                  <Controller
                    control={control}
                    name='homepage_url'
                    render={({ field }) => (
                      <Input placeholder={tMember('placeholder.enter_homepage_url')} {...field} value={field.value || ''} />
                    )}
                  />
                </FormItem>
              </div>

              <div className='col-span-2'>
                <FormItem
                  label={tMember('field.business_registration_file')}
                  required={isBusiness}
                  error={errors.business_registration_file?.message}>
                  <AttachmentFile
                    value={attachment}
                    onChange={(v) => {
                      const item = Array.isArray(v) ? v[0] : v;
                      setAttachment(item);
                      if (item?.name) {
                        setValue('business_registration_file', item.name, { shouldValidate: true });
                      } else {
                        setValue('business_registration_file', '', { shouldValidate: true });
                      }
                    }}
                    accept='image/*,.pdf,.doc,.docx'
                    maxSizeMB={10}
                    className='[&>div>button]:w-full [&>div>div]:w-full'
                  />
                </FormItem>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppDialog>
  );
};

export default MemberRegistrationModal;
