import type { BaseRESP, ErrorRESP } from '@/utils/types/response.type';
import { useMutation, type UseMutationOptions } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { brandProductionInquiryAPI } from './brand-production-inquiry.api';
import type { BrandProductionInquiryCreateREQ } from './brand-production-inquiry.request';
import type { BrandProductionInquiryCreateRESP } from './brand-production-inquiry.response';

export const useCreateBrandProductionInquiryMutation = (
  options?: UseMutationOptions<
    BaseRESP<BrandProductionInquiryCreateRESP>,
    AxiosError<ErrorRESP>,
    BrandProductionInquiryCreateREQ
  >,
) =>
  useMutation({
    ...options,
    mutationFn: brandProductionInquiryAPI.create,
  });
