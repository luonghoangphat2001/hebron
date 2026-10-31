import { ERROR_MESSAGE } from '@/utils/constants/error-message.constant';
import { ExposureStatus } from '@/utils/enums/common.enum';
import { ExposureTarget } from '@/utils/enums/content.enum';
import { PopupLocation } from '@/utils/enums/popup.enum';
import type { DefaultValues } from 'react-hook-form';
import { z } from 'zod';

export const popupUpsertSchema = z.object({
  name: z.string().min(1, ERROR_MESSAGE.FIELD_REQUIRED),
  content: z.string().optional().default(''),
  image_path: z.string({ error: ERROR_MESSAGE.FIELD_REQUIRED }).min(1, ERROR_MESSAGE.FIELD_REQUIRED),
  exposure_target: z.nativeEnum(ExposureTarget, { error: ERROR_MESSAGE.FIELD_REQUIRED }),
  exposure_location: z.nativeEnum(PopupLocation, { error: ERROR_MESSAGE.FIELD_REQUIRED }),
  width: z.number({ error: ERROR_MESSAGE.FIELD_REQUIRED }).min(1, ERROR_MESSAGE.FIELD_REQUIRED),
  height: z.number({ error: ERROR_MESSAGE.FIELD_REQUIRED }).min(1, ERROR_MESSAGE.FIELD_REQUIRED),
  status: z.nativeEnum(ExposureStatus, { error: ERROR_MESSAGE.FIELD_REQUIRED }),
  exposure_start_date: z.string().min(1, ERROR_MESSAGE.FIELD_REQUIRED),
  exposure_end_date: z.string().min(1, ERROR_MESSAGE.FIELD_REQUIRED),
});

export type PopupInput = z.infer<typeof popupUpsertSchema>;

export const popupInputDefault: DefaultValues<PopupInput> = {
  name: '',
  content: '',
  image_path: '',
  exposure_target: ExposureTarget.ALL,
  exposure_location: PopupLocation.MAIN,
  width: undefined,
  height: undefined,
  status: ExposureStatus.EXPOSED,
  exposure_start_date: '',
  exposure_end_date: '',
};
