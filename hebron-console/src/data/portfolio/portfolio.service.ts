import { uploadAttachmentFiles, type AttachmentFileValue } from '@/components/upload/AttachmentFile';
import type { PortfolioFilterValues } from '@/pages/portfolio/components/PortfolioFilter';
import type { PortfolioInput } from '@/schemas/portfolio/portfolio.schema';
import { INITIAL_PAGING, PAGE_PARAM_KEY, PER_PAGE_PARAM_KEY } from '@/utils/constants/common.constant';
import { SortOrder } from '@/utils/enums/common.enum';
import { FileType } from '@/utils/enums/file.enum';
import { PortfolioSort } from '@/utils/enums/portfolio.enum';
import type { PortfolioCreateREQ, PortfolioListREQ, PortfolioUpdateREQ } from './portfolio.request';
import type { Portfolio } from './portfolio.response';

export const getPortfolioListInitFilter = (searchParams: URLSearchParams): PortfolioFilterValues => ({
  title: searchParams.get('title') || '',
  category: searchParams.get('category') || undefined,
  is_featured: searchParams.get('is_featured') === 'true' ? true : undefined,
  is_active: searchParams.get('is_active') === 'true' ? true : undefined,
  year: searchParams.get('year') ? Number(searchParams.get('year')) : undefined,
  sort_by: (searchParams.get('sort_by') as PortfolioSort) || PortfolioSort.SORT_ORDER,
  sort_order: (searchParams.get('sort_order') as SortOrder) || SortOrder.ASC,
  page: Number(searchParams.get(PAGE_PARAM_KEY)) || INITIAL_PAGING.page || 1,
  per_page: Number(searchParams.get(PER_PAGE_PARAM_KEY)) || INITIAL_PAGING.per_page || 10,
});

export const transformPortfolioFilterToREQ = (filter: PortfolioFilterValues): PortfolioListREQ => ({
  page: filter.page,
  per_page: filter.per_page,
  title: filter.title || undefined,
  category: filter.category,
  is_featured: filter.is_featured,
  is_active: filter.is_active,
  year: filter.year,
  sort_by: filter.sort_by,
  sort_order: filter.sort_order,
});

export const transformPortfolioRESPToInput = (portfolio: Portfolio): PortfolioInput => ({
  site_type: portfolio.site_type,
  title: portfolio.title,
  client: portfolio.client,
  category: portfolio.category || '',
  year: portfolio.year || new Date().getFullYear(),
  description: portfolio.description,
  cover_image: portfolio.cover_image ?? '',
  is_featured: portfolio.is_featured,
  is_active: portfolio.is_active,
  sort_order: portfolio.sort_order,
});

export const transformPortfolioInputToCreateREQ = (input: PortfolioInput): PortfolioCreateREQ => ({
  site_type: input.site_type,
  title: input.title,
  client: input.client,
  category: input.category,
  year: input.year,
  description: input.description,
  cover_image: input.cover_image || null,
  is_featured: input.is_featured,
  is_active: input.is_active,
  sort_order: input.sort_order,
});

export const transformPortfolioInputToUpdateREQ = (id: number, input: PortfolioInput): PortfolioUpdateREQ => ({
  ...transformPortfolioInputToCreateREQ(input),
  id,
});

export const urlToAttachmentValue = (url?: string | null): AttachmentFileValue | undefined => {
  if (!url) return undefined;
  const name = url.split('/').pop() || 'portfolio_image.jpg';
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

export const resolvePortfolioCoverImage = async (
  attachment?: AttachmentFileValue,
  fallbackUrl?: string | null,
): Promise<string | null> => {
  if (!attachment) return null;
  if (attachment.remote?.url) return attachment.remote.url;
  if (attachment.file) {
    const uploaded = await uploadAttachmentFiles(attachment, FileType.PORTFOLIO);
    return uploaded[0]?.url || fallbackUrl || null;
  }
  return fallbackUrl || null;
};
