import { uploadAttachmentFiles, type AttachmentFileValue } from '@/components/upload/AttachmentFile';
import type { CraftsmanshipInput } from '@/schemas/craftsmanship/craftsmanship.schema';
import { FileType } from '@/utils/enums/file.enum';
import type { CraftsmanshipCreateREQ, CraftsmanshipUpdateREQ } from './craftsmanship.request';
import type { CraftsmanshipValue } from './craftsmanship.response';

export const toCraftsmanshipAttachment = (url?: string | null): AttachmentFileValue | undefined => {
  if (!url) return undefined;
  const name = url.split('/').pop() || 'showcase.png';
  return {
    localId: `remote-${url}`,
    name,
    size: 0,
    mime_type: 'image/*',
    remote: {
      id: 0,
      url,
      name,
      size: 0,
      mime_type: 'image/*',
    } as any,
  };
};

export const resolveCraftsmanshipImage = async (
  attachment?: AttachmentFileValue | AttachmentFileValue[] | null,
): Promise<string | null> => {
  if (!attachment) return null;
  const item = Array.isArray(attachment) ? attachment[0] : attachment;
  if (!item) return null;

  if (item.remote?.url) {
    return item.remote.url;
  }

  if (item.file) {
    const uploaded = await uploadAttachmentFiles(item, FileType.PRODUCT_IMAGES);
    return uploaded[0]?.url || null;
  }

  return null;
};

export const getCraftsmanshipProductName = (name?: { ko?: string; en?: string } | string | null, isKo = true): string => {
  if (!name) return '-';
  if (typeof name === 'string') return name;
  return isKo ? name.ko || name.en || '-' : name.en || name.ko || '-';
};

export const transformCraftsmanshipToInput = (data?: CraftsmanshipValue | null): CraftsmanshipInput => ({
  title: data?.title || '',
  subtitle: data?.subtitle || null,
  image_url: data?.image_url || null,
  description: data?.description || null,
  sort_order: data?.sort_order ?? 0,
  is_active: data?.is_active ?? true,
  product_ids: data?.product_ids || data?.products?.map((p) => p.product_id) || [],
});

export const transformInputToCraftsmanshipCreateREQ = (input: CraftsmanshipInput): CraftsmanshipCreateREQ => ({
  title: input.title.trim(),
  subtitle: input.subtitle?.trim() ?? null,
  image_url: input.image_url ?? null,
  description: input.description?.trim() ?? null,
  sort_order: Number(input.sort_order) || 0,
  is_active: Boolean(input.is_active),
  product_ids: input.product_ids || [],
});

export const transformInputToCraftsmanshipUpdateREQ = (input: CraftsmanshipInput): CraftsmanshipUpdateREQ => ({
  title: input.title.trim(),
  subtitle: input.subtitle?.trim() ?? null,
  image_url: input.image_url ?? null,
  description: input.description?.trim() ?? null,
  sort_order: Number(input.sort_order) || 0,
  is_active: Boolean(input.is_active),
  product_ids: input.product_ids || [],
});
