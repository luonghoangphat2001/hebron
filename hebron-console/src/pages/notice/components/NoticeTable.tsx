import RowActionButton from '@/components/button/RowActionButton';
import { DataTable } from '@/components/table/DataTable';
import { Badge } from '@/components/ui/badge';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import type { NoticeRESP } from '@/data/notice/notice.response';
import { cn } from '@/lib/utils';
import { DATE_FORMAT } from '@/utils/constants/date.constant';
import { NOTICE_EXPOSURE_STATUS_BADGE } from '@/utils/constants/notice.constant';
import { NoticeType } from '@/utils/enums/content.enum';
import type { ColumnDef, OnChangeFn, PaginationState } from '@tanstack/react-table';
import dayjs from 'dayjs';
import { Eye } from 'lucide-react';
import { useTranslation } from 'react-i18next';

type NoticeTableProps = {
  data: NoticeRESP[];
  isLoading: boolean;
  totalRecord: number;
  pagination: PaginationState;
  onPaginationChange: OnChangeFn<PaginationState>;
  onView: (id: number) => void;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
};

const NoticeTable = ({
  data,
  isLoading,
  totalRecord,
  pagination,
  onPaginationChange,
  onView,
  onEdit,
  onDelete,
}: NoticeTableProps) => {
  const { t: tContent } = useTranslation('content');
  const { t: tCommon } = useTranslation('common');
  const { t: tEnum } = useTranslation('enum');

  const renderType = (type: string) => {
    const isKnown = Object.values(NoticeType).includes(type as NoticeType);
    return isKnown ? tEnum(`content.${type}` as 'content.general') : type;
  };

  const columns: ColumnDef<NoticeRESP>[] = [
    {
      header: tContent('column.no'),
      cell: ({ row }) => pagination.pageIndex * pagination.pageSize + row.index + 1,
      meta: { align: 'center', width: '60px' },
    },
    {
      header: tContent('column.title'),
      cell: ({ row }) => (
        <div>
          <p className='cursor-pointer font-medium text-blue-600 hover:underline' onClick={() => onView(row.original.id)}>
            {row.original.title}
            {row.original.is_pinned && (
              <Badge variant='secondary' className='ml-2 rounded-sm text-xs'>
                {tContent('notice.badge_pinned')}
              </Badge>
            )}
          </p>
          {/* <p className='text-muted-foreground text-sm'>{row.original.author?.name || '-'}</p> */}
        </div>
      ),
    },
    {
      header: tContent('column.category'),
      cell: ({ row }) => (typeof row.original.category === 'object' ? row.original.category?.name : row.original.category) || '-',
      meta: { align: 'center', width: '120px' },
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
        return <Badge className={cn(NOTICE_EXPOSURE_STATUS_BADGE[status])}>{row.original.exposure_status.label}</Badge>;
      },
      meta: { align: 'center', width: '150px' },
    },
    {
      header: tContent('column.views'),
      cell: ({ row }) => row.original.view_count ?? 0,
      meta: { align: 'center', width: '80px' },
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
        <RowActionButton onEdit={() => onEdit(row.original.id)} onDelete={() => onDelete(row.original.id)}>
          <DropdownMenuItem onClick={() => onView(row.original.id)} className='cursor-pointer'>
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
      emptyMessage={tContent('notice.empty')}
    />
  );
};

export default NoticeTable;
