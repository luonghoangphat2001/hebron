import FormAddress from '@/components/form/FormAddress';
import FormInput from '@/components/form/FormInput';
import { TruckIcon } from '@phosphor-icons/react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

const ShippingInformationForm = () => {
  const { t: tCommon } = useTranslation('common');
  const { control } = useFormContext();

  return (
    <section className='space-y-3 rounded-lg border border-neutral-200 p-3 md:p-4'>
      <div className='flex items-center gap-1.5'>
        <TruckIcon className='size-5 text-neutral-400' weight='duotone' />
        <p className='text-md font-bold'>{tCommon('title.shipping_information')}</p>
      </div>
      <div className='grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-6'>
        <FormInput
          control={control}
          name='shippingInfo.recipient'
          label={tCommon('title.recipient')}
          labelPlacement='top'
          required
          placeholder={tCommon('title.recipient')}
        />
        <FormInput
          control={control}
          name='shippingInfo.contact'
          label={tCommon('title.contact_info')}
          labelPlacement='top'
          required
          placeholder={tCommon('title.contact_info')}
          mode='phone'
        />
      </div>
      <FormAddress
        control={control}
        nameZipCode='shippingInfo.zipCode'
        nameAddress='shippingInfo.address'
        nameDetailAddress='shippingInfo.addressDetail'
        label={tCommon('title.address')}
        labelPlacement='top'
        required
      />
      <FormInput
        control={control}
        name='shippingInfo.deliveryRequest'
        label={tCommon('title.delivery_request')}
        labelPlacement='top'
        required
        placeholder={tCommon('placeholder.please_select_shipping_request')}
      />
    </section>
  );
};

export default ShippingInformationForm;
