import type { RegisterInput } from '@/schemas/auth/auth.schema';
import { MemberType } from '@/utils/enums/common.enum';

export const transformInputToRegisterFormData = (input: RegisterInput): FormData => {
  const formData = new FormData();

  formData.append('member_type', input.memberType);
  formData.append('name', input.name);
  formData.append('username', input.username);
  formData.append('password', input.password);
  formData.append('password_confirmation', input.confirmedPassword);
  if (input.emailId && input.emailDomain) formData.append('email', `${input.emailId}@${input.emailDomain}`);
  formData.append('mobile', `${input.cellPhoneHead}${input.cellPhoneBody}${input.cellPhoneTail}`);

  if (input.landlinePhoneHead && input.landlinePhoneBody && input.landlinePhoneTail) {
    formData.append('phone', `${input.landlinePhoneHead}${input.landlinePhoneBody}${input.landlinePhoneTail}`);
  }

  formData.append('postcode', input.zipCode);
  formData.append('address', input.address);
  formData.append('detail_address', input.detailedAddress ?? '');

  formData.append('agree_privacy', input.privacyPolicy.toString());
  formData.append('agree_terms', input.termOfService.toString());
  formData.append('agree_sms', input.smsReception.toString());
  formData.append('agree_email', input.emailReception.toString());

  if (input.memberType === MemberType.BUSINESS) {
    if (input.companyName) formData.append('company_name', input.companyName);
    if (input.bizRegNumber) formData.append('business_registration_number', input.bizRegNumber);
    if (input.ceoName) formData.append('representative_name', input.ceoName);
    if (input.industry) formData.append('industry_type', input.industry);
    if (input.bizType) formData.append('business_type', input.bizType);
    if (input.bizZipCode) formData.append('business_postcode', input.bizZipCode);
    if (input.bizAddress) formData.append('business_address', input.bizAddress);
    if (input.bizDetailedAddress) formData.append('business_address_detail', input.bizDetailedAddress);
    if (input.taxEmail) formData.append('tax_invoice_email', input.taxEmail);
    if (input.homepage) formData.append('homepage_url', input.homepage);

    if (input.bizCertificate?.length > 0) {
      formData.append('business_registration_file', input.bizCertificate[0].file);
    }
  }

  return formData;
};
