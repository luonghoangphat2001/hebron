import { OrderQuoteDownload, OrderTransactionStatement } from '@/assets/svgs';
import { Button } from '@/components/ui/button';
import { useDownloadQuotationPdfMutation, useDownloadTransactionPdfMutation } from '@/data/orders/mypage-orders.query';
import { cn } from '@/lib/utils';
import { downloadBlob } from '@/utils/helper/file.helper';
import dayjs from 'dayjs';

const ORDER_DETAIL_ACTION_LABELS = {
  quoteDownload: '견적서',
  transactionStatement: '거래명세서',
} as const;

type OrderDetailActionButtonsProps = {
  orderNumber: string;
  className?: string;
  buttonClassName?: string;
  size?: 'xs' | 'default';
};

const OrderDetailActionButtons = ({ orderNumber, className, buttonClassName, size = 'xs' }: OrderDetailActionButtonsProps) => {
  const { mutateAsync: downloadQuotationPdf, isPending: isDownloadingQuotation } = useDownloadQuotationPdfMutation();
  const { mutateAsync: downloadTransactionPdf, isPending: isDownloadingTransaction } = useDownloadTransactionPdfMutation();

  const handleDownloadQuotation = async () => {
    try {
      const pdf = await downloadQuotationPdf(orderNumber);
      downloadBlob(pdf, `견적서_${orderNumber}_${dayjs().format('YYYY.MM.DD')}.pdf`);
    } catch (error) {
      console.error('[My page order detail] Cannot download quotation PDF:', error);
    }
  };

  const handleDownloadTransaction = async () => {
    try {
      const pdf = await downloadTransactionPdf(orderNumber);
      downloadBlob(pdf, `거래명세서_${orderNumber}_${dayjs().format('YYYY.MM.DD')}.pdf`);
    } catch (error) {
      console.error('[My page order detail] Cannot download transaction statement PDF:', error);
    }
  };

  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      <Button
        variant='outline'
        size={size}
        className={cn('gap-2', buttonClassName)}
        loading={isDownloadingQuotation}
        disabled={isDownloadingQuotation}
        onClick={() => void handleDownloadQuotation()}>
        <img src={OrderQuoteDownload} alt='' aria-hidden className='size-4 shrink-0' />
        {ORDER_DETAIL_ACTION_LABELS.quoteDownload}
      </Button>
      <Button
        variant='outline'
        size={size}
        className={cn('gap-2', buttonClassName)}
        loading={isDownloadingTransaction}
        disabled={isDownloadingTransaction}
        onClick={() => void handleDownloadTransaction()}>
        <img src={OrderTransactionStatement} alt='' aria-hidden className='size-4 shrink-0' />
        {ORDER_DETAIL_ACTION_LABELS.transactionStatement}
      </Button>
    </div>
  );
};

export default OrderDetailActionButtons;
