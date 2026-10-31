import type { MemberActivityLogsFilterInput, MemberCreateInput, MemberFilterInput } from '@/schemas/member/member.schema';
import { INITIAL_PAGING, PAGE_PARAM_KEY, PER_PAGE_PARAM_KEY } from '@/utils/constants/common.constant';
import { DATE_FORMAT } from '@/utils/constants/date.constant';
import { ExportType, MemberType, SortOrder } from '@/utils/enums/common.enum';
import { MemberSortBy, MemberStatus } from '@/utils/enums/member.enum';
import dayjs from 'dayjs';
import type {
  MemberActivityLogsREQ,
  MemberBusinessInfoREQ,
  MemberCreateBaseREQ,
  MemberCreateREQ,
  MemberExportExcelREQ,
  MemberListREQ,
} from './member.request';
import type { MemberDetailItemRESP } from './member.respsonse';

export type MemberFilterValues = MemberFilterInput;

export const DEFAULT_MEMBER_FILTER: MemberFilterValues = {
  search_term: '',
  authority: undefined,
  status: undefined,
  sort_by: undefined,
  sort_order: undefined,
  page: 1,
  per_page: 10,
};

export const getMemberListInitFilter = (searchParams: URLSearchParams): MemberFilterValues => ({
  search_term: searchParams.get('search_term') || '',
  authority: searchParams.get('authority') || undefined,
  status: (searchParams.get('status') as MemberStatus) || undefined,
  sort_by: searchParams.get('sort_by') as MemberSortBy,
  sort_order: searchParams.get('sort_order') as SortOrder,
  page: Number(searchParams.get(PAGE_PARAM_KEY)) || INITIAL_PAGING.page || 1,
  per_page: Number(searchParams.get(PER_PAGE_PARAM_KEY)) || INITIAL_PAGING.per_page || 10,
});

export const transformMemberFilterToREQ = (filter: MemberFilterValues): MemberListREQ => ({
  page: filter.page,
  per_page: filter.per_page,
  search_term: filter.search_term || undefined,
  authority: filter.authority || undefined,
  status: filter.status,
  sort_by: filter.sort_by,
  sort_order: filter.sort_order,
});

export const transformMemberFilterToExportREQ = (
  filter: MemberFilterValues,
  exportType: ExportType,
  selectedIds: number[] = [],
  currentPage?: number,
  locale = 'en',
): MemberExportExcelREQ => ({
  export_type: exportType,
  selected_ids: exportType === ExportType.SELECTED ? selectedIds : undefined,
  current_page: exportType === ExportType.CURRENT_PAGE ? (currentPage ?? filter.page) : undefined,
  per_page: filter.per_page,
  locale,
  search_term: filter.search_term || undefined,
  authority: filter.authority || undefined,
  status: filter.status,
  sort_by: filter.sort_by,
  sort_order: filter.sort_order,
});

export type MemberActivityLogsFilterValues = MemberActivityLogsFilterInput;

export const DEFAULT_MEMBER_ACTIVITY_LOGS_FILTER: MemberActivityLogsFilterValues = {
  login_period: undefined,
  order_period: undefined,
  modification_period: undefined,
  page: 1,
  per_page: 10,
};

export const getMemberActivityLogsInitFilter = (searchParams: URLSearchParams): MemberActivityLogsFilterValues => ({
  login_period: undefined,
  order_period: undefined,
  modification_period: undefined,
  page: Number(searchParams.get(PAGE_PARAM_KEY)) || INITIAL_PAGING.page || 1,
  per_page: Number(searchParams.get(PER_PAGE_PARAM_KEY)) || INITIAL_PAGING.per_page || 10,
});

export const transformMemberActivityLogsFilterToREQ = (filter: MemberActivityLogsFilterValues): MemberActivityLogsREQ => ({
  login_date_from: filter.login_period?.from ? dayjs(filter.login_period.from).format(DATE_FORMAT) : undefined,
  login_date_to: filter.login_period?.to ? dayjs(filter.login_period.to).format(DATE_FORMAT) : undefined,
  order_date_from: filter.order_period?.from ? dayjs(filter.order_period.from).format(DATE_FORMAT) : undefined,
  order_date_to: filter.order_period?.to ? dayjs(filter.order_period.to).format(DATE_FORMAT) : undefined,
  modification_date_from: filter.modification_period?.from
    ? dayjs(filter.modification_period.from).format(DATE_FORMAT)
    : undefined,
  modification_date_to: filter.modification_period?.to ? dayjs(filter.modification_period.to).format(DATE_FORMAT) : undefined,
  page: filter.page,
  per_page: filter.per_page,
});

export const EMPTY_MEMBER_CREATE_FORM: MemberCreateREQ = {
  member_type: MemberType.INDIVIDUAL,
  name: '',
  username: '',
  password: '',
  email: '',
  mobile: '',
  phone: '',
  postcode: '',
  address: '',
  detailed_address: '',
  agree_privacy: true,
  agree_terms: true,
  agree_sms: '1',
  agree_email: '1',
};

export const transformMemberBasicInfoToREQ = (input: MemberCreateInput): MemberCreateBaseREQ => ({
  name: input.name.trim(),
  username: input.username.trim(),
  password: input.password,
  email: input.email?.trim() || undefined,
  mobile: input.mobile.trim(),
  phone: input.phone.trim(),
  postcode: input.postcode.trim(),
  address: input.address.trim(),
  detailed_address: input.detailed_address?.trim() || undefined,
  agree_privacy: input.agree_privacy,
  agree_terms: input.agree_terms,
  agree_sms: input.agree_sms,
  agree_email: input.agree_email,
});

export const transformMemberBusinessInfoToREQ = (
  input: MemberCreateInput,
  registrationFilePath?: string | null,
): MemberBusinessInfoREQ => ({
  company_name: input.company_name?.trim() || '',
  business_registration_number: input.business_registration_number?.trim() || '',
  representative_name: input.representative_name?.trim() || '',
  industry_type: input.industry_type?.trim() || '',
  business_type: input.business_type?.trim() || '',
  business_postcode: input.business_postcode?.trim() || '',
  business_address: input.business_address?.trim() || '',
  business_address_detail: input.business_address_detail?.trim() || undefined,
  tax_invoice_email: input.tax_invoice_email?.trim() || '',
  homepage_url: input.homepage_url?.trim() || '',
  business_registration_file: registrationFilePath || input.business_registration_file || null,
});

export const transformMemberCreateInputToREQ = (
  input: MemberCreateInput,
  registrationFilePath?: string | null,
): MemberCreateREQ => {
  const basicInfo = transformMemberBasicInfoToREQ(input);

  if (input.member_type === MemberType.BUSINESS) {
    const businessInfo = transformMemberBusinessInfoToREQ(input, registrationFilePath);
    return {
      ...basicInfo,
      ...businessInfo,
      member_type: MemberType.BUSINESS,
    };
  }

  return {
    ...basicInfo,
    member_type: MemberType.INDIVIDUAL,
  };
};

export const getMemberBusinessAddress = (
  member?: {
    business_postcode?: string | null;
    business_address?: string | null;
    business_address_detail?: string | null;
  } | null,
): string => {
  if (!member) return '-';
  return [member.business_postcode, member.business_address, member.business_address_detail].filter(Boolean).join(' ') || '-';
};

export const transformMemberDetailToBasicInput = (member?: MemberDetailItemRESP | null) => ({
  name: member?.name ?? '',
  username: member?.username ?? '',
  email: member?.email ?? '',
  mobile: member?.mobile ?? '',
  phone: member?.phone ?? '',
  postcode: member?.postcode ?? '',
  address: member?.address ?? '',
  detailed_address: member?.detailed_address ?? '',
});

export const transformMemberDetailToBusinessInput = (member?: MemberDetailItemRESP | null) => ({
  company_name: member?.company_name ?? '',
  business_registration_number: member?.business_registration_number ?? '',
  representative_name: member?.representative_name ?? '',
  industry_type: member?.industry_type ?? '',
  business_type: member?.business_type ?? '',
  business_postcode: member?.business_postcode ?? '',
  business_address: member?.business_address ?? '',
  business_address_detail: member?.business_address_detail ?? '',
  business_registration_file: member?.business_registration_file ?? '',
  tax_invoice_email: member?.tax_invoice_email ?? '',
  homepage_url: member?.homepage_url ?? '',
});

export const generateTemporaryPassword = (length: number = 10): string => {
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  const special = '!@#$%^&*()_+-=';

  const requiredChars = [
    lowercase[Math.floor(Math.random() * lowercase.length)],
    uppercase[Math.floor(Math.random() * uppercase.length)],
    numbers[Math.floor(Math.random() * numbers.length)],
    special[Math.floor(Math.random() * special.length)],
  ];

  const allChars = lowercase + uppercase + numbers + special;
  const remainingLength = Math.max(0, length - requiredChars.length);

  const remainingChars = Array.from({ length: remainingLength }, () => allChars[Math.floor(Math.random() * allChars.length)]);

  const passwordChars = [...requiredChars, ...remainingChars];

  for (let i = passwordChars.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [passwordChars[i], passwordChars[j]] = [passwordChars[j], passwordChars[i]];
  }

  return passwordChars.join('');
};

export const replacePhoneDigits = (value?: string | null): string => {
  return (value || '').replace(/\D/g, '').slice(0, 11);
};
