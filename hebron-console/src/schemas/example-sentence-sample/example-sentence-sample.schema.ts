import { ERROR_MESSAGE } from '@/utils/constants/error-message.constant';
import type { DefaultValues } from 'react-hook-form';
import { z } from 'zod';

export const exampleSentenceSampleUpsertSchema = z.object({
  title: z.string().trim().min(1, ERROR_MESSAGE.FIELD_REQUIRED),
  category_id: z.number({ error: ERROR_MESSAGE.FIELD_REQUIRED }).int().positive(ERROR_MESSAGE.FIELD_REQUIRED),
  board_category_no: z.number().int().min(0),
  content: z.string().trim().min(1, ERROR_MESSAGE.FIELD_REQUIRED),
  is_active: z.boolean(),
});

export type ExampleSentenceSampleInput = z.infer<typeof exampleSentenceSampleUpsertSchema>;

export const exampleSentenceSampleInputDefault: DefaultValues<ExampleSentenceSampleInput> = {
  title: '',
  category_id: undefined,
  board_category_no: 0,
  content: '',
  is_active: true,
};

export const exampleSentenceSampleCategoryUpsertSchema = z.object({
  name: z.string().trim().min(1, ERROR_MESSAGE.FIELD_REQUIRED),
  is_active: z.boolean(),
});

export type ExampleSentenceSampleCategoryInput = z.infer<typeof exampleSentenceSampleCategoryUpsertSchema>;

export const exampleSentenceSampleCategoryInputDefault: DefaultValues<ExampleSentenceSampleCategoryInput> = {
  name: '',
  is_active: true,
};
