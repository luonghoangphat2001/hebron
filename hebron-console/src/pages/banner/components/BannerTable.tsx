import RowActionButton from '@/components/button/RowActionButton';
import { ImageColumnPreview } from '@/components/dialog/ImagePreviewDialog';
import { DataTable } from '@/components/table/DataTable';
import { TableSortHeader } from '@/components/table/TableSortHeader';
import { Badge } from '@/components/ui/badge';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import type { Banner } from '@/data/banner/banner.response';
import { cn } from '@/lib/utils';
import { BANNER_BADGE } from '@/utils/constants/banner.constant';
import { DATE_FORMAT } from '@/utils/constants/date.constant';
import { BannerSort } from '@/utils/enums/banner.enum';
import { PageType, SiteType, SortOrder } from '@/utils/enums/common.enum';
import { formatDate } from '@/utils/helper/common.helper';
import type { ColumnDef, OnChangeFn, PaginationState } from '@tanstack/react-table';
import { Eye } from 'lucide-react';
import { useTranslation } from 'react-i18next';

type Props = {
  data: Banner[];
  totalRows: number;
  isLoading: boolean;
  pagination: PaginationState;
  onPaginationChange: OnChangeFn<PaginationState>;
  onView: (id: number) => void;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  sortBy?: BannerSort;
  sortOrder?: SortOrder;
  onSortChange?: (sortBy?: BannerSort, sortOrder?: SortOrder) => void;
};

const BannerTable = ({
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

  const renderSiteType = (siteType?: string) => {
    if (!siteType) return '-';
    const isKnown = Object.values(SiteType).includes(siteType as SiteType);
    return isKnown ? tEnum(`common.${siteType}` as 'common.SHOPPING_MALL') : siteType;
  };

  const renderPageType = (pageType?: string) => {
    if (!pageType) return '-';
    const isKnown = Object.values(PageType).includes(pageType as PageType);
    return isKnown ? tEnum(`content.${pageType}` as any) : pageType;
  };

  const columns: ColumnDef<Banner>[] = [
    {
      header: tContent('column.number'),
      cell: ({ row }) => row.index + 1,
      meta: { align: 'center', width: '80px' },
    },
    {
      accessorKey: 'name',
      header: () => (
        <TableSortHeader
          label={tContent('column.banner_name')}
          column={BannerSort.NAME}
          currentSortBy={sortBy}
          currentSortOrder={sortOrder}
          onSortChange={onSortChange}
        />
      ),
      cell: ({ row }) => row.original.name,
      meta: { align: 'center', width: '140px' },
    },
    {
      header: tContent('column.site_type'),
      cell: ({ row }) => renderSiteType(row.original.site_type),
      meta: { align: 'center', width: '120px' },
    },
    {
      header: tContent('column.page_type'),
      cell: ({ row }) => renderPageType(row.original.page_type),
      meta: { align: 'center', width: '130px' },
    },
    // {
    //   header: tContent('column.location'),
    //   cell: ({ row }) => tEnum(`content.${row.original.exposure_location}` as any),
    //   meta: { align: 'center', width: '120px' },
    // },
    {
      header: tContent('column.image'),
      cell: ({ row }) => {
        const bannerName = row.original.name;
        const pcImage = row.original.image_path;
        const mobileImage = row.original.image_path_mobile;

        return (
          <div className='flex flex-col items-center gap-1.5'>
            <div className='flex items-center justify-center gap-2'>
              {pcImage && (
                <ImageColumnPreview
                  src={pcImage}
                  alt={bannerName}
                  className='h-14 w-28'
                  previewLabel={tCommon('button.preview')}
                />
              )}
              {mobileImage && (
                <ImageColumnPreview
                  src={mobileImage}
                  alt={bannerName}
                  className='h-14 w-20'
                  previewLabel={tCommon('button.preview')}
                />
              )}
            </div>
            {/* <p className='text-xs font-medium'>{row.original.name}</p> */}
          </div>
        );
      },
      meta: { align: 'center', width: '280px' },
    },
    {
      accessorKey: 'created_at',
      header: () => (
        <TableSortHeader
          label={tContent('column.duration')}
          column={BannerSort.CREATED_AT}
          currentSortBy={sortBy}
          currentSortOrder={sortOrder}
          onSortChange={onSortChange}
        />
      ),
      cell: ({ row }) => (
        <div>
          {formatDate(row.original.exposure_start_date, DATE_FORMAT)} ~ {formatDate(row.original.exposure_end_date, DATE_FORMAT)}
        </div>
      ),
      meta: { align: 'center', width: '200px' },
    },
    {
      accessorKey: 'sort_order',
      header: tContent('column.sort_order'),
      cell: ({ row }) => row.original.sort_order,
      meta: { align: 'center', width: '100px' },
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
      emptyMessage={tContent('banner.empty')}
      isLoading={isLoading}
    />
  );
};

export default BannerTable;
