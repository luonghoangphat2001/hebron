import { api } from '@/api';
import type { BaseRESP } from '@/utils/types/response.type';
import type { PageListREQ, UpdatePageSectionParams } from './homepage.request';
import type { PagesListRESP, PageSectionRESP } from './homepage.response';

const ENDPOINTS = {
  PAGES: '/admin/pages',
};

export const getPagesAPI = (params: PageListREQ): Promise<BaseRESP<PagesListRESP>> => api.get(ENDPOINTS.PAGES, { params });

export const updatePageSectionAPI = ({
  siteType,
  pageType,
  sectionType,
  body,
}: UpdatePageSectionParams): Promise<BaseRESP<{ section: PageSectionRESP }>> =>
  api.put(`${ENDPOINTS.PAGES}/${siteType}/${pageType}/sections/${sectionType}`, body);
