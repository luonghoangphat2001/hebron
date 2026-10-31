import type { ProductItemRESP } from '@/data/products/products.response';
import type { ProductInquiryCardData } from '@/utils/constants/brand-product-inquiry.constant';
import { resolveStorageUrl } from '@/utils/helper/canvas.helper';
import { getLocalizedName } from '@/utils/helper/product-picker.helper';

export const mapProductToInquiryCard = (product?: ProductItemRESP | null): ProductInquiryCardData | null => {
  if (!product) return null;

  const options = [
    product.specification?.size && { label: '사이즈', value: product.specification.size },
    product.specification?.materials && { label: '소재', value: product.specification.materials },
    product.specification?.case && { label: '케이스', value: product.specification.case },
  ].filter(Boolean) as { label: string; value: string }[];

  return {
    title: getLocalizedName(product.name),
    sku: product.sku || product.slug,
    image: resolveStorageUrl(product.first_image || product.images?.[0]),
    options: options.length > 0 ? options : undefined,
  };
};
