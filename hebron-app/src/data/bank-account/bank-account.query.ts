import type { BaseRESP, ErrorRESP } from '@/utils/types/response.type';
import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { bankAccountAPI } from './bank-account.api';
import type { BankAccountDetailRESP } from './bank-account.response';

export const BANK_ACCOUNT_QUERY_KEYS = {
  all: ['bank-account'] as const,
  detail: () => [...BANK_ACCOUNT_QUERY_KEYS.all, 'detail'] as const,
};

export const useBankAccountQuery = (
  options?: Omit<UseQueryOptions<BaseRESP<BankAccountDetailRESP>, AxiosError<ErrorRESP>>, 'queryKey' | 'queryFn'>,
) =>
  useQuery({
    queryKey: BANK_ACCOUNT_QUERY_KEYS.detail(),
    queryFn: bankAccountAPI.get,
    ...options,
  });
