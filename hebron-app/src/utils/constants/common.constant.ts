import { BRAND_ROUTE, MY_ROUTE, ROUTE_NAME } from '@/utils/constants/route.constant';

export const LANG = 'lang';
export const ACCESS_TOKEN = 'accessToken';
export const REFRESH_TOKEN = 'refreshToken';
export const USER_INFO = 'userInfo';
export const GUEST_TOKEN = 'guestToken';
export const MOCK_LOGGED_IN = 'mockLoggedIn';
export const CALL_BACK_URL = 'callBackUrl';

export const FOOTER_INFO = {
  COMMON: [
    {
      label: '상호',
      info: '주식회사 헤브론',
    },
    {
      label: '대표',
      info: '김경환',
    },
    {
      label: '주소',
      info: '07271 서울특별시 영등포구 양산로 57-5 (양평동3가) 양평동 이노플렉스 1105호',
    },
    {
      label: '사업자등록번호',
      info: '7828101513',
    },
    {
      label: '통신판매업',
      info: '제 2016-서울영등포-1363 호',
    },
    {
      label: '이메일',
      info: 'hebron21@naver.com',
    },
  ],
  CUSTOMER_CENTER: [
    {
      label: 'CUSTOMER CENTER',
      primary: '02-2264-7911',
      secondary: 'FAX 02-2264-7914',
      descriptions: ['월~금 : 9:00 ~ 18:00', '※ 토·일·공휴일 휴무입니다.', '급한 용무 시 : 010-8887-3726'],
    },
    {
      label: 'BANK ACCOUNT',
      primary: '239-910031-46104',
      secondary: '하나은행',
      descriptions: ['예금주 : (주)헤브론'],
    },
  ],
};

export const ECOMMERCE_FOOTER_NAV = [
  {
    title: '예문샘플',
    to: ROUTE_NAME.EXAMPLE_SAMPLES,
  },
  {
    title: '이용약관',
    to: ROUTE_NAME.TERMS,
  },
  {
    title: '개인정보처리방침',
    to: ROUTE_NAME.PRIVACY_POLICY,
  },
  {
    title: '주문조회',
    to: ROUTE_NAME.ORDER_INQUIRY,
  },
] as const;

export const BRAND_FOOTER_NAV = [
  {
    title: '브랜드',
    to: BRAND_ROUTE.BRAND_PAGE,
  },
  {
    title: '제품',
    to: ROUTE_NAME.HOME,
  },
  {
    title: '공정',
    to: BRAND_ROUTE.PROCESS,
  },
  {
    title: '포트폴리오',
    to: BRAND_ROUTE.PORTFOLIO,
  },
  {
    title: 'FAQs',
    to: BRAND_ROUTE.FAQ,
  },
] as const;

export const PHONE_PREFIXES = [
  '02',
  '051',
  '053',
  '032',
  '062',
  '042',
  '052',
  '031',
  '033',
  '043',
  '041',
  '044',
  '063',
  '061',
  '054',
  '055',
  '064',
  '010',
  '070',
  '080',
  '1588',
  '1644',
];

export const PHONE_OPTIONS = PHONE_PREFIXES.map((p) => ({ label: p, value: p }));

export const EMAIL_DOMAINS = {
  NAVER: 'naver.com',
  GMAIL: 'gmail.com',
  KAKAO: 'kakao.com',
  DAUM: 'daum.net',
  HANMAIL: 'hanmail.net',
  NATE: 'nate.com',
  HOT: 'hotmail.com',
} as const;

export const EMAIL_DOMAIN_OPTIONS = [
  { label: '직접입력', value: 'direct' },
  ...Object.values(EMAIL_DOMAINS).map((d) => ({ label: d, value: d })),
];

export const RECAPTCHA_SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY;
export const TOSS_CLIENT_KEY = import.meta.env.VITE_TOSS_CLIENT_KEY;

export const NO_REDIRECT_ROUTES = [MY_ROUTE.LOGIN];
