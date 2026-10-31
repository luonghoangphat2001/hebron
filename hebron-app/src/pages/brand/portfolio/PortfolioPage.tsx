import BrandMomentSection from '@/pages/brand/components/BrandMomentSection';
import PortfolioSection from '@/pages/brand/home/components/PortfolioSection';

import { mapBrandPortfolioPage } from '@/data/pages/brand.service';
import { usePageBySlugQuery } from '@/data/pages/pages.query';
import { BRAND_PORTFOLIO_PAGE_SLUG } from '@/data/pages/pages.request';
import { useIsMobile } from '@/hooks/useIsMobile';
import PortfolioContentSection from './components/PortfolioContentSection';
import PortfolioPageLayout from './PortfolioPageLayout';

const PortfolioPage = () => {
  const isMobile = useIsMobile();
  const { data: pageData } = usePageBySlugQuery(BRAND_PORTFOLIO_PAGE_SLUG);
  const page = pageData?.data?.page;
  const view = page ? mapBrandPortfolioPage(page) : undefined;

  return (
    <PortfolioPageLayout
      title={view?.heroTitle}
      backgroundImageUrl={isMobile ? view?.heroBackgroundImageUrlMB : view?.heroBackgroundImageUrlPC}>
      <PortfolioSection showIntro={false} data={view}>
        <PortfolioContentSection />
      </PortfolioSection>
      <BrandMomentSection data={view?.aboutCta} />
    </PortfolioPageLayout>
  );
};

export default PortfolioPage;
