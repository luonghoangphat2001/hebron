import type { MemberBasicInfoUpdateInput, MemberPasswordUpdateInput } from '@/schemas/member/member.schema';
import type { MemberType } from '@/utils/enums/common.enum';
import type { MemberSortBy, MemberStatus } from '@/utils/enums/member.enum';
import type { ExportExcelBaseREQ } from '@/utils/types/export.type';
import type { PaginationREQ, SortREQ } from '@/utils/types/request.type';

export type MemberListREQ = PaginationREQ &
  SortREQ & {
    search_term?: string | undefined;
    authority?: string | undefined;
    status?: MemberStatus | undefined;
    sort_by?: MemberSortBy | undefined;
  };

export type MemberCreateBaseREQ = {
  name: string;
  username: string;
  password: string;
  email?: string;
  mobile: string;
  phone: string;
  postcode: string;
  address: string;
  detailed_address?: string;
  agree_privacy?: boolean;
  agree_terms?: boolean;
  agree_sms?: string;
  agree_email?: string;
};

export type MemberBusinessInfoREQ = {
  company_name: string;
  business_registration_number: string;
  representative_name: string;
  industry_type: string;
  business_type: string;
  business_postcode: string;
  business_address: string;
  business_address_detail?: string;
  tax_invoice_email: string;
  homepage_url: string;
  business_registration_file?: string | null;
};

export type MemberIndividualCreateREQ = MemberCreateBaseREQ & {
  member_type: MemberType.INDIVIDUAL;
};

export type MemberBusinessCreateREQ = MemberCreateBaseREQ &
  MemberBusinessInfoREQ & {
    member_type: MemberType.BUSINESS;
  };

export type MemberCreateREQ = MemberIndividualCreateREQ | MemberBusinessCreateREQ;

export type MemberBasicInfoUpdateREQ = MemberBasicInfoUpdateInput;

export type MemberPasswordUpdateREQ = MemberPasswordUpdateInput;

export type MemberActivityLogsREQ = PaginationREQ & {
  login_date_from?: string;
  login_date_to?: string;
  order_date_from?: string;
  order_date_to?: string;
  modification_date_from?: string;
  modification_date_to?: string;
};

export type MemberExportExcelREQ = ExportExcelBaseREQ & Omit<MemberListREQ, 'page'>;
