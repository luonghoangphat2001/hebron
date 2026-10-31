import { ExposureStatus } from '../enums/common.enum';

export const BANNER_BADGE: Record<ExposureStatus, string> = {
  [ExposureStatus.EXPOSED]: 'bg-green-200 text-green-700 rounded-sm',
  [ExposureStatus.NON_EXPOSED]: 'bg-gray-200 text-gray-700 rounded-sm',
};

export const EXPOSURE_STATUS_LABEL: Record<ExposureStatus, string> = {
  [ExposureStatus.EXPOSED]: 'Exposed',
  [ExposureStatus.NON_EXPOSED]: 'Non-exposed',
};
