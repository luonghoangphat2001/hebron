import type { ExposureStatus, PageType, PostingStatus, SiteType } from '@/utils/enums/common.enum';
import type { BannerLocation } from '@/utils/enums/banner.enum';

export type BannerStatusRESP = {
  value: PostingStatus;
  label: string;
};

export type BannerRegistrantRESP = {
  id: number;
  username: string;
  name: string;
};

export type Banner = {
  id: number;
  name: string;
  image_path: string | null;
  image_path_mobile: string | null;
  link_url: string;
  exposure_location: BannerLocation | string;
  site_type?: SiteType;
  page_type?: PageType;
  exposure_target?: string[];
  status: {
    value: ExposureStatus;
    label: string;
  };
  sort_order: number;
  exposure_start_date: string;
  exposure_end_date: string;
  registrant: BannerRegistrantRESP | null;
  created_at: string;
  updated_at: string;
};

export type BannerRESP = {
  banner: Banner;
};

export type BannerList = {
  banners: Banner[];
};
