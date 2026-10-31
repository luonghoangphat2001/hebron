import { BrandScrollReveal } from '@/components/brand/BrandScrollReveal';
import { mapBrandProductInquiryPage } from '@/data/pages/brand.service';
import { usePageBySlugQuery } from '@/data/pages/pages.query';
import { BRAND_PRODUCTION_INQUIRY_PAGE_SLUG } from '@/data/pages/pages.request';
import { useIsMobile } from '@/hooks/useIsMobile';
import BrandHeroSection from '@/pages/brand/components/BrandHeroSection';
import BrandMomentSection from '@/pages/brand/components/BrandMomentSection';
import ProductInquiryContentSection from '@/pages/brand/product-inquiry/components/ProductInquiryContentSection';
import ProductInquiryProcessSection from '@/pages/brand/product-inquiry/components/ProductInquiryProcessSection';
import { BRAND_PRODUCT_INQUIRY_PAGE_LABELS } from '@/utils/constants/brand-product-inquiry.constant';
import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

const ProductInquiryPage = () => {
  const isMobile = useIsMobile();
  const [searchParams] = useSearchParams();

  const { data: pageData, isLoading } = usePageBySlugQuery(BRAND_PRODUCTION_INQUIRY_PAGE_SLUG);
  const page = pageData?.data?.page;
  const view = useMemo(() => (page ? mapBrandProductInquiryPage(page) : null), [page]);

  const rawProductId = Number(searchParams.get('product_id') || searchParams.get('productId'));
  const productId = Number.isInteger(rawProductId) && rawProductId > 0 ? rawProductId : undefined;

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
      <BrandHeroSection
        className='h-80 min-h-80 md:h-[320px]'
        bottomFadeClassName='h-24'
        backgroundImageUrl={isMobile ? view?.heroBackgroundImageUrlMB : view?.heroBackgroundImageUrlPC}>
        <div className='flex flex-1 flex-col items-center justify-end px-4 pb-16'>
          <BrandScrollReveal variant='fadeUp'>
            <h1 className='text-3xl font-semibold text-white md:text-[48px] md:leading-[60px]'>
              {view?.heroTitle || BRAND_PRODUCT_INQUIRY_PAGE_LABELS.heroTitle}
            </h1>
          </BrandScrollReveal>
        </div>
      </BrandHeroSection>

      <ProductInquiryProcessSection title={view?.processTitle} subtitle={view?.processSubtitle} steps={view?.processSteps} />
      <ProductInquiryContentSection
        submitLabel={view?.submitLabel}
        imageUpload={view?.imageUpload}
        previewImageUrl={view?.formImageUrl}
        productId={productId}
      />
      <BrandMomentSection data={view?.aboutCta} />
    </main>
  );
};

export default ProductInquiryPage;
