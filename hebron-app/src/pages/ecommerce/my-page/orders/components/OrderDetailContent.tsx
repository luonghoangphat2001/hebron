import TossPaymentInfo from '@/components/TossPaymentInfo';
import DesignCompositePreview from '@/components/design/DesignCompositePreview';
import { Typography } from '@/components/typography/Typography';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useBankAccountQuery } from '@/data/bank-account/bank-account.query';
import { mapDesignGroupToProductDesign } from '@/data/design/product-design.service';
import { useMobileFooterDock } from '@/hooks/useMyPageFormMobileFooterDock';
import { cn } from '@/lib/utils';
import CartDesignPreviewDialog from '@/pages/ecommerce/cart/components/CartDesignPreviewDialog';
import MyPageFormMobileFooter from '@/pages/ecommerce/my-page/components/MyPageFormMobileFooter';
import OrderDetailActionButtons from '@/pages/ecommerce/my-page/orders/components/OrderDetailActionButtons';
import OrderDetailInfoGrid from '@/pages/ecommerce/my-page/orders/components/OrderDetailInfoGrid';
import OrderDetailSection from '@/pages/ecommerce/my-page/orders/components/OrderDetailSection';
import OrderDetailStatusStepper from '@/pages/ecommerce/my-page/orders/components/OrderDetailStatusStepper';
import { OrderPaymentMethod } from '@/utils/enums/order.enum';
import { formatPhone, formatPrice } from '@/utils/helper/common.helper';
import { downloadAttachment, formatFileSize } from '@/utils/helper/file.helper';
import type { ProductDesign } from '@/utils/helper/guest-cart.helper';
import type { OrderDetail } from '@/utils/types/my-page.type';
import { BankIcon, CardholderIcon, DownloadSimpleIcon, PackageIcon, TruckIcon, UserIcon } from '@phosphor-icons/react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

type OrderDetailContentProps = {
  order: OrderDetail;
  showAddressChange?: boolean;
  showOrderHeader?: boolean;
  bordered?: boolean;
};

const displayValue = (value?: string | null) => value?.trim() || '-';

const joinDisplayValues = (values: Array<string | null | undefined>) => values.map(displayValue).join(' / ');

const OrderDetailContent = ({
  order,
  showAddressChange = true,
  showOrderHeader = true,
  bordered = false,
}: OrderDetailContentProps) => {
  const { containerRef, isDocked } = useMobileFooterDock<HTMLDivElement>();
  const { t: tEnum } = useTranslation('enum');
  const { t: tCommon } = useTranslation('common');
  const [selectedDesignPreview, setSelectedDesignPreview] = useState<{
    design: ProductDesign;
    productName: string;
  } | null>(null);
  const totalProductQuantity = order.products.reduce((total, product) => total + product.quantity, 0);
  const isBankTransfer = order.payment.method === OrderPaymentMethod.TRANSFER;
  const { data: bankAccountData, isLoading: isBankAccountLoading } = useBankAccountQuery({ enabled: isBankTransfer });
  const bankAccount = bankAccountData?.data.bank_account;
  const bankAccountValue = (value?: string) => (isBankAccountLoading ? tCommon('title.loading') : displayValue(value));
  const paymentStatusBadgeClassName =
    order.payment.status === 'pending' ? 'bg-amber-400 text-amber-950' : 'bg-emerald-500 text-white';
  const paymentMethod = isBankTransfer ? (
    <div className='flex items-center gap-2'>
      <div className='flex size-8 items-center justify-center rounded-[6px] border border-neutral-200'>
        <BankIcon className='size-5 text-neutral-600' weight='duotone' />
      </div>
      <p className='text-sm font-bold'>{tCommon('title.bank_transfer')}</p>
    </div>
  ) : (
    <TossPaymentInfo />
  );
  const paymentInfoRows = [
    [{ label: '결제방법', value: paymentMethod }],
    ...(isBankTransfer
      ? [
          [
            { label: tCommon('title.bank_name'), value: bankAccountValue(bankAccount?.bank_name) },
            { label: tCommon('title.account_number'), value: bankAccountValue(bankAccount?.account_number) },
          ],
          [{ label: tCommon('title.account_holder'), value: bankAccountValue(bankAccount?.account_holder) }],
        ]
      : []),
    [
      {
        label: '결제 상태',
        value: (
          <div className='flex flex-wrap items-center gap-2'>
            <Badge size='md' className={`${paymentStatusBadgeClassName} font-medium`}>
              {tEnum(`payment_status.${order.payment.status}`, { defaultValue: order.payment.status })}
            </Badge>
            <span>이체 시간: {order.payment.paidAt}</span>
          </div>
        ),
      },
    ],
    [
      {
        label: '주문금액',
        value: (
          <>
            <span className='text-brand font-bold'>{formatPrice(order.payment.totalAmount)}</span>
            <span className='text-neutral-950'>
              {' '}
              (제품 금액 : {formatPrice(order.payment.productAmount)} / 부가세 : {formatPrice(order.payment.taxAmount)} / 운임료 :{' '}
              {formatPrice(order.payment.shippingAmount)})
            </span>
          </>
        ),
      },
    ],
  ];

  const mobileFooter = showOrderHeader ? (
    <MyPageFormMobileFooter isDocked={isDocked} className={cn(bordered && isDocked && 'rounded-b-lg', bordered && 'px-4')}>
      <OrderDetailActionButtons orderNumber={order.orderCode} className='w-full' buttonClassName='flex-1' />
    </MyPageFormMobileFooter>
  ) : null;

  const content = (
    <>
      {showOrderHeader ? (
        <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
          <Typography variant='display-xs' weight='bold' className='text-brand'>
            {order.orderCode}
          </Typography>
          <OrderDetailActionButtons orderNumber={order.orderCode} className='hidden md:flex' />
        </div>
      ) : null}

      <OrderDetailStatusStepper currentStepKey={order.currentProductionStepKey} />

      <OrderDetailSection title='주문 정보' icon={UserIcon}>
        <OrderDetailInfoGrid
          rows={[
            [{ label: '주문자', value: order.orderer.name }],
            [{ label: '연락처', value: formatPhone(order.orderer.phone) }],
            [{ label: '고객 담당자', value: order.customerManager.name }],
            [{ label: '담당 지정일', value: order.customerManager.assignedDate }],
          ]}
        />
      </OrderDetailSection>

      <OrderDetailSection
        title={
          <span className='flex items-center gap-2'>
            <span className='font-bold'>주문 상품</span>
            <span className='text-sm font-normal text-neutral-500'>{totalProductQuantity}건</span>
          </span>
        }
        icon={PackageIcon}>
        <ul className='flex flex-col gap-3'>
          {order.products.map((product) => {
            const productSnapshot = product.configuration?.product_snapshot;
            const selectedOptions = product.configuration?.selected_option_values ?? [];
            const designContent = product.order_design_content;
            // The order response already includes the design group metadata; no detail request is needed.
            const productDesign = product.design_group ? mapDesignGroupToProductDesign(product.design_group) : undefined;
            const specificationDescription = joinDisplayValues([
              productSnapshot?.specification?.size,
              productSnapshot?.specification?.materials,
              productSnapshot?.specification?.case,
            ]);
            const selectedOptionsDescription =
              selectedOptions
                .map(({ group, option }) => `${displayValue(group?.name)}: ${displayValue(option?.name)}`)
                .join(' / ') || '-';

            return (
              <li key={product.id} className='rounded-xl bg-neutral-50 p-4'>
                <div className='flex gap-4'>
                  <img src={product.thumbnail} alt={product.name} className='size-16 shrink-0 rounded-lg object-cover' />
                  <div className='flex min-w-0 flex-1 items-start justify-between gap-3'>
                    <div className='flex min-w-0 flex-col gap-1'>
                      <Typography weight='semibold' className='text-lg'>
                        {product.name}
                      </Typography>
                      <Typography variant='caption' className='text-sm text-neutral-500'>
                        {specificationDescription}
                      </Typography>
                      <Typography variant='caption' className='text-sm text-neutral-500'>
                        {selectedOptionsDescription}
                      </Typography>
                    </div>
                    <div className='flex shrink-0 flex-col items-end gap-1'>
                      <Typography variant='body-sm' className='text-neutral-500'>
                        {product.quantity}개
                      </Typography>
                      <Typography weight='bold' className='text-lg'>
                        {formatPrice(product.price)}
                      </Typography>
                    </div>
                  </div>
                </div>

                {productDesign && (productDesign.previewFront || productDesign.previewBack) ? (
                  <div className='mt-4 flex gap-2'>
                    {[
                      { side: 'front' as const, image: productDesign.previewFront, label: 'Front' },
                      { side: 'back' as const, image: productDesign.previewBack, label: 'Back' },
                    ]
                      .filter((preview): preview is { side: 'front' | 'back'; image: string; label: string } =>
                        Boolean(preview.image),
                      )
                      .map((preview) => (
                        <button
                          key={preview.side}
                          type='button'
                          className='size-16 cursor-pointer overflow-hidden rounded-md border border-neutral-200 bg-white'
                          onClick={() => setSelectedDesignPreview({ design: productDesign, productName: product.name })}
                          aria-label={`${product.name} ${preview.label} design preview`}>
                          <DesignCompositePreview
                            preview={preview.image}
                            design={productDesign.state}
                            side={preview.side}
                            alt={`${product.name} ${preview.label}`}
                            className='size-full'
                          />
                        </button>
                      ))}
                  </div>
                ) : null}

                {designContent ? (
                  <div className='mt-4 overflow-hidden rounded-lg border border-neutral-200 bg-white'>
                    <Typography
                      weight='semibold'
                      className='flex min-h-9 items-center border-b border-neutral-200 px-3 py-2 text-sm'>
                      {tCommon('title.text_content')}
                    </Typography>
                    <dl className='text-sm'>
                      {[
                        { label: tCommon('title.title'), value: designContent.title },
                        {
                          label: `${tCommon('title.recipient')}/${tCommon('title.organization_name')}`,
                          value: designContent.recipient_name,
                        },
                        { label: tCommon('title.date_2'), value: designContent.event_date },
                        { label: tCommon('title.greeting'), value: designContent.main_text, multiline: true },
                        {
                          label: `${tCommon('title.giver')} (${tCommon('title.organization_name')})`,
                          value: designContent.sender_name,
                        },
                      ].map((item) => (
                        <div key={item.label} className='grid grid-cols-[7.5rem_minmax(0,1fr)] border-b border-neutral-200'>
                          <dt className='flex min-h-9 items-center bg-neutral-50 px-3 py-2 text-neutral-500'>{item.label}</dt>
                          <dd
                            className={cn(
                              'flex min-h-9 min-w-0 px-3 py-2 break-words whitespace-pre-line text-neutral-950',
                              item.multiline ? 'items-start' : 'items-center',
                            )}>
                            {displayValue(item.value)}
                          </dd>
                        </div>
                      ))}
                      <div className='grid grid-cols-[minmax(0,7.5rem)_1fr]'>
                        <dt className='flex min-h-9 items-center bg-neutral-50 px-3 py-2 text-neutral-500'>
                          {tCommon('title.attachment')}
                        </dt>
                        <dd className='flex min-h-9 min-w-0 items-center px-3 py-2'>
                          {designContent.attachment_file_urls.length > 0 ? (
                            <ul className='flex flex-col gap-2'>
                              {designContent.attachment_file_urls.map((file, index) => (
                                <li key={`${file.file_path}-${index}`} className='flex min-w-0 items-center gap-1'>
                                  <Button
                                    type='button'
                                    variant='ghost'
                                    onClick={() => void downloadAttachment(file)}
                                    className='text-blue-brand h-auto min-w-0 justify-start rounded-none border-0 bg-transparent p-0 text-sm font-normal hover:bg-transparent hover:underline'>
                                    <span className='truncate'>{displayValue(file.file_name)}</span>
                                    {file.file_size > 0 ? ` (${formatFileSize(file.file_size)})` : ''}
                                  </Button>
                                  <Button
                                    type='button'
                                    variant='ghost'
                                    size='icon'
                                    onClick={() => void downloadAttachment(file)}
                                    className='size-5 shrink-0 rounded-none border-0 bg-transparent p-0 text-neutral-500 hover:bg-transparent hover:text-neutral-950'
                                    aria-label={`${displayValue(file.file_name)} ${tCommon('button.download')}`}>
                                    <DownloadSimpleIcon className='size-4' aria-hidden />
                                  </Button>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <span className='text-neutral-950'>-</span>
                          )}
                        </dd>
                      </div>
                    </dl>
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
        <CartDesignPreviewDialog
          open={Boolean(selectedDesignPreview)}
          image={selectedDesignPreview?.design.previewFront}
          backImage={selectedDesignPreview?.design.previewBack}
          design={selectedDesignPreview?.design.state}
          productName={selectedDesignPreview?.productName}
          onOpenChange={(open) => !open && setSelectedDesignPreview(null)}
        />
      </OrderDetailSection>

      <OrderDetailSection title='배송정보' icon={TruckIcon}>
        <OrderDetailInfoGrid
          rows={[
            [
              { label: '받으실 분', value: order.shipping.recipientName },
              { label: '연락처', value: formatPhone(order.shipping.recipientPhone) },
            ],
            [
              {
                label: '주소',
                value: (
                  <span>
                    [{order.shipping.zipCode}] {order.shipping.address}
                  </span>
                ),
              },
            ],
            // [
            //   { label: '배송방법', value: order.shipping.method },
            //   { label: '배송담당', value: order.shipping.carrier },
            // ],
            [
              { label: '배송비', value: order.shipping.feeLabel },
              { label: '출고일', value: order.shipping.shippedDate },
              { label: '발송예정일', value: order.shipping.estimatedShippingDate ?? '-' },
            ],
            [
              {
                label: '송장번호',
                value: <span>{order.shipping.trackingNumber}</span>,
              },
            ],
          ]}
        />
      </OrderDetailSection>

      <OrderDetailSection title='결제정보' icon={CardholderIcon}>
        <OrderDetailInfoGrid rows={paymentInfoRows} />
      </OrderDetailSection>
    </>
  );

  return (
    <div
      ref={showOrderHeader ? containerRef : undefined}
      className={cn(
        'flex w-full min-w-0 flex-col',
        bordered && 'overflow-hidden rounded-lg border border-neutral-200',
        showOrderHeader && 'relative pb-20 md:pb-0',
      )}>
      <div className={cn('flex flex-col gap-6 sm:gap-8', bordered ? 'p-4 md:p-6' : undefined)}>{content}</div>
      {mobileFooter}
    </div>
  );
};

export default OrderDetailContent;
