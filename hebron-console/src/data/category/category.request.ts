import type { CategoryLevels, CategoryStatus } from '@/utils/enums/category.enum';
import type { ExportType } from '@/utils/enums/common.enum';
import type { PaginationREQ, SortREQ } from '@/utils/types/request.type';
import type { CategoryMovePlan } from './category.tree';

export type CategorySortFields = 'name' | 'status' | 'is_best' | 'create_at' | 'sort_order';
export type CategoryExposureImageType = 'icon' | 'banner';

export type CategoryListREQ = PaginationREQ &
  SortREQ & {
    name?: string;
    slug?: string;
    level?: CategoryLevels;
    status?: CategoryStatus;
    is_best?: boolean;
    registrant?: string;
    sort_by?: CategorySortFields;
  };

export type CategoryExportExcelREQ = PaginationREQ &
  SortREQ & {
    export_type: ExportType;
    locale?: string;
    status?: CategoryStatus;
    sort_by?: CategorySortFields;
    selected_ids?: number[];
  };

export type CategoryUploadExposureImage = {
  file: File;
  type: CategoryExposureImageType;
};

export type CategoryExposureInfoREQ = {
  exposure_order: number | string;
  image: string | null;
  banner_image: string | null;
  icon_image: string | null;
  exposure_start_date: string;
  exposure_end_date: string;
};

export type CategoryCreateREQ = CategoryExposureInfoREQ & {
  name: string;
  name_en: string | null;
  slug: string;
  parent_id: number | string | null;
  description: string;
  subtitle: string | null;
  icon: string;
  sort_order: number;
  is_best: boolean;
  status: CategoryStatus;
  exposure_start_date: string;
  exposure_end_date: string;
};

type CategoryExposureInfo = keyof CategoryExposureInfoREQ;

export type CategoryUpdateInfoREQ = Omit<CategoryCreateREQ, CategoryExposureInfo> & {
  id: number;
};

export type CategorySortOrder = {
  id: number | string;
  sort_order: number | string;
};

export type CategoryUpdateSortOrderREQ = {
  categories: CategorySortOrder[];
};

/** input of one drag & drop gesture — a move plan plus the category it applies to */
export type CategoryMoveVariables = CategoryMovePlan & { id: number };

export type CategoryProductListREQ = {
  current_page?: number;
  per_page?: number;
};

export type CategoryProductPositionREQ = {
  categoryId: number;
  productId: number;
  position: number;
};
