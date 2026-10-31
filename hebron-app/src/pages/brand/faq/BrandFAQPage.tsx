import { BrandScrollReveal } from '@/components/brand/BrandScrollReveal';
import { useBrandFaqsQuery } from '@/data/faqs/faqs.query';
import { mapBrandFaqsPage } from '@/data/pages/brand.service';
import { usePageBySlugQuery } from '@/data/pages/pages.query';
import { BRAND_FAQS_PAGE_SLUG } from '@/data/pages/pages.request';
import { useIsMobile } from '@/hooks/useIsMobile';
import { cn } from '@/lib/utils';
import BrandHeroSection from '@/pages/brand/components/BrandHeroSection';
import BrandMomentSection from '@/pages/brand/components/BrandMomentSection';
import BrandFAQAccordionItem from '@/pages/brand/faq/components/BrandFAQAccordionItem';
import BrandFAQAccordionSkeleton from '@/pages/brand/faq/components/BrandFAQAccordionSkeleton';
import { BRAND_FAQ_FILTERS, BRAND_FAQ_LIST_PAGE_SIZE, BRAND_FAQ_PAGE_LABELS } from '@/utils/constants/brand-faq.constant';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

const ALL_FILTER_KEY = 'ALL';

const BrandFAQPage = () => {
  const { t: tEnum } = useTranslation('enum');
  const { data: pageData } = usePageBySlugQuery(BRAND_FAQS_PAGE_SLUG);
  const isMobile = useIsMobile();
  const page = pageData?.data?.page;
  const view = useMemo(() => (page ? mapBrandFaqsPage(page) : null), [page]);

  const [activeFilter, setActiveFilter] = useState<string>(ALL_FILTER_KEY);

  const listParams = useMemo(
    () => ({
      page: 1,
      per_page: BRAND_FAQ_LIST_PAGE_SIZE,
      category: activeFilter === ALL_FILTER_KEY ? undefined : activeFilter,
    }),
    [activeFilter],
  );

  const { data, isLoading, isFetching } = useBrandFaqsQuery(listParams);

  const items = data?.data.faqs ?? [];
  const isListLoading = isLoading || isFetching;

  const filterTabs = useMemo(
    () => [
      { key: ALL_FILTER_KEY, label: '전체', icon: BRAND_FAQ_FILTERS[4]?.icon },
      ...BRAND_FAQ_FILTERS.map((filter) => ({
        key: filter.key,
        label: tEnum(`faq_category.${filter.key}`),
        icon: filter.icon,
      })),
    ],
    [tEnum],
  );

  return (
    <main className='min-w-0 overflow-x-hidden bg-neutral-950 text-white'>
      <BrandHeroSection
        className='h-80 min-h-80 md:h-[320px]'
        bottomFadeClassName='h-24'
        backgroundImageUrl={isMobile ? view?.heroBackgroundImageUrlMB : view?.heroBackgroundImageUrlPC}>
        <div className='flex flex-1 flex-col items-center justify-end px-4 pb-16'>
          <BrandScrollReveal variant='fadeUp'>
            <h1 className='text-3xl font-semibold text-white md:text-[48px] md:leading-[60px]'>
              {view?.heroTitle || BRAND_FAQ_PAGE_LABELS.title}
            </h1>
          </BrandScrollReveal>
        </div>
      </BrandHeroSection>

      <section className='mx-auto flex w-full max-w-4xl flex-col gap-5 px-4 py-10 md:py-14'>
        <div className='flex flex-wrap items-center gap-2'>
          {filterTabs.map((filter) => {
            const isActive = activeFilter === filter.key;
            return (
              <button
                key={filter.key}
                type='button'
                onClick={() => setActiveFilter(filter.key)}
                className={cn(
                  'inline-flex h-8 items-center gap-1.5 rounded-full border px-3 text-xs font-medium transition-colors',
                  isActive
                    ? 'cursor-default border-neutral-300 bg-transparent text-white'
                    : 'cursor-pointer border-neutral-700 bg-transparent text-neutral-400 hover:border-neutral-500 hover:text-neutral-200',
                )}>
                {filter.icon ? (
                  <img
                    src={filter.icon}
                    alt=''
                    aria-hidden
                    className={cn('size-4', isActive ? 'brightness-0 invert' : 'opacity-70')}
                  />
                ) : null}
                <span>{filter.label}</span>
              </button>
            );
          })}
        </div>

        <div className='overflow-hidden rounded-lg border border-neutral-800 bg-neutral-950 px-4'>
          {isListLoading && <BrandFAQAccordionSkeleton count={5} />}

          {!isListLoading && items.length === 0 && (
            <p className='py-8 text-center text-sm text-neutral-500' role='status'>
              {BRAND_FAQ_PAGE_LABELS.empty}
            </p>
          )}

          {!isListLoading &&
            items.map((item, index) => <BrandFAQAccordionItem key={item.id} item={item} defaultOpen={index === 0} />)}
        </div>
      </section>

      <BrandMomentSection data={view?.aboutCta} />
    </main>
  );
};

export default BrandFAQPage;
