import { DataTable } from '@/components/table/DataTable';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { MesLog } from '@/data/mes/mes.response';
import { cn } from '@/lib/utils';
import { MES_METHOD_BADGE, MES_RESULT_BADGE } from '@/utils/constants/mes.constant';
import { formatDate } from '@/utils/helper/common.helper';
import type { ColumnDef, OnChangeFn, PaginationState } from '@tanstack/react-table';
import { Eye } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import MesLogDetailModal from './MesLogDetailModal';

type Props = {
  data: MesLog[];
  isLoading: boolean;
  totalRows: number;
  pagination: PaginationState;
  onPaginationChange: OnChangeFn<PaginationState>;
};

const MesLogTable = ({ data, isLoading, totalRows, pagination, onPaginationChange }: Props) => {
  const { t: tMes } = useTranslation('mes');
  const { t: tEnum } = useTranslation('enum');
  const [selectedId, setSelectedId] = useState<number | string | null>(null);

  const columns: ColumnDef<MesLog>[] = [
    {
      header: tMes('log.column.requested_at'),
      cell: ({ row }) => (
        <div>
          <div className='font-medium'>{formatDate(row.original.requested_at, 'HH:mm:ss')}</div>
          <div className='text-muted-foreground text-xs'>{formatDate(row.original.requested_at, 'YYYY-MM-DD')}</div>
        </div>
      ),
      meta: { align: 'center', width: '110px' },
    },
    {
      header: tMes('log.column.direction'),
      cell: ({ row }) => (
        <Badge variant='outline' className='rounded-sm'>
          {tEnum(`mes.${row.original.direction}`)}
        </Badge>
      ),
      meta: { align: 'center', width: '130px' },
    },
    {
      header: tMes('log.column.trigger_type'),
      cell: ({ row }) => (
        <Badge variant='outline' className='rounded-sm'>
          {tEnum(`mes.${row.original.trigger_type}`)}
        </Badge>
      ),
      meta: { align: 'center', width: '150px' },
    },
    {
      header: tMes('log.column.reference'),
      cell: ({ row }) => (
        <div>
          <div className='font-medium'>{row.original.reference_type_label}</div>
          <div className='text-muted-foreground font-mono text-xs'>#{row.original.reference_id}</div>
        </div>
      ),
      meta: { width: '150px' },
    },
    {
      header: tMes('log.column.endpoint'),
      cell: ({ row }) => <span className='font-mono text-xs'>{row.original.endpoint}</span>,
      meta: { width: '200px' },
    },
    {
      header: tMes('log.column.method'),
      cell: ({ row }) => <Badge className={cn(MES_METHOD_BADGE[row.original.http_method])}>{row.original.http_method}</Badge>,
      meta: { align: 'center', width: '90px' },
    },
    {
      header: tMes('log.column.status'),
      cell: ({ row }) => (
        <span className={cn('font-medium', row.original.response_status >= 400 ? 'text-red-600' : 'text-green-600')}>
          {row.original.response_status}
        </span>
      ),
      meta: { align: 'center', width: '80px' },
    },
    {
      header: tMes('log.column.result'),
      cell: ({ row }) => (
        <Badge className={cn(MES_RESULT_BADGE[row.original.status])}>{tEnum(`mes.${row.original.status}`)}</Badge>
      ),
      meta: { align: 'center', width: '100px' },
    },
    {
      header: tMes('log.column.duration'),
      cell: ({ row }) => (
        <span>{row.original.duration_ms != null ? `${row.original.duration_ms.toLocaleString()} ms` : '-'}</span>
      ),
      meta: { align: 'right', width: '100px' },
    },
    {
      header: tMes('log.column.action'),
      cell: ({ row }) => (
        <Button size='sm' variant='outline' className='h-7 gap-1 px-2 text-xs' onClick={() => setSelectedId(row.original.id)}>
          <Eye className='size-3.5' /> {tMes('log.view_detail')}
        </Button>
      ),
      meta: { align: 'center', width: '120px' },
    },
  ];

  return (
    <>
      <DataTable
        data={data}
        isLoading={isLoading}
        columns={columns}
        totalRows={totalRows}
        pagination={pagination}
        onPaginationChange={onPaginationChange}
        pageSizeOptions={[10, 20, 50]}
        getRowId={(row) => row.id.toString()}
        emptyMessage={tMes('log.empty')}
      />
      <MesLogDetailModal open={!!selectedId} onOpenChange={(o) => !o && setSelectedId(null)} id={selectedId ?? undefined} />
    </>
  );
};

export default MesLogTable;
