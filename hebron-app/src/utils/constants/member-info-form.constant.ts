import type { ProfileRESP } from '@/data/profile/profile.response';
import type { ProfileUpdateREQ } from '@/data/profile/profile.request';
import type { MemberInfoFormValues } from '@/schemas/member-info/member-info-form.schema';
import { EMAIL_DOMAINS } from '@/utils/constants/common.constant';
import { MemberType } from '@/utils/enums/common.enum';
import { splitPhonePattern } from '@/utils/helper/common.helper';

export const MEMBER_INFO_FORM_LABELS = {
  pageTitle: '회원정보수정',
  loginInfoSection: '로그인 정보',
  basicInfoSection: '기본정보',
  companyInfoSection: '기업 정보',
  memberType: '회원구분',
  username: '아이디',
  password: '비밀번호',
  passwordPlaceholder: '비밀번호',
  passwordInfo: '비밀번호는 영문과 숫자를 조합한 8~20자리로 해주세요. (특수문자 X)',
  confirmPassword: '비밀번호 확인',
  confirmPasswordPlaceholder: '비밀번호 확인',
  name: '이름',
  namePlaceholder: '이름',
  mobilePhone: '휴대폰',
  landlinePhone: '유선전화',
  address: '주소',
  email: '이메일',
  phonePlaceholder: '선택',
  bizRegNumber: '사업자등록번호',
  companyName: '기업명',
  ceoName: '대표자명',
  industry: '업종',
  bizType: '업태',
  shippingManagerName: '고객센터(배송) 담당자명',
  homepage: '홈페이지',
  promoImage: '홍보이미지',
  promoImageUpload: '파일 선택',
  promoImageInfo: '홍보이미지 파일을 업로드하세요. (이미지/PDF)',
  submit: '저장',
  loading: '불러오는 중...',
  loadFailed: '회원정보를 불러오지 못했습니다.',
  updateSuccess: '회원정보가 수정되었습니다.',
  updateFailed: '회원정보 수정에 실패했습니다.',
} as const;

export const MEMBER_TYPE_LABELS: Record<MemberType, string> = {
  [MemberType.INDIVIDUAL]: '개인회원',
  [MemberType.BUSINESS]: '기업회원',
};

export const MEMBER_INFO_FORM_DEFAULT_VALUES: MemberInfoFormValues = {
  memberType: MemberType.INDIVIDUAL,
  username: '',
  password: '',
  confirmPassword: '',
  name: '',
  phonePrefix: '',
  phoneBody: '',
  phoneTail: '',
  landlinePhonePrefix: '',
  landlinePhoneBody: '',
  landlinePhoneTail: '',
  zipCode: '',
  address: '',
  detailAddress: '',
  emailId: '',
  emailDomain: '',
  emailDomainSelect: 'direct',
  bizRegNumber: '',
  companyName: '',
  ceoName: '',
  bizType: '',
  industry: '',
  bizZipCode: '',
  bizAddress: '',
  bizDetailAddress: '',
  shippingManagerName: '',
  homepage: '',
  promoImage: [],
};

const splitEmail = (email: string | null) => {
  const [emailId = '', emailDomain = ''] = (email ?? '').split('@');
  const knownDomain = Object.values(EMAIL_DOMAINS).find((domain) => domain === emailDomain);

  return { emailId, emailDomain, emailDomainSelect: knownDomain ?? 'direct' };
};

const splitPhoneToParts = (phone: string | null) => {
  const parts = splitPhonePattern(phone ?? '');
  return { prefix: parts?.part1 ?? '', body: parts?.part2 ?? '', tail: parts?.part3 ?? '' };
};

export const mapProfileToMemberInfoFormValues = (profile: ProfileRESP): MemberInfoFormValues => {
  const mobile = splitPhoneToParts(profile.mobile);
  const landline = splitPhoneToParts(profile.phone);
  const email = splitEmail(profile.email);
  const customer = profile.customer;

  return {
    memberType: profile.member_type,
    username: profile.username,
    password: '',
    confirmPassword: '',
    name: profile.name,
    phonePrefix: mobile.prefix,
    phoneBody: mobile.body,
    phoneTail: mobile.tail,
    landlinePhonePrefix: landline.prefix,
    landlinePhoneBody: landline.body,
    landlinePhoneTail: landline.tail,
    zipCode: profile.postcode ?? '',
    address: profile.address ?? '',
    detailAddress: profile.detailed_address ?? '',
    emailId: email.emailId,
    emailDomain: email.emailDomain,
    emailDomainSelect: email.emailDomainSelect,
    bizRegNumber: customer?.business_registration_number ?? '',
    companyName: customer?.company_name ?? '',
    ceoName: customer?.representative_name ?? '',
    bizType: customer?.business_type ?? '',
    industry: customer?.business_items ?? '',
    bizZipCode: customer?.postcode ?? '',
    bizAddress: customer?.address ?? '',
    bizDetailAddress: customer?.detailed_address ?? '',
    shippingManagerName: customer?.contact_name ?? '',
    homepage: customer?.homepage_url ?? '',
    promoImage: [],
  };
};

export const mapMemberInfoFormToProfileREQ = (values: MemberInfoFormValues): ProfileUpdateREQ => {
  const body: ProfileUpdateREQ = {
    name: values.name.trim(),
    mobile: `${values.phonePrefix}${values.phoneBody}${values.phoneTail}`,
    phone: `${values.landlinePhonePrefix}${values.landlinePhoneBody}${values.landlinePhoneTail}`,
    postcode: values.zipCode,
    address: values.address,
    detailed_address: values.detailAddress,
  };

  if (values.emailId && values.emailDomain) {
    body.email = `${values.emailId}@${values.emailDomain}`;
  }

  if (values.password) {
    body.password = values.password;
    body.password_confirmation = values.confirmPassword;
  }

  if (values.memberType === MemberType.BUSINESS) {
    body.business_registration_number = values.bizRegNumber;
    body.company_name = values.companyName;
    body.representative_name = values.ceoName;
    body.business_type = values.bizType;
    body.business_items = values.industry;
    body.business_postcode = values.bizZipCode;
    body.business_address = values.bizAddress;
    body.business_detailed_address = values.bizDetailAddress;
    body.contact_name = values.shippingManagerName;
    body.homepage_url = values.homepage;
  }

  return body;
};
