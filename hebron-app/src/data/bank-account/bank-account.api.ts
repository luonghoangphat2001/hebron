import { api } from '@/api';
import type { BaseRESP } from '@/utils/types/response.type';
import type { BankAccountDetailRESP } from './bank-account.response';

const ENDPOINTS = {
  ROOT: '/bank-account',
} as const;

export const bankAccountAPI = {
  get: (): Promise<BaseRESP<BankAccountDetailRESP>> => api.get(ENDPOINTS.ROOT),
};
