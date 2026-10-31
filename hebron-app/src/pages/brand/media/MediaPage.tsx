import { BrandScrollReveal } from '@/components/brand/BrandScrollReveal';
import { mapBrandMediaPage } from '@/data/pages/pages.mapper';
import { usePageBySlugQuery } from '@/data/pages/pages.query';
import { BRAND_MEDIA_PAGE_SLUG } from '@/data/pages/pages.request';
import BrandHeroSection from '@/pages/brand/components/BrandHeroSection';
import BrandMomentSection from '@/pages/brand/components/BrandMomentSection';
import BrandNav from '@/pages/brand/components/BrandNav';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { useIsMobile } from '@/hooks/useIsMobile';
import MediaContentSection from './components/MediaContentSection';

const MediaPage = () => {
  const { t: tCommon } = useTranslation('common');
  const isMobile = useIsMobile();
  const { data: pageData, isLoading } = usePageBySlugQuery(BRAND_MEDIA_PAGE_SLUG);
  const page = pageData?.data?.page;

  const view = useMemo(() => (page ? mapBrandMediaPage(page) : null), [page]);

  if (isLoading) {
    return (
      <main className='min-w-0 overflow-x-hidden bg-neutral-950 text-white'>
        <BrandNav variant='solid' />
        <div className='flex min-h-140 items-center justify-center' role='status'>
          <p className='text-sm text-neutral-500'>{tCommon('title.loading')}</p>
        </div>
      </main>
    );
  }

  return (
    <main className='min-w-0 overflow-x-hidden bg-neutral-950 text-white'>
      <BrandHeroSection
        className='h-80 min-h-80 md:h-80'
        bottomFadeClassName='h-24'
        backgroundImageUrl={isMobile ? view?.heroBackgroundImageUrlMB : view?.heroBackgroundImageUrlPC}>
        <div className='flex flex-1 flex-col items-center justify-end px-4 pb-16'>
          <BrandScrollReveal variant='fadeUp'>
            <h1 className='text-display-md md:text-display-lg font-bold'>{view?.heroTitle}</h1>
          </BrandScrollReveal>
        </div>
      </BrandHeroSection>

      <MediaContentSection />

      <BrandMomentSection data={view?.aboutCta} />
    </main>
  );
};

export default MediaPage;
