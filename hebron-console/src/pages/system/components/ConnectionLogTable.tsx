import { DataTable } from '@/components/table/DataTable';
import { TableSortHeader } from '@/components/table/TableSortHeader';
import { Badge } from '@/components/ui/badge';
import type { AccessLogItemRESP } from '@/data/system/system.response';
import { cn } from '@/lib/utils';
import { DATE_FORMAT, DATE_TIME_SHORT_FORMAT } from '@/utils/constants/date.constant';
import { ACCESS_LOG_EVENT_TYPE_BADGE } from '@/utils/constants/system.constant';
import type { SortOrder } from '@/utils/enums/common.enum';
import { AccessLogSortBy } from '@/utils/enums/system.enum';
import { formatDate } from '@/utils/helper/common.helper';
import type { ColumnDef, OnChangeFn, PaginationState } from '@tanstack/react-table';
import { useTranslation } from 'react-i18next';

type ConnectionLogTableProps = {
  data: AccessLogItemRESP[];
  totalRows: number;
  isLoading: boolean;
  pagination: PaginationState;
  onPaginationChange: OnChangeFn<PaginationState>;
  sortBy?: AccessLogSortBy | string;
  sortOrder?: SortOrder;
  onSortChange?: (sortBy?: AccessLogSortBy | string, sortOrder?: SortOrder) => void;
};

const ConnectionLogTable = ({
  data,
  totalRows,
  isLoading,
  pagination,
  onPaginationChange,
  sortBy,
  sortOrder,
  onSortChange,
}: ConnectionLogTableProps) => {
  const { t: tSystem } = useTranslation('system');
  const { t: tEnum } = useTranslation('enum');

  const columns: ColumnDef<AccessLogItemRESP>[] = [
    {
      id: 'no',
      header: tSystem('connection_log.column.no'),
      cell: ({ row }) => pagination.pageIndex * pagination.pageSize + row.index + 1,
      meta: { align: 'center', width: '60px' },
    },
    {
      id: 'login_id',
      header: () => (
        <TableSortHeader
          label={tSystem('connection_log.column.login_id', 'Login ID')}
          column={AccessLogSortBy.LOGIN_ID}
          currentSortBy={sortBy}
          currentSortOrder={sortOrder}
          onSortChange={onSortChange}
        />
      ),
      cell: ({ row }) => {
        const loginId = row.original.login_id || row.original.user?.username || '-';
        const name = row.original.username || row.original.user?.name;

        return (
          <div className='flex flex-col space-y-0.5'>
            <span className='text-foreground font-semibold'>{loginId}</span>
            {name && <span className='text-muted-foreground text-xs'>{name}</span>}
          </div>
        );
      },
      meta: { width: '160px' },
    },
    {
      id: 'ip_address',
      header: () => (
        <TableSortHeader
          label={tSystem('connection_log.column.connection_ip', 'Connection IP')}
          column={AccessLogSortBy.IP_ADDRESS}
          currentSortBy={sortBy}
          currentSortOrder={sortOrder}
          onSortChange={onSortChange}
        />
      ),
      cell: ({ row }) => <span className='font-mono text-xs'>{row.original.ip_address || '-'}</span>,
      meta: { width: '150px' },
    },
    {
      id: 'connection_time',
      header: () => (
        <TableSortHeader
          label={tSystem('connection_log.column.connection_time', 'Connection Time')}
          column={AccessLogSortBy.CONNECTION_TIME}
          currentSortBy={sortBy}
          currentSortOrder={sortOrder}
          onSortChange={onSortChange}
        />
      ),
      cell: ({ row }) => (
        <span className='text-foreground text-xs font-medium'>
          {formatDate(row.original.connection_time || row.original.created_at, DATE_TIME_SHORT_FORMAT)}
        </span>
      ),
      meta: { width: '180px' },
    },
    {
      id: 'access_date',
      header: () => (
        <TableSortHeader
          label={tSystem('connection_log.column.access_date', 'Access Date')}
          column={AccessLogSortBy.ACCESS_DATE}
          currentSortBy={sortBy}
          currentSortOrder={sortOrder}
          onSortChange={onSortChange}
        />
      ),
      cell: ({ row }) => (
        <span className='text-foreground text-xs'>
          {row.original.access_date || formatDate(row.original.connection_time || row.original.created_at, DATE_FORMAT)}
        </span>
      ),
      meta: { width: '130px' },
    },
    {
      id: 'browser_info',
      header: tSystem('connection_log.column.browser_information', 'Browser Information'),
      cell: ({ row }) => {
        const rawUa = row.original.browser_info || row.original.user_agent || '-';
        return (
          <span className='text-xs leading-normal [overflow-wrap:anywhere] break-all whitespace-normal text-slate-700 dark:text-slate-300'>
            {rawUa}
          </span>
        );
      },
      meta: { width: '320px' },
    },
    {
      id: 'event_type',
      header: tSystem('connection_log.column.detection_result', 'Detection Result'),
      cell: ({ row }) => {
        const typeKey = row.original.event_type || '';
        const badgeStyle = ACCESS_LOG_EVENT_TYPE_BADGE[typeKey] || 'bg-gray-100 text-gray-700 rounded-sm';
        const attempts = row.original.attempt_count;

        return (
          <div className='flex items-center justify-center gap-1.5'>
            <Badge className={cn(badgeStyle)}>{tEnum(`system.${typeKey.toUpperCase()}`, typeKey)}</Badge>
            {attempts && <span className='text-muted-foreground text-[11px] font-medium'>({attempts})</span>}
          </div>
        );
      },
      meta: { align: 'center', width: '140px' },
    },
  ];

  return (
    <DataTable
      data={data}
      columns={columns}
      totalRows={totalRows}
      isLoading={isLoading}
      pagination={pagination}
      onPaginationChange={onPaginationChange}
      pageSizeOptions={[10, 20, 50]}
      getRowId={(row) => row.id.toString()}
      emptyMessage={tSystem('connection_log.empty')}
    />
  );
};

export default ConnectionLogTable;
