import { DATE_FORMAT } from '@/utils/constants/date.constant';
import { INITIAL_PAGING, PAGE_PARAM_KEY, PER_PAGE_PARAM_KEY } from '@/utils/constants/common.constant';
import { CategoryLevels, CategoryStatus } from '@/utils/enums/category.enum';
import { orUndefined } from '@/utils/helper/string.helper';
import dayjs from 'dayjs';
import type { DateRange } from 'react-day-picker';
import { uploadCategoryExposureImageAPI } from './category.api';
import type { CategoryCreateREQ, CategoryExposureImageType, CategoryListREQ, CategoryUpdateInfoREQ } from './category.request';
import type { CategorynNode } from './category.response';

export const slugifyCategoryName = (name: string): string => name.replace(/\s+/g, '_');

export type CategoryFormValues = {
  name: string;
  name_en: string;
  slug: string;
  description: string;
  subtitle: string;
  status: CategoryStatus | undefined;
  sort_order: string;
  expose_date_range: DateRange | undefined;
  parent_id: number | undefined;
};

export const toCategoryCreateBody = (
  form: CategoryFormValues,
  depth: number,
  iconUrl: string,
  bannerUrl: string,
): CategoryCreateREQ => ({
  name: form.name.trim(),
  name_en: form.name_en.trim() || null,
  slug: form.slug.trim(),
  description: form.description.trim(),
  subtitle: form.subtitle.trim() || null,
  status: form.status as CategoryStatus,
  parent_id: depth === 2 ? (form.parent_id ?? null) : null,
  icon: iconUrl,
  sort_order: Number(form.sort_order),
  is_best: false,
  exposure_order: Number(form.sort_order),
  image: bannerUrl || null,
  banner_image: bannerUrl || null,
  icon_image: iconUrl || null,
  exposure_start_date: form.expose_date_range?.from ? dayjs(form.expose_date_range.from).format(DATE_FORMAT) : '',
  exposure_end_date: form.expose_date_range?.to ? dayjs(form.expose_date_range.to).format(DATE_FORMAT) : '',
});

export const toCategoryUpdateBody = (
  form: CategoryFormValues,
  editData: Pick<CategorynNode, 'id' | 'is_best'>,
  depth: number,
  iconUrl: string,
): CategoryUpdateInfoREQ => ({
  id: editData.id,
  name: form.name.trim(),
  name_en: form.name_en.trim() || null,
  slug: form.slug.trim(),
  description: form.description.trim(),
  subtitle: form.subtitle.trim() || null,
  status: form.status as CategoryStatus,
  parent_id: depth === 2 ? (form.parent_id ?? null) : null,
  icon: iconUrl,
  sort_order: Number(form.sort_order),
  is_best: editData.is_best,
});

export const resolveExposureImageUrl = async (value: string | File, type: CategoryExposureImageType): Promise<string> => {
  if (typeof value === 'string') return value.trim();
  const resp = await uploadCategoryExposureImageAPI({ file: value, type });
  return resp.data.url;
};

export type CategoryTreeFilterValues = Pick<CategoryListREQ, 'name' | 'slug' | 'level' | 'status'>;

export const hasCategoryFilter = (filters: CategoryTreeFilterValues) =>
  !!(filters.name || filters.slug || filters.level || filters.status);

export const getCategoryListInitFilter = (searchParams: URLSearchParams): CategoryListREQ => ({
  page: Number(searchParams.get(PAGE_PARAM_KEY)) || INITIAL_PAGING.page,
  per_page: Number(searchParams.get(PER_PAGE_PARAM_KEY)) || INITIAL_PAGING.per_page,
  name: orUndefined(searchParams.get('name')),
  slug: orUndefined(searchParams.get('slug')),
  level: orUndefined(searchParams.get('level')) as CategoryLevels | undefined,
  status: orUndefined(searchParams.get('status')) as CategoryStatus | undefined,
  is_best: searchParams.has('is_best') ? searchParams.get('is_best') === 'true' : undefined,
  registrant: orUndefined(searchParams.get('registrant')),
});

export const flattenCategories = (nodes: CategorynNode[] = [], depth = 0): { value: number; label: string }[] =>
  nodes.flatMap((node) => [
    { value: Number(node.id), label: `${'— '.repeat(depth)}${node.name}` },
    ...flattenCategories(node.children ?? [], depth + 1),
  ]);
