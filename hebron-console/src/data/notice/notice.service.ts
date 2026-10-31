import type { AttachmentFileValue } from '@/components/upload/AttachmentFile';
import type { FileRESP } from '@/data/file/file.response';
import type { NoticeInput } from '@/schemas/notice/notice.schema';
import { INITIAL_PAGING, PAGE_PARAM_KEY, PER_PAGE_PARAM_KEY } from '@/utils/constants/common.constant';
import { PostingStatus, SiteType } from '@/utils/enums/common.enum';
import { ExposureLocation, NoticeType } from '@/utils/enums/content.enum';
import { FileType } from '@/utils/enums/file.enum';
import { orUndefined } from '@/utils/helper/string.helper';
import type { NoticeAttachmentREQ, NoticeCreateREQ, NoticeListREQ } from './notice.request';
import type { NoticeAttachmentRESP, NoticeRESP } from './notice.response';

export const getNoticeListInitFilter = (searchParams: URLSearchParams): NoticeListREQ => {
  const authorId = searchParams.get('author_id');
  const category = searchParams.get('category');

  return {
    page: Number(searchParams.get(PAGE_PARAM_KEY)) || INITIAL_PAGING.page,
    per_page: Number(searchParams.get(PER_PAGE_PARAM_KEY)) || INITIAL_PAGING.per_page,
    search_term: orUndefined(searchParams.get('search_term')),
    category: category ? Number(category) : undefined,
    author_id: authorId ? Number(authorId) : undefined,
    exposure_status: orUndefined(searchParams.get('exposure_status')) as PostingStatus | undefined,
    exposure_location: orUndefined(searchParams.get('exposure_location')) as ExposureLocation | undefined,
    site_type: (orUndefined(searchParams.get('site_type')) as SiteType | undefined) || SiteType.SHOPPING_MALL,
    exposure_start_date: orUndefined(searchParams.get('exposure_start_date')),
    exposure_end_date: orUndefined(searchParams.get('exposure_end_date')),
    sort_by: orUndefined(searchParams.get('sort_by')) || 'created_at',
    sort_order: (orUndefined(searchParams.get('sort_order')) as 'asc' | 'desc' | undefined) || 'desc',
  };
};

export const toNoticeAttachmentValues = (attachments: NoticeAttachmentRESP[] | null | undefined = []): AttachmentFileValue[] =>
  (attachments || []).map((item, index) => {
    const path = item.key || item.url;
    const size = item.size ?? 0;

    return {
      localId: `remote-${item.no ?? index}-${path}`,
      name: item.name,
      size,
      mime_type: '',
      remote: {
        id: item.no ?? index,
        name: item.name,
        path,
        url: item.url,
        type: FileType.NOTICE_ATTACHMENTS,
        mime_type: '',
        size,
        created_by: { id: 0, name: '' },
        created_at: '',
        updated_at: '',
      } satisfies FileRESP,
    };
  });

export const toNoticeAttachmentREQ = (files: FileRESP[]): NoticeAttachmentREQ[] =>
  files.map((file) => ({
    key: file.path,
    name: file.name,
    url: file.url,
    size: file.size,
  }));

export const transformNoticeRESPToInput = (notice: NoticeRESP): NoticeInput => ({
  title: notice.title,
  content: notice.content,
  category:
    typeof notice.category === 'object' && notice.category
      ? notice.category.id
      : Number(notice.category) || (undefined as unknown as number),
  type: notice.type as NoticeType,
  site_type: (notice.site_type as SiteType) || SiteType.SHOPPING_MALL,
  is_pinned: notice.is_pinned,
  exposure_status: notice.exposure_status.value,
  exposure_location: (notice.exposure_location as ExposureLocation) || ExposureLocation.MAIN,
  exposure_start_date: notice.exposure_start_date || '',
  exposure_end_date: notice.exposure_end_date || '',
  attachments: toNoticeAttachmentValues(notice.attachments),
});

export const toNoticeUpsertBody = (input: NoticeInput, uploadedFiles: FileRESP[]): NoticeCreateREQ => ({
  title: input.title,
  content: input.content,
  category: Number(input.category),
  type: input.type,
  site_type: input.site_type || SiteType.SHOPPING_MALL,
  is_pinned: input.is_pinned,
  exposure_status: input.exposure_status,
  exposure_location: input.exposure_location || ExposureLocation.MAIN,
  exposure_start_date: input.exposure_start_date,
  exposure_end_date: input.exposure_end_date || null,
  attachments: toNoticeAttachmentREQ(uploadedFiles),
});
