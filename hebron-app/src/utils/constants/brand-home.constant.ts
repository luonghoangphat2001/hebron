import {
  InPressSample,
  PortFolio1,
  PortFolio2,
  PortFolio3,
  PortFolio5,
  Trophy5,
  Trophy6,
  Trophy7,
  Trophy8,
  Trophy9,
  Value1,
  Value2,
  Value3,
} from '@/assets/images';

export const BRAND_HOME_STATS = [
  { value: '6,000 여개', label: '판촉휘장 도소매점\n납품실적' },
  { value: '6,765+', label: '최근 1년간\n수주 프로젝트 건수' },
  { value: 'One-Stop', label: '상담 및 디자인부터\n제조 및 유통까지' },
  { value: '업계 유일', label: '해외 직영 크리스탈 공장\n국내 금속제조 자체공장\n국내·외 물류창고 2곳' },
] as const;

export const BRAND_HOME_MANUFACTURING_VIDEO = {
  title: '제조공정',
  subtitle: 'Lorem ipsum dolor sit amet consectetur. Laoreet faucibus sed.',
  slides: [
    {
      id: 'world-cup',
      title: 'World Cup Trophy 제작',
      poster: PortFolio5,
      videoUrl: '',
    },
    {
      id: 'crystal-factory',
      title: '크리스탈 가공 공정',
      poster: Value2,
      videoUrl: '',
    },
    {
      id: 'metal-craft',
      title: '금속 제조 공정',
      poster: PortFolio2,
      videoUrl: '',
    },
    {
      id: 'quality-check',
      title: '품질 검수 공정',
      poster: PortFolio3,
      videoUrl: '',
    },
  ],
} as const;

export const BRAND_HOME_PRESS_COVERAGE = {
  title: '언론보도',
  subtitle: 'Lorem ipsum dolor sit amet consectetur. Laoreet faucibus sed.',
  items: [
    {
      id: 'press-1',
      category: 'TV 방송',
      title: 'KBS 스포츠 뉴스',
      subtitle: '월드컵 트로피 제작 현장 취재',
      image: Trophy5,
    },
    {
      id: 'press-2',
      category: '신문',
      title: '조선일보 경제면',
      subtitle: '헤브론, 글로벌 시상품 시장 진출',
      image: Trophy6,
    },
    {
      id: 'press-3',
      category: '매거진',
      title: 'Forbes Korea',
      subtitle: '장인정신으로 만든 프리미엄 트로피',
      image: Trophy7,
    },
    {
      id: 'press-4',
      category: '온라인',
      title: '네이버 뉴스',
      subtitle: '부산국제영화제 시상패 제작사 선정',
      image: Trophy8,
    },
    {
      id: 'press-5',
      category: 'TV 방송',
      title: 'MBC 경제다큐',
      subtitle: '크리스탈 가공 공정 집중 보도',
      image: Trophy9,
    },
    {
      id: 'press-6',
      category: '신문',
      title: '한국경제',
      subtitle: '맞춤형 상패 시장 성장세',
      image: InPressSample,
    },
    {
      id: 'press-7',
      category: '매거진',
      title: '골프저널',
      subtitle: '프로골프 대회 트로피 제작 비하인드',
      image: PortFolio1,
    },
  ],
} as const;

export const BRAND_HOME_VALUE_ITEMS = [
  {
    id: 'manufacturing',
    title: '자체 생산 공정',
    subtitle: 'One-stop Manufacturing',
    image: Value1,
    description:
      'Lorem ipsum dolor sit amet consectetur. Laoreet faucibus sed. Lorem ipsum dolor sit amet consectetur. Laoreet faucibus sed. Lorem ipsum dolor sit amet consectetur. Laoreet faucibus sed.',
  },
  {
    id: 'material',
    title: '소재의 품격',
    subtitle: 'Curated Material',
    image: Value2,
    description:
      'Lorem ipsum dolor sit amet consectetur. Laoreet faucibus sed. Lorem ipsum dolor sit amet consectetur. Laoreet faucibus sed. Lorem ipsum dolor sit amet consectetur. Laoreet faucibus sed.',
  },
  {
    id: 'bespoke',
    title: '맞춤 제작 서비스',
    subtitle: 'Bespoke Design',
    image: Value3,
    description:
      'Lorem ipsum dolor sit amet consectetur. Laoreet faucibus sed. Lorem ipsum dolor sit amet consectetur. Laoreet faucibus sed. Lorem ipsum dolor sit amet consectetur. Laoreet faucibus sed.',
  },
] as const;

export type BrandHomeValueItem = (typeof BRAND_HOME_VALUE_ITEMS)[number];
