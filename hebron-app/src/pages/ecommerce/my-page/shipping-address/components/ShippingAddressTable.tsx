import ConfirmDialog from '@/components/dialog/ConfirmDialog';
import AppTable from '@/components/table/AppTable';
import { appToast } from '@/components/toast/AppToast';
import { Typography } from '@/components/typography/Typography';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useDeleteShippingAddressMutation } from '@/data/shipping-addresses/shipping-addresses.query';
import type { ShippingAddressItemRESP } from '@/data/shipping-addresses/shipping-addresses.response';
import { cn } from '@/lib/utils';
import MyPageListRowActions from '@/pages/ecommerce/my-page/components/MyPageListRowActions';
import { SHIPPING_ADDRESS_FORM_LABELS } from '@/utils/constants/shipping-address-form.constant';
import { formatShippingAddressFromApi, SHIPPING_ADDRESS_TABLE_LABELS } from '@/utils/constants/shipping-address.constant';
import { getMyPageAddressEditPath } from '@/utils/constants/route.constant';
import { splitPhonePattern } from '@/utils/helper/common.helper';
import type { ReactNode } from 'react';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

type ShippingAddressTableProps = {
  addresses: ShippingAddressItemRESP[];
  emptyMessage?: string;
  className?: string;
  footer?: ReactNode;
};

type ShippingAddressRowProps = {
  address: ShippingAddressItemRESP;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  onUpdate: () => void;
  onDelete: () => void;
};

const ShippingAddressDefaultBadge = () => (
  <Badge variant='white' size='md' className='font-medium text-neutral-700'>
    {SHIPPING_ADDRESS_TABLE_LABELS.defaultBadge}
  </Badge>
);

const ShippingAddressTableRow = ({ address, checked, onCheckedChange, onUpdate, onDelete }: ShippingAddressRowProps) => {
  const formattedAddress = formatShippingAddressFromApi(address);

  return (
    <TableRow className='border-neutral-100 hover:bg-transparent'>
      <TableCell className='typo-table-cell w-12 whitespace-normal'>
        <Checkbox checked={checked} onCheckedChange={onCheckedChange} aria-label={`${address.recipient} 선택`} />
      </TableCell>
      <TableCell className='typo-table-cell whitespace-normal'>
        <div className='flex min-w-0 items-center gap-2'>
          <span className='line-clamp-2 min-w-0 break-all' title={address.recipient}>
            {address.recipient}
          </span>
          {address.is_default ? <ShippingAddressDefaultBadge /> : null}
        </div>
      </TableCell>
      <TableCell className='typo-table-cell whitespace-normal'>
        <span className='line-clamp-2 break-all' title={formattedAddress}>
          {formattedAddress}
        </span>
      </TableCell>
      <TableCell className='typo-table-cell text-center whitespace-nowrap'>
        {splitPhonePattern(address.phone)?.formatted ?? address.phone}
      </TableCell>
      <TableCell className='w-12 whitespace-normal'>
        <div className='flex justify-end'>
          <MyPageListRowActions onUpdate={onUpdate} onDelete={onDelete} />
        </div>
      </TableCell>
    </TableRow>
  );
};

const ShippingAddressMobileCard = ({
  address,
  onUpdate,
  onDelete,
}: Omit<ShippingAddressRowProps, 'checked' | 'onCheckedChange'>) => {
  const formattedAddress = formatShippingAddressFromApi(address);

  return (
    <article className='flex flex-col gap-3 overflow-hidden rounded-lg border border-neutral-200 bg-white px-4 py-3'>
      <div className='flex items-start justify-between gap-3'>
        <div className='flex min-w-0 flex-1 flex-col gap-1'>
          <div className='flex max-w-full min-w-0 items-start gap-2'>
            <Typography
              weight='bold'
              className='text-md line-clamp-2 max-w-full min-w-0 break-all text-neutral-950'
              title={address.recipient}>
              {address.recipient}
            </Typography>
            {address.is_default ? <ShippingAddressDefaultBadge /> : null}
          </div>
          <Typography className='text-sm text-neutral-500'>
            {splitPhonePattern(address.phone)?.formatted ?? address.phone}
          </Typography>
        </div>
        <MyPageListRowActions onUpdate={onUpdate} onDelete={onDelete} />
      </div>

      <Typography className='line-clamp-2 max-w-full text-sm break-all text-neutral-700' title={formattedAddress}>
        {formattedAddress}
      </Typography>
    </article>
  );
};

const ShippingAddressTable = ({
  addresses,
  emptyMessage = SHIPPING_ADDRESS_TABLE_LABELS.empty,
  className,
  footer,
}: ShippingAddressTableProps) => {
  const navigate = useNavigate();
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [deleteTargetIds, setDeleteTargetIds] = useState<number[]>([]);
  const deleteMutation = useDeleteShippingAddressMutation();

  const allSelected = addresses.length > 0 && selectedIds.length === addresses.length;
  const isIndeterminate = selectedIds.length > 0 && !allSelected;
  const isConfirmOpen = deleteTargetIds.length > 0;

  const selectedIdSet = useMemo(() => new Set(selectedIds), [selectedIds]);

  const toggleAll = (checked: boolean) => {
    setSelectedIds(checked ? addresses.map((address) => address.id) : []);
  };

  const toggleOne = (addressId: number, checked: boolean) => {
    setSelectedIds((prev) => (checked ? [...prev, addressId] : prev.filter((id) => id !== addressId)));
  };

  const getAddressActions = (addressId: number) => ({
    onUpdate: () => navigate(getMyPageAddressEditPath(String(addressId))),
    onDelete: () => setDeleteTargetIds([addressId]),
  });

  const handleConfirmDelete = () => {
    deleteMutation.mutate(
      { ids: deleteTargetIds },
      {
        onSuccess: (response) => {
          setSelectedIds((prev) => prev.filter((id) => !deleteTargetIds.includes(id)));
          setDeleteTargetIds([]);
          appToast.success(response.message || SHIPPING_ADDRESS_FORM_LABELS.deleteSuccess);
        },
        onError: (error) => {
          appToast.error(error.response?.data.message || SHIPPING_ADDRESS_FORM_LABELS.deleteFailed);
        },
      },
    );
  };

  return (
    <div className={cn('flex min-w-0 flex-col', className)}>
      <div className='hidden min-w-0 md:block'>
        <AppTable footer={footer}>
          <TableHeader>
            <TableRow className='border-neutral-200 bg-neutral-100 hover:bg-neutral-100'>
              <TableHead className='typo-table-head w-12'>
                <Checkbox
                  checked={allSelected ? true : isIndeterminate ? 'indeterminate' : false}
                  onCheckedChange={(checked) => toggleAll(checked === true)}
                  aria-label={SHIPPING_ADDRESS_TABLE_LABELS.selectAll}
                />
              </TableHead>
              <TableHead className='typo-table-head w-56'>{SHIPPING_ADDRESS_TABLE_LABELS.recipientName}</TableHead>
              <TableHead className='typo-table-head'>{SHIPPING_ADDRESS_TABLE_LABELS.address}</TableHead>
              <TableHead className='typo-table-head w-36 text-center'>{SHIPPING_ADDRESS_TABLE_LABELS.phone}</TableHead>
              <TableHead className='typo-table-head w-12' aria-hidden />
            </TableRow>
          </TableHeader>
          <TableBody>
            {addresses.length === 0 ? (
              <TableRow className='hover:bg-transparent'>
                <TableCell colSpan={5} className='typo-body-secondary py-10 text-center'>
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              addresses.map((address) => (
                <ShippingAddressTableRow
                  key={address.id}
                  address={address}
                  checked={selectedIdSet.has(address.id)}
                  onCheckedChange={(checked) => toggleOne(address.id, checked)}
                  {...getAddressActions(address.id)}
                />
              ))
            )}
          </TableBody>
        </AppTable>
      </div>

      <div className='flex flex-col gap-3 md:hidden'>
        {addresses.length === 0 ? (
          <Typography variant='body-sm' className='py-8 text-center text-neutral-500'>
            {emptyMessage}
          </Typography>
        ) : (
          addresses.map((address) => (
            <ShippingAddressMobileCard key={address.id} address={address} {...getAddressActions(address.id)} />
          ))
        )}
      </div>

      <ConfirmDialog
        open={isConfirmOpen}
        onOpenChange={(open) => {
          if (!open) setDeleteTargetIds([]);
        }}
        title={SHIPPING_ADDRESS_FORM_LABELS.deleteConfirmTitle}
        description={SHIPPING_ADDRESS_FORM_LABELS.deleteConfirm}
        confirmLabel={SHIPPING_ADDRESS_TABLE_LABELS.delete}
        cancelLabel={SHIPPING_ADDRESS_FORM_LABELS.cancel}
        isLoading={deleteMutation.isPending}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
};

export default ShippingAddressTable;
