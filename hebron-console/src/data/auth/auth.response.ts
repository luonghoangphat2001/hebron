import type { User } from '@/utils/types/user.type';

export type LoginRESP = {
  user: User;
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  refresh_expires_in: number;
};
