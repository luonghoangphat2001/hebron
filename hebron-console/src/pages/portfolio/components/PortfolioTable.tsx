import RowActionButton from '@/components/button/RowActionButton';
import { ImageColumnPreview } from '@/components/dialog/ImagePreviewDialog';
import { DataTable } from '@/components/table/DataTable';
import { Badge } from '@/components/ui/badge';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import type { Portfolio } from '@/data/portfolio/portfolio.response';
import { cn } from '@/lib/utils';
import { STATUS_BADGE } from '@/utils/constants/common.constant';
import { DATE_FORMAT } from '@/utils/constants/date.constant';
import { Status } from '@/utils/enums/common.enum';
import { formatDate } from '@/utils/helper/common.helper';
import type { ColumnDef, OnChangeFn, PaginationState } from '@tanstack/react-table';
import { Eye, Star } from 'lucide-react';
import { useTranslation } from 'react-i18next';

type Props = {
  data: Portfolio[];
  totalRows: number;
  isLoading: boolean;
  pagination: PaginationState;
  onPaginationChange: OnChangeFn<PaginationState>;
  onView: (id: number) => void;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
};

const PortfolioTable = ({ data, totalRows, isLoading, pagination, onPaginationChange, onView, onEdit, onDelete }: Props) => {
  const { t: tContent } = useTranslation('content');
  const { t: tCommon } = useTranslation('common');
  const { t: tEnum } = useTranslation('enum');

  const columns: ColumnDef<Portfolio>[] = [
    {
      header: tContent('column.number'),
      cell: ({ row }) => row.index + 1,
      meta: { align: 'center', width: '60px' },
    },
    {
      header: tContent('portfolio.column.cover_image'),
      cell: ({ row }) => (
        <ImageColumnPreview
          src={row.original.cover_image}
          alt={row.original.title}
          className='h-14 w-20 rounded'
          previewLabel={tCommon('button.preview')}
        />
      ),
      meta: { align: 'center', width: '120px' },
    },
    {
      accessorKey: 'title',
      header: tContent('portfolio.column.title'),
      cell: ({ row }) => (
        <div className='space-y-0.5 text-left'>
          <p className='font-medium'>{row.original.title}</p>
          <p className='text-muted-foreground text-xs'>{row.original.client}</p>
        </div>
      ),
      meta: { align: 'left' },
    },
    {
      accessorKey: 'category',
      header: tContent('portfolio.column.category'),
      cell: ({ row }) => {
        const category = row.original.category;
        if (!category || (category as unknown) === 'null') {
          return <span className='text-muted-foreground'>-</span>;
        }
        return <Badge variant='secondary'>{category}</Badge>;
      },
      meta: { align: 'center', width: '140px' },
    },
    {
      accessorKey: 'year',
      header: tContent('portfolio.column.year'),
      cell: ({ row }) => row.original.year || <span className='text-muted-foreground'>-</span>,
      meta: { align: 'center', width: '80px' },
    },
    {
      accessorKey: 'is_featured',
      header: tContent('portfolio.column.featured'),
      cell: ({ row }) =>
        row.original.is_featured ? (
          <Star className='mx-auto size-4 fill-yellow-400 text-yellow-400' />
        ) : (
          <span className='text-muted-foreground'>-</span>
        ),
      meta: { align: 'center', width: '80px' },
    },
    {
      accessorKey: 'is_active',
      header: tContent('portfolio.column.active'),
      cell: ({ row }) => {
        const status = row.original.is_active ? Status.ACTIVE : Status.INACTIVE;
        return <Badge className={cn(STATUS_BADGE[status])}>{tEnum(`common.${status.toUpperCase()}` as any)}</Badge>;
      },
      meta: { align: 'center', width: '110px' },
    },
    {
      accessorKey: 'sort_order',
      header: tContent('column.sort_order'),
      cell: ({ row }) => row.original.sort_order,
      meta: { align: 'center', width: '80px' },
    },
    {
      accessorKey: 'created_at',
      header: tContent('column.created_at'),
      cell: ({ row }) => formatDate(row.original.created_at, DATE_FORMAT),
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
      meta: { align: 'center', width: '100px' },
    },
  ];

  return (
    <DataTable
      data={data}
      columns={columns}
      totalRows={totalRows}
      pagination={pagination}
      onPaginationChange={onPaginationChange}
      pageSizeOptions={[10, 20, 50]}
      getRowId={(row) => row.id.toString()}
      emptyMessage={tContent('portfolio.empty')}
      isLoading={isLoading}
    />
  );
};

export default PortfolioTable;
