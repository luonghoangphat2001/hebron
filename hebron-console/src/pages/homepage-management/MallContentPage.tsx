import PageTitle from '@/components/PageTitle';
import { usePagesQuery } from '@/data/homepage-management/homepage.query';
import { getSectionTypeLabel, normalizePageSections } from '@/data/homepage-management/homepage.service';
import type { MallSection } from '@/data/homepage-management/homepage.type';
import { INITIAL_MALL_SECTIONS, MALL_PAGE_PARAMS } from '@/utils/constants/homepage.constant';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { HomepageContentSkeleton } from './components/HomepageContentSkeleton';
import HomepageSectionDetailEditor from './components/HomepageSectionDetailEditor';
import HomepageSectionList from './components/HomepageSectionList';

const MallContentPage = () => {
  const { t: tSidebar } = useTranslation('sidebar');
  const { t: tEnum } = useTranslation('enum');

  const { data: pages, isLoading } = usePagesQuery(MALL_PAGE_PARAMS);

  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [overrides, setOverrides] = useState<Record<string, Partial<MallSection>>>({});

  const serverSections = useMemo(() => {
    if (pages && pages.length > 0) {
      const normalized = normalizePageSections(pages[0], tEnum);
      if (normalized.length > 0) {
        return normalized;
      }
    }
    return INITIAL_MALL_SECTIONS.map((sec) => ({
      ...sec,
      name: getSectionTypeLabel(sec.type, tEnum),
    }));
  }, [pages, tEnum]);

  const sections = useMemo(() => {
    return serverSections.map((sec) => ({
      ...sec,
      ...(overrides[sec.id] || {}),
    }));
  }, [serverSections, overrides]);

  const activeSectionId =
    selectedSectionId && sections.some((s) => s.id === selectedSectionId) ? selectedSectionId : sections[0]?.id || '50';

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
      <PageTitle title={`${tSidebar('mall')} - ${tSidebar('home_page_management')}`} />
      {isLoading ? (
        <HomepageContentSkeleton />
      ) : (
        <div className='grid items-start gap-6 lg:grid-cols-12'>
          <HomepageSectionList sections={sections} selectedSectionId={activeSectionId} onSelectSection={setSelectedSectionId} />
          <HomepageSectionDetailEditor
            section={activeSection}
            onUpdateSection={(updated) => updateSection(activeSection.id, updated)}
          />
        </div>
      )}
    </main>
  );
};

export default MallContentPage;
