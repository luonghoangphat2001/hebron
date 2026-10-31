import type { ShippingAddressItem } from '@/utils/types/shipping-address.type';

export const SHIPPING_ADDRESS_TABLE_LABELS = {
  pageTitle: '배송지 관리',
  addAddress: '배송지 추가',
  recipientName: '수령자',
  address: '주소',
  phone: '전화번호',
  manage: '관리',
  defaultBadge: '기본배송지',
  edit: '수정',
  delete: '삭제',
  empty: '등록된 배송지가 없습니다.',
  loading: '불러오는 중...',
  selectAll: '전체 선택',
  searchAriaLabel: '배송지 검색',
} as const;

export const MOCK_SHIPPING_ADDRESS_LIST: ShippingAddressItem[] = [
  {
    id: '1',
    recipientName: '홍길동',
    managerName: '김담당',
    deliveryMessage: 'leave_guard',
    zipCode: '07271',
    address: '서울특별시 영등포구 양산로 57-5 (양평동3가)',
    detailAddress: '이노플렉스 1105호',
    phonePrefix: '010',
    phoneBody: '1234',
    phoneTail: '5678',
    phone: '010-1234-5678',
    isDefault: true,
  },
  {
    id: '2',
    recipientName: '김헤브론',
    managerName: '박담당',
    deliveryMessage: 'call_before',
    zipCode: '06234',
    address: '서울특별시 강남구 테헤란로 152',
    detailAddress: '강남파이낸스센터 12층',
    phonePrefix: '010',
    phoneBody: '9876',
    phoneTail: '5432',
    phone: '010-9876-5432',
    isDefault: false,
  },
  {
    id: '3',
    recipientName: '이영희',
    managerName: '최담당',
    deliveryMessage: 'leave_door',
    zipCode: '48058',
    address: '부산광역시 해운대구 센텀중앙로 97',
    detailAddress: '센텀스카이비즈 A동 801호',
    phonePrefix: '010',
    phoneBody: '5555',
    phoneTail: '1234',
    phone: '010-5555-1234',
    isDefault: false,
  },
  ...Array.from({ length: 12 }, (_, index) => ({
    id: String(index + 4),
    recipientName: `배송지 ${index + 4}`,
    managerName: `담당자 ${index + 4}`,
    deliveryMessage: 'direct',
    zipCode: '04524',
    address: '서울특별시 중구 세종대로 110',
    detailAddress: `${index + 4}층`,
    phonePrefix: '010',
    phoneBody: '1000',
    phoneTail: String(index + 4).padStart(4, '0'),
    phone: `010-1000-${String(index + 4).padStart(4, '0')}`,
    isDefault: false,
  })),
];

export const getShippingAddressById = (addressId: string) =>
  MOCK_SHIPPING_ADDRESS_LIST.find((address) => address.id === addressId);

export const formatShippingAddress = (address: Pick<ShippingAddressItem, 'zipCode' | 'address' | 'detailAddress'>) => {
  const base = `[${address.zipCode}] ${address.address}`;
  return address.detailAddress ? `${base} ${address.detailAddress}` : base;
};

export const formatShippingAddressFromApi = (address: {
  postcode: string;
  address: string;
  detailed_address?: string | null;
}) => {
  const base = `[${address.postcode}] ${address.address}`;
  return address.detailed_address ? `${base} ${address.detailed_address}` : base;
};
