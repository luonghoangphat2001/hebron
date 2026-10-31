import { Typography } from '@/components/typography/Typography';
import { Badge } from '@/components/ui/badge';
import { useInquiryDetailQuery } from '@/data/inquiries/inquiries.query';
import { cn } from '@/lib/utils';
import MyPageDetailBackLink from '@/pages/ecommerce/my-page/components/MyPageDetailBackLink';
import MyPageInquiryReplies from '@/pages/ecommerce/my-page/components/MyPageInquiryReplies';
import { getQuoteById, QUOTE_TABLE_LABELS } from '@/utils/constants/quote.constant';
import { getMyPageQuotePath } from '@/utils/constants/route.constant';
import { QuoteStatus } from '@/utils/enums/quote.enum';
import type { ReactNode } from 'react';
import { Navigate, useParams } from 'react-router-dom';

const QuoteDetailRow = ({ label, children }: { label: string; children: ReactNode }) => (
  <div className='flex flex-col gap-1 border-b border-neutral-100 py-4 md:flex-row md:gap-4'>
    <Typography className='text-sm text-neutral-500 md:w-24 md:shrink-0'>{label}</Typography>
    <div className='min-w-0 flex-1 text-sm text-neutral-950'>{children}</div>
  </div>
);

const MyPageQuoteDetail = () => {
  const { quoteId = '' } = useParams();
  const quote = getQuoteById(quoteId);

  const { data: detailData } = useInquiryDetailQuery(quoteId, {
    enabled: Boolean(quoteId),
  });

  if (!quote) {
    return <Navigate to={getMyPageQuotePath()} replace />;
  }

  const isAnswered = quote.status === QuoteStatus.ANSWERED;
  const inquiry = detailData?.data.inquiry;

  return (
    <div className='flex w-full min-w-0 flex-col gap-6'>
      <MyPageDetailBackLink to={getMyPageQuotePath()} label={QUOTE_TABLE_LABELS.pageTitle} />

      <div className='flex flex-col rounded-lg border border-neutral-200 bg-white px-4 md:px-6'>
        <QuoteDetailRow label={QUOTE_TABLE_LABELS.createdAt}>{quote.createdAt}</QuoteDetailRow>
        <QuoteDetailRow label={QUOTE_TABLE_LABELS.category}>{quote.category}</QuoteDetailRow>
        <QuoteDetailRow label={QUOTE_TABLE_LABELS.title}>{quote.title}</QuoteDetailRow>
        <QuoteDetailRow label={QUOTE_TABLE_LABELS.managerName}>{quote.managerName}</QuoteDetailRow>
        <QuoteDetailRow label={QUOTE_TABLE_LABELS.phone}>{quote.phone}</QuoteDetailRow>
        <QuoteDetailRow label={QUOTE_TABLE_LABELS.status}>
          <Badge
            variant={isAnswered ? 'default' : 'white'}
            size='md'
            className={cn('font-medium', isAnswered ? 'bg-blue-brand-700 text-white' : 'text-neutral-700')}>
            {quote.status}
          </Badge>
        </QuoteDetailRow>
      </div>

      <MyPageInquiryReplies comments={inquiry?.comments ?? []} inquiryStatus={inquiry?.status ?? quote.status} />
    </div>
  );
};

export default MyPageQuoteDetail;
