import FormFileDropzone from '@/components/form/FormFileDropzone';
import FormInput from '@/components/form/FormInput';
import FormTextarea from '@/components/form/FormTextarea';
import type { InquiryCommentRESP } from '@/data/inquiries/inquiries.response';
import MyPageInquiryReplies from '@/pages/ecommerce/my-page/components/MyPageInquiryReplies';
import MyPageProductPickerField from '@/pages/ecommerce/my-page/components/MyPageProductPickerField';
import type { ShippingInquiryFormValues } from '@/schemas/shipping-inquiry/shipping-inquiry-form.schema';
import { SHIPPING_INQUIRY_FORM_LABELS, SHIPPING_INQUIRY_FORM_LIMITS } from '@/utils/constants/shipping-inquiry-form.constant';
import { useFormContext } from 'react-hook-form';

type ShippingInquiryFormFieldsProps = {
  readOnly?: boolean;
  uploadingAttachments?: boolean;
  comments?: InquiryCommentRESP[];
  inquiryStatus?: string;
};

const SHIPPING_INQUIRY_PRODUCT_PICKER_LABELS = {
  title: SHIPPING_INQUIRY_FORM_LABELS.productPickerTitle,
  searchPlaceholder: SHIPPING_INQUIRY_FORM_LABELS.productPickerSearchPlaceholder,
  categoryLabel: SHIPPING_INQUIRY_FORM_LABELS.productPickerCategory,
  cancel: SHIPPING_INQUIRY_FORM_LABELS.cancel,
  confirm: SHIPPING_INQUIRY_FORM_LABELS.productPickerConfirm,
} as const;

const ShippingInquiryFormFields = ({
  readOnly = false,
  uploadingAttachments = false,
  comments = [],
  inquiryStatus,
}: ShippingInquiryFormFieldsProps) => {
  const { control, setValue } = useFormContext<ShippingInquiryFormValues>();

  const showReplies = comments.length > 0;

  return (
    <div className='flex flex-col gap-4 md:gap-5'>
      <MyPageProductPickerField
        control={control}
        setValue={setValue}
        label={SHIPPING_INQUIRY_FORM_LABELS.order}
        placeholder={SHIPPING_INQUIRY_FORM_LABELS.orderPlaceholder}
        required
        showCategory={false}
        pickerLabels={SHIPPING_INQUIRY_PRODUCT_PICKER_LABELS}
        disabled={readOnly}
      />

      <FormInput
        control={control}
        name='title'
        label={SHIPPING_INQUIRY_FORM_LABELS.title}
        required
        placeholder={SHIPPING_INQUIRY_FORM_LABELS.titlePlaceholder}
        readOnly={readOnly}
      />

      <FormTextarea
        control={control}
        name='content'
        label={SHIPPING_INQUIRY_FORM_LABELS.content}
        required
        placeholder={SHIPPING_INQUIRY_FORM_LABELS.contentPlaceholder}
        maxLength={SHIPPING_INQUIRY_FORM_LIMITS.contentMaxLength}
        readOnly={readOnly}
      />

      <FormInput
        control={control}
        name='managerName'
        label={SHIPPING_INQUIRY_FORM_LABELS.managerName}
        required
        placeholder={SHIPPING_INQUIRY_FORM_LABELS.managerNamePlaceholder}
        readOnly={readOnly}
      />

      <FormInput
        control={control}
        name='contact'
        label={SHIPPING_INQUIRY_FORM_LABELS.contact}
        required
        placeholder={SHIPPING_INQUIRY_FORM_LABELS.contactPlaceholder}
        infoMessage={readOnly ? undefined : SHIPPING_INQUIRY_FORM_LABELS.contactInfo}
        readOnly={readOnly}
      />

      <FormFileDropzone
        control={control}
        name='attachments'
        label={SHIPPING_INQUIRY_FORM_LABELS.attachments}
        secondaryInfoMessage={readOnly ? undefined : SHIPPING_INQUIRY_FORM_LABELS.attachmentInfo}
        disabled={readOnly}
        uploading={uploadingAttachments}
      />

      {showReplies && <MyPageInquiryReplies comments={comments} inquiryStatus={inquiryStatus} className='mt-2' />}
    </div>
  );
};

export default ShippingInquiryFormFields;
