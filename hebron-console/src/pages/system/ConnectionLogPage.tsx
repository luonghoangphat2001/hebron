import PageTitle from '@/components/PageTitle';
import { useAccessLogListQuery } from '@/data/system/system.query';
import {
  getAccessLogListInitFilter,
  transformAccessLogFilterToREQ,
  type AccessLogFilterValues,
} from '@/data/system/system.service';
import { useFilterPaging } from '@/hooks/useFilterPaging';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import ConnectionLogFilter from './components/ConnectionLogFilter';
import ConnectionLogTable from './components/ConnectionLogTable';

const ConnectionLogPage = () => {
  const { t: tSidebar } = useTranslation('sidebar');

  const { filter, pagination, handleFilterChange, onPaginationChange } = useFilterPaging<AccessLogFilterValues>({
    getInitialFilter: getAccessLogListInitFilter,
  });

  const queryParams = useMemo(() => transformAccessLogFilterToREQ(filter), [filter]);
  const { data, isLoading } = useAccessLogListQuery(queryParams);

  return (
    <main className='space-y-6'>
      <PageTitle title={tSidebar('connection_logs')} />
      <ConnectionLogFilter filter={filter} onFilterChange={handleFilterChange} />
      <ConnectionLogTable
        data={data?.data?.access_logs || []}
        totalRows={data?.pagination?.total_item || 0}
        isLoading={isLoading}
        pagination={pagination}
        onPaginationChange={onPaginationChange}
        sortBy={filter.sort_by}
        sortOrder={filter.sort_order}
        onSortChange={(sortBy, sortOrder) => handleFilterChange({ sort_by: sortBy, sort_order: sortOrder })}
      />
    </main>
  );
};

export default ConnectionLogPage;
