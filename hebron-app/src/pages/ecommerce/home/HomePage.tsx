import {
  mapCategoryShortcuts,
  mapCustomerCenter,
  mapFooterQuickLinksOrderMethodImage,
  mapHeroBannerSection,
  mapHomeImageBanners,
  mapMallFaqSection,
  mapMallInPressSection,
  mapPopularSection,
  mapRecommendSection,
  mapSteadySellerSection,
} from '@/data/pages/home-mall.service';
import { usePageBySlugQuery } from '@/data/pages/pages.query';
import { SiteType } from '@/utils/enums/common.enum';
import { useMemo } from 'react';
import BannerCarousel from './components/BannerCarousel';
import CategorySection from './components/CategorySection';
import CustomerServiceCenter from './components/CustomerServiceCenter';
import FaqSection from './components/FaqSection';
import HomeCtaSection from './components/HomeCtaSection';
import HomeImageBanners from './components/HomeImageBanners';
import HomePageLoadingSkeleton from './components/HomePageLoadingSkeleton';
import InPressSection from './components/InPressSection';
import PopularSection from './components/PopularSection';
import RecommendSection from './components/RecommendSection';
import SteadySellerSection from './components/SteadySellerSection';

const HomePage = () => {
  const { data: pageData, isLoading } = usePageBySlugQuery('home', { site_type: SiteType.SHOPPING_MALL });
  const page = pageData?.data?.page;

  const heroData = useMemo(() => mapHeroBannerSection(page), [page]);
  const shortcuts = useMemo(() => mapCategoryShortcuts(page), [page]);
  const recommendData = useMemo(() => mapRecommendSection(page), [page]);
  const pressData = useMemo(() => mapMallInPressSection(page), [page]);
  const imageBanners = useMemo(() => {
    const cmsBanners = mapHomeImageBanners(page);
    if (cmsBanners.length > 0) return cmsBanners;

    return heroData.banners.map((b, idx) => ({
      id: b.id ?? `hero-banner-${idx + 1}`,
      imageUrl: b.image_url || '',
      linkUrl: b.link_url,
      alt: b.title,
    }));
  }, [page, heroData.banners]);
  const popularData = useMemo(() => mapPopularSection(page), [page]);
  const steadySellerData = useMemo(() => mapSteadySellerSection(page), [page]);
  const faqData = useMemo(() => mapMallFaqSection(page), [page]);
  const customerCenterData = useMemo(() => mapCustomerCenter(page), [page]);
  const orderMethodImage = useMemo(() => mapFooterQuickLinksOrderMethodImage(page), [page]);

  if (isLoading) return <HomePageLoadingSkeleton />;

  return (
    <div className='w-full'>
      <BannerCarousel
        banners={heroData.banners}
        autoplay={heroData.autoplay}
        autoplayInterval={heroData.autoplayInterval}
        siteType={SiteType.SHOPPING_MALL}
        isLoading={isLoading}
      />
      <div className='ecommerce-container'>
        <CategorySection shortcuts={shortcuts} />
      </div>
      <div className='ecommerce-container space-y-8 pt-6 pb-12 md:space-y-22 md:pt-15 md:pb-30'>
        <RecommendSection data={recommendData} />
        <InPressSection data={pressData} />
        <HomeImageBanners banners={imageBanners} />
        <SteadySellerSection data={steadySellerData} />
        <PopularSection data={popularData} />
        <div className='grid grid-cols-1 gap-10 md:grid-cols-2'>
          <FaqSection data={faqData} />
          <CustomerServiceCenter data={customerCenterData} />
        </div>
        <HomeCtaSection orderMethodImage={orderMethodImage} />
      </div>
    </div>
  );
};

export default HomePage;
