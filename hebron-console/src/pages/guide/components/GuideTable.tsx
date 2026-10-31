import RowActionButton from '@/components/button/RowActionButton';
import { DataTable } from '@/components/table/DataTable';
import { Badge } from '@/components/ui/badge';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import type { GuideDetail } from '@/data/guide/guide.response';
import { cn } from '@/lib/utils';
import { DATE_FORMAT } from '@/utils/constants/date.constant';
import { GUIDE_EXPOSURE_STATUS_BADGE } from '@/utils/constants/guide.constant';
import { GuideType } from '@/utils/enums/content.enum';
import type { ColumnDef, OnChangeFn, PaginationState } from '@tanstack/react-table';
import dayjs from 'dayjs';
import { Eye } from 'lucide-react';
import { useTranslation } from 'react-i18next';

type GuideTableProps = {
  data: GuideDetail[];
  isLoading: boolean;
  totalRecord: number;
  pagination: PaginationState;
  onPaginationChange: OnChangeFn<PaginationState>;
  onView: (id: number) => void;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
};

const GuideTable = ({
  data,
  isLoading,
  totalRecord,
  pagination,
  onPaginationChange,
  onView,
  onEdit,
  onDelete,
}: GuideTableProps) => {
  const { t: tContent } = useTranslation('content');
  const { t: tCommon } = useTranslation('common');
  const { t: tEnum } = useTranslation('enum');

  const renderType = (type: string) => {
    const isKnown = Object.values(GuideType).includes(type as GuideType);
    return isKnown ? tEnum(`content.${type}` as 'content.production_guide') : type;
  };

  const columns: ColumnDef<GuideDetail>[] = [
    {
      header: tContent('column.no'),
      cell: ({ row }) => pagination.pageIndex * pagination.pageSize + row.index + 1,
      meta: { align: 'center', width: '60px' },
    },
    {
      header: tContent('column.title'),
      cell: ({ row }) => (
        <div>
          <p className='cursor-pointer font-medium text-blue-600 hover:underline' onClick={() => onView(Number(row.original.id))}>
            {row.original.title}
          </p>
          <p className='text-muted-foreground text-sm'>{row.original.author?.name || '-'}</p>
        </div>
      ),
    },
    {
      header: tContent('column.type'),
      cell: ({ row }) => renderType(row.original.type),
      meta: { align: 'center', width: '120px' },
    },
    {
      header: tContent('column.period'),
      cell: ({ row }) => {
        const start = row.original.exposure_start_date;
        const end = row.original.exposure_end_date;
        if (!start && !end) return '-';
        return (
          <span className='text-muted-foreground text-sm whitespace-nowrap'>
            {start ? dayjs(start).format(DATE_FORMAT) : '-'} ~ {end ? dayjs(end).format(DATE_FORMAT) : '-'}
          </span>
        );
      },
      meta: { align: 'center', width: '200px' },
    },
    {
      header: tContent('column.status'),
      cell: ({ row }) => {
        const status = row.original.exposure_status.value;
        return <Badge className={cn(GUIDE_EXPOSURE_STATUS_BADGE[status])}>{row.original.exposure_status.label}</Badge>;
      },
      meta: { align: 'center', width: '150px' },
    },
    {
      header: tContent('column.created_at'),
      cell: ({ row }) => dayjs(row.original.created_at).format(DATE_FORMAT),
      meta: { align: 'center', width: '120px' },
    },
    {
      id: 'actions',
      header: tContent('column.actions'),
      cell: ({ row }) => (
        <RowActionButton onEdit={() => onEdit(Number(row.original.id))} onDelete={() => onDelete(Number(row.original.id))}>
          <DropdownMenuItem onClick={() => onView(Number(row.original.id))} className='cursor-pointer'>
            <Eye /> {tCommon('button.preview')}
          </DropdownMenuItem>
        </RowActionButton>
      ),
      meta: { align: 'center', width: '80px' },
    },
  ];

  return (
    <DataTable
      data={data}
      columns={columns}
      isLoading={isLoading}
      totalRows={totalRecord}
      pagination={pagination}
      onPaginationChange={onPaginationChange}
      pageSizeOptions={[10, 20, 50]}
      getRowId={(row) => row.id.toString()}
      emptyMessage={tContent('guide.empty')}
    />
  );
};

export default GuideTable;
