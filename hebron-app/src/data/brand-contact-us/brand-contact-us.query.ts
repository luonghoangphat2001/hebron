import type { BaseRESP, ErrorRESP } from '@/utils/types/response.type';
import { useMutation, type UseMutationOptions } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { brandContactUsAPI } from './brand-contact-us.api';
import type { BrandContactUsCreateREQ } from './brand-contact-us.request';
import type { BrandContactUsCreateRESP } from './brand-contact-us.response';

export const useCreateBrandContactUsMutation = (
  options?: UseMutationOptions<BaseRESP<BrandContactUsCreateRESP>, AxiosError<ErrorRESP>, BrandContactUsCreateREQ>,
) =>
  useMutation({
    ...options,
    mutationFn: brandContactUsAPI.create,
  });
