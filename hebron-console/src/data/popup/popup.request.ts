import type { ExposureStatus } from '@/utils/enums/common.enum';
import type { ExposureTarget } from '@/utils/enums/content.enum';
import type { PopupLocation, PopupSort } from '@/utils/enums/popup.enum';
import type { PaginationREQ, SortREQ } from '@/utils/types/request.type';

export type PopupListREQ = PaginationREQ &
  SortREQ & {
    popup_name?: string;
    exposure_location?: PopupLocation;
    status?: ExposureStatus;
    period_from?: string;
    period_to?: string;
    exposure_period_from?: string;
    exposure_period_to?: string;
    registrant_id?: number;
    sort_by?: PopupSort;
  };

export type PopupCreateREQ = {
  name: string;
  content?: string;
  image_path: string | null;
  exposure_target: ExposureTarget | string;
  exposure_location: PopupLocation;
  width: number;
  height: number;
  status: ExposureStatus;
  exposure_start_date: string;
  exposure_end_date: string;
};

export type PopupUpdateREQ = PopupCreateREQ & {
  id: number;
};

export type PopupDeleteREQ = {
  id: number;
};
