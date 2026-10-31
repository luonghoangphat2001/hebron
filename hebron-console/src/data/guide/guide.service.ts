import type { AttachmentFileValue } from '@/components/upload/AttachmentFile';
import type { FileRESP } from '@/data/file/file.response';
import type { GuideInput } from '@/schemas/guide/guide.schema';
import { INITIAL_PAGING, PAGE_PARAM_KEY, PER_PAGE_PARAM_KEY } from '@/utils/constants/common.constant';
import { PostingStatus } from '@/utils/enums/common.enum';
import { GuideType } from '@/utils/enums/content.enum';
import { FileType } from '@/utils/enums/file.enum';
import { orUndefined } from '@/utils/helper/string.helper';
import type { GuideAttachmentREQ, GuideCreateREQ, GuideListREQ } from './guide.request';
import type { GuideAttachmentRESP, GuideDetail } from './guide.response';

export const getGuideListInitFilter = (searchParams: URLSearchParams): GuideListREQ => {
  const authorId = searchParams.get('author_id');

  return {
    page: Number(searchParams.get(PAGE_PARAM_KEY)) || INITIAL_PAGING.page,
    per_page: Number(searchParams.get(PER_PAGE_PARAM_KEY)) || INITIAL_PAGING.per_page,
    search_term: orUndefined(searchParams.get('search_term')),
    author_id: authorId ? Number(authorId) : undefined,
    exposure_status: orUndefined(searchParams.get('exposure_status')) as PostingStatus | undefined,
    sort_by: orUndefined(searchParams.get('sort_by')) || 'created_at',
    sort_order: (orUndefined(searchParams.get('sort_order')) as 'asc' | 'desc' | undefined) || 'desc',
  };
};

export const toGuideAttachmentValues = (attachments: GuideAttachmentRESP[] | null | undefined = []): AttachmentFileValue[] =>
  (attachments || []).map((item, index) => {
    const path = item.key || item.url;
    const size = Number(item.size ?? 0);
    const no = Number(item.no ?? index);

    return {
      localId: `remote-${no}-${path}`,
      name: item.name,
      size,
      mime_type: '',
      remote: {
        id: no,
        name: item.name,
        path,
        url: item.url,
        type: FileType.GUIDE_CONTENT_ATTACHMENTS,
        mime_type: '',
        size,
        created_by: { id: 0, name: '' },
        created_at: '',
        updated_at: '',
      } satisfies FileRESP,
    };
  });

export const toGuideAttachmentREQ = (files: FileRESP[]): GuideAttachmentREQ[] =>
  files.map((file) => ({
    key: file.path,
    name: file.name,
    url: file.url,
    size: file.size,
  }));

export const transformGuideRESPToInput = (guide: GuideDetail): GuideInput => ({
  title: guide.title,
  content: guide.content,
  type: guide.type as GuideType,
  exposure_status: guide.exposure_status.value,
  exposure_start_date: guide.exposure_start_date || '',
  exposure_end_date: guide.exposure_end_date || '',
  attachments: toGuideAttachmentValues(guide.attachments),
});

export const toGuideUpsertBody = (input: GuideInput, uploadedFiles: FileRESP[]): GuideCreateREQ => ({
  title: input.title,
  content: input.content,
  type: input.type,
  exposure_status: input.exposure_status,
  exposure_start_date: input.exposure_start_date,
  exposure_end_date: input.exposure_end_date || null,
  attachments: toGuideAttachmentREQ(uploadedFiles),
});
