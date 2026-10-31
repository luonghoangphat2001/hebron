import { SiteType } from '@/utils/enums/common.enum';
import type { BaseRESP, ErrorRESP } from '@/utils/types/response.type';
import { useMutation, useQuery, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { getAboutCtaDetailAPI, updateAboutCtaAPI } from './cta.api';
import type { AboutCtaUpdateREQ } from './cta.request';
import type { AboutCTA, AboutCtaDetailRESP } from './cta.response';

export const ABOUT_CTA_QUERY_KEYS = {
  LIST: 'ABOUT_CTA_LIST',
  DETAIL: 'ABOUT_CTA_DETAIL',
};

export const SUPPORTED_CTA_SITE_TYPES: SiteType[] = [SiteType.BRAND_SITE];

export const useAboutCtaListQuery = () =>
  useQuery({
    queryKey: [ABOUT_CTA_QUERY_KEYS.LIST],
    queryFn: async (): Promise<AboutCTA[]> => {
      const responses = await Promise.allSettled(SUPPORTED_CTA_SITE_TYPES.map((siteType) => getAboutCtaDetailAPI(siteType)));

      return responses.map((res, idx) => {
        const fallbackSiteType = SUPPORTED_CTA_SITE_TYPES[idx];
        if (res.status === 'fulfilled' && res.value?.data?.about_cta) {
          return res.value.data.about_cta;
        }

        // Return fallback shell item if not yet configured on server
        return {
          id: idx + 1,
          site_type: fallbackSiteType,
          title: '',
          subtitle: null,
          content: {
            heading: '',
            description: '',
            product_images: [],
          },
          link: '/inquiry',
          image: null,
          metadata: null,
        } satisfies AboutCTA;
      });
    },
  });

export const useAboutCtaDetailQuery = (siteType?: SiteType) =>
  useQuery({
    queryKey: [ABOUT_CTA_QUERY_KEYS.DETAIL, siteType],
    queryFn: () => getAboutCtaDetailAPI(siteType as SiteType),
    select: (resp) => resp.data?.about_cta,
    enabled: !!siteType,
  });

export const useAboutCtaUpdateMutation = (
  options?: UseMutationOptions<
    BaseRESP<AboutCtaDetailRESP>,
    AxiosError<ErrorRESP>,
    { siteType: SiteType; body: AboutCtaUpdateREQ }
  >,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: ({ siteType, body }) => updateAboutCtaAPI(siteType, body),
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: [ABOUT_CTA_QUERY_KEYS.LIST] });
      queryClient.invalidateQueries({ queryKey: [ABOUT_CTA_QUERY_KEYS.DETAIL] });
      options?.onSuccess?.(...args);
    },
  });
};
