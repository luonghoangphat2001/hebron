import { uploadAttachmentFiles, type AttachmentFileValue } from '@/components/upload/AttachmentFile';
import type { FileRESP } from '@/data/file/file.response';
import { toStoragePath } from '@/utils/helper/storage-url.helper';
import type { MediaInput } from '@/schemas/media/media.schema';
import { INITIAL_PAGING, PAGE_PARAM_KEY, PER_PAGE_PARAM_KEY } from '@/utils/constants/common.constant';
import { SiteType } from '@/utils/enums/common.enum';
import { FileType } from '@/utils/enums/file.enum';
import { orUndefined } from '@/utils/helper/string.helper';
import type { MediaCreateREQ, MediaListREQ } from './media.request';
import type { Media } from './media.response';

export const normalizeSlug = (value = '') =>
  (value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/-{2,}/g, '-');

/** trimmed edge dashes */
export const toSlug = (value = '') => normalizeSlug((value || '').trim()).replace(/^-+|-+$/g, '');

export const DEFAULT_MEDIA_SITE_TYPE = SiteType.BRAND_SITE;

export const getMediaListInitFilter = (searchParams: URLSearchParams): MediaListREQ => {
  const isActive = searchParams.get('is_active');

  return {
    page: Number(searchParams.get(PAGE_PARAM_KEY)) || INITIAL_PAGING.page,
    per_page: Number(searchParams.get(PER_PAGE_PARAM_KEY)) || INITIAL_PAGING.per_page,
    // the list is always scoped to one site
    site_type: (orUndefined(searchParams.get('site_type')) as SiteType) || DEFAULT_MEDIA_SITE_TYPE,
    category_id: Number(searchParams.get('category_id')) || undefined,
    is_active: isActive ? isActive === 'true' : undefined,
    keyword: orUndefined(searchParams.get('keyword')),
  };
};

export const toMediaAttachment = (url?: string | null): AttachmentFileValue | undefined => {
  if (!url) return undefined;
  const name = url.split('/').pop() || 'media';
  return {
    localId: `remote-${url}`,
    name,
    size: 0,
    mime_type: 'image/*',
    remote: { id: 0, url, path: toStoragePath(url), name, size: 0, mime_type: 'image/*' } as FileRESP,
  };
};

export const transformMediaToInput = (data?: Media | null): MediaInput => ({
  site_type: data?.site_type || DEFAULT_MEDIA_SITE_TYPE,
  category_id: data?.category_id ?? 0,
  title: data?.title || '',
  description: data?.description || null,
  thumbnail_path: data?.image_url || null,
  link_url: data?.link_url || null,
  sort_order: data?.sort_order ?? 0,
  is_active: data?.is_active ?? true,
});

/** Upload a picked file and return its storage `path` + public `url`. */
export const resolveMediaFile = async (attachment?: AttachmentFileValue) => {
  if (!attachment) return null;
  const [uploaded] = await uploadAttachmentFiles(attachment, FileType.MEDIA);
  return uploaded ? { path: uploaded.path, url: uploaded.url } : null;
};

export const transformInputToMediaCreateREQ = (
  input: MediaInput,
  image: { path: string; url: string } | null,
): MediaCreateREQ => ({
  site_type: input.site_type,
  category_id: Number(input.category_id),
  title: input.title.trim(),
  description: input.description?.trim() || null,
  file_path: image?.path ?? null,
  thumbnail_path: image?.path ?? null,
  url: image?.url ?? null,
  link_url: input.link_url?.trim() || null,
  sort_order: Number(input.sort_order) || 0,
  is_active: Boolean(input.is_active),
});
