import type { ShippingAddressUpsertREQ } from '@/data/shipping-addresses/shipping-addresses.request';
import type { ShippingAddressItemRESP } from '@/data/shipping-addresses/shipping-addresses.response';
import type { ShippingAddressFormValues } from '@/schemas/shipping-address/shipping-address-form.schema';
import { splitPhonePattern } from '@/utils/helper/common.helper';

export const SHIPPING_ADDRESS_DELIVERY_MESSAGE_OPTIONS = [
  { label: '배송 시 요청사항을 선택해주세요', value: 'guard' },
  { label: '부재 시 경비실에 맡겨주세요', value: 'leave_guard' },
  { label: '부재 시 문 앞에 놓아주세요', value: 'leave_door' },
  { label: '배송 전 연락 부탁드립니다', value: 'call_before' },
  { label: '직접 받겠습니다', value: 'direct' },
] as const;

export const SHIPPING_ADDRESS_FORM_LABELS = {
  pageTitleCreate: '배송지 추가',
  pageTitleEdit: '배송지 수정',
  backToList: '배송지 관리',
  recipientName: '수령자',
  recipientNamePlaceholder: '수령자',
  address: '주소',
  managerName: '담당자명',
  managerNamePlaceholder: '담당자명',
  deliveryMessage: '배송메시지',
  deliveryMessagePlaceholder: '배송 시 요청사항을 선택해주세요',
  isDefault: '기본 배송지',
  phone: '전화번호',
  phonePlaceholder: '선택',
  cancel: '취소',
  submitCreate: '배송지 추가',
  submitUpdate: '배송지 수정',
  submitMobile: '배송지 추가',
  loading: '불러오는 중...',
  createSuccess: '배송지가 등록되었습니다.',
  updateSuccess: '배송지가 수정되었습니다.',
  deleteSuccess: '배송지가 삭제되었습니다.',
  submitFailed: '배송지 저장에 실패했습니다.',
  deleteFailed: '배송지 삭제에 실패했습니다.',
  deleteConfirmTitle: '배송지 삭제',
  deleteConfirm: '이 배송지를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.',
} as const;

export const SHIPPING_ADDRESS_FORM_DEFAULT_VALUES: ShippingAddressFormValues = {
  recipientName: '',
  zipCode: '',
  address: '',
  detailAddress: '',
  // managerName: '', // TODO: uncomment when backend adds manager_name
  deliveryMessage: '',
  phonePrefix: '',
  phoneBody: '',
  phoneTail: '',
  isDefault: false,
};

export const mapShippingAddressFormToREQ = (values: ShippingAddressFormValues): ShippingAddressUpsertREQ => {
  const phone =
    splitPhonePattern(`${values.phonePrefix}${values.phoneBody}${values.phoneTail}`)?.formatted ??
    `${values.phonePrefix}-${values.phoneBody}-${values.phoneTail}`;

  return {
    recipient: values.recipientName.trim(),
    phone,
    postcode: values.zipCode.trim(),
    address: values.address.trim(),
    detailed_address: values.detailAddress.trim(),
    delivery_message_preset: values.deliveryMessage || null,
    delivery_message_custom: null,
    is_default: values.isDefault,
  };
};

export const mapShippingAddressRESPToFormValues = (address: ShippingAddressItemRESP): ShippingAddressFormValues => {
  const phoneParts = splitPhonePattern(address.phone);

  return {
    recipientName: address.recipient,
    zipCode: address.postcode,
    address: address.address,
    detailAddress: address.detailed_address ?? '',
    // managerName: address.manager_name ?? '', // TODO: uncomment when backend adds manager_name
    deliveryMessage: address.delivery_message_preset ?? '',
    phonePrefix: phoneParts?.part1 ?? '',
    phoneBody: phoneParts?.part2 ?? '',
    phoneTail: phoneParts?.part3 ?? '',
    isDefault: address.is_default,
  };
};
