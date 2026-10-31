import { DataTable } from '@/components/table/DataTable';
import { TableSortHeader } from '@/components/table/TableSortHeader';
import { Badge } from '@/components/ui/badge';
import type { TaskLogItemRESP } from '@/data/system/system.response';
import { parseTaskLogChanges } from '@/data/system/system.service';
import { cn } from '@/lib/utils';
import { OPERATION_LOG_ACTION_BADGE } from '@/utils/constants/system.constant';
import type { SortOrder } from '@/utils/enums/common.enum';
import { TaskLogSortBy } from '@/utils/enums/system.enum';
import type { ColumnDef, OnChangeFn, PaginationState } from '@tanstack/react-table';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { OperationLogDetailModal } from './OperationLogDetailModal';

const DateTimeCell = ({ value }: { value: string }) => {
  if (!value) return <span>-</span>;
  const parts = value.split('T');
  const date = parts[0] || value;
  const time = parts[1] ? parts[1].split('.')[0] : '';
  return (
    <div className='space-y-0.5 text-center'>
      {time && <p className='font-medium'>{time}</p>}
      <p className='text-muted-foreground text-xs'>{date}</p>
    </div>
  );
};

const ValuePreview = ({ val, variant }: { val?: string; variant: 'before' | 'after' }) => {
  if (!val || val === '-') return <span className='text-muted-foreground'>-</span>;
  const isBefore = variant === 'before';
  const trimmed = val.trim();
  const isJson = val.includes('\n') && (trimmed.startsWith('{') || trimmed.startsWith('['));

  if (isJson) {
    return (
      <pre
        className={cn(
          'my-0.5 max-h-24 max-w-[300px] overflow-auto rounded-md border p-1.5 font-mono text-[10px] leading-relaxed font-normal whitespace-pre shadow-xs',
          isBefore
            ? 'border-red-200/80 bg-red-50/60 text-red-600 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300'
            : 'border-green-200/80 bg-green-50/60 text-green-700 dark:border-green-900/50 dark:bg-green-950/30 dark:text-green-300',
        )}>
        {val}
      </pre>
    );
  }

  return <span className={cn(isBefore ? 'text-muted-foreground line-through' : 'font-medium text-green-600')}>{val}</span>;
};

const BeforeChangeCell = ({ item, onOpenDetail }: { item: TaskLogItemRESP; onOpenDetail: (item: TaskLogItemRESP) => void }) => {
  const { t: tSystem } = useTranslation('system');
  const { i18n } = useTranslation();

  const parsedChanges = useMemo(() => parseTaskLogChanges(item, i18n.language), [item, i18n.language]);

  if (parsedChanges.length === 0) return <span className='text-muted-foreground text-xs'>-</span>;

  const displayChanges = parsedChanges.slice(0, 3);
  const remainingCount = parsedChanges.length - 3;

  return (
    <div className='space-y-1 py-1'>
      {displayChanges.map((c, i) => (
        <div key={i} className='text-xs' title={`${c.fieldLabel}: ${c.beforeVal || '-'}`}>
          <span className='text-muted-foreground me-1 font-medium'>{c.fieldLabel}:</span>
          <ValuePreview val={c.beforeVal} variant='before' />
        </div>
      ))}
      {remainingCount > 0 && (
        <button
          type='button'
          onClick={(e) => {
            e.stopPropagation();
            onOpenDetail(item);
          }}
          className='text-primary mt-0.5 flex cursor-pointer items-center gap-1 text-[11px] font-semibold hover:underline'>
          {tSystem('operation_log.more_items', { count: remainingCount, defaultValue: `+${remainingCount} more...` })}
        </button>
      )}
    </div>
  );
};

const AfterChangeCell = ({ item, onOpenDetail }: { item: TaskLogItemRESP; onOpenDetail: (item: TaskLogItemRESP) => void }) => {
  const { t: tSystem } = useTranslation('system');
  const { i18n } = useTranslation();

  const parsedChanges = useMemo(() => parseTaskLogChanges(item, i18n.language), [item, i18n.language]);

  if (parsedChanges.length === 0) return <span className='text-muted-foreground text-xs'>-</span>;

  const displayChanges = parsedChanges.slice(0, 3);
  const remainingCount = parsedChanges.length - 3;

  return (
    <div className='space-y-1 py-1'>
      {displayChanges.map((c, i) => (
        <div key={i} className='text-xs' title={`${c.fieldLabel}: ${c.afterVal || '-'}`}>
          <span className='text-muted-foreground me-1 font-medium'>{c.fieldLabel}:</span>
          <ValuePreview val={c.afterVal} variant='after' />
        </div>
      ))}
      {remainingCount > 0 && (
        <button
          type='button'
          onClick={(e) => {
            e.stopPropagation();
            onOpenDetail(item);
          }}
          className='text-primary mt-0.5 flex cursor-pointer items-center gap-1 text-[11px] font-semibold hover:underline'>
          {tSystem('operation_log.more_items', { count: remainingCount, defaultValue: `+${remainingCount} more...` })}
        </button>
      )}
    </div>
  );
};

type OperationLogTableProps = {
  data: TaskLogItemRESP[];
  totalRows: number;
  isLoading: boolean;
  pagination: PaginationState;
  onPaginationChange: OnChangeFn<PaginationState>;
  sortBy?: TaskLogSortBy | string;
  sortOrder?: SortOrder;
  onSortChange?: (sortBy?: TaskLogSortBy, sortOrder?: SortOrder) => void;
};

const OperationLogTable = ({
  data,
  totalRows,
  isLoading,
  pagination,
  onPaginationChange,
  sortBy,
  sortOrder,
  onSortChange,
}: OperationLogTableProps) => {
  const { t: tSystem } = useTranslation('system');
  const { t: tEnum } = useTranslation('enum');

  const [selectedItem, setSelectedItem] = useState<TaskLogItemRESP | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const handleOpenDetail = (item: TaskLogItemRESP) => {
    setSelectedItem(item);
    setIsDetailOpen(true);
  };

  const columns: ColumnDef<TaskLogItemRESP>[] = [
    {
      header: tSystem('operation_log.column.no'),
      cell: ({ row }) => pagination.pageIndex * pagination.pageSize + row.index + 1,
      meta: { align: 'center', width: '60px' },
    },
    {
      accessorKey: 'menu',
      header: () => (
        <TableSortHeader
          label={tSystem('operation_log.column.target_menu')}
          column={TaskLogSortBy.MENU}
          currentSortBy={sortBy}
          currentSortOrder={sortOrder}
          onSortChange={onSortChange}
        />
      ),
      cell: ({ row }) => {
        const menuVal = row.original.target_menu || row.original.menu || '-';
        return (
          <div className='flex flex-col'>
            <span>{tEnum(`system.${menuVal}`, menuVal)}</span>
            <span className='text-xs text-gray-500'>ID: {row.original.data_identifier}</span>
          </div>
        );
      },
      meta: { width: '160px' },
    },
    {
      header: tSystem('operation_log.column.before_change'),
      cell: ({ row }) => <BeforeChangeCell item={row.original} onOpenDetail={handleOpenDetail} />,
    },
    {
      header: tSystem('operation_log.column.after_change'),
      cell: ({ row }) => <AfterChangeCell item={row.original} onOpenDetail={handleOpenDetail} />,
    },
    {
      accessorKey: 'task_type',
      header: () => (
        <TableSortHeader
          label={tSystem('operation_log.column.action')}
          column={TaskLogSortBy.TASK_TYPE}
          currentSortBy={sortBy}
          currentSortOrder={sortOrder}
          onSortChange={onSortChange}
        />
      ),
      cell: ({ row }) => {
        const actionKey = row.original.task_type || '';
        const badgeStyle = OPERATION_LOG_ACTION_BADGE[actionKey] || 'bg-gray-100 text-gray-700 rounded-sm';
        return (
          <Badge className={cn(badgeStyle)}>
            {tEnum(`system.${actionKey.toUpperCase()}`, tEnum(`common.${actionKey.toUpperCase()}`, actionKey))}
          </Badge>
        );
      },
      meta: { align: 'center', width: '100px' },
    },
    {
      accessorKey: 'worker',
      header: () => (
        <TableSortHeader
          label={tSystem('operation_log.column.operator')}
          column={TaskLogSortBy.WORKER}
          currentSortBy={sortBy}
          currentSortOrder={sortOrder}
          onSortChange={onSortChange}
        />
      ),
      cell: ({ row }) => row.original.worker?.name || row.original.worker?.username || '-',
      meta: { align: 'center', width: '110px' },
    },
    {
      accessorKey: 'created_at',
      header: () => (
        <TableSortHeader
          label={tSystem('operation_log.column.date_time')}
          column={TaskLogSortBy.CREATED_AT}
          currentSortBy={sortBy}
          currentSortOrder={sortOrder}
          onSortChange={onSortChange}
        />
      ),
      cell: ({ row }) => <DateTimeCell value={row.original.created_at} />,
      meta: { align: 'center', width: '140px' },
    },
  ];

  return (
    <>
      <DataTable
        data={data}
        columns={columns}
        totalRows={totalRows}
        isLoading={isLoading}
        pagination={pagination}
        onPaginationChange={onPaginationChange}
        pageSizeOptions={[10, 20, 50]}
        getRowId={(row) => row.id.toString()}
        emptyMessage={tSystem('operation_log.empty')}
      />
      <OperationLogDetailModal item={selectedItem} open={isDetailOpen} onOpenChange={setIsDetailOpen} />
    </>
  );
};

export default OperationLogTable;
