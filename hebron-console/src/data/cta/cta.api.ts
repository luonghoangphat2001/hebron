import { api } from '@/api';
import type { SiteType } from '@/utils/enums/common.enum';
import type { BaseRESP } from '@/utils/types/response.type';
import type { AboutCtaUpdateREQ } from './cta.request';
import type { AboutCtaDetailRESP } from './cta.response';

const ENDPOINTS = {
  ROOT: `/admin/about-ctas`,
};

export const getAboutCtaDetailAPI = (siteType: SiteType): Promise<BaseRESP<AboutCtaDetailRESP>> =>
  api.get(`${ENDPOINTS.ROOT}/${siteType}`);

export const updateAboutCtaAPI = (siteType: SiteType, body: AboutCtaUpdateREQ): Promise<BaseRESP<AboutCtaDetailRESP>> =>
  api.put(`${ENDPOINTS.ROOT}/${siteType}`, body);
