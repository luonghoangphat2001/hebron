import { PASSWORD_REGEX } from '@/utils/constants/regex.constant';
import { MemberType, VerifyCodeType } from '@/utils/enums/common.enum';
import type { TFunction } from 'i18next';
import { z } from 'zod';

//-------register
export const registerSchema = (tCommon: TFunction, tValidation: TFunction<'validation'>) =>
  z
    .object({
      memberType: z.enum(MemberType),
      termOfService: z.boolean(),
      privacyPolicy: z.boolean(),
      smsReception: z.boolean(),
      emailReception: z.boolean(),

      username: z.string().min(1, tValidation('required', { field: tCommon('title.username') })),
      password: z
        .string()
        .min(6, tValidation('min_length', { field: tCommon('title.password'), length: 6 }))
        .max(20, tValidation('max_length', { field: tCommon('title.password'), length: 20 }))
        .regex(PASSWORD_REGEX, tCommon('title.password_rule')),
      confirmedPassword: z.string().min(1, tValidation('required', { field: tCommon('title.verify_password') })),
      name: z.string().min(1, tValidation('required', { field: tCommon('title.full_name') })),
      cellPhoneHead: z.string().min(1, tValidation('required', { field: tCommon('title.cell_phone') })),
      cellPhoneBody: z.string().min(4, tValidation('min_length', { field: tCommon('title.cell_phone'), length: 4 })),
      cellPhoneTail: z.string().min(4, tValidation('min_length', { field: tCommon('title.cell_phone'), length: 4 })),
      landlinePhoneHead: z.string().optional(),
      landlinePhoneBody: z.string().optional(),
      landlinePhoneTail: z.string().optional(),

      zipCode: z.string().min(1, tValidation('required', { field: tCommon('title.address') })),
      address: z.string().min(1, tValidation('required', { field: tCommon('title.address') })),
      detailedAddress: z.string().optional(),
      emailId: z.string().optional(),
      emailDomain: z.string().optional(),
      emailDomainSelect: z.string().optional(),

      // Corporate fields
      bizRegNumber: z.string().optional(),
      companyName: z.string().optional(),
      ceoName: z.string().optional(),
      industry: z.string().optional(),
      bizType: z.string().optional(),
      bizZipCode: z.string().optional(),
      bizAddress: z.string().optional(),
      bizDetailedAddress: z.string().optional(),
      taxEmail: z.string().optional(),
      homepage: z.url(tValidation('invalid_url')).or(z.literal('')).optional(),
      bizCertificate: z.array(z.any()),
      recaptchaToken: z.string().min(1, tValidation('recaptcha_required')),
    })
    .refine((data) => data.password === data.confirmedPassword, {
      message: tValidation('password_not_match'),
      path: ['confirmedPassword'],
    })
    .superRefine((data, ctx) => {
      if (data.memberType === MemberType.BUSINESS) {
        if (!data.bizRegNumber) {
          ctx.addIssue({
            code: 'custom',
            message: tValidation('required', { field: tCommon('title.business_registration_number') }),
            path: ['bizRegNumber'],
          });
        }
        if (!data.companyName) {
          ctx.addIssue({
            code: 'custom',
            message: tValidation('required', { field: tCommon('title.company_name') }),
            path: ['companyName'],
          });
        }
        if (!data.ceoName) {
          ctx.addIssue({
            code: 'custom',
            message: tValidation('required', { field: tCommon('title.representative_name') }),
            path: ['ceoName'],
          });
        }
        if (!data.industry) {
          ctx.addIssue({
            code: 'custom',
            message: tValidation('required', { field: tCommon('title.business_industry') }),
            path: ['industry'],
          });
        }
        if (!data.bizType) {
          ctx.addIssue({
            code: 'custom',
            message: tValidation('required', { field: tCommon('title.business_type') }),
            path: ['bizType'],
          });
        }
        if (!data.bizZipCode) {
          ctx.addIssue({
            code: 'custom',
            message: tValidation('required', { field: tCommon('title.address') }),
            path: ['bizZipCode'],
          });
        }
        if (!data.bizAddress) {
          ctx.addIssue({
            code: 'custom',
            message: tValidation('required', { field: tCommon('title.address') }),
            path: ['bizAddress'],
          });
        }
        if (!data.taxEmail) {
          ctx.addIssue({
            code: 'custom',
            message: tValidation('required', { field: tCommon('title.tax_invoice_email') }),
            path: ['taxEmail'],
          });
        } else if (!z.email().safeParse(data.taxEmail).success) {
          ctx.addIssue({
            code: 'custom',
            message: tValidation('invalid_email'),
            path: ['taxEmail'],
          });
        }
        if (data.bizCertificate.length === 0) {
          ctx.addIssue({
            code: 'custom',
            message: tValidation('select_required', { field: tCommon('title.business_registration_certificate') }),
            path: ['bizCertificate'],
          });
        }
      }
    });

export type RegisterInput = z.infer<ReturnType<typeof registerSchema>>;

export const registerInputDefault: RegisterInput = {
  memberType: MemberType.INDIVIDUAL,
  termOfService: false,
  privacyPolicy: false,
  smsReception: false,
  emailReception: false,

  username: '',
  password: '',
  confirmedPassword: '',
  name: '',
  cellPhoneHead: '',
  cellPhoneBody: '',
  cellPhoneTail: '',
  landlinePhoneHead: '',
  landlinePhoneBody: '',
  landlinePhoneTail: '',
  zipCode: '',
  address: '',
  detailedAddress: '',
  emailId: '',
  emailDomain: '',
  emailDomainSelect: 'direct',

  bizRegNumber: '',
  companyName: '',
  ceoName: '',
  industry: '',
  bizType: '',
  bizZipCode: '',
  bizAddress: '',
  bizDetailedAddress: '',
  taxEmail: '',
  homepage: '',
  bizCertificate: [],

  recaptchaToken: '',
};
//register-------

//-----login
export const loginSchema = (tCommon: TFunction, tValidation: TFunction<'validation'>) =>
  z.object({
    username: z.string().min(1, tValidation('required', { field: tCommon('title.username') })),
    password: z
      .string()
      .min(6, tValidation('min_length', { field: tCommon('title.password'), length: 6 }))
      .max(20, tValidation('max_length', { field: tCommon('title.password'), length: 20 }))
      .regex(PASSWORD_REGEX, tCommon('title.password_rule')),
  });

export type LoginInput = z.infer<ReturnType<typeof loginSchema>>;
export const loginInputDefault: LoginInput = {
  username: '',
  password: '',
};
//login-----------

//-----find ID
export const findIdSchema = (tCommon: TFunction, tValidation: TFunction<'validation'>) =>
  z
    .object({
      findType: z.enum(VerifyCodeType),
      name: z.string().optional(),
      emailId: z.string().optional(),
      emailDomain: z.string().optional(),
      emailDomainSelect: z.string().optional(),
      cellphoneHead: z.string().optional(),
      cellphoneBody: z.string().optional(),
      cellphoneTail: z.string().optional(),
      company_name: z.string().optional(),
      business_registration_number: z.string().optional(),
    })
    .superRefine((val, ctx) => {
      if (val.findType === VerifyCodeType.EMAIL) {
        if (!val.name || val.name.trim() === '') {
          ctx.addIssue({
            path: ['name'],
            code: 'custom',
            message: tValidation('required', { field: tCommon('title.full_name') }),
          });
        }
        if (!val.emailId) {
          ctx.addIssue({
            path: ['emailId'],
            code: 'custom',
            message: tValidation('required', { field: tCommon('title.email') }),
          });
        }
        if (!val.emailDomain) {
          ctx.addIssue({
            path: ['emailDomain'],
            code: 'custom',
            message: tValidation('required', { field: tCommon('title.email') }),
          });
        }
      } else if (val.findType === VerifyCodeType.MOBILE) {
        if (!val.name || val.name.trim() === '') {
          ctx.addIssue({
            path: ['name'],
            code: 'custom',
            message: tValidation('required', { field: tCommon('title.full_name') }),
          });
        }
        if (!val.cellphoneHead) {
          ctx.addIssue({
            path: ['cellphoneHead'],
            code: 'custom',
            message: tValidation('required', { field: tCommon('title.phone_number') }),
          });
        }
        if (!val.cellphoneBody) {
          ctx.addIssue({
            path: ['cellphoneBody'],
            code: 'custom',
            message: tValidation('required', { field: tCommon('title.phone_number') }),
          });
        }
        if (!val.cellphoneTail) {
          ctx.addIssue({
            path: ['cellphoneTail'],
            code: 'custom',
            message: tValidation('required', { field: tCommon('title.phone_number') }),
          });
        }
      } else if (val.findType === VerifyCodeType.BUSINESS) {
        if (!val.company_name || val.company_name.trim() === '') {
          ctx.addIssue({
            path: ['company_name'],
            code: 'custom',
            message: tValidation('required', { field: tCommon('title.company_name') }),
          });
        }
        if (!val.business_registration_number || val.business_registration_number.trim() === '') {
          ctx.addIssue({
            path: ['business_registration_number'],
            code: 'custom',
            message: tValidation('required', { field: tCommon('title.business_registration_number') }),
          });
        }
      }
    });

export type FindIdInput = z.infer<ReturnType<typeof findIdSchema>>;
export const findIdInputDefault: FindIdInput = {
  findType: VerifyCodeType.EMAIL,
  name: '',
  emailId: '',
  emailDomain: '',
  emailDomainSelect: 'direct',
  cellphoneHead: '010',
  cellphoneBody: '',
  cellphoneTail: '',
  company_name: '',
  business_registration_number: '',
};
//find ID-----

//------find password
export const findPasswordSchema = (tCommon: TFunction, tValidation: TFunction<'validation'>) =>
  z
    .object({
      findType: z.enum(VerifyCodeType),
      name: z.string().min(1, tValidation('required', { field: tCommon('title.full_name') })),
      id: z.string().min(1, tValidation('required', { field: tCommon('title.username') })),
      emailId: z.string().optional(),
      emailDomain: z.string().optional(),
      emailDomainSelect: z.string().optional(),
      cellphoneHead: z.string().optional(),
      cellphoneBody: z.string().optional(),
      cellphoneTail: z.string().optional(),
    })
    .superRefine((val, ctx) => {
      if (val.findType === VerifyCodeType.EMAIL) {
        if (!val.emailId) {
          ctx.addIssue({
            path: ['emailId'],
            code: 'custom',
            message: tValidation('required', { field: tCommon('title.email') }),
          });
        }
        if (!val.emailDomain) {
          ctx.addIssue({
            path: ['emailDomain'],
            code: 'custom',
            message: tValidation('required', { field: tCommon('title.email') }),
          });
        }
      } else {
        if (!val.cellphoneHead) {
          ctx.addIssue({
            path: ['cellphoneHead'],
            code: 'custom',
            message: tValidation('required', { field: tCommon('title.phone_number') }),
          });
        }
        if (!val.cellphoneBody) {
          ctx.addIssue({
            path: ['cellphoneBody'],
            code: 'custom',
            message: tValidation('required', { field: tCommon('title.phone_number') }),
          });
        }
        if (!val.cellphoneTail) {
          ctx.addIssue({
            path: ['cellphoneTail'],
            code: 'custom',
            message: tValidation('required', { field: tCommon('title.phone_number') }),
          });
        }
      }
    });

export type FindPasswordInput = z.infer<ReturnType<typeof findPasswordSchema>>;
export const findPasswordInputDefault: FindPasswordInput = {
  findType: VerifyCodeType.EMAIL,
  name: '',
  id: '',
  emailId: '',
  emailDomain: '',
  emailDomainSelect: 'direct',
  cellphoneHead: '010',
  cellphoneBody: '',
  cellphoneTail: '',
};
//find password-------------

//------reset password
export const resetPasswordSchema = (tCommon: TFunction, tValidation: TFunction<'validation'>) =>
  z
    .object({
      password: z
        .string()
        .min(6, tValidation('min_length', { field: tCommon('title.password'), length: 6 }))
        .max(20, tValidation('max_length', { field: tCommon('title.password'), length: 20 }))
        .regex(PASSWORD_REGEX, tCommon('title.password_rule')),
      confirmedPassword: z.string().min(1, tValidation('required', { field: tCommon('title.verify_password') })),
    })
    .refine((data) => data.password === data.confirmedPassword, {
      message: tValidation('password_not_match'),
      path: ['confirmedPassword'],
    });

export type ResetPasswordInput = z.infer<ReturnType<typeof resetPasswordSchema>>;
export const resetPasswordInputDefault: ResetPasswordInput = {
  password: '',
  confirmedPassword: '',
};
//find
//reset password-------------
