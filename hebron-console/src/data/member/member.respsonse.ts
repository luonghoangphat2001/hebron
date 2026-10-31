import type { LogAction, MemberType } from '@/utils/enums/common.enum';
import type { LedgerType, MemberStatus } from '@/utils/enums/member.enum';

export type MemberStatusObjectRESP = {
  value: string | null;
  label: string | null;
};

export type MemberApprovalStatusObjectRESP = {
  value: string | null;
  label: string | null;
};

export type MemberAuthorityObjectRESP = {
  value: string | null;
  label: string | null;
};

export type MemberListItemRESP = {
  id: number;
  name: string;
  username: string;
  email: string;
  member_type?: MemberType;
  phone?: string | null;
  mobile?: string | null;
  status: MemberStatusObjectRESP | MemberStatus;
  authority?: MemberAuthorityObjectRESP;
  date_of_joining?: string;
  created_at?: string;
  updated_at?: string;
  sign_up_at?: number | string;
  last_login_at?: number | string;
};

export type MemberListRESP = {
  members: MemberListItemRESP[];
};

export type MemberDetailItemRESP = {
  id: number;
  name: string;
  username: string;
  email: string;
  member_type?: MemberType;
  phone?: string | null;
  mobile?: string | null;
  postcode?: string | null;
  address?: string | null;
  detailed_address?: string | null;
  full_address?: string | null;
  status?: MemberStatusObjectRESP | null;
  authority?: MemberAuthorityObjectRESP | null;
  date_of_joining?: string | null;
  company_name?: string | null;
  business_registration_number?: string | null;
  representative_name?: string | null;
  business_type?: string | null;
  industry_type?: string | null;
  business_postcode?: string | null;
  business_address?: string | null;
  business_address_detail?: string | null;
  tax_invoice_email?: string | null;
  homepage_url?: string | null;
  business_registration_file?: string | null;
  created_at?: string;
  updated_at?: string;
  agree_privacy?: boolean | null;
  agree_terms?: boolean | null;
  agree_sms?: string | boolean | null;
  agree_email?: string | boolean | null;
};

export type MemberPermissionInfoRESP = {
  membership_level?: {
    value: string | null;
    label: string | null;
  };
  availability?: {
    value: boolean;
    label: string;
  };
  approval_status?: MemberApprovalStatusObjectRESP;
  authority?: MemberAuthorityObjectRESP;
  status?: MemberStatusObjectRESP;
  can_approve?: boolean;
  can_restore?: boolean;
};

export type MemberDetailDataRESP = {
  member: MemberDetailItemRESP;
  permission_information?: MemberPermissionInfoRESP;
  activity_log?: MemberActivityLogsDataRESP;
};

export type MemberRecentLoginItemRESP = {
  id: number;
  event_type: string;
  event_type_label: string;
  ip_address: string;
  browser_info: string;
  connection_time: string;
};

export type MemberRecentOrderItemRESP = {
  id: number;
  order_number: string;
  status: string;
  total_amount: number;
  placed_at: string;
};

export type MemberModificationUserRESP = {
  id: number;
  username: string;
  name: string;
  email: string;
};

export type MemberModificationFieldsRESP = {
  before?: Record<string, unknown>;
  after?: Record<string, unknown>;
  changes?: Record<string, unknown>;
};

export type MemberModificationLogItemRESP = {
  id: number;
  modified_at: string;
  modified_by: MemberModificationUserRESP;
  fields: MemberModificationFieldsRESP;
  description: string;
};

export type MemberModificationInfoRESP = {
  logs: MemberModificationLogItemRESP[];
  pagination: {
    current_page: number;
    per_page: number;
    total_page: number;
    total_item: number;
  };
};

export type MemberActivityLogsDataRESP = {
  recent_logins: MemberRecentLoginItemRESP[];
  recent_orders: MemberRecentOrderItemRESP[];
  information_modifications: MemberModificationInfoRESP;
};

export type MemberActivityLogsRESP = {
  activity_logs: MemberActivityLogsDataRESP;
};

export type MemberAccountRESP = {
  id: number;
  name: string;
  username: string;
  email: string;
  phone?: string | null;
  mobile?: string | null;
  status: MemberStatus | string;
  last_login_at?: number | string;
};

export type MemberPaymentInfoRESP = {
  bank_name?: string;
  account_number?: string;
  account_holder?: string;
  outstanding_balance: number;
};

export type MemberLedgerEntryRESP = {
  id: number;
  type: LedgerType;
  amount: number;
  balance_after: number;
  memo: string;
  transaction_at: number;
};

export type MemberActivityLogEntryRESP = {
  id: number;
  action: LogAction;
  actor: string;
  changes: Record<string, string>;
  created_at: string;
};

export type MemberRESP = {
  id: number;
  name: string;
  username: string;
  email: string;
  phone?: string | null;
  mobile?: string | null;
  status: MemberStatusObjectRESP | MemberStatus;
  last_login_at?: number | string;
  sign_up_at?: number | string;
  block_purchase?: boolean;
  block_login?: boolean;
  malicious_words?: string[];
  members?: MemberAccountRESP[];
  payment_info?: MemberPaymentInfoRESP;
  ledger?: MemberLedgerEntryRESP[];
  activity_log?: MemberActivityLogEntryRESP[];
};

export type MemberCreatedDataRESP = {
  member: {
    id: number;
    username: string;
    name: string;
    email: string;
    phone?: string | null;
    mobile?: string | null;
    postcode?: string | null;
    address?: string | null;
    detailed_address?: string | null;
    status?: MemberStatusObjectRESP | null;
    authority?: MemberAuthorityObjectRESP | null;
    company_name?: string | null;
    business_registration_number?: string | null;
    representative_name?: string | null;
    business_type?: string | null;
    industry_type?: string | null;
    business_postcode?: string | null;
    business_address?: string | null;
    business_address_detail?: string | null;
    tax_invoice_email?: string | null;
    homepage_url?: string | null;
    business_registration_file?: string | null;
    created_at?: string;
    updated_at?: string;
    agree_privacy?: boolean | null;
    agree_terms?: boolean | null;
    agree_sms?: string | boolean | null;
    agree_email?: string | boolean | null;
  };
};
