import FormAddress from '@/components/form/FormAddress';
import FormInput from '@/components/form/FormInput';
import FormPhone from '@/components/form/FormPhone';
import FormSelect from '@/components/form/FormSelect';
import FormSwitch from '@/components/form/FormSwitch';
import type { ShippingAddressFormValues } from '@/schemas/shipping-address/shipping-address-form.schema';
import { PHONE_OPTIONS } from '@/utils/constants/common.constant';
import {
  SHIPPING_ADDRESS_DELIVERY_MESSAGE_OPTIONS,
  SHIPPING_ADDRESS_FORM_LABELS,
} from '@/utils/constants/shipping-address-form.constant';
import { useFormContext } from 'react-hook-form';

const ShippingAddressFormFields = () => {
  const { control } = useFormContext<ShippingAddressFormValues>();

  return (
    <div className='flex flex-col gap-4 md:gap-5'>
      <FormInput
        control={control}
        name='recipientName'
        label={SHIPPING_ADDRESS_FORM_LABELS.recipientName}
        required
        placeholder={SHIPPING_ADDRESS_FORM_LABELS.recipientNamePlaceholder}
      />

      <FormAddress
        control={control}
        nameZipCode='zipCode'
        nameAddress='address'
        nameDetailAddress='detailAddress'
        label={SHIPPING_ADDRESS_FORM_LABELS.address}
        required
      />

      {/* TODO: uncomment when backend adds manager_name
      <FormInput
        control={control}
        name='managerName'
        label={SHIPPING_ADDRESS_FORM_LABELS.managerName}
        placeholder={SHIPPING_ADDRESS_FORM_LABELS.managerNamePlaceholder}
      />
      */}

      <FormSelect
        control={control}
        name='deliveryMessage'
        label={SHIPPING_ADDRESS_FORM_LABELS.deliveryMessage}
        options={[...SHIPPING_ADDRESS_DELIVERY_MESSAGE_OPTIONS]}
        placeholder={SHIPPING_ADDRESS_FORM_LABELS.deliveryMessagePlaceholder}
      />

      <FormSwitch control={control} name='isDefault' label={SHIPPING_ADDRESS_FORM_LABELS.isDefault} />

      <FormPhone
        label={SHIPPING_ADDRESS_FORM_LABELS.phone}
        control={control}
        phoneOptions={PHONE_OPTIONS}
        namePrefix='phonePrefix'
        namePhone1='phoneBody'
        namePhone2='phoneTail'
        required
        placeholderSelect={SHIPPING_ADDRESS_FORM_LABELS.phonePlaceholder}
        showVerifyButton={false}
      />
    </div>
  );
};

export default ShippingAddressFormFields;
