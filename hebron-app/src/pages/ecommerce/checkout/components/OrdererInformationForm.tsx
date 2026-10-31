import FormInput from '@/components/form/FormInput';
import { UserIcon } from '@phosphor-icons/react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

const OrdererInformationForm = () => {
  const { t: tCommon } = useTranslation('common');
  const { control } = useFormContext();

  return (
    <section className='space-y-3 rounded-lg border border-neutral-200 p-3 md:p-4'>
      <div className='flex items-center gap-1.5'>
        <UserIcon className='size-5 text-neutral-400' weight='duotone' />
        <p className='text-md font-bold'>{tCommon('title.orderer_information')}</p>
      </div>
      <div className='grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-6'>
        <FormInput
          control={control}
          name='ordererInfo.name'
          label={tCommon('title.full_name')}
          labelPlacement='top'
          required
          placeholder={tCommon('title.full_name')}
        />
        <FormInput
          control={control}
          name='ordererInfo.companyName'
          label={tCommon('title.company_name')}
          labelPlacement='top'
          placeholder={tCommon('title.company_name')}
        />
      </div>
      <div className='grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-6'>
        <FormInput
          control={control}
          name='ordererInfo.mobilePhone'
          label={tCommon('title.mobile_phone')}
          labelPlacement='top'
          required
          placeholder='010-1234-5678'
          mode='phone'
        />
        <FormInput
          control={control}
          name='ordererInfo.phoneNumber'
          label={tCommon('title.phone_number')}
          labelPlacement='top'
          required
          placeholder={tCommon('title.phone_number')}
          mode='phone'
        />
      </div>
      <FormInput
        control={control}
        name='ordererInfo.email'
        label={tCommon('title.email')}
        labelPlacement='top'
        required
        placeholder='hebron21@naver.com'
      />
    </section>
  );
};

export default OrdererInformationForm;
