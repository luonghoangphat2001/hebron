import FormFileDropzone from '@/components/form/FormFileDropzone';
import FormInput from '@/components/form/FormInput';
import FormSelect from '@/components/form/FormSelect';
import FormTextarea from '@/components/form/FormTextarea';
import { appToast } from '@/components/toast/AppToast';
import { Button } from '@/components/ui/button';
import { useCreateBrandContactUsMutation } from '@/data/brand-contact-us/brand-contact-us.query';
import { brandContactFormSchema, type BrandContactFormValues } from '@/schemas/brand-contact/brand-contact-form.schema';
import {
  BRAND_CONTACT_FORM_DEFAULT_VALUES,
  BRAND_CONTACT_FORM_LABELS,
  BRAND_CONTACT_FORM_LIMITS,
  mapBrandContactFormToCreateREQ,
} from '@/utils/constants/brand-contact-form.constant';
import { PRODUCT_TYPE_OPTIONS } from '@/utils/constants/product.constant';
import { FileType } from '@/utils/enums/file.enum';
import { resolveAttachmentFiles } from '@/utils/helper/file.helper';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';

const BRAND_FIELD_LABEL_CLASS = 'text-white';
const BRAND_INPUT_CLASS =
  'h-11 rounded-lg border-neutral-700 bg-neutral-900 text-white placeholder:text-neutral-500 focus-visible:border-brand-strong';
const BRAND_SELECT_CLASS = 'h-11 rounded-lg focus-visible:border-brand-strong';

type ContactFormProps = {
  submitLabel?: string;
};

const ContactForm = ({ submitLabel }: ContactFormProps) => {
  const form = useForm<BrandContactFormValues>({
    resolver: zodResolver(brandContactFormSchema),
    mode: 'onChange',
    defaultValues: BRAND_CONTACT_FORM_DEFAULT_VALUES,
  });

  const [uploadingAttachments, setUploadingAttachments] = useState(false);
  const createMutation = useCreateBrandContactUsMutation();
  const isSubmitting = createMutation.isPending || uploadingAttachments;

  const onSubmit = async (values: BrandContactFormValues) => {
    if (isSubmitting) return;

    try {
      setUploadingAttachments(true);
      const attachments = await resolveAttachmentFiles(values.attachments, FileType.INQUIRY_ATTACHMENTS, 'url');

      createMutation.mutate(mapBrandContactFormToCreateREQ(values, attachments), {
        onSuccess: (response) => {
          appToast.success(response.message || BRAND_CONTACT_FORM_LABELS.submitSuccess);
          form.reset(BRAND_CONTACT_FORM_DEFAULT_VALUES);
        },
        onError: (error) => {
          appToast.error(error.response?.data.message || BRAND_CONTACT_FORM_LABELS.submitFailed);
        },
      });
    } catch {
      appToast.error(BRAND_CONTACT_FORM_LABELS.submitFailed);
    } finally {
      setUploadingAttachments(false);
    }
  };

  return (
    <FormProvider {...form}>
      <form className='flex flex-col gap-5' onSubmit={form.handleSubmit(onSubmit)} noValidate>
        <FormSelect
          control={form.control}
          name='inquiryType'
          label={BRAND_CONTACT_FORM_LABELS.inquiryType}
          required
          labelPlacement='top'
          labelClassName={BRAND_FIELD_LABEL_CLASS}
          placeholder={BRAND_CONTACT_FORM_LABELS.inquiryTypePlaceholder}
          options={PRODUCT_TYPE_OPTIONS}
          variant='dark'
          className={BRAND_SELECT_CLASS}
        />

        <FormInput
          control={form.control}
          name='companyName'
          label={BRAND_CONTACT_FORM_LABELS.companyName}
          required
          labelPlacement='top'
          labelClassName={BRAND_FIELD_LABEL_CLASS}
          placeholder={BRAND_CONTACT_FORM_LABELS.companyNamePlaceholder}
          className={BRAND_INPUT_CLASS}
        />

        <FormInput
          control={form.control}
          name='managerName'
          label={BRAND_CONTACT_FORM_LABELS.managerName}
          required
          labelPlacement='top'
          labelClassName={BRAND_FIELD_LABEL_CLASS}
          placeholder={BRAND_CONTACT_FORM_LABELS.managerNamePlaceholder}
          className={BRAND_INPUT_CLASS}
        />

        <FormInput
          control={form.control}
          name='contact'
          label={BRAND_CONTACT_FORM_LABELS.contact}
          required
          labelPlacement='top'
          labelClassName={BRAND_FIELD_LABEL_CLASS}
          placeholder={BRAND_CONTACT_FORM_LABELS.contactPlaceholder}
          className={BRAND_INPUT_CLASS}
          mode='phone'
        />

        <FormInput
          control={form.control}
          name='email'
          label={BRAND_CONTACT_FORM_LABELS.email}
          required
          labelPlacement='top'
          labelClassName={BRAND_FIELD_LABEL_CLASS}
          placeholder={BRAND_CONTACT_FORM_LABELS.emailPlaceholder}
          className={BRAND_INPUT_CLASS}
          type='email'
        />

        <FormTextarea
          control={form.control}
          name='content'
          label={BRAND_CONTACT_FORM_LABELS.content}
          required
          labelPlacement='top'
          labelClassName={BRAND_FIELD_LABEL_CLASS}
          placeholder={BRAND_CONTACT_FORM_LABELS.contentPlaceholder}
          maxLength={BRAND_CONTACT_FORM_LIMITS.contentMaxLength}
          className='focus-visible:border-brand-strong min-h-40 rounded-lg border-neutral-700 bg-neutral-900 text-white placeholder:text-neutral-500'
        />

        <FormFileDropzone
          control={form.control}
          name='attachments'
          label={BRAND_CONTACT_FORM_LABELS.attachments}
          required
          labelPlacement='top'
          labelClassName={BRAND_FIELD_LABEL_CLASS}
          variant='dark'
        />

        <div className='flex justify-end pt-2'>
          <Button
            type='submit'
            size='lg'
            disabled={isSubmitting}
            className='bg-brand hover:bg-brand h-11 w-full rounded-full font-bold md:w-35'>
            {isSubmitting ? BRAND_CONTACT_FORM_LABELS.submitting : submitLabel || BRAND_CONTACT_FORM_LABELS.submit}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
};

export default ContactForm;
