import { mapBrandStoryPage } from '@/data/pages/pages.mapper';
import { usePageBySlugQuery } from '@/data/pages/pages.query';
import { BRAND_STORY_PAGE_SLUG } from '@/data/pages/pages.request';
import BrandPageCompanyIntroSection from '@/pages/brand/brand-page/components/BrandPageCompanyIntroSection';
import BrandPageCoreValuesSection from '@/pages/brand/brand-page/components/BrandPageCoreValuesSection';
import BrandPageHeroSection from '@/pages/brand/brand-page/components/BrandPageHeroSection';
import BrandPageHistorySection from '@/pages/brand/brand-page/components/BrandPageHistorySection';
import { useMemo } from 'react';

const BrandPage = () => {
  const { data: pageData, isLoading } = usePageBySlugQuery(BRAND_STORY_PAGE_SLUG);
  const page = pageData?.data?.page;

  const view = useMemo(() => (page ? mapBrandStoryPage(page) : undefined), [page]);

  if (isLoading) {
    return (
      <main className='min-w-0 overflow-x-hidden bg-neutral-950 text-white'>
        <div className='flex min-h-140 items-center justify-center' role='status'>
          <p className='text-sm text-neutral-500'>Loading...</p>
        </div>
      </main>
    );
  }

  return (
    <main className='min-w-0 overflow-x-hidden bg-neutral-950 text-white'>
      <BrandPageHeroSection data={view?.hero} />
      <BrandPageCompanyIntroSection data={view?.companyIntro} />
      <BrandPageCoreValuesSection data={view?.identity} />
      <BrandPageHistorySection data={view?.history} />
    </main>
  );
};

export default BrandPage;
