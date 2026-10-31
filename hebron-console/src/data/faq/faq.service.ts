import type { FAQInput } from '@/schemas/faq/faq.schema';
import { INITIAL_PAGING, PAGE_PARAM_KEY, PER_PAGE_PARAM_KEY } from '@/utils/constants/common.constant';
import { PostingStatus, SiteType } from '@/utils/enums/common.enum';
import { ExposureTarget } from '@/utils/enums/content.enum';
import { orUndefined } from '@/utils/helper/string.helper';
import type { FAQListREQ } from './faq.request';
import type { FAQRESP } from './faq.response';

export const getFAQListInitFilter = (searchParams: URLSearchParams): FAQListREQ => {
  const authorId = searchParams.get('author_id');

  return {
    page: Number(searchParams.get(PAGE_PARAM_KEY)) || INITIAL_PAGING.page,
    per_page: Number(searchParams.get(PER_PAGE_PARAM_KEY)) || INITIAL_PAGING.per_page,
    faq_category: orUndefined(searchParams.get('faq_category')),
    title: orUndefined(searchParams.get('title')),
    author_id: authorId ? Number(authorId) : undefined,
    posting_status: orUndefined(searchParams.get('posting_status')) as PostingStatus | undefined,
    exposure_target: orUndefined(searchParams.get('exposure_target')) as ExposureTarget | undefined,
    site_type: orUndefined(searchParams.get('site_type')) as SiteType | undefined,
    registration_date_from: orUndefined(searchParams.get('registration_date_from')),
    registration_date_to: orUndefined(searchParams.get('registration_date_to')),
    sort_by: orUndefined(searchParams.get('sort_by')) || 'created_at',
    sort_order: (orUndefined(searchParams.get('sort_order')) as 'asc' | 'desc' | undefined) || 'desc',
  };
};

const normalizeExposureTarget = (target: FAQRESP['exposure_target']): ExposureTarget[] => {
  if (Array.isArray(target)) return target;
  return target ? [target] : [ExposureTarget.ALL];
};

export const transformFAQRESPToInput = (faq: FAQRESP): FAQInput => ({
  category: (faq.category as string) || '',
  site_type: faq.site_type as SiteType,
  question: faq.question,
  answer: faq.answer,
  sort_order: faq.sort_order,
  posting_status: faq.posting_status.value,
  exposure_target: normalizeExposureTarget(faq.exposure_target),
});
