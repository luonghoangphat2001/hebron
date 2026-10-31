import { BrandScrollReveal } from '@/components/brand/BrandScrollReveal';
import { useMediaDetailQuery } from '@/data/media/media.query';
import { mapMediaToDetailView } from '@/data/media/media.service';
import { mapBrandMediaPage } from '@/data/pages/pages.mapper';
import { usePageBySlugQuery } from '@/data/pages/pages.query';
import { BRAND_MEDIA_PAGE_SLUG } from '@/data/pages/pages.request';
import { useIsMobile } from '@/hooks/useIsMobile';
import BrandHeroSection from '@/pages/brand/components/BrandHeroSection';
import { BRAND_ROUTE } from '@/utils/constants/route.constant';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate, useParams } from 'react-router-dom';

import MediaDetailContent from './components/MediaDetailContent';

const DEFAULT_TITLE = '언론보도';

const MediaDetailPage = () => {
  const { id = '' } = useParams<{ id: string }>();
  const mediaId = Number(id);
  const isValidId = Number.isInteger(mediaId) && mediaId > 0;
  const { t: tCommon } = useTranslation('common');
  const isMobile = useIsMobile();

  const { data: pageData } = usePageBySlugQuery(BRAND_MEDIA_PAGE_SLUG);
  const heroView = useMemo(() => (pageData?.data?.page ? mapBrandMediaPage(pageData.data.page) : null), [pageData]);

  const { data, isLoading, isError } = useMediaDetailQuery(isValidId ? mediaId : undefined, {
    enabled: isValidId,
  });

  if (!id || !isValidId) {
    return <Navigate to={BRAND_ROUTE.MEDIA} replace />;
  }

  if (isError || (!isLoading && !data?.data?.media)) {
    return <Navigate to={BRAND_ROUTE.MEDIA} replace />;
  }

  const heroBgUrl = isMobile ? heroView?.heroBackgroundImageUrlMB : heroView?.heroBackgroundImageUrlPC;
  const heroTitle = heroView?.heroTitle || DEFAULT_TITLE;

  if (isLoading || !data?.data?.media) {
    return (
      <main className='min-w-0 overflow-x-hidden bg-neutral-950 text-white'>
        <BrandHeroSection className='h-80 min-h-80 md:h-[320px]' bottomFadeClassName='h-24' backgroundImageUrl={heroBgUrl}>
          <div className='flex flex-1 flex-col items-center justify-end px-4 pb-16'>
            <BrandScrollReveal variant='fadeUp'>
              <h1 className='text-3xl font-semibold text-white md:text-[48px] md:leading-[60px]'>{heroTitle}</h1>
            </BrandScrollReveal>
          </div>
        </BrandHeroSection>
        <p className='py-24 text-center text-sm text-neutral-500' role='status'>
          {tCommon('title.loading')}
        </p>
      </main>
    );
  }

  const detail = mapMediaToDetailView(data.data.media);

  return (
    <main className='min-w-0 overflow-x-hidden bg-neutral-950 text-white'>
      <BrandHeroSection className='h-80 min-h-80 md:h-[320px]' bottomFadeClassName='h-24' backgroundImageUrl={heroBgUrl}>
        <div className='flex flex-1 flex-col items-center justify-end px-4 pb-16'>
          <BrandScrollReveal variant='fadeUp'>
            <h1 className='text-3xl font-semibold text-white md:text-[48px] md:leading-[60px]'>{heroTitle}</h1>
          </BrandScrollReveal>
        </div>
      </BrandHeroSection>

      <MediaDetailContent detail={detail} />
    </main>
  );
};

export default MediaDetailPage;
