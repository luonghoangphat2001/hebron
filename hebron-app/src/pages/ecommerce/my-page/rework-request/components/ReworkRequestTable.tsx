import ConfirmDialog from '@/components/dialog/ConfirmDialog';
import AppTable from '@/components/table/AppTable';
import { appToast } from '@/components/toast/AppToast';
import { Typography } from '@/components/typography/Typography';
import { Badge } from '@/components/ui/badge';
import { TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useDeleteInquiryMutation } from '@/data/inquiries/inquiries.query';
import type { InquiryItemRESP } from '@/data/inquiries/inquiries.response';
import { cn } from '@/lib/utils';
import MyPageListRowActions from '@/pages/ecommerce/my-page/components/MyPageListRowActions';
import { MY_PAGE_LIST_ROW_ACTIONS } from '@/utils/constants/my-page.constant';
import { getInquiryCategoryLabel, getInquiryStatusLabel } from '@/utils/constants/quote.constant';
import { REWORK_REQUEST_FORM_LABELS } from '@/utils/constants/rework-request-form.constant';
import { REWORK_REQUEST_TABLE_LABELS } from '@/utils/constants/rework-request.constant';
import { getMyPageReworkRequestDetailPath, getMyPageReworkRequestEditPath } from '@/utils/constants/route.constant';
import { InquiryStatus } from '@/utils/enums/inquiry.enum';
import { formatDate, splitPhonePattern } from '@/utils/helper/common.helper';
import type { ReactNode } from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

type ReworkRequestTableProps = {
  items: InquiryItemRESP[];
  emptyMessage?: string;
  className?: string;
  footer?: ReactNode;
};

type ReworkRequestRowProps = {
  item: InquiryItemRESP;
  onViewDetails: () => void;
  onUpdate: () => void;
  onDelete: () => void;
};

const ReworkRequestStatusBadge = ({ status, statusLabel }: { status: string; statusLabel: string }) => {
  const answered = status === InquiryStatus.ANSWERED;

  return (
    <Badge
      variant={answered ? 'default' : 'white'}
      size='md'
      className={cn('font-medium', answered ? 'bg-blue-brand-700 text-white' : 'text-neutral-700')}>
      {statusLabel}
    </Badge>
  );
};

const ReworkRequestMobileInfoRow = ({ label, children }: { label: string; children: ReactNode }) => (
  <div className='flex items-center justify-between gap-4'>
    <Typography className='shrink-0 text-sm text-neutral-500'>{label}</Typography>
    <div className='min-w-0 text-right'>{children}</div>
  </div>
);

const formatContact = (contact: string) => splitPhonePattern(contact)?.formatted ?? contact;

const ReworkRequestTableRow = ({ item, onViewDetails, onUpdate, onDelete }: ReworkRequestRowProps) => (
  <TableRow className='border-neutral-100 hover:bg-transparent'>
    <TableCell className='typo-table-cell whitespace-normal'>{formatDate(item.created_at)}</TableCell>
    <TableCell className='typo-table-cell whitespace-normal'>
      {getInquiryCategoryLabel(item.category, item.category_label)}
    </TableCell>
    <TableCell className='whitespace-normal'>
      <div className='flex min-w-0 items-start gap-2'>
        {item.is_new && <span className='bg-brand mt-2 size-1.5 shrink-0 rounded-full' aria-hidden />}
        <Typography className='typo-body min-w-0'>{item.title}</Typography>
      </div>
    </TableCell>
    <TableCell className='typo-table-cell whitespace-normal'>{item.author_name}</TableCell>
    <TableCell className='typo-table-cell whitespace-normal'>{formatContact(item.contact)}</TableCell>
    <TableCell className='whitespace-normal'>
      <div className='flex justify-end'>
        <ReworkRequestStatusBadge status={item.status} statusLabel={getInquiryStatusLabel(item.status, item.status_label)} />
      </div>
    </TableCell>
    <TableCell className='whitespace-normal'>
      <div className='flex justify-end'>
        <MyPageListRowActions onViewDetails={onViewDetails} onUpdate={onUpdate} onDelete={onDelete} />
      </div>
    </TableCell>
  </TableRow>
);

const ReworkRequestMobileCard = ({ item, onViewDetails, onUpdate, onDelete }: ReworkRequestRowProps) => (
  <article className='flex flex-col gap-3 overflow-hidden rounded-lg border border-neutral-200 bg-white px-4 py-3'>
    <div className='flex items-start gap-2'>
      <div className='flex min-w-0 flex-1 flex-col gap-2'>
        <Typography className='text-sm text-neutral-500'>{formatDate(item.created_at)}</Typography>

        <div className='flex min-w-0 items-start gap-2'>
          {item.is_new && <span className='bg-brand mt-2 size-1.5 shrink-0 rounded-full' aria-hidden />}
          <Typography weight='bold' className='text-md min-w-0 text-neutral-950'>
            [{getInquiryCategoryLabel(item.category, item.category_label)}] {item.title}
          </Typography>
        </div>
      </div>
      <MyPageListRowActions onViewDetails={onViewDetails} onUpdate={onUpdate} onDelete={onDelete} />
    </div>

    <div className='flex flex-col gap-2 border-t border-neutral-100 pt-3'>
      <ReworkRequestMobileInfoRow label={REWORK_REQUEST_TABLE_LABELS.managerName}>
        <Typography className='text-sm text-neutral-950'>
          {item.author_name} · {formatContact(item.contact)}
        </Typography>
      </ReworkRequestMobileInfoRow>

      <ReworkRequestMobileInfoRow label={REWORK_REQUEST_TABLE_LABELS.status}>
        <ReworkRequestStatusBadge status={item.status} statusLabel={getInquiryStatusLabel(item.status, item.status_label)} />
      </ReworkRequestMobileInfoRow>
    </div>
  </article>
);

const ReworkRequestTable = ({
  items,
  emptyMessage = REWORK_REQUEST_TABLE_LABELS.empty,
  className,
  footer,
}: ReworkRequestTableProps) => {
  const navigate = useNavigate();
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
  const deleteMutation = useDeleteInquiryMutation();
  const isConfirmOpen = deleteTargetId != null;

  const getReworkRequestActions = (requestId: number | string) => ({
    onViewDetails: () => navigate(getMyPageReworkRequestDetailPath(String(requestId))),
    onUpdate: () => navigate(getMyPageReworkRequestEditPath(String(requestId))),
    onDelete: () => setDeleteTargetId(Number(requestId)),
  });

  const handleConfirmDelete = () => {
    if (deleteTargetId == null) return;

    deleteMutation.mutate(deleteTargetId, {
      onSuccess: (response) => {
        setDeleteTargetId(null);
        appToast.success(response.message || REWORK_REQUEST_FORM_LABELS.deleteSuccess);
      },
      onError: (error) => {
        appToast.error(error.response?.data.message || REWORK_REQUEST_FORM_LABELS.deleteFailed);
      },
    });
  };

  return (
    <div className={cn('flex flex-col', className)}>
      <div className='hidden md:block'>
        <AppTable footer={footer}>
          <TableHeader>
            <TableRow className='border-neutral-200 bg-neutral-100 hover:bg-neutral-100'>
              <TableHead className='typo-table-head w-32'>{REWORK_REQUEST_TABLE_LABELS.createdAt}</TableHead>
              <TableHead className='typo-table-head w-24'>{REWORK_REQUEST_TABLE_LABELS.category}</TableHead>
              <TableHead className='typo-table-head'>{REWORK_REQUEST_TABLE_LABELS.title}</TableHead>
              <TableHead className='typo-table-head w-28'>{REWORK_REQUEST_TABLE_LABELS.managerName}</TableHead>
              <TableHead className='typo-table-head w-36'>{REWORK_REQUEST_TABLE_LABELS.phone}</TableHead>
              <TableHead className='typo-table-head w-28 text-right'>{REWORK_REQUEST_TABLE_LABELS.status}</TableHead>
              <TableHead className='typo-table-head w-12' aria-hidden />
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length === 0 ? (
              <TableRow className='hover:bg-transparent'>
                <TableCell colSpan={7} className='typo-body-secondary py-10 text-center'>
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              items.map((item) => <ReworkRequestTableRow key={item.id} item={item} {...getReworkRequestActions(item.id)} />)
            )}
          </TableBody>
        </AppTable>
      </div>

      <div className='flex flex-col gap-3 md:hidden'>
        {items.length === 0 ? (
          <Typography variant='body-sm' className='py-8 text-center text-neutral-500'>
            {emptyMessage}
          </Typography>
        ) : (
          items.map((item) => <ReworkRequestMobileCard key={item.id} item={item} {...getReworkRequestActions(item.id)} />)
        )}
      </div>

      <ConfirmDialog
        open={isConfirmOpen}
        onOpenChange={(open) => {
          if (!open) setDeleteTargetId(null);
        }}
        title={REWORK_REQUEST_FORM_LABELS.deleteConfirmTitle}
        description={REWORK_REQUEST_FORM_LABELS.deleteConfirm}
        confirmLabel={MY_PAGE_LIST_ROW_ACTIONS.delete}
        cancelLabel={REWORK_REQUEST_FORM_LABELS.cancel}
        isLoading={deleteMutation.isPending}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
};

export default ReworkRequestTable;
