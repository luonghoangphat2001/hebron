import type { TFunction } from 'i18next';
import { z } from 'zod';

export const checkoutFormSchema = (tCommon: TFunction, tValidation: TFunction<'validation'>) => {
  const requiredString = (field: string) => z.string().trim().min(1, tValidation('required', { field }));

  return z.object({
    ordererInfo: z.object({
      name: requiredString(tCommon('title.full_name')),
      companyName: z.string().optional(),
      mobilePhone: requiredString(tCommon('title.mobile_phone')),
      phoneNumber: requiredString(tCommon('title.phone_number')),
      email: requiredString(tCommon('title.email')),
    }),
    shippingInfo: z.object({
      recipient: requiredString(tCommon('title.recipient')),
      contact: requiredString(tCommon('title.contact_info')),
      zipCode: requiredString(tCommon('title.address')),
      address: requiredString(tCommon('title.address')),
      addressDetail: z.string().optional(),
      deliveryRequest: requiredString(tCommon('title.delivery_request')),
    }),
  });
};

export type CheckoutFormValues = z.infer<ReturnType<typeof checkoutFormSchema>>;

export const checkoutFormDefaultValues: CheckoutFormValues = {
  ordererInfo: {
    name: '',
    companyName: '',
    mobilePhone: '',
    phoneNumber: '',
    email: '',
  },
  shippingInfo: {
    recipient: '',
    contact: '',
    zipCode: '',
    address: '',
    addressDetail: '',
    deliveryRequest: '',
  },
};
