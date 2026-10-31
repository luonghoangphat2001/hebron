import { api } from '@/api';
import type { BaseRESP } from '@/utils/types/response.type';
import type { BankAccountUpdateREQ } from './bank-account.request';
import type { BankAccountDataRESP } from './bank-account.response';

const ENDPOINT = '/admin/bank-account';

export const getBankAccountAPI = (): Promise<BaseRESP<BankAccountDataRESP>> => api.get(ENDPOINT);

export const updateBankAccountAPI = (body: BankAccountUpdateREQ): Promise<BaseRESP<BankAccountDataRESP>> =>
  api.put(ENDPOINT, body);
