import AppTable from '@/components/table/AppTable';
import { Typography } from '@/components/typography/Typography';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useDownloadQuotationPdfMutation } from '@/data/orders/mypage-orders.query';
import { cn } from '@/lib/utils';
import MyPageListRowActions from '@/pages/ecommerce/my-page/components/MyPageListRowActions';
import { ORDER_TABLE_LABELS } from '@/utils/constants/orders.constant';
import { getMyPageOrderDetailPath } from '@/utils/constants/route.constant';
import { formatPrice } from '@/utils/helper/common.helper';
import { downloadBlob } from '@/utils/helper/file.helper';
import type { RecentOrder } from '@/utils/types/my-page.type';
import type { OrderStatusHighlightMode } from '@/utils/types/orders.type';
import dayjs from 'dayjs';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

type OrdersTableProps = {
  orders: RecentOrder[];
  emptyMessage?: string;
  className?: string;
  statusHighlightMode?: OrderStatusHighlightMode;
  footer?: ReactNode;
};

const formatOrderDate = (dateTime?: string) => {
  if (!dateTime) return '';

  const [datePart] = dateTime.split(' ');
  return datePart.replace(/-/g, '.');
};

const isHighlightedOrderStatus = (status: string, mode: OrderStatusHighlightMode) => {
  if (mode === 'payment-only') return status === '결제대기';
  return status === '결제대기' || status === '교정대기' || status === '시안확인요청' || status === '시안 수정요청';
};

const getSelectedOptionsDescription = (order: RecentOrder) =>
  order.selectedOptionValues?.map(({ group, option }) => `${group.name}: ${option.name}`).join(' / ') || '-';

const getProductInformationDescription = (order: RecentOrder, labels: Record<string, string>) =>
  [
    [labels.size, order.productSpecification?.size],
    [labels.material, order.productSpecification?.materials],
    [labels.case, order.productSpecification?.case],
  ]
    .filter(([, value]) => Boolean(value))
    .map(([label, value]) => `${label}: ${value}`)
    .join(' / ');

export const OrderStatusBadge = ({ status, highlighted = false }: { status: string; highlighted?: boolean }) => (
  <Badge
    variant={highlighted ? 'default' : 'white'}
    size='md'
    className={cn('font-medium', highlighted ? 'bg-blue-brand-700 text-white' : 'text-neutral-700')}>
    {status}
  </Badge>
);

type OrderRowProps = {
  order: RecentOrder;
  statusHighlightMode: OrderStatusHighlightMode;
  onViewDetails: () => void;
  onUpdate?: () => void;
  onPrintOrder: () => void;
  isPrinting: boolean;
  isPrintDisabled: boolean;
};

const OrderTableRow = ({
  order,
  statusHighlightMode,
  onViewDetails,
  onUpdate,
  onPrintOrder,
  isPrinting,
  isPrintDisabled,
}: OrderRowProps) => {
  const { t: tCommon } = useTranslation('common');
  const highlighted = isHighlightedOrderStatus(order.status, statusHighlightMode);
  const productInformationDescription = getProductInformationDescription(order, {
    size: tCommon('title.size'),
    material: tCommon('title.material'),
    case: tCommon('title.case'),
  });

  return (
    <TableRow className='border-neutral-100 hover:bg-transparent'>
      <TableCell className='typo-table-cell whitespace-normal'>
        <div className='flex flex-col gap-2'>
          <Typography className='text-md'>{order.orderDateTime}</Typography>
          <Button
            variant='outline'
            size='xs'
            className='w-fit px-8.5'
            loading={isPrinting}
            disabled={isPrintDisabled}
            onClick={onPrintOrder}>
            {ORDER_TABLE_LABELS.printOrder}
          </Button>
        </div>
      </TableCell>
      <TableCell className='whitespace-normal'>
        <div className='flex gap-3'>
          <img
            src={order.thumbnail}
            alt={order.productName}
            className='size-14 shrink-0 rounded-lg border border-neutral-100 object-cover'
          />
          <div className='flex min-w-0 flex-col gap-1'>
            <div className='flex min-w-0 flex-wrap items-center gap-2'>
              <Typography weight='semibold' className='text-md'>
                {order.productName}
              </Typography>
              <div className='size-1 shrink-0 rounded bg-neutral-200' />
              <Typography className='text-md text-brand font-medium'>{order.productCode}</Typography>
            </div>
            {productInformationDescription && (
              <Typography variant='caption' className='text-sm'>
                {productInformationDescription}
              </Typography>
            )}
            {/* <Typography variant='caption' className='text-sm'>
              {selectedOptionsDescription}
            </Typography> */}
          </div>
        </div>
      </TableCell>
      <TableCell className='typo-table-cell text-center whitespace-normal'>{order.quantity}</TableCell>
      <TableCell className='typo-table-cell text-center font-semibold whitespace-normal'>{formatPrice(order.amount)}</TableCell>
      <TableCell className='text-center whitespace-normal'>
        <OrderStatusBadge status={order.status} highlighted={highlighted} />
      </TableCell>
      <TableCell className='whitespace-normal'>
        <div className='flex justify-end'>
          <MyPageListRowActions onViewDetails={onViewDetails} onUpdate={onUpdate} />
        </div>
      </TableCell>
    </TableRow>
  );
};

const OrderMobileCard = ({
  order,
  statusHighlightMode,
  onViewDetails,
  onUpdate,
  onPrintOrder,
  isPrinting,
  isPrintDisabled,
}: OrderRowProps) => {
  const { t: tCommon } = useTranslation('common');
  const highlighted = isHighlightedOrderStatus(order.status, statusHighlightMode);
  const selectedOptionsDescription = getSelectedOptionsDescription(order);
  const productInformationDescription = getProductInformationDescription(order, {
    size: tCommon('title.size'),
    material: tCommon('title.material'),
    case: tCommon('title.case'),
    stockQuantity: tCommon('title.stock_quantity'),
    shippingInformation: tCommon('title.shipping_information'),
    countSuffix: '개',
  });

  return (
    <article className='flex flex-col overflow-hidden rounded-lg border border-neutral-200 bg-white'>
      <div className='flex items-center gap-2 border-b border-neutral-100 px-4 py-3'>
        <Typography className='text-md text-brand min-w-0 flex-1 truncate font-medium'>{order.productCode}</Typography>
        <OrderStatusBadge status={order.status} highlighted={highlighted} />
        <MyPageListRowActions onViewDetails={onViewDetails} onUpdate={onUpdate} />
      </div>

      <div className='flex gap-3 px-4 py-3'>
        <div className='flex min-w-0 flex-1 flex-col gap-1'>
          <Typography weight='semibold' className='text-md'>
            {order.productName}
          </Typography>
          {productInformationDescription && (
            <Typography variant='caption' className='line-clamp-3 text-sm text-neutral-500'>
              {productInformationDescription}
            </Typography>
          )}
          <Typography variant='caption' className='line-clamp-3 text-sm text-neutral-500'>
            {selectedOptionsDescription}
          </Typography>
          <Typography className='text-md'>{formatPrice(order.amount)}</Typography>
        </div>
        <div className='flex shrink-0 flex-col items-end gap-2'>
          <img
            src={order.thumbnail}
            alt={order.productName}
            className='size-16 rounded-lg border border-neutral-100 object-cover'
          />
          <Typography variant='caption' className='text-sm text-neutral-500'>
            {formatOrderDate(order.orderDateTime)}
          </Typography>
        </div>
      </div>

      <div className='px-4 pb-4'>
        <Button
          variant='outline'
          size='xs'
          className='h-10 w-full'
          loading={isPrinting}
          disabled={isPrintDisabled}
          onClick={onPrintOrder}>
          {ORDER_TABLE_LABELS.printOrder}
        </Button>
      </div>
    </article>
  );
};

const OrdersTable = ({
  orders,
  emptyMessage = ORDER_TABLE_LABELS.empty,
  className,
  statusHighlightMode = 'payment-and-correction',
  footer,
}: OrdersTableProps) => {
  const navigate = useNavigate();
  const {
    mutateAsync: downloadQuotationPdf,
    isPending: isDownloadingQuotation,
    variables: downloadingOrderNumber,
  } = useDownloadQuotationPdfMutation();

  const handlePrintOrder = async (orderNumber: string) => {
    try {
      const pdf = await downloadQuotationPdf(orderNumber);
      downloadBlob(pdf, `주문_${orderNumber}_${dayjs().format('YYYY.MM.DD')}.pdf`);
    } catch (error) {
      console.error('[My page orders] Cannot download quotation PDF:', error);
    }
  };

  const getOrderActions = (orderId: string) => ({
    onViewDetails: () => navigate(getMyPageOrderDetailPath(orderId)),
    onPrintOrder: () => void handlePrintOrder(orderId),
    isPrinting: isDownloadingQuotation && downloadingOrderNumber === orderId,
    isPrintDisabled: isDownloadingQuotation,
    // Orders list has no edit flow, keep only detail action.
    onUpdate: undefined,
  });

  return (
    <div className={cn('flex flex-col', className)}>
      <div className='hidden md:block'>
        <AppTable footer={footer} tableClassName='min-w-[960px]'>
          <TableHeader>
            <TableRow className='border-neutral-200 bg-neutral-100 hover:bg-neutral-100'>
              <TableHead className='typo-table-head w-42'>{ORDER_TABLE_LABELS.orderDate}</TableHead>
              <TableHead className='typo-table-head'>{ORDER_TABLE_LABELS.product}</TableHead>
              <TableHead className='typo-table-head w-24 text-center'>{ORDER_TABLE_LABELS.quantity}</TableHead>
              <TableHead className='typo-table-head w-26 text-center'>{ORDER_TABLE_LABELS.amount}</TableHead>
              <TableHead className='typo-table-head w-28 text-center'>{ORDER_TABLE_LABELS.action}</TableHead>
              <TableHead className='typo-table-head w-12' aria-hidden />
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.length === 0 ? (
              <TableRow className='hover:bg-transparent'>
                <TableCell colSpan={6} className='typo-body-secondary py-10 text-center'>
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              orders.map((order) => (
                <OrderTableRow
                  key={order.id}
                  order={order}
                  statusHighlightMode={statusHighlightMode}
                  {...getOrderActions(order.id)}
                />
              ))
            )}
          </TableBody>
        </AppTable>
      </div>

      <div className='flex flex-col gap-3 md:hidden'>
        {orders.length === 0 ? (
          <Typography variant='body-sm' className='py-8 text-center text-neutral-500'>
            {emptyMessage}
          </Typography>
        ) : (
          orders.map((order) => (
            <OrderMobileCard
              key={order.id}
              order={order}
              statusHighlightMode={statusHighlightMode}
              {...getOrderActions(order.id)}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default OrdersTable;
