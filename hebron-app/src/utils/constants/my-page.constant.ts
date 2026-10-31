import { Product1 } from '@/assets/images';
import { MY_ROUTE } from '@/utils/constants/route.constant';
import type {
  MembershipInfo,
  MyPageCustomerCenterItem,
  MyPageNavGroup,
  RecentOrder,
  StatusOverviewGroup,
} from '@/utils/types/my-page.type';
import {
  ArrowsCounterClockwiseIcon,
  CardholderIcon,
  ChartPieSliceIcon,
  ChecksIcon,
  CheckSquareIcon,
  FileIcon,
  HandDepositIcon,
  HourglassIcon,
  HourglassMediumIcon,
  MagicWandIcon,
  PackageIcon,
  PrinterIcon,
  SpinnerIcon,
  StackSimpleIcon,
  TruckIcon,
  UserIcon,
  WarningDiamondIcon,
} from '@phosphor-icons/react';

export const MY_PAGE_NAV_GROUPS: MyPageNavGroup[] = [
  {
    key: 'orders',
    title: '주문·배송',
    items: [{ key: 'order-inquiry', label: '주문/배송조회', href: `${MY_ROUTE.MY_PAGE.HOME}/${MY_ROUTE.MY_PAGE.ORDERS}` }],
  },
  // {
  //   key: 'design',
  //   title: '디자인',
  //   items: [{ key: 'editor', label: '에디터', href: '#' }],
  // },
  {
    key: 'customer-center',
    title: '고객센터',
    items: [
      { key: 'faq', label: '자주묻는질문', href: `${MY_ROUTE.MY_PAGE.HOME}/${MY_ROUTE.MY_PAGE.FAQ}` },
      { key: 'notice', label: '공지사항', href: `${MY_ROUTE.MY_PAGE.HOME}/${MY_ROUTE.MY_PAGE.NOTICE}` },
      { key: 'quote', label: '견적문의', href: `${MY_ROUTE.MY_PAGE.HOME}/${MY_ROUTE.MY_PAGE.QUOTE}` },
      { key: 'shipping-inquiry', label: '출고/배송문의', href: `${MY_ROUTE.MY_PAGE.HOME}/${MY_ROUTE.MY_PAGE.SHIPPING_INQUIRY}` },
      { key: 'production-request', label: '재작업 신청', href: `${MY_ROUTE.MY_PAGE.HOME}/${MY_ROUTE.MY_PAGE.REWORK_REQUEST}` },
    ],
  },
  {
    key: 'account',
    title: '계정·관리',
    items: [
      { key: 'profile', label: '회원정보수정', href: `${MY_ROUTE.MY_PAGE.HOME}/${MY_ROUTE.MY_PAGE.INFO}` },
      { key: 'addresses', label: '배송지 관리', href: `${MY_ROUTE.MY_PAGE.HOME}/${MY_ROUTE.MY_PAGE.ADDRESSES}` },
    ],
  },
];

export const STATUS_OVERVIEW_GROUPS: StatusOverviewGroup[] = [
  {
    key: 'production',
    title: '생산현황',
    items: [
      { key: 'payment', label: '결제 대기', count: 0, icon: CardholderIcon },
      { key: 'reception', label: '접수 대기', count: 0, icon: SpinnerIcon },
      { key: 'file-error', label: '파일 에러', count: 0, icon: WarningDiamondIcon },
      { key: 'correction', label: '교정', count: 0, icon: ArrowsCounterClockwiseIcon },
      { key: 'typesetting', label: '조판', count: 0, icon: StackSimpleIcon },
      { key: 'output', label: '출력', count: 0, icon: FileIcon },
      { key: 'printing', label: '인쇄', count: 0, icon: PrinterIcon },
      { key: 'post-processing', label: '후가공', count: 0, icon: ChartPieSliceIcon },
      { key: 'complete', label: '생산 완료', count: 0, icon: ChecksIcon },
    ],
  },
  {
    key: 'design',
    title: '디자인현황',
    items: [
      { key: 'payment', label: '결제 대기', count: 0, icon: CardholderIcon },
      { key: 'reception', label: '접수 대기', count: 0, icon: HourglassIcon },
      { key: 'designing', label: '디자인 중', count: 0, icon: HourglassMediumIcon },
      { key: 'draft-delivery', label: '시안 전달 및 교정', count: 0, icon: MagicWandIcon },
      { key: 'complete', label: '디자인 완료', count: 0, icon: ChecksIcon },
    ],
  },
  {
    key: 'shipping',
    title: '배송 현황',
    items: [
      { key: 'pickup', label: '방문 수령', count: 0, icon: UserIcon },
      { key: 'parcel', label: '택배배송', count: 0, icon: PackageIcon },
      { key: 'quick', label: '퀵배송', count: 0, icon: TruckIcon },
      { key: 'direct', label: '직배송', count: 0, icon: HandDepositIcon },
      { key: 'complete', label: '배송완료', count: 0, icon: CheckSquareIcon },
    ],
  },
];

export const MOCK_MEMBERSHIP: MembershipInfo = {
  userName: '홍길동',
  companyName: '사장',
  grade: 'SILVER',
  gradeLabel: '실버',
  points: 12500,
  earnRate: 3,
  upgradeProgress: 65,
  upgradeTargetAmount: 5000000,
  currentAmount: 3250000,
};

const MOCK_ORDER_TEMPLATES: RecentOrder[] = [
  {
    id: '1',
    orderDateTime: '2026-12-04 11:31',
    productName: '엑셀이즈전단',
    productCode: 'PRINTLY260404-00001',
    productSpecs: '백색모조 150g/ A4(210x297mm) / 단면 칼라 4도 / 무광코팅 / 재단',
    thumbnail: Product1,
    quantity: '-',
    amount: 0,
    status: '결제대기',
  },
  {
    id: '2',
    orderDateTime: '2026-09-14 11:31',
    productName: '엑셀이즈전단',
    productCode: 'PRINTLY260404-00002',
    productSpecs: '백색모조 150g/ A4(210x297mm) / 단면 칼라 4도 / 무광코팅 / 재단',
    thumbnail: Product1,
    quantity: '-',
    amount: 0,
    status: '교정대기',
  },
  {
    id: '3',
    orderDateTime: '2026-04-04 11:31',
    productName: '엑셀이즈전단',
    productCode: 'PRINTLY260404-00003',
    productSpecs: '백색모조 150g/ A4(210x297mm) / 단면 칼라 4도 / 무광코팅 / 재단',
    thumbnail: Product1,
    quantity: '-',
    amount: 0,
    status: '조판',
  },
  {
    id: '4',
    orderDateTime: '2026-04-04 11:31',
    productName: '엑셀이즈전단',
    productCode: 'PRINTLY260404-00004',
    productSpecs: '백색모조 150g/ A4(210x297mm) / 단면 칼라 4도 / 무광코팅 / 재단',
    thumbnail: Product1,
    quantity: '-',
    amount: 0,
    status: '출력',
  },
  {
    id: '5',
    orderDateTime: '2026-11-24 11:31',
    productName: '엑셀이즈전단',
    productCode: 'PRINTLY260404-00005',
    productSpecs: '백색모조 150g/ A4(210x297mm) / 단면 칼라 4도 / 무광코팅 / 재단',
    thumbnail: Product1,
    quantity: '-',
    amount: 0,
    status: '인쇄',
  },
];

export const MOCK_RECENT_ORDERS: RecentOrder[] = MOCK_ORDER_TEMPLATES;

export const MOCK_ORDER_LIST: RecentOrder[] = Array.from({ length: 23 }, (_, index) => {
  const template = MOCK_ORDER_TEMPLATES[index % MOCK_ORDER_TEMPLATES.length];

  return {
    ...template,
    id: String(index + 1),
    productCode: `PRINTLY260404-${String(index + 1).padStart(5, '0')}`,
  };
});

export const MY_PAGE_CUSTOMER_CENTER: MyPageCustomerCenterItem[] = [
  { label: '고객센터', value: '02-2264-7911' },
  { label: '담당자', value: '02-2264-7914' },
];

export const MY_PAGE_LIST_ROW_ACTIONS = {
  menu: '더보기',
  update: '수정',
  viewDetails: '상세보기',
  delete: '삭제',
} as const;

export const ORDER_PRODUCTION_STEPS = STATUS_OVERVIEW_GROUPS.find((group) => group.key === 'production')!.items;
