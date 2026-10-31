import FormInput from '@/components/form/FormInput';
import { Button } from '@/components/ui/button';
import type { OrderInquiryFormValues } from '@/schemas/order-inquiry/order-inquiry.schema';
import { orderInquirySchema } from '@/schemas/order-inquiry/order-inquiry.schema';
import { ORDER_INQUIRY_DEFAULT_VALUES, ORDER_INQUIRY_LABELS } from '@/utils/constants/order-inquiry.constant';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

type OrderInquirySearchFormProps = {
  onSubmit: (values: OrderInquiryFormValues) => void;
  isSubmitting?: boolean;
};

const OrderInquirySearchForm = ({ onSubmit, isSubmitting }: OrderInquirySearchFormProps) => {
  const { control, handleSubmit } = useForm<OrderInquiryFormValues>({
    resolver: zodResolver(orderInquirySchema),
    defaultValues: ORDER_INQUIRY_DEFAULT_VALUES,
  });

  return (
    <form className='flex w-full flex-col gap-6' onSubmit={handleSubmit(onSubmit)}>
      <p className='md:text-md text-sm whitespace-pre-line text-neutral-500'>
        {`${ORDER_INQUIRY_LABELS.descriptionLine1}\n${ORDER_INQUIRY_LABELS.descriptionLine2}`}
      </p>

      <div className='flex flex-col gap-4'>
        <FormInput
          control={control}
          name='orderCode'
          label={ORDER_INQUIRY_LABELS.orderCodeLabel}
          placeholder={ORDER_INQUIRY_LABELS.orderCodePlaceholder}
          containerClassName='gap-6'
          labelClassName='md:w-80'
        />
        <FormInput
          control={control}
          name='phone'
          label={ORDER_INQUIRY_LABELS.phoneLabel}
          placeholder={ORDER_INQUIRY_LABELS.phonePlaceholder}
          containerClassName='gap-6'
          labelClassName='md:w-80'
          mode='phone'
        />
      </div>

      <div className='flex justify-end'>
        <Button type='submit' className='text-md h-12 min-w-36 px-8' disabled={isSubmitting}>
          {ORDER_INQUIRY_LABELS.searchButton}
        </Button>
      </div>
    </form>
  );
};

export default OrderInquirySearchForm;
