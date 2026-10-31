import { PRODUCT_IMAGE_MAX_COUNT } from '@/utils/constants/attachment.constant';
import { ERROR_MESSAGE } from '@/utils/constants/error-message.constant';
import { ProductVisibleRole } from '@/utils/enums/product.enum';
import type { DefaultValues } from 'react-hook-form';
import { z } from 'zod';

const optionalText = z.string().trim().optional().default('');

/** Digit cap for price inputs — also enforced on keystroke in MoneyField so typing can't run a value up into JS's 1e21 exponential-notation display. */
export const PRODUCT_PRICE_MAX_DIGITS = 12;
const PRODUCT_PRICE_MAX_VALUE = Number('9'.repeat(PRODUCT_PRICE_MAX_DIGITS));

const money = z
  .number({ error: ERROR_MESSAGE.FIELD_REQUIRED })
  .min(0, ERROR_MESSAGE.FIELD_REQUIRED)
  .max(PRODUCT_PRICE_MAX_VALUE, ERROR_MESSAGE.PRICE_MAX_VALUE);

const specificationSchema = z.object({
  size: optionalText,
  materials: optionalText,
  case: z.string().trim().max(256, ERROR_MESSAGE.SPEC_CASE_MAX_LENGTH).optional().default(''),
  product_period: optionalText,
  total_product_amount: optionalText,
  shipping_info: optionalText,
  weight: optionalText,
  notes: optionalText,
});

export const productUpsertSchema = z
  .object({
    category_ids: z.array(z.number()).min(1, ERROR_MESSAGE.FIELD_REQUIRED),
    name: z.string().trim().min(1, ERROR_MESSAGE.FIELD_REQUIRED),
    name_en: optionalText,
    slug: optionalText,
    sku: z.string().trim().min(1, ERROR_MESSAGE.FIELD_REQUIRED),
    description: optionalText,
    short_description: optionalText,
    selling_price: money,
    supply_price: money,
    brand_site_price: money,
    plain_site_price: money,
    shipping_fee: money,
    price_content: optionalText,
    images: z.array(z.string()).max(PRODUCT_IMAGE_MAX_COUNT, ERROR_MESSAGE.PRODUCT_IMAGE_MAX_COUNT).optional(),
    file_ai: z.array(z.string()).max(1).optional(),
    stock_quantity: z.number().int().min(0).optional(),
    min_quantity: z.number().int().min(0).optional(),
    max_quantity: z.number().int().min(0).optional(),
    stock_inventory_enabled: z.boolean(),
    // sort_order: z.number().int().min(0).optional(),
    visible_roles: z.array(z.enum(ProductVisibleRole)).optional(),
    is_active: z.boolean(),
    is_popular: z.boolean(),
    is_featured: z.boolean(),
    is_top_product: z.boolean(),
    has_option: z.boolean(),
    option_group_ids: z.array(z.number()).optional(),
    template_ids: z.array(z.number()).optional(),
    specification: specificationSchema.optional(),
  })
  // 0 = unlimited purchase quantity, so it always passes regardless of min_quantity
  .refine((data) => (data.max_quantity ?? 0) === 0 || (data.max_quantity ?? 0) > (data.min_quantity ?? 0), {
    message: ERROR_MESSAGE.MAX_QUANTITY_INVALID,
    path: ['max_quantity'],
  });

export type ProductUpsertInput = z.infer<typeof productUpsertSchema>;

export const productUpsertInputDefault: DefaultValues<ProductUpsertInput> = {
  category_ids: [],
  name: '',
  name_en: '',
  slug: '',
  sku: '',
  description: '',
  short_description: '',
  images: [],
  file_ai: [],
  is_active: true,
  is_popular: false,
  is_featured: false,
  is_top_product: false,
  stock_inventory_enabled: true,
  has_option: false,
  option_group_ids: [],
  template_ids: [],
};
