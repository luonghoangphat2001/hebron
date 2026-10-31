import { ERROR_MESSAGE } from '@/utils/constants/error-message.constant';
import { OptionGroupDisplayType } from '@/utils/enums/option-group.enum';
import type { DefaultValues } from 'react-hook-form';
import { z } from 'zod';

export const optionGroupCreateSchema = z.object({
  code: z.string().trim().min(1, ERROR_MESSAGE.FIELD_REQUIRED),
  name: z.string().trim().min(1, ERROR_MESSAGE.FIELD_REQUIRED),
  display_type: z.nativeEnum(OptionGroupDisplayType, { error: ERROR_MESSAGE.FIELD_REQUIRED }),
  is_required: z.boolean(),
});

export type OptionGroupCreateInput = z.infer<typeof optionGroupCreateSchema>;

export const optionGroupCreateInputDefault: DefaultValues<OptionGroupCreateInput> = {
  code: '',
  name: '',
  display_type: OptionGroupDisplayType.SELECT,
  is_required: false,
};
