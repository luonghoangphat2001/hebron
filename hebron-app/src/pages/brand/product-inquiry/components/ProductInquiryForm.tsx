import FormDatePicker from '@/components/form/FormDatePicker';
import FormFileDropzone from '@/components/form/FormFileDropzone';
import FormInput from '@/components/form/FormInput';
import FormRadioGroup from '@/components/form/FormRadioGroup';
import FormSelect from '@/components/form/FormSelect';
import FormTextarea from '@/components/form/FormTextarea';
import { Button } from '@/components/ui/button';
import type { BrandProductInquiryFormValues } from '@/schemas/brand-product-inquiry/brand-product-inquiry-form.schema';
import {
  BRAND_PRODUCT_INQUIRY_BUDGET_OPTIONS,
  BRAND_PRODUCT_INQUIRY_FORM_LABELS,
  BRAND_PRODUCT_INQUIRY_FORM_LIMITS,
  BRAND_PRODUCT_INQUIRY_PAGE_LABELS,
  BRAND_PRODUCT_INQUIRY_QUANTITY_OPTIONS,
  getBrandProductInquiryUploadProps,
} from '@/utils/constants/brand-product-inquiry.constant';
import { PRODUCT_TYPE_OPTIONS } from '@/utils/constants/product.constant';
import type { BrandProductInquiryImageUploadView } from '@/utils/types/brand-product-inquiry.type';
import { useFormContext } from 'react-hook-form';

const BRAND_LABEL_PLACEMENT = 'left' as const;
const BRAND_FIELD_LABEL_CLASS = 'w-20 shrink-0 pt-3 sm:w-80 [&>:first-child]:text-white';
const BRAND_FIELD_ROW_CLASS = 'gap-6 sm:gap-10';
const BRAND_INPUT_CLASS =
  'h-11 rounded-lg border-neutral-700 bg-neutral-900 text-white placeholder:text-neutral-500 focus-visible:border-brand-strong';
const BRAND_SELECT_DATE_CLASS = 'h-11 rounded-lg focus-visible:border-brand-strong';
const BRAND_RADIO_LABEL_CLASS = 'text-neutral-300';

type ProductInquiryFormProps = {
  isSubmitting?: boolean;
  submitLabel?: string;
  imageUpload?: BrandProductInquiryImageUploadView;
};

const ProductInquiryForm = ({ isSubmitting, submitLabel, imageUpload }: ProductInquiryFormProps) => {
  const { control } = useFormContext<BrandProductInquiryFormValues>();

  return (
    <div className='flex flex-col gap-6'>
      <FormSelect
        control={control}
        name='inquiryType'
        label={BRAND_PRODUCT_INQUIRY_FORM_LABELS.inquiryType}
        required
        labelPlacement={BRAND_LABEL_PLACEMENT}
        containerClassName={BRAND_FIELD_ROW_CLASS}
        labelClassName={BRAND_FIELD_LABEL_CLASS}
        placeholder={BRAND_PRODUCT_INQUIRY_FORM_LABELS.inquiryTypePlaceholder}
        options={PRODUCT_TYPE_OPTIONS}
        variant='dark'
        className={BRAND_SELECT_DATE_CLASS}
      />

      <FormInput
        control={control}
        name='companyName'
        label={BRAND_PRODUCT_INQUIRY_FORM_LABELS.companyName}
        required
        labelPlacement={BRAND_LABEL_PLACEMENT}
        containerClassName={BRAND_FIELD_ROW_CLASS}
        labelClassName={BRAND_FIELD_LABEL_CLASS}
        placeholder={BRAND_PRODUCT_INQUIRY_FORM_LABELS.companyNamePlaceholder}
        className={BRAND_INPUT_CLASS}
      />

      <FormInput
        control={control}
        name='managerName'
        label={BRAND_PRODUCT_INQUIRY_FORM_LABELS.managerName}
        required
        labelPlacement={BRAND_LABEL_PLACEMENT}
        containerClassName={BRAND_FIELD_ROW_CLASS}
        labelClassName={BRAND_FIELD_LABEL_CLASS}
        placeholder={BRAND_PRODUCT_INQUIRY_FORM_LABELS.managerNamePlaceholder}
        className={BRAND_INPUT_CLASS}
      />

      <FormInput
        control={control}
        name='contact'
        label={BRAND_PRODUCT_INQUIRY_FORM_LABELS.contact}
        required
        labelPlacement={BRAND_LABEL_PLACEMENT}
        containerClassName={BRAND_FIELD_ROW_CLASS}
        labelClassName={BRAND_FIELD_LABEL_CLASS}
        placeholder={BRAND_PRODUCT_INQUIRY_FORM_LABELS.contactPlaceholder}
        className={BRAND_INPUT_CLASS}
        mode='phone'
      />

      <FormInput
        control={control}
        name='email'
        label={BRAND_PRODUCT_INQUIRY_FORM_LABELS.email}
        required
        labelPlacement={BRAND_LABEL_PLACEMENT}
        containerClassName={BRAND_FIELD_ROW_CLASS}
        labelClassName={BRAND_FIELD_LABEL_CLASS}
        placeholder={BRAND_PRODUCT_INQUIRY_FORM_LABELS.emailPlaceholder}
        className={BRAND_INPUT_CLASS}
        type='email'
      />

      <FormRadioGroup
        control={control}
        name='estimatedQuantity'
        label={BRAND_PRODUCT_INQUIRY_FORM_LABELS.estimatedQuantity}
        required
        labelPlacement={BRAND_LABEL_PLACEMENT}
        containerClassName={BRAND_FIELD_ROW_CLASS}
        fieldLabelClassName={BRAND_FIELD_LABEL_CLASS}
        options={[...BRAND_PRODUCT_INQUIRY_QUANTITY_OPTIONS]}
        labelClassName={BRAND_RADIO_LABEL_CLASS}
      />

      <FormDatePicker
        control={control}
        name='desiredDeliveryDate'
        label={BRAND_PRODUCT_INQUIRY_FORM_LABELS.desiredDeliveryDate}
        labelPlacement={BRAND_LABEL_PLACEMENT}
        containerClassName={BRAND_FIELD_ROW_CLASS}
        labelClassName={BRAND_FIELD_LABEL_CLASS}
        placeholder={BRAND_PRODUCT_INQUIRY_FORM_LABELS.desiredDeliveryDatePlaceholder}
        variant='dark'
        className={`${BRAND_SELECT_DATE_CLASS} w-full justify-start text-left font-normal`}
      />

      <FormRadioGroup
        control={control}
        name='budgetRange'
        label={BRAND_PRODUCT_INQUIRY_FORM_LABELS.budgetRange}
        required
        labelPlacement={BRAND_LABEL_PLACEMENT}
        containerClassName={BRAND_FIELD_ROW_CLASS}
        fieldLabelClassName={BRAND_FIELD_LABEL_CLASS}
        options={[...BRAND_PRODUCT_INQUIRY_BUDGET_OPTIONS]}
        labelClassName={BRAND_RADIO_LABEL_CLASS}
      />

      <FormTextarea
        control={control}
        name='content'
        label={BRAND_PRODUCT_INQUIRY_FORM_LABELS.content}
        required
        labelPlacement={BRAND_LABEL_PLACEMENT}
        containerClassName={BRAND_FIELD_ROW_CLASS}
        labelClassName={BRAND_FIELD_LABEL_CLASS}
        placeholder={BRAND_PRODUCT_INQUIRY_FORM_LABELS.contentPlaceholder}
        maxLength={BRAND_PRODUCT_INQUIRY_FORM_LIMITS.contentMaxLength}
        className='focus-visible:border-brand h-32 min-h-32 resize-none rounded-[6px] border border-neutral-800 bg-neutral-900 px-3 py-2 text-[14px] text-white placeholder:text-neutral-500'
      />

      <FormFileDropzone
        control={control}
        name='attachments'
        {...getBrandProductInquiryUploadProps(imageUpload)}
        labelPlacement={BRAND_LABEL_PLACEMENT}
        containerClassName={BRAND_FIELD_ROW_CLASS}
        labelClassName={BRAND_FIELD_LABEL_CLASS}
        variant='dark'
      />

      <div className='flex justify-end pt-2 md:pt-4'>
        <Button
          type='submit'
          size='lg'
          disabled={isSubmitting}
          className='bg-brand hover:bg-brand-hover h-12 w-full rounded-full text-base font-bold text-white transition-colors md:max-w-128'>
          {isSubmitting ? BRAND_PRODUCT_INQUIRY_PAGE_LABELS.submitting : submitLabel || BRAND_PRODUCT_INQUIRY_PAGE_LABELS.submit}
        </Button>
      </div>
    </div>
  );
};

export default ProductInquiryForm;
