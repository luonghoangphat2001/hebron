import {
  EMAIL_DOMAIN_PART_REGEX,
  EMAIL_LOCAL_PART_REGEX,
  NUMERIC_ONLY_REGEX,
  PASSWORD_REGEX,
} from '@/utils/constants/regex.constant';
import { MemberType } from '@/utils/enums/common.enum';
import { z } from 'zod';

export const MEMBER_INFO_FORM_ERROR_MESSAGES = {
  passwordRequired: '비밀번호를 입력해주세요.',
  passwordInvalid: '비밀번호는 영문과 숫자를 조합한 8~20자리로 입력해주세요. (특수문자 사용 불가)',
  passwordConfirmRequired: '비밀번호 확인을 입력해주세요.',
  passwordMismatch: '비밀번호가 일치하지 않습니다.',
  nameRequired: '이름을 입력해주세요.',
  phonePrefixRequired: '휴대폰 앞자리를 선택해주세요.',
  phoneBodyRequired: '휴대폰 가운데 번호를 입력해주세요.',
  phoneTailRequired: '휴대폰 끝 번호를 입력해주세요.',
  phoneNumericOnly: '휴대폰 번호는 숫자만 입력해주세요.',
  landlinePrefixRequired: '유선전화 지역번호를 선택해주세요.',
  landlineBodyRequired: '유선전화 가운데 번호를 입력해주세요.',
  landlineTailRequired: '유선전화 끝 번호를 입력해주세요.',
  landlineNumericOnly: '유선전화 번호는 숫자만 입력해주세요.',
  zipCodeRequired: '우편번호를 입력해주세요.',
  addressRequired: '주소를 입력해주세요.',
  emailInvalid: '올바른 이메일 형식이 아닙니다.',
  bizRegNumberRequired: '사업자등록번호를 입력해주세요.',
  companyNameRequired: '기업명을 입력해주세요.',
  ceoNameRequired: '대표자명을 입력해주세요.',
  bizTypeRequired: '업태를 입력해주세요.',
  industryRequired: '종목을 입력해주세요.',
  bizZipCodeRequired: '기업 우편번호를 입력해주세요.',
  bizAddressRequired: '기업 주소를 입력해주세요.',
  shippingManagerNameRequired: '고객센터(배송) 담당자명을 입력해주세요.',
  homepageRequired: '홈페이지를 입력해주세요.',
  homepageInvalid: '올바른 URL 형식이 아닙니다.',
} as const;

const phoneBodySchema = z
  .string()
  .min(1, MEMBER_INFO_FORM_ERROR_MESSAGES.phoneBodyRequired)
  .max(4)
  .regex(NUMERIC_ONLY_REGEX, MEMBER_INFO_FORM_ERROR_MESSAGES.phoneNumericOnly);

const phoneTailSchema = z
  .string()
  .min(1, MEMBER_INFO_FORM_ERROR_MESSAGES.phoneTailRequired)
  .max(4)
  .regex(NUMERIC_ONLY_REGEX, MEMBER_INFO_FORM_ERROR_MESSAGES.phoneNumericOnly);

const landlineBodySchema = z
  .string()
  .min(1, MEMBER_INFO_FORM_ERROR_MESSAGES.landlineBodyRequired)
  .max(4)
  .regex(NUMERIC_ONLY_REGEX, MEMBER_INFO_FORM_ERROR_MESSAGES.landlineNumericOnly);

const landlineTailSchema = z
  .string()
  .min(1, MEMBER_INFO_FORM_ERROR_MESSAGES.landlineTailRequired)
  .max(4)
  .regex(NUMERIC_ONLY_REGEX, MEMBER_INFO_FORM_ERROR_MESSAGES.landlineNumericOnly);

export const memberInfoFormSchema = z
  .object({
    memberType: z.nativeEnum(MemberType),
    username: z.string().min(1),
    password: z.string(),
    confirmPassword: z.string(),
    name: z.string().min(1, MEMBER_INFO_FORM_ERROR_MESSAGES.nameRequired),
    phonePrefix: z.string().min(1, MEMBER_INFO_FORM_ERROR_MESSAGES.phonePrefixRequired),
    phoneBody: phoneBodySchema,
    phoneTail: phoneTailSchema,
    landlinePhonePrefix: z.string().min(1, MEMBER_INFO_FORM_ERROR_MESSAGES.landlinePrefixRequired),
    landlinePhoneBody: landlineBodySchema,
    landlinePhoneTail: landlineTailSchema,
    zipCode: z.string().min(1, MEMBER_INFO_FORM_ERROR_MESSAGES.zipCodeRequired),
    address: z.string().min(1, MEMBER_INFO_FORM_ERROR_MESSAGES.addressRequired),
    detailAddress: z.string(),
    emailId: z.string(),
    emailDomain: z.string(),
    emailDomainSelect: z.string(),
    bizRegNumber: z.string().optional(),
    companyName: z.string().optional(),
    ceoName: z.string().optional(),
    bizType: z.string().optional(),
    industry: z.string().optional(),
    bizZipCode: z.string().optional(),
    bizAddress: z.string().optional(),
    bizDetailAddress: z.string().optional(),
    shippingManagerName: z.string().optional(),
    homepage: z.string().optional(),
    promoImage: z.array(z.any()).optional(),
  })
  .superRefine((data, ctx) => {
    const { password, confirmPassword } = data;

    if (password || confirmPassword) {
      if (!password) {
        ctx.addIssue({
          code: 'custom',
          message: MEMBER_INFO_FORM_ERROR_MESSAGES.passwordRequired,
          path: ['password'],
        });
      } else if (!PASSWORD_REGEX.test(password)) {
        ctx.addIssue({
          code: 'custom',
          message: MEMBER_INFO_FORM_ERROR_MESSAGES.passwordInvalid,
          path: ['password'],
        });
      }

      if (!confirmPassword) {
        ctx.addIssue({
          code: 'custom',
          message: MEMBER_INFO_FORM_ERROR_MESSAGES.passwordConfirmRequired,
          path: ['confirmPassword'],
        });
      } else if (password && password !== confirmPassword) {
        ctx.addIssue({
          code: 'custom',
          message: MEMBER_INFO_FORM_ERROR_MESSAGES.passwordMismatch,
          path: ['confirmPassword'],
        });
      }
    }

    const hasEmailInput = data.emailId.length > 0 || data.emailDomain.length > 0;

    if (hasEmailInput) {
      if (!EMAIL_LOCAL_PART_REGEX.test(data.emailId) || !EMAIL_DOMAIN_PART_REGEX.test(data.emailDomain)) {
        ctx.addIssue({
          code: 'custom',
          message: MEMBER_INFO_FORM_ERROR_MESSAGES.emailInvalid,
          path: ['emailId'],
        });
      }
    }

    if (data.memberType === MemberType.BUSINESS) {
      if (!data.bizRegNumber?.trim()) {
        ctx.addIssue({
          code: 'custom',
          message: MEMBER_INFO_FORM_ERROR_MESSAGES.bizRegNumberRequired,
          path: ['bizRegNumber'],
        });
      }
      if (!data.companyName?.trim()) {
        ctx.addIssue({
          code: 'custom',
          message: MEMBER_INFO_FORM_ERROR_MESSAGES.companyNameRequired,
          path: ['companyName'],
        });
      }
      if (!data.ceoName?.trim()) {
        ctx.addIssue({
          code: 'custom',
          message: MEMBER_INFO_FORM_ERROR_MESSAGES.ceoNameRequired,
          path: ['ceoName'],
        });
      }
      if (!data.bizType?.trim()) {
        ctx.addIssue({
          code: 'custom',
          message: MEMBER_INFO_FORM_ERROR_MESSAGES.bizTypeRequired,
          path: ['bizType'],
        });
      }
      if (!data.industry?.trim()) {
        ctx.addIssue({
          code: 'custom',
          message: MEMBER_INFO_FORM_ERROR_MESSAGES.industryRequired,
          path: ['industry'],
        });
      }
      if (!data.bizZipCode?.trim()) {
        ctx.addIssue({
          code: 'custom',
          message: MEMBER_INFO_FORM_ERROR_MESSAGES.bizZipCodeRequired,
          path: ['bizZipCode'],
        });
      }
      if (!data.bizAddress?.trim()) {
        ctx.addIssue({
          code: 'custom',
          message: MEMBER_INFO_FORM_ERROR_MESSAGES.bizAddressRequired,
          path: ['bizAddress'],
        });
      }
      if (!data.shippingManagerName?.trim()) {
        ctx.addIssue({
          code: 'custom',
          message: MEMBER_INFO_FORM_ERROR_MESSAGES.shippingManagerNameRequired,
          path: ['shippingManagerName'],
        });
      }
      if (!data.homepage?.trim()) {
        ctx.addIssue({
          code: 'custom',
          message: MEMBER_INFO_FORM_ERROR_MESSAGES.homepageRequired,
          path: ['homepage'],
        });
      } else if (!z.url().safeParse(data.homepage).success) {
        ctx.addIssue({
          code: 'custom',
          message: MEMBER_INFO_FORM_ERROR_MESSAGES.homepageInvalid,
          path: ['homepage'],
        });
      }
    }
  });

export type MemberInfoFormValues = z.infer<typeof memberInfoFormSchema>;
