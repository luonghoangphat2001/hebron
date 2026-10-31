import type { MemberType, SocialProvider, VerifyCodePurpose, VerifyCodeType } from '@/utils/enums/common.enum';

export type RegisterREQ = {
  member_type: MemberType;
  name: string;
  username: string;
  password: string;
  password_confirmation: string;
  email?: string;
  mobile: string;
  phone?: string;
  postcode?: string;
  address?: string;
  detail_address?: string;
  agree_privacy?: boolean;
  agree_terms?: boolean;
  agree_sms?: boolean;
  agree_email?: boolean;
  company_name?: string;
  business_registration_number?: string;
  representative_name?: string;
  industry_type?: string;
  business_type?: string;
  business_postcode?: string;
  business_address?: string;
  business_address_detail?: string;
  tax_invoice_email?: string;
  homepage_url?: string;
  business_registration_file?: File;
};

export type SendVerifyCodeREQ = {
  type: VerifyCodeType;
  purpose: VerifyCodePurpose;
  name?: string;
  username?: string;
  mobile?: string;
  email?: string;
};

export type VerifyCodeREQ = SendVerifyCodeREQ & {
  code: string;
};

export type LoginREQ = {
  username: string;
  password: string;
};

export type FindIdREQ = {
  type: VerifyCodeType;
  name?: string;
  username?: string;
  email?: string;
  mobile?: string;
  verification_code?: string;
  company_name?: string;
  business_registration_number?: string;
};

export type ResetPasswordWithCodeREQ = {
  username: string;
  name: string;
  type: VerifyCodeType;
  email?: string;
  mobile?: string;
  verification_code?: string;
  password: string;
  password_confirmation: string;
};

export type LogoutREQ = {
  refresh_token: string;
};

export type LoginSocialREQ = {
  provider: SocialProvider;
  code: string;
};
