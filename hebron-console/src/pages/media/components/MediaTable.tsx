import RowActionButton from '@/components/button/RowActionButton';
import { ImageColumnPreview } from '@/components/dialog/ImagePreviewDialog';
import { DataTable } from '@/components/table/DataTable';
import { Badge } from '@/components/ui/badge';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import type { Media } from '@/data/media/media.response';
import { cn } from '@/lib/utils';
import { STATUS_BADGE } from '@/utils/constants/common.constant';
import { Status } from '@/utils/enums/common.enum';
import { toStorageUrl } from '@/utils/helper/storage-url.helper';
import type { ColumnDef, OnChangeFn, PaginationState } from '@tanstack/react-table';
import { Eye } from 'lucide-react';
import { useTranslation } from 'react-i18next';

type Props = {
  data: Media[];
  isLoading: boolean;
  totalRecord: number;
  pagination: PaginationState;
  onPaginationChange: OnChangeFn<PaginationState>;
  onView: (id: number) => void;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
};

const toDescriptionPreview = (value: string) => {
  const lines = value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  return lines.length > 1 ? `${lines[0]}…` : (lines[0] ?? '');
};

const MediaTable = ({ data, isLoading, totalRecord, pagination, onPaginationChange, onView, onEdit, onDelete }: Props) => {
  const { t: tContent } = useTranslation('content');
  const { t: tCommon } = useTranslation('common');
  const { t: tEnum } = useTranslation('enum');

  const columns: ColumnDef<Media>[] = [
    {
      header: tContent('column.no'),
      cell: ({ row }) => pagination.pageIndex * pagination.pageSize + row.index + 1,
      meta: { align: 'center', width: '60px' },
    },
    {
      header: tContent('column.thumbnail'),
      cell: ({ row }) => {
        const src = toStorageUrl(row.original.image_url || row.original.url);
        return (
          <div className='flex justify-center'>
            {src ? (
              <ImageColumnPreview
                src={src}
                alt={row.original.title}
                className='h-12 w-16 rounded-lg border'
                previewLabel={tCommon('button.preview')}
              />
            ) : (
              <span className='text-muted-foreground text-xs'>-</span>
            )}
          </div>
        );
      },
      meta: { align: 'center', width: '120px' },
    },
    {
      header: tContent('column.title'),
      cell: ({ row }) => (
        <div className='max-w-80 min-w-0'>
          <p className='truncate font-medium' title={row.original.title}>
            {row.original.title}
          </p>
          {/* {row.original.description && (
            <p className='text-muted-foreground truncate text-sm' title={row.original.description}>
              {toDescriptionPreview(row.original.description)}
            </p>
          )} */}
        </div>
      ),
      meta: { width: '320px' },
    },
    {
      header: tContent('column.category'),
      cell: ({ row }) =>
        row.original.category ? (
          <Badge variant='secondary' className='rounded-sm text-xs'>
            {row.original.category.name}
          </Badge>
        ) : (
          <span className='text-muted-foreground text-xs'>-</span>
        ),
      meta: { align: 'center', width: '140px' },
    },
    // {
    //   header: tContent('column.site_type'),
    //   cell: ({ row }) => tEnum(`common.${row.original.site_type}` as 'common.BRAND_SITE'),
    //   meta: { align: 'center', width: '130px' },
    // },
    // {
    //   header: tContent('media.field_link_url'),
    //   cell: ({ row }) =>
    //     row.original.link_url ? (
    //       <a
    //         href={row.original.link_url}
    //         target='_blank'
    //         rel='noreferrer'
    //         className='text-primary block max-w-45 truncate underline-offset-2 hover:underline'>
    //         {row.original.link_url}
    //       </a>
    //     ) : (
    //       <span className='text-muted-foreground text-xs'>-</span>
    //     ),
    //   meta: { align: 'center', width: '180px' },
    // },
    {
      header: tContent('column.order'),
      accessorKey: 'sort_order',
      meta: { align: 'center', width: '70px' },
    },
    {
      header: tContent('column.status'),
      cell: ({ row }) => {
        const status = row.original.is_active ? Status.ACTIVE : Status.INACTIVE;
        return (
          <Badge className={cn(STATUS_BADGE[status])}>
            {tEnum(row.original.is_active ? 'common.ACTIVE' : 'common.INACTIVE')}
          </Badge>
        );
      },
      meta: { align: 'center', width: '90px' },
    },
    {
      header: tContent('column.actions'),
      cell: ({ row }) => (
        <RowActionButton onEdit={() => onEdit(row.original.id)} onDelete={() => onDelete(row.original.id)}>
          <DropdownMenuItem onClick={() => onView(row.original.id)} className='cursor-pointer'>
            <Eye /> {tCommon('button.preview')}
          </DropdownMenuItem>
        </RowActionButton>
      ),
      meta: { align: 'center', width: '90px' },
    },
  ];

  return (
    <DataTable
      data={data}
      columns={columns}
      totalRows={totalRecord}
      pagination={pagination}
      onPaginationChange={onPaginationChange}
      getRowId={(row) => String(row.id)}
      emptyMessage={tContent('media.empty')}
      isLoading={isLoading}
    />
  );
};

export default MediaTable;
