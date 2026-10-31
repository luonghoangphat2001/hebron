import { BrandScrollReveal } from '@/components/brand/BrandScrollReveal';
import { mapBrandContactPage } from '@/data/pages/brand.service';
import { usePageBySlugQuery } from '@/data/pages/pages.query';
import { BRAND_CONTACT_PAGE_SLUG } from '@/data/pages/pages.request';
import { useIsMobile } from '@/hooks/useIsMobile';
import BrandHeroSection from '@/pages/brand/components/BrandHeroSection';
import BrandMomentSection from '@/pages/brand/components/BrandMomentSection';
import BrandNav from '@/pages/brand/components/BrandNav';
import ContactForm from '@/pages/brand/contact/components/ContactForm';
import KakaoMap from '@/pages/brand/contact/components/KakaoMap';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

const ContactPage = () => {
  const isMobile = useIsMobile();
  const { t: tCommon } = useTranslation('common');
  const { data: pageData, isLoading } = usePageBySlugQuery(BRAND_CONTACT_PAGE_SLUG);
  const page = pageData?.data?.page;

  const view = useMemo(() => (page ? mapBrandContactPage(page) : null), [page]);

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
        className='h-80 min-h-80 md:h-[320px]'
        bottomFadeClassName='h-24'
        backgroundImageUrl={isMobile ? view?.hero?.backgroundImageUrlMB : view?.hero?.backgroundImageUrlPC}>
        <div className='flex flex-1 flex-col items-center justify-end px-4 pb-16'>
          <BrandScrollReveal variant='fadeUp'>
            <h1 className='text-3xl font-semibold text-white md:text-[48px] md:leading-[60px]'>
              {view?.hero?.title || view?.title || '문의하기'}
            </h1>
          </BrandScrollReveal>
        </div>
      </BrandHeroSection>

      <section className='mx-auto flex w-full max-w-7xl flex-col gap-10 px-4 py-10 md:py-16'>
        <div className='flex flex-col gap-10 lg:flex-row lg:gap-10'>
          <BrandScrollReveal className='h-131.75 w-full lg:h-240 lg:w-156 lg:shrink-0' variant='slideRight'>
            <KakaoMap
              className='size-full'
              address={view?.information?.address}
              latitude={view?.information?.latitude}
              longitude={view?.information?.longitude}
              mapImageUrl={view?.information?.mapImageUrl}
            />
          </BrandScrollReveal>
          <BrandScrollReveal className='min-w-0 flex-1' variant='slideLeft' delay={0.1}>
            <ContactForm submitLabel={view?.form?.submitLabel} />
          </BrandScrollReveal>
        </div>
      </section>

      <BrandMomentSection data={view?.aboutCta} />
    </main>
  );
};

export default ContactPage;
