import { ERROR_MESSAGE } from '@/utils/constants/error-message.constant';
import { MemberType, SortOrder } from '@/utils/enums/common.enum';
import { MemberSortBy, MemberStatus } from '@/utils/enums/member.enum';
import type { DateRange } from 'react-day-picker';
import type { DefaultValues } from 'react-hook-form';
import { z } from 'zod';
import { commonSchema } from '../common.schema';

export const memberFilterSchema = z.object({
  search_term: z.string().default(''),
  authority: z.string().optional(),
  status: z.nativeEnum(MemberStatus).optional(),
  sort_by: z.nativeEnum(MemberSortBy).optional(),
  sort_order: z.nativeEnum(SortOrder).optional(),
  page: z.number().int().positive().default(1),
  per_page: z.number().int().positive().default(10),
});

export type MemberFilterInput = z.infer<typeof memberFilterSchema>;

export const dateRangeSchema = z.object({
  from: z.date().optional(),
  to: z.date().optional(),
}) as z.ZodType<DateRange>;

export const memberActivityLogsFilterSchema = z.object({
  login_period: dateRangeSchema.optional(),
  order_period: dateRangeSchema.optional(),
  modification_period: dateRangeSchema.optional(),
  page: z.number().int().positive().default(1),
  per_page: z.number().int().positive().default(10),
});

export type MemberActivityLogsFilterInput = z.infer<typeof memberActivityLogsFilterSchema>;

const memberCreateBaseSchema = z.object({
  name: commonSchema.requiredString,
  username: commonSchema.requiredString,
  password: commonSchema.password,
  email: z.string().email(ERROR_MESSAGE.EMAIL_INVALID).optional().or(z.literal('')),
  mobile: commonSchema.requiredString,
  phone: commonSchema.requiredString,
  postcode: commonSchema.requiredString,
  address: commonSchema.requiredString,
  detailed_address: z.string().optional().default(''),
  agree_privacy: z.boolean().default(true),
  agree_terms: z.boolean().default(true),
  agree_sms: z.string().optional().default('1'),
  agree_email: z.string().optional().default('1'),
});

export const memberIndividualCreateSchema = memberCreateBaseSchema.extend({
  member_type: z.literal(MemberType.INDIVIDUAL).default(MemberType.INDIVIDUAL),
  company_name: z.string().optional().default(''),
  business_registration_number: z.string().optional().default(''),
  representative_name: z.string().optional().default(''),
  industry_type: z.string().optional().default(''),
  business_type: z.string().optional().default(''),
  business_postcode: z.string().optional().default(''),
  business_address: z.string().optional().default(''),
  business_address_detail: z.string().optional().default(''),
  tax_invoice_email: z.string().email(ERROR_MESSAGE.EMAIL_INVALID).optional().or(z.literal('')),
  homepage_url: z.string().optional().default(''),
  business_registration_file: z.string().optional().nullable().default(null),
});

export const memberBusinessCreateSchema = memberCreateBaseSchema.extend({
  member_type: z.literal(MemberType.BUSINESS),
  company_name: commonSchema.requiredString,
  business_registration_number: commonSchema.requiredString,
  representative_name: commonSchema.requiredString,
  industry_type: commonSchema.requiredString,
  business_type: commonSchema.requiredString,
  business_postcode: commonSchema.requiredString,
  business_address: commonSchema.requiredString,
  business_address_detail: z.string().optional().default(''),
  tax_invoice_email: commonSchema.requiredString.email(ERROR_MESSAGE.EMAIL_INVALID),
  homepage_url: commonSchema.requiredString,
  business_registration_file: commonSchema.requiredString,
});

export const memberCreateSchema = z.discriminatedUnion('member_type', [memberIndividualCreateSchema, memberBusinessCreateSchema]);

export type MemberCreateInput = Omit<z.infer<typeof memberIndividualCreateSchema>, 'member_type'> & {
  member_type: MemberType;
};

export const memberCreateInputDefault: DefaultValues<MemberCreateInput> = {
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
  company_name: '',
  business_registration_number: '',
  representative_name: '',
  industry_type: '',
  business_type: '',
  business_postcode: '',
  business_address: '',
  business_address_detail: '',
  tax_invoice_email: '',
  homepage_url: '',
  business_registration_file: null,
  agree_privacy: true,
  agree_terms: true,
  agree_sms: '1',
  agree_email: '1',
};

export const memberBasicInfoSchema = z.object({
  name: commonSchema.requiredString,
  username: commonSchema.requiredString,
  email: z.string().email(ERROR_MESSAGE.EMAIL_INVALID).optional().or(z.literal('')),
  mobile: commonSchema.requiredString,
  phone: commonSchema.requiredString,
  postcode: commonSchema.requiredString,
  address: commonSchema.requiredString,
  detailed_address: z.string().optional().default(''),
});

export type MemberBasicInfoInput = z.infer<typeof memberBasicInfoSchema>;

export const memberBusinessInfoSchema = z.object({
  company_name: commonSchema.requiredString,
  business_registration_number: commonSchema.requiredString,
  business_registration_file: commonSchema.requiredString,
  representative_name: commonSchema.requiredString,
  industry_type: commonSchema.requiredString,
  business_type: commonSchema.requiredString,
  business_postcode: commonSchema.requiredString,
  business_address: commonSchema.requiredString,
  business_address_detail: z.string().optional().default(''),
  tax_invoice_email: commonSchema.requiredString.email(ERROR_MESSAGE.EMAIL_INVALID),
  homepage_url: commonSchema.requiredString,
});

export type MemberBusinessInfoInput = z.infer<typeof memberBusinessInfoSchema>;

export const memberBasicInfoUpdateSchema = z.object({
  member_id: z.number(),
  name: z.string().optional(),
  username: z.string().optional(),
  email: z.string().email(ERROR_MESSAGE.EMAIL_INVALID).optional(),
  phone: z.string().optional(),
  mobile: z.string().optional(),
  postcode: z.string().optional(),
  address: z.string().optional(),
  detailed_address: z.string().optional(),
  status: z.union([z.nativeEnum(MemberStatus), z.string()]).optional(),
  company_name: z.string().optional(),
  business_registration_number: z.string().optional(),
  representative_name: z.string().optional(),
  industry_type: z.string().optional(),
  business_type: z.string().optional(),
  business_postcode: z.string().optional(),
  business_address: z.string().optional(),
  business_address_detail: z.string().optional(),
  tax_invoice_email: z.string().optional(),
  homepage_url: z.string().optional(),
  business_registration_file: z.string().optional(),
  agree_privacy: z.boolean().optional(),
  agree_terms: z.boolean().optional(),
  agree_sms: z.string().optional(),
  agree_email: z.string().optional(),
});

export type MemberBasicInfoUpdateInput = z.infer<typeof memberBasicInfoUpdateSchema>;

export const memberPasswordUpdateSchema = z.object({
  member_id: z.number(),
  new_password: z.string().optional(),
  generate_temporary: z.boolean().optional(),
});

export type MemberPasswordUpdateInput = z.infer<typeof memberPasswordUpdateSchema>;
