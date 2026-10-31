import type { MemberType, UserAuthority } from '@/utils/enums/common.enum';

export type ProfileCustomerRESP = {
  company_name: string | null;
  business_registration_number: string | null;
  representative_name: string | null;
  contact_name: string | null;
  contact_phone: string | null;
  contact_email: string | null;
  business_type: string | null;
  business_items: string | null;
  industry_type: string | null;
  postcode: string | null;
  address: string | null;
  detailed_address: string | null;
  tax_invoice_email: string | null;
  homepage_url: string | null;
  business_registration_file: string | null;
};

export type ProfileRESP = {
  id: number;
  username: string;
  name: string;
  email: string | null;
  phone: string | null;
  mobile: string | null;
  postcode: string | null;
  address: string | null;
  detailed_address: string | null;
  authority: UserAuthority;
  role: UserAuthority;
  is_admin: boolean;
  is_super_admin: boolean;
  is_store_admin: boolean;
  is_normal_user: boolean;
  headquarters: string | null;
  business_office: string | null;
  team: string | null;
  position: string | null;
  last_login_at: string | null;
  last_login_ip: string | null;
  permission: string | null;
  individual_approval: string | null;
  approval_line: string | null;
  agreed_at: string | null;
  agree_sms: boolean;
  agree_email: boolean;
  member_type: MemberType;
  customer: ProfileCustomerRESP | null;
};

export type ProfileDetailRESP = {
  profile: ProfileRESP;
};
