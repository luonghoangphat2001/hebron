import type { BaseRESP, ErrorRESP } from '@/utils/types/response.type';
import { useMutation, useQuery, type UseMutationOptions } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { getAddressGeocodeAPI } from './address.api';
import type { AddressGeocodeREQ } from './address.request';
import type { AddressGeocodeData, AddressGeocodeRESP } from './address.response';

export const ADDRESS_QUERY_KEYS = {
  GEOCODE: 'ADDRESS_GEOCODE',
};

export const useAddressGeocodeQuery = (params: AddressGeocodeREQ, enabled = true) =>
  useQuery({
    queryKey: [ADDRESS_QUERY_KEYS.GEOCODE, params],
    queryFn: () => getAddressGeocodeAPI(params),
    select: (resp: BaseRESP<AddressGeocodeRESP>): AddressGeocodeData => resp.data.address,
    enabled: enabled && !!params.address?.trim(),
  });

export const useAddressGeocodeMutation = (
  options?: UseMutationOptions<BaseRESP<AddressGeocodeRESP>, AxiosError<ErrorRESP>, AddressGeocodeREQ>,
) =>
  useMutation<BaseRESP<AddressGeocodeRESP>, AxiosError<ErrorRESP>, AddressGeocodeREQ>({
    mutationFn: getAddressGeocodeAPI,
    ...options,
  });
