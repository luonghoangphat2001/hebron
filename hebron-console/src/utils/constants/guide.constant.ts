import { PostingStatus } from '@/utils/enums/common.enum';

export const GUIDE_EXPOSURE_STATUS_BADGE = {
  [PostingStatus.EXPOSED]: 'bg-green-200 text-green-700 rounded-sm',
  [PostingStatus.NON_EXPOSED]: 'bg-gray-200 text-gray-700 rounded-sm',
};
