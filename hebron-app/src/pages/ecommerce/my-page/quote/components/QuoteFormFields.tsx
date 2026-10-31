import FormFileDropzone from '@/components/form/FormFileDropzone';
import FormInput from '@/components/form/FormInput';
import FormTextarea from '@/components/form/FormTextarea';
import type { InquiryCommentRESP } from '@/data/inquiries/inquiries.response';
import MyPageInquiryReplies from '@/pages/ecommerce/my-page/components/MyPageInquiryReplies';
import MyPageProductPickerField from '@/pages/ecommerce/my-page/components/MyPageProductPickerField';
import type { QuoteFormValues } from '@/schemas/quote/quote-form.schema';
import { QUOTE_FORM_LABELS, QUOTE_FORM_LIMITS } from '@/utils/constants/quote-form.constant';
import { useFormContext } from 'react-hook-form';

type QuoteFormFieldsProps = {
  readOnly?: boolean;
  uploadingAttachments?: boolean;
  comments?: InquiryCommentRESP[];
  inquiryStatus?: string;
};

const QUOTE_PRODUCT_PICKER_LABELS = {
  title: QUOTE_FORM_LABELS.productPickerTitle,
  searchPlaceholder: QUOTE_FORM_LABELS.productPickerSearchPlaceholder,
  categoryLabel: QUOTE_FORM_LABELS.productPickerCategory,
  cancel: QUOTE_FORM_LABELS.cancel,
  confirm: QUOTE_FORM_LABELS.productPickerConfirm,
} as const;

const QuoteFormFields = ({
  readOnly = false,
  uploadingAttachments = false,
  comments = [],
  inquiryStatus,
}: QuoteFormFieldsProps) => {
  const { control, setValue } = useFormContext<QuoteFormValues>();

  const showReplies = comments.length > 0;

  return (
    <div className='flex flex-col gap-4 md:gap-5'>
      <MyPageProductPickerField
        control={control}
        setValue={setValue}
        label={QUOTE_FORM_LABELS.product}
        placeholder={QUOTE_FORM_LABELS.productPlaceholder}
        required
        showCategory
        pickerLabels={QUOTE_PRODUCT_PICKER_LABELS}
        disabled={readOnly}
      />

      <FormInput
        control={control}
        name='title'
        label={QUOTE_FORM_LABELS.title}
        required
        placeholder={QUOTE_FORM_LABELS.titlePlaceholder}
        readOnly={readOnly}
      />

      <FormTextarea
        control={control}
        name='content'
        label={QUOTE_FORM_LABELS.content}
        required
        placeholder={QUOTE_FORM_LABELS.contentPlaceholder}
        maxLength={QUOTE_FORM_LIMITS.contentMaxLength}
        readOnly={readOnly}
      />

      <FormInput
        control={control}
        name='managerName'
        label={QUOTE_FORM_LABELS.managerName}
        required
        placeholder={QUOTE_FORM_LABELS.managerNamePlaceholder}
        readOnly
        disabled
      />

      <FormInput
        control={control}
        name='contact'
        label={QUOTE_FORM_LABELS.contact}
        required
        placeholder={QUOTE_FORM_LABELS.contactPlaceholder}
        infoMessage={readOnly ? undefined : QUOTE_FORM_LABELS.contactInfo}
        readOnly={readOnly}
        mode='phone'
      />

      <FormFileDropzone
        control={control}
        name='attachments'
        label={QUOTE_FORM_LABELS.attachments}
        secondaryInfoMessage={readOnly ? undefined : QUOTE_FORM_LABELS.attachmentInfo}
        disabled={readOnly}
        uploading={uploadingAttachments}
      />

      {showReplies && <MyPageInquiryReplies comments={comments} inquiryStatus={inquiryStatus} className='mt-2' />}
    </div>
  );
};

export default QuoteFormFields;
