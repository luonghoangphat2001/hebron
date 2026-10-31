import { uploadAttachmentFiles, type AttachmentFileValue } from '@/components/upload/AttachmentFile';
import type { AboutCtaInput } from '@/schemas/cta/cta.schema';
import { SiteType } from '@/utils/enums/common.enum';
import { FileType } from '@/utils/enums/file.enum';
import type { AboutCtaUpdateREQ } from './cta.request';
import type { AboutCTA } from './cta.response';

export const toCtaAttachmentValues = (urls?: string[] | null): AttachmentFileValue[] => {
  if (!urls?.length) return [];
  return urls.filter(Boolean).map((url, idx) => ({
    localId: `remote-${idx}-${url}`,
    name: url.split('/').pop() || `image_${idx + 1}.png`,
    size: 0,
    mime_type: 'image/*',
    remote: {
      id: idx,
      url,
      name: url.split('/').pop() || `image_${idx + 1}.png`,
      size: 0,
      mime_type: 'image/*',
    } as any,
  }));
};

export const resolveCtaImages = async (attachments?: AttachmentFileValue | AttachmentFileValue[]): Promise<string[]> => {
  if (!attachments) return [];
  const items = Array.isArray(attachments) ? attachments : [attachments];
  if (!items.length) return [];

  const results: string[] = [];

  for (const item of items) {
    if (item.remote?.url) {
      results.push(item.remote.url);
    } else if (item.file) {
      const uploaded = await uploadAttachmentFiles(item, FileType.PRODUCT_IMAGES);
      if (uploaded[0]?.url) {
        results.push(uploaded[0].url);
      }
    }
  }

  return results;
};

export const CTA_MAX_PRODUCTS = 20;

export const transformAboutCtaToInput = (cta?: AboutCTA | null): AboutCtaInput => ({
  site_type: cta?.site_type || SiteType.BRAND_SITE,
  item:
    cta?.content?.item?.slice(0, CTA_MAX_PRODUCTS).map((it) => ({
      product_id: it.product_id,
      image: it.image,
    })) || [],
});

export const transformInputToAboutCtaUpdateREQ = (input: AboutCtaInput): AboutCtaUpdateREQ => ({
  content: {
    item: input.item.slice(0, CTA_MAX_PRODUCTS).map((it) => ({
      image: it.image,
      product_id: it.product_id,
    })),
  },
});
