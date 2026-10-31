import RowActionButton from '@/components/button/RowActionButton';
import { ImageColumnPreview } from '@/components/dialog/ImagePreviewDialog';
import { DataTable } from '@/components/table/DataTable';
import { TableSortHeader } from '@/components/table/TableSortHeader';
import { Badge } from '@/components/ui/badge';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import type { PopupRESP } from '@/data/popup/popup.response';
import { cn } from '@/lib/utils';
import { BANNER_BADGE } from '@/utils/constants/banner.constant';
import { DATE_FORMAT } from '@/utils/constants/date.constant';
import { SortOrder } from '@/utils/enums/common.enum';
import { PopupSort } from '@/utils/enums/popup.enum';
import { formatDate } from '@/utils/helper/common.helper';
import type { ColumnDef, OnChangeFn, PaginationState } from '@tanstack/react-table';
import { Eye } from 'lucide-react';
import { useTranslation } from 'react-i18next';

type Props = {
  data: PopupRESP[];
  totalRows: number;
  isLoading: boolean;
  pagination: PaginationState;
  onPaginationChange: OnChangeFn<PaginationState>;
  onView: (id: number) => void;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  sortBy?: PopupSort;
  sortOrder?: SortOrder;
  onSortChange?: (sortBy?: PopupSort, sortOrder?: SortOrder) => void;
};

const PopupTable = ({
  data,
  totalRows,
  isLoading,
  pagination,
  onPaginationChange,
  onView,
  onEdit,
  onDelete,
  sortBy,
  sortOrder,
  onSortChange,
}: Props) => {
  const { t: tContent } = useTranslation('content');
  const { t: tEnum } = useTranslation('enum');
  const { t: tCommon } = useTranslation('common');

  const columns: ColumnDef<PopupRESP>[] = [
    {
      header: tContent('column.number'),
      cell: ({ row }) => row.index + 1,
      meta: { align: 'center', width: '80px' },
    },
    {
      header: tContent('column.image'),
      cell: ({ row }) => {
        const src = row.original.image_path;
        return (
          <div className='flex justify-center'>
            <ImageColumnPreview
              src={src}
              alt={row.original.name}
              className='h-14 w-24'
              previewLabel={tCommon('button.preview') || 'Preview'}
            />
          </div>
        );
      },
      meta: { align: 'center', width: '160px' },
    },
    {
      accessorKey: 'name',
      header: () => (
        <TableSortHeader
          label={tContent('column.popup')}
          column={PopupSort.NAME}
          currentSortBy={sortBy}
          currentSortOrder={sortOrder}
          onSortChange={onSortChange}
        />
      ),
      cell: ({ row }) => (
        <div>
          <p className='font-medium'>{row.original.name}</p>
          {/* {row.original.exposure_location && (
            <p className='text-muted-foreground text-sm'>{tEnum(`content.${row.original.exposure_location}` as any)}</p>
          )} */}
        </div>
      ),
    },
    // {
    //   header: tContent('column.target_site'),
    //   cell: ({ row }) => {
    //     const labels: Record<string, string> = {
    //       all: 'All',
    //       guest: 'Guest',
    //       member: 'Member',
    //       vip: 'VIP',
    //     };
    //     return (row.original.exposure_target || []).map((t) => labels[t] || t).join(', ');
    //   },
    //   meta: { align: 'center' },
    // },
    {
      header: tContent('column.size'),
      cell: ({ row }) => `${row.original.size_settings?.width ?? '-'} × ${row.original.size_settings?.height ?? '-'}`,
      meta: { align: 'center', width: '120px' },
    },
    {
      accessorKey: 'created_at',
      header: () => (
        <TableSortHeader
          label={tContent('column.duration')}
          column={PopupSort.CREATED_AT}
          currentSortBy={sortBy}
          currentSortOrder={sortOrder}
          onSortChange={onSortChange}
        />
      ),
      cell: ({ row }) => (
        <div className='text-sm'>
          <p>{formatDate(row.original.exposure_start_date, DATE_FORMAT)}</p>
          <p>~ {formatDate(row.original.exposure_end_date, DATE_FORMAT)}</p>
        </div>
      ),
      meta: { align: 'center' },
    },
    {
      header: tContent('column.status'),
      cell: ({ row }) => {
        const status = row.original.status.value;
        return <Badge className={cn(BANNER_BADGE[status])}>{row.original.status.label}</Badge>;
      },
      meta: { align: 'center', width: '150px' },
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
      meta: { align: 'center', width: '120px' },
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
      emptyMessage={tContent('popup.empty')}
      isLoading={isLoading}
    />
  );
};

export default PopupTable;
