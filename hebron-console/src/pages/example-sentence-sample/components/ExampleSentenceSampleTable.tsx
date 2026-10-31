import RowActionButton from '@/components/button/RowActionButton';
import { DataTable } from '@/components/table/DataTable';
import { Badge } from '@/components/ui/badge';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import type { ExampleSentenceSampleRESP } from '@/data/example-sentence-sample/example-sentence-sample.response';
import { DATE_TIME_FORMAT } from '@/utils/constants/date.constant';
import type { ColumnDef, OnChangeFn, PaginationState } from '@tanstack/react-table';
import dayjs from 'dayjs';
import { Eye } from 'lucide-react';
import { useTranslation } from 'react-i18next';

type Props = {
  data: ExampleSentenceSampleRESP[];
  isLoading: boolean;
  totalRecord: number;
  pagination: PaginationState;
  onPaginationChange: OnChangeFn<PaginationState>;
  onView: (id: number) => void;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
};

const ExampleSentenceSampleTable = ({
  data,
  isLoading,
  totalRecord,
  pagination,
  onPaginationChange,
  onView,
  onEdit,
  onDelete,
}: Props) => {
  const { t: tContent } = useTranslation('content');
  const { t: tCommon } = useTranslation('common');

  const columns: ColumnDef<ExampleSentenceSampleRESP>[] = [
    {
      header: tContent('column.no'),
      cell: ({ row }) => totalRecord - (pagination.pageIndex * pagination.pageSize + row.index),
      meta: { align: 'center', width: '70px' },
    },
    {
      header: tContent('column.category'),
      cell: ({ row }) => <Badge variant='secondary'>{row.original.category.name}</Badge>,
      meta: { align: 'center', width: '140px' },
    },
    { header: tContent('column.title'), accessorKey: 'title' },
    /* Featured column is intentionally disabled until the backend feature is enabled.
    {
      header: tContent('sample.featured'),
      cell: ({ row }) => (row.original.is_featured ? tContent('sample.featured') : '-'),
      meta: { align: 'center', width: '100px' },
    }, */
    {
      header: tContent('column.status'),
      cell: ({ row }) => (
        <Badge variant={row.original.is_active ? 'default' : 'secondary'}>
          {row.original.is_active ? tContent('sample.active') : tContent('sample.inactive')}
        </Badge>
      ),
      meta: { align: 'center', width: '100px' },
    },
    {
      header: tContent('column.views'),
      accessorKey: 'view_count',
      meta: { align: 'center', width: '90px' },
    },
    {
      header: tContent('column.created_at'),
      cell: ({ row }) => dayjs(row.original.created_at).format(DATE_TIME_FORMAT),
      meta: { align: 'center', width: '170px' },
    },
    {
      id: 'actions',
      header: tContent('column.actions'),
      cell: ({ row }) => (
        <RowActionButton onEdit={() => onEdit(row.original.id)} onDelete={() => onDelete(row.original.id)}>
          <DropdownMenuItem className='cursor-pointer' onClick={() => onView(row.original.id)}>
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
      emptyMessage={tContent('sample.empty')}
    />
  );
};

export default ExampleSentenceSampleTable;
