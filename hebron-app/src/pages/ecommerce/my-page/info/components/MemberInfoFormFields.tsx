import FormAddress from '@/components/form/FormAddress';
import FormEmail from '@/components/form/FormEmail';
import FormInput from '@/components/form/FormInput';
import FormPhone from '@/components/form/FormPhone';
import FormUpload from '@/components/form/FormUpload';
import { AppInput } from '@/components/input/AppInput';
import { Typography } from '@/components/typography/Typography';
import type { MemberInfoFormValues } from '@/schemas/member-info/member-info-form.schema';
import { EMAIL_DOMAIN_OPTIONS, PHONE_OPTIONS } from '@/utils/constants/common.constant';
import { MEMBER_INFO_FORM_LABELS, MEMBER_TYPE_LABELS } from '@/utils/constants/member-info-form.constant';
import { MemberType } from '@/utils/enums/common.enum';
import { useFormContext, useWatch } from 'react-hook-form';

const MemberInfoFormFields = () => {
  const { control, setValue } = useFormContext<MemberInfoFormValues>();
  const memberType = useWatch({ control, name: 'memberType' }) ?? MemberType.INDIVIDUAL;
  const isBusinessMember = memberType === MemberType.BUSINESS;

  return (
    <div className='flex flex-col gap-8'>
      <section className='flex flex-col gap-4 md:gap-5'>
        <Typography weight='bold' className='text-md'>
          {MEMBER_INFO_FORM_LABELS.loginInfoSection}
        </Typography>

        <AppInput label={MEMBER_INFO_FORM_LABELS.memberType} required disabled value={MEMBER_TYPE_LABELS[memberType]} />
        <FormInput control={control} name='username' label={MEMBER_INFO_FORM_LABELS.username} required disabled />
        <FormInput
          control={control}
          name='password'
          label={MEMBER_INFO_FORM_LABELS.password}
          required
          type='password'
          placeholder={MEMBER_INFO_FORM_LABELS.passwordPlaceholder}
          infoMessage={MEMBER_INFO_FORM_LABELS.passwordInfo}
        />
        <FormInput
          control={control}
          name='confirmPassword'
          label={MEMBER_INFO_FORM_LABELS.confirmPassword}
          required
          type='password'
          placeholder={MEMBER_INFO_FORM_LABELS.confirmPasswordPlaceholder}
        />
      </section>

      <section className='flex flex-col gap-4 md:gap-5'>
        <Typography weight='bold' className='text-md'>
          {MEMBER_INFO_FORM_LABELS.basicInfoSection}
        </Typography>

        <FormInput
          control={control}
          name='name'
          label={MEMBER_INFO_FORM_LABELS.name}
          required
          placeholder={MEMBER_INFO_FORM_LABELS.namePlaceholder}
        />
        <FormPhone
          label={MEMBER_INFO_FORM_LABELS.mobilePhone}
          control={control}
          phoneOptions={PHONE_OPTIONS}
          namePrefix='phonePrefix'
          namePhone1='phoneBody'
          namePhone2='phoneTail'
          required
          placeholderSelect={MEMBER_INFO_FORM_LABELS.phonePlaceholder}
        />
        <FormPhone
          label={MEMBER_INFO_FORM_LABELS.landlinePhone}
          control={control}
          phoneOptions={PHONE_OPTIONS}
          namePrefix='landlinePhonePrefix'
          namePhone1='landlinePhoneBody'
          namePhone2='landlinePhoneTail'
          required
          placeholderSelect={MEMBER_INFO_FORM_LABELS.phonePlaceholder}
          showVerifyButton={false}
        />
        <FormAddress
          control={control}
          nameZipCode='zipCode'
          nameAddress='address'
          nameDetailAddress='detailAddress'
          label={MEMBER_INFO_FORM_LABELS.address}
          required
        />
        <FormEmail
          control={control}
          setValue={setValue}
          nameId='emailId'
          nameDomain='emailDomain'
          nameDomainSelect='emailDomainSelect'
          label={MEMBER_INFO_FORM_LABELS.email}
          emailOptions={EMAIL_DOMAIN_OPTIONS}
        />
      </section>

      {isBusinessMember && (
        <section className='flex flex-col gap-4 md:gap-5'>
          <Typography weight='bold' className='text-md'>
            {MEMBER_INFO_FORM_LABELS.companyInfoSection}
          </Typography>

          <FormInput
            control={control}
            name='bizRegNumber'
            label={MEMBER_INFO_FORM_LABELS.bizRegNumber}
            required
            placeholder={MEMBER_INFO_FORM_LABELS.bizRegNumber}
          />
          <FormInput
            control={control}
            name='companyName'
            label={MEMBER_INFO_FORM_LABELS.companyName}
            required
            placeholder={MEMBER_INFO_FORM_LABELS.companyName}
          />
          <FormInput
            control={control}
            name='ceoName'
            label={MEMBER_INFO_FORM_LABELS.ceoName}
            required
            placeholder={MEMBER_INFO_FORM_LABELS.ceoName}
          />
          <FormInput
            control={control}
            name='industry'
            label={MEMBER_INFO_FORM_LABELS.industry}
            required
            placeholder={MEMBER_INFO_FORM_LABELS.industry}
          />
          <FormInput
            control={control}
            name='bizType'
            label={MEMBER_INFO_FORM_LABELS.bizType}
            required
            placeholder={MEMBER_INFO_FORM_LABELS.bizType}
          />
          <FormAddress
            control={control}
            nameZipCode='bizZipCode'
            nameAddress='bizAddress'
            nameDetailAddress='bizDetailAddress'
            label={MEMBER_INFO_FORM_LABELS.address}
            required
          />
          <FormInput
            control={control}
            name='shippingManagerName'
            label={MEMBER_INFO_FORM_LABELS.shippingManagerName}
            required
            placeholder={MEMBER_INFO_FORM_LABELS.shippingManagerName}
          />
          <FormInput
            control={control}
            name='homepage'
            label={MEMBER_INFO_FORM_LABELS.homepage}
            required
            placeholder={MEMBER_INFO_FORM_LABELS.homepage}
          />
          <FormUpload
            control={control}
            name='promoImage'
            label={MEMBER_INFO_FORM_LABELS.promoImage}
            labelButton={MEMBER_INFO_FORM_LABELS.promoImageUpload}
            infoMessage={MEMBER_INFO_FORM_LABELS.promoImageInfo}
            multiple={false}
            accept='image/*,application/pdf'
          />
        </section>
      )}
    </div>
  );
};

export default MemberInfoFormFields;
