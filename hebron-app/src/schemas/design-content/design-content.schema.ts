import { attachmentValueSchema } from '@/schemas/attachment/attachment-value.schema';
import type { TFunction } from 'i18next';
import { z } from 'zod';

export const designContentFormSchema = (tCommon: TFunction, tValidation: TFunction<'validation'>) => {
  const requiredString = (field: string) => z.string().trim().min(1, tValidation('required', { field }));

  return z.object({
    title: requiredString(tCommon('title.title')),
    recipientName: requiredString(tCommon('title.recipient')),
    date: requiredString(tCommon('title.date_2')),
    message: requiredString(tCommon('title.greeting')),
    sender: requiredString(tCommon('title.giver')),
    file: z.array(attachmentValueSchema),
  });
};

export type DesignContentFormValues = z.infer<ReturnType<typeof designContentFormSchema>>;

export const DESIGN_CONTENT_DEFAULT_VALUES: DesignContentFormValues = {
  title: '',
  recipientName: '',
  date: '',
  message: '',
  sender: '',
  file: [],
};
