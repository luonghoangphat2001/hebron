import PageTitle from '@/components/PageTitle';
import { usePagesQuery } from '@/data/homepage-management/homepage.query';
import { resolveVendorPageSections } from '@/data/homepage-management/homepage.service';
import type { MallSection } from '@/data/homepage-management/homepage.type';
import { VENDOR_PAGE_PARAMS } from '@/utils/constants/homepage.constant';
import { PageType, SiteType } from '@/utils/enums/homepage.enum';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { HomepageContentSkeleton } from './components/HomepageContentSkeleton';
import HomepageSectionDetailEditor from './components/HomepageSectionDetailEditor';
import HomepageSectionList from './components/HomepageSectionList';

const VendorContentPage = () => {
  const { t: tSidebar } = useTranslation('sidebar');
  const { t: tEnum } = useTranslation('enum');

  const { data: pages, isLoading } = usePagesQuery(VENDOR_PAGE_PARAMS);

  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [overrides, setOverrides] = useState<Record<string, Partial<MallSection>>>({});

  const serverSections = useMemo(() => resolveVendorPageSections(pages, tEnum), [pages, tEnum]);

  const sections = useMemo(() => {
    return serverSections.map((sec) => ({
      ...sec,
      ...(overrides[sec.id] || {}),
    }));
  }, [serverSections, overrides]);

  const activeSectionId =
    selectedSectionId && sections.some((s) => s.id === selectedSectionId) ? selectedSectionId : sections[0]?.id || '48';

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

  return (
    <main className='space-y-6'>
      <PageTitle title={`${tSidebar('vendor')} - ${tSidebar('home_page_management')}`} />
      {isLoading ? (
        <HomepageContentSkeleton />
      ) : (
        <div className='grid items-start gap-6 lg:grid-cols-12'>
          <HomepageSectionList sections={sections} selectedSectionId={activeSectionId} onSelectSection={setSelectedSectionId} />
          {activeSection && (
            <HomepageSectionDetailEditor
              section={activeSection}
              siteType={SiteType.PLAIN_SITE}
              pageType={PageType.HOME_PAGE}
              onUpdateSection={(updated) => updateSection(activeSection.id, updated)}
            />
          )}
        </div>
      )}
    </main>
  );
};

export default VendorContentPage;
