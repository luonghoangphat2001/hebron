import { z } from 'zod';
import { commonSchema } from '..';

export const loginSchema = z.object({
  username: commonSchema.requiredString,
  password: commonSchema.password,
});

export type LoginInput = z.infer<typeof loginSchema>;
