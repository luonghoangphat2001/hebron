import type { AddressGeocodeData, AddressGeocodeRESP } from './address.response';

/**
 * Service Layer Normalization for Geocode Response
 */
export const normalizeAddressGeocode = (data?: AddressGeocodeRESP): AddressGeocodeData | null => {
  if (!data?.address?.lat || !data?.address?.lng) return null;
  return {
    lat: Number(data.address.lat),
    lng: Number(data.address.lng),
  };
};
