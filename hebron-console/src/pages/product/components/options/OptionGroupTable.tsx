import RowActionButton from '@/components/button/RowActionButton';
import ConfirmDialog from '@/components/dialog/ConfirmDialog';
import { DataTable } from '@/components/table/DataTable';
import { TableSortHeader } from '@/components/table/TableSortHeader';
import { appToast } from '@/components/toast/AppToast';
import { Badge } from '@/components/ui/badge';
import { useOptionGroupDeleteMutation } from '@/data/option-group/option-group.query';
import type { ProductOptionGroups } from '@/data/option-group/option-group.response';
import { MY_ROUTE } from '@/utils/constants/route.constant';
import type { SortOrder } from '@/utils/enums/common.enum';
import { OptionGroupSort } from '@/utils/enums/option-group.enum';
import { formatDate } from '@/utils/helper/common.helper';
import type { ColumnDef, OnChangeFn, PaginationState, RowSelectionState } from '@tanstack/react-table';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import OptionGroupUpsertModal from './OptionGroupUpsertModal';

const MAX_OPTIONS_SHOWN = 4;

type Props = {
  data: ProductOptionGroups[];
  isLoading: boolean;
  totalRows: number;
  pagination: PaginationState;
  onPaginationChange: OnChangeFn<PaginationState>;
  sortBy?: OptionGroupSort;
  sortOrder?: SortOrder;
  onSortChange?: (sortBy?: OptionGroupSort, sortOrder?: SortOrder) => void;
  rowSelection?: RowSelectionState;
  onRowSelectionChange?: OnChangeFn<RowSelectionState>;
};

const OptionGroupTable = ({
  data,
  isLoading,
  totalRows,
  pagination,
  onPaginationChange,
  sortBy,
  sortOrder,
  onSortChange,
  rowSelection,
  onRowSelectionChange,
}: Props) => {
  const { t } = useTranslation('option');
  const { t: tCommon } = useTranslation('common');
  const navigate = useNavigate();

  const [editGroupId, setEditGroupId] = useState<number | undefined>(undefined);
  const [deleteGroupId, setDeleteGroupId] = useState<number | undefined>(undefined);
  const [internalRowSelection, setInternalRowSelection] = useState<RowSelectionState>({});

  const activeRowSelection = rowSelection ?? internalRowSelection;
  const activeOnRowSelectionChange = onRowSelectionChange ?? setInternalRowSelection;

  const { mutate: mutateDelete, isPending: isDeleting } = useOptionGroupDeleteMutation({
    onSuccess: () => {
      setDeleteGroupId(undefined);
      appToast.success(tCommon('notify.success_delete'));
    },
    onError: (error) => {
      appToast.error(error.response?.data.message || tCommon('notify.fail_delete'));
    },
  });

  const columns: ColumnDef<ProductOptionGroups>[] = [
    {
      header: t('group.column.code'),
      cell: ({ row }) => <span className='font-mono text-xs'>{row.original.code}</span>,
      meta: { width: '140px' },
    },
    {
      header: () => (
        <TableSortHeader
          label={t('group.column.name')}
          column={OptionGroupSort.NAME}
          currentSortBy={sortBy}
          currentSortOrder={sortOrder}
          onSortChange={onSortChange}
        />
      ),
      accessorKey: 'name',
      meta: { width: '200px' },
    },
    {
      header: t('group.column.options'),
      cell: ({ row }) => {
        const options = row.original.options || [];
        const shown = options.slice(0, MAX_OPTIONS_SHOWN);
        if (!shown.length) return <span className='text-muted-foreground'>-</span>;
        return (
          <div className='flex flex-wrap items-center gap-1'>
            {shown.map((option) => (
              <Badge key={option.id} variant='outline' className='rounded-sm'>
                {option.name}
              </Badge>
            ))}
            {options.length > MAX_OPTIONS_SHOWN && <span className='text-muted-foreground text-xs'>...</span>}
          </div>
        );
      },
      meta: { width: '420px' },
    },
    {
      header: t('group.column.updated_at'),
      cell: ({ row }) => formatDate(row.original.updated_at),
      meta: { align: 'center', width: '150px' },
    },
    {
      id: 'created_at',
      header: () => (
        <TableSortHeader
          label={t('group.column.created_at')}
          column={OptionGroupSort.CREATE_AT}
          currentSortBy={sortBy}
          currentSortOrder={sortOrder}
          onSortChange={onSortChange}
        />
      ),
      cell: ({ row }) => formatDate(row.original.created_at),
      meta: { align: 'center', width: '150px' },
    },
    {
      id: 'actions',
      header: t('group.column.action'),
      cell: ({ row }) => (
        <RowActionButton
          onView={() => navigate(MY_ROUTE.PRODUCT.OPTION_DETAIL(row.original.id))}
          // onEdit={() => setEditGroupId(Number(row.original.id))}
          onDelete={() => setDeleteGroupId(Number(row.original.id))}
        />
      ),
      meta: { align: 'center', width: '80px' },
    },
  ];

  return (
    <>
      <DataTable
        data={data}
        isLoading={isLoading}
        columns={columns}
        totalRows={totalRows}
        pagination={pagination}
        onPaginationChange={onPaginationChange}
        pageSizeOptions={[10, 20, 50]}
        enableRowSelection
        rowSelection={activeRowSelection}
        onRowSelectionChange={activeOnRowSelectionChange}
        getRowId={(row) => row.id.toString()}
        emptyMessage={t('group.empty')}
      />
      <OptionGroupUpsertModal
        open={editGroupId !== undefined}
        setOpen={(o) => !o && setEditGroupId(undefined)}
        optionGroupId={editGroupId}
      />
      <ConfirmDialog
        open={deleteGroupId !== undefined}
        onOpenChange={(o) => !o && setDeleteGroupId(undefined)}
        title={t('group.confirm_delete_title')}
        description={t('group.confirm_delete_description')}
        onConfirm={() => deleteGroupId && mutateDelete(deleteGroupId)}
        isLoading={isDeleting}
        variant='destructive'
      />
    </>
  );
};

export default OptionGroupTable;
