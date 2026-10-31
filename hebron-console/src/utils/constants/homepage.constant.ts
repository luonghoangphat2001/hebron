import type { PageListREQ } from '@/data/homepage-management/homepage.request';
import type { MallSection } from '@/data/homepage-management/homepage.type';
import { PageType, SectionType, SiteType } from '@/utils/enums/homepage.enum';

export const SECTION_TYPE_LABEL_MAP: Record<string, string> = {
  [SectionType.HERO_SECTION]: 'Hero Section',
  [SectionType.CATEGORY_SHORTCUTS]: 'Shortcuts',
  [SectionType.PRODUCT_PREVIEW]: 'Product Preview',
  [SectionType.SECONDARY_BANNER]: 'Secondary Banner',
  [SectionType.STEADY_SELLER]: 'Steady Seller',
  [SectionType.PORTFOLIO_PREVIEW]: 'Portfolio Preview',
  [SectionType.NOTICES_PREVIEW]: 'Notices Preview',
  [SectionType.CATEGORY_PRODUCT_SHOWCASE]: 'Category Product Showcase',
  [SectionType.FAQ_SECTION]: 'FAQ Section',
  [SectionType.CUSTOMER_CENTER]: 'Customer Center',
  [SectionType.FOOTER_QUICK_LINKS]: 'Footer Quick Links',
  [SectionType.CLIENT_LOGOS]: 'Client Logos',
  [SectionType.BRAND_STATEMENT]: 'Brand Statement',
  [SectionType.CRAFTSMANSHIP_VALUES]: 'Craftsmanship Values',
  [SectionType.CUSTOM_PROCESS]: 'Custom Process',
  [SectionType.PRESS_PREVIEW]: 'Press Preview',
  [SectionType.MANUFACTURING_PROCESS]: 'Manufacturing Process',
  [SectionType.PROCESS_STEPS]: 'Process Steps',
  [SectionType.ABOUT_CTA]: 'About CTA',
  [SectionType.BRAND_IDENTITY]: 'Brand Identity',
  [SectionType.COMPANY_HISTORY]: 'Company History',
  [SectionType.CERTIFICATES]: 'Company Introduction',
  [SectionType.INQUIRY_INTRO]: 'Inquiry Introduce',
  [SectionType.INQUIRY_FORM]: 'Production Inquiry Form',
};

export const BRAND_URL_TO_PAGE_TYPE_MAP: Record<string, PageType> = {
  home: PageType.HOME_PAGE,
  'brand-story': PageType.BRAND_STORY,
  'standard-products': PageType.STANDARD_PRODUCTS,
  process: PageType.PROCESS,
  media: PageType.MEDIA,
  'contact-us': PageType.CONTACT_US,
  portfolio: PageType.PORTFOLIO,
  'production-inquiry': PageType.PRODUCTION_INQUIRY,
  faqs: PageType.FAQS,
};

export const URL_TO_PAGE_TYPE_MAP = BRAND_URL_TO_PAGE_TYPE_MAP;

export const MALL_PAGE_PARAMS: PageListREQ = {
  site_type: SiteType.SHOPPING_MALL,
  page_type: PageType.HOME_PAGE,
};

export const VENDOR_PAGE_PARAMS: PageListREQ = {
  site_type: SiteType.PLAIN_SITE,
  page_type: PageType.HOME_PAGE,
};

export const INITIAL_PLAIN_SECTIONS: MallSection[] = [
  {
    id: '48',
    name: 'Hero Section',
    type: SectionType.HERO_SECTION,
    enabled: true,
  },
];

export const INITIAL_MALL_SECTIONS: MallSection[] = [
  {
    id: '50',
    name: 'Hero Section',
    type: SectionType.HERO_SECTION,
    enabled: true,
  },
  {
    id: '51',
    name: 'Shortcuts',
    type: SectionType.CATEGORY_SHORTCUTS,
    enabled: true,
  },
  {
    id: '52',
    name: 'Product Preview',
    type: SectionType.PRODUCT_PREVIEW,
    enabled: true,
  },
  {
    id: '87',
    name: 'Secondary Banner',
    type: SectionType.SECONDARY_BANNER,
    enabled: true,
  },
  {
    id: '88',
    name: 'Steady Seller',
    type: SectionType.STEADY_SELLER,
    enabled: true,
  },
  {
    id: '53',
    name: 'Notices Preview',
    type: SectionType.NOTICES_PREVIEW,
    enabled: true,
  },
  {
    id: '54',
    name: 'Category Product Showcase',
    type: SectionType.CATEGORY_PRODUCT_SHOWCASE,
    enabled: true,
  },
  {
    id: '56',
    name: 'FAQ Section',
    type: SectionType.FAQ_SECTION,
    enabled: true,
  },
  {
    id: '57',
    name: 'Customer Center',
    type: SectionType.CUSTOMER_CENTER,
    enabled: true,
  },
  {
    id: '89',
    name: 'Footer Quick Links',
    type: SectionType.FOOTER_QUICK_LINKS,
    enabled: true,
  },
];

export const INITIAL_BRAND_SECTIONS: MallSection[] = [
  {
    id: '14',
    name: '메인 배너',
    type: SectionType.HERO_SECTION,
    enabled: true,
  },
  {
    id: '18',
    name: '파트너사',
    type: SectionType.CLIENT_LOGOS,
    enabled: true,
  },
  {
    id: '15',
    name: '헤브론 소개',
    type: SectionType.BRAND_STATEMENT,
    enabled: true,
  },
  {
    id: '16',
    name: '장인의 손끝에서 탄생하는 가치',
    type: SectionType.CRAFTSMANSHIP_VALUES,
    enabled: true,
  },
  {
    id: '42',
    name: '제조공정',
    type: SectionType.MANUFACTURING_PROCESS,
    enabled: true,
  },
  {
    id: '40',
    name: '트로피 맞춤제작과정',
    type: SectionType.CUSTOM_PROCESS,
    enabled: true,
  },
  {
    id: '41',
    name: '언론보도',
    type: SectionType.PRESS_PREVIEW,
    enabled: true,
  },
  {
    id: '17',
    name: '포트폴리오',
    type: SectionType.PORTFOLIO_PREVIEW,
    enabled: true,
  },
  {
    id: '19',
    name: '제작 문의',
    type: SectionType.ABOUT_CTA,
    enabled: true,
  },
];

export const INITIAL_BRAND_STORY_SECTIONS: MallSection[] = [
  {
    id: '63',
    name: '메인 배너',
    type: SectionType.HERO_SECTION,
    enabled: true,
  },
  {
    id: '64',
    name: 'H.E.B.R.O.N — 핵심 가치',
    type: SectionType.BRAND_IDENTITY,
    enabled: true,
  },
  {
    id: '65',
    name: '회사 연혁',
    type: SectionType.COMPANY_HISTORY,
    enabled: true,
  },
  {
    id: '66',
    name: '인증 및 특허',
    type: SectionType.CERTIFICATES,
    enabled: true,
  },
];

export type StaticInquiryFormField = {
  key: string;
  label: string;
  type: 'select' | 'input' | 'radio' | 'date' | 'textarea' | 'file_upload';
  placeholder?: string;
  options?: string[];
  required?: boolean;
  max_length?: number;
};

export const DEFAULT_INQUIRY_FORM_FIELDS: StaticInquiryFormField[] = [
  {
    key: 'inquiry_type',
    label: '문의 유형',
    type: 'select',
    placeholder: '트로피 / 상패 / 메달·뱃지 / 현판·명패 / 기타',
    options: ['트로피', '상패', '메달·뱃지', '현판·명패', '기타'],
    required: true,
  },
  {
    key: 'company_name',
    label: '회사명',
    type: 'input',
    placeholder: '회사명 (또는 단체명)',
    required: true,
  },
  {
    key: 'manager_name',
    label: '담당자명',
    type: 'input',
    placeholder: '담당자명',
    required: true,
  },
  {
    key: 'phone',
    label: '연락처',
    type: 'input',
    placeholder: '010-0000-0000',
    required: true,
  },
  {
    key: 'email',
    label: '이메일',
    type: 'input',
    placeholder: 'abc@naver.com',
    required: true,
  },
  {
    key: 'quantity',
    label: '예상 수량',
    type: 'radio',
    options: ['1~10개', '10~50개', '50~100개', '100개 이상', '미정'],
    required: true,
  },
  {
    key: 'deadline',
    label: '희망 납기일',
    type: 'date',
    placeholder: '희망 납기일',
    required: true,
  },
  {
    key: 'budget_range',
    label: '예산 범위',
    type: 'radio',
    options: ['~50만원', '50~100만원', '100~300만원', '300만원 이상', '추후 협의'],
    required: true,
  },
  {
    key: 'message',
    label: '제작 상세 내용',
    type: 'textarea',
    placeholder: '제작하실 상패/트로피의 용도, 디자인 방향, 참고 이미지 등을 자유롭게 알려주세요.',
    max_length: 500,
    required: true,
  },
  {
    key: 'attachments',
    label: '참고 파일 첨부',
    type: 'file_upload',
    placeholder: 'JPG · PNG · HEIC · PDF 지원 · 최대 10MB',
    required: true,
  },
];

export const INITIAL_PRODUCTION_INQUIRY_SECTIONS: MallSection[] = [
  {
    id: '43_hero',
    name: '메인 배너',
    type: SectionType.HERO_SECTION,
    enabled: true,
    rawSection: {
      id: 431,
      section_type: 'hero_section',
      title: '제작 문의',
      subtitle: null,
      description: null,
      content: {
        items: [],
      },
    } as any,
  },
  {
    id: '43',
    name: '문의 폼',
    type: SectionType.INQUIRY_FORM,
    enabled: true,
    rawSection: {
      id: 43,
      section_type: 'inquiry_form',
      title: '문의 폼',
      subtitle: '제작 상담을 신청해 주세요.',
      description: '기업 행사, 시상식, 포상식, 기념일에 필요한 트로피와 상패를 제작해 드립니다.',
      content: {
        title: 'Title',
        subtitle: 'Subtitle',
        image_url: 'https://picsum.photos/seed/hebron-award-03/300/500',
        images: ['https://picsum.photos/seed/hebron-award-03/300/500'],
        process_title: '제작 과정',
        process_steps: [
          { key: 'inquiry', title: '주문접수', description: '제품 레퍼런스, 컨셉, 예상 수량 등 요구사항을 접수합니다.' },
          { key: 'design', title: '디자인 작업', description: '필요에 따라 2D, 3D 렌더링 시안을 만들어 작업을 진행합니다.' },
          { key: 'proposal', title: '디자인 제안', description: '요구사항에 맞춰 최적의 디자인을 제안합니다.' },
          {
            key: 'approval',
            title: '디자인 확정',
            description: '수정과 보완 후 최종 디자인을 확정하며 제작을 위한 모델링을 진행합니다.',
          },
          {
            key: 'production',
            title: '제품제작',
            description: '확정된 디자인에 따라 다양한 공정과 가공법을 조합해 제품을 제작합니다.',
          },
          { key: 'delivery', title: '검수 및 출고', description: '최종 결과물을 검수한 뒤 안전하게 포장하여 출고합니다.' },
        ],
      },
    } as any,
  },
  {
    id: '43_cta',
    name: '제작 문의 하단 CTA',
    type: SectionType.ABOUT_CTA,
    enabled: true,
    rawSection: {
      id: 434,
      section_type: 'about_cta',
      title: '당신의 순간을 HEBRON이 완성합니다',
      description: '기업 행사, 골프 대회, 포상식, 기념일 어떤 자리든 헤브론의 상패가 그 가치를 더합니다.',
      content: {
        primary_button: { label: '제작문의', link: '/inquiry' },
        secondary_button: { label: '기성품 보러가기', link: '/products' },
      },
    } as any,
  },
];

export const INITIAL_PROCESS_SECTIONS: MallSection[] = [
  {
    id: '30_hero',
    name: '메인 배너',
    type: SectionType.HERO_SECTION,
    enabled: true,
    rawSection: {
      id: 301,
      section_type: 'hero_section',
      title: '제조공정',
      subtitle: null,
      description: '1998년부터 이어온 헤브론의 제조 철학—최고의 소재, 정밀한 공정, 그리고 장인의 이야기.',
      content: {
        items: [],
      },
    } as any,
  },
  {
    id: '36_process',
    name: '제조공정 (Production Process)',
    type: SectionType.PROCESS_STEPS,
    enabled: true,
    rawSection: {
      id: 36,
      section_type: 'process_steps',
      title: 'Production Process',
      subtitle: null,
      description: null,
      sort_order: 20,
      is_active: true,
      content: {
        steps: [],
        interaction: 'scroll_driven_or_tabs',
      },
    } as any,
  },
  {
    id: '30_cta',
    name: '제작 문의 하단 CTA',
    type: SectionType.ABOUT_CTA,
    enabled: true,
    rawSection: {
      id: 303,
      section_type: 'about_cta',
      title: '당신의 순간을 HEBRON이 완성합니다',
      description: '기업 행사, 골프 대회, 포상식, 기념일 어떤 자리든 헤브론의 상패가 그 가치를 더합니다.',
      content: {
        primary_button: { label: '제작문의', link: '/inquiry' },
        secondary_button: { label: '기성품 보러가기', link: '/products' },
      },
    } as any,
  },
];

export const INITIAL_CONTACT_SECTIONS: MallSection[] = [
  {
    id: '50_hero',
    name: '메인 배너',
    type: SectionType.HERO_SECTION,
    enabled: true,
    rawSection: {
      id: 501,
      section_type: 'hero_section',
      title: '오시는 길 & 문의',
      subtitle: null,
      description: '헤브론의 장인과 직접 상담하고 최상의 작품을 만나보세요.',
      content: {
        items: [],
      },
    } as any,
  },
  {
    id: '50_map',
    name: '오시는 길 (카카오맵 / Map)',
    type: SectionType.CONTACT_INFORMATION,
    enabled: true,
    rawSection: {
      id: 502,
      section_type: 'contact_information',
      title: '오시는 길',
      description: '헤브론 본사 및 쇼룸으로 오시는 길을 안내해 드립니다.',
      content: {
        place_name: '(주)헤브론 쇼룸',
        company_name: '(주)헤브론 / HEBRON Corp.',
        address: '서울특별시 중구 마른내로 72 (인현동2가) 신일빌딩 3층',
        address_detail: '신일빌딩 3층 헤브론 쇼룸',
        address_en: '3F Shinil Bldg, 72 Mareunnae-ro, Jung-gu, Seoul, Korea',
        map_link: 'https://map.kakao.com/link/map/헤브론,37.5645,126.9972',
        kakao_map_url: 'https://map.kakao.com/link/map/헤브론,37.5645,126.9972',
        latitude: 37.5645,
        longitude: 126.9972,
        image_url: 'https://picsum.photos/seed/hebron-map-01/1000/600',
        images: ['https://picsum.photos/seed/hebron-map-01/1000/600'],
      },
    } as any,
  },
  {
    id: '50_cta',
    name: '제작 문의 하단 CTA',
    type: SectionType.ABOUT_CTA,
    enabled: true,
    rawSection: {
      id: 503,
      section_type: 'about_cta',
      title: '당신의 순간을 HEBRON이 완성합니다',
      description: '기업 행사, 골프 대회, 포상식, 기념일 어떤 자리든 헤브론의 상패가 그 가치를 더합니다.',
      content: {
        primary_button: { label: '제작문의', link: '/inquiry' },
        secondary_button: { label: '기성품 보러가기', link: '/products' },
      },
    } as any,
  },
];
