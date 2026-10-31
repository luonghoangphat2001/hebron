import { readProductDesign } from '@/data/design/product-design.service';
import type { ProductItemRESP } from '@/data/products/products.response';
import type { ProfileRESP } from '@/data/profile/profile.response';
import type { ShippingAddressItemRESP } from '@/data/shipping-addresses/shipping-addresses.response';
import { checkoutFormDefaultValues, type CheckoutFormValues } from '@/schemas/checkout/checkout.schema';
import { OrderPaymentMethod } from '@/utils/enums/order.enum';
import type { ProductDesign } from '@/utils/helper/guest-cart.helper';
import type { PaymentOrder } from '@/utils/helper/payment.helper';
import type { CartCheckoutREQ } from '../cart/cart.request';
import type { CartCheckoutOrderRESP } from '../cart/cart.response';
import type { OrderCreateREQ } from './orders.request';
import type { OrderRESP } from './orders.response';

export type CheckoutQueryParams = {
  productSlug: string;
  designId: string;
  designContentId?: number;
  optionIds: number[];
  quantity: number;
};

export type CheckoutSelectedOption = {
  groupId: number;
  groupName: string;
  optionId: number;
  optionName: string;
  additionalPrice: number;
};

export type CheckoutMode = 'cart' | 'product';

type CheckoutOrderCreateParams = {
  productId: number;
  selectedOptions: CheckoutSelectedOption[];
  quantity: number;
  designId: string;
  designContentId?: number;
  paymentMethod: OrderPaymentMethod;
  formValues: CheckoutFormValues;
};

type CartCheckoutParams = {
  itemIds: number[];
  paymentMethod: OrderPaymentMethod;
  formValues: CheckoutFormValues;
};

export const getCheckoutQueryParams = (searchParams: URLSearchParams): CheckoutQueryParams => ({
  productSlug: searchParams.get('product')?.trim() || '',
  designId: searchParams.get('design')?.trim() || '',
  designContentId: (() => {
    const id = Number(searchParams.get('designContentId'));
    return Number.isInteger(id) && id > 0 ? id : undefined;
  })(),
  optionIds: [
    ...new Set(
      (searchParams.get('options') || '')
        .split(',')
        .map(Number)
        .filter((id) => Number.isInteger(id) && id > 0),
    ),
  ],
  quantity: (() => {
    const quantity = Number(searchParams.get('quantity'));
    return Number.isInteger(quantity) && quantity > 0 ? quantity : 1;
  })(),
});

export const getCheckoutMode = (searchParams: URLSearchParams): CheckoutMode => (searchParams.size === 0 ? 'cart' : 'product');

export const getCheckoutSelectedOptions = (
  product: ProductItemRESP | undefined,
  optionIds: number[],
): CheckoutSelectedOption[] => {
  const selectedOptionIds = new Set(optionIds);

  return (product?.option_groups ?? []).flatMap((group) => {
    const option = group.options.find((item) => selectedOptionIds.has(item.id));
    return option
      ? [
          {
            groupId: group.id,
            groupName: group.name,
            optionId: option.id,
            optionName: option.name,
            additionalPrice: option.additional_price,
          },
        ]
      : [];
  });
};

export const readCheckoutProductDesign = async (designId: string, productSlug: string): Promise<ProductDesign | undefined> => {
  try {
    const design = await readProductDesign(designId);
    return design && (!design.productSlug || design.productSlug === productSlug) ? design : undefined;
  } catch {
    return undefined;
  }
};

export const getCheckoutMemberFormDefaultValues = (
  profile: ProfileRESP,
  shippingAddresses: ShippingAddressItemRESP[] = [],
): CheckoutFormValues => {
  const defaultAddress = shippingAddresses.find((address) => address.is_default);

  return {
    ...checkoutFormDefaultValues,
    ordererInfo: {
      name: profile.name,
      companyName: profile.customer?.company_name ?? '',
      mobilePhone: profile.mobile ?? '',
      phoneNumber: profile.phone ?? '',
      email: profile.email ?? '',
    },
    shippingInfo: defaultAddress
      ? {
          recipient: defaultAddress.recipient,
          contact: defaultAddress.phone,
          zipCode: defaultAddress.postcode,
          address: defaultAddress.address,
          addressDetail: defaultAddress.detailed_address,
          deliveryRequest: defaultAddress.delivery_message_custom ?? defaultAddress.delivery_message_preset ?? '',
        }
      : {
          recipient: profile.name,
          contact: profile.mobile || profile.phone || '',
          zipCode: profile.postcode ?? '',
          address: profile.address ?? '',
          addressDetail: profile.detailed_address ?? '',
          deliveryRequest: '',
        },
  };
};

const mapCheckoutFormToContactAndShipping = (formValues: CheckoutFormValues) => ({
  contact: {
    name: formValues.ordererInfo.name,
    companyName: formValues.ordererInfo.companyName || undefined,
    phone: formValues.ordererInfo.mobilePhone,
    phone2: formValues.ordererInfo.phoneNumber ?? '',
    email: formValues.ordererInfo.email,
  },
  shipping: {
    name: formValues.shippingInfo.recipient,
    phone: formValues.shippingInfo.contact,
    postcode: formValues.shippingInfo.zipCode,
    address: formValues.shippingInfo.address,
    address_detail: formValues.shippingInfo.addressDetail,
    customer_note: formValues.shippingInfo.deliveryRequest,
  },
});

export const mapCheckoutFormToOrderCreateREQ = ({
  productId,
  selectedOptions,
  quantity,
  designId,
  designContentId,
  paymentMethod,
  formValues,
}: CheckoutOrderCreateParams): OrderCreateREQ => {
  const designGroupId = Number(designId);

  return {
    product_id: productId,
    quantity,
    selected_options: selectedOptions.map((option) => ({ group_id: option.groupId, option_id: option.optionId })),
    payment_method: paymentMethod,
    ...mapCheckoutFormToContactAndShipping(formValues),
    ...(Number.isInteger(designGroupId) && designGroupId > 0 ? { design_group_id: designGroupId } : {}),
    ...(designContentId ? { order_design_content_id: designContentId } : {}),
  };
};

export const mapCheckoutFormToCartCheckoutREQ = ({
  itemIds,
  paymentMethod,
  formValues,
}: CartCheckoutParams): CartCheckoutREQ => ({
  item_ids: itemIds,
  payment_method: paymentMethod,
  ...mapCheckoutFormToContactAndShipping(formValues),
});

export const mapOrderToPaymentOrder = (order: OrderRESP): PaymentOrder => ({
  orderNumber: order.order_number,
  amount: Number(order.totals.total) || 0,
  customerName: order.user?.name,
  customerEmail: order.user?.email,
  customerMobilePhone: order.user?.mobile,
});

export const mapCartCheckoutOrderToPaymentOrder = (order: CartCheckoutOrderRESP): PaymentOrder => ({
  orderNumber: order.order_number,
  amount: order.total_amount,
  customerName: order.contact_name,
  customerEmail: order.contact_email ?? undefined,
  customerMobilePhone: order.contact_phone,
});
