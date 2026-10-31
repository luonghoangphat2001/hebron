import PageTitle from '@/components/PageTitle';
import { useAboutCtaListQuery } from '@/data/cta/cta.query';
import type { AboutCTA } from '@/data/cta/cta.response';
import type { PaginationState } from '@tanstack/react-table';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import CtaTable from './components/CtaTable';
import CtaUpsertModal, { type CtaUpsertMode } from './components/CtaUpsertModal';

const CtaPage = () => {
  const { t: tSidebar } = useTranslation('sidebar');

  const [modal, setModal] = useState<{ cta: AboutCTA; mode: CtaUpsertMode } | null>(null);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const { data = [], isLoading } = useAboutCtaListQuery();

  return (
    <main className='space-y-6'>
      <PageTitle title={tSidebar('cta_management')} />
      <CtaTable
        data={data}
        isLoading={isLoading}
        onView={(cta) => setModal({ cta, mode: 'view' })}
        onEdit={(cta) => setModal({ cta, mode: 'edit' })}
        pagination={pagination}
        onPaginationChange={setPagination}
      />
      <CtaUpsertModal
        open={Boolean(modal)}
        setOpen={(open) => !open && setModal(null)}
        siteType={modal?.cta?.site_type || null}
        cta={modal?.cta}
        mode={modal?.mode || 'edit'}
      />
    </main>
  );
};

export default CtaPage;
