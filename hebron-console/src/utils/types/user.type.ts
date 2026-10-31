import type { MemberType } from '../enums/common.enum';

export type User = {
  id: number;
  status: string;
  member_type: MemberType;
  username: string;
  name: string;
  email: string;
  phone: string;
  mobile: string;
  postcode: string;
  address: string;
  detailed_address: string | null;
  is_admin: boolean;
  is_normal_user: boolean;
  company_name: string | null;
  business_registration_number: string | null;
  representative_name: string | null;
  business_type: string | null;
  industry_type: string | null;
  business_postcode: string | null;
  business_address: string | null;
  business_address_detail: string | null;
  tax_invoice_email: string | null;
  homepage_url: string | null;
  business_registration_file: string | null;
};
