import PageTitle from '@/components/PageTitle';
import { useMesIntegrationStatusQuery, useMesLogListQuery } from '@/data/mes/mes.query';
import type { MesLogListREQ } from '@/data/mes/mes.request';
import { getMesLogListInitFilter } from '@/data/mes/mes.service';
import { useFilterPaging } from '@/hooks/useFilterPaging';
import { useTranslation } from 'react-i18next';
import MesConnectionSettings from './components/MesConnectionSettings';
import MesLogFilter from './components/MesLogFilter';
import MesLogTable from './components/MesLogTable';
import MesStatusCards from './components/MesStatusCards';

const SectionTitle = ({ title }: { title: string }) => <h3 className='text-lg font-semibold text-gray-900'>{title}</h3>;

const MesMonitoringPage = () => {
  const { t: tSidebar } = useTranslation('sidebar');
  const { t: tMes } = useTranslation('mes');

  const { filter, pagination, handleFilterChange, onPaginationChange } = useFilterPaging<MesLogListREQ>({
    getInitialFilter: getMesLogListInitFilter,
  });

  const { data: status } = useMesIntegrationStatusQuery();
  const { data: logData, isLoading: isLogLoading } = useMesLogListQuery(filter);

  return (
    <main className='space-y-6'>
      <PageTitle title={tSidebar('mes_monitoring')} />
      <div className='text-muted-foreground -mt-4 text-sm'>{tMes('page.description')}</div>

      {/* 1. Integration Status Dashboard */}
      <section className='space-y-3'>
        <SectionTitle title={tMes('dashboard.title')} />
        {status && <MesStatusCards data={status} />}
      </section>

      {/* 2. Integration Log */}
      <section className='space-y-3'>
        <SectionTitle title={tMes('log.title')} />
        <MesLogFilter filter={filter} handleFilterChange={handleFilterChange} />
        <MesLogTable
          data={logData?.list || []}
          isLoading={isLogLoading}
          totalRows={logData?.pagination?.total_item || 0}
          pagination={pagination}
          onPaginationChange={onPaginationChange}
        />
      </section>

      {/* 3. MES Integration Connection Settings */}
      <section className='space-y-3'>
        <SectionTitle title={tMes('connection_settings.title')} />
        <MesConnectionSettings />
      </section>
    </main>
  );
};

export default MesMonitoringPage;
