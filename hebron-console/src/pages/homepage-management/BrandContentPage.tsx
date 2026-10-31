import PageTitle from '@/components/PageTitle';
import { usePagesQuery } from '@/data/homepage-management/homepage.query';
import type { PageListREQ } from '@/data/homepage-management/homepage.request';
import { mapUrlParamToPageType, resolveBrandPageSections } from '@/data/homepage-management/homepage.service';
import type { MallSection } from '@/data/homepage-management/homepage.type';
import { PageType, SiteType } from '@/utils/enums/homepage.enum';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { HomepageContentSkeleton } from './components/HomepageContentSkeleton';
import HomepageSectionDetailEditor from './components/HomepageSectionDetailEditor';
import HomepageSectionList from './components/HomepageSectionList';

type InnerProps = {
  currentPageType: PageType;
};

const brandPageTitleKeys: Partial<Record<PageType, string>> = {
  [PageType.HOME_PAGE]: 'brand_home',
  [PageType.BRAND_STORY]: 'brand_story',
  [PageType.STANDARD_PRODUCTS]: 'brand_products',
  [PageType.PROCESS]: 'brand_process',
  [PageType.MEDIA]: 'brand_media',
  [PageType.CONTACT_US]: 'brand_contact',
  [PageType.PORTFOLIO]: 'brand_portfolio',
  [PageType.PRODUCTION_INQUIRY]: 'brand_inquiry',
};

const BrandContentPageInner: React.FC<InnerProps> = ({ currentPageType }) => {
  const { t: tSidebar } = useTranslation('sidebar');
  const { t: tEnum } = useTranslation('enum');

  const brandPageParams: PageListREQ = useMemo(
    () => ({
      site_type: SiteType.BRAND_SITE,
      page_type: currentPageType,
    }),
    [currentPageType],
  );

  const { data: pages, isLoading } = usePagesQuery(brandPageParams);

  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [overrides, setOverrides] = useState<Record<string, Partial<MallSection>>>({});

  const serverSections = useMemo(() => resolveBrandPageSections(pages, currentPageType, tEnum), [pages, currentPageType, tEnum]);

  const sections = useMemo(
    () =>
      serverSections.map((sec) => ({
        ...sec,
        ...(overrides[sec.id] || {}),
      })),
    [serverSections, overrides],
  );

  const activeSectionId =
    selectedSectionId && sections.some((s) => s.id === selectedSectionId) ? selectedSectionId : sections[0]?.id;

  const activeSection = sections.find((s) => s.id === activeSectionId) || sections[0];

  const updateSection = (id: string, updated: Partial<MallSection>) => {
    setOverrides((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        ...updated,
      },
    }));
  };

  const pageTitleSuffix = tSidebar(brandPageTitleKeys[currentPageType] || ('brand' as any));

  return (
    <main className='space-y-6'>
      <PageTitle title={`${tSidebar('brand')} - ${pageTitleSuffix}`} />
      {isLoading ? (
        <HomepageContentSkeleton />
      ) : (
        <div className='grid items-start gap-6 lg:grid-cols-12'>
          <HomepageSectionList sections={sections} selectedSectionId={activeSectionId} onSelectSection={setSelectedSectionId} />
          {activeSection && (
            <HomepageSectionDetailEditor
              section={activeSection}
              siteType={SiteType.BRAND_SITE}
              pageType={currentPageType}
              onUpdateSection={(updated) => updateSection(activeSection.id, updated)}
            />
          )}
        </div>
      )}
    </main>
  );
};

const BrandContentPage = () => {
  const { pageType: rawPageType } = useParams<{ pageType?: string }>();
  const currentPageType = useMemo(() => mapUrlParamToPageType(rawPageType), [rawPageType]);

  return <BrandContentPageInner key={currentPageType} currentPageType={currentPageType} />;
};

export default BrandContentPage;
