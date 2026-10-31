import type { ExposureStatus } from '@/utils/enums/common.enum';
import type { ExposureTarget } from '@/utils/enums/content.enum';
import type { PopupLocation } from '@/utils/enums/popup.enum';

export type PopupStatusRESP = {
  value: ExposureStatus;
  label: string;
};

export type PopupRegistrantRESP = {
  id: number;
  username: string;
  name: string;
};

export type PopupSizeSettings = {
  width: number;
  height: number;
};

export type PopupRESP = {
  id: number;
  name: string;
  content: string;
  image_path: string | null;
  exposure_location: PopupLocation | string;
  exposure_target: ExposureTarget[] | string[];
  size_settings: PopupSizeSettings;
  status: PopupStatusRESP;
  exposure_start_date: string;
  exposure_end_date: string;
  registrant: PopupRegistrantRESP | null;
  created_at: string;
  updated_at: string;
};

export type PopupList = {
  popups: PopupRESP[];
};
