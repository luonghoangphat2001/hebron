import RowActionButton from '@/components/button/RowActionButton';
import { DataTable } from '@/components/table/DataTable';
import { Badge } from '@/components/ui/badge';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import type { AboutCTA } from '@/data/cta/cta.response';
import { SiteType } from '@/utils/enums/common.enum';
import type { ColumnDef, OnChangeFn, PaginationState } from '@tanstack/react-table';
import { Eye } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { CtaImageGalleryPreview } from './CtaImageGalleryPreview';

type Props = {
  data: AboutCTA[];
  isLoading: boolean;
  onView: (item: AboutCTA) => void;
  onEdit: (item: AboutCTA) => void;
  pagination: PaginationState;
  onPaginationChange: OnChangeFn<PaginationState>;
};

const CtaTable = ({ data, isLoading, onView, onEdit, pagination, onPaginationChange }: Props) => {
  const { t: tContent } = useTranslation('content');
  const { t: tEnum } = useTranslation('enum');
  const { t: tCommon } = useTranslation('common');

  const getSiteLabel = (siteType: SiteType) => tEnum(`common.${siteType}` as any) || siteType;

  const columns: ColumnDef<AboutCTA>[] = [
    {
      header: tContent('column.number'),
      cell: ({ row }) => row.index + 1,
      meta: { align: 'center', width: '70px' },
    },
    {
      accessorKey: 'site_type',
      header: tContent('column.site_type'),
      cell: ({ row }) => (
        <Badge variant='outline' className='font-semibold'>
          {getSiteLabel(row.original.site_type)}
        </Badge>
      ),
      meta: { align: 'center', width: '200px' },
    },
    {
      id: 'images',
      header: tContent('column.image'),
      cell: ({ row }) => {
        const items = row.original.content?.item;
        const imageList =
          items && items.length > 0 ? items.map((it) => it.image).filter(Boolean) : row.original.content?.product_images || [];
        return (
          <div className='flex justify-center'>
            <CtaImageGalleryPreview images={imageList} title={`CTA (${getSiteLabel(row.original.site_type)})`} />
          </div>
        );
      },
      meta: { align: 'center' },
    },
    {
      id: 'actions',
      header: tContent('column.actions'),
      cell: ({ row }) => (
        <RowActionButton onEdit={() => onEdit(row.original)}>
          <DropdownMenuItem onClick={() => onView(row.original)} className='cursor-pointer'>
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
      totalRows={data.length}
      pagination={pagination}
      onPaginationChange={onPaginationChange}
      pageSizeOptions={[10, 20]}
      getRowId={(row) => row.site_type}
      emptyMessage={tContent('cta.empty')}
      isLoading={isLoading}
    />
  );
};

export default CtaTable;
