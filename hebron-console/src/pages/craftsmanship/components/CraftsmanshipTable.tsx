import RowActionButton from '@/components/button/RowActionButton';
import { ImageColumnPreview } from '@/components/dialog/ImagePreviewDialog';
import { DataTable } from '@/components/table/DataTable';
import { Badge } from '@/components/ui/badge';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import type { CraftsmanshipValue } from '@/data/craftsmanship/craftsmanship.response';
import { getCraftsmanshipProductName } from '@/data/craftsmanship/craftsmanship.service';
import type { ColumnDef, OnChangeFn, PaginationState } from '@tanstack/react-table';
import { Eye, Package } from 'lucide-react';
import { useTranslation } from 'react-i18next';

type Props = {
  data: CraftsmanshipValue[];
  isLoading: boolean;
  onView: (id: number) => void;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  pagination: PaginationState;
  onPaginationChange: OnChangeFn<PaginationState>;
};

const CraftsmanshipTable = ({ data, isLoading, onView, onEdit, onDelete, pagination, onPaginationChange }: Props) => {
  const { t: tContent } = useTranslation('content');
  const { t: tCommon } = useTranslation('common');
  const { t: tEnum } = useTranslation('enum');
  const { i18n } = useTranslation();
  const isKo = i18n.language === 'kr';

  const columns: ColumnDef<CraftsmanshipValue>[] = [
    {
      header: tContent('column.number'),
      cell: ({ row }) => row.index + 1,
      meta: { align: 'center', width: '70px' },
    },
    {
      id: 'title',
      header: tContent('craftsmanship.field_title'),
      cell: ({ row }) => (
        <div className='flex flex-col items-center gap-0.5 text-center'>
          <p className='text-sm font-bold'>{row.original.title}</p>
          {row.original.subtitle && <p className='text-muted-foreground text-xs font-medium'>{row.original.subtitle}</p>}
        </div>
      ),
      meta: { align: 'center', width: '220px' },
    },
    {
      accessorKey: 'image_url',
      header: tContent('craftsmanship.field_image'),
      cell: ({ row }) => (
        <div className='flex justify-center'>
          {row.original.image_url ? (
            <ImageColumnPreview
              src={row.original.image_url}
              alt={row.original.title}
              className='h-12 w-14 rounded-lg border'
              previewLabel={tCommon('button.preview')}
            />
          ) : (
            <span className='text-muted-foreground text-xs'>-</span>
          )}
        </div>
      ),
      meta: { align: 'center', width: '130px' },
    },
    {
      id: 'products',
      header: tContent('craftsmanship.field_linked_products'),
      cell: ({ row }) => {
        const productList = row.original.products || [];
        if (!productList.length) {
          return <span className='text-muted-foreground text-xs'>-</span>;
        }

        const visible = productList.slice(0, 3);
        const remaining = productList.length - 3;

        return (
          <div className='flex items-center justify-center gap-1.5 py-1'>
            <div className='flex items-center -space-x-2.5'>
              {visible.map((p, idx) => (
                <div
                  key={idx}
                  className='border-background bg-muted relative h-10 w-10 shrink-0 overflow-hidden rounded-md border-2 shadow-2xs'
                  title={getCraftsmanshipProductName(p.name, isKo)}>
                  {p.first_image ? (
                    <img src={p.first_image} alt={`product-${idx}`} className='h-full w-full object-cover' />
                  ) : (
                    <div className='text-muted-foreground flex h-full w-full items-center justify-center'>
                      <Package className='h-3.5 w-3.5' />
                    </div>
                  )}
                </div>
              ))}
            </div>

            {remaining > 0 && (
              <Badge variant='outline' className='h-6 px-1.5 text-[10px] font-semibold'>
                +{remaining}
              </Badge>
            )}
          </div>
        );
      },
      meta: { align: 'center', width: '180px' },
    },
    {
      accessorKey: 'sort_order',
      header: tContent('craftsmanship.field_sort_order'),
      cell: ({ row }) => <span className='font-mono text-xs font-semibold'>{row.original.sort_order ?? 0}</span>,
      meta: { align: 'center', width: '90px' },
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
      meta: { align: 'center', width: '90px' },
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
      getRowId={(row) => String(row.id)}
      emptyMessage={tContent('craftsmanship.empty')}
      isLoading={isLoading}
    />
  );
};

export default CraftsmanshipTable;
