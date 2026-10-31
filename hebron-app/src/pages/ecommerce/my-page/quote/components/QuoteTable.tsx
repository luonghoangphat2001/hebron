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
import { QUOTE_FORM_LABELS } from '@/utils/constants/quote-form.constant';
import { getInquiryCategoryLabel, getInquiryStatusLabel, QUOTE_TABLE_LABELS } from '@/utils/constants/quote.constant';
import { MY_PAGE_LIST_ROW_ACTIONS } from '@/utils/constants/my-page.constant';
import { getMyPageQuoteDetailPath, getMyPageQuoteEditPath } from '@/utils/constants/route.constant';
import { InquiryStatus } from '@/utils/enums/inquiry.enum';
import { formatDate, splitPhonePattern } from '@/utils/helper/common.helper';
import type { ReactNode } from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

type QuoteTableProps = {
  quotes: InquiryItemRESP[];
  emptyMessage?: string;
  className?: string;
  footer?: ReactNode;
};

type QuoteRowProps = {
  quote: InquiryItemRESP;
  onViewDetails: () => void;
  onUpdate: () => void;
  onDelete: () => void;
};

const QuoteStatusBadge = ({ status, statusLabel }: { status: string; statusLabel: string }) => {
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

const QuoteMobileInfoRow = ({ label, children }: { label: string; children: ReactNode }) => (
  <div className='flex items-center justify-between gap-4'>
    <Typography className='shrink-0 text-sm text-neutral-500'>{label}</Typography>
    <div className='min-w-0 text-right'>{children}</div>
  </div>
);

const formatContact = (contact: string) => splitPhonePattern(contact)?.formatted ?? contact;

const QuoteTableRow = ({ quote, onViewDetails, onUpdate, onDelete }: QuoteRowProps) => (
  <TableRow className='border-neutral-100 hover:bg-transparent'>
    <TableCell className='typo-table-cell whitespace-normal'>{formatDate(quote.created_at)}</TableCell>
    <TableCell className='typo-table-cell whitespace-normal'>
      {getInquiryCategoryLabel(quote.category, quote.category_label)}
    </TableCell>
    <TableCell className='whitespace-normal'>
      <div className='flex min-w-0 items-start gap-2'>
        {quote.is_new && <span className='bg-brand mt-2 size-1.5 shrink-0 rounded-full' aria-hidden />}
        <Typography className='typo-body min-w-0'>{quote.title}</Typography>
      </div>
    </TableCell>
    <TableCell className='typo-table-cell whitespace-normal'>{quote.author_name}</TableCell>
    <TableCell className='typo-table-cell whitespace-normal'>{formatContact(quote.contact)}</TableCell>
    <TableCell className='whitespace-normal'>
      <div className='flex justify-end'>
        <QuoteStatusBadge status={quote.status} statusLabel={getInquiryStatusLabel(quote.status, quote.status_label)} />
      </div>
    </TableCell>
    <TableCell className='whitespace-normal'>
      <div className='flex justify-end'>
        <MyPageListRowActions onViewDetails={onViewDetails} onUpdate={onUpdate} onDelete={onDelete} />
      </div>
    </TableCell>
  </TableRow>
);

const QuoteMobileCard = ({ quote, onViewDetails, onUpdate, onDelete }: QuoteRowProps) => (
  <article className='flex flex-col gap-3 overflow-hidden rounded-lg border border-neutral-200 bg-white px-4 py-3'>
    <div className='flex items-start gap-2'>
      <div className='flex min-w-0 flex-1 flex-col gap-2'>
        <Typography className='text-sm text-neutral-500'>{formatDate(quote.created_at)}</Typography>

        <div className='flex min-w-0 items-start gap-2'>
          {quote.is_new && <span className='bg-brand mt-2 size-1.5 shrink-0 rounded-full' aria-hidden />}
          <Typography weight='bold' className='text-md min-w-0 text-neutral-950'>
            [{getInquiryCategoryLabel(quote.category, quote.category_label)}] {quote.title}
          </Typography>
        </div>
      </div>
      <MyPageListRowActions onViewDetails={onViewDetails} onUpdate={onUpdate} onDelete={onDelete} />
    </div>

    <div className='flex flex-col gap-2 border-t border-neutral-100 pt-3'>
      <QuoteMobileInfoRow label={QUOTE_TABLE_LABELS.managerName}>
        <Typography className='text-sm text-neutral-950'>
          {quote.author_name} · {formatContact(quote.contact)}
        </Typography>
      </QuoteMobileInfoRow>

      <QuoteMobileInfoRow label={QUOTE_TABLE_LABELS.status}>
        <QuoteStatusBadge status={quote.status} statusLabel={getInquiryStatusLabel(quote.status, quote.status_label)} />
      </QuoteMobileInfoRow>
    </div>
  </article>
);

const QuoteTable = ({ quotes, emptyMessage = QUOTE_TABLE_LABELS.empty, className, footer }: QuoteTableProps) => {
  const navigate = useNavigate();
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
  const deleteMutation = useDeleteInquiryMutation();
  const isConfirmOpen = deleteTargetId != null;

  const getQuoteActions = (quoteId: number | string) => ({
    onViewDetails: () => navigate(getMyPageQuoteDetailPath(String(quoteId))),
    onUpdate: () => navigate(getMyPageQuoteEditPath(String(quoteId))),
    onDelete: () => setDeleteTargetId(Number(quoteId)),
  });

  const handleConfirmDelete = () => {
    if (deleteTargetId == null) return;

    deleteMutation.mutate(deleteTargetId, {
      onSuccess: (response) => {
        setDeleteTargetId(null);
        appToast.success(response.message || QUOTE_FORM_LABELS.deleteSuccess);
      },
      onError: (error) => {
        appToast.error(error.response?.data.message || QUOTE_FORM_LABELS.deleteFailed);
      },
    });
  };

  return (
    <div className={cn('flex flex-col', className)}>
      <div className='hidden md:block'>
        <AppTable footer={footer}>
          <TableHeader>
            <TableRow className='border-neutral-200 bg-neutral-100 hover:bg-neutral-100'>
              <TableHead className='typo-table-head w-32'>{QUOTE_TABLE_LABELS.createdAt}</TableHead>
              <TableHead className='typo-table-head w-24'>{QUOTE_TABLE_LABELS.category}</TableHead>
              <TableHead className='typo-table-head'>{QUOTE_TABLE_LABELS.title}</TableHead>
              <TableHead className='typo-table-head w-28'>{QUOTE_TABLE_LABELS.managerName}</TableHead>
              <TableHead className='typo-table-head w-36'>{QUOTE_TABLE_LABELS.phone}</TableHead>
              <TableHead className='typo-table-head w-28 text-right'>{QUOTE_TABLE_LABELS.status}</TableHead>
              <TableHead className='typo-table-head w-12' aria-hidden />
            </TableRow>
          </TableHeader>
          <TableBody>
            {quotes.length === 0 ? (
              <TableRow className='hover:bg-transparent'>
                <TableCell colSpan={7} className='typo-body-secondary py-10 text-center'>
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              quotes.map((quote) => <QuoteTableRow key={quote.id} quote={quote} {...getQuoteActions(quote.id)} />)
            )}
          </TableBody>
        </AppTable>
      </div>

      <div className='flex flex-col gap-3 md:hidden'>
        {quotes.length === 0 ? (
          <Typography variant='body-sm' className='py-8 text-center text-neutral-500'>
            {emptyMessage}
          </Typography>
        ) : (
          quotes.map((quote) => <QuoteMobileCard key={quote.id} quote={quote} {...getQuoteActions(quote.id)} />)
        )}
      </div>

      <ConfirmDialog
        open={isConfirmOpen}
        onOpenChange={(open) => {
          if (!open) setDeleteTargetId(null);
        }}
        title={QUOTE_FORM_LABELS.deleteConfirmTitle}
        description={QUOTE_FORM_LABELS.deleteConfirm}
        confirmLabel={MY_PAGE_LIST_ROW_ACTIONS.delete}
        cancelLabel={QUOTE_FORM_LABELS.cancel}
        isLoading={deleteMutation.isPending}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
};

export default QuoteTable;
