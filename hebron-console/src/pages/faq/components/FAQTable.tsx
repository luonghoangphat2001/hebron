import RowActionButton from '@/components/button/RowActionButton';
import { DataTable } from '@/components/table/DataTable';
import { Badge } from '@/components/ui/badge';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import type { FAQRESP } from '@/data/faq/faq.response';
import { cn } from '@/lib/utils';
import { DATE_FORMAT } from '@/utils/constants/date.constant';
import { FAQ_POSTING_STATUS_BADGE } from '@/utils/constants/faq.constant';
import { SiteType } from '@/utils/enums/common.enum';
import { FAQCategory } from '@/utils/enums/content.enum';
import type { ColumnDef, OnChangeFn, PaginationState } from '@tanstack/react-table';
import dayjs from 'dayjs';
import { Eye } from 'lucide-react';
import { useTranslation } from 'react-i18next';

type FAQTableProps = {
  data: FAQRESP[];
  isLoading: boolean;
  totalRecord: number;
  pagination: PaginationState;
  onPaginationChange: OnChangeFn<PaginationState>;
  onView: (id: number) => void;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
};

const FAQTable = ({ data, isLoading, totalRecord, pagination, onPaginationChange, onView, onEdit, onDelete }: FAQTableProps) => {
  const { t: tContent } = useTranslation('content');
  const { t: tCommon } = useTranslation('common');
  const { t: tEnum } = useTranslation('enum');

  const renderCategory = (category: string) => {
    const isKnown = Object.values(FAQCategory).includes(category as FAQCategory);
    return isKnown ? tEnum(`content.${category}` as 'content.etc') : category;
  };

  const renderSiteType = (siteType: string) => {
    const isKnown = Object.values(SiteType).includes(siteType as SiteType);
    return isKnown ? tEnum(`common.${siteType}` as 'common.SHOPPING_MALL') : siteType;
  };

  const columns: ColumnDef<FAQRESP>[] = [
    {
      header: tContent('column.no'),
      cell: ({ row }) => pagination.pageIndex * pagination.pageSize + row.index + 1,
      meta: { align: 'center', width: '60px' },
    },
    {
      header: tContent('column.category'),
      cell: ({ row }) => (
        <Badge variant='secondary' className='rounded-sm text-xs'>
          {renderCategory(row.original.category)}
        </Badge>
      ),
      meta: { align: 'center', width: '120px' },
    },
    {
      header: tContent('column.site_type'),
      cell: ({ row }) => renderSiteType(row.original.site_type),
      meta: { align: 'center', width: '130px' },
    },
    {
      header: tContent('column.order'),
      accessorKey: 'sort_order',
      meta: { align: 'center', width: '70px' },
    },
    {
      header: tContent('column.question'),
      cell: ({ row }) => (
        <div>
          <p className='font-medium'>{row.original.question}</p>
          <p className='text-muted-foreground text-sm'>{row.original.author?.name || '-'}</p>
        </div>
      ),
    },
    {
      header: tContent('column.status'),
      cell: ({ row }) => {
        const status = row.original.posting_status.value;
        return <Badge className={cn(FAQ_POSTING_STATUS_BADGE[status])}>{row.original.posting_status.label}</Badge>;
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
      emptyMessage={tContent('faq.empty')}
    />
  );
};

export default FAQTable;
