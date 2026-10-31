import type { User } from '@/utils/types/user.type';

export type LoginRESP = {
  /** @deprecated Prefer GET /auth/me after login — backend may still embed user temporarily */
  user?: User;
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  refresh_expires_in: number;
};

export type MeRESP = {
  user: User;
};

export type RegisterRESP = LoginRESP;

export type FindIdRESP = {
  username: string;
  created_at: string;
};

export type SocialRedirectRESP = {
  redirect_url: string;
};
