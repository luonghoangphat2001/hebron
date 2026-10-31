import type { BannerLocation } from '@/utils/enums/banner.enum';
import type { ExposureStatus, PageType, SiteType } from '@/utils/enums/common.enum';
import type { PaginationREQ, SortREQ } from '@/utils/types/request.type';

export type BannerListREQ = PaginationREQ &
  SortREQ & {
    banner_name?: string;
    exposure_location?: BannerLocation;
    status?: ExposureStatus;
    site_type?: SiteType;
    page_type?: PageType;
    period_from?: string;
    period_to?: string;
    exposure_period_from?: string;
    exposure_period_to?: string;
    registrant_id?: number;
    sort_by?: string;
  };

export type BannerCreateREQ = {
  name: string;
  image_path: string | null;
  image_path_mobile: string | null;
  link_url: string;
  exposure_location: BannerLocation;
  site_type: SiteType;
  page_type: PageType;
  status: ExposureStatus;
  sort_order: number;
  exposure_start_date: string;
  exposure_end_date: string;
};

export type BannerUpdateREQ = BannerCreateREQ & {
  id: number;
};

export type BannerUploadImageREQ = {
  image: File;
};
