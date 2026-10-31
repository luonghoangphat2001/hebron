import { INITIAL_PAGING, PAGE_PARAM_KEY, PER_PAGE_PARAM_KEY } from '@/utils/constants/common.constant';
import { ExportType, SortOrder } from '@/utils/enums/common.enum';
import { ProductSort, type ProductAvailability, type ProductStatus } from '@/utils/enums/product.enum';
import { orUndefined } from '@/utils/helper/string.helper';
import { uploadAttachmentFiles, type AttachmentFileValue } from '@/components/upload/AttachmentFile';
import type { FileRESP } from '@/data/file/file.response';
import { FileType } from '@/utils/enums/file.enum';
import type { ProductUpsertInput } from '@/schemas/product/product.schema';
import { uploadProductImagesAPI } from './product.api';
import type { ProductExportExcelREQ, ProductListREQ, ProductUpdateREQ } from './product.request';
import type { Product, ProductAiFileRESP } from './product.response';

export const getProductListInitFilter = (searchParams: URLSearchParams): ProductListREQ => {
  const categoryId = Number(searchParams.get('category_id'));

  return {
    page: Number(searchParams.get(PAGE_PARAM_KEY)) || INITIAL_PAGING.page,
    per_page: Number(searchParams.get(PER_PAGE_PARAM_KEY)) || INITIAL_PAGING.per_page,
    product_name: orUndefined(searchParams.get('product_name')),
    product_code: orUndefined(searchParams.get('product_code')),
    status: orUndefined(searchParams.get('status')) as ProductStatus | undefined,
    availability: orUndefined(searchParams.get('availability')) as ProductAvailability | undefined,
    category_id: categoryId || undefined,
    category_name: orUndefined(searchParams.get('category_name')),
    search_term: orUndefined(searchParams.get('search_term')),
    order_by: (orUndefined(searchParams.get('order_by')) as ProductSort) || ProductSort.CREATED_AT,
    sort_order: (orUndefined(searchParams.get('sort_order')) as SortOrder) || SortOrder.DESC,
  };
};

export const transformProductRESPToInput = (product: Product): ProductUpsertInput => ({
  category_ids: product.category_ids ?? [],
  name: product.name?.ko ?? '',
  name_en: product.name?.en ?? '',
  slug: product.slug ?? '',
  sku: product.sku ?? '',
  description: product.description ?? '',
  short_description: product.short_description ?? '',
  selling_price: product.selling_price ?? 0,
  supply_price: product.supply_price ?? 0,
  brand_site_price: product.brand_site_price ?? 0,
  plain_site_price: product.plain_site_price ?? 0,
  shipping_fee: product.shipping_fee ?? 0,
  price_content: product.price_content ?? '',
  images: product.images ?? [],
  // The API stores an array, while the admin UI intentionally manages one draft file.
  file_ai: product.file_ai?.slice(0, 1).flatMap((file) => (file.url ? [file.url] : [])) ?? [],
  stock_quantity: product.stock_quantity ?? 0,
  min_quantity: product.min_quantity ?? 0,
  max_quantity: product.max_quantity ?? 0,
  stock_inventory_enabled: product.stock_inventory_enabled ?? false,
  // sort_order: product.sort_order ?? 0,
  visible_roles: product.visible_roles ?? undefined,
  is_active: product.is_active ?? true,
  is_popular: product.is_popular ?? false,
  is_featured: product.is_featured ?? false,
  is_top_product: product.is_top_product ?? false,
  has_option: product.has_option ?? false,
  option_group_ids: (product.option_groups ?? []).map((group) => Number(group.id)),
  template_ids: product.template_ids ?? [],
  specification: Object.fromEntries(
    Object.entries(product.specification ?? {}).map(([key, value]) => [key, value ?? '']),
  ) as ProductUpsertInput['specification'],
});

export const resolveProductImages = async (attachments: AttachmentFileValue[]): Promise<string[]> => {
  const kept = attachments.flatMap((item) => (item.remote?.url ? [item.remote.url] : []));
  const files = attachments.flatMap((item) => (!item.remote && item.file ? [item.file] : []));
  if (!files.length) return kept;

  const resp = await uploadProductImagesAPI(files);

  return [...kept, ...resp.data.product_images];
};

export const resolveProductAiFile = async (attachment?: AttachmentFileValue): Promise<string[]> => {
  if (!attachment) return [];
  if (attachment.remote?.url) return [attachment.remote.url];
  if (!attachment.file) throw new Error(`Missing local file for product draft "${attachment.name}"`);

  const [uploaded] = await uploadAttachmentFiles(attachment, FileType.PRODUCT_AI);
  return uploaded?.url ? [uploaded.url] : [];
};

/** Map the one API URL into a non-image attachment so the editor renders its filename, not an image preview. */
export const productAiFileToAttachment = (file?: ProductAiFileRESP): AttachmentFileValue | undefined => {
  if (!file?.url) return undefined;

  const name = file.name || file.url.split('/').pop() || 'product-draft.ai';
  const mimeType = file.mime_type || 'application/postscript';
  return {
    localId: `remote-${file.id ?? file.url}`,
    name,
    size: file.size ?? 0,
    mime_type: mimeType,
    remote: {
      id: file.id ?? 0,
      url: file.url,
      name,
      size: file.size ?? 0,
      mime_type: mimeType,
    } as FileRESP,
  };
};

export const buildProductUpdateREQ = (id: number, input: ProductUpsertInput, current: Product): ProductUpdateREQ => ({
  ...input,
  description: (input.description ?? '') === (current.description ?? '') ? undefined : (input.description ?? ''),
  id,
  sku: input.sku === current.sku ? undefined : input.sku,
  slug: input.slug === current.slug ? undefined : orUndefined(input.slug),
});

export const transformProductFilterToExportREQ = (
  filter: ProductListREQ,
  exportType: ExportType,
  selectedIds: number[] = [],
  currentPage?: number,
  locale = 'en',
): ProductExportExcelREQ => ({
  export_type: exportType,
  selected_ids: exportType === ExportType.SELECTED ? selectedIds : undefined,
  current_page: exportType === ExportType.CURRENT_PAGE ? (currentPage ?? filter.page) : undefined,
  per_page: filter.per_page,
  locale,
  product_name: filter.product_name,
  product_code: filter.product_code,
  status: filter.status,
  availability: filter.availability,
  category_id: filter.category_id,
  category_name: filter.category_name,
  search_term: filter.search_term,
  order_by: filter.order_by,
  sort_order: filter.sort_order,
});
