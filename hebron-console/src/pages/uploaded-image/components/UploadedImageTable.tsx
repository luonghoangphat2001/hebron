import RowActionButton from '@/components/button/RowActionButton';
import { ImageColumnPreview } from '@/components/dialog/ImagePreviewDialog';
import { DataTable } from '@/components/table/DataTable';
import { Badge } from '@/components/ui/badge';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import type { FileRESP } from '@/data/file/file.response';
import { DATE_FORMAT } from '@/utils/constants/date.constant';
import { formatDate } from '@/utils/helper/common.helper';
import type { ColumnDef, OnChangeFn, PaginationState } from '@tanstack/react-table';
import { Eye } from 'lucide-react';
import { useTranslation } from 'react-i18next';

type Props = {
  data: FileRESP[];
  totalRows: number;
  isLoading: boolean;
  pagination: PaginationState;
  onPaginationChange: OnChangeFn<PaginationState>;
  onView?: (id: number) => void;
};

const UploadedImageTable = ({ data, totalRows, isLoading, pagination, onPaginationChange, onView }: Props) => {
  const { t: tContent } = useTranslation('content');
  const { t: tCommon } = useTranslation('common');

  const columns: ColumnDef<FileRESP>[] = [
    {
      header: tContent('column.no'),
      cell: ({ row }) => row.index + 1,
      meta: { align: 'center', width: '60px' },
    },
    {
      header: tContent('column.thumbnail'),
      cell: ({ row }) => {
        const src = row.original.url;
        return (
          <div className='flex justify-center'>
            <ImageColumnPreview src={src} alt={row.original.name} className='h-12 w-16' />
          </div>
        );
      },
      meta: { align: 'center', width: '90px' },
    },
    {
      header: tContent('column.name'),
      accessorKey: 'name',
    },
    {
      header: tContent('column.category'),
      cell: ({ row }) => (
        <Badge variant='secondary' className='rounded-sm font-mono text-xs'>
          {row.original.type}
        </Badge>
      ),
      meta: { align: 'center', width: '140px' },
    },
    {
      header: tContent('column.type'),
      cell: ({ row }) => (
        <Badge variant='secondary' className='rounded-sm font-mono text-xs'>
          {row.original.mime_type}
        </Badge>
      ),
      meta: { align: 'center', width: '120px' },
    },
    {
      header: tContent('filter.registrant'),
      cell: ({ row }) => row.original.created_by || '-',
      meta: { align: 'center', width: '120px' },
    },
    {
      header: tContent('column.upload_date'),
      cell: ({ row }) => formatDate(row.original.created_at, DATE_FORMAT),
      meta: { align: 'center', width: '120px' },
    },
    {
      id: 'actions',
      header: tContent('column.actions'),
      cell: ({ row }) => (
        <div className='flex items-center justify-center gap-1'>
          <RowActionButton>
            {onView && (
              <DropdownMenuItem onClick={() => onView(row.original.id)} className='cursor-pointer'>
                <Eye /> {tCommon('button.preview')}
              </DropdownMenuItem>
            )}
          </RowActionButton>
        </div>
      ),
      meta: { align: 'center', width: '100px' },
    },
  ];

  return (
    <div>
      <DataTable
        data={data}
        columns={columns}
        totalRows={totalRows}
        pagination={pagination}
        onPaginationChange={onPaginationChange}
        pageSizeOptions={[10, 20, 50]}
        getRowId={(row) => row.id.toString()}
        emptyMessage={tContent('image.empty')}
        isLoading={isLoading}
      />
    </div>
  );
};

export default UploadedImageTable;
