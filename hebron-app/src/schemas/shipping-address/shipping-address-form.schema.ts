import { NUMERIC_ONLY_REGEX } from '@/utils/constants/regex.constant';
import { z } from 'zod';

export const SHIPPING_ADDRESS_FORM_ERROR_MESSAGES = {
  recipientNameRequired: '수령자를 입력해주세요.',
  zipCodeRequired: '우편번호를 입력해주세요.',
  addressRequired: '주소를 입력해주세요.',
  detailAddressRequired: '상세 주소를 입력해주세요.',
  managerNameRequired: '담당자명을 입력해주세요.',
  deliveryMessageRequired: '배송메시지를 선택해주세요.',
  phonePrefixRequired: '전화번호 앞자리를 선택해주세요.',
  phoneBodyRequired: '전화번호 가운데 번호를 입력해주세요.',
  phoneTailRequired: '전화번호 끝 번호를 입력해주세요.',
  phoneNumericOnly: '전화번호는 숫자만 입력해주세요.',
} as const;

const phonePartSchema = (requiredMessage: string) =>
  z
    .string()
    .min(1, requiredMessage)
    .max(4, requiredMessage)
    .regex(NUMERIC_ONLY_REGEX, SHIPPING_ADDRESS_FORM_ERROR_MESSAGES.phoneNumericOnly);

export const shippingAddressFormSchema = z.object({
  recipientName: z.string().min(1, SHIPPING_ADDRESS_FORM_ERROR_MESSAGES.recipientNameRequired),
  zipCode: z.string().min(1, SHIPPING_ADDRESS_FORM_ERROR_MESSAGES.zipCodeRequired),
  address: z.string().min(1, SHIPPING_ADDRESS_FORM_ERROR_MESSAGES.addressRequired),
  detailAddress: z.string(),
  // TODO: uncomment when backend adds manager_name
  // managerName: z.string().min(1, SHIPPING_ADDRESS_FORM_ERROR_MESSAGES.managerNameRequired),
  deliveryMessage: z.string(),
  phonePrefix: z.string().min(1, SHIPPING_ADDRESS_FORM_ERROR_MESSAGES.phonePrefixRequired),
  phoneBody: phonePartSchema(SHIPPING_ADDRESS_FORM_ERROR_MESSAGES.phoneBodyRequired),
  phoneTail: phonePartSchema(SHIPPING_ADDRESS_FORM_ERROR_MESSAGES.phoneTailRequired),
  isDefault: z.boolean(),
});

export type ShippingAddressFormValues = z.infer<typeof shippingAddressFormSchema>;
