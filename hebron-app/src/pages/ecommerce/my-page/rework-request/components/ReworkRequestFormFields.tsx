import FormFileDropzone from '@/components/form/FormFileDropzone';
import FormInput from '@/components/form/FormInput';
import FormTextarea from '@/components/form/FormTextarea';
import type { InquiryCommentRESP } from '@/data/inquiries/inquiries.response';
import MyPageInquiryReplies from '@/pages/ecommerce/my-page/components/MyPageInquiryReplies';
import MyPageProductPickerField from '@/pages/ecommerce/my-page/components/MyPageProductPickerField';
import type { ReworkRequestFormValues } from '@/schemas/rework-request/rework-request-form.schema';
import { REWORK_REQUEST_FORM_LABELS, REWORK_REQUEST_FORM_LIMITS } from '@/utils/constants/rework-request-form.constant';
import { useFormContext } from 'react-hook-form';

type ReworkRequestFormFieldsProps = {
  readOnly?: boolean;
  uploadingAttachments?: boolean;
  comments?: InquiryCommentRESP[];
  inquiryStatus?: string;
};

const REWORK_REQUEST_PRODUCT_PICKER_LABELS = {
  title: REWORK_REQUEST_FORM_LABELS.productPickerTitle,
  searchPlaceholder: REWORK_REQUEST_FORM_LABELS.productPickerSearchPlaceholder,
  categoryLabel: REWORK_REQUEST_FORM_LABELS.productPickerCategory,
  cancel: REWORK_REQUEST_FORM_LABELS.cancel,
  confirm: REWORK_REQUEST_FORM_LABELS.productPickerConfirm,
} as const;

const ReworkRequestFormFields = ({
  readOnly = false,
  uploadingAttachments = false,
  comments = [],
  inquiryStatus,
}: ReworkRequestFormFieldsProps) => {
  const { control, setValue } = useFormContext<ReworkRequestFormValues>();

  const showReplies = comments.length > 0;

  return (
    <div className='flex flex-col gap-4 md:gap-5'>
      <MyPageProductPickerField
        control={control}
        setValue={setValue}
        label={REWORK_REQUEST_FORM_LABELS.product}
        placeholder={REWORK_REQUEST_FORM_LABELS.productPlaceholder}
        required
        showCategory={false}
        pickerLabels={REWORK_REQUEST_PRODUCT_PICKER_LABELS}
        disabled={readOnly}
      />

      <FormInput
        control={control}
        name='title'
        label={REWORK_REQUEST_FORM_LABELS.title}
        required
        placeholder={REWORK_REQUEST_FORM_LABELS.titlePlaceholder}
        readOnly={readOnly}
      />

      <FormTextarea
        control={control}
        name='content'
        label={REWORK_REQUEST_FORM_LABELS.content}
        required
        placeholder={REWORK_REQUEST_FORM_LABELS.contentPlaceholder}
        maxLength={REWORK_REQUEST_FORM_LIMITS.contentMaxLength}
        readOnly={readOnly}
      />

      <FormInput
        control={control}
        name='managerName'
        label={REWORK_REQUEST_FORM_LABELS.managerName}
        required
        placeholder={REWORK_REQUEST_FORM_LABELS.managerNamePlaceholder}
        readOnly={readOnly}
      />

      <FormInput
        control={control}
        name='contact'
        label={REWORK_REQUEST_FORM_LABELS.contact}
        required
        placeholder={REWORK_REQUEST_FORM_LABELS.contactPlaceholder}
        infoMessage={readOnly ? undefined : REWORK_REQUEST_FORM_LABELS.contactInfo}
        readOnly={readOnly}
      />

      <FormFileDropzone
        control={control}
        name='attachments'
        label={REWORK_REQUEST_FORM_LABELS.attachments}
        secondaryInfoMessage={readOnly ? undefined : REWORK_REQUEST_FORM_LABELS.attachmentInfo}
        disabled={readOnly}
        uploading={uploadingAttachments}
      />

      {showReplies && <MyPageInquiryReplies comments={comments} inquiryStatus={inquiryStatus} className='mt-2' />}
    </div>
  );
};

export default ReworkRequestFormFields;
