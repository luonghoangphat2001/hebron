import { BrandScrollReveal } from '@/components/brand/BrandScrollReveal';
import { mapBrandProcessPage } from '@/data/pages/pages.mapper';
import { usePageBySlugQuery } from '@/data/pages/pages.query';
import { BRAND_PROCESS_PAGE_SLUG } from '@/data/pages/pages.request';
import { useIsMobile } from '@/hooks/useIsMobile';
import BrandHeroSection from '@/pages/brand/components/BrandHeroSection';
import BrandMomentSection from '@/pages/brand/components/BrandMomentSection';
import BrandNav from '@/pages/brand/components/BrandNav';
import ProcessStepsSection from '@/pages/brand/process/components/ProcessStepsSection';
import { useEffect, useMemo, useState } from 'react';

const ProcessPage = () => {
  const isMobile = useIsMobile();
  const { data: pageData, isLoading } = usePageBySlugQuery(BRAND_PROCESS_PAGE_SLUG);
  const [activeId, setActiveId] = useState<string>('');

  const view = useMemo(() => {
    const page = pageData?.data?.page;
    return page ? mapBrandProcessPage(page) : null;
  }, [pageData?.data?.page]);

  const currentActiveId = activeId && view?.steps.some((step) => step.id === activeId) ? activeId : (view?.steps[0]?.id ?? '');

  useEffect(() => {
    const steps = view?.steps;
    if (!steps || steps.length <= 1) return;

    const timer = setInterval(() => {
      const idx = steps.findIndex((s) => s.id === currentActiveId);
      setActiveId(steps[(idx + 1) % steps.length].id);
    }, 3000);

    return () => clearInterval(timer);
  }, [view?.steps, currentActiveId]);

  useEffect(() => {
    if (!view) return;

    view.steps
      .map((s) => s.image)
      .forEach((src) => {
        if (src) new Image().src = src;
      });
  }, [view]);

  if (isLoading) {
    return (
      <main className='min-w-0 overflow-x-hidden bg-neutral-950 text-white'>
        <BrandNav variant='solid' />
        <div className='flex min-h-140 items-center justify-center' role='status'>
          <p className='text-sm text-neutral-500'>Loading...</p>
        </div>
      </main>
    );
  }

  if (!view) {
    return (
      <main className='min-w-0 overflow-x-hidden bg-neutral-950 text-white'>
        <BrandNav variant='solid' />
      </main>
    );
  }

  return (
    <main className='min-w-0 overflow-x-hidden bg-neutral-950 text-white'>
      <BrandHeroSection
        className='h-80 min-h-80 md:h-[320px]'
        bottomFadeClassName='h-24'
        backgroundImageUrl={isMobile ? view.heroBackgroundImageUrlMB : view.heroBackgroundImageUrlPC}>
        <div className='flex flex-1 flex-col items-center justify-end px-4 pb-16'>
          <BrandScrollReveal variant='fadeUp'>
            <h1 className='text-3xl font-semibold text-white md:text-[48px] md:leading-[60px]'>
              {view.heroTitle || view.title || '공정'}
            </h1>
          </BrandScrollReveal>
        </div>
      </BrandHeroSection>

      <section className='flex w-full flex-col items-center justify-center gap-10 px-0 py-10 md:gap-14 md:px-4 md:py-16'>
        <ProcessStepsSection steps={view.steps} activeId={currentActiveId} onSelect={setActiveId} />
      </section>

      <BrandMomentSection data={view.aboutCta} />
    </main>
  );
};

export default ProcessPage;
