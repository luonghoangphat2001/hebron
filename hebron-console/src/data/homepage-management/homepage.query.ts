import { appToast } from '@/components/toast/AppToast';
import type { BaseRESP } from '@/utils/types/response.type';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { getPagesAPI, updatePageSectionAPI } from './homepage.api';
import type { PageListREQ, UpdatePageSectionParams } from './homepage.request';
import type { PagesListRESP, PageSectionRESP } from './homepage.response';

export const HOMEPAGE_QUERY_KEYS = {
  PAGES: 'HOMEPAGE_PAGES',
  PAGE_DETAIL: 'HOMEPAGE_PAGE_DETAIL',
};

export const usePagesQuery = (params: PageListREQ) =>
  useQuery({
    queryKey: [HOMEPAGE_QUERY_KEYS.PAGES, params.site_type, params.page_type],
    queryFn: () => getPagesAPI(params),
    select: (resp: BaseRESP<PagesListRESP>) => resp.data?.pages || [],
  });

export const useUpdatePageSectionMutation = () => {
  const queryClient = useQueryClient();
  const { t: tCommon } = useTranslation('common');

  return useMutation({
    mutationFn: (params: UpdatePageSectionParams) => updatePageSectionAPI(params),
    onSuccess: (resp: BaseRESP<{ section: PageSectionRESP }>) => {
      queryClient.invalidateQueries({ queryKey: [HOMEPAGE_QUERY_KEYS.PAGES] });
      queryClient.invalidateQueries({ queryKey: [HOMEPAGE_QUERY_KEYS.PAGE_DETAIL] });
      appToast.success(resp?.message || tCommon('notify.success_update'));
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || tCommon('notify.fail_update');
      appToast.error(message);
    },
  });
};
