import { createFallbackBrandHomeView, mapBrandHomePage } from '@/data/pages/pages.mapper';
import { usePageBySlugQuery } from '@/data/pages/pages.query';
import { BRAND_HOME_PAGE_SLUG } from '@/data/pages/pages.request';
import { useMemo } from 'react';

// import CustomSection from './components/CustomSection';
import HeroSection from './components/HeroSection';
import IntroductionSection from './components/IntroductionSection';
import ManufacturingVideoSection from './components/ManufacturingVideoSection';
import MomentSection from './components/MomentSection';
import PartnerLogoSection from './components/PartnerLogoSection';
import PortfolioPreviewSection from './components/PortfolioPreviewSection';
import PressCoverageSection from './components/PressCoverageSection';
import StatsSection from './components/StatsSection';
import ValueSection from './components/ValueSection';

const HomePage = () => {
  const { data, isLoading } = usePageBySlugQuery(BRAND_HOME_PAGE_SLUG);
  const page = data?.data?.page;

  const view = useMemo(() => (page ? mapBrandHomePage(page) : createFallbackBrandHomeView()), [page]);

  if (isLoading) {
    return (
      <main className='min-w-0 overflow-x-hidden bg-neutral-950'>
        <div className='flex min-h-140 items-center justify-center md:h-225' role='status'>
          <p className='text-sm text-neutral-500'>Loading...</p>
        </div>
      </main>
    );
  }

  return (
    <main className='min-w-0 overflow-x-hidden bg-neutral-950'>
      <HeroSection data={view.hero} />
      <StatsSection items={view.stats} />
      <PartnerLogoSection logos={view.partners} />
      <IntroductionSection data={view.introduction} />
      <ValueSection data={view.values} />
      {/* <CustomSection data={view.customProcess} /> */}
      <PressCoverageSection data={view.press} />
      <ManufacturingVideoSection data={view.manufacturing} />
      <PortfolioPreviewSection data={view.portfolio} />
      <MomentSection data={view.aboutCta} />
    </main>
  );
};

export default HomePage;
