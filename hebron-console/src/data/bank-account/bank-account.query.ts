import type { BaseRESP, ErrorRESP } from '@/utils/types/response.type';
import { useMutation, useQuery, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { getBankAccountAPI, updateBankAccountAPI } from './bank-account.api';
import type { BankAccountUpdateREQ } from './bank-account.request';
import type { BankAccountDataRESP } from './bank-account.response';

export const BANK_ACCOUNT_QUERY_KEYS = {
  DETAIL: ['bank-account'] as const,
};

export const useBankAccountQuery = () =>
  useQuery({
    queryKey: BANK_ACCOUNT_QUERY_KEYS.DETAIL,
    queryFn: getBankAccountAPI,
    select: (response) => response.data.bank_account,
  });

export const useBankAccountUpdateMutation = (
  options?: UseMutationOptions<BaseRESP<BankAccountDataRESP>, AxiosError<ErrorRESP>, BankAccountUpdateREQ>,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: updateBankAccountAPI,
    onSuccess: (response, variables, ...rest) => {
      queryClient.setQueryData(BANK_ACCOUNT_QUERY_KEYS.DETAIL, response);
      options?.onSuccess?.(response, variables, ...rest);
    },
  });
};
